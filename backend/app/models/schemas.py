"""Pydantic models for API request/response validation."""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ExecutionMode(str, Enum):
    FAST = "fast"
    VERIFIED = "verified"
    COMPREHENSIVE = "comprehensive"


class OptimizationGoal(str, Enum):
    TIME = "time"
    SPACE = "space"
    READABILITY = "readability"


class TargetLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"


# ─────────────────────────────────────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    """Request body for /api/v1/analyze endpoint."""

    problem_text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="The coding problem statement"
    )
    sample_input: Optional[str] = Field(
        None,
        max_length=2000,
        description="Sample input for the problem"
    )
    sample_output: Optional[str] = Field(
        None,
        max_length=2000,
        description="Expected output for the sample input"
    )
    difficulty: Optional[DifficultyLevel] = Field(
        None,
        description="Problem difficulty level"
    )
    mode: ExecutionMode = Field(
        default=ExecutionMode.FAST,
        description="Execution mode: fast (Claude only), verified (Claude + OpenAI), comprehensive (full cycle)"
    )

    @field_validator("problem_text")
    @classmethod
    def sanitize_problem_text(cls, v: str) -> str:
        """Basic sanitization of problem text."""
        # Remove null bytes and excessive whitespace
        v = v.replace("\x00", "").strip()
        return v


class OCRRequest(BaseModel):
    """Request body for /api/v1/ocr endpoint."""

    image_base64: str = Field(
        ...,
        description="Base64 encoded image data"
    )
    image_type: str = Field(
        ...,
        pattern=r"^(png|jpg|jpeg|webp)$",
        description="Image format"
    )


class OptimizeRequest(BaseModel):
    """Request body for /api/v1/optimize endpoint."""

    problem_text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="The coding problem statement"
    )
    current_code: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Current solution code to optimize"
    )
    optimization_goal: OptimizationGoal = Field(
        default=OptimizationGoal.TIME,
        description="What to optimize for"
    )


class ExplainSimpleRequest(BaseModel):
    """Request body for /api/v1/explain-simple endpoint."""

    problem_text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="The coding problem statement"
    )
    code: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Code to explain"
    )
    target_level: TargetLevel = Field(
        default=TargetLevel.BEGINNER,
        description="Target audience level"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Response Models
# ─────────────────────────────────────────────────────────────────────────────


class LineExplanation(BaseModel):
    """Single line explanation."""

    line_number: int
    code: str
    explanation: str
    complexity_note: Optional[str] = None
    is_key_line: bool = False


class ComplexityInfo(BaseModel):
    """Time or space complexity information."""

    notation: str
    explanation: str


class Complexity(BaseModel):
    """Full complexity analysis."""

    time: ComplexityInfo
    space: ComplexityInfo


class EdgeCase(BaseModel):
    """Edge case handling information."""

    case: str
    handled: bool
    how: str
    line_reference: Optional[int] = None


class CommonMistake(BaseModel):
    """Common mistake information."""

    mistake: str
    why_wrong: str
    how_avoided: str


class AlternativeApproach(BaseModel):
    """Alternative solution approach."""

    name: str
    time_complexity: str
    space_complexity: str
    when_to_use: str
    code_snippet: Optional[str] = None


class TestResult(BaseModel):
    """Test case execution result."""

    input: str
    expected: str
    actual: str
    passed: bool


class SolutionData(BaseModel):
    """Main solution data."""

    code: str
    language: str = "python"
    lines: list[LineExplanation]
    complexity: Complexity
    edge_cases: list[EdgeCase] = []
    common_mistakes: list[CommonMistake] = []
    alternative_approaches: list[AlternativeApproach] = []
    test_results: list[TestResult] = []


class ResponseMetadata(BaseModel):
    """Response metadata."""

    request_id: str
    mode: str
    primary_model: str
    verification_model: Optional[str] = None
    verification_status: Optional[str] = None
    generated_at: datetime
    latency_ms: int
    cached: bool = False
    cost_estimate_usd: Optional[float] = None


class AnalyzeResponse(BaseModel):
    """Success response for analyze endpoint."""

    success: bool = True
    data: SolutionData
    metadata: ResponseMetadata
    warnings: list[str] = []


class ErrorDetails(BaseModel):
    """Error details."""

    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Error response."""

    success: bool = False
    error: ErrorDetails
    metadata: ResponseMetadata


class OCRResponse(BaseModel):
    """Response for OCR endpoint."""

    extracted_text: str
    confidence: float
    warnings: list[str] = []


class SimplifiedStep(BaseModel):
    """Step in simplified explanation."""

    step: int
    title: str
    explanation: str
    analogy: Optional[str] = None


class KeyConcept(BaseModel):
    """Key concept for beginners."""

    term: str
    simple_definition: str
    example: Optional[str] = None


class SimplifiedExplanation(BaseModel):
    """Simplified explanation response data."""

    simplified_explanation: str
    step_by_step: list[SimplifiedStep]
    key_concepts: list[KeyConcept]


class ExplainSimpleResponse(BaseModel):
    """Response for explain-simple endpoint."""

    success: bool = True
    data: SimplifiedExplanation
    metadata: ResponseMetadata
    warnings: list[str] = []


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str = "1.0.0"


class ExecuteRequest(BaseModel):
    """Request body for /api/v1/execute endpoint."""

    code: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Python code to execute"
    )
    timeout: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Execution timeout in seconds"
    )


class ExecuteResponse(BaseModel):
    """Response for execute endpoint."""

    success: bool
    output: str = ""
    error: str = ""
    execution_time_ms: int
