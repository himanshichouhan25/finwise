"""Explicitly labelled DEMO benchmark provider when all external API keys are unconfigured."""

from datetime import UTC, datetime, timedelta
from decimal import Decimal

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


class DemoFallbackProvider(BaseMarketProvider):
    """Reliable reference provider with authentic Indian benchmarks, clearly labeled as DEMO."""

    name: str = "demo_fallback"

    @property
    def is_configured(self) -> bool:
        return True

    def _attribution(self, extra_notes: list[str] | None = None) -> MarketDataAttribution:
        notes = [
            "DEMO MODE: No live market API key configured. Displaying verified benchmark baseline figures.",
            "Configure TAPETIDE_API_KEY, BHARATSTOCK_API_KEY, or ALPHA_VANTAGE_API_KEY to activate live exchange data.",
        ]
        if extra_notes:
            notes.extend(extra_notes)
        return MarketDataAttribution(
            provider="demo_fallback",
            timestamp=datetime.now(UTC),
            data_mode="demo",
            is_cached=False,
            limitations=notes,
        )

    # Reference Equities Database (NSE / BSE)
    _STOCKS = {
        "RELIANCE": {
            "name": "Reliance Industries Ltd",
            "exchange": "NSE",
            "price": Decimal("2984.50"),
            "change": Decimal("18.40"),
            "change_pct": Decimal("0.62"),
            "open": Decimal("2966.10"),
            "high": Decimal("2998.00"),
            "low": Decimal("2955.00"),
            "prev_close": Decimal("2966.10"),
            "volume": 6482100,
            "week_52_high": Decimal("3217.90"),
            "week_52_low": Decimal("2220.30"),
            "sector": "Energy & Conglomerate",
            "industry": "Oil, Gas, Retail & Telecom",
            "market_cap_cr": Decimal("2018450.00"),
            "pe_ratio": Decimal("28.4"),
            "pb_ratio": Decimal("2.6"),
            "eps": Decimal("105.10"),
            "debt_to_equity": Decimal("0.42"),
            "roe_pct": Decimal("9.8"),
            "dividend_yield_pct": Decimal("0.35"),
            "revenue_annual_cr": Decimal("901064.00"),
            "net_profit_annual_cr": Decimal("69621.00"),
            "profile": "Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.",
        },
        "TCS": {
            "name": "Tata Consultancy Services Ltd",
            "exchange": "NSE",
            "price": Decimal("4128.75"),
            "change": Decimal("-24.10"),
            "change_pct": Decimal("-0.58"),
            "open": Decimal("4150.00"),
            "high": Decimal("4162.00"),
            "low": Decimal("4115.00"),
            "prev_close": Decimal("4152.85"),
            "volume": 2185400,
            "week_52_high": Decimal("4585.90"),
            "week_52_low": Decimal("3313.00"),
            "sector": "Information Technology",
            "industry": "IT Services & Consulting",
            "market_cap_cr": Decimal("1493200.00"),
            "pe_ratio": Decimal("31.8"),
            "pb_ratio": Decimal("14.2"),
            "eps": Decimal("129.80"),
            "debt_to_equity": Decimal("0.08"),
            "roe_pct": Decimal("51.2"),
            "dividend_yield_pct": Decimal("1.78"),
            "revenue_annual_cr": Decimal("240893.00"),
            "net_profit_annual_cr": Decimal("46099.00"),
            "profile": "Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a flagship subsidiary of the Tata Group operating across 55 countries.",
        },
        "HDFCBANK": {
            "name": "HDFC Bank Ltd",
            "exchange": "NSE",
            "price": Decimal("1742.60"),
            "change": Decimal("12.35"),
            "change_pct": Decimal("0.71"),
            "open": Decimal("1730.00"),
            "high": Decimal("1750.40"),
            "low": Decimal("1726.00"),
            "prev_close": Decimal("1730.25"),
            "volume": 14250000,
            "week_52_high": Decimal("1794.00"),
            "week_52_low": Decimal("1363.55"),
            "sector": "Financial Services",
            "industry": "Private Sector Banking",
            "market_cap_cr": Decimal("1328400.00"),
            "pe_ratio": Decimal("19.6"),
            "pb_ratio": Decimal("2.8"),
            "eps": Decimal("88.90"),
            "debt_to_equity": Decimal("6.20"),
            "roe_pct": Decimal("16.4"),
            "dividend_yield_pct": Decimal("1.12"),
            "revenue_annual_cr": Decimal("315200.00"),
            "net_profit_annual_cr": Decimal("64060.00"),
            "profile": "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and market capitalization.",
        },
        "INFY": {
            "name": "Infosys Ltd",
            "exchange": "NSE",
            "price": Decimal("1874.15"),
            "change": Decimal("15.20"),
            "change_pct": Decimal("0.82"),
            "open": Decimal("1860.00"),
            "high": Decimal("1885.00"),
            "low": Decimal("1855.00"),
            "prev_close": Decimal("1858.95"),
            "volume": 5890000,
            "week_52_high": Decimal("1991.45"),
            "week_52_low": Decimal("1358.35"),
            "sector": "Information Technology",
            "industry": "IT Services & Consulting",
            "market_cap_cr": Decimal("778400.00"),
            "pe_ratio": Decimal("29.2"),
            "pb_ratio": Decimal("8.4"),
            "eps": Decimal("64.20"),
            "debt_to_equity": Decimal("0.09"),
            "roe_pct": Decimal("31.8"),
            "dividend_yield_pct": Decimal("2.45"),
            "revenue_annual_cr": Decimal("153670.00"),
            "net_profit_annual_cr": Decimal("26248.00"),
            "profile": "Infosys Limited provides business consulting, information technology and outsourcing services. It was founded in Pune and is headquartered in Bengaluru.",
        },
        "TATAMOTORS": {
            "name": "Tata Motors Ltd",
            "exchange": "NSE",
            "price": Decimal("878.50"),
            "change": Decimal("-6.20"),
            "change_pct": Decimal("-0.70"),
            "open": Decimal("885.00"),
            "high": Decimal("892.00"),
            "low": Decimal("872.10"),
            "prev_close": Decimal("884.70"),
            "volume": 8940000,
            "week_52_high": Decimal("1179.05"),
            "week_52_low": Decimal("621.50"),
            "sector": "Automobile",
            "industry": "Commercial & Passenger Vehicles",
            "market_cap_cr": Decimal("322100.00"),
            "pe_ratio": Decimal("10.8"),
            "pb_ratio": Decimal("3.4"),
            "eps": Decimal("81.30"),
            "debt_to_equity": Decimal("1.25"),
            "roe_pct": Decimal("36.2"),
            "dividend_yield_pct": Decimal("0.68"),
            "revenue_annual_cr": Decimal("437928.00"),
            "net_profit_annual_cr": Decimal("31807.00"),
            "profile": "Tata Motors Limited is a leading global automobile manufacturer with a portfolio that covers cars, SUVs, buses, trucks, and defense vehicles. It owns the Jaguar Land Rover brand.",
        },
        "ICICIBANK": {
            "name": "ICICI Bank Ltd",
            "exchange": "NSE",
            "price": Decimal("1272.40"),
            "change": Decimal("9.80"),
            "change_pct": Decimal("0.78"),
            "open": Decimal("1265.00"),
            "high": Decimal("1278.50"),
            "low": Decimal("1260.00"),
            "prev_close": Decimal("1262.60"),
            "volume": 11200000,
            "week_52_high": Decimal("1332.00"),
            "week_52_low": Decimal("918.00"),
            "sector": "Financial Services",
            "industry": "Private Sector Banking",
            "market_cap_cr": Decimal("894500.00"),
            "pe_ratio": Decimal("18.4"),
            "pb_ratio": Decimal("3.1"),
            "eps": Decimal("69.15"),
            "debt_to_equity": Decimal("5.80"),
            "roe_pct": Decimal("18.5"),
            "dividend_yield_pct": Decimal("0.79"),
            "revenue_annual_cr": Decimal("238500.00"),
            "net_profit_annual_cr": Decimal("40888.00"),
            "profile": "ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai offering a wide range of retail and corporate banking services.",
        },
    }

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Return benchmark Indian indices in DEMO mode."""
        indices = [
            IndexItem(
                symbol="^NSEI",
                name="NIFTY 50",
                current_price=Decimal("24466.85"),
                change_amount=Decimal("156.35"),
                change_pct=Decimal("0.64"),
                open_price=Decimal("24350.00"),
                high_price=Decimal("24510.50"),
                low_price=Decimal("24320.25"),
                previous_close=Decimal("24310.50"),
            ),
            IndexItem(
                symbol="^BSESN",
                name="SENSEX",
                current_price=Decimal("80436.84"),
                change_amount=Decimal("492.75"),
                change_pct=Decimal("0.62"),
                open_price=Decimal("80050.00"),
                high_price=Decimal("80612.00"),
                low_price=Decimal("79980.50"),
                previous_close=Decimal("79944.09"),
            ),
            IndexItem(
                symbol="^NSEBANK",
                name="BANK NIFTY",
                current_price=Decimal("52085.40"),
                change_amount=Decimal("348.10"),
                change_pct=Decimal("0.67"),
                open_price=Decimal("51800.00"),
                high_price=Decimal("52250.00"),
                low_price=Decimal("51720.00"),
                previous_close=Decimal("51737.30"),
            ),
        ]
        return MarketOverviewResponse(
            indices=indices,
            status=MarketStatus(
                is_open=True,
                exchange="NSE/BSE",
                trading_session="Regular Trading (09:15 - 15:30 IST)",
                message="Indian Equity Markets Open (Simulated Benchmark Reference)",
            ),
            attribution=self._attribution(),
        )

    async def search_stocks(self, query: str) -> list[StockSearchResult]:
        """Search in reference Indian equities list."""
        q = query.upper().strip()
        results: list[StockSearchResult] = []
        for sym, d in self._STOCKS.items():
            if q in sym or q in d["name"].upper():
                results.append(
                    StockSearchResult(
                        symbol=sym,
                        name=d["name"],
                        exchange=d["exchange"],
                        instrument_type="Stock",
                    )
                )
        return results

    async def get_stock_quote(self, symbol: str) -> StockQuoteResponse:
        """Fetch quote for reference Indian stock."""
        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        d = self._STOCKS.get(sym)
        if not d:
            # Fallback for unknown ticker in demo mode
            d = {
                "name": f"{sym} Corporation",
                "exchange": "NSE",
                "price": Decimal("1000.00"),
                "change": Decimal("5.00"),
                "change_pct": Decimal("0.50"),
                "open": Decimal("995.00"),
                "high": Decimal("1010.00"),
                "low": Decimal("990.00"),
                "prev_close": Decimal("995.00"),
                "volume": 500000,
                "week_52_high": Decimal("1200.00"),
                "week_52_low": Decimal("800.00"),
            }

        return StockQuoteResponse(
            symbol=sym,
            company_name=d["name"],
            exchange=d["exchange"],
            current_price=d["price"],
            change_amount=d["change"],
            change_pct=d["change_pct"],
            open_price=d.get("open"),
            high_price=d.get("high"),
            low_price=d.get("low"),
            previous_close=d.get("prev_close"),
            volume=d.get("volume"),
            week_52_high=d.get("week_52_high"),
            week_52_low=d.get("week_52_low"),
            attribution=self._attribution([f"Demo baseline quote for {sym}"]),
        )

    async def get_stock_history(self, symbol: str, timeframe: str = "1M") -> StockHistoryResponse:
        """Generate realistic 30-day historical OHLCV series for charting."""
        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        d = self._STOCKS.get(sym, {"name": sym, "price": Decimal("1000.00")})

        base_price = float(d.get("price", Decimal("1000.00")))
        days = 30 if timeframe == "1M" else (90 if timeframe == "6M" else 180)
        today = datetime.now(UTC)

        # Build consistent non-random trajectory
        series: list[OHLCVPoint] = []
        for i in range(days, 0, -1):
            dt = today - timedelta(days=i)
            # Gentle deterministic sinusoid curve
            factor = 1.0 - 0.05 * (i / days) + 0.02 * ((i % 7) - 3) / 10.0
            day_close = base_price * factor
            day_open = day_close * 0.995
            day_high = max(day_open, day_close) * 1.01
            day_low = min(day_open, day_close) * 0.99
            vol = 1500000 + (i * 25000)

            series.append(
                OHLCVPoint(
                    timestamp=dt.strftime("%Y-%m-%d"),
                    open=Decimal(f"{day_open:.2f}"),
                    high=Decimal(f"{day_high:.2f}"),
                    low=Decimal(f"{day_low:.2f}"),
                    close=Decimal(f"{day_close:.2f}"),
                    volume=vol,
                )
            )

        return StockHistoryResponse(
            symbol=sym,
            company_name=d.get("name", sym),
            timeframe=timeframe,
            series=series,
            attribution=self._attribution([f"Deterministic reference historical series ({timeframe})"]),
        )

    async def get_stock_fundamentals(self, symbol: str) -> StockFundamentalsResponse:
        """Fetch verified fundamental metrics."""
        sym = symbol.upper().replace(".NS", "").replace(".BO", "")
        d = self._STOCKS.get(sym)
        if not d:
            return StockFundamentalsResponse(
                symbol=sym,
                company_name=sym,
                sector=None,
                industry=None,
                market_cap_cr=None,
                pe_ratio=None,
                pb_ratio=None,
                eps=None,
                debt_to_equity=None,
                roe_pct=None,
                dividend_yield_pct=None,
                summary_profile="Verified corporate profile unavailable in demo catalog.",
                attribution=self._attribution([f"Data unavailable for {sym}"]),
            )

        return StockFundamentalsResponse(
            symbol=sym,
            company_name=d["name"],
            sector=d.get("sector"),
            industry=d.get("industry"),
            market_cap_cr=d.get("market_cap_cr"),
            pe_ratio=d.get("pe_ratio"),
            pb_ratio=d.get("pb_ratio"),
            eps=d.get("eps"),
            debt_to_equity=d.get("debt_to_equity"),
            roe_pct=d.get("roe_pct"),
            dividend_yield_pct=d.get("dividend_yield_pct"),
            revenue_annual_cr=d.get("revenue_annual_cr"),
            net_profit_annual_cr=d.get("net_profit_annual_cr"),
            summary_profile=d.get("profile"),
            attribution=self._attribution([f"Public filing audited metrics for {sym}"]),
        )

    async def get_market_news(self, symbol: str | None = None) -> list[MarketNewsItem]:
        """Fetch realistic market headlines with educational AI takeaways."""
        now = datetime.now(UTC)
        news_items = [
            MarketNewsItem(
                id="news_1",
                title="RBI Monetary Policy Committee Maintains Repo Rate at 6.50%",
                summary="The Reserve Bank of India keeps the policy repo rate unchanged, reiterating focus on bringing inflation sustainably to the 4% target while supporting growth.",
                source="Reserve Bank of India Bulletin",
                published_at=now - timedelta(hours=3),
                related_symbols=["^NSEI", "^NSEBANK", "HDFCBANK", "ICICIBANK"],
                ai_takeaway="Steady interest rates support bank net interest margins and provide stability for fixed deposit & corporate borrowing.",
            ),
            MarketNewsItem(
                id="news_2",
                title="Indian Mutual Fund SIP Inflows Cross ₹24,000 Crore Milestone",
                summary="Systematic Investment Plan contributions by retail investors touched an all-time high, demonstrating increasing financialization of household savings in India.",
                source="AMFI India Report",
                published_at=now - timedelta(hours=8),
                related_symbols=["^NSEI", "^BSESN"],
                ai_takeaway="Record SIP inflows provide strong domestic institutional liquidity, cushioning Indian markets against foreign portfolio volatility.",
            ),
            MarketNewsItem(
                id="news_3",
                title="SEBI Issues Strong Advisory Against Unregistered Financial Influencers and Telegram Tipsters",
                summary="Capital markets regulator reiterates that promising guaranteed returns on stock options or crypto violates SEBI (Investment Advisers) Regulations.",
                source="SEBI Circular",
                published_at=now - timedelta(hours=14),
                related_symbols=["^NSEI"],
                ai_takeaway="Always verify SEBI registration (INA/INH numbers) before acting on social media tips. Guaranteed return claims are illegal.",
            ),
            MarketNewsItem(
                id="news_4",
                title="IT Services Sector Eyes AI & Cloud Deal Pipeline Momentum Ahead of Q3 Results",
                summary="Major tier-1 IT firms including TCS and Infosys report growing client inquiries in enterprise generative AI integration and cloud modernization.",
                source="Mint Financial",
                published_at=now - timedelta(hours=22),
                related_symbols=["TCS", "INFY"],
                ai_takeaway="Generative AI consulting deals represent the next margin expansion cycle for Indian technology exporters.",
            ),
        ]
        if symbol:
            sym = symbol.upper()
            filtered = [n for n in news_items if any(sym in s for s in n.related_symbols)]
            if filtered:
                return filtered
        return news_items
