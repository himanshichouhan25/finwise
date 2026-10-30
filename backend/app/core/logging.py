"""Structured logging configuration and request middleware.

Enforces privacy and security guidelines:
- Exactly one line per request (method, path, status, duration_ms)
- Never logs API keys, full prompts, or financial amounts at INFO level
- Never leaks customer financial context in logs
"""

import logging
import sys
import time
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("finwise")


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured logging for the application."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Format: [timestamp] [level] [name]: message
    log_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=numeric_level,
        format=log_format,
        datefmt=date_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    logger.setLevel(numeric_level)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured, privacy-safe single-line HTTP request logging."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            status_code = response.status_code

            # Structured single line log
            logger.info(
                f"{method} {path} -> {status_code} in {duration_ms:.2f}ms"
            )
            return response
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"{method} {path} -> 500 ERROR in {duration_ms:.2f}ms: {type(exc).__name__}"
            )
            raise
