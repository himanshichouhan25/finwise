"""Tests for FinWise AI Coach, client key rotation, tool calling, and guardrails."""

from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from groq import RateLimitError
from sqlalchemy.orm import Session

from app.ai.client import AIResponse, AIToolCall, GroqLLMClient
from app.ai.guardrails import sanitize_ai_response
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Ensure baseline user exists in test SQLite database."""
    user = db_session.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Test Investor", persona="first_job", language_pref="en")
        db_session.add(user)
        db_session.commit()
    return user


def test_ai_coach_offline_graceful_degradation(client: TestClient, test_user: User):
    """When no Groq API key is configured, chat endpoint returns HTTP 503 AI_UNAVAILABLE."""
    with patch("app.services.coach_service.get_llm_client") as mock_get_client:
        mock_client = GroqLLMClient(keys=[])
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/v1/coach/chat",
            json={"message": "How do I start investing?"},
            headers={"X-User-Id": str(test_user.id)},
        )

        assert response.status_code == 503
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "AI_UNAVAILABLE"


def test_ai_coach_mocked_completion_and_persistence(client: TestClient, test_user: User, db_session: Session):
    """Verify end-to-end conversation flow, guardrail disclaimer, and DB persistence."""
    mock_ai_resp = AIResponse(
        content="Great question! Starting with a 50/30/20 budget and a 3-month emergency fund is best.",
        tool_calls=[],
        model_used="llama-3.3-70b-versatile",
    )

    with patch("app.services.coach_service.get_llm_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.complete.return_value = mock_ai_resp
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/v1/coach/chat",
            json={"message": "Can you advise me on saving?"},
            headers={"X-User-Id": str(test_user.id)},
        )

        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        session_id = data["session_id"]
        assert data["model_used"] == "llama-3.3-70b-versatile"
        assert "50/30/20" in data["message"]["content"]
        assert "Disclaimer" in data["message"]["content"]

        # Check DB persistence
        session_rec = db_session.query(ChatSession).filter(ChatSession.id == session_id).first()
        assert session_rec is not None
        messages = db_session.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
        assert len(messages) == 2  # user + assistant


def test_ai_coach_multi_round_tool_calling(client: TestClient, test_user: User):
    """Verify multi-round tool calling loop executes deterministic SIP calculator."""
    round1_resp = AIResponse(
        content=None,
        tool_calls=[
            AIToolCall(
                id="call_sip_1",
                name="project_sip",
                arguments={
                    "monthly_investment": 5000,
                    "annual_return_pct": 12,
                    "tenure_years": 10,
                },
            )
        ],
        model_used="llama-3.3-70b-versatile",
    )
    round2_resp = AIResponse(
        content="Investing ₹5,000 monthly at 12% for 10 years will grow your wealth to approximately ₹11.6 Lakhs!",
        tool_calls=[],
        model_used="llama-3.3-70b-versatile",
    )

    with patch("app.services.coach_service.get_llm_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.complete.side_effect = [round1_resp, round2_resp]
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/v1/coach/chat",
            json={"message": "How much will 5000 per month become in 10 years at 12%?"},
            headers={"X-User-Id": str(test_user.id)},
        )

        assert response.status_code == 200
        data = response.json()
        assert mock_client.complete.call_count == 2
        assert "11.6 Lakhs" in data["message"]["content"]
        assert data["message"]["tools_used"] is not None
        assert data["message"]["tools_used"][0]["name"] == "project_sip"


def test_guardrails_sebi_compliance_block():
    """Verify guardrails sanitize prohibited stock tipping and attach disclaimer."""
    speculative_text = "You should definitely buy shares of XYZ and double your money in 30 days!"
    sanitized = sanitize_ai_response(speculative_text)

    assert "Note from FinWise: As a SEBI-compliant educational coach" in sanitized
    assert "Disclaimer: I am an AI financial coach" in sanitized


def test_ai_coach_sessions_endpoints(client: TestClient, test_user: User, db_session: Session):
    """Verify session summary list and full history retrieval endpoints."""
    session = ChatSession(user_id=test_user.id, title="Test Savings Plan")
    db_session.add(session)
    db_session.commit()

    msg1 = ChatMessage(session_id=session.id, role="user", content="Hello Coach")
    msg2 = ChatMessage(session_id=session.id, role="assistant", content="Hello! How can I help you save today?")
    db_session.add_all([msg1, msg2])
    db_session.commit()

    # List sessions
    list_resp = client.get("/api/v1/coach/sessions", headers={"X-User-Id": str(test_user.id)})
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    assert any(s["id"] == session.id for s in sessions)

    # Get session detail
    detail_resp = client.get(f"/api/v1/coach/sessions/{session.id}", headers={"X-User-Id": str(test_user.id)})
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["title"] == "Test Savings Plan"
    assert len(detail["messages"]) == 2
    assert detail["messages"][0]["content"] == "Hello Coach"


def test_groq_key_rotation_pool_on_429():
    """Verify GroqLLMClient rotates to the next key when encountering HTTP 429."""
    keys = ["gsk_key_1", "gsk_key_2"]
    client = GroqLLMClient(keys=keys)

    # Mock Groq client
    mock_groq_1 = MagicMock()
    # Emulate RateLimitError
    dummy_req = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    dummy_resp = httpx.Response(429, request=dummy_req)
    mock_groq_1.chat.completions.create.side_effect = RateLimitError(
        message="Rate limit reached",
        response=dummy_resp,
        body={"error": {"message": "Rate limit reached"}},
    )

    mock_groq_2 = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Success from key 2"
    mock_choice.message.tool_calls = None
    mock_choice.finish_reason = "stop"
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    mock_groq_2.chat.completions.create.return_value = mock_completion

    with patch.object(client, "_get_active_client") as mock_get_active:
        mock_get_active.side_effect = [
            (mock_groq_1, "gsk_key_1", 0),
            (mock_groq_2, "gsk_key_2", 1),
        ]

        resp = client.complete(messages=[{"role": "user", "content": "Hello"}])

        assert resp.content == "Success from key 2"
        assert client._key_index == 1


def test_ai_chat_rate_limiting(client: TestClient, test_user: User):
    """Verify that exceeding 20 messages per minute triggers rate limit error."""
    from app.services.coach_service import _user_request_timestamps

    _user_request_timestamps.clear()
    mock_ai_resp = AIResponse(content="OK", tool_calls=[])

    with patch("app.services.coach_service.get_llm_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.complete.return_value = mock_ai_resp
        mock_get_client.return_value = mock_client

        # Rapidly send 20 requests
        for i in range(20):
            res = client.post(
                "/api/v1/coach/chat",
                json={"message": f"Message {i}"},
                headers={"X-User-Id": str(test_user.id)},
            )
            assert res.status_code == 200

        res_blocked = client.post(
            "/api/v1/coach/chat",
            json={"message": "Too fast message"},
            headers={"X-User-Id": str(test_user.id)},
        )
        assert res_blocked.status_code == 422
        data = res_blocked.json()
        assert "sending messages too quickly" in data["error"]["message"].lower()


def test_build_system_prompt_with_active_goals_and_profile(db_session: Session):
    """Ensure dynamic system prompt formatting works with active goals and profile."""
    from datetime import date
    from decimal import Decimal

    from app.ai.prompts import build_system_prompt
    from app.models.goal import Goal
    from app.models.profile import FinancialProfile
    from app.services.snapshot_service import build_financial_snapshot

    user = User(id=99, name="Test Goals User", persona="student", language_pref="en")
    db_session.add(user)
    db_session.flush()

    prof = FinancialProfile(
        user_id=99,
        monthly_income=Decimal("25000.00"),
        income_type="fixed",
        emergency_fund_saved=Decimal("10000.00"),
    )
    goal = Goal(
        user_id=99,
        name="MacBook Pro",
        target_amount=Decimal("120000.00"),
        current_saved=Decimal("30000.00"),
        target_date=date(2027, 1, 1),
        status="active",
    )
    db_session.add_all([prof, goal])
    db_session.commit()

    snapshot = build_financial_snapshot(db_session, user_id=99)
    prompt = build_system_prompt(snapshot=snapshot, persona_name="Aarav")

    assert "MacBook Pro" in prompt
    assert "₹120,000" in prompt
    assert "₹30,000" in prompt
    assert "Income Type: fixed" in prompt
    assert "SEBI" in prompt
