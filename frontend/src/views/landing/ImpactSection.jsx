import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function ImpactSection() {
  const comparisons = [
    {
      feature: 'Financial AI Assistant',
      traditional: 'Generic scripted chatbot or none',
      finwise: 'Context-aware Groq LLaMA 3.3 with real-time financial snapshot injection',
    },
    {
      feature: 'Calculation Engine',
      traditional: 'Static formula sheets or LLM arithmetic hallucinations',
      finwise: '100% Deterministic Python math engines with SEBI compliance guardrails',
    },
    {
      feature: 'Impulse Spend Feedback',
      traditional: 'Shows transaction debit alert after money is gone',
      finwise: 'Goal-Days Delayed: Translates spend into exact postponed calendar days',
    },
    {
      feature: 'Social Media Stock Claims',
      traditional: 'Zero protection against viral fake returns',
      finwise: 'Automated CAGR math check & SEBI violation scam detector',
    },
    {
      feature: 'Debt & Loan Management',
      traditional: 'Simple EMI listing without strategy',
      finwise: 'Reducing-balance amortization schedules & Avalanche/Snowball prepayment simulator',
    },
    {
      feature: 'SIP Wealth Modeling',
      traditional: 'Basic flat CAGR projection',
      finwise: 'Monthly annuity due with annual step-up and 5.5% inflation discounting',
    },
  ];

  return (
    <section id="impact" style={{ padding: '6rem 0', background: 'var(--lp-bg-soft)', position: 'relative' }}>
      <div className="lp-container">
        {/* Header */}
        <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="lp-badge lp-badge-teal" style={{ marginBottom: '1rem' }}>
            Why FinWise AI Stands Out
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            More than tracking.{' '}
            <span className="lp-gradient-text">A better way to think about money.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>
            Traditional expense apps record history. FinWise AI empowers you to change the future.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div
          className="lp-card"
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 'var(--lp-shadow-lg)',
            border: '1px solid var(--lp-border-subtle)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '2px solid var(--lp-border-light)' }}>
                  <th style={{ padding: '1.25rem 1.75rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--lp-text-secondary)', width: '28%' }}>
                    Capability
                  </th>
                  <th style={{ padding: '1.25rem 1.75rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--lp-text-muted)', width: '32%' }}>
                    Traditional Expense Apps
                  </th>
                  <th style={{ padding: '1.25rem 1.75rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--lp-brand-violet)', background: 'var(--lp-bg-lavender)', width: '40%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} /> FinWise AI Intelligence
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, idx) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: '1px solid var(--lp-border-light)',
                      background: idx % 2 === 0 ? '#FFFFFF' : 'var(--lp-bg-soft)',
                    }}
                  >
                    <td style={{ padding: '1.25rem 1.75rem', fontSize: '0.92rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '1.25rem 1.75rem', fontSize: '0.85rem', color: 'var(--lp-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <X size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.75rem', fontSize: '0.88rem', color: 'var(--lp-text-primary)', fontWeight: 600, background: idx % 2 === 0 ? 'rgba(244, 240, 255, 0.45)' : 'rgba(244, 240, 255, 0.75)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <Check size={18} color="var(--lp-brand-violet)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{row.finwise}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
