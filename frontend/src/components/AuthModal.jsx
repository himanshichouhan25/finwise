import React, { useState } from 'react';
import { Lock, Mail, User, Sparkles, X, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { loginUser, registerUser, demoLogin, PERSONAS } from '../api/client';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State: Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form State: Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPersona, setRegPersona] = useState('student');
  const [regLanguage, setRegLanguage] = useState('en');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        onSuccess?.(res.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
      setSuccessMsg(`Account created for ${res.user.name}!`);
      setTimeout(() => {
        onSuccess?.(res.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (persona) => {
    setError(null);
    setLoading(true);
    try {
      const res = await demoLogin(persona.id);
      setSuccessMsg(`Logged in as demo persona: ${res.user.name}`);
      setTimeout(() => {
        onSuccess?.(res.user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-surface-elevated, #151F33)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(20, 184, 166, 0.15)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
                FinWise <span style={{ color: '#2DD4BF' }}>Auth</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                JWT Protected • Data Isolated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          background: 'rgba(0, 0, 0, 0.2)',
        }}>
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            style={{
              padding: '0.75rem',
              background: activeTab === 'login' ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
              color: activeTab === 'login' ? '#2DD4BF' : '#94A3B8',
              border: 'none',
              borderBottom: activeTab === 'login' ? '2px solid #2DD4BF' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            style={{
              padding: '0.75rem',
              background: activeTab === 'register' ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
              color: activeTab === 'register' ? '#2DD4BF' : '#94A3B8',
              border: 'none',
              borderBottom: activeTab === 'register' ? '2px solid #2DD4BF' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              color: '#5EEAD4',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="aarav@finwise.ai"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <KeyRound size={16} />
                <span>{loading ? 'Authenticating...' : 'Sign In with JWT'}</span>
              </button>

              {/* Quick Demo Login Pills */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.65rem', textAlign: 'center' }}>
                  Quick Login with Pre-Seeded Personas:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickDemoLogin(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                        borderRadius: '6px',
                        color: '#F8FAFC',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#14B8A6' }} />
                        <strong>{p.name}</strong> ({p.role})
                      </div>
                      <span style={{ color: '#2DD4BF', fontSize: '0.7rem' }}>1-Click Login →</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Password (min. 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Financial Stage
                  </label>
                  <select
                    className="fin-select"
                    value={regPersona}
                    onChange={(e) => setRegPersona(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.8rem' }}
                  >
                    <option value="student">Student</option>
                    <option value="first_job">First-Job Earner</option>
                    <option value="gig_worker">Gig Worker</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Language
                  </label>
                  <select
                    className="fin-select"
                    value={regLanguage}
                    onChange={(e) => setRegLanguage(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.8rem' }}
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
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Creating Account...' : 'Register & Log In'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

