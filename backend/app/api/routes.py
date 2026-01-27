"""API routes for the interview coding assistant."""

import asyncio
import hashlib
import subprocess
import sys
import tempfile
import time
import uuid
from datetime import datetime, timezone
from functools import lru_cache
from typing import Union

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    OCRRequest,
    OCRResponse,
    OptimizeRequest,
    ExplainSimpleRequest,
    ExplainSimpleResponse,
    ErrorResponse,
    ErrorDetails,
    HealthResponse,
    ResponseMetadata,
    ExecutionMode,
    ExecuteRequest,
    ExecuteResponse,
)
from app.services.claude_service import claude_service
from app.services.openai_service import openai_service

settings = get_settings()
router = APIRouter(prefix="/api/v1")
limiter = Limiter(key_func=get_remote_address)

# Simple in-memory cache
_cache: dict[str, tuple[AnalyzeResponse, float]] = {}
CACHE_MAX_SIZE = 1000


def _get_cache_key(problem_text: str, mode: str) -> str:
    """Generate cache key from problem text and mode."""
    content = f"{problem_text}|{mode}"
    return hashlib.sha256(content.encode()).hexdigest()


def _get_from_cache(key: str) -> AnalyzeResponse | None:
    """Get response from cache if valid."""
    if key in _cache:
        response, timestamp = _cache[key]
        if time.time() - timestamp < settings.cache_ttl_seconds:
            return response
        else:
            del _cache[key]
    return None


def _set_cache(key: str, response: AnalyzeResponse) -> None:
    """Set response in cache."""
    # Evict oldest entries if cache is full
    if len(_cache) >= CACHE_MAX_SIZE:
        oldest_key = min(_cache.keys(), key=lambda k: _cache[k][1])
        del _cache[oldest_key]
    _cache[key] = (response, time.time())


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")


