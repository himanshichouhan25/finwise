"""Market Intelligence service orchestrator with provider cascading, caching, and AI analysis."""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.client import get_llm_client
from app.core.config import get_settings
from app.market.market_cache import get_market_cache
from app.market.market_schemas import (
    MarketNewsResponse,
    MarketOverviewResponse,
    RatioExplanation,
    StockAiAnalysisResponse,
    StockFundamentalsResponse,
    StockHistoryResponse,
    StockQuoteResponse,
    StockSearchResult,
    WatchlistItemCreate,
    WatchlistItemResponse,
)
from app.market.providers import (
    AlphaVantageProvider,
    BaseMarketProvider,
    BharatStockProvider,
    DemoFallbackProvider,
    TapetideProvider,
)
from app.models.watchlist import WatchlistItem

logger = logging.getLogger("finwise.market.service")


class MarketService:
    """Orchestrates market data providers with automatic failover, TTL caching, and AI analysis."""

    def __init__(self):
        self.settings = get_settings()
        self.cache = get_market_cache(default_ttl=self.settings.MARKET_DATA_CACHE_TTL)

        self.tapetide = TapetideProvider(
            api_key=self.settings.TAPETIDE_API_KEY,
            timeout=self.settings.MARKET_DATA_TIMEOUT,
        )
        self.bharatstock = BharatStockProvider(
            api_key=self.settings.BHARATSTOCK_API_KEY,
            timeout=self.settings.MARKET_DATA_TIMEOUT,
        )
        self.alphavantage = AlphaVantageProvider(
            api_key=self.settings.ALPHA_VANTAGE_API_KEY,
            timeout=self.settings.MARKET_DATA_TIMEOUT,
        )
        self.demo = DemoFallbackProvider()

    def _get_provider_chain(self) -> list[BaseMarketProvider]:
        """Build prioritized provider list based on configuration and active API keys."""
        preferred = self.settings.MARKET_DATA_PROVIDER.lower().strip()
        chain: list[BaseMarketProvider] = []

        providers_map = {
            "tapetide": self.tapetide,
            "bharatstock": self.bharatstock,
            "alphavantage": self.alphavantage,
            "demo": self.demo,
            "demo_fallback": self.demo,
        }

        # 1. Preferred provider first if configured
        if preferred in providers_map and providers_map[preferred].is_configured:
            chain.append(providers_map[preferred])

        # If explicitly set to demo mode, return immediately without network overhead
        if preferred in ("demo", "demo_fallback"):
            return chain

        # 2. Add other configured live providers in order of preference
        for _name, p in [("tapetide", self.tapetide), ("bharatstock", self.bharatstock), ("alphavantage", self.alphavantage)]:
            if p.is_configured and p not in chain:
                chain.append(p)

        # 3. Always end with transparent demo fallback
        if self.demo not in chain:
            chain.append(self.demo)

        return chain

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch market overview with in-memory caching and graceful provider fallback."""
        cache_key = "market:overview"
        cached: MarketOverviewResponse | None = self.cache.get(cache_key)
        if cached:
            cached.attribution.is_cached = True
            return cached

        for provider in self._get_provider_chain():
            try:
                res = await provider.get_market_overview()
                self.cache.set(cache_key, res)
                return res
            except Exception as e:
                logger.warning("Provider %s failed get_market_overview: %s. Cascading...", provider.name, e)

        # Ultimate fallback
        res = await self.demo.get_market_overview()
        self.cache.set(cache_key, res)
        return res

    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search Indian listed equities."""
        q = query.strip()
        if not q:
            return []

        cache_key = f"market:search:{q.upper()}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        demo_results = await self.demo.search_stocks(q)

        for provider in self._get_provider_chain():
            if provider == self.demo:
                continue
            try:
                results = await provider.search_stocks(q)
                if results:
                    merged: list[StockSearchResult] = list(demo_results)
                    seen = {r.symbol.upper().replace(".BSE", "").replace(".NSE", "") for r in demo_results}
                    for r in results:
                        clean = r.symbol.upper().replace(".BSE", "").replace(".NSE", "")
                        if clean not in seen:
                            seen.add(clean)
                            merged.append(r)
                    self.cache.set(cache_key, merged, ttl=600)
                    return merged
            except Exception as e:
                logger.warning("Provider %s failed search_stocks for '%s': %s", provider.name, q, e)

        # Fallback to demo search
        self.cache.set(cache_key, demo_results, ttl=600)
        return demo_results

    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Fetch stock quote with caching and failover."""
        sym = symbol.upper().strip()
        cache_key = f"market:quote:{sym}"
        cached: StockQuoteResponse | None = self.cache.get(cache_key)
        if cached:
            cached.attribution.is_cached = True
            return cached

        for provider in self._get_provider_chain():
            try:
                quote = await provider.get_stock_quote(sym)
                self.cache.set(cache_key, quote)
                return quote
            except Exception as e:
                logger.warning("Provider %s failed get_stock_quote for %s: %s", provider.name, sym, e)

        quote = await self.demo.get_stock_quote(sym)
        self.cache.set(cache_key, quote)
        return quote

    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Fetch historical candle series."""
        sym = symbol.upper().strip()
        tf = timeframe.upper().strip()
        cache_key = f"market:history:{sym}:{tf}"
        cached: StockHistoryResponse | None = self.cache.get(cache_key)
        if cached:
            cached.attribution.is_cached = True
            return cached

        for provider in self._get_provider_chain():
            try:
                hist = await provider.get_stock_history(sym, timeframe=tf)
                if not hist or not hist.series or len(hist.series) == 0:
                    logger.warning("Provider %s returned 0 candle series for %s. Cascading...", provider.name, sym)
                    continue
                self.cache.set(cache_key, hist, ttl=900)  # History cached for 15 mins
                return hist
            except Exception as e:
                logger.warning("Provider %s failed get_stock_history for %s: %s", provider.name, sym, e)

        hist = await self.demo.get_stock_history(sym, timeframe=tf)
        self.cache.set(cache_key, hist, ttl=900)
        return hist

    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Fetch fundamentals with caching."""
        sym = symbol.upper().strip()
        cache_key = f"market:fundamentals:{sym}"
        cached: StockFundamentalsResponse | None = self.cache.get(cache_key)
        if cached:
            cached.attribution.is_cached = True
            return cached

        for provider in self._get_provider_chain():
            try:
                fund = await provider.get_stock_fundamentals(sym)
                self.cache.set(cache_key, fund, ttl=1800)  # Fundamentals cached for 30 mins
                return fund
            except Exception as e:
                logger.warning("Provider %s failed get_stock_fundamentals for %s: %s", provider.name, sym, e)

        fund = await self.demo.get_stock_fundamentals(sym)
        self.cache.set(cache_key, fund, ttl=1800)
        return fund

    async def get_market_news(self, symbol: str | None = None) -> MarketNewsResponse:
        """Fetch financial news feed."""
        sym = symbol.upper().strip() if symbol else None
        cache_key = f"market:news:{sym or 'all'}"
        cached: MarketNewsResponse | None = self.cache.get(cache_key)
        if cached:
            cached.attribution.is_cached = True
            return cached

        # Prioritize news provider
        news_pref = self.settings.MARKET_NEWS_PROVIDER.lower().strip()
        providers: list[BaseMarketProvider] = []
        if news_pref == "alphavantage" and self.alphavantage.is_configured:
            providers.append(self.alphavantage)
        if self.tapetide.is_configured and self.tapetide not in providers:
            providers.append(self.tapetide)
        providers.append(self.demo)

        for p in providers:
            try:
                items = await p.get_market_news(sym)
                if items:
                    resp = MarketNewsResponse(
                        items=items,
                        attribution=self.demo._attribution([f"News aggregated via {p.name}"]),
                    )
                    self.cache.set(cache_key, resp, ttl=600)
                    return resp
            except Exception as e:
                logger.warning("News provider %s failed: %s", p.name, e)

        items = await self.demo.get_market_news(sym)
        resp = MarketNewsResponse(items=items, attribution=self.demo._attribution())
        self.cache.set(cache_key, resp, ttl=600)
        return resp

    async def analyze_stock_with_ai(self, symbol: str) -> StockAiAnalysisResponse:
        """Run Groq AI Plain-English analysis on retrieved stock fundamentals with strict guardrails."""
        sym = symbol.upper().strip()
        quote = await self.get_stock_quote(sym)
        fund = await self.get_stock_fundamentals(sym)

        # 1. Deterministic pure-python metric interpretations
        ratios_explained: list[RatioExplanation] = []
        pros: list[str] = []
        cons: list[str] = []
        risks: list[str] = []

        # P/E Ratio Check
        if fund.pe_ratio is not None:
            pe_val = float(fund.pe_ratio)
            if pe_val < 15:
                pe_interp = "Trading at a conservative valuation relative to earnings; potential value territory."
                pros.append(f"Moderate valuation with P/E of {pe_val:.1f}.")
            elif pe_val > 40:
                pe_interp = "Commands a high growth premium. Demands sustained earnings expansion to justify multiple."
                cons.append(f"Elevated valuation multiple (P/E {pe_val:.1f}).")
            else:
                pe_interp = "Trading within a standard historical valuation band."
            ratios_explained.append(RatioExplanation(metric="P/E Ratio (Price-to-Earnings)", value=f"{pe_val:.1f}x", interpretation=pe_interp))
        else:
            ratios_explained.append(RatioExplanation(metric="P/E Ratio", value="Data unavailable", interpretation="Historical earnings ratio not currently published."))

        # Debt to Equity
        if fund.debt_to_equity is not None:
            de_val = float(fund.debt_to_equity)
            if de_val < 0.5:
                de_interp = "Extremely healthy balance sheet with minimal financial leverage."
                pros.append("Low debt burden gives strong resilience during economic downturns.")
            elif de_val > 2.0:
                de_interp = "Substantial debt obligations. High interest expenses could pressure profitability."
                risks.append(f"Elevated debt-to-equity ratio ({de_val:.2f}) presents leverage risk.")
            else:
                de_interp = "Moderate leverage within acceptable industrial thresholds."
            ratios_explained.append(RatioExplanation(metric="Debt-to-Equity", value=f"{de_val:.2f}", interpretation=de_interp))

        # ROE Check
        if fund.roe_pct is not None:
            roe_val = float(fund.roe_pct)
            if roe_val > 20:
                pros.append(f"Excellent capital efficiency with Return on Equity of {roe_val:.1f}%.")
            elif roe_val < 10:
                cons.append(f"Modest capital return with ROE of {roe_val:.1f}%.")
            ratios_explained.append(RatioExplanation(metric="Return on Equity (ROE)", value=f"{roe_val:.1f}%", interpretation="Measures profitability relative to shareholder net worth."))

        # 2. Invoke Groq AI for synthesized plain-English explanation
        sebi_disclaimer = (
            "Disclaimer: Educational analysis based on public financial data. "
            "FinWise AI is not a SEBI-registered investment adviser. Does not constitute buy/sell advice."
        )

        llm_client = get_llm_client()
        summary_text: str

        if llm_client.is_available:
            prompt = f"""You are an educational AI Stock Analyst for young Indian investors on FinWise AI.
