import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Target,
  BotMessageSquare,
  Activity,
  Compass
} from 'lucide-react';

export default function CinematicHero({ onOpenAuth, onExploreDemo }) {
  return (
    <section
      id="overview"
      className="cs-dark-editorial"
      style={{
        paddingTop: '6.5rem',
        paddingBottom: '7rem',
        background: 'radial-gradient(ellipse at 50% 0%, #151D2F 0%, #090D16 75%)',
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(109, 74, 255, 0.18) 0%, rgba(15, 159, 154, 0.1) 45%, transparent 75%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <div className="cs-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div
          className="cs-hero-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Oversized Editorial Copy */}
          <div>
            <div className="cs-eyebrow cs-eyebrow-dark">
              <Sparkles size={14} color="#B4A2FE" /> Problem Statement 3.1 • AI Financial Coach
            </div>

            <h1 className="cs-headline-hero" style={{ marginBottom: '1.5rem' }}>
              Your money <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 30%, #B4A2FE 70%, #2DD4BF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                has a future.
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                lineHeight: 1.6,
                color: 'var(--cs-text-light-sub)',
                maxWidth: '560px',
                marginBottom: '2.5rem',
              }}
            >
              Understand your money. Challenge financial claims. Make smarter decisions with your AI financial coach.
            </p>

            {/* CTAs */}
            <div className="cs-hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                className="cs-btn cs-btn-primary"
                style={{ padding: '0.95rem 2rem', fontSize: '1.02rem' }}
              >
                Explore FinWise <ArrowRight size={18} />
              </button>
              <a
                href="#problem"
                className="cs-btn cs-btn-glass-hero"
                style={{ padding: '0.95rem 1.8rem', fontSize: '1.02rem' }}
              >
                See How It Works
              </a>
            </div>

            {/* Micro Credibility Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#94A3B8' }}>
                <ShieldCheck size={16} color="#0F9F9A" />
                <span>Deterministic Python Engines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#94A3B8' }}>
                <Activity size={16} color="#8B6EFE" />
                <span>Zero Math Hallucinations</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Luminous Sphere & Financial Orbit Stage */}
          <div style={{ position: 'relative' }}>
            <div className="cs-luminous-stage">
              {/* Diffuse Core Glow */}
              <div className="cs-orbit-glow-disc" />

              {/* Orbit Rings */}
              <div className="cs-orbit-ring-1" />
              <div className="cs-orbit-ring-2" />

              {/* Luminous Central 3D Sphere */}
              <div className="cs-sphere-core" />

              {/* Integrated Financial Element 1: Health Diagnostic Pill (Top Left) */}
              <div
                className="cs-orbit-pill cs-float-1 cs-orbit-pill-desktop"
                style={{ top: '35px', left: '-15px' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(15, 159, 154, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color="#0F9F9A" />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#0F9F9A', fontWeight: 800, textTransform: 'uppercase' }}>Financial Health</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 850 }}>84 / 100 • Strong</div>
                </div>
              </div>

              {/* Integrated Financial Element 2: Goal Progress Pill (Top Right) */}
              <div
                className="cs-orbit-pill cs-float-2 cs-orbit-pill-desktop"
                style={{ top: '65px', right: '-25px' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(109, 74, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} color="#A78BFA" />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#A78BFA', fontWeight: 800, textTransform: 'uppercase' }}>Emergency Fund</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 850 }}>₹75,000 • 80% Saved</div>
                </div>
              </div>

              {/* Integrated Financial Element 3: AI Coach Active Insight (Bottom Center) */}
              <div
                className="cs-orbit-pill cs-float-1"
                style={{ bottom: '25px', left: '50%', transform: 'translateX(-50%)', minWidth: '290px' }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6D4AFF, #0F9F9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BotMessageSquare size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#2DD4BF', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2DD4BF' }} /> AI Financial Coach
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 650, color: '#E2E8F0', marginTop: '2px' }}>
                    "Wants allocation is 28%—saving ₹10.8K this month."
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

