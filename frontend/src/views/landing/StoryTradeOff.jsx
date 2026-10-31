import React, { useState } from 'react';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function StoryTradeOff({ onOpenAuth }) {
  // Interactive Simulation State
  const [purchaseAmount, setPurchaseAmount] = useState(15000);
  const monthlyGoalSavings = 25000; // Sample reference from Aarav/Student persona
  const dailySavingsRate = monthlyGoalSavings / 30; // ~₹833.33/day
  const daysDelayed = Math.round(purchaseAmount / dailySavingsRate);

  return (
    <section style={{ padding: '7rem 0', background: 'var(--cs-bg-white)', position: 'relative' }}>
      <div className="cs-container">
        {/* Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="cs-eyebrow cs-eyebrow-light">
            <Clock size={14} /> Signature Behavioral FinTech
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Every decision has a trade-off. <br />
            <span style={{ color: 'var(--cs-violet)' }}>See it before you make it.</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6 }}>
            FinWise AI calculates your ground-truth daily savings capacity. When you contemplate an impulse purchase,
            it translates that monetary spend into the exact calendar days your primary goal is delayed.
          </p>
        </div>

        {/* Interactive Simulator Showcase Card */}
        <div
          className="cs-editorial-card"
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '3rem',
            background: 'linear-gradient(135deg, #FAF7FF 0%, #FFFFFF 60%, #F1F5F9 100%)',
            border: '1.5px solid rgba(109, 74, 255, 0.25)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left: Interactive Controls */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-violet)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Interactive Trade-off Simulator
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '1.5rem' }}>
                Test an impulse purchase
              </h3>

              {/* Amount Range Slider */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cs-text-secondary)' }}>
                    Contemplated Expense
                  </label>
                  <span style={{ fontSize: '1.35rem', fontWeight: 850, color: '#EF4444' }}>
                    ₹{purchaseAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--cs-violet)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--cs-text-muted)', marginTop: '0.35rem' }}>
                  <span>₹2,000 (Dinner/Shoes)</span>
                  <span>₹25,000 (Weekend Trip)</span>
                  <span>₹50,000 (Laptop)</span>
                </div>
              </div>

              {/* Active Goal Context */}
              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '1rem', border: '1px solid var(--cs-border-light)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)' }}>Target Savings Goal</div>
                <div style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--cs-text-primary)' }}>Emergency Runway • Target ₹80,000</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cs-teal)', fontWeight: 650, marginTop: '2px' }}>
                  Current Pace: ₹25,000 / month (₹833 / day)
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--cs-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--cs-violet)" />
                <span>Calculated via FinWise Goal Delay Engine</span>
              </div>
            </div>

            {/* Right: Calculated Calendar Delay Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                border: '2px solid rgba(239, 68, 68, 0.25)',
                boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.1)',
                textAlign: 'center',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Clock size={26} color="#DC2626" />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Goal Postponement Result
              </div>

              <div style={{ fontSize: '3.5rem', fontWeight: 950, color: '#DC2626', lineHeight: 1.05 }}>
                +{daysDelayed} Days
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, marginTop: '0.85rem', marginBottom: '1.5rem' }}>
                Spending <strong>₹{purchaseAmount.toLocaleString('en-IN')}</strong> will postpone your Emergency Fund goal
                completion by an additional <strong>{daysDelayed} calendar days</strong> of work.
              </p>

              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                className="cs-btn cs-btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
              >
                Put on 24h Cooling-Off Timer <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
