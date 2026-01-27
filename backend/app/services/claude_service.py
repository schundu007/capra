"""Claude AI service for code generation and analysis - Enterprise Grade."""

import asyncio
import json
import logging
import re
from typing import Optional

import anthropic

from app.core.config import get_settings
from app.models.schemas import (
    SolutionData,
    LineExplanation,
    Complexity,
    ComplexityInfo,
    EdgeCase,
    CommonMistake,
    AlternativeApproach,
    SimplifiedExplanation,
    SimplifiedStep,
    KeyConcept,
)

settings = get_settings()
logger = logging.getLogger(__name__)

SYSTEM_PROMPT_ANALYZE = """You are an expert Python programmer. Solve the given coding problem.

Return a valid JSON object with this exact structure:
{
  "code": "your complete Python solution here",
  "lines": [
    {"line_number": 1, "code": "first line", "explanation": "what it does", "is_key_line": false}
  ],
  "complexity": {
    "time": {"notation": "O(n)", "explanation": "why"},
    "space": {"notation": "O(1)", "explanation": "why"}
  },
  "edge_cases": [],
  "common_mistakes": [],
  "alternative_approaches": []
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text."""

SYSTEM_PROMPT_STREAM = """You are solving a coding interview problem. Write OPTIMAL interview-ready Python code.

REQUIREMENTS:
1. Use LeetCode-style class Solution format for algorithmic problems
2. Use OPTIMAL time/space complexity (two-pointer, sliding window, etc.)
3. ONLY include test cases mentioned in the problem - do NOT add extra test cases
4. If problem says 2 examples, show exactly 2 tests. If no examples given, show 1-2 tests max.

FORMAT: Raw Python code only. No markdown, no backticks, no comments."""

SYSTEM_PROMPT_EXPLAIN = """Explain this code for a coding interview. Return JSON only:
{
  "thought_process": "5-10 line explanation of the approach, algorithm choice, and why it works",
  "lines": [
    {"line": 1, "code": "actual code line", "explanation": "what this line does"}
  ]
}
Be concise. Focus on interview-relevant insights."""

SYSTEM_PROMPT_OPTIMIZE = """You are an expert Python optimization specialist.
Optimize the given code while maintaining correctness.

Return a valid JSON object with the same structure as:
{
  "code": "optimized Python code",
  "lines": [...],
  "complexity": {...},
  "edge_cases": [],
  "common_mistakes": [],
  "alternative_approaches": []
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks."""

SYSTEM_PROMPT_SIMPLIFY = """You are a patient programming tutor.
Explain the code simply for beginners.

Return a valid JSON object:
{
  "simplified_explanation": "Overall explanation in 2-3 paragraphs",
  "step_by_step": [{"step": 1, "title": "...", "explanation": "...", "analogy": "..."}],
  "key_concepts": [{"term": "...", "simple_definition": "...", "example": "..."}]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks."""

SYSTEM_PROMPT_ANALYZE_IMAGE = """Look at this coding problem image and solve it.

Return a valid JSON object:
{
  "code": "complete Python solution",
  "lines": [{"line_number": 1, "code": "line", "explanation": "what it does", "is_key_line": false}],
  "complexity": {
    "time": {"notation": "O(n)", "explanation": "why"},
    "space": {"notation": "O(1)", "explanation": "why"}
  },
  "edge_cases": [],
  "common_mistakes": [],
  "alternative_approaches": []
}

IMPORTANT: Return ONLY valid JSON. No markdown, no extra text."""


