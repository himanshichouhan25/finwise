"""Pure Python mathematical engine for investment claim analysis and CAGR benchmarking."""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

BENCHMARK_RATES = {
    "bank_fd": Decimal("7.0"),  # Safe Bank Fixed Deposit
    "ppf": Decimal("7.1"),  # Public Provident Fund (Government Guaranteed)
    "gold": Decimal("10.5"),  # Historical Indian Gold CAGR
    "nifty_50": Decimal("12.5"),  # Broad-market Indian Equities 20-yr CAGR
    "top_mutual_funds": Decimal("15.0"),  # Consistent Top-Decile Flexicap Fund CAGR
    "warren_buffett": Decimal("20.0"),  # Berkshire Hathaway 50-year benchmark
}


@dataclass(frozen=True)
class BenchmarkComparison:
    """Benchmark comparative multiple against standard asset classes."""

    benchmark_name: str
    benchmark_cagr_pct: Decimal
    multiplier_vs_benchmark: Decimal


@dataclass(frozen=True)
class ClaimMathResult:
    """Calculated financial metrics derived from a financial claim."""

    initial_amount: Decimal | None
    claimed_amount: Decimal | None
    claimed_return_pct: Decimal
    timeframe_years: Decimal
    annualized_cagr_pct: Decimal
    benchmarks: list[BenchmarkComparison]
    risk_level: str  # low | medium | high | extreme
    verdict: str
    doubling_time_years: Decimal | None
    assumptions: list[str]


def calculate_cagr(
    initial_value: Decimal,
    final_value: Decimal,
    years: Decimal,
) -> Decimal:
    """Calculate Compounded Annual Growth Rate (CAGR).

    Formula: CAGR = (final_value / initial_value) ** (1 / years) - 1
    """
    if initial_value <= Decimal("0.00") or final_value <= Decimal("0.00") or years <= Decimal("0.00"):
        return Decimal("0.00")

    ratio = float(final_value) / float(initial_value)
    exponent = 1.0 / float(years)
    cagr_float = (ratio ** exponent) - 1.0
    cagr_pct = Decimal(str(cagr_float * 100.0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return cagr_pct


def annualize_periodic_return(
    periodic_return_pct: Decimal,
    periods_per_year: int,
) -> Decimal:
    """Convert periodic returns (e.g. daily, weekly, monthly) into compounded annual return.

    Formula: Annualized = ((1 + r_periodic) ** periods_per_year - 1) * 100
    """
    if periodic_return_pct <= Decimal("-100.0"):
        return Decimal("-100.00")

    r_periodic = float(periodic_return_pct) / 100.0
    annual_multiplier = (1.0 + r_periodic) ** periods_per_year
    annualized_pct = Decimal(str((annual_multiplier - 1.0) * 100.0)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return annualized_pct


def evaluate_claim_math(
    initial_amount: Decimal | None,
    claimed_amount: Decimal | None,
    timeframe_months: Decimal | None,
    claimed_return_pct: Decimal | None = None,
    is_guaranteed: bool = False,
) -> ClaimMathResult:
    """Evaluate full mathematical implications and feasibility of a financial claim."""
    timeframe_years = Decimal("1.0")
    if timeframe_months and timeframe_months > Decimal("0.00"):
        timeframe_years = (timeframe_months / Decimal("12.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    annualized_cagr: Decimal = Decimal("0.00")

    if initial_amount and claimed_amount and initial_amount > Decimal("0.00"):
        annualized_cagr = calculate_cagr(initial_amount, claimed_amount, timeframe_years)
    elif claimed_return_pct is not None:
        if timeframe_months and timeframe_months < Decimal("12.0") and timeframe_months > Decimal("0.00"):
            # Annualize sub-yearly rate
            periods_per_year = int(Decimal("12.0") / timeframe_months)
            annualized_cagr = annualize_periodic_return(claimed_return_pct, periods_per_year)
        else:
            annualized_cagr = (claimed_return_pct / timeframe_years).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

    # Calculate comparative multiples vs benchmarks
    benchmarks: list[BenchmarkComparison] = []
    for b_key, b_rate in BENCHMARK_RATES.items():
        multiplier = (
            (annualized_cagr / b_rate).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
            if b_rate > Decimal("0.00")
            else Decimal("0.0")
        )
        benchmarks.append(
            BenchmarkComparison(
                benchmark_name=b_key,
                benchmark_cagr_pct=b_rate,
                multiplier_vs_benchmark=multiplier,
            )
        )

    # Rule of 72 for doubling time
    doubling_time: Decimal | None = None
    if annualized_cagr > Decimal("0.00"):
        doubling_time = (Decimal("72.0") / annualized_cagr).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    # Risk evaluation
    if annualized_cagr <= Decimal("8.0"):
        risk_level = "low"
        verdict = "Realistic and aligns with fixed income, FD, or debt mutual fund returns."
    elif annualized_cagr <= Decimal("15.0"):
        risk_level = "medium"
        verdict = "Achievable long-term through diversified equity index funds (Nifty 50), but subject to market volatility."
    elif annualized_cagr <= Decimal("25.0"):
        risk_level = "high"
        verdict = "Extremely high and beats the world's best fund managers. High capital risk and volatility."
    else:
        risk_level = "extreme"
        verdict = (
            f"Mathematically absurd ({annualized_cagr}% annualized). Exceeds Warren Buffett's 50-year track record (20%). "
            "Extremely high probability of a Ponzi scheme, pump-and-dump, or fraudulent scam."
        )

    if is_guaranteed and annualized_cagr > Decimal("8.0"):
        risk_level = "extreme"
        verdict = (
            f"SEBI VIOLATION & SCAM ALERT: No legitimate market instrument guarantees returns above bank FD (~7%). "
            f"Claiming guaranteed {annualized_cagr}% is an immediate red flag."
        )

    assumptions = [
        "CAGR is compounded annually and ignores taxes and transaction slippage.",
        "Nifty 50 long-term benchmark is assumed at 12.5% p.a. based on historical indices.",
        "Any promised return above bank FD (>7%) carrying a 'guarantee' violates SEBI advisor regulations.",
    ]

    return ClaimMathResult(
        initial_amount=initial_amount,
        claimed_amount=claimed_amount,
        claimed_return_pct=claimed_return_pct or annualized_cagr,
        timeframe_years=timeframe_years,
        annualized_cagr_pct=annualized_cagr,
        benchmarks=benchmarks,
        risk_level=risk_level,
        verdict=verdict,
        doubling_time_years=doubling_time,
        assumptions=assumptions,
    )
