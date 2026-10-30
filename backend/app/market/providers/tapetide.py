"""Tapetide Indian Stock Market API provider (NSE & BSE)."""

from datetime import UTC, datetime
from decimal import Decimal
import logging
import httpx

from app.market.market_schemas import (
    IndexItem,
    MarketDataAttribution,
    MarketNewsItem,
    MarketOverviewResponse,
    MarketStatus,
    OHLCVPoint,
    StockFundamentalsResponse,
    StockHistoryResponse,
    StockQuoteResponse,
    StockSearchResult,
)
from app.market.providers.base import BaseMarketProvider

logger = logging.getLogger("finwise.market.tapetide")


class TapetideProvider(BaseMarketProvider):
    """Primary provider for Indian equities via Tapetide REST API."""

    name: str = "tapetide"
    BASE_URL: str = "https://api.tapetide.com"

    def __init__(self, api_key: str | None = None, timeout: int = 15):
        self.api_key = api_key.strip() if api_key and api_key.strip() else None
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return self.api_key is not None

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "User-Agent": "FinWise-AI/2.0",
        }

    def _attribution(self, limitations: list[str] | None = None) -> MarketDataAttribution:
        default_limits = [
            "NSE/BSE prices subject to ~15-min delay on free tier",
            "Free tier limited to ~50 calls/day",
        ]
        return MarketDataAttribution(
            provider="tapetide",
            timestamp=datetime.now(UTC),
            data_mode="delayed",
            is_cached=False,
            limitations=limitations or default_limits,
        )

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch Indian benchmark indices."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/market/overview", headers=self._headers())
            resp.raise_for_status()
            data = resp.json().get("data", {})

            indices: list[IndexItem] = []
            for item in data.get("indices", []):
                indices.append(
                    IndexItem(
                        symbol=item.get("symbol", ""),
                        name=item.get("name", ""),
                        current_price=Decimal(str(item.get("price", 0))),
                        change_amount=Decimal(str(item.get("change", 0))),
                        change_pct=Decimal(str(item.get("change_pct", 0))),
                        open_price=Decimal(str(item.get("open", 0))) if item.get("open") is not None else None,
                        high_price=Decimal(str(item.get("high", 0))) if item.get("high") is not None else None,
                        low_price=Decimal(str(item.get("low", 0))) if item.get("low") is not None else None,
                        previous_close=Decimal(str(item.get("prev_close", 0))) if item.get("prev_close") is not None else None,
                    )
                )

            status_dict = data.get("status", {})
            return MarketOverviewResponse(
                indices=indices,
                status=MarketStatus(
                    is_open=status_dict.get("is_open", False),
                    exchange="NSE/BSE",
                    trading_session=status_dict.get("session", "Regular Trading"),
                    message=status_dict.get("message", "Market session active"),
                ),
                attribution=self._attribution(),
            )

    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search NSE/BSE listed equities."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                f"{self.BASE_URL}/stocks/search",
                params={"q": query},
                headers=self._headers(),
            )
            resp.raise_for_status()
            items = resp.json().get("data", [])
            return [
                StockSearchResult(
                    symbol=item.get("symbol", ""),
                    name=item.get("name", item.get("symbol", "")),
                    exchange=item.get("exchange", "NSE"),
                    instrument_type=item.get("type", "Stock"),
                )
                for item in items
            ]

    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Fetch quote for an NSE/BSE stock."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/stocks/{sym}/quote", headers=self._headers())
            resp.raise_for_status()
            d = resp.json().get("data", {})

            return StockQuoteResponse(
                symbol=d.get("symbol", sym),
                company_name=d.get("company_name", d.get("name", sym)),
                exchange=d.get("exchange", "NSE"),
                current_price=Decimal(str(d.get("price", 0))),
                change_amount=Decimal(str(d.get("change", 0))),
                change_pct=Decimal(str(d.get("change_pct", 0))),
                open_price=Decimal(str(d.get("open", 0))) if d.get("open") is not None else None,
                high_price=Decimal(str(d.get("high", 0))) if d.get("high") is not None else None,
                low_price=Decimal(str(d.get("low", 0))) if d.get("low") is not None else None,
                previous_close=Decimal(str(d.get("prev_close", 0))) if d.get("prev_close") is not None else None,
                volume=int(d.get("volume", 0)) if d.get("volume") is not None else None,
                week_52_high=Decimal(str(d.get("52_week_high", 0))) if d.get("52_week_high") is not None else None,
                week_52_low=Decimal(str(d.get("52_week_low", 0))) if d.get("52_week_low") is not None else None,
                attribution=self._attribution(),
            )

    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Fetch historical price series."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                f"{self.BASE_URL}/stocks/{sym}/prices",
                params={"timeframe": timeframe},
                headers=self._headers(),
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            candles = data.get("candles", [])

            series = [
                OHLCVPoint(
                    timestamp=c.get("date", c.get("timestamp", "")),
                    open=Decimal(str(c.get("open", 0))),
                    high=Decimal(str(c.get("high", 0))),
                    low=Decimal(str(c.get("low", 0))),
                    close=Decimal(str(c.get("close", 0))),
                    volume=int(c.get("volume", 0)),
                )
                for c in candles
            ]

            return StockHistoryResponse(
                symbol=sym,
                company_name=data.get("company_name", sym),
                timeframe=timeframe,
                series=series,
                attribution=self._attribution(),
            )

    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Fetch verified fundamental financial statements and ratios."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/stocks/{sym}/fundamentals", headers=self._headers())
            resp.raise_for_status()
            d = resp.json().get("data", {})

            def _dec(key: str) -> Decimal | None:
                val = d.get(key)
                return Decimal(str(val)) if val is not None else None

            return StockFundamentalsResponse(
                symbol=sym,
                company_name=d.get("company_name", sym),
                sector=d.get("sector"),
                industry=d.get("industry"),
                market_cap_cr=_dec("market_cap_cr") or _dec("market_cap"),
                pe_ratio=_dec("pe_ttm") or _dec("pe_ratio"),
                pb_ratio=_dec("pb_ratio"),
                eps=_dec("eps_ttm") or _dec("eps"),
                debt_to_equity=_dec("debt_to_equity"),
                roe_pct=_dec("roe") or _dec("roe_pct"),
                dividend_yield_pct=_dec("dividend_yield"),
                revenue_annual_cr=_dec("revenue_cr"),
                net_profit_annual_cr=_dec("net_profit_cr"),
                summary_profile=d.get("summary_profile") or d.get("about"),
                attribution=self._attribution(),
            )

    async def get_market_news(self, symbol: str | None = None) -> list[MarketNewsItem]:
        """Fetch financial news from Tapetide if available."""
        if not self.is_configured:
            raise ValueError("Tapetide API key is not configured.")

        params = {}
        if symbol:
            params["symbol"] = symbol.upper()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/news", params=params, headers=self._headers())
            resp.raise_for_status()
            items = resp.json().get("data", [])

            news_list: list[MarketNewsItem] = []
            for item in items:
                pub_date = item.get("published_at")
                dt = datetime.fromisoformat(pub_date) if pub_date else datetime.now(UTC)
                news_list.append(
                    MarketNewsItem(
                        id=str(item.get("id", item.get("title", ""))),
                        title=item.get("title", "Market Update"),
                        summary=item.get("summary", ""),
                        url=item.get("url"),
                        source=item.get("source", "Tapetide Feed"),
                        published_at=dt,
                        related_symbols=item.get("symbols", [symbol] if symbol else []),
                        ai_takeaway=item.get("takeaway"),
                    )
                )
            return news_list