@router.post(
    "/analyze",
    response_model=Union[AnalyzeResponse, ErrorResponse],
    responses={
        200: {"model": AnalyzeResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def analyze_problem(request: Request, body: AnalyzeRequest):
    """
    Analyze a coding problem and generate a solution with explanations.

    Modes:
    - fast: Claude only (default)
    - verified: Claude + OpenAI verification
    - comprehensive: Claude → OpenAI review → Claude refine
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Check cache
    cache_key = _get_cache_key(body.problem_text, body.mode.value)
    cached_response = _get_from_cache(cache_key)
    if cached_response:
        cached_response.metadata.request_id = request_id
        cached_response.metadata.cached = True
        return cached_response

    try:
        # Generate solution with Claude
        solution_data = await claude_service.analyze_problem(
            problem_text=body.problem_text,
            sample_input=body.sample_input,
            sample_output=body.sample_output,
            difficulty=body.difficulty.value if body.difficulty else None,
        )

        verification_status = None
        verification_model = None
        warnings = []

        # Run verification if requested
        if body.mode in [ExecutionMode.VERIFIED, ExecutionMode.COMPREHENSIVE]:
            try:
                verification = await openai_service.verify_solution(
                    problem_text=body.problem_text,
                    code=solution_data.code,
                    sample_input=body.sample_input,
                    sample_output=body.sample_output,
                )
                verification_status = verification.status
                verification_model = settings.openai_model

                if verification.issues:
                    for issue in verification.issues:
                        if issue.get("severity") == "error":
                            warnings.append(f"Verification issue: {issue.get('description')}")

                # For comprehensive mode, refine if issues found
                if body.mode == ExecutionMode.COMPREHENSIVE and verification.issues:
                    # Re-analyze with feedback
                    solution_data = await claude_service.analyze_problem(
                        problem_text=body.problem_text + f"\n\nNote: Address these issues: {verification.issues}",
                        sample_input=body.sample_input,
                        sample_output=body.sample_output,
                        difficulty=body.difficulty.value if body.difficulty else None,
                    )

            except Exception as e:
                warnings.append(f"Verification skipped: {str(e)}")
                verification_status = "skipped"

        latency_ms = int((time.time() - start_time) * 1000)

        # Estimate cost
        cost_estimate = 0.02  # Base cost for Claude
        if body.mode == ExecutionMode.VERIFIED:
            cost_estimate = 0.04
        elif body.mode == ExecutionMode.COMPREHENSIVE:
            cost_estimate = 0.08

        response = AnalyzeResponse(
            success=True,
            data=solution_data,
            metadata=ResponseMetadata(
                request_id=request_id,
                mode=body.mode.value,
                primary_model=settings.claude_model,
                verification_model=verification_model,
                verification_status=verification_status,
                generated_at=datetime.now(timezone.utc),
                latency_ms=latency_ms,
                cached=False,
                cost_estimate_usd=cost_estimate,
            ),
            warnings=warnings,
        )

        # Cache the response
        _set_cache(cache_key, response)

        return response

    except ValueError as e:
        return ErrorResponse(
            success=False,
            error=ErrorDetails(
                code="INVALID_RESPONSE",
                message="Failed to parse AI response",
                details={"error": str(e)},
            ),
            metadata=ResponseMetadata(
                request_id=request_id,
                mode=body.mode.value,
                primary_model=settings.claude_model,
                generated_at=datetime.now(timezone.utc),
                latency_ms=int((time.time() - start_time) * 1000),
            ),
        )
    except Exception as e:
        import traceback
        print(f"[ANALYZE ERROR] {type(e).__name__}: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.post("/explain-code")
async def explain_code(request: Request, body: dict):
    """Generate thought process and line-by-line explanation for code."""
    try:
        result = await claude_service.explain_code(
            problem_text=body.get("problem_text", ""),
            code=body.get("code", ""),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-stream")
async def analyze_problem_stream(request: Request, body: AnalyzeRequest):
    """Stream the analysis response in real-time using Server-Sent Events."""

    async def generate():
        try:
            buffer = ""
            full_code = ""
            async for chunk in claude_service.analyze_problem_stream(
                problem_text=body.problem_text,
                sample_input=body.sample_input,
                sample_output=body.sample_output,
                difficulty=body.difficulty.value if body.difficulty else None,
            ):
                buffer += chunk
                full_code += chunk
                # Send in larger chunks for smoother output
                if len(buffer) >= 10 or '\n' in buffer:
                    # Use unique marker for real newlines (not string literals)
                    # First protect escaped newlines in string literals
                    escaped = buffer.replace('\\n', '<<SLASHN>>')
                    # Then escape real newlines
                    escaped = escaped.replace('\n', '<<NEWLINE>>')
                    yield f"data: {escaped}\n\n"
                    buffer = ""
            # Send remaining buffer
            if buffer:
                escaped = buffer.replace('\\n', '<<SLASHN>>')
                escaped = escaped.replace('\n', '<<NEWLINE>>')
                yield f"data: {escaped}\n\n"
            # Signal completion
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/ocr",
    response_model=OCRResponse,
    responses={
        200: {"model": OCRResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit("5/minute")
async def extract_text_from_image(request: Request, body: OCRRequest):
    """Extract text from an uploaded image using Claude Vision."""

    # Validate image size (base64 is ~33% larger than binary)
    max_base64_size = settings.max_image_size_mb * 1024 * 1024 * 1.33
    if len(body.image_base64) > max_base64_size:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.max_image_size_mb}MB",
        )

    try:
        extracted_text, confidence = await claude_service.extract_text_from_image(
            image_base64=body.image_base64,
            image_type=body.image_type,
        )

        warnings = []
        if confidence < 0.85:
            warnings.append(
                "OCR confidence is low. Please review the extracted text and make corrections if needed."
            )

        return OCRResponse(
            extracted_text=extracted_text,
            confidence=confidence,
            warnings=warnings,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/analyze-image",
    response_model=Union[AnalyzeResponse, ErrorResponse],
    responses={
        200: {"model": AnalyzeResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def analyze_image(request: Request, body: OCRRequest):
    """Analyze a coding problem from an image and generate solution in ONE call (fast)."""

    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Validate image size
    max_base64_size = settings.max_image_size_mb * 1024 * 1024 * 1.33
    if len(body.image_base64) > max_base64_size:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.max_image_size_mb}MB",
        )

    try:
        solution_data = await claude_service.analyze_image(
            image_base64=body.image_base64,
            image_type=body.image_type,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        return AnalyzeResponse(
            success=True,
            data=solution_data,
            metadata=ResponseMetadata(
                request_id=request_id,
                mode="fast",
                primary_model=settings.claude_model,
                generated_at=datetime.now(timezone.utc),
                latency_ms=latency_ms,
                cached=False,
                cost_estimate_usd=0.02,
            ),
            warnings=[],
        )

    except Exception as e:
        import traceback
        print(f"[ANALYZE_IMAGE ERROR] {type(e).__name__}: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.post(
    "/optimize",
    response_model=Union[AnalyzeResponse, ErrorResponse],
    responses={
        200: {"model": AnalyzeResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def optimize_solution(request: Request, body: OptimizeRequest):
    """Optimize an existing solution."""

    request_id = str(uuid.uuid4())
    start_time = time.time()

    try:
        solution_data = await claude_service.optimize_code(
            problem_text=body.problem_text,
            current_code=body.current_code,
            optimization_goal=body.optimization_goal.value,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        return AnalyzeResponse(
            success=True,
            data=solution_data,
            metadata=ResponseMetadata(
                request_id=request_id,
                mode="optimize",
                primary_model=settings.claude_model,
                generated_at=datetime.now(timezone.utc),
                latency_ms=latency_ms,
                cost_estimate_usd=0.02,
            ),
            warnings=[],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/explain-simple",
    response_model=Union[ExplainSimpleResponse, ErrorResponse],
    responses={
        200: {"model": ExplainSimpleResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def explain_simple(request: Request, body: ExplainSimpleRequest):
    """Generate simplified explanation for beginners."""

    request_id = str(uuid.uuid4())
    start_time = time.time()

    try:
        explanation = await claude_service.explain_simple(
            problem_text=body.problem_text,
            code=body.code,
            target_level=body.target_level.value,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        return ExplainSimpleResponse(
            success=True,
            data=explanation,
            metadata=ResponseMetadata(
                request_id=request_id,
                mode="explain-simple",
                primary_model=settings.claude_model,
                generated_at=datetime.now(timezone.utc),
                latency_ms=latency_ms,
                cost_estimate_usd=0.015,
            ),
            warnings=[],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/execute",
    response_model=ExecuteResponse,
    responses={
        200: {"model": ExecuteResponse},
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit("20/minute")
async def execute_code(request: Request, body: ExecuteRequest):
    """Execute Python code and return the output."""

    start_time = time.time()

    # Create a temporary file for the code
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(body.code)
        temp_file = f.name

    try:
        # Run the code in a subprocess with timeout
        process = await asyncio.create_subprocess_exec(
            sys.executable,
            temp_file,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=body.timeout
            )
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            return ExecuteResponse(
                success=False,
                output="",
                error=f"Execution timed out after {body.timeout} seconds",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )

        execution_time_ms = int((time.time() - start_time) * 1000)

        if process.returncode == 0:
            return ExecuteResponse(
                success=True,
                output=stdout.decode("utf-8", errors="replace"),
                error="",
                execution_time_ms=execution_time_ms,
            )
        else:
            return ExecuteResponse(
                success=False,
                output=stdout.decode("utf-8", errors="replace"),
                error=stderr.decode("utf-8", errors="replace"),
                execution_time_ms=execution_time_ms,
            )

    finally:
        # Clean up temp file
        import os
        try:
            os.unlink(temp_file)
        except:
            pass
