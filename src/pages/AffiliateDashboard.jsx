import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  clearAffiliateAuthIntent,
  markAffiliateAuthIntent,
  sanitizeAffiliateCode,
} from '../lib/affiliateReferral';
import './AffiliateDashboard.css';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};
const fmtInt = (n) => (n === null || n === undefined ? '—' : new Intl.NumberFormat('en-US').format(n));
const maskEmail = (email) => {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
};
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const sanitizeCode = sanitizeAffiliateCode;
const createAffiliateCode = (name = '', email = '') => {
  const seed = sanitizeCode(name || email.split('@')[0] || 'FIRE');
  const base = (seed || 'FIRELEDGER').slice(0, 12);
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};
async function provisionAffiliateCode(payload) {
  const res = await fetch('/api/create-affiliate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not create affiliate code.');
  return json;
}

async function saveAffiliatePayout(payload) {
  const res = await fetch('/api/update-affiliate-payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not save payout details.');
  return json;
}

async function loadAffiliateDiscountStats(userId) {
  const res = await fetch('/api/affiliate-discount-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not load discount stats.');
  return json?.stats || null;
}

async function ensureAffiliateProfile(user) {
  if (!user?.id || !user?.email) {
    throw new Error('Missing user details for affiliate setup.');
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split('@')[0] ||
    'Affiliate';

  return provisionAffiliateCode({
    userId: user.id,
    email: user.email,
    fullName,
    preferredCode: createAffiliateCode(fullName, user.email),
  });
}

// ── Auth screen ──────────────────────────────────────────────────────────────
function AffiliateAuth({ onAuth }) {
  const navigate = useNavigate();
  const [mode,     setMode]     = useState('signin'); // signin | signup | forgot
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const clear = () => { setError(''); setMsg(''); };

  const handleGoogle = async () => {
    clear();
    setLoading(true);
    markAffiliateAuthIntent();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/affiliate/dashboard' },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/affiliate/dashboard',
        });
        if (err) setError(err.message);
        else setMsg('Password reset link sent. Check your inbox.');
      } else if (mode === 'signup') {
        markAffiliateAuthIntent();
        const referralCode = createAffiliateCode(name, email);
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: 'affiliate' } },
        });
        if (err) { setError(err.message); }
        else {
          if (data?.user) {
            try {
              await provisionAffiliateCode({
                userId: data.user.id,
                email,
                fullName: name,
                preferredCode: referralCode,
              });
            } catch (provisionErr) {
              setError(provisionErr.message);
              setLoading(false);
              return;
            }
            if (data.session) {
              onAuth(data.user);
              navigate('/affiliate/dashboard', { replace: true });
              setLoading(false);
              return;
            }
          }
          setMsg(`Account created. Your referral code is ${referralCode}. If email confirmation is enabled in Supabase, confirm your email and then sign in.`);
          setMode('signin');
        }
      } else {
        markAffiliateAuthIntent();
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError('Invalid email or password.'); }
        else if (data?.user) {
          onAuth(data.user);
          navigate('/affiliate/dashboard', { replace: true });
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="afd-auth-page">
      <div className="afd-auth-bg">
        <div className="afd-auth-orb afd-auth-orb1"/>
        <div className="afd-auth-orb afd-auth-orb2"/>
      </div>
      <div className="afd-auth-card">
        <div className="afd-auth-logo">FIRE<span>Ledger</span> <span className="afd-auth-tag">Affiliate Portal</span></div>

        <div className="afd-auth-toggle">
          <button className={`afd-toggle-btn ${mode==='signin'?'active':''}`} onClick={()=>{setMode('signin');clear();}}>Sign in</button>
          <button className={`afd-toggle-btn ${mode==='signup'?'active':''}`} onClick={()=>{setMode('signup');clear();}}>Create account</button>
        </div>

        <h2 className="afd-auth-title">
          {mode==='signin'?'Affiliate sign in':mode==='forgot'?'Reset password':'Create affiliate account'}
        </h2>
        <p className="afd-auth-sub">
          {mode==='signin'?'Access your referral dashboard and earnings.':
           mode==='forgot'?'Enter your email and we will send a reset link.':
           'Create your affiliate account now and get your referral link immediately.'}
        </p>

        <button className="afd-social-btn" type="button" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="afd-auth-divider"><span>or</span></div>

        <form className="afd-auth-form" onSubmit={handleSubmit}>
          {mode==='signup' && (
            <div className="afd-field">
              <label className="afd-label">Full name</label>
              <input className="afd-input" type="text" placeholder="Your full name"
                value={name} onChange={e=>{setName(e.target.value);clear();}} required/>
            </div>
          )}
          <div className="afd-field">
            <label className="afd-label">Email address</label>
            <input className="afd-input" type="email" placeholder="you@example.com"
              value={email} onChange={e=>{setEmail(e.target.value);clear();}} required/>
          </div>
          {mode!=='forgot' && (
            <div className="afd-field">
              <label className="afd-label">Password</label>
              <input className="afd-input" type="password" placeholder={mode==='signup'?'Min. 8 characters':'Your password'}
                value={password} onChange={e=>{setPassword(e.target.value);clear();}} required/>
            </div>
          )}

          {error && <div className="afd-error">{error}</div>}
          {msg   && <div className="afd-msg">{msg}</div>}

          <button className="afd-submit" type="submit" disabled={loading}>
            {loading?'Please wait…':mode==='signup'?'Create account →':mode==='forgot'?'Send reset link →':'Sign in →'}
          </button>
        </form>

        <div className="afd-auth-links">
          {mode==='signin' && <>
            <button className="afd-link" onClick={()=>{setMode('forgot');clear();}}>Forgot password?</button>
            <span className="afd-dot">·</span>
            <button className="afd-link" onClick={()=>{setMode('signup');clear();}}>Create account</button>
          </>}
          {mode==='signup' && <button className="afd-link" onClick={()=>{setMode('signin');clear();}}>Already have an account? Sign in</button>}
          {mode==='forgot' && <button className="afd-link" onClick={()=>{setMode('signin');clear();}}>← Back to sign in</button>}
        </div>

        <p className="afd-auth-fine">
          Create your affiliate account, then sign in to manage your link, payouts, and code setup.
          Questions? <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a>
        </p>
      </div>
    </div>
  );
}

