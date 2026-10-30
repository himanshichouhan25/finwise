"""Unit tests for Financial Health Score (0-100) engine and rescaling logic."""

from decimal import Decimal

from app.engine.health_score import compute_health_score


def test_health_score_perfect_all_factors():
    """Verify optimal parameters yield a 100/100 Strong financial score."""
    result = compute_health_score(
        net_income=Decimal("50000.00"),
        needs_spent=Decimal("20000.00"),  # 40% (<=50% -> full 20 pts)
        wants_spent=Decimal("10000.00"),  # 20% (<=30% -> full 15 pts)
        savings_spent=Decimal("15000.00"),  # 30% (>=20% -> full 25 pts)
        emergency_fund_saved=Decimal("100000.00"),  # 5x needs (>=3x -> full 25 pts)
        active_goals_count=2,
        goals_on_track_count=2,  # 100% on track -> full 15 pts
    )

    assert result.score == 100
    assert result.band == "Strong"
    assert all(f.has_data for f in result.factors)


def test_health_score_weight_rescaling_when_goals_missing():
    """Verify Section 7.5 rule: missing factors are excluded and remaining factors rescaled to 100 basis."""
    # When active_goals_count is 0, goals factor (15 pts) has no data.
    # Remaining 4 factors total 85 pts. If all 4 are perfect, rescaled score MUST equal 100.
    result = compute_health_score(
        net_income=Decimal("50000.00"),
        needs_spent=Decimal("20000.00"),  # full 20 pts
        wants_spent=Decimal("10000.00"),  # full 15 pts
        savings_spent=Decimal("15000.00"),  # full 25 pts
        emergency_fund_saved=Decimal("100000.00"),  # full 25 pts
        active_goals_count=0,  # Missing data
        goals_on_track_count=0,
    )

    # 85/85 earned -> rescaled to 100
    assert result.score == 100
    assert result.band == "Strong"

    goals_factor = next(f for f in result.factors if f.name == "Goal Progress")
    assert goals_factor.has_data is False


def test_health_score_needs_attention_band():
    """Verify low savings, excessive wants, and no emergency fund yields Needs attention band."""
    result = compute_health_score(
        net_income=Decimal("40000.00"),
        needs_spent=Decimal("32000.00"),  # 80% (0 pts)
        wants_spent=Decimal("8000.00"),  # 20%
        savings_spent=Decimal("0.00"),  # 0% (0 pts)
        emergency_fund_saved=Decimal("0.00"),  # 0 pts
        active_goals_count=1,
        goals_on_track_count=0,  # 0 pts
    )

    assert result.score < 40
    assert result.band == "Needs attention"
