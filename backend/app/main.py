"""FinWise AI Backend Application Entrypoint.

Configures FastAPI instance, middleware, CORS, logging, exception handlers,
and registers all /api/v1 domain routers per FinWise AI Blueprint V2.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

import app.models  # noqa: F401
from app.api.v1.health import router as health_router
from app.core.config import get_settings
from app.core.errors import (
    FinWiseError,
    finwise_exception_handler,
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.core.logging import RequestLoggingMiddleware, setup_logging
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown routines."""
    # Bootstrap database tables
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    """FastAPI application factory."""
    settings = get_settings()

    # Configure structured logging
    setup_logging(log_level=settings.LOG_LEVEL)

    application = FastAPI(
        title="FinWise AI API",
        description="AI Financial Coach & Expense Intelligence Platform for First-Time Investors",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/api/v1/openapi.json",
        lifespan=lifespan,
    )

    # 1. Attach Request Logging Middleware (Single-line, privacy-safe)
    application.add_middleware(RequestLoggingMiddleware)

    # 2. Attach CORS Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Register Standardized Error Handlers
    application.add_exception_handler(FinWiseError, finwise_exception_handler)
    application.add_exception_handler(RequestValidationError, validation_exception_handler)
    application.add_exception_handler(StarletteHTTPException, http_exception_handler)
    application.add_exception_handler(Exception, generic_exception_handler)

    # 4. Mount API v1 Routers
    application.include_router(health_router, prefix="/api/v1")

    return application


app = create_app()
