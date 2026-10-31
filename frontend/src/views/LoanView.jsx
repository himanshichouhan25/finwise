import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  IndianRupee,
  TrendingDown,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Snowflake,
  Calculator,
  Table as TableIcon,
  X,
  Activity,
  Layers,
  Percent
} from 'lucide-react';
import {
  getLoans,
  getLoanDetail,
  createLoan,
  recordLoanRepayment,
  simulateLoanPrepayment,
  getLoanPrioritization,
  deleteLoan,
} from '../api/client';

const fmt = (n, prefix = '₹') =>
  n == null ? '—' : `${prefix}${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDec = (n, prefix = '₹') =>
  n == null ? '—' : `${prefix}${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function LoanView() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [prioritization, setPrioritization] = useState(null);
  const [selectedLoanForDetail, setSelectedLoanForDetail] = useState(null);
  const [loanDetail, setLoanDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState(null);

  // Prepayment Simulator state
  const [simLoanId, setSimLoanId] = useState('');
  const [simExtraAmount, setSimExtraAmount] = useState('2000');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Add Loan Form state
  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    loan_type: 'personal',
    principal_amount: '',
    interest_rate_pct: '10.5',
    interest_type: 'reducing_balance',
    start_date: new Date().toISOString().split('T')[0],
    tenure_months: '24',
  });
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Form state
  const [paymentData, setPaymentData] = useState({
    amount_paid: '',
    payment_type: 'emi',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Load all loans and strategies
  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const [loansRes, prioRes] = await Promise.allSettled([
        getLoans(),
        getLoanPrioritization(),
      ]);
      if (loansRes.status === 'fulfilled') {
        setOverview(loansRes.value);
        if (loansRes.value?.loans?.length > 0 && !simLoanId) {
          setSimLoanId(String(loansRes.value.loans[0].id));
        }
      }
      if (prioRes.status === 'fulfilled') {
        setPrioritization(prioRes.value);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  }, [simLoanId]);

  useEffect(() => {
    loadLoans();
    const handlePersona = () => loadLoans();
    window.addEventListener('finwise_persona_changed', handlePersona);
    return () => window.removeEventListener('finwise_persona_changed', handlePersona);
  }, [loadLoans]);

  // Load single loan detail (amortization schedule)
  const handleOpenDetail = async (loanId) => {
    setSelectedLoanForDetail(loanId);
    setLoadingDetail(true);
    try {
      const res = await getLoanDetail(loanId);
      setLoanDetail(res);
    } catch (err) {
      console.error('Failed to load loan detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Run prepayment simulation
  const handleRunSimulation = async (loanId, extraAmt) => {
    if (!loanId || !extraAmt || Number(extraAmt) <= 0) return;
    setSimLoading(true);
    try {
      const res = await simulateLoanPrepayment(Number(loanId), Number(extraAmt));
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
      setSimResult(null);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (simLoanId && simExtraAmount && Number(simExtraAmount) > 0) {
      handleRunSimulation(simLoanId, simExtraAmount);
    }
  }, [simLoanId, simExtraAmount]);

  // Handle Create Loan
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        lender: formData.lender.trim(),
        loan_type: formData.loan_type,
        principal_amount: Number(formData.principal_amount),
        interest_rate_pct: Number(formData.interest_rate_pct),
        interest_type: formData.interest_type,
        start_date: formData.start_date,
        tenure_months: Number(formData.tenure_months),
      };
      await createLoan(payload);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        lender: '',
        loan_type: 'personal',
        principal_amount: '',
        interest_rate_pct: '10.5',
        interest_type: 'reducing_balance',
        start_date: new Date().toISOString().split('T')[0],
        tenure_months: '24',
      });
      await loadLoans();
    } catch (err) {
      setAddError(err.message || 'Failed to create loan. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentLoanId) return;

    const currentLoan = loans.find((l) => l.id === paymentLoanId);
    if (paymentData.payment_type === 'emi' && currentLoan) {
      const scheduledEmi = Number(currentLoan.emi_amount || currentLoan.monthly_emi || 0);
      const enteredAmount = Number(paymentData.amount_paid || 0);
      if (enteredAmount < scheduledEmi) {
        alert(
          `Payment amount (₹${enteredAmount.toLocaleString('en-IN')}) is less than the scheduled monthly EMI (₹${scheduledEmi.toLocaleString('en-IN')}).\n\nTo record a regular installment, please pay the full monthly EMI, or switch the payment type to 'Extra Prepayment'.`
        );
        return;
      }
    }

    try {
      await recordLoanRepayment(paymentLoanId, {
        amount_paid: Number(paymentData.amount_paid),
        payment_type: paymentData.payment_type,
        payment_date: paymentData.payment_date,
        notes: paymentData.notes,
      });
      setIsPaymentModalOpen(false);
      setPaymentData({
        amount_paid: '',
        payment_type: 'emi',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await loadLoans();
      if (selectedLoanForDetail === paymentLoanId) {
        handleOpenDetail(paymentLoanId);
      }
    } catch (err) {
      alert(err.message || 'Payment recording failed');
    }
  };

  // Handle Delete Loan
  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await deleteLoan(loanId);
      await loadLoans();
      if (selectedLoanForDetail === loanId) {
        setSelectedLoanForDetail(null);
        setLoanDetail(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete loan');
    }
  };

  // Live preview EMI calculation for Add Modal
  const previewEmi = () => {
    const P = Number(formData.principal_amount);
    const rAnnual = Number(formData.interest_rate_pct);
    const n = Number(formData.tenure_months);
    if (!P || P <= 0 || !n || n <= 0) return 0;
    if (formData.interest_type === 'flat') {
      const totalInt = P * (rAnnual / 100) * (n / 12);
      return (P + totalInt) / n;
    }
    if (rAnnual <= 0) return P / n;
    const r = rAnnual / 12 / 100;
    const factor = Math.pow(1 + r, n);
    return (P * r * factor) / (factor - 1);
  };

  const cardStyle = {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '1.5rem',
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity size={36} color="#14B8A6" style={{ marginBottom: '1rem' }} />
        <p>Loading loan management portfolio…</p>
      </div>
    );
  }

  const loans = overview?.loans || [];

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'Fraunces, serif', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Loan Management System
            </h1>
            <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
              Amortization Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Amortization schedules, prepayment simulations, and Avalanche vs Snowball debt elimination.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-teal"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: 700 }}
        >
          <Plus size={18} /> Add New Loan
        </button>
      </div>

      {/* ── TOP KPI OVERVIEW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#EF4444', marginBottom: '0.5rem' }}>
            <CreditCard size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Outstanding Principal
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Fraunces, serif', color: 'var(--text-main)' }}>
            {fmt(overview?.total_outstanding_principal || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Remaining balance across {overview?.active_loans_count || 0} active loans
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#F59E0B', marginBottom: '0.5rem' }}>
            <Calendar size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Monthly EMI
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Fraunces, serif', color: '#F59E0B' }}>
            {fmt(overview?.total_monthly_emi || 0)} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ mo</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Mandatory monthly commitment
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#14B8A6', marginBottom: '0.5rem' }}>
            <TrendingDown size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interest Paid So Far
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Fraunces, serif', color: '#14B8A6' }}>
            {fmt(overview?.total_interest_paid_so_far || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Cumulative interest transferred to lenders
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#A78BFA', marginBottom: '0.5rem' }}>
            <Layers size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Debt Health
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Fraunces, serif', color: '#A78BFA' }}>
            {overview?.active_loans_count === 0 ? 'Debt-Free' : `${overview?.active_loans_count} Active`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {overview?.active_loans_count === 0 ? 'No outstanding debt obligations' : 'Track and accelerate payoffs below'}
          </div>
        </div>
      </div>

      {/* ── LOANS LISTING ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Fraunces, serif', margin: 0 }}>
            Active Loans & Amortization
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {loans.length} registered loans
          </span>
        </div>

        {loans.length === 0 ? (
          <div style={{
            ...cardStyle, textAlign: 'center', padding: '3.5rem 1.5rem',
            border: '1px dashed var(--border-subtle)',
          }}>
            <Building2 size={42} color="#64748B" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              No Loans Registered
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Add your education, personal, or vehicle loans to generate precise month-by-month repayment schedules and calculate prepayment savings.
            </p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-teal">
              <Plus size={16} /> Add Your First Loan
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {loans.map((loan) => {
              const progressPct = loan.tenure_months > 0
                ? Math.min(100, Math.round((loan.installments_paid / loan.tenure_months) * 100))
                : 0;

              return (
                <div key={loan.id} style={{ ...cardStyle, position: 'relative' }}>
                  {/* Top bar: Lender & Type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'rgba(20,184,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Building2 size={16} color="#14B8A6" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{loan.lender}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{loan.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <span className="badge badge-slate" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                        {loan.loan_type}
                      </span>
                      <span className={`badge ${loan.interest_type === 'flat' ? 'badge-amber' : 'badge-teal'}`} style={{ fontSize: '0.68rem' }}>
                        {loan.interest_type === 'flat' ? 'Flat Rate' : 'Reducing'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem',
                    padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                    margin: '0.85rem 0',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Outstanding</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#EF4444' }}>
                        {fmt(loan.outstanding_principal)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Monthly EMI</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F59E0B' }}>
                        {fmt(loan.emi_amount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Interest Rate</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {loan.interest_rate_pct}% p.a.
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>Repaid: {loan.installments_paid} / {loan.tenure_months} EMIs</span>
                      <span style={{ fontWeight: 700, color: '#14B8A6' }}>{progressPct}% Paid</span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px', width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #14B8A6, #2DD4BF)',
                      }} />
                    </div>
                  </div>

                  {/* Next EMI Date Badge */}
                  {loan.next_emi_date && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.45rem',
                      fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem',
                      background: 'rgba(148,163,184,0.06)', padding: '0.4rem 0.65rem', borderRadius: '8px',
                    }}>
                      <Clock size={13} color="#F59E0B" />
                      <span>Next EMI Due: <strong style={{ color: '#F8FAFC' }}>{fmtDate(loan.next_emi_date)}</strong></span>
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenDetail(loan.id)}
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <TableIcon size={14} /> Amortization
                    </button>
                    <button
                      onClick={() => {
                        setPaymentLoanId(loan.id);
                        setPaymentData((p) => ({ ...p, amount_paid: String(loan.emi_amount || loan.monthly_emi || '') }));
                        setIsPaymentModalOpen(true);
                      }}
                      className="btn btn-teal"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <CheckCircle2 size={14} /> Log Payment
                    </button>
                    <button
                      onClick={() => handleDeleteLoan(loan.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#EF4444', borderRadius: '8px', padding: '0.45rem 0.65rem', cursor: 'pointer',
                      }}
                      title="Delete Loan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2-COLUMN SECTION: PREPAYMENT SIMULATOR + DEBT PRIORITIZATION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Extra Prepayment Simulator */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#F59E0B" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
                Extra Prepayment Simulator
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                "What happens if I pay an additional ₹2,000 every month?"
              </p>
            </div>
          </div>

          {loans.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add a loan above to simulate prepayment savings.</p>
          ) : (
            <div>
              {/* Form inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Target Loan
                  </label>
                  <select
                    className="fin-select"
                    value={simLoanId}
                    onChange={(e) => setSimLoanId(e.target.value)}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  >
                    {loans.map((l) => (
                      <option key={l.id} value={l.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                        {l.name} ({l.lender})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Extra Monthly Payment (₹)
                  </label>
                  <input
                    type="number"
                    className="fin-input"
                    value={simExtraAmount}
                    onChange={(e) => setSimExtraAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Simulation Result Presentation */}
              {simLoading ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  Calculating amortization reduction…
                </div>
              ) : simResult ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(245,158,11,0.08) 100%)',
                  border: '1px solid rgba(20,184,166,0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Sparkles size={16} color="#14B8A6" />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2DD4BF' }}>
                      Prepayment Accelerated Impact
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Months Saved</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'Fraunces, serif' }}>
                        {simResult.months_saved} Months
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                        Pay off in {simResult.new_tenure_months} mo (was {simResult.original_tenure_months} mo)
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Interest Saved</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14B8A6', fontFamily: 'Fraunces, serif' }}>
                        {fmt(simResult.interest_saved)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                        Saved by reducing principal faster
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#C4B5FD', lineHeight: 1.4, background: 'rgba(124,58,237,0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    💡 <strong>FinWise Rule:</strong> Every additional ₹{Number(simExtraAmount).toLocaleString('en-IN')} paid directly slashes outstanding principal, drastically collapsing the compound interest curve.
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Debt Prioritization Advisor */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={16} color="#A78BFA" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
                Debt Prioritization Advisor
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Avalanche (Mathematical Max Savings) vs Snowball (Quick Wins)
              </p>
            </div>
          </div>

          {/* Avalanche Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Flame size={15} color="#EF4444" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#EF4444' }}>
                Debt Avalanche (Recommended for Highest Savings)
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
              Focus extra money on the highest interest rate debt first.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {prioritization?.avalanche_strategy?.length ? (
                prioritization.avalanche_strategy.map((item) => (
                  <div key={item.loan_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)',
                        color: '#EF4444', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.rank}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{item.lender} • {fmt(item.outstanding_principal)}</div>
                      </div>
                    </div>
                    <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                      {item.interest_rate_pct}% p.a.
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>No active loans to prioritize.</div>
              )}
            </div>
          </div>

          {/* Snowball Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Snowflake size={15} color="#38BDF8" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#38BDF8' }}>
                Debt Snowball (Behavioral Momentum)
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
              Pay minimums on all loans, then throw everything at the smallest balance first for rapid emotional wins.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {prioritization?.snowball_strategy?.length ? (
                prioritization.snowball_strategy.slice(0, 2).map((item) => (
                  <div key={item.loan_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(56,189,248,0.2)',
                        color: '#38BDF8', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.rank}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Balance: {fmt(item.outstanding_principal)}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
                      Smallest First
                    </span>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: AMORTIZATION SCHEDULE DETAILS ── */}
      {selectedLoanForDetail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px', width: '100%', maxWidth: '850px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
                  {loanDetail?.name || 'Loan'} — Amortization Schedule
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {loanDetail?.lender} • {fmt(loanDetail?.principal_amount)} @ {loanDetail?.interest_rate_pct}% p.a. • {loanDetail?.tenure_months} Months
                </p>
              </div>
              <button
                onClick={() => { setSelectedLoanForDetail(null); setLoanDetail(null); }}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Table */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Loading schedule…
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.65rem 0.5rem' }}>Mo</th>
                        <th style={{ padding: '0.65rem 0.5rem' }}>Opening Bal</th>
                        <th style={{ padding: '0.65rem 0.5rem' }}>EMI</th>
                        <th style={{ padding: '0.65rem 0.5rem', color: '#14B8A6' }}>Principal Paid</th>
                        <th style={{ padding: '0.65rem 0.5rem', color: '#EF4444' }}>Interest Paid</th>
                        <th style={{ padding: '0.65rem 0.5rem' }}>Closing Bal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanDetail?.schedule?.map((r) => {
                        const isPaid = r.month <= (loanDetail?.installments_paid || 0);
                        return (
                          <tr
                            key={r.month}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              background: isPaid ? 'rgba(20,184,166,0.05)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>
                              {isPaid && <span style={{ color: '#14B8A6', marginRight: '4px' }}>✓</span>}
                              #{r.month}
                            </td>
                            <td style={{ padding: '0.55rem 0.5rem' }}>{fmt(r.opening_balance)}</td>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700 }}>{fmt(r.emi)}</td>
                            <td style={{ padding: '0.55rem 0.5rem', color: '#14B8A6' }}>{fmt(r.principal_paid)}</td>
                            <td style={{ padding: '0.55rem 0.5rem', color: '#EF4444' }}>{fmt(r.interest_paid)}</td>
                            <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>{fmt(r.closing_balance)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => { setSelectedLoanForDetail(null); setLoanDetail(null); }}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD LOAN ── */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px', width: '100%', maxWidth: '540px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
                Add New Loan
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} style={{ padding: '1.5rem' }}>
              {addError && (
                <div style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#F87171', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem',
                }}>
                  {addError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Loan Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="fin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SBI Scholar Loan"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Lender / Bank *
                  </label>
                  <input
                    type="text"
                    required
                    className="fin-input"
                    value={formData.lender}
                    onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Loan Category
                  </label>
                  <select
                    className="fin-select"
                    value={formData.loan_type}
                    onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="education">Education Loan</option>
                    <option value="personal">Personal Loan</option>
                    <option value="vehicle">Two/Four Wheeler</option>
                    <option value="home">Home Loan</option>
                    <option value="credit">Credit Card / PayLater</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Calculation Method
                  </label>
                  <select
                    className="fin-select"
                    value={formData.interest_type}
                    onChange={(e) => setFormData({ ...formData, interest_type: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="reducing_balance">Reducing Balance (Standard)</option>
                    <option value="flat">Flat Rate Interest</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Principal (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="fin-input"
                    value={formData.principal_amount}
                    onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                    placeholder="e.g. 250000"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Rate (% p.a.) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    className="fin-input"
                    value={formData.interest_rate_pct}
                    onChange={(e) => setFormData({ ...formData, interest_rate_pct: e.target.value })}
                    placeholder="e.g. 10.5"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Tenure (Months) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="fin-input"
                    value={formData.tenure_months}
                    onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                    placeholder="e.g. 24"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Live EMI preview box */}
              {previewEmi() > 0 && (
                <div style={{
                  background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)',
                  borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Calculated Monthly EMI:
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2DD4BF', fontFamily: 'Fraunces, serif' }}>
                    {fmt(previewEmi())} <span style={{ fontSize: '0.75rem' }}>/ mo</span>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-teal"
                  style={{ fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Calculating & Saving…' : 'Save Loan Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PAYMENT ── */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
                Log Loan Payment
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Payment Type
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, payment_type: 'emi' })}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 700,
                      background: paymentData.payment_type === 'emi' ? '#14B8A6' : 'rgba(255,255,255,0.05)',
                      color: paymentData.payment_type === 'emi' ? '#fff' : '#94A3B8',
                    }}
                  >
                    Regular EMI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, payment_type: 'prepayment' })}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 700,
                      background: paymentData.payment_type === 'prepayment' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                      color: paymentData.payment_type === 'prepayment' ? '#fff' : '#94A3B8',
                    }}
                  >
                    Extra Prepayment
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Amount Paid (₹) *
                  </label>
                  {paymentLoanId && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Scheduled EMI: <strong>₹{Number(loans.find((l) => l.id === paymentLoanId)?.emi_amount || loans.find((l) => l.id === paymentLoanId)?.monthly_emi || 0).toLocaleString('en-IN')}</strong>
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  className="fin-input"
                  value={paymentData.amount_paid}
                  onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
                {paymentData.payment_type === 'emi' && paymentLoanId && Number(paymentData.amount_paid) < Number(loans.find((l) => l.id === paymentLoanId)?.emi_amount || loans.find((l) => l.id === paymentLoanId)?.monthly_emi || 0) && (
                  <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.25rem', fontWeight: 600 }}>
                    ⚠️ Amount is less than the scheduled monthly EMI (₹{Number(loans.find((l) => l.id === paymentLoanId)?.emi_amount || loans.find((l) => l.id === paymentLoanId)?.monthly_emi || 0).toLocaleString('en-IN')}). Switch to 'Extra Prepayment' if making a partial payment.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  className="fin-input"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  className="fin-input"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="e.g. Net banking ref #89421"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-teal"
                  style={{ fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

