import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
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

// ── Auth screen ──────────────────────────────────────────────────────────────
function AffiliateAuth({ onAuth }) {
  const [mode,     setMode]     = useState('signin'); // signin | signup | forgot
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const clear = () => { setError(''); setMsg(''); };

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
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: 'affiliate' } },
        });
        if (err) { setError(err.message); }
        else {
          // Create pending affiliate profile
          if (data?.user) {
            await supabase.from('affiliate_profiles').insert({
              user_id:        data.user.id,
              email:          email,
              full_name:      name,
              status:         'pending',
              referral_code:  null,
              created_at:     new Date().toISOString(),
            });
          }
          setMsg('Account created. Your application is under review — we approve within 24 hours. You will receive an email once approved.');
          setMode('signin');
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError('Invalid email or password.'); }
        else if (data?.user) { onAuth(data.user); }
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
          <button className={`afd-toggle-btn ${mode==='signup'?'active':''}`} onClick={()=>{setMode('signup');clear();}}>Apply</button>
        </div>

        <h2 className="afd-auth-title">
          {mode==='signin'?'Affiliate sign in':mode==='forgot'?'Reset password':'Apply to join'}
        </h2>
        <p className="afd-auth-sub">
          {mode==='signin'?'Access your referral dashboard and earnings.':
           mode==='forgot'?'Enter your email and we will send a reset link.':
           'Fill in your details. We review and approve within 24 hours.'}
        </p>

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
            {loading?'Please wait…':mode==='signup'?'Submit application →':mode==='forgot'?'Send reset link →':'Sign in →'}
          </button>
        </form>

        <div className="afd-auth-links">
          {mode==='signin' && <>
            <button className="afd-link" onClick={()=>{setMode('forgot');clear();}}>Forgot password?</button>
            <span className="afd-dot">·</span>
            <button className="afd-link" onClick={()=>{setMode('signup');clear();}}>Apply to join</button>
          </>}
          {mode==='signup' && <button className="afd-link" onClick={()=>{setMode('signin');clear();}}>Already have an account? Sign in</button>}
          {mode==='forgot' && <button className="afd-link" onClick={()=>{setMode('signin');clear();}}>← Back to sign in</button>}
        </div>

        <p className="afd-auth-fine">
          This portal is for approved affiliates only.
          Questions? <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a>
        </p>
      </div>
    </div>
  );
}

// ── Pending approval screen ──────────────────────────────────────────────────
function PendingScreen({ email, onSignOut }) {
  return (
    <div className="afd-auth-page">
      <div className="afd-auth-bg"><div className="afd-auth-orb afd-auth-orb1"/><div className="afd-auth-orb afd-auth-orb2"/></div>
      <div className="afd-auth-card" style={{ textAlign:'center' }}>
        <div className="afd-auth-logo">FIRE<span>Ledger</span> <span className="afd-auth-tag">Affiliate Portal</span></div>
        <div className="afd-pending-icon">⏳</div>
        <h2 className="afd-auth-title">Application under review</h2>
        <p className="afd-auth-sub" style={{ marginBottom:24 }}>
          Your application for <strong>{email}</strong> is being reviewed. We approve within 24 hours and will email you when your account is active.
        </p>
        <button className="afd-submit" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────────
function Dashboard({ user, profile, onSignOut }) {
  const [referrals, setReferrals]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [copied,    setCopied]      = useState(false);
  const [tab,       setTab]         = useState('overview'); // overview | ledger | payouts

  const refLink = profile?.referral_code
    ? `https://fireledger.app/?ref=${profile.referral_code}`
    : null;

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_id', profile.id)
      .order('created_at', { ascending: false });
    setReferrals(data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  // ── Computed stats ──
  const totalEarnings    = referrals.reduce((s, r) => s + (r.commission_amount || 0), 0);
  const paidEarnings     = referrals.filter(r=>r.payout_status==='paid').reduce((s,r)=>s+(r.commission_amount||0),0);
  const pendingEarnings  = referrals.filter(r=>r.payout_status==='pending').reduce((s,r)=>s+(r.commission_amount||0),0);
  const totalReferrals   = referrals.length;
  const activeReferrals  = referrals.filter(r=>r.status==='active').length;

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
              <div className="afd-sidebar-link-pending">Link assigned after approval</div>
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
                  { label:'TOTAL EARNINGS',   value:`$${fmt(totalEarnings)}`,   accent:'#52c98a' },
                  { label:'PAID OUT',          value:`$${fmt(paidEarnings)}`,    accent:'#a78bfa' },
                  { label:'PENDING',           value:`$${fmt(pendingEarnings)}`, accent:'#fbbf24' },
                  { label:'TOTAL REFERRALS',   value:fmtInt(totalReferrals),    accent:'#f0f0f8' },
                  { label:'ACTIVE SUBSCRIBERS',value:fmtInt(activeReferrals),  accent:'#60a5fa' },
                  { label:'COMMISSION RATE',   value:'30.00%',                   accent:'#f472b6' },
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
                <h1 className="afd-page-title">Payout History</h1>
                <span className="afd-page-meta">Paid monthly on the 1st</span>
              </div>

              {/* Payout summary */}
              <div className="afd-kpi-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">TOTAL PAID</span>
                  <span className="afd-kpi-value" style={{ color:'#52c98a' }}>${fmt(paidEarnings)}</span>
                </div>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">PENDING (NEXT PAYOUT)</span>
                  <span className="afd-kpi-value" style={{ color:'#fbbf24' }}>${fmt(pendingEarnings)}</span>
                </div>
                <div className="afd-kpi">
                  <span className="afd-kpi-label">MINIMUM PAYOUT THRESHOLD</span>
                  <span className="afd-kpi-value" style={{ color:'#8888aa' }}>$20.00</span>
                </div>
              </div>

              <div className="afd-section">
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
                    <span className="afd-payout-method-label">PAYOUT SCHEDULE</span>
                    <span className="afd-payout-method-val">Monthly — 1st of each month</span>
                  </div>
                </div>
                <p className="afd-payout-note">
                  To update your payout method or details, contact <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a> with your registered email.
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
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user);
      }
      setLoading(false);
    });
  }, []);

  const loadProfile = async (u) => {
    setUser(u);
    const { data } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle();
    setProfile(data || null);
  };

  const handleAuth = async (u) => {
    await loadProfile(u);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#08080f',color:'#55557a',fontFamily:'monospace',fontSize:13,letterSpacing:1 }}>
      LOADING…
    </div>
  );

  if (!user || !profile) return <AffiliateAuth onAuth={handleAuth}/>;
  if (profile.status === 'pending') return <PendingScreen email={user.email} onSignOut={handleSignOut}/>;

  return <Dashboard user={user} profile={profile} onSignOut={handleSignOut}/>;
}
