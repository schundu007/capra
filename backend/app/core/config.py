from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 3001
    debug: bool = False

    # Rate Limiting
    rate_limit_analyze: str = "10/minute"
    rate_limit_ocr: str = "5/minute"

    # Caching
    cache_ttl_seconds: int = 86400  # 24 hours
    cache_max_size: int = 1000

    # AI Models
    claude_model: str = "claude-sonnet-4-20250514"
    openai_model: str = "gpt-4o"

    # Limits
    max_problem_length: int = 10000
    max_image_size_mb: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
