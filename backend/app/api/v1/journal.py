"""Decision Journal API router with cooling-off countdown and gratification tracking."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.journal import (
    JournalDecisionRequest,
    JournalEntryCreate,
    JournalEntryResponse,
    JournalSummaryResponse,
)
from app.services.journal_service import (
    create_journal_entry,
    get_journal_entry,
    get_journal_summary,
    list_journal_entries,
    record_journal_decision,
)

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("/entries", response_model=JournalEntryResponse)
def create_entry(
    payload: JournalEntryCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> JournalEntryResponse:
    """Log an impulse purchase or financial decision with an active cooling-off timer (24h/48h)."""
    return create_journal_entry(db=db, user_id=user_id, payload=payload)


@router.get("/entries", response_model=list[JournalEntryResponse])
def get_entries(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    status: Annotated[str | None, Query(description="Filter by status: 'pending_review' | 'proceeded' | 'dropped'")] = None,
) -> list[JournalEntryResponse]:
    """Retrieve all logged decision journal entries for the active persona."""
    return list_journal_entries(db=db, user_id=user_id, status_filter=status)


@router.get("/summary", response_model=JournalSummaryResponse)
def get_user_journal_summary(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> JournalSummaryResponse:
    """Retrieve aggregate decision metrics: active cooling timers, review-ready items, and money saved."""
    return get_journal_summary(db=db, user_id=user_id)


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
def get_single_entry(
    entry_id: Annotated[int, Path(description="Journal entry ID", ge=1)],
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> JournalEntryResponse:
    """Retrieve details and remaining cooling-off time for a specific entry."""
    return get_journal_entry(db=db, user_id=user_id, entry_id=entry_id)


@router.post("/entries/{entry_id}/decide", response_model=JournalEntryResponse)
def finalize_decision(
    entry_id: Annotated[int, Path(description="Journal entry ID", ge=1)],
    payload: JournalDecisionRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> JournalEntryResponse:
    """Finalize a decision after the cooling-off period has passed (proceeded vs dropped)."""
    return record_journal_decision(db=db, user_id=user_id, entry_id=entry_id, payload=payload)
