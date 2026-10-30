"""Health Score and Dashboard Aggregation Service."""

import json

from sqlalchemy.orm import Session

from app.models import HealthScoreSnapshot
from app.schemas.dashboard import DashboardResponse
from app.schemas.goal import GoalResponse
from app.schemas.health_score import FactorScoreSchema, HealthScoreResponse
from app.schemas.profile import ProfileResponse
from app.services.budget_service import get_budget_summary
from app.services.snapshot_service import build_financial_snapshot


def get_and_snapshot_health_score(db: Session, user_id: int) -> HealthScoreResponse:
    """Compute current Financial Health Score and record historical snapshot in database."""
    snapshot = build_financial_snapshot(db, user_id)
    hs = snapshot.health_score

    factor_schemas = [
        FactorScoreSchema(
            name=f.name,
            points=f.points,
            max_points=f.max_points,
            has_data=f.has_data,
            explanation=f.explanation,
            improvement_tip=f.improvement_tip,
        )
        for f in hs.factors
    ]

    breakdown_dict = {f.name: float(f.points) for f in hs.factors}
    db.add(
        HealthScoreSnapshot(
            user_id=user_id,
            score=hs.score,
            breakdown_json=json.dumps(breakdown_dict),
        )
    )
    db.commit()

    return HealthScoreResponse(
        score=hs.score,
        band=hs.band,
        factors=factor_schemas,
        assumptions=hs.assumptions,
    )


def get_dashboard_summary(db: Session, user_id: int) -> DashboardResponse:
    """Compile aggregated composite state for application home screen."""
    snapshot = build_financial_snapshot(db, user_id)
    budget_summary = get_budget_summary(db, user_id, snapshot.month_str)
    health_score_res = get_and_snapshot_health_score(db, user_id)

    profile_schema = ProfileResponse.model_validate(snapshot.profile) if snapshot.profile else None

    active_goals_schemas = [
        GoalResponse.model_validate(g_item.goal)
        for g_item in snapshot.goals_with_plans
        if g_item.goal.status == "active"
    ]

    # Persona-tailored starter prompt for Coach
    persona = snapshot.user.persona
    if persona == "student":
        coach_prompt = "How can I start saving with my college stipend while managing hostel PG rent?"
    elif persona == "gig_worker":
        coach_prompt = "My freelance income fluctuates each month. How should I allocate my liquid buffer?"
    else:
        coach_prompt = "I just received my salary. How should I split my 50/30/20 budget and index fund SIP?"

    return DashboardResponse(
        user_id=snapshot.user.id,
        user_name=snapshot.user.name,
        persona=snapshot.user.persona,
        profile=profile_schema,
        budget_summary=budget_summary,
        health_score=health_score_res,
        active_goals=active_goals_schemas,
        pending_journal_reviews_count=snapshot.pending_journal_reviews_count,
        coach_starter_prompt=coach_prompt,
    )
