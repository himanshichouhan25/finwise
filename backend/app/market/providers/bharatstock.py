"""BharatStock Indian Stock Market API provider (NSE & BSE)."""

import logging
from datetime import UTC, datetime
from decimal import Decimal

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

logger = logging.getLogger("finwise.market.bharatstock")


class BharatStockProvider(BaseMarketProvider):
    """Secondary provider for Indian stock market and EOD fundamentals via BharatStock."""

    name: str = "bharatstock"
    BASE_URL: str = "https://bharatstockapi.com/v1"

    def __init__(self, api_key: str | None = None, timeout: int = 15):
        self.api_key = api_key.strip() if api_key and api_key.strip() else None
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return self.api_key is not None

    def _headers(self) -> dict[str, str]:
        return {
            "X-API-Key": self.api_key or "",
            "Accept": "application/json",
            "User-Agent": "FinWise-AI/2.0",
        }

    def _attribution(self, limitations: list[str] | None = None) -> MarketDataAttribution:
        default_limits = [
            "BharatStock EOD (End of Day) pricing model",
            "Data refreshed after market close",
        ]
        return MarketDataAttribution(
            provider="bharatstock",
            timestamp=datetime.now(UTC),
            data_mode="end_of_day",
            is_cached=False,
            limitations=limitations or default_limits,
        )

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch index levels from BharatStock."""
        if not self.is_configured:
            raise ValueError("BharatStock API key is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/market/indices", headers=self._headers())
            resp.raise_for_status()
            data = resp.json()

            items = data.get("indices", data if isinstance(data, list) else [])
            indices: list[IndexItem] = []
            for item in items:
                indices.append(
                    IndexItem(
                        symbol=item.get("symbol", ""),
                        name=item.get("name", item.get("symbol", "")),
                        current_price=Decimal(str(item.get("close", item.get("price", 0)))),
                        change_amount=Decimal(str(item.get("change", 0))),
                        change_pct=Decimal(str(item.get("change_pct", 0))),
                        open_price=Decimal(str(item.get("open", 0))) if item.get("open") is not None else None,
                        high_price=Decimal(str(item.get("high", 0))) if item.get("high") is not None else None,
                        low_price=Decimal(str(item.get("low", 0))) if item.get("low") is not None else None,
                        previous_close=Decimal(str(item.get("prev_close", 0))) if item.get("prev_close") is not None else None,
                    )
                )

            return MarketOverviewResponse(
                indices=indices,
                status=MarketStatus(
                    is_open=False,
                    exchange="NSE/BSE",
                    trading_session="End-of-Day Snapshot",
                    message="BharatStock EOD feed active",
                ),
                attribution=self._attribution(),
            )

    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search Indian companies on BharatStock."""
        if not self.is_configured:
            raise ValueError("BharatStock API key is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                f"{self.BASE_URL}/stocks/search",
                params={"q": query},
                headers=self._headers(),
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            return [
                StockSearchResult(
                    symbol=item.get("symbol", item.get("ticker", "")),
                    name=item.get("company_name", item.get("name", "")),
                    exchange=item.get("exchange", "NSE"),
                    instrument_type="Stock",
                )
                for item in results
            ]

    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Fetch quote from BharatStock."""
        if not self.is_configured:
            raise ValueError("BharatStock API key is not configured.")

        ticker = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/stocks/{ticker}/prices", headers=self._headers())
            resp.raise_for_status()
            prices = resp.json()

            if not prices:
                raise ValueError(f"Empty price data returned by BharatStock for {ticker}")

            latest = prices[-1] if isinstance(prices, list) and prices else prices.get("latest", {})
            close_price = Decimal(str(latest.get("close", latest.get("price", 0))))
            if close_price <= Decimal("0"):
                raise ValueError(f"Invalid non-positive quote price ({close_price}) returned by BharatStock for {ticker}")

            prev_price = Decimal(str(latest.get("prev_close", latest.get("open", close_price))))
            diff = close_price - prev_price
            pct = (diff / prev_price * 100) if prev_price > 0 else Decimal("0.00")

            return StockQuoteResponse(
                symbol=ticker,
                company_name=ticker,
                exchange="NSE",
                current_price=close_price,
                change_amount=diff,
                change_pct=pct,
                open_price=Decimal(str(latest.get("open", 0))) if latest.get("open") is not None else None,
                high_price=Decimal(str(latest.get("high", 0))) if latest.get("high") is not None else None,
                low_price=Decimal(str(latest.get("low", 0))) if latest.get("low") is not None else None,
                previous_close=prev_price,
                volume=int(latest.get("volume", 0)) if latest.get("volume") is not None else None,
                attribution=self._attribution(),
            )

    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Fetch EOD price history candles."""
        if not self.is_configured:
            raise ValueError("BharatStock API key is not configured.")

        ticker = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.BASE_URL}/stocks/{ticker}/prices", headers=self._headers())
            resp.raise_for_status()
            candles = resp.json()
            if not isinstance(candles, list):
                candles = candles.get("prices", [])

            if not candles:
                raise ValueError(f"Empty candle series returned by BharatStock for {ticker}")

            series = [
                OHLCVPoint(
                    timestamp=c.get("date", c.get("trade_date", "")),
                    open=Decimal(str(c.get("open", 0))),
                    high=Decimal(str(c.get("high", 0))),
                    low=Decimal(str(c.get("low", 0))),
                    close=Decimal(str(c.get("close", 0))),
                    volume=int(c.get("volume", 0)),
                )
                for c in candles
            ]

            return StockHistoryResponse(
                symbol=ticker,
                company_name=ticker,
                timeframe=timeframe,
                series=series,
                attribution=self._attribution(),
            )

    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Fetch company fundamentals via BharatStock screener/ratios."""
        if not self.is_configured:
            raise ValueError("BharatStock API key is not configured.")

        ticker = symbol.upper().replace(".NS", "").replace(".BO", "")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                f"{self.BASE_URL}/screener",
                params={"ticker": ticker},
                headers=self._headers(),
            )
            resp.raise_for_status()
            data = resp.json()
            d = data[0] if isinstance(data, list) and data else data
            if not d:
                raise ValueError(f"Empty fundamentals returned by BharatStock for {ticker}")

            def _dec(key: str) -> Decimal | None:
                val = d.get(key)
                return Decimal(str(val)) if val is not None else None

            pe_val = _dec("pe_ratio") or _dec("pe")
            if pe_val is None:
                raise ValueError(f"Incomplete ratios (missing PE) from BharatStock for {ticker}")

            return StockFundamentalsResponse(
                symbol=ticker,
                company_name=d.get("company_name", ticker),
                sector=d.get("sector"),
                industry=d.get("industry"),
                market_cap_cr=_dec("market_cap_cr") or _dec("market_cap"),
                pe_ratio=_dec("pe_ratio") or _dec("pe"),
                pb_ratio=_dec("pb_ratio") or _dec("pb"),
                eps=_dec("eps"),
                debt_to_equity=_dec("debt_to_equity"),
                roe_pct=_dec("roe"),
                dividend_yield_pct=_dec("dividend_yield"),
                revenue_annual_cr=_dec("revenue"),
                net_profit_annual_cr=_dec("net_profit"),
                summary_profile=d.get("description"),
                attribution=self._attribution(),
            )

    async def get_market_news(self, symbol: str | None = None) -> list[MarketNewsItem]:
        """BharatStock free tier does not natively host a general news feed."""
        logger.info("BharatStock does not provide general market news feed; delegating to news provider.")
        return []
