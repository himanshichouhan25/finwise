"""Health check and system diagnostic endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import get_settings

router = APIRouter(prefix="/health", tags=["Health"])


class HealthResponse(BaseModel):
    """Schema for system health response."""

    status: str
    database: bool
    ai_configured: bool
    environment: str


@router.get("", response_model=HealthResponse)
def check_health(db: Annotated[Session, Depends(get_db)]) -> HealthResponse:
    """Liveness check reporting DB connectivity and AI configuration status.

    Executed synchronously in a threadpool to ensure safe SQLite interaction.
    """
    settings = get_settings()

    # Verify database reachability via lightweight query
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        database=db_ok,
        ai_configured=settings.is_ai_configured,
        environment=settings.APP_ENV,
    )
