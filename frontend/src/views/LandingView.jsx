import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Target,
  BotMessageSquare,
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  BarChart3,
  PieChart,
  Zap,
  Award
} from 'lucide-react';
import { loginUser, registerUser, demoLogin, PERSONAS } from '../api/client';

export default function LandingView({ onAuthSuccess, onExploreDemo }) {
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPersona, setRegPersona] = useState('student');
  const [regLanguage, setRegLanguage] = useState('en');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      setSuccessMsg(`Welcome back, ${res.user.name}! Entering your financial dashboard…`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        persona: regPersona,
        language_pref: regLanguage,
      });
      setSuccessMsg(`Account created for ${res.user.name}! Logging you in…`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
      }, 600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = async (personaId) => {
    setError(null);
    setLoading(true);
    try {
      const res = await demoLogin(personaId);
      setSuccessMsg(`Logged in as demo persona: ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
      }, 500);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #152238 0%, #080C14 70%)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── TOP NAV ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(20, 184, 166, 0.5)'
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              FinWise <span style={{ color: '#2DD4BF' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: 0 }}>
              AI Financial Coach for First-Time Investors
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} color="#F59E0B" /> MNIT Jaipur Hackathon
          </span>
          <button
            onClick={() => onExploreDemo?.()}
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            Explore as Guest
          </button>
        </div>
      </header>

      {/* ── HERO & AUTH CONTAINER ── */}
      <main style={{ flex: 1, maxWidth: '1300px', margin: '0 auto', padding: '3rem 2rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '3.5rem', alignItems: 'center' }}>

          {/* Left Column: Product Vision & Highlights */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', borderRadius: '999px',
              background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.3)',
              color: '#2DD4BF', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.5rem',
            }}>
              <Zap size={14} /> Problem Statement 3.1 • AI Financial Coach
            </div>

            <h2 style={{
              fontSize: '2.8rem',
              fontFamily: 'Fraunces, serif',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '1.25rem',
            }}>
              Don't just track your money.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #2DD4BF 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Understand it.
              </span>
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '560px',
            }}>
              Built specifically for <strong>college students, first-job earners, and young professionals</strong>.
              Question shady influencer claims, calculate how impulse buying delays your goals, manage your loans, and plan disciplined SIP wealth.
            </p>

            {/* Feature Highlights Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.25rem' }}>
              {[
                { icon: ShieldAlert, color: '#EF4444', title: 'Finfluencer Audit', desc: 'SEBI-aligned scam detection' },
                { icon: CreditCard, color: '#F59E0B', title: 'Loan & EMI Manager', desc: 'Amortization & prepayment savings' },
                { icon: Target, color: '#14B8A6', title: 'Goal-Days Delayed', desc: 'See delay from impulse spends' },
                { icon: BotMessageSquare, color: '#A78BFA', title: 'AI Financial Coach', desc: 'Context-aware Groq LLaMA 3.3' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem', borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F8FAFC' }}>{title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick 1-Click Demo Shortcut */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-subtle)',
              borderRadius: '14px', padding: '1rem 1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Or Test Instantly with Seeded Demo Personas:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handle1ClickDemo(p.id)}
                    style={{
                      flex: 1, minWidth: '130px', padding: '0.5rem 0.65rem', borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)',
                      color: '#F8FAFC', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(20, 184, 166, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#14B8A6' }}>{p.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Auth Form Card */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2rem 2.25rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(20, 184, 166, 0.08)',
          }}>
            {/* Tab Switcher */}
            <div style={{
              display: 'flex', background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px', padding: '0.35rem', marginBottom: '1.5rem',
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setError(null); }}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: 700, transition: 'all 0.2s ease',
                  background: authMode === 'register' ? 'linear-gradient(135deg, #14B8A6, #0D9488)' : 'transparent',
                  color: authMode === 'register' ? '#FFFFFF' : '#94A3B8',
                  boxShadow: authMode === 'register' ? '0 4px 15px rgba(20, 184, 166, 0.35)' : 'none',
                }}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); }}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: 700, transition: 'all 0.2s ease',
                  background: authMode === 'login' ? 'linear-gradient(135deg, #14B8A6, #0D9488)' : 'transparent',
                  color: authMode === 'login' ? '#FFFFFF' : '#94A3B8',
                  boxShadow: authMode === 'login' ? '0 4px 15px rgba(20, 184, 166, 0.35)' : 'none',
                }}
              >
                Sign In
              </button>
            </div>

            {/* Feedback Banners */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem',
              }}>
                <AlertCircle size={16} flexShrink={0} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)',
                color: '#2DD4BF', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem',
              }}>
                <CheckCircle2 size={16} flexShrink={0} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* CREATE ACCOUNT FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      className="fin-input"
                      placeholder="e.g. Himanshi Chouhan"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      className="fin-input"
                      placeholder="e.g. himanshi@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Password * (Min 6 chars)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="fin-input"
                      placeholder="Create a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Profile Persona
                    </label>
                    <select
                      className="fin-select"
                      value={regPersona}
                      onChange={(e) => setRegPersona(e.target.value)}
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="student">Student</option>
                      <option value="first_job">First-Job Earner</option>
                      <option value="gig_worker">Freelancer / Gig</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      Language
                    </label>
                    <select
                      className="fin-select"
                      value={regLanguage}
                      onChange={(e) => setRegLanguage(e.target.value)}
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="en">English</option>
                      <option value="hinglish">Hinglish</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-teal"
                  style={{
                    width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700,
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  <Sparkles size={16} />
                  {loading ? 'Creating Your Account…' : 'Start My Financial Journey'}
                </button>
              </form>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      className="fin-input"
                      placeholder="e.g. himanshi@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      className="fin-input"
                      placeholder="Your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-teal"
                  style={{
                    width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700,
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  <KeyRound size={16} />
                  {loading ? 'Authenticating…' : 'Sign In to FinWise'}
                </button>
              </form>
            )}

            <div style={{
              marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center', fontSize: '0.75rem', color: '#64748B',
            }}>
              🔒 Cryptographically secured with HS256 JWT & bcrypt password hashing
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.9)',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748B',
      }}>
        FinWise AI • MNIT Jaipur 24-Hour Hackathon • Domain 3.1: AI Financial Coach for First-Time Investors
      </footer>
    </div>
  );
}