class ClaudeService:
    """Enterprise-grade service for Claude API interactions."""

    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = settings.claude_model
        self.max_retries = 3
        self.base_delay = 1.0

    async def _call_with_retry(self, func, *args, **kwargs):
        """Execute API call with exponential backoff retry."""
        last_error = None

        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except anthropic.RateLimitError as e:
                last_error = e
                delay = self.base_delay * (2 ** attempt)
                logger.warning(f"Rate limited, retrying in {delay}s (attempt {attempt + 1})")
                await asyncio.sleep(delay)
            except anthropic.APIConnectionError as e:
                last_error = e
                delay = self.base_delay * (2 ** attempt)
                logger.warning(f"Connection error, retrying in {delay}s (attempt {attempt + 1})")
                await asyncio.sleep(delay)
            except anthropic.APIStatusError as e:
                if e.status_code >= 500:
                    last_error = e
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(f"Server error {e.status_code}, retrying in {delay}s")
                    await asyncio.sleep(delay)
                else:
                    raise

        raise last_error

    async def analyze_problem(
        self,
        problem_text: str,
        sample_input: Optional[str] = None,
        sample_output: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> SolutionData:
        """Analyze a coding problem and generate solution with explanations."""
        user_prompt = f"PROBLEM:\n{problem_text}"

        if sample_input:
            user_prompt += f"\n\nSAMPLE INPUT:\n{sample_input}"
        if sample_output:
            user_prompt += f"\n\nEXPECTED OUTPUT:\n{sample_output}"
        if difficulty:
            user_prompt += f"\n\nDIFFICULTY: {difficulty}"

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.1,
                system=SYSTEM_PROMPT_ANALYZE,
                messages=[{"role": "user", "content": user_prompt}],
            )

        response = await self._call_with_retry(make_request)
        content = response.content[0].text
        return self._parse_solution_response(content)

    async def analyze_problem_stream(
        self,
        problem_text: str,
        sample_input: Optional[str] = None,
        sample_output: Optional[str] = None,
        difficulty: Optional[str] = None,
    ):
        """Stream clean Python code response chunk by chunk."""
        user_prompt = f"PROBLEM:\n{problem_text}"

        if sample_input:
            user_prompt += f"\n\nSAMPLE INPUT:\n{sample_input}"
        if sample_output:
            user_prompt += f"\n\nEXPECTED OUTPUT:\n{sample_output}"
        if difficulty:
            user_prompt += f"\n\nDIFFICULTY: {difficulty}"

        try:
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=4096,
                temperature=0.1,
                system=SYSTEM_PROMPT_STREAM,
                messages=[{"role": "user", "content": user_prompt}],
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            raise

    async def explain_code(self, problem_text: str, code: str) -> dict:
        """Generate thought process and line-by-line explanation."""
        user_prompt = f"PROBLEM:\n{problem_text}\n\nCODE:\n{code}"

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.1,
                system=SYSTEM_PROMPT_EXPLAIN,
                messages=[{"role": "user", "content": user_prompt}],
            )

        response = await self._call_with_retry(make_request)
        content = response.content[0].text

        try:
            data = self._extract_json(content)
            return data
        except Exception:
            return {
                "thought_process": "Explanation generation failed",
                "lines": []
            }

    async def optimize_code(
        self,
        problem_text: str,
        current_code: str,
        optimization_goal: str,
    ) -> SolutionData:
        """Optimize existing code."""
        user_prompt = f"""PROBLEM:
{problem_text}

CURRENT CODE:
{current_code}

OPTIMIZATION GOAL: {optimization_goal}

Optimize this solution focusing on {optimization_goal}."""

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.2,
                system=SYSTEM_PROMPT_OPTIMIZE,
                messages=[{"role": "user", "content": user_prompt}],
            )

        response = await self._call_with_retry(make_request)
        content = response.content[0].text
        return self._parse_solution_response(content)

    async def explain_simple(
        self,
        problem_text: str,
        code: str,
        target_level: str,
    ) -> SimplifiedExplanation:
        """Generate simplified explanation for beginners."""
        user_prompt = f"""PROBLEM:
{problem_text}

CODE:
{code}

TARGET AUDIENCE: {target_level}

Explain this solution simply."""

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.3,
                system=SYSTEM_PROMPT_SIMPLIFY,
                messages=[{"role": "user", "content": user_prompt}],
            )

        response = await self._call_with_retry(make_request)
        content = response.content[0].text
        return self._parse_simplified_response(content)

    async def analyze_image(
        self,
        image_base64: str,
        image_type: str,
    ) -> SolutionData:
        """Analyze coding problem from image and generate solution."""
        media_type = f"image/{image_type}"
        if image_type == "jpg":
            media_type = "image/jpeg"

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.1,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_base64,
                                },
                            },
                            {"type": "text", "text": SYSTEM_PROMPT_ANALYZE_IMAGE},
                        ],
                    }
                ],
            )

        response = await self._call_with_retry(make_request)
        content = response.content[0].text
        return self._parse_solution_response(content)

    async def extract_text_from_image(
        self,
        image_base64: str,
        image_type: str,
    ) -> tuple[str, float]:
        """Extract text from image using Claude Vision."""
        media_type = f"image/{image_type}"
        if image_type == "jpg":
            media_type = "image/jpeg"

        async def make_request():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_base64,
                                },
                            },
                            {"type": "text", "text": "Extract all text from this image. Preserve formatting."},
                        ],
                    }
                ],
            )

        response = await self._call_with_retry(make_request)
        extracted_text = response.content[0].text
        confidence = self._estimate_ocr_confidence(extracted_text)
        return extracted_text, confidence

    def _extract_json(self, content: str) -> dict:
        """Extract and parse JSON from response with multiple fallback strategies."""
        # Strategy 1: Direct parse
        try:
            return json.loads(content.strip())
        except json.JSONDecodeError:
            pass

        # Strategy 2: Find JSON object
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        # Strategy 3: Clean common issues and retry
        cleaned = content.strip()
        # Remove markdown code blocks
        cleaned = re.sub(r'```json\s*', '', cleaned)
        cleaned = re.sub(r'```\s*', '', cleaned)
        # Fix common JSON issues
        cleaned = re.sub(r',\s*}', '}', cleaned)  # Trailing commas
        cleaned = re.sub(r',\s*]', ']', cleaned)

        json_match = re.search(r'\{[\s\S]*\}', cleaned)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        # Strategy 4: Extract code and build minimal response
        code_match = re.search(r'"code"\s*:\s*"([^"]*(?:\\.[^"]*)*)"', content, re.DOTALL)
        if code_match:
            code = code_match.group(1)
            return self._build_minimal_response(code)

        # Strategy 5: Look for Python code directly
        if 'def ' in content or 'class ' in content:
            code_lines = []
            in_code = False
            for line in content.split('\n'):
                if line.strip().startswith('def ') or line.strip().startswith('class ') or in_code:
                    in_code = True
                    code_lines.append(line)
            if code_lines:
                return self._build_minimal_response('\n'.join(code_lines))

        raise ValueError("Could not extract valid JSON or code from response")

    def _build_minimal_response(self, code: str) -> dict:
        """Build a minimal valid response structure from code."""
        lines = []
        for i, line in enumerate(code.split('\n'), 1):
            if line.strip():
                lines.append({
                    "line_number": i,
                    "code": line,
                    "explanation": "",
                    "is_key_line": False
                })

        return {
            "code": code,
            "lines": lines,
            "complexity": {
                "time": {"notation": "O(?)", "explanation": "Analysis pending"},
                "space": {"notation": "O(?)", "explanation": "Analysis pending"}
            },
            "edge_cases": [],
            "common_mistakes": [],
            "alternative_approaches": []
        }

    def _parse_solution_response(self, content: str) -> SolutionData:
        """Parse Claude's response into SolutionData with robust error handling."""
        try:
            data = self._extract_json(content)
        except ValueError as e:
            logger.error(f"JSON extraction failed: {e}")
            logger.debug(f"Raw content: {content[:500]}...")
            raise

        # Parse with defaults for missing fields
        lines = []
        for line_data in data.get("lines", []):
            if isinstance(line_data, dict):
                lines.append(
                    LineExplanation(
                        line_number=line_data.get("line_number", 0),
                        code=line_data.get("code", ""),
                        explanation=line_data.get("explanation", ""),
                        complexity_note=line_data.get("complexity_note"),
                        is_key_line=line_data.get("is_key_line", False),
                    )
                )

        complexity_data = data.get("complexity", {})
        complexity = Complexity(
            time=ComplexityInfo(
                notation=complexity_data.get("time", {}).get("notation", "O(?)"),
                explanation=complexity_data.get("time", {}).get("explanation", ""),
            ),
            space=ComplexityInfo(
                notation=complexity_data.get("space", {}).get("notation", "O(?)"),
                explanation=complexity_data.get("space", {}).get("explanation", ""),
            ),
        )

        edge_cases = []
        for ec in data.get("edge_cases", []):
            if isinstance(ec, dict):
                edge_cases.append(
                    EdgeCase(
                        case=ec.get("case", ""),
                        handled=ec.get("handled", True),
                        how=ec.get("how", ""),
                        line_reference=ec.get("line_reference"),
                    )
                )

        mistakes = []
        for m in data.get("common_mistakes", []):
            if isinstance(m, dict):
                mistakes.append(
                    CommonMistake(
                        mistake=m.get("mistake", ""),
                        why_wrong=m.get("why_wrong", ""),
                        how_avoided=m.get("how_avoided", ""),
                    )
                )

        alternatives = []
        for a in data.get("alternative_approaches", []):
            if isinstance(a, dict):
                alternatives.append(
                    AlternativeApproach(
                        name=a.get("name", ""),
                        time_complexity=a.get("time_complexity", ""),
                        space_complexity=a.get("space_complexity", ""),
                        when_to_use=a.get("when_to_use", ""),
                        code_snippet=a.get("code_snippet"),
                    )
                )

        return SolutionData(
            code=data.get("code", ""),
            language="python",
            lines=lines,
            complexity=complexity,
            edge_cases=edge_cases,
            common_mistakes=mistakes,
            alternative_approaches=alternatives,
            test_results=[],
        )

    def _parse_simplified_response(self, content: str) -> SimplifiedExplanation:
        """Parse simplified explanation response."""
        try:
            data = self._extract_json(content)
        except ValueError as e:
            logger.error(f"JSON extraction failed: {e}")
            # Return minimal response
            return SimplifiedExplanation(
                simplified_explanation=content[:500] if content else "Unable to parse explanation",
                step_by_step=[],
                key_concepts=[],
            )

        steps = []
        for step_data in data.get("step_by_step", []):
            if isinstance(step_data, dict):
                steps.append(
                    SimplifiedStep(
                        step=step_data.get("step", 0),
                        title=step_data.get("title", ""),
                        explanation=step_data.get("explanation", ""),
                        analogy=step_data.get("analogy"),
                    )
                )

        concepts = []
        for concept_data in data.get("key_concepts", []):
            if isinstance(concept_data, dict):
                concepts.append(
                    KeyConcept(
                        term=concept_data.get("term", ""),
                        simple_definition=concept_data.get("simple_definition", ""),
                        example=concept_data.get("example"),
                    )
                )

        return SimplifiedExplanation(
            simplified_explanation=data.get("simplified_explanation", ""),
            step_by_step=steps,
            key_concepts=concepts,
        )

    def _estimate_ocr_confidence(self, text: str) -> float:
        """Estimate OCR confidence based on text quality."""
        if not text:
            return 0.0

        confidence = 1.0

        # Check for error patterns
        if len(text) < 50:
            confidence -= 0.2

        words = text.split()
        if len(words) < 10:
            confidence -= 0.15

        return max(0.5, min(1.0, confidence))


# Singleton instance
claude_service = ClaudeService()
