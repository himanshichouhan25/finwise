"""Unit tests for Claim Math engine and Red Flags detector."""

from decimal import Decimal

from app.engine.claim_math import (
    annualize_periodic_return,
    calculate_cagr,
    evaluate_claim_math,
)
from app.engine.red_flags import detect_red_flags


def test_calculate_cagr_reference_vector():
    """Verify CAGR calculation across multiple compounding periods."""
    # Doubling in 1 year: (200/100)^(1/1) - 1 = 100%
    cagr_1yr = calculate_cagr(Decimal("100.00"), Decimal("200.00"), Decimal("1.0"))
    assert cagr_1yr == Decimal("100.00")

    # Doubling in 3 years: (200/100)^(1/3) - 1 = 25.99%
    cagr_3yr = calculate_cagr(Decimal("100.00"), Decimal("200.00"), Decimal("3.0"))
    assert cagr_3yr == Decimal("25.99")

    # Zero or invalid amounts guard
    assert calculate_cagr(Decimal("0.00"), Decimal("100.00"), Decimal("1.0")) == Decimal("0.00")


def test_annualize_periodic_return():
    """Verify monthly compounding annualization (e.g. 20% monthly claim)."""
    # 20% per month = (1.20)^12 - 1 = 791.61%
    annualized_monthly = annualize_periodic_return(Decimal("20.0"), 12)
    assert annualized_monthly == Decimal("791.61")

    # 1% per month = (1.01)^12 - 1 = 12.68% (close to equity benchmark)
    annualized_conservative = annualize_periodic_return(Decimal("1.0"), 12)
    assert annualized_conservative == Decimal("12.68")


def test_evaluate_claim_math_risk_bands():
    """Verify risk classification and SEBI violation alerts."""
    # 1. Realistic claim (10% over 1 year)
    res_realistic = evaluate_claim_math(
        initial_amount=Decimal("10000.00"),
        claimed_amount=Decimal("11000.00"),
        timeframe_months=Decimal("12.0"),
    )
    assert res_realistic.risk_level == "medium"
    assert res_realistic.annualized_cagr_pct == Decimal("10.00")

    # 2. Outrageous claim (Turn 10k into 1 Crore in 3 years)
    res_scam = evaluate_claim_math(
        initial_amount=Decimal("10000.00"),
        claimed_amount=Decimal("10000000.00"),
        timeframe_months=Decimal("36.0"),
    )
    assert res_scam.risk_level == "extreme"
    assert res_scam.annualized_cagr_pct > Decimal("800.0")
    assert "Ponzi" in res_scam.verdict or "absurd" in res_scam.verdict

    # 3. Guaranteed claim above FD rate (Guaranteed 15%)
    res_guaranteed = evaluate_claim_math(
        initial_amount=None,
        claimed_amount=None,
        timeframe_months=Decimal("12.0"),
        claimed_return_pct=Decimal("15.0"),
        is_guaranteed=True,
    )
    assert res_guaranteed.risk_level == "extreme"
    assert "SEBI VIOLATION" in res_guaranteed.verdict


def test_red_flags_detector_scans_scam_tactics():
    """Verify red flags engine identifies FOMO, Telegram channels, and guaranteed promises."""
    scam_text = "Join our exclusive Telegram VIP channel for 100% pakka guaranteed returns! Limited slots, DM fast!"
    flags = detect_red_flags(scam_text, annualized_cagr_pct=Decimal("80.0"), is_guaranteed=True)

    flag_codes = [f.code for f in flags]
    assert "GUARANTEED_HIGH_RETURNS" in flag_codes
    assert "URGENCY_FOMO_TACTICS" in flag_codes
    assert "UNREGULATED_TIPPING_CHANNELS" in flag_codes
    assert "ASTRONOMICAL_CAGR" in flag_codes
