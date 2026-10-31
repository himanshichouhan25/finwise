import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, Calendar, Shield, Sparkles, IndianRupee, ArrowUpRight } from 'lucide-react';
import { runSipSimulation } from '../api/client';

export default function SipSimulatorView() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(12.5);
  const [tenureYears, setTenureYears] = useState(10);
  const [stepUpPct, setStepUpPct] = useState(0);
  const [inflationPct, setInflationPct] = useState(6.0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateSip = async () => {
    try {
      setLoading(true);
      const res = await runSipSimulation({
        monthly_investment: Math.max(100, Number(monthlyInvestment) || 100),
        annual_return_pct: Math.max(0.1, Number(annualReturn) || 12.5),
        duration_years: Math.max(1, Number(tenureYears) || 10),
        tenure_years: Math.max(1, Number(tenureYears) || 10),
        annual_step_up_pct: Math.max(0, Number(stepUpPct) || 0),
        step_up_pct: Math.max(0, Number(stepUpPct) || 0),
        annual_inflation_pct: Math.max(0, Number(inflationPct) || 6.0),
        inflation_rate_pct: Math.max(0, Number(inflationPct) || 6.0),
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to simulate SIP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSip();
  }, [monthlyInvestment, annualReturn, tenureYears, stepUpPct, inflationPct]);

  // Safe numerical resolution
  const maturityWealth = Number(result?.estimated_value ?? result?.maturity_amount ?? 0);
  const totalInvested = Number(result?.total_invested ?? 0);
  const wealthGained = Number(result?.estimated_gain ?? result?.wealth_gained ?? (maturityWealth - totalInvested));
  const realPurchasingPower = Number(result?.inflation_adjusted_value ?? result?.inflation_adjusted_maturity ?? 0);

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid #14B8A6' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#2DD4BF" />
            <span>Compounding SIP Simulator & Inflation Adjuster</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            Pure deterministic annuity compounding engine with annual salary step-up increments and real inflation adjustments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-teal">Nifty 50 Historical: ~12.5%</span>
          <span className="badge badge-slate">India CPI Inflation: ~5.5 - 6.0%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Controls Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>Investment Parameters</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Type amount or drag slider</span>
          </div>

          {/* 1. Monthly Investment */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 600 }}>Monthly SIP Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14, 21, 36, 0.8)', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.5)', padding: '0.25rem 0.6rem' }}>
                <span style={{ color: '#2DD4BF', fontWeight: 700, marginRight: '0.3rem', fontSize: '0.9rem' }}>₹</span>
                <input
                  type="number"
                  min="500"
                  max="500000"
                  step="500"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2DD4BF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '95px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={Math.min(100000, Number(monthlyInvestment) || 500)}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
              {[1000, 3000, 5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  className="btn btn-outline"
                  onClick={() => setMonthlyInvestment(amt)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.7rem',
                    background: Number(monthlyInvestment) === amt ? 'rgba(20, 184, 166, 0.2)' : undefined,
                    borderColor: Number(monthlyInvestment) === amt ? '#14B8A6' : undefined,
                    color: Number(monthlyInvestment) === amt ? '#2DD4BF' : undefined,
                  }}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Expected Annual Return */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 600 }}>Expected Annual Return</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14, 21, 36, 0.8)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '0.25rem 0.6rem' }}>
                <input
                  type="number"
                  min="1"
                  max="35"
                  step="0.5"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Math.max(0.1, Number(e.target.value)))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#F59E0B',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '60px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#F59E0B', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={Math.min(25, Math.max(5, Number(annualReturn) || 12))}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#F59E0B' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
              {[
                { name: 'FD (7%)', val: 7.0 },
                { name: 'Gold (10.5%)', val: 10.5 },
                { name: 'Nifty 50 (12.5%)', val: 12.5 },
                { name: 'MidCap (15%)', val: 15.0 },
              ].map((bench) => (
                <button
                  key={bench.name}
                  className="btn btn-outline"
                  onClick={() => setAnnualReturn(bench.val)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.68rem',
                    background: Number(annualReturn) === bench.val ? 'rgba(245, 158, 11, 0.2)' : undefined,
                    borderColor: Number(annualReturn) === bench.val ? '#F59E0B' : undefined,
                    color: Number(annualReturn) === bench.val ? '#FBBF24' : undefined,
                  }}
                >
                  {bench.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tenure Years */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 600 }}>Tenure (Investment Horizon)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14, 21, 36, 0.8)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.6rem' }}>
                <input
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Math.min(40, Number(e.target.value))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '45px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#94A3B8', fontWeight: 600, marginLeft: '0.25rem', fontSize: '0.8rem' }}>Yrs</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={Math.min(35, Math.max(1, Number(tenureYears) || 10))}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
              {[3, 5, 10, 15, 20, 25].map((yr) => (
                <button
                  key={yr}
                  className="btn btn-outline"
                  onClick={() => setTenureYears(yr)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.7rem',
                    background: Number(tenureYears) === yr ? 'rgba(20, 184, 166, 0.2)' : undefined,
                    borderColor: Number(tenureYears) === yr ? '#14B8A6' : undefined,
                    color: Number(tenureYears) === yr ? '#2DD4BF' : undefined,
                  }}
                >
                  {yr} Years
                </button>
              ))}
            </div>
          </div>

          {/* 4. Annual Step-Up */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <label className="fin-label" style={{ margin: 0, fontWeight: 600 }}>Annual Step-Up</label>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Increase SIP as your salary grows annually</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14, 21, 36, 0.8)', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '0.25rem 0.6rem' }}>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={stepUpPct}
                  onChange={(e) => setStepUpPct(Math.max(0, Math.min(30, Number(e.target.value))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2DD4BF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '45px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#2DD4BF', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={Math.min(20, Math.max(0, Number(stepUpPct) || 0))}
              onChange={(e) => setStepUpPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.55rem' }}>
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  className="btn btn-outline"
                  onClick={() => setStepUpPct(pct)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.7rem',
                    background: Number(stepUpPct) === pct ? 'rgba(20, 184, 166, 0.2)' : undefined,
                    borderColor: Number(stepUpPct) === pct ? '#14B8A6' : undefined,
                    color: Number(stepUpPct) === pct ? '#2DD4BF' : undefined,
                  }}
                >
                  {pct === 0 ? 'No Step-Up' : `+${pct}% / yr`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Inflation Rate */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <label className="fin-label" style={{ margin: 0, fontWeight: 600 }}>Annual Inflation Rate</label>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>To calculate future purchasing power</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(14, 21, 36, 0.8)', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '0.25rem 0.6rem' }}>
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={inflationPct}
                  onChange={(e) => setInflationPct(Math.max(0, Math.min(20, Number(e.target.value))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '50px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#94A3B8', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              value={Math.min(10, Math.max(3, Number(inflationPct) || 6))}
              onChange={(e) => setInflationPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#94A3B8' }}
            />
          </div>
        </div>

        {/* Results Projection Card */}
        {result && (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>Wealth Projection Summary</h3>
              {loading && <span style={{ fontSize: '0.75rem', color: '#2DD4BF' }}>Recalculating...</span>}
            </div>

            {/* Maturity Big Card */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.18) 0%, rgba(245, 158, 11, 0.12) 100%)', border: '1px solid rgba(20, 184, 166, 0.4)', textAlign: 'center', padding: '1.75rem 1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>ESTIMATED MATURITY WEALTH</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                ₹{maturityWealth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.65rem' }}>
                <span className="badge badge-teal" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  Total Gained: +₹{wealthGained.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Key Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-card">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>TOTAL INVESTED</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.3rem' }}>
                  ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Your out-of-pocket savings</span>
              </div>

              <div className="glass-card">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>REAL PURCHASING POWER</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.3rem' }}>
                  ₹{realPurchasingPower.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Adjusted for {inflationPct}% inflation</span>
              </div>
            </div>

            {/* Visual Compounding Ratio Bar */}
            {maturityWealth > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8' }}>Invested: {Math.round((totalInvested / maturityWealth) * 100)}%</span>
                  <span style={{ color: '#2DD4BF', fontWeight: 700 }}>Wealth Gain: {Math.round((wealthGained / maturityWealth) * 100)}%</span>
                </div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: '#0F172A' }}>
                  <div style={{ width: `${Math.min(100, Math.round((totalInvested / maturityWealth) * 100))}%`, background: '#64748B' }} title="Invested Capital" />
                  <div style={{ width: `${Math.max(0, 100 - Math.round((totalInvested / maturityWealth) * 100))}%`, background: 'linear-gradient(90deg, #14B8A6, #2DD4BF)' }} title="Compound Gains" />
                </div>
              </div>
            )}

            {/* Scenarios Comparison Table */}
            {result.scenarios && result.scenarios.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.5rem' }}>
                  Return Rate Sensitivity (Conservative vs Aggressive)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.scenarios.map((sc, idx) => {
                    const scMaturity = Number(sc.estimated_value ?? sc.maturity_amount ?? 0);
                    const scLabel = sc.label ?? sc.scenario_name ?? `${sc.annual_return_pct}%`;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <span style={{ color: '#CBD5E1' }}>{scLabel} ({sc.annual_return_pct}%)</span>
                        <span style={{ fontWeight: 700, color: '#F8FAFC' }}>
                          ₹{scMaturity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
