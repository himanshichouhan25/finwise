import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Percent, Calendar, ShieldCheck, ArrowUpRight } from 'lucide-react';
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
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--teal-primary)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <TrendingUp size={20} color="var(--teal-primary)" />
            <span>SIP Wealth Compounding & Inflation Adjuster</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Pure deterministic annuity compounding engine with annual salary step-up increments and real inflation discounting.
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Investment Parameters</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type amount or drag slider</span>
          </div>

          {/* 1. Monthly Investment */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 700 }}>Monthly SIP Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(19, 168, 158, 0.5)', padding: '0.25rem 0.6rem', boxShadow: 'var(--shadow-xs)' }}>
                <span style={{ color: 'var(--teal-primary)', fontWeight: 700, marginRight: '0.3rem', fontSize: '0.9rem' }}>₹</span>
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
                    color: 'var(--text-main)',
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
              style={{ width: '100%', accentColor: 'var(--teal-primary)' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              {[1000, 3000, 5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  className="btn btn-outline"
                  onClick={() => setMonthlyInvestment(amt)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.72rem',
                    background: Number(monthlyInvestment) === amt ? 'var(--teal-soft)' : '#FFFFFF',
                    borderColor: Number(monthlyInvestment) === amt ? 'var(--teal-primary)' : 'var(--border-subtle)',
                    color: Number(monthlyInvestment) === amt ? 'var(--teal-primary)' : 'var(--text-secondary)',
                    fontWeight: Number(monthlyInvestment) === amt ? 700 : 500,
                  }}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Expected Annual Return */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 700 }}>Expected Annual Return</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.5)', padding: '0.25rem 0.6rem', boxShadow: 'var(--shadow-xs)' }}>
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
                    color: '#B45309',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '60px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#B45309', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={Math.min(30, Math.max(1, Number(annualReturn) || 12))}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              {[8, 10, 12.5, 15, 18].map((rate) => (
                <button
                  key={rate}
                  className="btn btn-outline"
                  onClick={() => setAnnualReturn(rate)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    background: Number(annualReturn) === rate ? 'var(--gold-soft)' : '#FFFFFF',
                    borderColor: Number(annualReturn) === rate ? 'var(--gold-primary)' : 'var(--border-subtle)',
                    color: Number(annualReturn) === rate ? '#B45309' : 'var(--text-secondary)',
                    fontWeight: Number(annualReturn) === rate ? 700 : 500,
                  }}
                >
                  {rate}% {rate === 12.5 ? '(Nifty)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Duration */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="fin-label" style={{ margin: 0, fontWeight: 700 }}>Investment Horizon</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '0.25rem 0.6rem', boxShadow: 'var(--shadow-xs)' }}>
                <input
                  type="number"
                  min="1"
                  max="35"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Math.min(35, Number(e.target.value))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '45px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginLeft: '0.25rem', fontSize: '0.8rem' }}>Yrs</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={Math.min(35, Math.max(1, Number(tenureYears) || 10))}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--violet-primary)' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              {[3, 5, 10, 15, 20, 25].map((yr) => (
                <button
                  key={yr}
                  className="btn btn-outline"
                  onClick={() => setTenureYears(yr)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    background: Number(tenureYears) === yr ? 'var(--violet-soft)' : '#FFFFFF',
                    borderColor: Number(tenureYears) === yr ? 'var(--violet-primary)' : 'var(--border-subtle)',
                    color: Number(tenureYears) === yr ? 'var(--violet-primary)' : 'var(--text-secondary)',
                    fontWeight: Number(tenureYears) === yr ? 700 : 500,
                  }}
                >
                  {yr} Years
                </button>
              ))}
            </div>
          </div>

          {/* 4. Annual Step-Up */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <label className="fin-label" style={{ margin: 0, fontWeight: 700 }}>Annual Step-Up</label>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Increase SIP as your income grows</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(19, 168, 158, 0.3)', padding: '0.25rem 0.6rem', boxShadow: 'var(--shadow-xs)' }}>
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
                    color: 'var(--teal-primary)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '45px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: 'var(--teal-primary)', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={Math.min(20, Math.max(0, Number(stepUpPct) || 0))}
              onChange={(e) => setStepUpPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal-primary)' }}
            />
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.65rem' }}>
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  className="btn btn-outline"
                  onClick={() => setStepUpPct(pct)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.72rem',
                    background: Number(stepUpPct) === pct ? 'var(--teal-soft)' : '#FFFFFF',
                    borderColor: Number(stepUpPct) === pct ? 'var(--teal-primary)' : 'var(--border-subtle)',
                    color: Number(stepUpPct) === pct ? 'var(--teal-primary)' : 'var(--text-secondary)',
                    fontWeight: Number(stepUpPct) === pct ? 700 : 500,
                  }}
                >
                  {pct === 0 ? 'No Step-Up' : `+${pct}% / yr`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Inflation Rate */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <label className="fin-label" style={{ margin: 0, fontWeight: 700 }}>Inflation Rate (CPI)</label>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>To compute future purchasing power</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '0.25rem 0.6rem', boxShadow: 'var(--shadow-xs)' }}>
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
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    width: '50px',
                    outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, marginLeft: '0.2rem', fontSize: '0.9rem' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              value={Math.min(10, Math.max(3, Number(inflationPct) || 6))}
              onChange={(e) => setInflationPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Results Projection Card */}
        {result && (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Wealth Projection Summary</h3>
              {loading && <span style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 600 }}>Recalculating...</span>}
            </div>

            {/* Maturity Big Card */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--violet-soft) 0%, var(--teal-soft) 100%)', border: '1px solid rgba(112, 71, 255, 0.25)', textAlign: 'center', padding: '1.85rem 1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ESTIMATED MATURITY WEALTH
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                ₹{maturityWealth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.65rem' }}>
                <span className="badge badge-teal" style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}>
                  Total Gained: +₹{wealthGained.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Key Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-card" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL INVESTED</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                  ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your out-of-pocket savings</span>
              </div>

              <div className="glass-card" style={{ background: '#F8FAFC' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>REAL PURCHASING POWER</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B45309', marginTop: '0.3rem' }}>
                  ₹{realPurchasingPower.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Adjusted for {inflationPct}% inflation</span>
              </div>
            </div>

            {/* Visual Compounding Ratio Bar */}
            {maturityWealth > 0 && (
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invested: {Math.round((totalInvested / maturityWealth) * 100)}%</span>
                  <span style={{ color: 'var(--teal-primary)', fontWeight: 700 }}>Wealth Gain: {Math.round((wealthGained / maturityWealth) * 100)}%</span>
                </div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: '#E2E8F0' }}>
                  <div style={{ width: `${Math.min(100, Math.round((totalInvested / maturityWealth) * 100))}%`, background: '#94A3B8' }} title="Invested Capital" />
                  <div style={{ width: `${Math.max(0, 100 - Math.round((totalInvested / maturityWealth) * 100))}%`, background: 'var(--teal-primary)' }} title="Compound Gains" />
                </div>
              </div>
            )}

            {/* Scenarios Comparison Table */}
            {result.scenarios && result.scenarios.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  Return Rate Sensitivity (Conservative vs Aggressive)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {result.scenarios.map((sc, idx) => {
                    const scMaturity = Number(sc.estimated_value ?? sc.maturity_amount ?? 0);
                    const scLabel = sc.label ?? sc.scenario_name ?? `${sc.annual_return_pct}%`;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.83rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{scLabel} ({sc.annual_return_pct}%)</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
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
