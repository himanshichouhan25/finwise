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
            description="Primary Groq API key",
        ),
    ]
    GROQ_API_KEYS: Annotated[
        str,
        Field(
            default="",
            description="Optional comma-separated pool of Groq API keys for automatic failover/rotation",
        ),
    ]
    LLM_PROVIDER: Annotated[str, Field(default="groq", description="LLM provider name")]
    LLM_MODEL: Annotated[str, Field(default="llama-3.3-70b-versatile", description="Primary model identifier")]
    LLM_FALLBACK_MODEL: Annotated[str, Field(default="llama-3.1-8b-instant", description="Secondary fallback model")]
    LLM_TIMEOUT_SECONDS: Annotated[int, Field(default=20, ge=1, le=120, description="Timeout in seconds for AI calls")]

    # Market Intelligence & Free API Integration
    MARKET_DATA_PROVIDER: Annotated[
        str,
        Field(
            default="tapetide",
            description="Primary market data provider: 'tapetide', 'bharatstock', 'alphavantage', or 'demo'",
        ),
    ]
    TAPETIDE_API_KEY: Annotated[
        str | None,
        Field(
            default=None,
            description="API key/bearer token for Tapetide Indian market data",
        ),
    ]
    BHARATSTOCK_API_KEY: Annotated[
        str | None,
        Field(
            default=None,
            description="API key for BharatStock Indian market data",
        ),
    ]
    ALPHA_VANTAGE_API_KEY: Annotated[
        str | None,
        Field(
            default=None,
            description="API key for Alpha Vantage financial data & sentiment",
        ),
    ]
    MARKET_DATA_CACHE_TTL: Annotated[
        int,
        Field(
            default=300,
            ge=10,
            le=86400,
            description="Cache TTL in seconds for market data responses to conserve free tier quotas",
        ),
    ]
    MARKET_DATA_TIMEOUT: Annotated[
        int,
        Field(
            default=15,
            ge=2,
            le=60,
            description="HTTP request timeout in seconds for market data provider APIs",
        ),
    ]
    MARKET_DATA_RETRY_COUNT: Annotated[
        int,
        Field(
            default=2,
            ge=0,
            le=5,
            description="Number of retries on transient network/rate-limit errors",
        ),
    ]
    MARKET_NEWS_PROVIDER: Annotated[
        str,
        Field(
            default="alphavantage",
            description="Provider for financial market news: 'alphavantage' or 'demo'",
        ),
    ]

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
    def all_groq_keys(self) -> list[str]:
        """Return consolidated unique list of all configured Groq API keys."""
        keys: list[str] = []
        if self.GROQ_API_KEY and self.GROQ_API_KEY.strip():
            keys.append(self.GROQ_API_KEY.strip())
        if self.GROQ_API_KEYS and self.GROQ_API_KEYS.strip():
            for k in self.GROQ_API_KEYS.split(","):
                k_clean = k.strip()
                if k_clean and k_clean not in keys:
                    keys.append(k_clean)
        return keys

    @property
    def is_ai_configured(self) -> bool:
        """Check if at least one AI API key is configured."""
        return len(self.all_groq_keys) > 0


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
