"""Dashboard composite response schemas."""

from decimal import Decimal

from pydantic import BaseModel

from app.schemas.goal import GoalResponse
from app.schemas.health_score import HealthScoreResponse
from app.schemas.profile import ProfileResponse


class BudgetBucketSummarySchema(BaseModel):
    bucket: str
    target_pct: Decimal
    target_amount: Decimal
    actual_amount: Decimal
    variance: Decimal
    percent_of_income: Decimal
    status: str


class BudgetSummaryResponse(BaseModel):
    """Schema for monthly 50/30/20 budget breakdown."""

    month: str
    net_income: Decimal
    total_expenses: Decimal
    net_savings: Decimal
    needs: BudgetBucketSummarySchema
    wants: BudgetBucketSummarySchema
    savings: BudgetBucketSummarySchema
    suggestions: list[str]
    assumptions: list[str]


class DashboardResponse(BaseModel):
    """Composite payload for application home screen."""

    user_id: int
    user_name: str
    persona: str
    profile: ProfileResponse | None
    budget_summary: BudgetSummaryResponse
    health_score: HealthScoreResponse
    active_goals: list[GoalResponse]
    pending_journal_reviews_count: int
    coach_starter_prompt: str
