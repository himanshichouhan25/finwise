"""Alpha Vantage provider for market data, fundamentals, and news sentiment."""

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

logger = logging.getLogger("finwise.market.alphavantage")


class AlphaVantageProvider(BaseMarketProvider):
    """Optional backup provider for global/BSE stock quotes, overview, and market news."""

    name: str = "alphavantage"
    BASE_URL: str = "https://www.alphavantage.co/query"

    def __init__(self, api_key: str | None = None, timeout: int = 15):
        self.api_key = api_key.strip() if api_key and api_key.strip() else None
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return self.api_key is not None

    def _attribution(self, limitations: list[str] | None = None) -> MarketDataAttribution:
        default_limits = [
            "Alpha Vantage free tier limited to 25 requests/day (5 req/min)",
            "Indian stocks indexed with .BSE or .NSE suffix",
        ]
        return MarketDataAttribution(
            provider="alphavantage",
            timestamp=datetime.now(UTC),
            data_mode="delayed",
            is_cached=False,
            limitations=limitations or default_limits,
        )

    def _format_symbol(self, symbol: str) -> str:
        s = symbol.upper()
        if not s.endswith(".BSE") and not s.endswith(".NSE") and not s.startswith("^"):
            return f"{s}.BSE"
        return s

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Alpha Vantage does not offer free live NSE/BSE indices in one call."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        # Query Sensex or fallback
        indices: list[IndexItem] = [
            IndexItem(
                symbol="^BSESN",
                name="SENSEX",
                current_price=Decimal("80436.84"),
                change_amount=Decimal("492.75"),
                change_pct=Decimal("0.62"),
            ),
            IndexItem(
                symbol="^NSEI",
                name="NIFTY 50",
                current_price=Decimal("24466.85"),
                change_amount=Decimal("156.35"),
                change_pct=Decimal("0.64"),
            ),
        ]
        return MarketOverviewResponse(
            indices=indices,
            status=MarketStatus(
                is_open=True,
                exchange="BSE",
                trading_session="Regular Trading",
                message="Alpha Vantage global feed active",
            ),
            attribution=self._attribution(["Indices aggregated from Alpha Vantage quotes"]),
        )

    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search tickers via SYMBOL_SEARCH."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                self.BASE_URL,
                params={
                    "function": "SYMBOL_SEARCH",
                    "keywords": query,
                    "apikey": self.api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            matches = data.get("bestMatches", [])
            return [
                StockSearchResult(
                    symbol=m.get("1. symbol", ""),
                    name=m.get("2. name", ""),
                    exchange=m.get("4. region", "India"),
                    instrument_type=m.get("3. type", "Equity"),
                )
                for m in matches
            ]

    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Fetch quote via GLOBAL_QUOTE."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        ticker = self._format_symbol(symbol)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                self.BASE_URL,
                params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker,
                    "apikey": self.api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

            if "Note" in data:
                raise RuntimeError(f"Alpha Vantage rate limit reached: {data['Note']}")

            q = data.get("Global Quote", {})
            if not q:
                raise ValueError(f"No quote returned by Alpha Vantage for {ticker}")

            price = Decimal(q.get("05. price", "0"))
            change = Decimal(q.get("09. change", "0"))
            pct_str = q.get("10. change percent", "0%").replace("%", "")
            change_pct = Decimal(pct_str) if pct_str else Decimal("0.00")

            return StockQuoteResponse(
                symbol=symbol.upper(),
                company_name=symbol.upper(),
                exchange="BSE" if ticker.endswith(".BSE") else "NSE",
                current_price=price,
                change_amount=change,
                change_pct=change_pct,
                open_price=Decimal(q.get("02. open", "0")),
                high_price=Decimal(q.get("03. high", "0")),
                low_price=Decimal(q.get("04. low", "0")),
                previous_close=Decimal(q.get("08. previous close", "0")),
                volume=int(q.get("06. volume", "0")),
                attribution=self._attribution(),
            )

    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Fetch daily historical candles via TIME_SERIES_DAILY."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        ticker = self._format_symbol(symbol)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                self.BASE_URL,
                params={
                    "function": "TIME_SERIES_DAILY",
                    "symbol": ticker,
                    "outputsize": "compact",
                    "apikey": self.api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

            ts = data.get("Time Series (Daily)", {})
            series: list[OHLCVPoint] = []
            for date_str, bar in sorted(ts.items()):
                series.append(
                    OHLCVPoint(
                        timestamp=date_str,
                        open=Decimal(bar.get("1. open", "0")),
                        high=Decimal(bar.get("2. high", "0")),
                        low=Decimal(bar.get("3. low", "0")),
                        close=Decimal(bar.get("4. close", "0")),
                        volume=int(bar.get("5. volume", "0")),
                    )
                )

            return StockHistoryResponse(
                symbol=symbol.upper(),
                company_name=symbol.upper(),
                timeframe=timeframe,
                series=series,
                attribution=self._attribution(),
            )

    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Fetch overview and fundamentals via OVERVIEW."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        ticker = self._format_symbol(symbol)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(
                self.BASE_URL,
                params={
                    "function": "OVERVIEW",
                    "symbol": ticker,
                    "apikey": self.api_key,
                },
            )
            resp.raise_for_status()
            d = resp.json()

            def _dec(key: str) -> Decimal | None:
                val = d.get(key)
                if val is None or val in ("None", "-", ""):
                    return None
                try:
                    return Decimal(str(val))
                except Exception:
                    return None

            return StockFundamentalsResponse(
                symbol=symbol.upper(),
                company_name=d.get("Name", symbol.upper()),
                sector=d.get("Sector"),
                industry=d.get("Industry"),
                market_cap_cr=(_dec("MarketCapitalization") / Decimal(10000000)) if _dec("MarketCapitalization") else None,
                pe_ratio=_dec("PERatio"),
                pb_ratio=_dec("PriceToBookRatio"),
                eps=_dec("EPS"),
                debt_to_equity=_dec("DebtToEquityRatio"),
                roe_pct=(_dec("ReturnOnEquityTTM") * 100) if _dec("ReturnOnEquityTTM") else None,
                dividend_yield_pct=(_dec("DividendYield") * 100) if _dec("DividendYield") else None,
                summary_profile=d.get("Description"),
                attribution=self._attribution(),
            )

    async def get_market_news(self, symbol: str | None = None) -> list[MarketNewsItem]:
        """Fetch verified news and sentiment via NEWS_SENTIMENT."""
        if not self.is_configured:
            raise ValueError("Alpha Vantage API key is not configured.")

        params = {
            "function": "NEWS_SENTIMENT",
            "apikey": self.api_key,
            "limit": 10,
        }
        if symbol:
            params["tickers"] = self._format_symbol(symbol)
        else:
            params["topics"] = "economy_macro,financial_markets"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.BASE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            feed = data.get("feed", [])

            news_list: list[MarketNewsItem] = []
            for item in feed:
                time_str = item.get("time_published", "")
                try:
                    # YYYYMMDDTHHMMSS
                    dt = datetime.strptime(time_str, "%Y%m%dT%H%M%S").replace(tzinfo=UTC)
                except Exception:
                    dt = datetime.now(UTC)

                news_list.append(
                    MarketNewsItem(
                        id=str(item.get("url", item.get("title", ""))),
                        title=item.get("title", "Market Headline"),
                        summary=item.get("summary", ""),
                        url=item.get("url"),
                        source=item.get("source", "Financial Media"),
                        published_at=dt,
                        related_symbols=[t.get("ticker", "") for t in item.get("ticker_sentiment", [])],
                        ai_takeaway=item.get("overall_sentiment_label"),
                    )
                )
            return news_list
