"""Financial Health Score schemas."""

from decimal import Decimal

from pydantic import BaseModel


class FactorScoreSchema(BaseModel):
    name: str
    points: Decimal
    max_points: Decimal
    has_data: bool
    explanation: str
    improvement_tip: str


class HealthScoreResponse(BaseModel):
    """Schema for returning 0-100 Financial Health Score breakdown."""

    score: int
    band: str
    factors: list[FactorScoreSchema]
    assumptions: list[str]
