"""AI Financial Coach API router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSessionDetail,
    ChatSessionSummary,
)
from app.services.coach_service import (
    get_session_detail,
    list_user_sessions,
    send_coach_message,
)

router = APIRouter(prefix="/coach", tags=["Coach"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_coach(
    payload: ChatRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ChatResponse:
    """Send a financial question or prompt to the FinWise AI Coach.

    Injects real-time financial snapshot, executes deterministic calculation tools if needed,
    enforces SEBI compliance guardrails, and records the conversation history.
    """
    return send_coach_message(db=db, user_id=user_id, request=payload)


@router.get("/sessions", response_model=list[ChatSessionSummary])
def get_user_chat_sessions(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ChatSessionSummary]:
    """List all previous conversation sessions for the active persona."""
    return list_user_sessions(db=db, user_id=user_id)


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
def get_chat_session_history(
    session_id: Annotated[int, Path(description="Chat session ID", ge=1)],
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ChatSessionDetail:
    """Retrieve full message history for a specific conversation session."""
    return get_session_detail(db=db, user_id=user_id, session_id=session_id)
