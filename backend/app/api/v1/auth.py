"""User Authentication API Router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.auth import (
    AuthResponse,
    UserAuthProfile,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.services.auth_service import (
    demo_persona_login,
    get_current_user_profile,
    login_user,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserRegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthResponse:
    """Register a new user account with email, password, and financial persona."""
    return register_user(db=db, request=request)


@router.post("/login", response_model=AuthResponse)
def login(
    request: UserLoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthResponse:
    """Authenticate with registered email and password to receive a JWT access token."""
    return login_user(db=db, request=request)


@router.post("/demo-login/{persona_id}", response_model=AuthResponse)
def demo_login(
    persona_id: Annotated[int, Path(ge=1, le=3, description="Demo persona ID: 1, 2, or 3")],
    db: Annotated[Session, Depends(get_db)],
) -> AuthResponse:
    """Issue a cryptographically signed JWT for a demo persona (Aarav, Priya, or Rohan)."""
    return demo_persona_login(db=db, persona_id=persona_id)


@router.get("/me", response_model=UserAuthProfile)
def get_me(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> UserAuthProfile:
    """Retrieve profile and identity details for the authenticated user."""
    return get_current_user_profile(db=db, user_id=user_id)


@router.post("/logout")
def logout() -> dict[str, str]:
    """Client-side token disposal acknowledgement endpoint."""
    return {"status": "success", "message": "Successfully logged out"}

