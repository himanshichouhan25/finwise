"""Pydantic schemas for Finfluencer Claim Reality Check."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ClaimAnalyzeRequest(BaseModel):
    """Payload for submitting a financial claim for analysis."""

    claim_text: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="The finfluencer claim, social media post, or investment offer text to audit",
        examples=["Make 20% every month with this guaranteed secret trading strategy!"],
    )


class BenchmarkComparisonSchema(BaseModel):
    """Comparative multiplier versus standard benchmark asset classes."""

    benchmark_name: str
    benchmark_cagr_pct: Decimal
    multiplier_vs_benchmark: Decimal


class RedFlagItemSchema(BaseModel):
    """Scam, high risk, or regulatory violation signal."""

    code: str
    title: str
    description: str
    severity: str


class ClaimAnalyzeResponse(BaseModel):
    """Comprehensive analytical audit of an investment claim."""

    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    claim_text: str
    risk_level: str  # low | medium | high | extreme
    verdict: str
    annualized_cagr_pct: Decimal
    claimed_return_pct: Decimal
    timeframe_years: Decimal
    doubling_time_years: Decimal | None = None
    is_guaranteed: bool
    asset_class: str
    benchmarks: list[BenchmarkComparisonSchema]
    red_flags: list[RedFlagItemSchema]
    explanation: str
    created_at: datetime


class ClaimHistoryItem(BaseModel):
    """Summary item for claim check history list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    claim_text: str
    risk_level: str
    created_at: datetime
