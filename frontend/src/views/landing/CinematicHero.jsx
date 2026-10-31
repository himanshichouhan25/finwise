import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Cpu,
  TrendingUp,
  BarChart2,
  Lock
} from 'lucide-react';
import HolographicEarthGlobe from './HolographicEarthGlobe';

export default function CinematicHero({ onOpenAuth, onExploreDemo }) {
  return (
    <section
      id="overview"
      className="cs-dark-editorial"
      style={{
        paddingTop: '5.5rem',
        paddingBottom: '6.5rem',
        background: 'radial-gradient(ellipse at 75% 35%, #0B1938 0%, #050A17 55%, #020409 100%)',
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 1. Deep Space Atmospheric Corona Glow behind Globe */}
      <div
        style={{
          position: 'absolute',
          top: '2%',
          right: '5%',
          width: '720px',
          height: '720px',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.22) 0%, rgba(37, 99, 235, 0.14) 40%, transparent 72%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 2. Floating Neon Financial Candlestick Bars in Background Depth */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          right: '4%',
          width: '580px',
          height: '420px',
          pointerEvents: 'none',
          opacity: 0.32,
          zIndex: 0,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 580 420" fill="none">
          {/* Subtle Grid */}
          <line x1="20" y1="80" x2="560" y2="80" stroke="rgba(0, 242, 254, 0.12)" strokeDasharray="4 4" />
          <line x1="20" y1="180" x2="560" y2="180" stroke="rgba(0, 242, 254, 0.12)" strokeDasharray="4 4" />
          <line x1="20" y1="280" x2="560" y2="280" stroke="rgba(0, 242, 254, 0.12)" strokeDasharray="4 4" />

          {/* Luminous Candlestick Bars (Teal & Amber) */}
          <g opacity="0.85">
            {/* Candle 1 */}
            <line x1="80" y1="140" x2="80" y2="260" stroke="#00F2FE" strokeWidth="1.5" />
            <rect x="73" y="170" width="14" height="60" rx="3" fill="#00F2FE" fillOpacity="0.45" stroke="#00F2FE" strokeWidth="1.5" />

            {/* Candle 2 */}
            <line x1="140" y1="110" x2="140" y2="230" stroke="#00F2FE" strokeWidth="1.5" />
            <rect x="133" y="130" width="14" height="70" rx="3" fill="#00F2FE" fillOpacity="0.55" stroke="#00F2FE" strokeWidth="1.5" />

            {/* Candle 3 (Dip) */}
            <line x1="200" y1="160" x2="200" y2="290" stroke="#F59E0B" strokeWidth="1.5" />
            <rect x="193" y="190" width="14" height="65" rx="3" fill="#F59E0B" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="1.5" />

            {/* Candle 4 */}
            <line x1="260" y1="90" x2="260" y2="220" stroke="#00F2FE" strokeWidth="1.5" />
            <rect x="253" y="110" width="14" height="80" rx="3" fill="#00F2FE" fillOpacity="0.6" stroke="#00F2FE" strokeWidth="1.5" />

            {/* Candle 5 */}
            <line x1="320" y1="60" x2="320" y2="190" stroke="#00F2FE" strokeWidth="1.5" />
            <rect x="313" y="80" width="14" height="85" rx="3" fill="#00F2FE" fillOpacity="0.75" stroke="#00F2FE" strokeWidth="1.5" />

            {/* Candle 6 */}
            <line x1="380" y1="50" x2="380" y2="170" stroke="#00F2FE" strokeWidth="1.5" />
            <rect x="373" y="70" width="14" height="65" rx="3" fill="#00F2FE" fillOpacity="0.8" stroke="#00F2FE" strokeWidth="1.5" />

            {/* Candle 7 */}
            <line x1="440" y1="40" x2="440" y2="150" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="433" y="55" width="14" height="60" rx="3" fill="#38BDF8" fillOpacity="0.85" stroke="#38BDF8" strokeWidth="1.5" />

            {/* Candle 8 */}
            <line x1="500" y1="20" x2="500" y2="130" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="493" y="35" width="14" height="65" rx="3" fill="#FFFFFF" fillOpacity="0.9" stroke="#00F2FE" strokeWidth="1.8" />
          </g>

          {/* Glowing Continuous Trend Line */}
          <path
            d="M 50 220 Q 140 180, 200 230 T 320 120 T 440 80 T 540 40"
            fill="none"
            stroke="#00F2FE"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0 0 8px #00F2FE)"
          />
        </svg>
      </div>

      {/* 3. 3D Perspective Cyber Horizon Grid at Base */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 242, 254, 0.05) 50%, rgba(0, 242, 254, 0.12) 100%)',
          pointerEvents: 'none',
          borderTop: '1px solid rgba(0, 242, 254, 0.25)',
          maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
        }}
      />

      <div className="cs-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>

        {/* ARC Top Command Telemetry Pill Bar (Exact Match to User Reference Screenshot) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 1.15rem',
            background: 'rgba(8, 16, 36, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 242, 254, 0.28)',
            borderRadius: '9999px',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(0, 242, 254, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F2FE', boxShadow: '0 0 8px #00F2FE' }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', color: '#E2E8F0' }}>
              ARC / FINWISE <span style={{ color: '#00F2FE' }}>•</span> AUTONOMOUS FINANCIAL COMMANDER
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(0, 242, 254, 0.12)', color: '#38BDF8', border: '1px solid rgba(0, 242, 254, 0.25)', fontWeight: 700 }}>
              01 1010 AI DIGITAL TWIN
            </span>
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.14)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.25)', fontWeight: 700 }}>
              09 COMMAND CENTER
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              <span>SYSTEM NOMINAL</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              12.4K ops/s <span style={{ color: '#38BDF8' }}>LIVE</span>
            </span>
          </div>
        </div>

        {/* Main Split Grid */}
        <div
          className="cs-hero-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Oversized Editorial Copy (Matching ARC Screen Stature) */}
          <div>
            <div className="cs-eyebrow cs-eyebrow-dark">
              <Sparkles size={14} color="#00F2FE" /> Problem Statement 3.1 • AI Financial Coach
            </div>

            <h1 className="cs-headline-hero" style={{ marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Your money <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 25%, #93C5FD 65%, #00F2FE 100%)',
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
                marginBottom: '1.75rem',
              }}
            >
              Understand your money. Challenge financial claims. Make smarter decisions with your AI financial coach.
            </p>

            {/* ARC Action Pipeline Badges (DETECT. INVESTIGATE. DECIDE. RECOVER. VERIFY.) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.35)', color: '#00F2FE', fontWeight: 800 }}>
                DETECT
              </span>
              <span style={{ color: '#64748B', fontSize: '0.8rem' }}>•</span>
              <span style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38BDF8', fontWeight: 800 }}>
                AUDIT CLAIMS
              </span>
              <span style={{ color: '#64748B', fontSize: '0.8rem' }}>•</span>
              <span style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.35)', color: '#818CF8', fontWeight: 800 }}>
                PLAN GOALS
              </span>
              <span style={{ color: '#64748B', fontSize: '0.8rem' }}>•</span>
              <span style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10B981', fontWeight: 800 }}>
                RECOVER
              </span>
              <span style={{ color: '#64748B', fontSize: '0.8rem' }}>•</span>
              <span style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#F59E0B', fontWeight: 800 }}>
                VERIFY
              </span>
            </div>

            {/* CTAs */}
            <div className="cs-hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                className="cs-btn cs-btn-primary"
                style={{ padding: '0.95rem 2rem', fontSize: '1.02rem', background: 'linear-gradient(135deg, #2563EB, #00F2FE)', color: '#0F172A', fontWeight: 800 }}
              >
                Explore FinWise <ArrowRight size={18} />
              </button>
              <a
                href="#problem"
                className="cs-btn cs-btn-glass-hero"
                style={{ padding: '0.95rem 1.8rem', fontSize: '1.02rem', borderColor: 'rgba(0, 242, 254, 0.3)' }}
              >
                See How It Works
              </a>
            </div>

            {/* Micro Credibility Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#94A3B8' }}>
                <ShieldCheck size={16} color="#00F2FE" />
                <span>Deterministic Python Engines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#94A3B8' }}>
                <Activity size={16} color="#38BDF8" />
                <span>Zero Math Hallucinations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Ultra-Realistic Luminous Holographic 3D Earth Globe with HUD Telemetry */}
          <div style={{ position: 'relative' }}>
            <HolographicEarthGlobe />
          </div>

        </div>
      </div>
    </section>
  );
}
