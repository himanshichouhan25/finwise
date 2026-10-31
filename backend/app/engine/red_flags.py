"""Rule-based finfluencer red flag scanner for detecting scams, misleading claims, and SEBI violations."""

import re
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class RedFlagItem:
    """Individual detected financial red flag."""

    code: str
    title: str
    description: str
    severity: str  # medium | high | extreme


RED_FLAG_PATTERNS = [
    (
        "GUARANTEED_HIGH_RETURNS",
        "Guaranteed / Risk-Free Returns Claim",
        "The claim promises guaranteed or zero-risk returns. SEBI regulations strictly prohibit promising guaranteed returns on market investments. Only sovereign-backed schemes (PPF, RBI Bonds) and bank FDs (up to ₹5L DICGC insurance) carry low risk.",
        "extreme",
        r"\b(?:guaranteed|assured|risk-free|zero\s*risk|100%\s*safe|pakka\s*return|no\s*loss)\b",
    ),
    (
        "URGENCY_FOMO_TACTICS",
        "Artificial Urgency / FOMO Manipulations",
        "Uses urgency tactics ('limited slots', 'secret trick', 'don't miss out') to force quick impulse investment without proper due diligence.",
        "high",
        r"\b(?:hurry|limited\s*slots?|secret\s*(?:trick|hack|loophole)|dm\s*fast|before\s*it\s*gets\s*deleted|exclusive\s*group)\b",
    ),
    (
        "UNREGULATED_TIPPING_CHANNELS",
        "Unregulated Telegram / WhatsApp VIP Channel",
        "Channel invites users to private Telegram/WhatsApp groups or VIP signal channels. These are unregistered and frequently associated with pump-and-dump operator schemes.",
        "extreme",
        r"\b(?:telegram\s*(?:channel|link|vip)|whatsapp\s*group|vip\s*signals?|premium\s*calls?|dabba\s*trading)\b",
    ),
    (
        "CRYPTO_FOREX_DOUBLING",
        "Unregulated Crypto / Forex Arbitrage Scheme",
        "Mentions trading bots, crypto doubling, or offshore forex platforms with no regulatory recourse under RBI or SEBI.",
        "high",
        r"\b(?:crypto\s*bot|forex\s*bot|double\s*your\s*crypto|arbitrage\s*bot)\b",
    ),
    (
        "UNREALISTIC_SHORT_TERM_GAIN",
        "Fast Wealth / Get-Rich-Quick Promise",
        "Promises to double or multiply money within days or weeks. Compounding takes years; overnight wealth claims are classic Ponzi indicators.",
        "extreme",
        r"\b(?:2x\s*in\s*\d+\s*(?:days?|weeks?)|double\s*in\s*\d+\s*(?:days?|weeks?|months?)|crorepati\s*in\s*\d+\s*months?)\b",
    ),
    (
        "SIGNUP_FREE_MONEY_SCAM",
        "Registration Bonus / Task Scam / Phishing Bait",
        "Promises free unearned money simply for registering, clicking links, or completing easy online tasks ('register and get ₹5,000'). Legitimate institutions never distribute free cash. This is a classic cyber-fraud advance fee bait or OTP-phishing scam.",
        "extreme",
        r"\b(?:register\s*(?:and|to)?\s*(?:get|earn|win)|sign\s*up\s*(?:and|to)?\s*(?:get|earn|bonus)|free\s*(?:money|cash|coins?|rupees?|₹)|daily\s*task|like\s*and\s*earn|work\s*from\s*home\s*earn|recharge\s*and\s*earn|bonus\s*on\s*registration)\b",
    ),
]


def detect_red_flags(
    claim_text: str,
    annualized_cagr_pct: Decimal = Decimal("0.0"),
    is_guaranteed: bool = False,
) -> list[RedFlagItem]:
    """Analyze claim text and financial metrics against SEBI compliance and scam detection rules."""
    flags: list[RedFlagItem] = []
    text_lower = claim_text.lower()

    # 1. Pattern-based text scanning
    for code, title, desc, severity, pattern in RED_FLAG_PATTERNS:
        if re.search(pattern, text_lower):
            flags.append(RedFlagItem(code=code, title=title, description=desc, severity=severity))

    # 2. Metric-based math scanning
    if is_guaranteed and not any(f.code == "GUARANTEED_HIGH_RETURNS" for f in flags):
        flags.append(
            RedFlagItem(
                code="EXPLICIT_GUARANTEE_FLAG",
                title="Explicit Return Guarantee",
                description="Any claim promising guaranteed returns on equities or trading violates SEBI regulatory guidelines.",
                severity="extreme",
            )
        )

    if annualized_cagr_pct > Decimal("50.0"):
        flags.append(
            RedFlagItem(
                code="ASTRONOMICAL_CAGR",
                title=f"Astronomical Return Rate ({annualized_cagr_pct}% p.a.)",
                description=(
                    f"An annualized return of {annualized_cagr_pct}% is mathematically unsustainable. "
                    "Even Warren Buffett achieved ~20% annually over 50 years. This claim is almost certainly fraudulent."
                ),
                severity="extreme",
            )
        )
    elif annualized_cagr_pct > Decimal("25.0"):
        flags.append(
            RedFlagItem(
                code="UNREALISTIC_CAGR",
                title=f"Unusually High Return Rate ({annualized_cagr_pct}% p.a.)",
                description=(
                    f"An annualized return of {annualized_cagr_pct}% significantly beats broad equity indices (Nifty 50 ~12-14%). "
                    "Such high returns always entail severe capital loss risk."
                ),
                severity="high",
            )
        )

    return flags
