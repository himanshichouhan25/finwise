import React, { useState, useEffect } from 'react';
import { 
  Hourglass, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  HeartHandshake, 
  Target,
  X 
} from 'lucide-react';
import { 
  getJournalEntries, 
  createJournalEntry, 
  decideJournalEntry, 
  getJournalSummary 
} from '../api/client';

export default function DecisionJournalView() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [rationale, setRationale] = useState('');
  const [emotionalState, setEmotionalState] = useState('fomo');
  const [coolingHours, setCoolingHours] = useState('24');
  const [isUrgent, setIsUrgent] = useState(true);

  // Decide modal state
  const [decideEntry, setDecideEntry] = useState(null);
  const [outcomeNote, setOutcomeNote] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesRes, sumRes] = await Promise.all([
        getJournalEntries(),
        getJournalSummary(),
      ]);
      setEntries(entriesRes);
      setSummary(sumRes);
    } catch (err) {
      console.error('Failed to load journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handlePersonaChange = () => loadData();
    window.addEventListener('finwise_persona_changed', handlePersonaChange);
    return () => window.removeEventListener('finwise_persona_changed', handlePersonaChange);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !rationale) return;
    try {
      await createJournalEntry({
        title,
        decision_type: 'purchase',
        amount: amount ? Number(amount) : null,
        rationale,
        emotional_state: emotionalState,
        cooling_off_hours: Number(coolingHours),
        is_urgent: isUrgent,
      });
      setShowLogModal(false);
      setTitle('');
      setAmount('');
      setRationale('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create entry');
    }
  };

  const handleDecide = async (decision) => {
    if (!decideEntry) return;
    try {
      await decideJournalEntry(decideEntry.id, decision, outcomeNote);
      setDecideEntry(null);
      setOutcomeNote('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to record decision');
    }
  };

  if (loading) {
    return <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading decision journal...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--gold-primary)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Hourglass size={22} color="var(--gold-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Impulse Decision Journal & 24h/48h Cooling-Off Timers
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Delay immediate gratification. Log purchases you feel tempted to make, set a cooling-off timer, and reflect before spending.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowLogModal(true)}>
          <Plus size={16} />
          <span>Log Prospective Spend</span>
        </button>
      </div>

      {/* Behavioral Finance: How It Works Guide Strip */}
      <div className="glass-card" style={{ background: '#FFFFFF', border: '1px solid #E0E7FF', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--violet-primary)', fontWeight: 800, fontSize: '0.9rem' }}>
            <Sparkles size={17} />
            <span>How the 24h/48h Cooling-Off System Protects Your Wealth</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setTitle('Sony ANC Headphones');
              setAmount('14999');
              setRationale('Saw a flash sale on Amazon, felt tempting but not strictly essential.');
              setEmotionalState('fomo');
              setCoolingHours('24');
              setIsUrgent(true);
              setShowLogModal(true);
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
          >
            ⚡ Try Demo Spend (₹14,999)
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              1. Pause the Impulse
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Jab bhi shopping ya online sale mein mehnge item par mann aye, checkout karne ke bajaye prospective purchase log karein.
            </p>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              2. Opportunity Cost & Delay
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              FinWise engine calculate karta hai ki ye kharcha aapke priority goals ko kitne din delay karega aur SIP mein kitna ban sakta tha.
            </p>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              3. 24h Brain Cooling Window
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Neuroscience shows that emotional impulse peaks in 24 hours. Once the timer ends, you make a calm, rational decision.
            </p>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#166534', marginBottom: '0.2rem' }}>
              4. Abandon = Pure Savings!
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#14532D', lineHeight: 1.45 }}>
              78% of impulse decisions get abandoned! When you click 'Abandon', the money is added to your <strong>Total Money Saved</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card" style={{ background: '#FFFFFF' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL MONEY SAVED</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--teal-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              ₹{Number(summary.total_saved_amount).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              From <strong>{summary.avoided_count}</strong> avoided impulse purchases
            </span>
          </div>

          <div className="glass-card" style={{ background: '#FFFFFF' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE COOLING-OFF TIMERS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--gold-primary)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              {summary.active_cooling_count}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Currently locked in reflection window
            </span>
          </div>

          <div className="glass-card" style={{ background: '#FFFFFF' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>READY FOR FINAL DECISION</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              {summary.ready_for_review_count}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Cooling-off expired — ready to decide
            </span>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Journal Entries ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0 }}>No impulse purchases logged yet. When tempted to buy something, log it here first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {entries.map((entry) => {
              const hoursRemaining = Math.ceil(entry.cooling_remaining_seconds / 3600);
              const isPending = entry.status === 'pending_review';

              return (
                <div
                  key={entry.id}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    borderLeft: entry.is_cooling_active
                      ? '4px solid var(--gold-primary)'
                      : entry.status === 'dropped'
                      ? '4px solid var(--teal-primary)'
                      : '4px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{entry.title}</h4>
                        <span className={`badge ${entry.emotional_state === 'fomo' ? 'badge-amber' : 'badge-slate'}`} style={{ fontSize: '0.7rem' }}>
                          Trigger: {entry.emotional_state}
                        </span>
                        {entry.is_urgent && (
                          <span className="badge badge-crimson" style={{ fontSize: '0.7rem' }}>Urgency Feeling</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                        "{entry.rationale}"
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {entry.amount ? `₹${Number(entry.amount).toLocaleString('en-IN')}` : 'Non-monetary'}
                      </div>
                      <span className={`badge ${
                        entry.status === 'dropped'
                          ? 'badge-teal'
                          : entry.status === 'proceeded'
                          ? 'badge-slate'
                          : entry.is_cooling_active
                          ? 'badge-amber'
                          : 'badge-teal'
                      }`} style={{ marginTop: '0.35rem' }}>
                        {entry.status === 'dropped'
                          ? '✓ Avoided (Saved Money)'
                          : entry.status === 'proceeded'
                          ? 'Proceeded'
                          : entry.is_cooling_active
                          ? `Cooling Off (${hoursRemaining}h left)`
                          : 'Ready for Final Review'}
                      </span>
                    </div>
                  </div>

                  {/* Goal Delay Impact Indicator */}
                  {entry.goal_days_delayed && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                      <Target size={18} color="#DC2626" />
                      <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                        {entry.delay_insight_message || `Delays your primary financial goal by ${entry.goal_days_delayed} days!`}
                      </span>
                    </div>
                  )}

                  {/* Outcome Note if resolved */}
                  {entry.outcome_note && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                      Reflection: "{entry.outcome_note}"
                    </div>
                  )}

                  {/* Decision Actions Bar */}
                  {isPending && (
                    <div style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {entry.is_cooling_active
                          ? `Locked until ${new Date(entry.cooling_off_until).toLocaleString()}. Take time to reflect.`
                          : 'Cooling-off window completed! Make your final rational decision.'}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-teal"
                          onClick={() => setDecideEntry(entry)}
                          disabled={entry.is_cooling_active}
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Finalize Decision</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', background: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Log Prospective Spend & Cooling-Off Timer
              </h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="fin-label">Item / Purchase Title</label>
                <input
                  type="text"
                  className="fin-input"
                  placeholder="e.g. Mechanical Keyboard, Weekend Trip, AirPods"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="fin-label">Estimated Cost (₹)</label>
                <input
                  type="number"
                  className="fin-input"
                  placeholder="e.g. 7500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="fin-label">Why do you feel like buying this right now?</label>
                <textarea
                  className="fin-input"
                  rows={2}
                  placeholder="e.g. Saw an ad, friends have it, feeling stressed from work..."
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="fin-label">Emotional Trigger</label>
                <select className="fin-select" value={emotionalState} onChange={(e) => setEmotionalState(e.target.value)}>
                  <option value="fomo">Fear of Missing Out (FOMO)</option>
                  <option value="excited">Excitement / Hype</option>
                  <option value="stressed">Stress Relief</option>
                  <option value="bored">Boredom</option>
                  <option value="neutral">Neutral Need</option>
                </select>
              </div>

              <div>
                <label className="fin-label">Cooling-Off Window</label>
                <select className="fin-select" value={coolingHours} onChange={(e) => setCoolingHours(e.target.value)}>
                  <option value="24">24 Hours (Standard Cooling)</option>
                  <option value="48">48 Hours (Big Ticket Reflection)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Lock Cooling-Off Timer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decide Modal */}
      {decideEntry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', background: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
              Finalize Decision: {decideEntry.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Your cooling-off period has expired. Did taking time to reflect help you decide?
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="fin-label">Reflection Note</label>
              <textarea
                className="fin-input"
                rows={2}
                placeholder="e.g. Realized I didn't actually need it, saved ₹5,000 for my emergency fund!"
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn btn-teal"
                onClick={() => handleDecide('dropped')}
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={16} />
                <span>Avoided Purchase (Saved Money!)</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleDecide('proceeded')}
                style={{ width: '100%' }}
              >
                <span>Proceeded with Purchase</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setDecideEntry(null)}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
