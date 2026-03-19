import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

const POPUP_KEY = 'fl_hours_popup_seen';

// SVG feature icons — no emojis
const FeatureIcons = {
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L5.5 7.5L8.5 9.5L12 4.5L14 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
    </svg>
  ),
};

// Mini ring SVG for dashboard preview
function MiniRing({ pct, size = 90 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke="url(#ring-grad)"
        strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 45 45)"/>
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [showPopup,    setShowPopup]    = useState(false);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [navScrolled,  setNavScrolled]  = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(POPUP_KEY)) setShowPopup(true);
  }, []);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handlePopupClose = () => { localStorage.setItem(POPUP_KEY, '1'); setShowPopup(false); };
  const handleStart = () => { if (user) navigate('/app'); else signInWithGoogle(); };
  const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  const FAQS = [
    {
      q: 'Will I actually be able to retire early — or is this just a calculator?',
      a: 'FIRE Ledger models your trajectory based on your real income, spending, and savings — updated every time you log a transaction. It shows you the gap between where you are and where you need to be, and quantifies exactly how each financial decision moves that date. Whether you reach it is up to your choices. This tool makes those choices visible.',
    },
    {
      q: 'Is my financial data safe?',
      a: 'Your data is stored on Supabase infrastructure hosted on AWS, encrypted in transit and at rest. We do not sell, license, or share your data with any third party. You can export or permanently delete everything at any time.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'Payments are processed by Paddle — a globally recognised payment infrastructure provider used by thousands of software companies. Paddle accepts all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay where available. You can verify Paddle independently at paddle.com.',
    },
    {
      q: 'How does FIRE Ledger calculate my retirement date?',
      a: 'We use the 4% rule — a standard from long-term retirement research. Your FIRE number is your annual expenses × 25. Portfolio growth is modelled at a conservative 7% annual real return. The Monte Carlo simulation runs 500 market scenarios to stress-test your plan against real-world variance.',
    },
    {
      q: 'Should I treat these projections as financial advice?',
      a: 'No. FIRE Ledger is a financial planning and tracking tool. The projections are estimates based on your inputs and established financial models. They are designed to answer the question you actually care about — when can you stop working, and will you get there — not to substitute for regulated advice. For personalised investment guidance, consult a qualified financial adviser.',
    },
    {
      q: 'What happens to my data if I cancel?',
      a: 'Your data remains intact for 30 days following cancellation. After that period, you can request permanent deletion by contacting support. We retain no financial data beyond that window.',
    },
    {
      q: 'How do I import my existing bank transactions?',
      a: 'Go to Export & Import → Smart Import. Download a CSV from your bank and upload it. The importer automatically detects column formats, date styles, and debit/credit structures — no reformatting required.',
    },
    {
      q: 'Still have a question?',
      a: 'Reach us at thimbleforgeapps@gmail.com or via the contact links below. We respond within 24 hours.',
    },
  ];

  const FEATURES = [
    {
      Icon: FeatureIcons.Calendar,
      title: 'Your Exact FIRE Date',
      desc: 'A precise date — not a vague range. Updated in real time as your financial picture changes.',
    },
    {
      Icon: FeatureIcons.Clock,
      title: 'Hours Left to Work',
      desc: 'Not years. Hours. The number that makes your timeline concrete and the cost of inaction visceral.',
    },
    {
      Icon: FeatureIcons.Chart,
      title: 'Monte Carlo Simulation',
      desc: '500 market scenarios tested against your plan. Know the probability it holds before it matters.',
    },
    {
      Icon: FeatureIcons.Shield,
      title: 'Net Worth Tracker',
      desc: 'The only number that tells you where you actually stand — assets minus liabilities, updated live.',
    },
    {
      Icon: FeatureIcons.Target,
      title: 'Needs vs Wants Analysis',
      desc: 'See which spending categories are costing you years of freedom, broken down month by month.',
    },
    {
      Icon: FeatureIcons.Download,
      title: 'Smart Bank Import',
      desc: 'Upload any bank statement CSV. The importer handles every format — no manual entry required.',
    },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose}/>}

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('problem')}>The Problem</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button>
        </div>
        <button className="nav-cta" onClick={handleStart}>Find my number →</button>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero" id="top">
        <div className="hero-bg">
          <div className="orb orb1"/>
          <div className="orb orb2"/>
          <div className="orb orb3"/>
          <div className="grid-overlay"/>
        </div>
        <div className="hero-content">
          <span className="hero-eyebrow">The question most people never ask</span>
          <h1 className="hero-title">
            When can you<br/>
            <span className="hero-title-line2">stop working?</span>
          </h1>
          <p className="hero-sub">
            Most people have no answer. They work until retirement age simply because they never calculated the alternative.<br/>
            FIRE Ledger gives you the number — and shows you exactly how to reach it.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              Calculate my freedom date →
            </button>
            <button className="btn-secondary" onClick={() => scrollTo('preview')}>
              See how it works
            </button>
          </div>
          <div className="hero-trust">
            <span>No credit card required</span>
            <span className="hero-trust-dot">·</span>
            <span>Free to start</span>
            <span className="hero-trust-dot">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">90,000</span>
            <span className="stat-label">Average lifetime work hours</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">25×</span>
            <span className="stat-label">Your FIRE target multiple</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">4%</span>
            <span className="stat-label">Safe withdrawal rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">7 min</span>
            <span className="stat-label">To see your full projection</span>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ────────────────────────── */}
      <section className="preview-section" id="preview">
        <p className="preview-label">Your dashboard — live after sign-in</p>
        <div className="preview-frame">
          <div className="preview-chrome">
            <div className="chrome-dot red"/>
            <div className="chrome-dot yellow"/>
            <div className="chrome-dot green"/>
            <span className="chrome-url">app.fireledger.app — Dashboard</span>
          </div>
          <div className="preview-dashboard">
            {/* Sidebar */}
            <div className="preview-sidebar">
              <div className="preview-brand">FIRELedger</div>
              {[
                { label:'Dashboard',   active:true  },
                { label:'Transactions',active:false },
                { label:'Insights',    active:false },
                { label:'FIRE Calc',   active:false },
                { label:'Projections', active:false },
                { label:'Net Worth',   active:false },
                { label:'Settings',    active:false },
              ].map(item => (
                <div key={item.label} className={`preview-nav-item ${item.active ? 'active' : ''}`}>
                  <div className="preview-nav-dot"/>
                  {item.label}
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="preview-main">
              <div className="preview-page-title">Good morning</div>
              <div className="preview-page-sub">$142.00 spent today · 12-day streak</div>

              {/* FIRE hero card */}
              <div className="preview-fire-card">
                <div className="preview-fire-left">
                  <div className="preview-fire-eyebrow">Financial Independence</div>
                  <div className="preview-fire-years">18 <span style={{fontSize:14,fontWeight:400,color:'var(--text2)'}}>years away</span></div>
                  <div className="preview-fire-date">Projected freedom: <strong>Mar 2043</strong></div>
                  <div className="preview-fire-hours">
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <strong>37,440</strong>&nbsp;working hours remaining
                  </div>
                  <div className="preview-progress-bar">
                    <div className="preview-progress-fill"/>
                  </div>
                  <div style={{fontSize:9,color:'var(--text3)',marginTop:4}}>23.1% complete · $115,500 of $500,000</div>
                </div>
                <div className="preview-fire-right">
                  <MiniRing pct={23}/>
                  <div className="preview-ring-label">
                    <span className="preview-ring-pct">23%</span>
                    <span className="preview-ring-sub">to FIRE</span>
                  </div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="preview-metrics">
                {[
                  { label:'Income',  val:'$5,200',  sub:'This month',       color:'#52c98a' },
                  { label:'Spent',   val:'$3,140',  sub:'60% of income',    color:'#e05c5c' },
                  { label:'Saved',   val:'$1,200',  sub:'23% savings rate', color:'#fbbf24' },
                  { label:'Grade',   val:'C',       sub:'Monthly score',    color:'#e05c5c' },
                ].map(m => (
                  <div key={m.label} className="preview-metric" style={{'--accent-color': m.color}}>
                    <div className="preview-metric-label">{m.label}</div>
                    <div className="preview-metric-val" style={{color: m.color}}>{m.val}</div>
                    <div className="preview-metric-sub">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Tx list */}
              <div className="preview-tx-header">
                <span className="preview-tx-title">Recent Transactions</span>
                <span className="preview-tx-viewall">View all →</span>
              </div>
              <div className="preview-tx-list">
                {[
                  { desc:'Monthly salary',    meta:'Income',     amt:'+$5,200.00', color:'#52c98a' },
                  { desc:'Rent — March',      meta:'Need · 2d',  amt:'-$1,400.00', color:'#e05c5c' },
                  { desc:'Index fund — ISA',  meta:'Saving · 3d',amt:'+$800.00',   color:'#fbbf24' },
                  { desc:'Groceries',         meta:'Need · 4d',  amt:'-$142.00',   color:'#e05c5c' },
                ].map((t, i) => (
                  <div key={i} className="preview-tx-row">
                    <div className="preview-tx-dot" style={{background: t.color}}/>
                    <span className="preview-tx-desc">{t.desc}</span>
                    <span className="preview-tx-meta">{t.meta}</span>
                    <span className="preview-tx-amt" style={{color: t.color}}>{t.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────── */}
      <section className="problem-section" id="problem">
        <span className="section-eyebrow">The reality most people avoid</span>
        <h2 className="section-title">
          Most people will work until 65<br/>
          <em>not because they chose to —<br/>because they never ran the numbers.</em>
        </h2>
        <p className="section-body">
          There is a precise point at which your investments generate enough income that work becomes optional. It has a date. It has a number. It is calculable right now, from your actual figures. Most people never calculate it. The ones who do — retire a decade earlier. FIRE Ledger exists for the second group.
        </p>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="features" id="features">
        <div className="features-header">
          <span className="section-eyebrow">What's inside</span>
          <h2 className="section-title" style={{textAlign:'center'}}>
            Every tool you need.<br/>Nothing you don't.
          </h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon-mark"><f.Icon/></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-title-section">
            <span className="section-eyebrow">Pricing</span>
            <h2 className="section-title" style={{textAlign:'center'}}>
              One number stands between you<br/>and never working again.
            </h2>
            <p style={{textAlign:'center',color:'var(--text2)',fontSize:15,marginTop:16,lineHeight:1.7}}>
              Most people spend 40 years discovering it too late.<br/>You now have a tool that tells you upfront.
            </p>
          </div>
          <div className="pricing-card">
            <div className="pricing-badge">Free to Start — No Card Required</div>
            <div className="pricing-tier">FIRE Ledger Pro</div>
            <div className="pricing-options">
              <div className="price-option">
                <span className="price-amount">$4.99</span>
                <span className="price-period">/month</span>
              </div>
              <div className="price-divider">or</div>
              <div className="price-option">
                <span className="price-amount">$59.99</span>
                <span className="price-period">/year</span>
                <span className="price-save">Save 17%</span>
              </div>
            </div>
            <ul className="pricing-features">
              {[
                'Your exact FIRE date — updated in real time',
                'Hours left to work — the number that changes behaviour',
                'FIRE, Lean, Fat & Coast FIRE calculators',
                'Monte Carlo simulation — 500 market scenarios',
                'Net Worth tracker and Compound Growth calculator',
                'Smart CSV bank statement import',
                'Guidance after every transaction',
                'Full data export — no lock-in',
                '48-hour refund guarantee',
              ].map((f, i) => (
                <li key={i}>
                  <span className="pricing-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="payment-trust">
              <span className="payment-trust-label">Secure checkout via</span>
              <div className="payment-logos">
                <span className="pay-logo">VISA</span>
                <span className="pay-logo">Mastercard</span>
                <span className="pay-logo">Amex</span>
                <span className="pay-logo">PayPal</span>
                <span className="pay-logo pay-logo-paddle">Paddle</span>
              </div>
            </div>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:15}} onClick={handleStart}>
              Start free — find my retirement date →
            </button>
            <p className="pricing-fine">
              No credit card required · Cancel anytime · Less than one coffee per week
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="faq-header">
            <span className="section-eyebrow">Before you sign up</span>
            <h2 className="section-title">
              The questions worth asking<br/>
              before trusting anyone with your finances.
            </h2>
            <p className="faq-intro">
              Every question below has a direct, complete answer. If yours isn't here, contact us — we respond within 24 hours.
            </p>
          </div>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <span className="section-eyebrow">Get in touch</span>
          <h2 className="contact-title">Contact us</h2>
          <p className="contact-sub">
            Every message is read and responded to by our team. If something isn't working, or you have a question before signing up — reach out.
          </p>
          <div className="contact-channels">
            <a href="mailto:thimbleforgeapps@gmail.com" className="contact-channel">
              <span className="contact-ch-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <div className="contact-ch-label">Email</div>
                <div className="contact-ch-value">thimbleforgeapps@gmail.com</div>
              </div>
            </a>
            <a href="https://x.com/Fireledger01" target="_blank" rel="noopener noreferrer" className="contact-channel">
              <span className="contact-ch-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </span>
              <div>
                <div className="contact-ch-label">Twitter / X</div>
                <div className="contact-ch-value">@Fireledger01</div>
              </div>
            </a>
            <a href="https://www.instagram.com/fire_ledger/" target="_blank" rel="noopener noreferrer" className="contact-channel">
              <span className="contact-ch-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </span>
              <div>
                <div className="contact-ch-label">Instagram</div>
                <div className="contact-ch-value">@fire_ledger</div>
              </div>
            </a>
          </div>
          <p className="contact-response">Response time: within 24 hours</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p className="footer-tagline">Built for people who want to retire early, not just think about it.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/refund">Refund Policy</a>
          <a href="mailto:thimbleforgeapps@gmail.com">Contact</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} FIRELedger. All rights reserved.</p>
      </footer>
    </div>
  );
}
