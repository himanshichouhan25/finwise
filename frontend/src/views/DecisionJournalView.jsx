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
  Target 
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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading decision journal...</div>;
  }

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Hourglass size={22} color="#F59E0B" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Impulse Decision Journal & 24h/48h Cooling-Off Timers
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Delay immediate gratification. Log purchases you feel tempted to make, set a cooling-off timer, and reflect before spending.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowLogModal(true)}>
          <Plus size={16} />
          <span>Log Prospective Spend</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>TOTAL MONEY SAVED</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2DD4BF', marginTop: '0.25rem' }}>
              ₹{Number(summary.total_saved_amount).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              From {summary.avoided_count} avoided impulse purchases
            </span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>ACTIVE COOLING-OFF TIMERS</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F59E0B', marginTop: '0.25rem' }}>
              {summary.active_cooling_count}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Currently locked in reflection window</span>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>READY FOR FINAL REVIEW</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.25rem' }}>
              {summary.ready_for_review_count}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Cooling-off expired — ready to decide</span>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
          Journal Entries ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
            <p>No impulse purchases logged yet. When tempted to buy something, log it here first!</p>
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
                    border: entry.is_cooling_active
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : entry.status === 'dropped'
                      ? '1px solid rgba(20, 184, 166, 0.4)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>{entry.title}</h4>
                        <span className={`badge ${entry.emotional_state === 'fomo' ? 'badge-amber' : 'badge-slate'}`}>
                          Trigger: {entry.emotional_state}
                        </span>
                        {entry.is_urgent && (
                          <span className="badge badge-crimson">Urgency Feeling</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                        "{entry.rationale}"
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF' }}>
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
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <Target size={18} color="#EF4444" />
                      <span style={{ fontSize: '0.85rem', color: '#F87171', fontWeight: 600 }}>
                        {entry.delay_insight_message || `Delays your primary financial goal by ${entry.goal_days_delayed} days!`}
                      </span>
                    </div>
                  )}

                  {/* Outcome Note if resolved */}
                  {entry.outcome_note && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#CBD5E1', fontStyle: 'italic' }}>
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
                      gap: '0.75rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {entry.is_cooling_active
                          ? `Locked until ${new Date(entry.cooling_off_until).toLocaleString()}. Take time to reflect.`
                          : 'Cooling-off window completed! Make your final rational decision.'}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-teal"
                          onClick={() => setDecideEntry(entry)}
                          disabled={entry.is_cooling_active}
                          style={{ fontSize: '0.8rem' }}
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Log Prospective Spend & Activate Cooling Off
            </h3>
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
                <label className="fin-label">Cooling-Off Period Duration</label>
                <select className="fin-select" value={coolingHours} onChange={(e) => setCoolingHours(e.target.value)}>
                  <option value="24">24 Hours (Standard Cooling-Off)</option>
                  <option value="48">48 Hours (Recommended for Large Purchases)</option>
                  <option value="72">72 Hours (High Ticket Items)</option>
                  <option value="0">0 Hours (Immediate Review Demo)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Lock Cooling Timer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decide Modal */}
      {decideEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Finalize Decision: {decideEntry.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
              Now that your cooling-off window has elapsed, did you decide to purchase or avoid it?
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="fin-label">Retrospective Reflection (Optional)</label>
              <textarea
                className="fin-input"
                rows={2}
                placeholder="e.g. Realized I didn't actually need it and put the ₹7,500 into my Emergency Fund!"
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDecideEntry(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleDecide('proceeded')}
              >
                Proceeded with Buy
              </button>
              <button
                type="button"
                className="btn btn-teal"
                onClick={() => handleDecide('dropped')}
              >
                <Sparkles size={16} />
                <span>Avoided (Saved Money)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
