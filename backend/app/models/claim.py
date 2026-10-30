"""ClaimCheck ORM model for Finfluencer Reality Check."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class ClaimCheck(Base):
    """Historical record of audited finfluencer or investment claims."""

    __tablename__ = "claim_checks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_json: Mapped[str] = mapped_column(Text, nullable=False)
    computed_json: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)  # low | medium | high | extreme
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="claim_checks")
