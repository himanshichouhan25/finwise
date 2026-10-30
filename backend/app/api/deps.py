"""API request dependencies: database session and cryptographic JWT authentication."""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import NotFoundError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User


def get_current_user_id(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> int:
    """Extract and cryptographically authenticate the user from JWT Bearer token.

    Security rules:
    1. If 'Authorization: Bearer <token>' is provided, it is verified via HS256 secret.
    2. If invalid or expired, raises HTTP 401 UnauthorizedError.
    3. In production, Bearer token is strictly required.
    4. In development/testing, supports legacy X-User-Id fallback if token is absent.
    """
    settings = get_settings()

    # 1. Primary: Verify Cryptographic JWT Bearer Token
    if authorization and authorization.strip():
        parts = authorization.strip().split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise UnauthorizedError("Authorization header must be formatted as 'Bearer <token>'")

        token = parts[1]
        claims = decode_access_token(token)
        try:
            user_id = int(claims["sub"])
            if user_id <= 0:
                raise ValueError()
            return user_id
        except (KeyError, ValueError) as err:
            raise UnauthorizedError("Invalid token identity payload") from err

    # 2. Strict Production Guard: Do not allow spoofable demo headers in production
    if settings.APP_ENV == "production":
        raise UnauthorizedError("Authentication required. Please provide a valid Bearer token.")

    # 3. Development / Testing: Graceful fallback for demo personas
    if x_user_id and x_user_id.strip():
        try:
            user_id = int(x_user_id.strip())
            if user_id <= 0:
                raise ValueError()
            return user_id
        except ValueError as err:
            raise UnauthorizedError("Header X-User-Id must be a positive integer") from err

    return 1


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> User:
    """Retrieve full User ORM entity for the authenticated user, or raise 401/404."""
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise NotFoundError(f"Authenticated user #{user_id} does not exist.")
    if not user.is_active:
        raise UnauthorizedError("User account is inactive.")
    return user


__all__ = ["get_db", "get_current_user_id", "get_current_user"]
