"""AI Guardrails for SEBI compliance and zero financial hallucination."""

import logging
import re

from app.ai.prompts import MANDATORY_DISCLAIMER

logger = logging.getLogger("finwise.ai.guardrails")

# Prohibited patterns that violate SEBI advisory guidelines or encourage risky speculation
BANNED_PATTERNS = [
    (r"\b(?:guaranteed|sure-shot|assured|risk-free)\s+(?:returns?|profits?|gains?)\b", "guaranteed returns"),
    (r"\b(?:buy|sell)\s+(?:shares?|stocks?|equity)\s+of\s+[A-Za-z]+\b", "individual stock tipping"),
    (r"\b(?:multibagger|jackpot|pennystock)\s+tip\b", "speculative tipping"),
    (r"\bdouble\s+your\s+money\s+in\b", "get-rich-quick claims"),
    (r"\b(?:trade|invest\s+in)\s+(?:crypto|bitcoin|futures|options|f&o)\b", "unsolicited derivatives/crypto promotion"),
]


def sanitize_ai_response(response_text: str | None) -> str:
    """Validate and sanitize AI response text to enforce regulatory compliance and disclaimer presence."""
    if not response_text or not response_text.strip():
        return (
            "I'm here to help you understand your budget, savings, and investments! "
            "Could you clarify your question or financial goal?\n\n" + MANDATORY_DISCLAIMER
        )

    text = response_text.strip()

    # Check for prohibited financial advisory phrases
    for pattern, rule_name in BANNED_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            logger.warning("Guardrail violation detected ('%s'). Sanitizing reply.", rule_name)
            warning_prefix = (
                "> *Note from FinWise: As a SEBI-compliant educational coach, I cannot provide individual stock tips, "
                "derivatives trading advice, or guaranteed return promises. Investing in broad-market index funds "
                "(such as Nifty 50) and building an emergency fund are proven long-term strategies.*\n\n"
            )
            # Remove speculative advice or prepend standard safe warning
            text = warning_prefix + text
            break

    # Ensure mandatory educational disclaimer is present
    if "disclaimer" not in text.lower():
        text = text + "\n\n" + MANDATORY_DISCLAIMER

    return text
