"""Unit and API integration tests for Market Intelligence, caching, failover, and watchlists."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.market.market_cache import MarketDataCache
from app.market.providers import DemoFallbackProvider, TapetideProvider
from app.models.user import User


@pytest.fixture
def market_test_user(db_session: Session) -> User:
    """Ensure baseline user exists for watchlist tests."""
    user = db_session.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Test Trader", persona="first_job", language_pref="en")
        db_session.add(user)
        db_session.commit()
    return user


def test_market_overview_endpoint(client: TestClient):
    """Verify market overview returns benchmark indices with attribution."""
    res = client.get("/api/v1/market/overview")
    assert res.status_code == 200
    data = res.json()
    assert "indices" in data
    assert "status" in data
    assert "attribution" in data

    symbols = [idx["symbol"] for idx in data["indices"]]
    assert "^NSEI" in symbols
    assert "^BSESN" in symbols

    attr = data["attribution"]
    assert "provider" in attr
    assert "data_mode" in attr
    assert attr["data_mode"] in ["real_time", "delayed", "end_of_day", "demo"]


def test_stock_search_endpoint(client: TestClient):
    """Verify stock search by symbol or company name."""
    res = client.get("/api/v1/market/search", params={"q": "TCS"})
    assert res.status_code == 200
    results = res.json()
    assert isinstance(results, list)
    assert any(r["symbol"] == "TCS" for r in results)


def test_stock_quote_endpoint(client: TestClient):
    """Verify stock quote retrieves prices, day movements, and attribution."""
    res = client.get("/api/v1/market/stocks/RELIANCE/quote")
    assert res.status_code == 200
    quote = res.json()
    assert quote["symbol"] == "RELIANCE"
    assert Decimal(str(quote["current_price"])) > Decimal("0")
    assert "attribution" in quote
    assert quote["attribution"]["provider"] in ["tapetide", "bharatstock", "alphavantage", "demo_fallback"]


def test_stock_history_endpoint(client: TestClient):
    """Verify historical OHLCV candle series for charting."""
    res = client.get("/api/v1/market/stocks/INFY/history", params={"timeframe": "1M"})
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "INFY"
    assert "series" in data
    assert len(data["series"]) >= 20

    first_point = data["series"][0]
    assert "open" in first_point
    assert "close" in first_point
    assert "high" in first_point
    assert "low" in first_point
    assert "timestamp" in first_point


def test_stock_fundamentals_endpoint(client: TestClient):
    """Verify stock fundamentals return financial ratios without fake zeroes."""
    res = client.get("/api/v1/market/stocks/HDFCBANK/fundamentals")
    assert res.status_code == 200
    fund = res.json()
    assert fund["symbol"] == "HDFCBANK"
    assert fund["pe_ratio"] is not None
    assert fund["debt_to_equity"] is not None
    assert "attribution" in fund


def test_market_news_endpoint(client: TestClient):
    """Verify market news headlines and AI takeaway."""
    res = client.get("/api/v1/market/news")
    assert res.status_code == 200
    news = res.json()
    assert "items" in news
    assert len(news["items"]) > 0
    item = news["items"][0]
    assert "title" in item
    assert "source" in item
    assert "published_at" in item


def test_stock_ai_analysis_endpoint(client: TestClient):
    """Verify educational AI analysis with Groq/deterministic fallback and SEBI guardrail."""
    res = client.post("/api/v1/market/stocks/TATAMOTORS/ai-analyze")
    assert res.status_code == 200
    analysis = res.json()
    assert analysis["symbol"] == "TATAMOTORS"
    assert "summary_explanation" in analysis
    assert len(analysis["pros"]) > 0
    assert len(analysis["risks"]) > 0
    assert "sebi_disclaimer" in analysis
    assert "SEBI" in analysis["sebi_disclaimer"]


def test_watchlist_crud_lifecycle(client: TestClient, market_test_user: User):
    """Verify full user-specific watchlist lifecycle."""
    headers = {"X-User-Id": str(market_test_user.id)}

    # 1. Add stock
    add_res = client.post(
        "/api/v1/market/watchlist",
        headers=headers,
        json={
            "symbol": "ICICIBANK",
            "company_name": "ICICI Bank Ltd",
            "exchange": "NSE",
            "notes": "Banking sector core holding",
        },
    )
    assert add_res.status_code == 201
    item = add_res.json()
    assert item["symbol"] == "ICICIBANK"

    # 2. Get watchlist
    list_res = client.get("/api/v1/market/watchlist", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["symbol"] == "ICICIBANK" for i in items)

    # 3. Delete stock
    del_res = client.delete("/api/v1/market/watchlist/ICICIBANK", headers=headers)
    assert del_res.status_code == 204

    # 4. Verify removal
    list_res_after = client.get("/api/v1/market/watchlist", headers=headers)
    assert not any(i["symbol"] == "ICICIBANK" for i in list_res_after.json())


def test_market_cache_hit_and_miss():
    """Verify thread-safe in-memory cache behavior."""
    cache = MarketDataCache(default_ttl=5)
    cache.clear()

    # Miss
    assert cache.get("test_key") is None
    stats = cache.stats()
    assert stats["misses"] == 1
    assert stats["hits"] == 0

    # Set and Hit
    cache.set("test_key", {"price": 100})
    val = cache.get("test_key")
    assert val == {"price": 100}
    stats = cache.stats()
    assert stats["hits"] == 1


def test_tapetide_unconfigured_error():
    """Verify Tapetide throws clean error when API key is missing."""
    p = TapetideProvider(api_key=None)
    assert not p.is_configured
    with pytest.raises(ValueError, match="API key is not configured"):
        import asyncio

        asyncio.run(p.get_market_overview())


def test_demo_fallback_provider():
    """Verify DemoFallbackProvider outputs transparently labeled demo data."""
    p = DemoFallbackProvider()
    assert p.is_configured
    import asyncio

    overview = asyncio.run(p.get_market_overview())
    assert overview.attribution.data_mode == "demo"
    assert overview.attribution.provider == "demo_fallback"
