"""Database engine, session factory, and dependency."""

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

db_url = settings.DATABASE_URL
# Canonical resolution for SQLite relative URLs to ensure consistency across execution directories
if db_url.startswith("sqlite:///./") or db_url == "sqlite:///finwise.db":
    db_filename = db_url.split("///")[-1].lstrip("./")
    # session.py is in backend/app/db/session.py -> parents[2] is backend/, parents[3] is project root
    project_root = Path(__file__).resolve().parents[3]
    canonical_db_path = project_root / db_filename
    db_url = f"sqlite:///{canonical_db_path.as_posix()}"

# SQLite requires check_same_thread=False for multi-threaded access
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
