"""Application configuration using pydantic-settings.

Loads environment variables from backend/.env or root .env, providing typed
settings with defaults and validation per FinWise AI Blueprint V2 Section 3.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """FinWise AI Settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application Environment
    APP_ENV: Annotated[str, Field(default="development", description="Environment: development, production, test")]
    LOG_LEVEL: Annotated[str, Field(default="INFO", description="Logging level")]

    # Database
    DATABASE_URL: Annotated[
        str,
        Field(
            default="sqlite:///./finwise.db",
            description="Database connection URL (defaults to local SQLite for MVP)",
        ),
    ]

    # AI / LLM Configuration
    # Groq API key is optional at startup so the app boots even without it
    GROQ_API_KEY: Annotated[
        str | None,
        Field(
            default=None,
            description="Groq API key for AI financial coach",
        ),
    ]
    LLM_PROVIDER: Annotated[str, Field(default="groq", description="LLM provider name")]
    LLM_MODEL: Annotated[str, Field(default="llama-3.3-70b-versatile", description="Model identifier")]
    LLM_TIMEOUT_SECONDS: Annotated[int, Field(default=20, ge=1, le=120, description="Timeout in seconds for AI calls")]

    # CORS
    CORS_ORIGINS: Annotated[
        str,
        Field(
            default="http://localhost:5173",
            description="Comma-separated allowed origins for CORS",
        ),
    ]

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list of clean origin URLs."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_ai_configured(self) -> bool:
        """Check if AI provider is configured with an active API key."""
        return bool(self.GROQ_API_KEY and self.GROQ_API_KEY.strip())


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
