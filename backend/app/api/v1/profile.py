"""Financial profile endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.budget_service import get_or_create_profile, update_profile

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
def get_user_profile(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileResponse:
    """Retrieve the current user's financial profile."""
    profile = get_or_create_profile(db, user_id)
    return ProfileResponse.model_validate(profile)


@router.put("", response_model=ProfileResponse)
def update_user_profile(
    payload: ProfileUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileResponse:
    """Update baseline income, income type, and emergency fund."""
    profile = update_profile(db, user_id, payload)
    return ProfileResponse.model_validate(profile)
