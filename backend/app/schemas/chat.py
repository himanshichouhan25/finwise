"""Pydantic schemas for AI Financial Coach conversation sessions and messages."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    """Payload for sending a prompt to the AI financial coach."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User question or financial prompt",
    )
    session_id: int | None = Field(
        default=None,
        description="Optional session ID to continue existing conversation; creates new session if omitted",
    )


class ChatMessageItem(BaseModel):
    """Single chat message exchange item."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    tools_used: list[dict[str, Any]] | None = None
    created_at: datetime


class ChatResponse(BaseModel):
    """Complete response returned from AI Financial Coach."""

    session_id: int
    message: ChatMessageItem
    model_used: str | None = None


class ChatSessionSummary(BaseModel):
    """Summary of a past chat conversation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    message_count: int = 0


class ChatSessionDetail(BaseModel):
    """Complete conversation session with full message history."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    messages: list[ChatMessageItem]
