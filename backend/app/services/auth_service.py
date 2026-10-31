"""Authentication service for user registration, login, and JWT token issuance."""

import logging
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, UnauthorizedError, ValidationFailure
from app.core.security import create_access_token, hash_password, verify_password
from app.models.profile import FinancialProfile
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    UserAuthProfile,
    UserLoginRequest,
    UserRegisterRequest,
)

logger = logging.getLogger("finwise.auth.service")


def register_user(db: Session, request: UserRegisterRequest) -> AuthResponse:
    """Register a new user, hash password, create initial profile, and return JWT."""
    normalized_email = request.email.lower().strip()

    # 1. Verify email uniqueness
    existing_user = db.scalar(select(User).where(User.email == normalized_email))
    if existing_user:
        raise ValidationFailure(message="An account with this email address already exists.")

    # 2. Hash password securely with bcrypt
    hashed = hash_password(request.password)

    # 3. Create user record
    new_user = User(
        email=normalized_email,
        hashed_password=hashed,
        name=request.name.strip(),
        persona=request.persona,
        language_pref=request.language_pref,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # 4. Initialize empty FinancialProfile for clean onboarding
    initial_profile = FinancialProfile(
        user_id=new_user.id,
        monthly_income=Decimal("0.00"),
        income_type="fixed",
        emergency_fund_saved=Decimal("0.00"),
    )
    db.add(initial_profile)
    db.commit()
    db.refresh(new_user)

    # 5. Generate signed JWT token
    token = create_access_token(user_id=new_user.id, email=new_user.email)

    logger.info("New user registered successfully: %s (ID: %d)", new_user.email, new_user.id)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserAuthProfile.model_validate(new_user),
    )


def login_user(db: Session, request: UserLoginRequest) -> AuthResponse:
    """Authenticate user credentials and issue signed JWT access token."""
    normalized_email = request.email.lower().strip()

    user = db.scalar(select(User).where(User.email == normalized_email))
    if not user or not user.hashed_password:
        logger.warning("Failed login attempt for email: %s (user not found or no password)", normalized_email)
        raise UnauthorizedError(message="Invalid email address or password.")

    if not verify_password(request.password, user.hashed_password):
        logger.warning("Failed login attempt for user ID: %d (incorrect password)", user.id)
        raise UnauthorizedError(message="Invalid email address or password.")

    if not user.is_active:
        raise UnauthorizedError(message="This account has been deactivated.")

    token = create_access_token(user_id=user.id, email=user.email)
    logger.info("User logged in successfully: %s (ID: %d)", user.email, user.id)

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserAuthProfile.model_validate(user),
    )


def demo_persona_login(db: Session, persona_id: int) -> AuthResponse:
    """Issue a genuine signed JWT for a demo persona (supports hackathon testing)."""
    user = db.scalar(select(User).where(User.id == persona_id))
    if not user:
        raise NotFoundError(message=f"Demo persona #{persona_id} not found.")

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserAuthProfile.model_validate(user),
    )


def get_current_user_profile(db: Session, user_id: int) -> UserAuthProfile:
    """Retrieve the authenticated user's profile."""
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise NotFoundError(message=f"User #{user_id} not found.")
    return UserAuthProfile.model_validate(user)
