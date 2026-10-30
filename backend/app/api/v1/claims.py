"""Finfluencer Claim Reality Check API router."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.claim import (
    ClaimAnalyzeRequest,
    ClaimAnalyzeResponse,
    ClaimHistoryItem,
)
from app.services.claim_service import analyze_claim, get_claim_history

router = APIRouter(prefix="/claims", tags=["Claims"])


@router.post("/analyze", response_model=ClaimAnalyzeResponse)
def analyze_financial_claim(
    payload: ClaimAnalyzeRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ClaimAnalyzeResponse:
    """Analyze a finfluencer investment claim or social media promise.

    Computes implied CAGR, compares against Nifty 50, FD, and Warren Buffett benchmarks,
    detects SEBI violation red flags, and determines risk feasibility.
    """
    return analyze_claim(db=db, user_id=user_id, payload=payload)


@router.get("/history", response_model=list[ClaimHistoryItem])
def get_user_claim_history(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ClaimHistoryItem]:
    """Retrieve audit history of previously checked financial claims."""
    return get_claim_history(db=db, user_id=user_id)
