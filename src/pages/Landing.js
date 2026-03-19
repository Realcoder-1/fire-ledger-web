import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import ScrollHint from '../components/ScrollHint';
import './Landing.css';

// ── Constants ──────────────────────────────────────────
const POPUP_KEY   = 'fl_hours_popup_seen';
const TIMER_KEY   = 'fl_urgency_expires';
const TRIAL_MINS  = 60;

// Paddle price IDs
const PRICES = {
  trial:    { monthly: 'pri_01kkk53619cxb49atjaykftcn7', annual: 'pri_01kkk544b2fntpj7s989ntee0x' },
  standard: { monthly: 'pri_01kkk53619cxb49atjaykftcn7', annual: 'pri_01kkk544b2fntpj7s989ntee0x' },
};
const DISCOUNT_CODE = 'TRIALWELCOME'; // 50% off during trial

// ── Urgency Timer ──────────────────────────────────────
function UrgencyTimer({ onExpire, onTick }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    let expiry = localStorage.getItem(TIMER_KEY);
    if (!expiry) { expiry = Date.now() + TRIAL_MINS * 60 * 1000; localStorage.setItem(TIMER_KEY, expiry); }
    const tick = () => {
      const left = Math.max(0, parseInt(expiry) - Date.now());
      setTimeLeft(left);
      if (onTick) onTick(left);
      if (left === 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire, onTick]);

  if (timeLeft === null) return null;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const expired = timeLeft === 0;
  const urgent = mins < 5 && !expired;

  return (
    <div className={`urgency-bar ${expired ? 'expired' : ''} ${urgent ? 'urgent' : ''}`}>
      <span className="urgency-dot" />
      {expired
        ? <span>Your launch price has expired — <strong>standard pricing now applies</strong></span>
        : <span>
            50% launch discount expires in{' '}
            <strong className="urgency-countdown">
              {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
            </strong>
            {' '}— <a href="#pricing" className="urgency-link">claim your discount →</a>
          </span>
      }
    </div>
  );
}

// ── Dashboard Nav Preview (animated tab switcher) ─────
const PREVIEW_TABS = [
  { id: 'dashboard',    label: 'Dashboard'      },
  { id: 'fireCalc',     label: 'Freedom Calc'   },
  { id: 'insights',     label: 'Insights'       },
  { id: 'projections',  label: 'Projections'    },
  { id: 'networth',     label: 'Net Worth'      },
];

function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const screens = {
    dashboard: (
      <div className="preview-screen">
        <div className="prev-hero-card">
          <div className="prev-hero-left">
            <div className="prev-label">Financial Independence</div>
            <div className="prev-years">12<span className="prev-years-unit"> years away</span></div>
            <div className="prev-date">Projected freedom: <strong>Mar 2038</strong></div>
            <div className="prev-progress-bar"><div className="prev-progress-fill" style={{width:'40%'}} /></div>
            <div className="prev-progress-label">40% complete · $50k of $1,000k</div>
          </div>
          <div className="prev-ring-wrap">
            <svg viewBox="0 0 100 100" className="prev-ring">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="url(#rg1)" strokeWidth="8"
                strokeDasharray="239" strokeDashoffset="143" strokeLinecap="round" transform="rotate(-90 50 50)"/>
              <defs><linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/>
              </linearGradient></defs>
            </svg>
            <div className="prev-ring-center"><span className="prev-ring-pct">40%</span><span className="prev-ring-sub">to FIRE</span></div>
          </div>
        </div>
        <div className="prev-metrics">
          {[
            {label:'Income', val:'$5.2k', color:'#52c98a'},
            {label:'Spent',  val:'$2.1k', color:'#e05c5c'},
            {label:'Saved',  val:'$1.4k', color:'#5b9cf6'},
            {label:'Grade',  val:'A',     color:'#52c98a'},
          ].map(m=>(
            <div key={m.label} className="prev-metric">
              <div className="prev-metric-label">{m.label}</div>
              <div className="prev-metric-val" style={{color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>
        <div className="prev-tx-list">
          {[
            {desc:'Salary',    amt:'+$5,200', c:'#52c98a'},
            {desc:'Rent',      amt:'-$1,400', c:'#e05c5c'},
            {desc:'Groceries', amt:'-$340',   c:'#e05c5c'},
            {desc:'Index Fund',amt:'+$1,400', c:'#5b9cf6'},
          ].map((t,i)=>(
            <div key={i} className="prev-tx">
              <span className="prev-tx-dot" style={{background:t.c}}/>
              <span className="prev-tx-desc">{t.desc}</span>
              <span className="prev-tx-amt" style={{color:t.c}}>{t.amt}</span>
            </div>
          ))}
        </div>
        <div className="prev-guidance">
          <div className="prev-guidance-icon">↑</div>
          <div className="prev-guidance-text">Your wants spending is <strong style={{color:'#e05c5c'}}>12% above</strong> your FIRE target. Reducing by $200/mo saves <strong style={{color:'#52c98a'}}>2.3 years</strong>.</div>
        </div>
      </div>
    ),
    fireCalc: (
      <div className="preview-screen">
        <div className="prev-fire-layout">
          <div className="prev-fire-inputs">
            <div className="prev-section-label">Your Freedom Numbers</div>
            {[
              {label:'Annual Expenses', val:'$40,000'},
              {label:'Annual Savings',  val:'$20,000'},
              {label:'Current Savings', val:'$50,000'},
            ].map(f=>(
              <div key={f.label} className="prev-field">
                <div className="prev-field-label">{f.label}</div>
                <div className="prev-field-val">{f.val}</div>
              </div>
            ))}
            <div className="prev-divider"/>
            <div className="prev-section-label">What If I Saved More?</div>
            <div className="prev-slider-row">
              <span className="prev-slider-val">+$500/mo</span>
              <div className="prev-slider-track"><div className="prev-slider-thumb" style={{left:'25%'}}/></div>
            </div>
            <div className="prev-whatif-result">Saves <strong style={{color:'#52c98a'}}>3.2 years</strong> — retire in <strong style={{color:'#a78bfa'}}>8.8 years</strong></div>
          </div>
          <div className="prev-fire-results">
            <div className="prev-stat-grid">
              {[
                {label:'Freedom Number',val:'$1,000,000',color:'#fbbf24'},
                {label:'Years Away',    val:'12 yrs',    color:'#e05c5c'},
                {label:'Freedom Date',  val:'Mar 2038',  color:'#a78bfa'},
                {label:'Gap Left',      val:'$950k',     color:'#5b9cf6'},
              ].map(s=>(
                <div key={s.label} className="prev-stat">
                  <div className="prev-stat-label">{s.label}</div>
                  <div className="prev-stat-val" style={{color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    insights: (
      <div className="preview-screen">
        <div className="prev-section-label" style={{marginBottom:10}}>March 2026 · Needs vs Wants vs Savings</div>
        {[
          {label:'Income', val:5200, color:'#52c98a', pct:100},
          {label:'Needs',  val:1580, color:'#e05c5c', pct:30},
          {label:'Wants',  val:520,  color:'#e0825c', pct:10},
          {label:'Savings',val:1400, color:'#5b9cf6', pct:27},
        ].map(b=>(
          <div key={b.label} className="prev-bar-row">
            <span className="prev-bar-label">{b.label}</span>
            <div className="prev-bar-track">
              <div className="prev-bar-fill" style={{width:`${b.pct}%`, background:b.color}}/>
            </div>
            <span className="prev-bar-val" style={{color:b.color}}>${b.val.toLocaleString()}</span>
          </div>
        ))}
        <div className="prev-grade-row">
          <div className="prev-grade-label">Savings Grade</div>
          <div className="prev-grade" style={{color:'#52c98a'}}>A</div>
          <div className="prev-grade-sub">27% savings rate</div>
        </div>
        <div className="prev-guidance" style={{marginTop:8}}>
          <div className="prev-guidance-icon">↑</div>
          <div className="prev-guidance-text">Dining out accounts for 38% of your Wants budget. Cutting in half adds <strong style={{color:'#52c98a'}}>$98/mo</strong> to savings.</div>
        </div>
      </div>
    ),
    projections: (
      <div className="preview-screen">
        <div className="prev-section-label" style={{marginBottom:12}}>Wealth Trajectory · 35 years · 500 Monte Carlo scenarios</div>
        <svg viewBox="0 0 400 140" className="prev-proj-chart">
          <defs>
            <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <line x1="40" y1="40" x2="390" y2="40" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
          <text x="393" y="44" fontSize="7" fill="#fbbf24" opacity="0.7">FIRE</text>
          <path d="M40,120 L90,110 L140,95 L190,78 L230,60 L270,42 L310,25 L360,12 L390,8 L390,130 L40,130 Z" fill="url(#pg2)"/>
          <path d="M40,120 L90,110 L140,95 L190,78 L230,60 L270,42 L310,25 L360,12 L390,8" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="270" cy="42" r="4" fill="#52c98a" opacity="0.9"/>
          <line x1="270" y1="10" x2="270" y2="130" stroke="#52c98a" strokeWidth="1" strokeDasharray="3 4" opacity="0.3"/>
          <text x="270" y="8" textAnchor="middle" fontSize="7" fill="#52c98a">Free</text>
          {[0,5,10,15,20,25,30,35].map((y,i)=>(
            <text key={y} x={40+i*50} y="138" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.25)">Yr{y}</text>
          ))}
        </svg>
        <div className="prev-mc-result">
          <div className="prev-mc-pct" style={{color:'#52c98a'}}>78%</div>
          <div className="prev-mc-label">success rate across 500 market simulations</div>
        </div>
      </div>
    ),
    networth: (
      <div className="preview-screen">
        <div className="prev-section-label" style={{marginBottom:10}}>Net Worth Tracker</div>
        <div className="prev-nw-grid">
          <div className="prev-nw-card" style={{borderColor:'rgba(82,201,138,0.3)'}}>
            <div className="prev-nw-label">Total Assets</div>
            <div className="prev-nw-val" style={{color:'#52c98a'}}>$85,400</div>
            <div className="prev-nw-breakdown">
              {[{l:'Investments',v:'$50,000'},{l:'Cash',v:'$12,400'},{l:'Property',v:'$23,000'}].map(r=>(
                <div key={r.l} className="prev-nw-row"><span>{r.l}</span><span style={{color:'#52c98a'}}>{r.v}</span></div>
              ))}
            </div>
          </div>
          <div className="prev-nw-card" style={{borderColor:'rgba(224,92,92,0.3)'}}>
            <div className="prev-nw-label">Total Liabilities</div>
            <div className="prev-nw-val" style={{color:'#e05c5c'}}>$22,000</div>
            <div className="prev-nw-breakdown">
              {[{l:'Student Loan',v:'$15,000'},{l:'Credit Card',v:'$2,000'},{l:'Car Loan',v:'$5,000'}].map(r=>(
                <div key={r.l} className="prev-nw-row"><span>{r.l}</span><span style={{color:'#e05c5c'}}>{r.v}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="prev-nw-total">
          <span>Net Worth</span>
          <span className="prev-nw-total-val">$63,400</span>
        </div>
        <div className="prev-nw-bar-wrap">
          <div className="prev-nw-bar-fill" style={{width:'26%', background:'rgba(167,139,250,0.4)'}}/>
          <div className="prev-nw-bar-text">26% of your $240,000 FIRE number</div>
        </div>
      </div>
    ),
  };

  return (
    <div className="dashboard-preview">
      <div className="preview-nav">
        {PREVIEW_TABS.map(t=>(
          <button
            key={t.id}
            className={`prev-nav-tab ${activeTab===t.id?'active':''}`}
            onClick={()=>setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="preview-body">
        {screens[activeTab]}
      </div>
      <div className="preview-footer">
        <span className="preview-footer-badge">Live preview · All data is yours</span>
      </div>
    </div>
  );
}

// ── Scroll hint (auto-hides on scroll) ────────────────
function SmartScrollHint({ text }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const fn = () => { if (window.scrollY > 60) setShow(false); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  if (!show) return null;
  return <ScrollHint text={text} />;
}

// ── Main Landing ───────────────────────────────────────
export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [showPopup,    setShowPopup]    = useState(false);
  const [navScrolled,  setNavScrolled]  = useState(false);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(POPUP_KEY)) {
      const t = setTimeout(() => setShowPopup(true), 3500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handlePopupClose = () => {
    localStorage.setItem(POPUP_KEY, '1');
    setShowPopup(false);
    // Sign-in is handled inside the popup itself — just close here
  };

  const handleStart = () => {
  if (!user) {
    signInWithGoogle();
    return;
  }

  openCheckout(); // 🔥 THIS is the connection
};
const openCheckout = () => {
  if (!window.Paddle || !window.Paddle.Checkout) {
    console.error('Paddle not loaded properly');
    return;
  }

  const expiryRaw = localStorage.getItem(TIMER_KEY);
  const expiry = expiryRaw ? parseInt(expiryRaw, 10) : null;

  const isValid = expiry && Date.now() < expiry;

  console.log('Checkout debug:', {
    expiry,
    now: Date.now(),
    isValid,
    discount: isValid ? DISCOUNT_CODE : null
  });

  const checkoutConfig = {
    items: [{ priceId: PRICES.trial.monthly }]
  };

  // Apply discount ONLY if timer valid
  if (isValid) {
    checkoutConfig.discount_code = DISCOUNT_CODE;

    // Fallback (some Paddle setups prefer ID)
    checkoutConfig.discountId = 'dsc_01km3qwg22qqd90612kd8peq6m';
  }

  window.Paddle.Checkout.open(checkoutConfig);
};
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  const FAQS = [
    {
      q: 'What problem does FIRE Ledger actually solve?',
      a: 'Most people spend their entire careers with no clear answer to one question: when can I stop working? Generic calculators give vague estimates. Spreadsheets take hours to set up. FIRE Ledger gives you a precise date based on your actual numbers — and updates it in real time as you track your income, spending, and savings each week.'
    },
    {
      q: 'Is the 7-day trial really free? No credit card?',
      a: 'Correct — no credit card required. Sign in with Google, you have full access to every feature for 7 days. After that, it\'s $4.99/month or $59.99/year. If you subscribe during the trial window, you\'ll pay $2.49/month or $29.99/year — 50% off, locked in permanently while you stay subscribed.'
    },
    {
      q: 'How is my freedom date calculated?',
      a: 'Using the 4% rule — the most widely cited standard in retirement research. Your FIRE number is your annual expenses × 25. We model portfolio growth at 7% annual return (a conservative real return for a diversified index fund portfolio). The Monte Carlo simulation stress-tests this across 500 different market scenarios.'
    },
    {
      q: 'Is this financial advice?',
      a: 'FIRE Ledger is a financial guidance and planning tool. It helps you understand your numbers, track your progress, and model different scenarios — so you can see clearly what your current trajectory leads to, and what changes would move your freedom date closer. It is not personalised financial advice. For that, consult a qualified financial adviser. All projections are illustrative estimates based on established models.'
    },
    {
      q: 'Is my financial data safe?',
      a: 'Your data is stored on Supabase (AWS infrastructure), encrypted in transit and at rest using industry-standard TLS and AES-256. We do not sell, share, or monetise your data in any way. You can export your complete transaction history at any time, and delete your account on request. The app itself is served over HTTPS with no third-party tracking scripts.'
    },
    {
      q: 'How does payment work? Who processes it?',
      a: 'Payments are handled entirely by Paddle — a regulated merchant of record operating in 200+ countries. Paddle processes your payment, handles tax compliance, and is responsible for your billing relationship. We never see or store your card details. Accepted: Visa, Mastercard, American Express, PayPal. Billing is managed at checkout.paddle.com.'
    },
    {
      q: 'What if I already have bank data I want to import?',
      a: 'Go to Export & Import → Smart Import. Download a CSV from your bank\'s website and upload it. The importer auto-detects column names, date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD), and debit/credit split columns. Once imported, your Net Worth section is automatically updated with your asset and liability data.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Cancel directly from your Paddle billing portal — no email required, no hoops to jump through. If you cancel within 48 hours of subscribing and haven\'t used the data export feature, you\'re eligible for a full refund. After 48 hours or after using export, refunds are not available.'
    },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose} />}
      <UrgencyTimer onExpire={() => setTimerExpired(true)} />

      {/* NAV */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('preview')}>Preview</button>
          <button className="nav-link" onClick={() => scrollTo('story')}>Our Story</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
        </div>
        <button className="nav-cta" onClick={handleStart}>
          {timerExpired ? 'Get Started →' : 'Start Free →'}
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">7-Day Free Trial · No Credit Card Required</div>
          <h1 className="hero-title">
            You will work until<br />
            <span className="hero-accent">you die.</span>
          </h1>
          <p className="hero-sub">
            Unless you know this number.<br />
            Most people never calculate it. The ones who do retire a decade early.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              Find my freedom date — free →
            </button>
            <button className="btn-ghost" onClick={() => scrollTo('preview')}>
              See the dashboard
            </button>
          </div>
          <div className="hero-trust">
            <span>✓ 7 days free</span>
            <span>·</span>
            <span>✓ No credit card</span>
            <span>·</span>
            <span>✓ Cancel anytime</span>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">90,000</span><span className="stat-label">Avg lifetime work hours</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">25×</span><span className="stat-label">Your FIRE number</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">4%</span><span className="stat-label">Safe withdrawal rate</span></div>
          </div>
          <SmartScrollHint text="Scroll to see the dashboard" />
        </div>
        <div className="hero-mockup">
          <div className="mockup-card">
            <div className="mockup-header">
              <span className="mockup-label">FIRE Progress</span>
              <span className="mockup-years">12.4 yrs away</span>
            </div>
            <div className="mockup-ring-wrap">
              <svg viewBox="0 0 120 120" className="mockup-ring">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#fireGrad)" strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset="188" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                <defs><linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/>
                </linearGradient></defs>
              </svg>
              <div className="mockup-ring-text">
                <span className="mockup-pct">40%</span>
                <span className="mockup-pct-label">to FIRE</span>
              </div>
            </div>
            <div className="mockup-transactions">
              {[
                {label:'Salary',    amt:'+$5,200', type:'income'},
                {label:'Rent',      amt:'-$1,400', type:'need'  },
                {label:'Groceries', amt:'-$180',   type:'need'  },
                {label:'Index Fund',amt:'+$1,400', type:'saving'},
              ].map((t,i) => (
                <div key={i} className="mockup-tx">
                  <span className="mockup-tx-label">{t.label}</span>
                  <span className={`mockup-tx-amt ${t.type}`}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="preview-section" id="preview">
        <div className="preview-section-inner">
          <span className="section-eyebrow">Live product preview</span>
          <h2 className="section-title">This is what clarity looks like.</h2>
          <p className="section-sub">Every number you need. No noise. Updated in real time as you log.</p>
          <DashboardPreview />
          <SmartScrollHint text="Continue reading" />
        </div>
      </section>

      {/* BEFORE / AFTER — the mental clarity frame */}
      <section className="before-after-section">
        <div className="before-after-inner">
          <span className="section-eyebrow">The difference it makes</span>
          <h2 className="section-title">Before FIRE Ledger.<br/>After FIRE Ledger.</h2>
          <div className="ba-grid">
            <div className="ba-card ba-before">
              <div className="ba-card-label">Before</div>
              <div className="ba-mockup-janky">
                <div className="janky-header">retirement_calc_v3_FINAL.xlsx</div>
                <div className="janky-rows">
                  {[
                    'Current age: 28',
                    'Retire at: 65 (maybe?)',
                    'Savings: somewhere around 50k',
                    'Monthly budget: idk, roughly',
                    'Freedom date: ???',
                    '=IF(B12>C12,"maybe","probably not")',
                  ].map((r,i)=><div key={i} className="janky-row">{r}</div>)}
                </div>
              </div>
              <ul className="ba-list">
                <li>Vague retirement age based on assumptions</li>
                <li>No real-time updates when spending changes</li>
                <li>No way to see what each expense costs in years</li>
                <li>Manual spreadsheet that breaks constantly</li>
              </ul>
            </div>
            <div className="ba-card ba-after">
              <div className="ba-card-label" style={{background:'rgba(82,201,138,0.15)',color:'#52c98a',borderColor:'rgba(82,201,138,0.3)'}}>After</div>
              <div className="ba-mockup-clean">
                <div className="ba-clean-header">
                  <span>Financial Independence</span>
                  <span style={{color:'#a78bfa'}}>Mar 2038</span>
                </div>
                <div className="ba-clean-years">12<span style={{fontSize:14,color:'rgba(240,240,248,0.5)'}}> years away</span></div>
                <div className="ba-clean-progress"><div style={{width:'40%', height:'100%', background:'linear-gradient(90deg,#a78bfa,#f472b6)', borderRadius:4}}/></div>
                <div className="ba-clean-metrics">
                  {[{l:'Income',v:'$5,200',c:'#52c98a'},{l:'Spent',v:'$2,100',c:'#e05c5c'},{l:'Saved',v:'$1,400',c:'#5b9cf6'}].map(m=>(
                    <div key={m.l} className="ba-clean-metric"><span>{m.l}</span><span style={{color:m.c,fontWeight:700}}>{m.v}</span></div>
                  ))}
                </div>
                <div className="ba-clean-guidance">Dining out is costing you 8 months of freedom this year.</div>
              </div>
              <ul className="ba-list">
                <li>Exact freedom date, updated every time you log</li>
                <li>See what each expense costs in years of your life</li>
                <li>Guidance tells you exactly what to change</li>
                <li>Monte Carlo stress-tests your plan in real markets</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="story-section" id="story">
        <div className="story-inner">
          <span className="section-eyebrow">Why this exists</span>
          <h2 className="section-title">
            I built this because<br />
            <em>I couldn't find the answer myself.</em>
          </h2>
          <div className="story-body">
            <p>A few years ago, I sat down and tried to answer a simple question: <strong>when can I actually stop working?</strong></p>
            <p>Not when the government says I can retire. Not a vague number from a generic calculator assuming I'd spend my whole career at one salary. The real question — based on what I actually earn, what I actually spend, and what I've actually saved.</p>
            <p>Every tool I found either required a finance degree to understand, gave me a number with no context, or was so generic it was useless. None of them tracked whether I was on pace. None told me what my discretionary spending was costing me in years of my life. None gave me the same clarity that a proper system would.</p>
            <p>So I built FIRE Ledger. For myself. A system where I enter the numbers and get a date. Then track weekly whether I'm getting closer or further away. When I showed it to people in the finance space, they said others were going through the same thing.</p>
          </div>
          <div className="story-quote">
            <div className="story-quote-mark">"</div>
            <p className="story-quote-text">
              The question isn't whether you can retire early. It's whether you've ever actually run the numbers. Most people haven't — not because they don't want to, but because no one gave them a tool simple enough to answer it in five minutes.
            </p>
            <div className="story-quote-author">
              <div className="story-quote-avatar">F</div>
              <div>
                <div className="story-quote-name">Founder, FIRE Ledger</div>
                <div className="story-quote-role">Built it to answer the question for myself</div>
              </div>
            </div>
          </div>
          <div className="validation-card">
            <div className="validation-icon">✓</div>
            <div>
              <div className="validation-title">Validated by people in the space</div>
              <p className="validation-body">"This addresses a real gap. The FIRE community has the philosophy — they've never had a tracking tool this focused on the actual number. The utility is clear."</p>
              <div className="validation-source">— Finance community feedback, March 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — 6 clean, no emojis */}
      <section className="features" id="features">
        <div className="features-inner">
          <span className="section-eyebrow">What's inside</span>
          <h2 className="section-title">Six tools.<br/>One freedom date.</h2>
          <div className="features-grid">
            {[
              { num:'01', title:'Freedom Date Calculator',   desc:'Your exact financial independence date — updated in real time as income, spending, and savings change. Four modes: Standard, Lean, Fat, and Coast FIRE.' },
              { num:'02', title:'Needs vs Wants Tracker',    desc:'Categorise every transaction. See which spending is building wealth and which is costing you years — broken down month by month with a savings grade.' },
              { num:'03', title:'Monte Carlo Simulation',    desc:'500 market scenarios stress-tested against your plan. Know the probability your portfolio holds under real-world conditions before it matters.' },
              { num:'04', title:'Net Worth Tracker',         desc:'Assets minus liabilities, auto-updated when you import bank data. Tracks your real financial position and how far you are from your FIRE number.' },
              { num:'05', title:'Financial Guidance System', desc:'After every transaction batch, the app analyses patterns and tells you what is costing you years — in plain language, with specific numbers.' },
              { num:'06', title:'Smart Bank Import',         desc:'Upload any bank statement CSV. Auto-detects column formats, date styles, debit/credit splits. No reformatting. Net worth updates automatically.' },
            ].map((f,i) => (
              <div key={i} className="feature-card">
                <div className="feature-num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <span className="section-eyebrow">Pricing</span>
          <h2 className="section-title">One plan.<br/>Everything included.</h2>
          {!timerExpired && (
            <div className="pricing-urgency-note">
              Launch pricing active — 50% off while the timer above is running
            </div>
          )}
          <div className="single-pricing">
            <div className="pricing-card featured">
              {!timerExpired && <div className="pricing-badge">50% off · Trial period only</div>}
              <div className="pricing-tier">FIRE Ledger Pro</div>

              <div className="pricing-options">
                <div className="price-option">
                  {!timerExpired && <span className="price-was">$9.99</span>}
                  <span className="price-amount">$4.99</span>
                  <span className="price-period">/ month</span>
                </div>
                <div className="price-divider">or</div>
                <div className="price-option">
                  {!timerExpired && <span className="price-was">$119.99</span>}
                  <span className="price-amount">$59.99</span>
                  <span className="price-period">/ year</span>
                  <span className="price-save">Best value</span>
                </div>
              </div>

              {timerExpired && (
                <div className="price-standard-note">Standard pricing — trial window has closed</div>
              )}

              <ul className="pricing-features">
                <li>✓ Your exact freedom date — updated in real time</li>
                <li>✓ FIRE, Lean, Fat &amp; Coast FIRE calculators</li>
                <li>✓ Monte Carlo simulation — 500 scenarios</li>
                <li>✓ Net Worth tracker with auto-import sync</li>
                <li>✓ Financial guidance after every transaction</li>
                <li>✓ Smart bank statement import (any CSV format)</li>
                <li>✓ Full data export — no lock-in ever</li>
                <li>✓ 48-hour money back guarantee</li>
              </ul>

              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleStart}>
                {timerExpired ? 'Get started →' : 'Start free — 7 days, no card →'}
              </button>

              <p className="pricing-subline">
                Less than the price of a coffee per week · Cancel anytime
              </p>

              <div className="payment-trust">
                <span className="payment-trust-label">Secure payments via Paddle</span>
                <div className="payment-logos">
                  <span className="pay-logo">VISA</span>
                  <span className="pay-logo">MC</span>
                  <span className="pay-logo">AMEX</span>
                  <span className="pay-logo">PayPal</span>
                  <span className="pay-logo pay-logo-paddle">Paddle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <span className="section-eyebrow">Common questions</span>
          <h2 className="section-title">Before you sign up</h2>
          <div className="faq-list">
            {FAQS.map((item,i) => (
              <div key={i} className="faq-item">
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

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <h2 className="final-cta-title">The question is simple.<br/>When can you stop working?</h2>
        <p className="final-cta-sub">Most people go their whole careers without ever calculating it. You now have a tool that answers it in five minutes — and keeps the answer updated every week.</p>
        <button className="btn-primary" style={{fontSize:17,padding:'16px 40px'}} onClick={handleStart}>
          Find my number — free for 7 days →
        </button>
        <p style={{fontSize:12,color:'#8888aa',marginTop:12}}>No credit card · No commitment · Just the truth about your timeline</p>
      </section>

      {/* FOOTER + CONTACT */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">FIRE<span>Ledger</span></div>
            <p>Built for people who want to retire early, not just dream about it.</p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Legal</div>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund">Refund Policy</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Contact</div>
            <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a>
            <a href="https://instagram.com/fireledger.app" target="_blank" rel="noreferrer">Instagram → @fireledger.app</a>
            <a href="https://twitter.com/fireledgerapp" target="_blank" rel="noreferrer">Twitter → @fireledgerapp</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Payment</div>
            <p style={{fontSize:12,color:'#55557a',lineHeight:1.7}}>All billing is handled by <strong style={{color:'#8888aa'}}>Paddle</strong> — a regulated merchant of record. We never store your card details.</p>
            <div className="footer-pay-logos">
              <span className="pay-logo">VISA</span>
              <span className="pay-logo">MC</span>
              <span className="pay-logo">AMEX</span>
              <span className="pay-logo pay-logo-paddle">Paddle</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FIRE Ledger · All rights reserved</span>
          <span className="footer-bottom-note">This tool is for financial planning and guidance only — not financial advice. Always consult a qualified adviser before making investment decisions.</span>
        </div>
      </footer>
    </div>
  );
}