Analyze this Indian listed company using STRICTLY the verified financial figures below.
Do NOT invent fake numbers. Do NOT give personalized buy/sell calls or promise returns.

COMPANY INFORMATION:
- Symbol: {sym}
- Name: {fund.company_name}
- Current Market Price: ₹{float(quote.current_price):,.2f} (Day Change: {float(quote.change_pct):+.2f}%)
- Sector / Industry: {fund.sector or 'Unspecified'} / {fund.industry or 'Unspecified'}
- Market Cap: ₹{float(fund.market_cap_cr or 0):,.0f} Crores
- P/E Ratio: {f'{float(fund.pe_ratio):.1f}' if fund.pe_ratio else 'Data unavailable'}
- P/B Ratio: {f'{float(fund.pb_ratio):.1f}' if fund.pb_ratio else 'Data unavailable'}
- EPS: {f'₹{float(fund.eps):.2f}' if fund.eps else 'Data unavailable'}
- Debt/Equity: {f'{float(fund.debt_to_equity):.2f}' if fund.debt_to_equity else 'Data unavailable'}
- ROE: {f'{float(fund.roe_pct):.1f}%' if fund.roe_pct else 'Data unavailable'}
- Corporate Profile: {fund.summary_profile or 'Leading Indian corporate entity.'}

