"""API request dependencies."""

from typing import Annotated

from fastapi import Header

from app.core.errors import ValidationFailure
from app.db.session import get_db


def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> int:
    """Extract and validate the current user ID from the X-User-Id request header.

    For Hackathon MVP demo personas, defaults to user ID 1 if not specified.
    Validates that any explicitly provided header parses to a positive integer.
    """
    if x_user_id is None or not x_user_id.strip():
        return 1

    try:
        user_id = int(x_user_id.strip())
        if user_id <= 0:
            raise ValueError()
        return user_id
    except ValueError as err:
        raise ValidationFailure("Header X-User-Id must be a positive integer") from err


__all__ = ["get_db", "get_current_user_id"]
