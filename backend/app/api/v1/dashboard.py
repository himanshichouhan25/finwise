"""Dashboard composite endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.dashboard import DashboardResponse
from app.services.health_score_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> DashboardResponse:
    """Retrieve composite state for the application home screen (profile, budget, health score, goals)."""
    return get_dashboard_summary(db, user_id)
