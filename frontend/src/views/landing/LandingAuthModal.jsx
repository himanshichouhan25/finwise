import React, { useState } from 'react';
import {
  X,
  Sparkles,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { loginUser, registerUser, demoLogin, PERSONAS } from '../../api/client';

export default function LandingAuthModal({ isOpen, initialMode = 'register', onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState(initialMode); // 'register' | 'login'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('student');
  const [language, setLanguage] = useState('en');

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        persona,
        language_pref: language,
      });
      setSuccessMsg(`Welcome to FinWise AI, ${res.user.name}! Opening your dashboard…`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
        onClose?.();
      }, 600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({
        email: email.trim(),
        password,
      });
      setSuccessMsg(`Welcome back, ${res.user.name}! Entering dashboard…`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
        onClose?.();
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = async (personaId) => {
    setError(null);
    setLoading(true);
    try {
      const res = await demoLogin(personaId);
      setSuccessMsg(`Entering as ${res.user.name}…`);
      setTimeout(() => {
        onAuthSuccess?.(res.user);
        onClose?.();
      }, 500);
    } catch (err) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(17, 24, 39, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1000,
        animation: 'lpFadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="lp-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2rem 2.25rem',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 25px 60px -10px rgba(16, 24, 40, 0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--lp-bg-soft)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--lp-text-muted)',
            transition: 'background 0.15s ease',
          }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--lp-brand-violet) 0%, var(--lp-brand-violet-dark) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(109, 74, 255, 0.3)',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--lp-text-primary)', margin: '0 0 0.25rem 0' }}>
            {authMode === 'register' ? 'Create Your Free Account' : 'Welcome Back to FinWise'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-muted)', margin: 0 }}>
            {authMode === 'register'
              ? 'Start your journey to intelligent personal financial planning'
              : 'Sign in to access your budget, goals, and AI financial coach'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--lp-bg-soft)',
            borderRadius: '12px',
            padding: '0.3rem',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: authMode === 'register' ? '#FFFFFF' : 'transparent',
              color: authMode === 'register' ? 'var(--lp-brand-violet)' : 'var(--lp-text-muted)',
              boxShadow: authMode === 'register' ? 'var(--lp-shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: authMode === 'login' ? '#FFFFFF' : 'transparent',
              color: authMode === 'login' ? 'var(--lp-brand-violet)' : 'var(--lp-text-muted)',
              boxShadow: authMode === 'login' ? 'var(--lp-shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--lp-brand-teal-soft)',
              border: '1px solid rgba(15, 159, 154, 0.3)',
              color: 'var(--lp-brand-teal)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM: REGISTER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--lp-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Himanshi Chouhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.88rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--lp-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. himanshi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.88rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Password * (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--lp-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.88rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Persona
                </label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.82rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                  }}
                >
                  <option value="student">Student</option>
                  <option value="first_job">First-Job Earner</option>
                  <option value="gig_worker">Freelancer / Gig</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.82rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                  }}
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lp-btn lp-btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Creating Account…' : 'Start My Financial Journey'}
            </button>
          </form>
        )}

        {/* FORM: LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--lp-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. himanshi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.88rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--lp-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--lp-border-subtle)',
                    fontSize: '0.88rem',
                    background: '#FFFFFF',
                    color: 'var(--lp-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lp-btn lp-btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        {/* 1-Click Demo Shortcut */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--lp-border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--lp-brand-violet)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem', textAlign: 'center' }}>
            ⚡ Or 1-Click Instant Demo Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handle1ClickDemo(p.id)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: 'var(--lp-bg-soft)',
                  border: '1px solid var(--lp-border-subtle)',
                  color: 'var(--lp-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--lp-bg-lavender)'; e.currentTarget.style.color = 'var(--lp-brand-violet)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--lp-bg-soft)'; e.currentTarget.style.color = 'var(--lp-text-primary)'; }}
              >
                <div>{p.name.split(' ')[0]}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lp-text-muted)' }}>{p.tier}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
