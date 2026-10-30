"""Domain exceptions and standardized JSON error handlers.

Maps internal domain exceptions and validation errors to a consistent response format:
{ "error": { "code": "...", "message": "..." } }
Ensures no internal stack traces or database errors are ever leaked to clients.
"""

from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class FinWiseError(Exception):
    """Base exception for all FinWise application errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class NotFoundError(FinWiseError):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, code="NOT_FOUND", status_code=status.HTTP_404_NOT_FOUND)


class ValidationFailure(FinWiseError):
    """Raised when financial inputs or business rules fail validation."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message=message, code="VALIDATION_ERROR", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class AIUnavailableError(FinWiseError):
    """Raised when the AI / LLM service is offline, rate-limited, or unreachable."""

    def __init__(
        self,
        message: str = "AI service is currently unavailable. Deterministic financial tools remain active.",
        fallback_data: Any = None,
    ):
        super().__init__(message=message, code="AI_UNAVAILABLE", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
        self.fallback_data = fallback_data


class UnauthorizedError(FinWiseError):
    """Raised when request is missing required identity or authorization."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=status.HTTP_401_UNAUTHORIZED)


def create_error_response(status_code: int, code: str, message: str, details: Any = None) -> JSONResponse:
    """Build a standardized JSON error response."""
    content: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details is not None:
        content["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=content)


async def finwise_exception_handler(request: Request, exc: FinWiseError) -> JSONResponse:
    """Handle custom FinWise domain exceptions."""
    details = getattr(exc, "fallback_data", None)
    return create_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=details,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request schema validation errors in consistent envelope."""
    errors = exc.errors()
    # Build clean human-readable summary
    summary = "; ".join(f"{' -> '.join(str(loc) for loc in err.get('loc', []))}: {err.get('msg', '')}" for err in errors[:3])
    return create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="VALIDATION_ERROR",
        message=f"Invalid request parameters: {summary}" if summary else "Invalid request data",
        details=errors,
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle standard HTTP exceptions."""
    code = "HTTP_ERROR"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
        code = "UNAUTHORIZED"
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        code = "FORBIDDEN"
    elif exc.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY:
        code = "VALIDATION_ERROR"

    return create_error_response(
        status_code=exc.status_code,
        code=code,
        message=str(exc.detail),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions to prevent stack trace leaks."""
    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred. Please try again later.",
    )
