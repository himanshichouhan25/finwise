"""Unit tests for goal planning, timeline calculation, and what-if simulation."""

from decimal import Decimal

from app.engine.goals import (
    calculate_months_to_goal,
    calculate_required_monthly_savings,
    simulate_goal_what_if,
)


def test_goal_reference_vector_zero_return():
    """Verify Section 10 vector: Target=60,000, Saved=0, 12m, 0% return -> 5,000/month."""
    result = calculate_required_monthly_savings(
        target_amount=Decimal("60000.00"),
        current_saved=Decimal("0.00"),
        months_to_deadline=12,
        annual_return_pct=Decimal("0.00"),
    )

    assert result.required_monthly_savings == Decimal("5000.00")
    assert result.remaining_amount == Decimal("60000.00")
    assert result.is_achieved is False


def test_goal_round_trip_check():
    """Verify round-trip: months from timeline formula, fed to required savings, reproduces contribution."""
    target = Decimal("120000.00")
    saved = Decimal("20000.00")
    monthly_contrib = Decimal("10000.00")

    # Step 1: calculate months required
    timeline = calculate_months_to_goal(target, saved, monthly_contrib)
    assert timeline.is_reachable is True
    assert timeline.estimated_months == 10  # (120k - 20k) / 10k = 10 months

    # Step 2: feed months into required savings
    plan = calculate_required_monthly_savings(target, saved, timeline.estimated_months)
    assert plan.required_monthly_savings == monthly_contrib


def test_goal_short_term_capital_safety_rule():
    """Verify goals under 12 months default to 0% return for safety."""
    result = calculate_required_monthly_savings(
        target_amount=Decimal("30000.00"),
        current_saved=Decimal("0.00"),
        months_to_deadline=6,
        annual_return_pct=Decimal("12.00"),  # user input 12%, but duration is 6m
    )

    assert result.annual_return_pct == Decimal("0.00")
    assert result.required_monthly_savings == Decimal("5000.00")


def test_goal_what_if_simulation():
    """Verify what-if simulation computes differences between baseline and scenario."""
    what_if = simulate_goal_what_if(
        target_amount=Decimal("100000.00"),
        current_saved=Decimal("20000.00"),
        baseline_months=16,
        scenario_months=8,
    )

    assert what_if.months_difference == -8
    assert what_if.scenario_plan.required_monthly_savings > what_if.baseline_plan.required_monthly_savings
    assert "Shortening your timeline" in what_if.summary_text
