import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, Calendar, Shield, Sparkles } from 'lucide-react';
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
        monthly_investment: Number(monthlyInvestment),
        annual_return_pct: Number(annualReturn),
        tenure_years: Number(tenureYears),
        step_up_pct: Number(stepUpPct),
        inflation_rate_pct: Number(inflationPct),
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

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            Compounding SIP Simulator & Inflation Adjuster
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Pure Python annuity compounding engine with annual step-up increment and real purchasing power adjustment.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-teal">Nifty 50 Historical: ~12.5%</span>
          <span className="badge badge-slate">Inflation: ~6.0%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Controls Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>Investment Parameters</h3>

          {/* Monthly Investment */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="fin-label">Monthly SIP Amount</label>
              <span style={{ fontWeight: 700, color: '#2DD4BF' }}>₹{Number(monthlyInvestment).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(e.target.value)}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[1000, 3000, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  className="btn btn-outline"
                  onClick={() => setMonthlyInvestment(amt)}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Return */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="fin-label">Expected Annual Return (%)</label>
              <span style={{ fontWeight: 700, color: '#F59E0B' }}>{annualReturn}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
              style={{ width: '100%', accentColor: '#F59E0B' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>
              <span>FD (7%)</span>
              <span>Gold (10.5%)</span>
              <span>Nifty Index (12.5%)</span>
              <span>Aggressive (15%)</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="fin-label">Tenure (Years)</label>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
          </div>

          {/* Annual Step-Up */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="fin-label">Annual Step-Up (% increment each year)</label>
              <span style={{ fontWeight: 700, color: '#2DD4BF' }}>{stepUpPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={stepUpPct}
              onChange={(e) => setStepUpPct(e.target.value)}
              style={{ width: '100%', accentColor: '#14B8A6' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Increase your SIP as your salary grows annually</span>
          </div>

          {/* Inflation Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="fin-label">Annual Inflation Rate (%)</label>
              <span style={{ fontWeight: 700, color: '#94A3B8' }}>{inflationPct}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              value={inflationPct}
              onChange={(e) => setInflationPct(e.target.value)}
              style={{ width: '100%', accentColor: '#94A3B8' }}
            />
          </div>
        </div>

        {/* Results Projection Card */}
        {result && (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>Wealth Projection Summary</h3>

            {/* Maturity Big Card */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)', border: '1px solid rgba(20, 184, 166, 0.35)', textAlign: 'center', padding: '1.75rem 1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>ESTIMATED MATURITY WEALTH</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.25rem' }}>
                ₹{Number(result.maturity_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge badge-teal">
                  Total Gained: +₹{Number(result.wealth_gained).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Key Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-card">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>TOTAL INVESTED</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
                  ₹{Number(result.total_invested).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Your out-of-pocket savings</span>
              </div>

              <div className="glass-card">
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>REAL PURCHASING POWER</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.25rem' }}>
                  ₹{Number(result.inflation_adjusted_maturity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Adjusted for {inflationPct}% inflation</span>
              </div>
            </div>

            {/* Scenarios Comparison Table */}
            {result.scenarios && result.scenarios.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.5rem' }}>
                  Return Rate Sensitivity (Conservative vs Aggressive)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.scenarios.map((sc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span style={{ color: '#CBD5E1' }}>{sc.scenario_name} ({sc.annual_return_pct}%)</span>
                      <span style={{ fontWeight: 700, color: '#F8FAFC' }}>₹{Number(sc.maturity_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
