import React, { useState } from 'react';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import SectionArtifacts from './SectionArtifacts';

export default function StoryTradeOff({ onOpenAuth }) {
  // Interactive Simulation State
  const [purchaseAmount, setPurchaseAmount] = useState(15000);
  const monthlyGoalSavings = 25000; // Sample reference from Aarav/Student persona
  const dailySavingsRate = monthlyGoalSavings / 30; // ~₹833.33/day
  const daysDelayed = Math.round(purchaseAmount / dailySavingsRate);

  return (
    <section 
      style={{ 
        padding: '7rem 0', 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFBEB 35%, #FEF3C7 70%, #F8FAFC 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <SectionArtifacts variant="tradeoff" glowPosition="both" />
      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="cs-eyebrow cs-eyebrow-light" style={{ background: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A' }}>
            <Clock size={14} /> Signature Behavioral FinTech
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Every decision has a trade-off. <br />
            <span style={{ color: '#D97706' }}>See it before you make it.</span>
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
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 60%, #FEF3C7 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 25px 50px -10px rgba(245, 158, 11, 0.15), 0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left: Interactive Controls */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
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
                  style={{ width: '100%', accentColor: '#D97706', cursor: 'pointer' }}
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
                <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 650, marginTop: '2px' }}>
                  Current Pace: ₹25,000 / month (₹833 / day)
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--cs-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="#D97706" />
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
                boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.12)',
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
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem', background: '#D97706' }}
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