Respond in concise, plain English (under 150 words) explaining:
1. What the business does and its competitive standing.
2. How its valuation and debt profile look for long-term first-time investors.
3. Key structural headwinds or risks to keep in mind.
"""
            try:
                ai_resp = llm_client.complete(
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
                summary_text = ai_resp.content or "AI analysis generated based on verified metrics."
                model_used = ai_resp.model_used
            except Exception as e:
                logger.warning("Groq AI analysis failed: %s. Using deterministic summary.", e)
                summary_text = f"{fund.company_name} ({sym}) is trading at ₹{float(quote.current_price):,.2f}. Fundamentals show healthy corporate standing."
                model_used = "deterministic-rule-engine"
        else:
            summary_text = (
                f"{fund.company_name} ({sym}) operates in the {fund.sector or 'equities'} sector. "
                f"Currently quoting at ₹{float(quote.current_price):,.2f} with a 52-week range of "
                f"₹{float(quote.week_52_low or 0):,.2f} – ₹{float(quote.week_52_high or 0):,.2f}."
            )
            model_used = "deterministic-rule-engine (AI offline)"

        if not risks:
            risks.append("Market volatility and macro interest rate cycles affect equity prices.")
            risks.append("Sector-specific competitive dynamics and raw material inflation.")

        return StockAiAnalysisResponse(
            symbol=sym,
            company_name=fund.company_name,
            summary_explanation=summary_text,
            pros=pros if pros else ["Established business presence in its operating domain."],
            cons=cons if cons else ["Subject to market cyclicality and broader macroeconomic fluctuations."],
            risks=risks,
            ratios_explained=ratios_explained,
            model_used=model_used,
            data_timestamp=fund.attribution.timestamp.isoformat(),
            data_source=fund.attribution.provider,
            sebi_disclaimer=sebi_disclaimer,
        )

    # Watchlist CRUD
    async def get_user_watchlist(self, db: Session, user_id: int) -> list[WatchlistItemResponse]:
        """Retrieve user's saved stocks enriched with latest quotes."""
        stmt = select(WatchlistItem).where(WatchlistItem.user_id == user_id).order_by(WatchlistItem.created_at.desc())
        items = db.scalars(stmt).all()

        responses: list[WatchlistItemResponse] = []
        for item in items:
            resp_item = WatchlistItemResponse.model_validate(item)
            try:
                quote = await self.get_stock_quote(item.symbol)
                resp_item.latest_price = quote.current_price
                resp_item.change_pct = quote.change_pct
            except Exception:
                pass
            responses.append(resp_item)
        return responses

    def add_to_watchlist(self, db: Session, user_id: int, payload: WatchlistItemCreate) -> WatchlistItemResponse:
        """Add stock to user's personal watchlist."""
        sym = payload.symbol.upper().strip()
        existing = db.scalar(
            select(WatchlistItem).where(WatchlistItem.user_id == user_id, WatchlistItem.symbol == sym)
        )
        if existing:
            return WatchlistItemResponse.model_validate(existing)

        company_name = payload.company_name or sym
        item = WatchlistItem(
            user_id=user_id,
            symbol=sym,
            company_name=company_name,
            exchange=payload.exchange.upper(),
            notes=payload.notes,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return WatchlistItemResponse.model_validate(item)

    def remove_from_watchlist(self, db: Session, user_id: int, symbol: str) -> bool:
        """Remove a stock from user's watchlist."""
        sym = symbol.upper().strip()
        item = db.scalar(
            select(WatchlistItem).where(WatchlistItem.user_id == user_id, WatchlistItem.symbol == sym)
        )
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True


# Global service singleton
_market_service: MarketService | None = None


def get_market_service() -> MarketService:
    """Return shared MarketService instance."""
    global _market_service
    if _market_service is None:
        _market_service = MarketService()
    return _market_service
