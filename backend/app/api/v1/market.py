"""Market Intelligence API router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.market.market_schemas import (
    MarketNewsResponse,
    MarketOverviewResponse,
    StockAiAnalysisResponse,
    StockFundamentalsResponse,
    StockHistoryResponse,
    StockQuoteResponse,
    StockSearchResult,
    WatchlistItemCreate,
    WatchlistItemResponse,
)
from app.market.market_service import MarketService, get_market_service

router = APIRouter(prefix="/market", tags=["Market Intelligence"])


@router.get("/overview", response_model=MarketOverviewResponse)
async def get_market_overview(
    service: Annotated[MarketService, Depends(get_market_service)],
) -> MarketOverviewResponse:
    """Retrieve benchmark Indian market indices (NIFTY 50, SENSEX, BANK NIFTY) and session status."""
    return await service.get_market_overview()


@router.get("/search", response_model=list[StockSearchResult])
async def search_indian_stocks(
    service: Annotated[MarketService, Depends(get_market_service)],
    q: Annotated[str | None, Query(max_length=50, description="Company name or ticker symbol")] = None,
    query: Annotated[str | None, Query(max_length=50, description="Alternative parameter for search term")] = None,
) -> list[StockSearchResult]:
    """Search Indian listed equities across NSE and BSE."""
    search_term = q or query or ""
    return await service.search_stocks(search_term)


@router.get("/stocks/{symbol}/quote", response_model=StockQuoteResponse)
async def get_stock_quote(
    symbol: Annotated[str, Path(description="Ticker symbol, e.g. RELIANCE, TCS")],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> StockQuoteResponse:
    """Retrieve latest available quote, day price movement, and 52-week range."""
    return await service.get_stock_quote(symbol)


@router.get("/stocks/{symbol}/history", response_model=StockHistoryResponse)
async def get_stock_history(
    symbol: Annotated[str, Path(description="Ticker symbol, e.g. RELIANCE, TCS")],
    service: Annotated[MarketService, Depends(get_market_service)],
    timeframe: Annotated[str, Query(description="Candle series period: 1M, 6M, 1Y, 5Y")] = "1M",
) -> StockHistoryResponse:
    """Retrieve historical OHLCV candle series for charting."""
    return await service.get_stock_history(symbol, timeframe=timeframe)


@router.get("/stocks/{symbol}/fundamentals", response_model=StockFundamentalsResponse)
async def get_stock_fundamentals(
    symbol: Annotated[str, Path(description="Ticker symbol, e.g. RELIANCE, TCS")],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> StockFundamentalsResponse:
    """Retrieve verified financial ratios (P/E, P/B, EPS, Debt/Equity, ROE) and company profile."""
    return await service.get_stock_fundamentals(symbol)


@router.post("/stocks/{symbol}/ai-analyze", response_model=StockAiAnalysisResponse)
async def analyze_stock_with_ai(
    symbol: Annotated[str, Path(description="Ticker symbol, e.g. RELIANCE, TCS")],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> StockAiAnalysisResponse:
    """Generate educational plain-English AI analysis using retrieved verified metrics and Groq."""
    return await service.analyze_stock_with_ai(symbol)


@router.get("/news", response_model=MarketNewsResponse)
async def get_market_news(
    service: Annotated[MarketService, Depends(get_market_service)],
    symbol: Annotated[str | None, Query(description="Optional filter by ticker symbol")] = None,
) -> MarketNewsResponse:
    """Retrieve financial market news headlines with AI-generated key takeaways."""
    return await service.get_market_news(symbol)


@router.get("/watchlist", response_model=list[WatchlistItemResponse])
async def get_watchlist(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> list[WatchlistItemResponse]:
    """Retrieve authenticated user's personal stock watchlist enriched with prices."""
    return await service.get_user_watchlist(db, user_id=user_id)


@router.post("/watchlist", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    payload: WatchlistItemCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> WatchlistItemResponse:
    """Save an equity to the user's personal watchlist."""
    return service.add_to_watchlist(db, user_id=user_id, payload=payload)


@router.delete("/watchlist/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    symbol: Annotated[str, Path(description="Ticker symbol to remove")],
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    service: Annotated[MarketService, Depends(get_market_service)],
) -> None:
    """Remove a stock from the user's personal watchlist."""
    success = service.remove_from_watchlist(db, user_id=user_id, symbol=symbol)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock {symbol.upper()} not found in your watchlist.",
        )
