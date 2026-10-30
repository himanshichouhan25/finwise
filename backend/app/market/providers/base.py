"""Abstract base class for all Market Intelligence data providers."""

from abc import ABC, abstractmethod

from app.market.market_schemas import (
    MarketNewsItem,
    MarketOverviewResponse,
    StockFundamentalsResponse,
    StockHistoryResponse,
    StockQuoteResponse,
    StockSearchResult,
)


class BaseMarketProvider(ABC):
    """Abstract interface defining required capabilities for market providers."""

    name: str = "base"

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if required API credentials exist for this provider."""
        pass

    @abstractmethod
    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch status and current values for major Indian benchmark indices (Nifty, Sensex)."""
        pass

    @abstractmethod
    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search Indian listed equities by company name or ticker symbol."""
        pass

    @abstractmethod
    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Retrieve latest available quote, day price change, and volume for a symbol."""
        pass

    @abstractmethod
    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Retrieve historical OHLCV candles for charting over the requested timeframe."""
        pass

    @abstractmethod
    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Retrieve key financial ratios, EPS, P/E, debt, and company profile."""
        pass

    @abstractmethod
    async def get_market_news(self, symbol: str | None = None) -> list[MarketNewsItem]:
        """Retrieve latest financial news headlines and summaries."""
        pass
