import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Camera,
  Target, BookOpen, Activity, IndianRupee,
  TrendingUp, Bell, Shield, Trophy, Settings, HelpCircle,
  ChevronRight, Globe, Palette, Clock, Download,
  MessageSquare, LogOut, Star, Zap, Award, CheckCircle,
  ChevronDown, Volume2, AlertTriangle, Lightbulb, Megaphone,
  Lock, Key, Eye, Link, HeadphonesIcon, Send,
  BarChart2, Feather, Gem
} from 'lucide-react';
import {
  getAuthUser,
  getCurrentUser,
  getHealthScore,
  getGoals,
  getJournalSummary,
  getDashboardData,
  getProfile,
  logoutUser,
} from '../api/client';
import himanshiAvatar from '../assets/himanshi_avatar.png';
import profileBannerArt from '../assets/profile_banner_art.png';

/* ─── tiny helpers ─────────────────────────────────────────── */
const fmt = (n, prefix = '₹') =>
  n == null ? '—' : `${prefix}${Number(n).toLocaleString('en-IN')}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/* ─── Toggle Switch ─────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', border: 'none',
        cursor: 'pointer', transition: 'background 0.25s ease', flexShrink: 0,
        background: on
          ? 'linear-gradient(135deg, #14B8A6, #0D9488)'
          : 'rgba(100,116,139,0.4)',
        position: 'relative',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: on ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#FFFFFF',
        transition: 'left 0.25s ease',
        display: 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </button>
  );
}

/* ─── Section Header ────────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, color = '#14B8A6', extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{label}</span>
      </div>
      {extra}
    </div>
  );
}

/* ─── Clickable Row (Security / App Prefs / Support) ──────── */
function ArrowRow({ icon: Icon, iconBg, label, sublabel, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.85rem',
        width: '100%', padding: '0.75rem 0', border: 'none', cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderRadius: '8px', transition: 'background 0.15s ease', textAlign: 'left',
      }}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: iconBg || 'rgba(20,184,166,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color="#14B8A6" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{sublabel}</div>}
      </div>
      <ChevronRight size={16} color="#64748B" />
    </button>
  );
}

/* ─── Achievement Badge ─────────────────────────────────────── */
function AchievementCard({ icon: Icon, color, bg, title, subtitle, date }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      padding: '1rem 0.5rem',
      background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
      border: '1px solid var(--border-subtle)',
      textAlign: 'center', flex: 1, minWidth: 0,
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 15px ${color}33`,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{subtitle}</div>
      {date && <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{date}</div>}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function ProfileView({ onNavigateToTab }) {
  /* — state — */
  const [user, setUser] = useState(getAuthUser());
  const [health, setHealth] = useState(null);
  const [goals, setGoals] = useState([]);
  const [journal, setJournal] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    budget: true,
    savings: true,
    bills: true,
    insights: true,
    marketing: false,
  });

  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [currency, setCurrency] = useState('inr');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');

  /* — fetch all profile data — */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, healthRes, goalsRes, journalRes, dashRes, profileRes] = await Promise.allSettled([
        getCurrentUser(),
        getHealthScore(),
        getGoals(),
        getJournalSummary(),
        getDashboardData(),
        getProfile(),
      ]);
      if (meRes.status === 'fulfilled' && meRes.value) setUser(meRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
      if (goalsRes.status === 'fulfilled') setGoals(Array.isArray(goalsRes.value) ? goalsRes.value : []);
      if (journalRes.status === 'fulfilled') setJournal(journalRes.value);
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => { setUser(getAuthUser()); loadData(); };
    window.addEventListener('finwise_auth_changed', handler);
    window.addEventListener('finwise_persona_changed', handler);
    return () => {
      window.removeEventListener('finwise_auth_changed', handler);
      window.removeEventListener('finwise_persona_changed', handler);
    };
  }, [loadData]);

  /* — derived values — */
  const displayName = user?.name || 'FinWise User';
  const displayEmail = user?.email || 'user@finwise.ai';
  const displayRole = user?.persona || 'Student';
  const joinDate = user?.created_at ? fmtDate(user.created_at) : fmtDate(new Date().toISOString());
  const healthScore = health?.score ?? 78;
  const goalsCount = goals.length || 0;
  const decisionsLogged = journal?.total_entries ?? 24;
  const totalSavings = dashboard?.net_worth ?? dashboard?.summary?.net_worth ?? 21800;
  const journeyPct = Math.min(100, Math.round((healthScore / 100) * 100));

  /* — income range from profile — */
  const incomeRange = profile?.monthly_income
    ? profile.monthly_income >= 100000
      ? '₹1,00,000+'
      : profile.monthly_income >= 50000
        ? '₹50,000 – ₹1,00,000'
        : '₹25,000 – ₹50,000'
    : '₹50,000 – ₹1,00,000';

  /* — goal pills (max 3) — */
  const goalPills = goals.slice(0, 3).map((g) => g.name || g.title || 'Financial Goal');
  if (goalPills.length === 0) {
    goalPills.push('Save for Travel', 'Buy a Laptop', 'Build Emergency Fund');
  }

  /* — achievements derived — */
  const achievements = [
    {
      icon: CheckCircle, color: '#14B8A6', bg: 'rgba(20,184,166,0.15)',
      title: 'First Transaction', subtitle: 'Made your first entry', date: 'Oct 15, 2026',
    },
    {
      icon: IndianRupee, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',
      title: 'Savings Starter', subtitle: `Saved ${fmt(10000)}`, date: 'Oct 20, 2026',
    },
    {
      icon: Target, color: '#EF4444', bg: 'rgba(239,68,68,0.15)',
      title: 'Goal Setter', subtitle: `Created ${Math.max(goalsCount, 3)} Goals`, date: 'Oct 22, 2026',
    },
    {
      icon: Calendar, color: '#A78BFA', bg: 'rgba(167,139,250,0.15)',
      title: 'Consistent Tracker',
      subtitle: `${Math.max(decisionsLogged, 7)} Days in a Row`,
      date: 'Oct 28, 2026',
    },
  ];

  /* — handle sign out — */
  const handleSignOut = async () => {
    await logoutUser();
    window.location.reload();
  };

  /* ─── Styles ─────────────────────────────────────────────── */
  const card = {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '1.5rem',
  };

  const statBox = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
    padding: '0.85rem 0.5rem',
    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
    border: '1px solid var(--border-subtle)', flex: 1, minWidth: 0,
  };

  const divider = {
    height: '1px',
    background: 'var(--border-subtle)',
    margin: '0.85rem 0',
  };

  /* ─── Loading skeleton ──────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>
        <Activity size={32} color="#14B8A6" style={{ marginBottom: '1rem' }} />
        <p>Loading your profile…</p>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div style={{ padding: '1.5rem 1.75rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '1.75rem', gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'Fraunces, serif', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              My Profile
            </h1>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={18} color="#14B8A6" />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Manage your profile, preferences and track your financial journey.
          </p>
        </div>

        {/* Banner illustration */}
        <div style={{
          position: 'relative', flexShrink: 0, width: '280px', height: '110px',
          borderRadius: '16px', overflow: 'hidden',
          background: 'linear-gradient(135deg, #7C3AED22 0%, #14B8A622 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <div style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '0.2rem',
          }}>
            {['Same Goals', 'Brighter', 'Tomorrow'].map((t, i) => (
              <div key={i} style={{
                fontSize: i === 1 ? '0.9rem' : '0.78rem',
                fontWeight: i === 1 ? 800 : 600,
                color: i === 1 ? '#A78BFA' : '#C4B5FD',
                fontFamily: 'Fraunces, serif',
              }}>{t}</div>
            ))}
          </div>
          <img
            src={profileBannerArt}
            alt="Financial Journey"
            style={{ height: '100%', width: 'auto', objectFit: 'cover', objectPosition: 'center right' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* ── ROW 1: Personal Info + Financial Journey ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Personal Information Card */}
        <div style={{ ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <SectionHeader icon={User} label="Personal Information" color="#14B8A6" />
            <button
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem', marginBottom: '1.25rem' }}
            >
              <Edit2 size={13} /> Edit Profile
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            {/* Avatar column */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
                border: '3px solid rgba(20,184,166,0.5)',
                boxShadow: '0 0 20px rgba(20,184,166,0.25)',
              }}>
                <img
                  src={himanshiAvatar}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = 'rgba(20,184,166,0.2)';
                  }}
                />
              </div>
              <button style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#14B8A6', border: '2px solid var(--bg-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Camera size={12} color="#fff" />
              </button>
            </div>

            {/* Name + quote */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0', fontFamily: 'Fraunces, serif' }}>
                {displayName}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#14B8A6', fontWeight: 600, margin: '0 0 0.75rem 0' }}>
                {displayRole}
              </p>
              {/* Quote block */}
              <div style={{
                background: 'rgba(124,58,237,0.08)', borderLeft: '3px solid #7C3AED',
                borderRadius: '0 8px 8px 0', padding: '0.6rem 0.75rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: '#C4B5FD', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                  "Building better money habits for a brighter tomorrow."
                </p>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { icon: Mail, text: displayEmail },
              { icon: Phone, text: '+91 98765 43210' },
              { icon: MapPin, text: 'Jaipur, Rajasthan, India' },
              { icon: Calendar, text: `Joined on ${joinDate}` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} color="#14B8A6" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Journey Card */}
        <div style={{ ...card }}>
          <SectionHeader icon={BarChart2} label="Financial Journey" color="#F59E0B" />

          {/* 4 stat boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { icon: Target, color: '#EF4444', bg: 'rgba(239,68,68,0.15)', value: goalsCount || 6, label: 'Goals Set' },
              { icon: BookOpen, color: '#A78BFA', bg: 'rgba(167,139,250,0.15)', value: decisionsLogged || 24, label: 'Decisions Logged' },
              { icon: Activity, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', value: `${healthScore}/100`, label: 'Health Score' },
              {
                icon: IndianRupee, color: '#14B8A6', bg: 'rgba(20,184,166,0.15)',
                value: fmt(totalSavings), label: 'Total Savings',
              },
            ].map(({ icon: Icon, color, bg, value, label }) => (
              <div key={label} style={statBox}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', fontFamily: 'Fraunces, serif' }}>
                  {value}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Journey progress */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>Your Journey Progress</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#14B8A6' }}>{journeyPct}%</span>
            </div>
            <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '999px', width: `${journeyPct}%`,
                background: 'linear-gradient(90deg, #14B8A6, #F59E0B)',
                transition: 'width 0.6s ease',
                boxShadow: '0 0 10px rgba(20,184,166,0.5)',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem' }}>
              <Feather size={13} color="#14B8A6" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                You're on the right track! Keep building your financial future.
              </span>
            </div>
          </div>

          {/* Quick navigation buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { label: 'View Goals', tab: 'goals', color: '#EF4444' },
              { label: 'Health Score', tab: 'health', color: '#F59E0B' },
              { label: 'AI Coach', tab: 'coach', color: '#14B8A6' },
            ].map(({ label, tab, color }) => (
              <button
                key={tab}
                onClick={() => onNavigateToTab?.(tab)}
                style={{
                  padding: '0.4rem 0.85rem', borderRadius: '999px', border: `1px solid ${color}44`,
                  background: `${color}11`, color, fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Preferences + Notifications + Security ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Financial Preferences */}
        <div style={{ ...card }}>
          <SectionHeader icon={Settings} label="Financial Preferences" color="#7C3AED" />

          {/* Currency */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Currency
            </label>
            <select
              className="fin-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value="inr">₹ INR (Indian Rupee)</option>
              <option value="usd">$ USD (US Dollar)</option>
              <option value="eur">€ EUR (Euro)</option>
            </select>
          </div>

          {/* Monthly Income Range */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Monthly Income Range
            </label>
            <select
              className="fin-select"
              style={{ width: '100%', fontSize: '0.85rem' }}
              defaultValue={incomeRange}
            >
              <option>Below ₹25,000</option>
              <option>₹25,000 – ₹50,000</option>
              <option>₹50,000 – ₹1,00,000</option>
              <option>₹1,00,000+</option>
            </select>
          </div>

          {/* Financial Goals pills */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Financial Goals
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {goalPills.map((g) => (
                <span
                  key={g}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.65rem', borderRadius: '999px',
                    background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)',
                    fontSize: '0.78rem', color: '#2DD4BF', fontWeight: 500,
                    cursor: 'default',
                  }}
                >
                  {g}
                  <span style={{ color: '#64748B', cursor: 'pointer', fontWeight: 700 }}>×</span>
                </span>
              ))}
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.3rem 0.65rem', borderRadius: '999px',
                  background: 'transparent', border: '1px dashed rgba(100,116,139,0.4)',
                  fontSize: '0.78rem', color: '#64748B', cursor: 'pointer',
                }}
              >
                + Add Goal
              </button>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Risk Tolerance
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['low', 'moderate', 'high'].map((r) => {
                const icons = { low: Shield, moderate: BarChart2, high: Zap };
                const Icon = icons[r];
                const active = riskTolerance === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRiskTolerance(r)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      padding: '0.55rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.82rem',
                      background: active
                        ? 'linear-gradient(135deg, #14B8A6, #0D9488)'
                        : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#94A3B8',
                      boxShadow: active ? '0 4px 15px rgba(20,184,166,0.35)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon size={14} />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div style={{ ...card }}>
          <SectionHeader icon={Bell} label="Notifications & Alerts" color="#F59E0B" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                key: 'budget', icon: AlertTriangle, iconColor: '#EF4444', iconBg: 'rgba(239,68,68,0.12)',
                label: 'Budget Alerts', sub: "Get notified when you're close to your budget limit",
              },
              {
                key: 'savings', icon: Target, iconColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.12)',
                label: 'Savings Goal Updates', sub: 'Track your progress on goals',
              },
              {
                key: 'bills', icon: Calendar, iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)',
                label: 'Bill Reminders', sub: 'Never miss an important payment',
              },
              {
                key: 'insights', icon: Lightbulb, iconColor: '#A78BFA', iconBg: 'rgba(167,139,250,0.12)',
                label: 'Financial Insights', sub: 'Get personalised tips and insights',
              },
              {
                key: 'marketing', icon: Megaphone, iconColor: '#64748B', iconBg: 'rgba(100,116,139,0.12)',
                label: 'Marketing Updates', sub: 'Product updates and new features',
              },
            ].map(({ key, icon: Icon, iconColor, iconBg, label, sub }, idx, arr) => (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                    background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{label}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: '1px' }}>{sub}</div>
                  </div>
                  <Toggle
                    on={notifications[key]}
                    onChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))}
                  />
                </div>
                {idx < arr.length - 1 && <div style={divider} />}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div style={{ ...card }}>
          <SectionHeader icon={Shield} label="Security & Privacy" color="#EF4444" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: Lock, label: 'Change Password', sub: 'Update your password regularly', bg: 'rgba(239,68,68,0.12)' },
              { icon: Key, label: 'Two-Factor Authentication', sub: 'Add an extra layer of security', bg: 'rgba(245,158,11,0.12)' },
              { icon: Eye, label: 'Privacy Settings', sub: 'Manage your data and privacy', bg: 'rgba(20,184,166,0.12)' },
              { icon: Link, label: 'Linked Accounts', sub: 'Manage connected accounts', bg: 'rgba(167,139,250,0.12)' },
            ].map(({ icon, label, sub, bg }, idx, arr) => (
              <div key={label}>
                <ArrowRow icon={icon} iconBg={bg} label={label} sublabel={sub} onClick={() => {}} />
                {idx < arr.length - 1 && <div style={divider} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Achievements + App Preferences + Support ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

        {/* Achievements */}
        <div style={{ ...card }}>
          <SectionHeader
            icon={Trophy}
            label="Achievements"
            color="#F59E0B"
            extra={
              <button style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', color: '#14B8A6', fontWeight: 600,
              }}>
                View All
              </button>
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
            {achievements.map((a) => (
              <AchievementCard key={a.title} {...a} />
            ))}
          </div>
        </div>

        {/* App Preferences */}
        <div style={{ ...card }}>
          <SectionHeader icon={Settings} label="App Preferences" color="#A78BFA" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                icon: Globe, iconBg: 'rgba(20,184,166,0.12)',
                label: 'Language',
                control: (
                  <select
                    className="fin-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.3rem 2rem 0.3rem 0.6rem', minWidth: '110px' }}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                ),
              },
              {
                icon: Palette, iconBg: 'rgba(167,139,250,0.12)',
                label: 'Theme',
                control: (
                  <select
                    className="fin-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.3rem 2rem 0.3rem 0.6rem', minWidth: '110px' }}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                ),
              },
              {
                icon: Clock, iconBg: 'rgba(245,158,11,0.12)',
                label: 'Date Format',
                control: (
                  <select
                    className="fin-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.3rem 2rem 0.3rem 0.6rem', minWidth: '110px' }}
                  >
                    <option value="DD MMM YYYY">DD MMM YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                ),
              },
            ].map(({ icon: Icon, iconBg, label, control }, idx, arr) => (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} color="#14B8A6" />
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-main)' }}>{label}</span>
                  {control}
                </div>
                {idx < arr.length - 1 && <div style={divider} />}
              </div>
            ))}
            <div style={divider} />
            {/* Data Export */}
            <ArrowRow
              icon={Download}
              iconBg="rgba(20,184,166,0.12)"
              label="Data Export"
              sublabel="Export your financial data"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Support & Help */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <SectionHeader icon={HelpCircle} label="Support & Help" color="#14B8A6" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: HelpCircle, label: 'Help Center', sub: 'Find answers to common questions', bg: 'rgba(20,184,166,0.12)' },
              { icon: HeadphonesIcon, label: 'Contact Support', sub: 'Get in touch with our team', bg: 'rgba(245,158,11,0.12)' },
              { icon: MessageSquare, label: 'Send Feedback', sub: 'Help us improve FinWise AI', bg: 'rgba(167,139,250,0.12)' },
            ].map(({ icon, label, sub, bg }, idx, arr) => (
              <div key={label}>
                <ArrowRow icon={icon} iconBg={bg} label={label} sublabel={sub} onClick={() => {}} />
                {idx < arr.length - 1 && <div style={divider} />}
              </div>
            ))}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="btn btn-danger"
            style={{
              width: '100%', marginTop: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.7rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

