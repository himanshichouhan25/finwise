"""Security utilities: password hashing with bcrypt and JWT token handling."""

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import get_settings
from app.core.errors import UnauthorizedError


def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt with salt."""
    if not password:
        raise ValueError("Password cannot be empty")
    # Truncate to 72 bytes if necessary per bcrypt limits
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Verify a plain text password against a stored bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    user_id: int,
    email: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Generate a signed HS256 JWT access token."""
    settings = get_settings()
    now = datetime.now(UTC)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "email": email or "",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }

    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token, returning its claims payload."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "access":
            raise UnauthorizedError("Invalid token type")
        return payload
    except jwt.ExpiredSignatureError as err:
        raise UnauthorizedError("Session expired. Please log in again.") from err
    except jwt.InvalidTokenError as err:
        raise UnauthorizedError("Invalid authentication credentials.") from err