function AffiliateRecovery({ user, error, onRetry, onSignOut }) {
  return (
    <div className="afd-auth-page">
      <div className="afd-auth-bg">
        <div className="afd-auth-orb afd-auth-orb1"/>
        <div className="afd-auth-orb afd-auth-orb2"/>
      </div>
      <div className="afd-auth-card">
        <div className="afd-auth-logo">FIRE<span>Ledger</span> <span className="afd-auth-tag">Affiliate Portal</span></div>
        <h2 className="afd-auth-title">Finish affiliate setup</h2>
        <p className="afd-auth-sub">
          We found your account for {user?.email}, but your affiliate profile has not been completed yet.
          Retry below and we will finish creating your code and dashboard access.
        </p>
        {error && <div className="afd-error">{error}</div>}
        <div className="afd-auth-actions">
          <button className="afd-submit" type="button" onClick={onRetry}>
            Retry affiliate setup →
          </button>
          <button className="afd-secondary-btn" type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────────
function Dashboard({ user, profile, onSignOut, onProfileUpdate }) {
  const [referrals, setReferrals]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [copied,    setCopied]      = useState(false);
  const [discountStats, setDiscountStats] = useState(null);
  const [codeDraft, setCodeDraft]   = useState(profile?.paddle_discount_code || profile?.referral_code || '');
  const [savingCode, setSavingCode] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [paddleSyncing, setPaddleSyncing] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    payout_method: profile?.payout_method || 'PayPal',
    payout_email: profile?.payout_email || user?.email || '',
    notes: profile?.notes || '',
  });
  const [tab,       setTab]         = useState('overview'); // overview | ledger | payouts
  const publicBaseUrl =
    process.env.REACT_APP_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://fire-ledger-web.vercel.app');
  const refLink = profile?.referral_code
    ? `${publicBaseUrl.replace(/\/$/, '')}/?ref=${profile.referral_code}`
    : null;
  const activeCode = profile?.paddle_discount_code || profile?.referral_code || '';
  const paddleReady = Boolean(profile?.paddle_discount_code && profile?.paddle_discount_id);
  const codeUsageCount = discountStats?.paddleRedemptions ?? 0;
  const uniqueCustomers = discountStats?.uniqueCustomers ?? 0;

  useEffect(() => {
    setCodeDraft(profile?.paddle_discount_code || profile?.referral_code || '');
  }, [profile?.paddle_discount_code, profile?.referral_code]);

  useEffect(() => {
    setPayoutForm({
      payout_method: profile?.payout_method || 'PayPal',
      payout_email: profile?.payout_email || user?.email || '',
      notes: profile?.notes || '',
    });
  }, [profile?.payout_method, profile?.payout_email, profile?.notes, user?.email]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data }, usageStats] = await Promise.all([
      supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', profile.id)
        .order('created_at', { ascending: false }),
      loadAffiliateDiscountStats(user.id).catch(() => null),
    ]);
    setReferrals(data || []);
    setDiscountStats(usageStats);
    setLoading(false);
  }, [profile.id, user.id]);

  useEffect(() => { load(); }, [load]);

  // ── Computed stats ──
  const totalEarnings    = referrals.reduce((s, r) => s + (r.commission_amount || 0), 0);
  const paidEarnings     = referrals.filter(r=>r.payout_status==='paid').reduce((s,r)=>s+(r.commission_amount||0),0);
  const pendingEarnings  = referrals.filter(r=>r.payout_status==='pending').reduce((s,r)=>s+(r.commission_amount||0),0);
  const totalReferrals   = referrals.length;
  const trackedConversions = discountStats?.trackedConversions ?? totalReferrals;

  // Rolling 6-month breakdown
  const monthlyData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('en-US',{month:'short',year:'2-digit'});
      const amount = referrals
        .filter(r => r.created_at?.startsWith(key))
        .reduce((s,r)=>s+(r.commission_amount||0),0);
      months.push({ key, label, amount });
    }
    return months;
  })();
  const maxMonth = Math.max(...monthlyData.map(m=>m.amount), 1);

  const handleCopy = () => {
    if (refLink) { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  };

  const saveCustomCode = async () => {
    const nextCode = sanitizeCode(codeDraft);
    if (!nextCode) return;
    setSavingCode(true);
    try {
      const result = await provisionAffiliateCode({
        userId: user.id,
        email: user.email,
        fullName: profile?.full_name || user.email,
        preferredCode: nextCode,
      });
      onProfileUpdate({
        ...profile,
        referral_code: result.profile?.referral_code || nextCode,
        paddle_discount_code: result.profile?.paddle_discount_code || profile?.paddle_discount_code || null,
        paddle_discount_id: result.profile?.paddle_discount_id || profile?.paddle_discount_id,
      });
      if (result.paddleError) {
        alert(`Code saved in FIRE Ledger, but Paddle has not activated it yet: ${result.paddleError}`);
      }
    } catch (error) {
      alert(error.message);
      return;
    } finally {
      setSavingCode(false);
    }
  };

  const syncPaddleCode = useCallback(async (preferredCode = codeDraft || activeCode, { silent = false } = {}) => {
    const nextCode = sanitizeCode(preferredCode);
    if (!nextCode) return;
    setPaddleSyncing(true);
    try {
      const result = await provisionAffiliateCode({
        userId: user.id,
        email: user.email,
        fullName: profile?.full_name || user.email,
        preferredCode: nextCode,
      });
      onProfileUpdate({
        ...profile,
        referral_code: result.profile?.referral_code || nextCode,
        paddle_discount_code: result.profile?.paddle_discount_code || profile?.paddle_discount_code || null,
        paddle_discount_id: result.profile?.paddle_discount_id || profile?.paddle_discount_id || null,
      });
      if (result.paddleError && !silent) {
        alert(`Paddle has not activated this discount yet: ${result.paddleError}`);
      }
    } catch (error) {
      if (!silent) alert(error.message);
    } finally {
      setPaddleSyncing(false);
    }
  }, [activeCode, codeDraft, onProfileUpdate, profile, user.id, user.email]);

  const savePayoutDetails = async () => {
    setSavingPayout(true);
    try {
      const result = await saveAffiliatePayout({
        userId: user.id,
        payoutMethod: payoutForm.payout_method,
        payoutEmail: payoutForm.payout_email,
        notes: payoutForm.notes,
      });
      onProfileUpdate(result.profile || {
        ...profile,
        payout_method: payoutForm.payout_method,
        payout_email: payoutForm.payout_email,
        notes: payoutForm.notes,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingPayout(false);
    }
  };

  useEffect(() => {
    if (!profile?.referral_code || paddleReady || paddleSyncing) return;
    syncPaddleCode(profile.referral_code, { silent: true });
  }, [profile?.referral_code, paddleReady, paddleSyncing, syncPaddleCode]);

  return (
    <div className="afd-page">
      {/* ── Header ── */}
      <header className="afd-header">
        <div className="afd-header-left">
          <div className="afd-logo">FIRE<span>Ledger</span></div>
          <span className="afd-header-tag">Affiliate Portal</span>
        </div>
        <div className="afd-header-right">
          <span className="afd-header-user">{profile?.full_name || user.email}</span>
          <div className={`afd-status-pill ${profile?.status}`}>{profile?.status}</div>
          <button className="afd-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <div className="afd-body">
        {/* ── Sidebar ── */}
        <aside className="afd-sidebar">
          <nav className="afd-nav">
            {[
              { id:'overview', label:'Overview'    },
              { id:'ledger',   label:'Ledger'      },
              { id:'payouts',  label:'Payouts'     },
            ].map(item=>(
              <button key={item.id}
                className={`afd-nav-item ${tab===item.id?'afd-nav-active':''}`}
                onClick={()=>setTab(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          {/* Referral link */}
          <div className="afd-sidebar-link-section">
            <div className="afd-sidebar-link-label">YOUR REFERRAL LINK</div>
            {refLink ? (
              <>
                <div className="afd-sidebar-link-url">{refLink}</div>
                <button className="afd-copy-btn" onClick={handleCopy}>
                  {copied ? '✓ COPIED' : 'COPY LINK'}
                </button>
              </>
            ) : (
              <div className="afd-sidebar-link-pending">Referral link will appear after your profile is created.</div>
            )}
          </div>
          <div className="afd-sidebar-link-section">
            <div className="afd-sidebar-link-label">YOUR PADDLE CODE</div>
            <input
              className="afd-code-input"
              type="text"
              placeholder="YOURCODE"
              value={codeDraft}
              onChange={e => setCodeDraft(sanitizeCode(e.target.value))}
            />
            <button className="afd-copy-btn" onClick={saveCustomCode} disabled={savingCode || !sanitizeCode(codeDraft)}>
              {savingCode ? 'SAVING…' : 'SAVE CODE'}
            </button>
            <div className="afd-sidebar-link-pending">
              Active code: {activeCode || 'Use your referral code or create a custom Paddle code here.'}
            </div>
            <div className="afd-code-metrics">
              <div className="afd-code-metric">
                <span className="afd-code-metric-label">Paddle uses</span>
                <span className="afd-code-metric-value">{fmtInt(codeUsageCount)}</span>
              </div>
              <div className="afd-code-metric">
                <span className="afd-code-metric-label">Unique buyers</span>
                <span className="afd-code-metric-value">{fmtInt(uniqueCustomers)}</span>
              </div>
            </div>
            <div className={`afd-provision-state ${paddleReady ? 'ready' : 'pending'}`}>
              {paddleReady ? 'Paddle discount active' : 'Paddle discount not live yet'}
            </div>
            {!paddleReady && (
              <button className="afd-copy-btn" onClick={() => syncPaddleCode(activeCode)} disabled={paddleSyncing || !activeCode}>
                {paddleSyncing ? 'SYNCING…' : 'SYNC WITH PADDLE'}
              </button>
            )}
          </div>
          <div className="afd-sidebar-footer">
            <a href="mailto:thimbleforgeapps@gmail.com" className="afd-support-link">Support</a>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="afd-main">

          {/* ── OVERVIEW TAB ── */}
          {tab==='overview' && (
            <>
              <div className="afd-page-head">
                <h1 className="afd-page-title">Overview</h1>
                <span className="afd-page-meta">All time · {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</span>
              </div>

              {/* KPI row */}
              <div className="afd-kpi-grid">
                {[
                  { label:'TOTAL EARNINGS',   value:`$${fmt(totalEarnings)}`,   accent:'var(--afd-accent2)' },
                  { label:'PAID OUT',          value:`$${fmt(paidEarnings)}`,    accent:'var(--afd-accent2)' },
                  { label:'PENDING',           value:`$${fmt(pendingEarnings)}`, accent:'var(--afd-accent2)' },
                  { label:'TRACKED CONVERSIONS', value:fmtInt(trackedConversions), accent:'#f0f0f8' },
                  { label:'UNIQUE BUYERS',     value:fmtInt(uniqueCustomers),   accent:'#f0f0f8' },
                  { label:'CODE REDEMPTIONS',  value:fmtInt(codeUsageCount),    accent:'#f0f0f8' },
                ].map(k=>(
                  <div key={k.label} className="afd-kpi">
                    <span className="afd-kpi-label">{k.label}</span>
                    <span className="afd-kpi-value" style={{ color:k.accent }}>{k.value}</span>
                  </div>
                ))}
              </div>

              {/* Monthly chart */}
              <div className="afd-section">
                <div className="afd-section-head">
                  <span className="afd-section-title">MONTHLY EARNINGS — TRAILING 6 MONTHS</span>
                </div>
                <div className="afd-chart-wrap">
                  {monthlyData.map(m=>(
                    <div key={m.key} className="afd-chart-col">
                      <span className="afd-chart-val">${fmt(m.amount)}</span>
                      <div className="afd-chart-bar-wrap">
                        <div className="afd-chart-bar" style={{ height:`${Math.max((m.amount/maxMonth)*100,2)}%` }}/>
                      </div>
                      <span className="afd-chart-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent conversions */}
              <div className="afd-section">
                <div className="afd-section-head">
                  <span className="afd-section-title">RECENT CONVERSIONS</span>
                  <button className="afd-section-link" onClick={()=>setTab('ledger')}>VIEW ALL →</button>
                </div>
                <div className="afd-table">
                  <div className="afd-table-head">
                    <span>DATE</span>
                    <span>REFERRED USER</span>
                    <span>PLAN</span>
                    <span>COMMISSION</span>
                    <span>STATUS</span>
                  </div>
                  {loading && <div className="afd-loading">Loading…</div>}
                  {!loading && referrals.length===0 && (
                    <div className="afd-empty">No conversions recorded yet. Share your referral link to get started.</div>
                  )}
                  {!loading && referrals.slice(0,8).map((r,i)=>(
                    <div key={i} className="afd-table-row">
                      <span className="afd-cell-mono">{fmtDate(r.created_at)}</span>
                      <span className="afd-cell-mono">{maskEmail(r.referred_email)}</span>
                      <span className="afd-cell-plan">{r.plan_type || '—'}</span>
                      <span className="afd-cell-mono afd-cell-amount">${fmt(r.commission_amount)}</span>
                      <span className={`afd-status-tag afd-status-${r.payout_status}`}>{(r.payout_status||'—').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── LEDGER TAB ── */}
          {tab==='ledger' && (
            <>
              <div className="afd-page-head">
                <h1 className="afd-page-title">Referral Ledger</h1>
                <span className="afd-page-meta">{fmtInt(referrals.length)} total entries</span>
              </div>
              <div className="afd-section">
                <div className="afd-table">
                  <div className="afd-table-head afd-table-head-ledger">
                    <span>DATE</span>
                    <span>REFERRED USER</span>
                    <span>PLAN</span>
                    <span>PLAN PRICE</span>
                    <span>COMMISSION</span>
                    <span>SUB STATUS</span>
                    <span>PAYOUT</span>
                  </div>
                  {loading && <div className="afd-loading">Loading…</div>}
                  {!loading && referrals.length===0 && (
                    <div className="afd-empty">No referrals recorded. Your conversions will appear here once someone signs up using your link.</div>
                  )}
                  {!loading && referrals.map((r,i)=>(
                    <div key={i} className="afd-table-row afd-table-row-ledger">
                      <span className="afd-cell-mono">{fmtDate(r.created_at)}</span>
                      <span className="afd-cell-mono">{maskEmail(r.referred_email)}</span>
                      <span className="afd-cell-plan">{r.plan_type || '—'}</span>
                      <span className="afd-cell-mono">${fmt(r.plan_price)}</span>
                      <span className="afd-cell-mono afd-cell-amount">${fmt(r.commission_amount)}</span>
                      <span className={`afd-status-tag afd-status-${r.status}`}>{(r.status||'—').toUpperCase()}</span>
                      <span className={`afd-status-tag afd-status-${r.payout_status}`}>{(r.payout_status||'—').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals row */}
              {!loading && referrals.length > 0 && (
                <div className="afd-totals-row">
                  <span className="afd-totals-label">TOTAL COMMISSIONS EARNED</span>
                  <span className="afd-totals-value">${fmt(totalEarnings)}</span>
                </div>
              )}
            </>
          )}

          {/* ── PAYOUTS TAB ── */}
          {tab==='payouts' && (
            <>
              <div className="afd-page-head">
                <h1 className="afd-page-title">Payouts</h1>
                <span className="afd-page-meta">Store your payout destination and review what is next</span>
              </div>

              {/* Payout summary */}
              <div className="afd-kpi-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">TOTAL PAID</span>
                  <span className="afd-kpi-value" style={{ color:'var(--afd-accent2)' }}>${fmt(paidEarnings)}</span>
                </div>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">PENDING (NEXT PAYOUT)</span>
                  <span className="afd-kpi-value" style={{ color:'var(--afd-accent2)' }}>${fmt(pendingEarnings)}</span>
                </div>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">MINIMUM PAYOUT THRESHOLD</span>
                  <span className="afd-kpi-value" style={{ color:'#8888aa' }}>$20.00</span>
                </div>
              </div>

              <div className="afd-section">
                <div className="afd-payout-callout">
                  <div className="afd-payout-callout-title">How this page works</div>
                  <p className="afd-payout-callout-body">
                    Add the payout destination you want us to use, check what has already been paid, and review what is still pending for the next payout run. Your active affiliate code stays attached here so payouts and attribution stay tied to the same profile.
                  </p>
                </div>
                <div className="afd-payout-callout">
                  <div className="afd-payout-callout-title">Code usage on your profile</div>
                  <p className="afd-payout-callout-body">
                    Your active code <strong>{activeCode || '—'}</strong> has been redeemed <strong>{fmtInt(codeUsageCount)}</strong> time(s) in Paddle and is currently tied to <strong>{fmtInt(uniqueCustomers)}</strong> unique buyer(s) in your tracked affiliate ledger.
                  </p>
                </div>
                <div className="afd-section-head">
                  <span className="afd-section-title">PAYOUT METHOD</span>
                </div>
                <div className="afd-payout-method-card">
                  <div className="afd-payout-method-row">
                    <span className="afd-payout-method-label">REGISTERED EMAIL</span>
                    <span className="afd-payout-method-val">{user?.email || '—'}</span>
                  </div>
                  <div className="afd-payout-method-row">
                    <span className="afd-payout-method-label">PAYOUT VIA</span>
                    <span className="afd-payout-method-val">{profile?.payout_method || 'PayPal / Bank Transfer'}</span>
                  </div>
                  <div className="afd-payout-method-row">
                    <span className="afd-payout-method-label">PAYOUT DESTINATION</span>
                    <span className="afd-payout-method-val">{profile?.payout_email || 'Add your payout destination below'}</span>
                  </div>
                  <div className="afd-payout-method-row">
                    <span className="afd-payout-method-label">PAYOUT SCHEDULE</span>
                    <span className="afd-payout-method-val">Monthly — 1st of each month</span>
                  </div>
                  <div className="afd-payout-method-row">
                    <span className="afd-payout-method-label">ACTIVE PADDLE CODE</span>
                    <span className="afd-payout-method-val">{activeCode || 'Set a custom code in the sidebar'}</span>
                  </div>
                </div>
                <div className="afd-payout-settings">
                  <div className="afd-section-head">
                    <span className="afd-section-title">UPDATE PAYOUT DETAILS</span>
                  </div>
                  <div className="afd-payout-form">
                    <div className="afd-field">
                      <label className="afd-label">Payout method</label>
                      <select
                        className="afd-input"
                        value={payoutForm.payout_method}
                        onChange={e => setPayoutForm(prev => ({ ...prev, payout_method: e.target.value }))}
                      >
                        <option value="PayPal">PayPal</option>
                        <option value="Wise">Wise</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="afd-field">
                      <label className="afd-label">Payout email or account</label>
                      <input
                        className="afd-input"
                        type="text"
                        value={payoutForm.payout_email}
                        onChange={e => setPayoutForm(prev => ({ ...prev, payout_email: e.target.value }))}
                        placeholder="PayPal email or bank reference"
                      />
                    </div>
                    <div className="afd-field">
                      <label className="afd-label">Payout notes</label>
                      <textarea
                        className="afd-input afd-textarea"
                        rows={3}
                        value={payoutForm.notes || ''}
                        onChange={e => setPayoutForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Bank name, routing reference, Wise handle, or payout notes"
                      />
                    </div>
                    <button className="afd-submit afd-inline-submit" type="button" onClick={savePayoutDetails} disabled={savingPayout}>
                      {savingPayout ? 'Saving…' : 'Save payout details →'}
                    </button>
                  </div>
                </div>
                <p className="afd-payout-note">
                  Save your payout method here so your affiliate account is ready when payouts are processed. Contact <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a> only if you need payout support.
                </p>
                <p className="afd-payout-note">
                  Your code is provisioned automatically in Paddle and attached to your affiliate profile for checkout and webhook attribution.
                </p>
              </div>

              {/* Paid referrals */}
              <div className="afd-section">
                <div className="afd-section-head">
                  <span className="afd-section-title">PAID TRANSACTIONS</span>
                </div>
                <div className="afd-table">
                  <div className="afd-table-head">
                    <span>DATE</span>
                    <span>REFERRED USER</span>
                    <span>PLAN</span>
                    <span>COMMISSION</span>
                    <span>STATUS</span>
                  </div>
                  {referrals.filter(r=>r.payout_status==='paid').length===0 && (
                    <div className="afd-empty">No paid transactions yet. Commissions are paid on the 1st of each month once the $20 minimum is met.</div>
                  )}
                  {referrals.filter(r=>r.payout_status==='paid').map((r,i)=>(
                    <div key={i} className="afd-table-row">
                      <span className="afd-cell-mono">{fmtDate(r.created_at)}</span>
                      <span className="afd-cell-mono">{maskEmail(r.referred_email)}</span>
                      <span className="afd-cell-plan">{r.plan_type||'—'}</span>
                      <span className="afd-cell-mono afd-cell-amount">${fmt(r.commission_amount)}</span>
                      <span className="afd-status-tag afd-status-paid">PAID</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

// ── Root component ───────────────────────────────────────────────────────────
export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    markAffiliateAuthIntent();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user);
      }
      setLoading(false);
    });
  }, []);

  const loadProfile = async (u) => {
    setUser(u);
    setSetupError('');
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle();
    if (error) {
      setProfile(null);
      setSetupError(error.message || 'Could not load affiliate profile.');
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    try {
      setProvisioning(true);
      const result = await ensureAffiliateProfile(u);
      setProfile(result.profile || null);
      setSetupError('');
    } catch (err) {
      setProfile(null);
      setSetupError(err.message || 'Could not finish affiliate setup.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleAuth = async (u) => {
    await loadProfile(u);
  };

  const handleProfileUpdate = nextProfile => {
    setProfile(nextProfile);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAffiliateAuthIntent();
    setUser(null);
    setProfile(null);
    setSetupError('');
    navigate('/affiliate/dashboard', { replace: true });
  };

  if (loading || provisioning) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#08080f',color:'#55557a',fontFamily:'monospace',fontSize:13,letterSpacing:1 }}>
      {provisioning ? 'FINALIZING AFFILIATE SETUP…' : 'LOADING…'}
    </div>
  );

  if (!user) return <AffiliateAuth onAuth={handleAuth}/>;

  if (!profile) {
    return (
      <AffiliateRecovery
        user={user}
        error={setupError}
        onRetry={() => loadProfile(user)}
        onSignOut={handleSignOut}
      />
    );
  }

  return <Dashboard user={user} profile={profile} onSignOut={handleSignOut} onProfileUpdate={handleProfileUpdate}/>;
}
