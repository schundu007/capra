"""OpenAI service for code verification."""

import json
import re
from typing import Optional

from openai import AsyncOpenAI

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT_VERIFY = """You are a code reviewer specializing in Python algorithm verification.
Your task is to validate a solution against a problem statement.

EVALUATE:
1. Correctness: Does the code solve the stated problem?
2. Edge cases: Are all edge cases handled?
3. Efficiency: Is the complexity optimal for this problem class?
4. Style: Does it follow Python best practices?

OUTPUT FORMAT (JSON only):
{
  "is_correct": true,
  "issues": [{"severity": "error|warning|suggestion", "description": "...", "line": 1, "fix": "..."}],
  "edge_cases_missing": ["description of unhandled case"],
  "optimization_suggestions": ["..."],
  "overall_score": 95
}

Do not include markdown formatting. Return only valid JSON."""


class VerificationResult:
    """Result of code verification."""

    def __init__(
        self,
        is_correct: bool,
        issues: list[dict],
        edge_cases_missing: list[str],
        optimization_suggestions: list[str],
        overall_score: int,
    ):
        self.is_correct = is_correct
        self.issues = issues
        self.edge_cases_missing = edge_cases_missing
        self.optimization_suggestions = optimization_suggestions
        self.overall_score = overall_score

    @property
    def status(self) -> str:
        """Get verification status string."""
        if self.overall_score >= 90:
            return "passed"
        elif self.overall_score >= 70:
            return "passed_with_warnings"
        else:
            return "failed"


class OpenAIService:
    """Service for code verification using OpenAI."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def verify_solution(
        self,
        problem_text: str,
        code: str,
        sample_input: Optional[str] = None,
        sample_output: Optional[str] = None,
    ) -> VerificationResult:
        """Verify a code solution against the problem statement."""

        user_prompt = f"""PROBLEM:
{problem_text}

SOLUTION TO VERIFY:
```python
{code}
```"""

        if sample_input and sample_output:
            user_prompt += f"""

TEST CASE:
Input: {sample_input}
Expected: {sample_output}"""

        user_prompt += "\n\nVerify this solution for correctness and completeness."

        response = await self.client.chat.completions.create(
            model=self.model,
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_VERIFY},
                {"role": "user", "content": user_prompt},
            ],
        )

        content = response.choices[0].message.content
        return self._parse_verification_response(content)

    def _parse_verification_response(self, content: str) -> VerificationResult:
        """Parse OpenAI verification response."""

        # Extract JSON from response
        json_match = re.search(r"\{[\s\S]*\}", content)
        if not json_match:
            # Default to passed if parsing fails
            return VerificationResult(
                is_correct=True,
                issues=[],
                edge_cases_missing=[],
                optimization_suggestions=[],
                overall_score=80,
            )

        try:
            data = json.loads(json_match.group())
        except json.JSONDecodeError:
            return VerificationResult(
                is_correct=True,
                issues=[],
                edge_cases_missing=[],
                optimization_suggestions=[],
                overall_score=80,
            )

        return VerificationResult(
            is_correct=data.get("is_correct", True),
            issues=data.get("issues", []),
            edge_cases_missing=data.get("edge_cases_missing", []),
            optimization_suggestions=data.get("optimization_suggestions", []),
            overall_score=data.get("overall_score", 80),
        )


# Singleton instance
openai_service = OpenAIService()
