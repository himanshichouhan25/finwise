"""Financial Health Score endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.health_score import HealthScoreResponse
from app.services.health_score_service import get_and_snapshot_health_score

router = APIRouter(prefix="/health-score", tags=["Health Score"])


@router.get("", response_model=HealthScoreResponse)
def get_user_health_score(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> HealthScoreResponse:
    """Compute and record current Financial Health Score (0-100) and factor breakdown."""
    return get_and_snapshot_health_score(db, user_id)
