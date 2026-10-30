"""Budget summary endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.dashboard import BudgetSummaryResponse
from app.services.budget_service import get_budget_summary

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("/summary", response_model=BudgetSummaryResponse)
def get_monthly_budget_summary(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str | None, Query(description="Target month in YYYY-MM format")] = None,
) -> BudgetSummaryResponse:
    """Retrieve 50/30/20 budget breakdown, bucket variances, and deterministic suggestions."""
    return get_budget_summary(db, user_id, month)
