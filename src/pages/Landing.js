import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import ScrollHint from '../components/ScrollHint';
import './Landing.css';

// ── Animated cycling caption (AnyInterview-style) ──────
const HERO_CAPTIONS = [
  { line1: 'You will work',          accent: 'until you die.'          },
  { line1: 'Is this',                accent: 'what you want?'          },
  { line1: 'Break',                  accent: 'the cycle.'              },
  { line1: 'Find out when you can',  accent: 'stop working.'           },
  { line1: 'Your freedom date',      accent: 'is calculable.'          },
];

function AnimatedHeroTitle() {
  const [idx, setIdx]       = useState(0);
  const [phase, setPhase]   = useState('visible'); // visible | fadeout | fadein
  const timerRef            = useRef(null);

  useEffect(() => {
    // Stay visible 3.5s, then fade out 400ms, swap, fade in 400ms
    timerRef.current = setTimeout(() => {
      setPhase('fadeout');
      setTimeout(() => {
        setIdx(i => (i + 1) % HERO_CAPTIONS.length);
        setPhase('fadein');
        setTimeout(() => setPhase('visible'), 400);
      }, 400);
    }, 2000);
    return () => clearTimeout(timerRef.current);
  }, [idx]);

  const c = HERO_CAPTIONS[idx];
  return (
    <h1 className={`hero-title hero-title-anim hero-title-${phase}`}>
      {c.line1}<br />
      <span className="hero-accent">{c.accent}</span>
    </h1>
  );
}

// ── Constants ──────────────────────────────────────────
const POPUP_KEY = 'fl_hours_popup_seen';

// Paddle price IDs


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
        {/* Hours left — the pain stat */}
        <div className="prev-hours-banner">
          <span className="prev-hours-icon">⏱</span>
          <div className="prev-hours-body">
            <span className="prev-hours-num">62,400</span>
            <span className="prev-hours-label">working hours left before retirement age</span>
          </div>
          <span className="prev-hours-badge">30 yrs away</span>
        </div>
        {/* FIRE progress hero */}
        <div className="prev-hero-card">
          <div className="prev-hero-left">
            <div className="prev-label">Financial Independence</div>
            <div className="prev-years" style={{color:'#f87171'}}>30<span className="prev-years-unit"> years away</span></div>
            <div className="prev-date">Projected freedom: <strong style={{color:'#f87171'}}>Mar 2056</strong></div>
            <div className="prev-progress-bar"><div className="prev-progress-fill" style={{width:'12%', background:'linear-gradient(90deg,#f87171,#e05c5c)'}} /></div>
            <div className="prev-progress-label" style={{color:'#f87171'}}>12% complete · $14k of $1,000k</div>
          </div>
          <div className="prev-ring-wrap">
            <svg viewBox="0 0 100 100" className="prev-ring">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="url(#rg-pain)" strokeWidth="8"
                strokeDasharray="239" strokeDashoffset="210" strokeLinecap="round" transform="rotate(-90 50 50)"/>
              <defs><linearGradient id="rg-pain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#e05c5c"/>
              </linearGradient></defs>
            </svg>
            <div className="prev-ring-center"><span className="prev-ring-pct" style={{color:'#f87171'}}>12%</span><span className="prev-ring-sub">to FIRE</span></div>
          </div>
        </div>
        {/* Metrics */}
        <div className="prev-metrics">
          {[
            {label:'Savings Rate', val:'8%',      color:'#f87171'},
            {label:'FIRE Gap',     val:'$986k',   color:'#f87171'},
            {label:'Saved',        val:'$14,200', color:'#fbbf24'},
            {label:'Grade',        val:'D',       color:'#f87171'},
          ].map(m=>(
            <div key={m.label} className="prev-metric">
              <div className="prev-metric-label">{m.label}</div>
              <div className="prev-metric-val" style={{color:m.color}}>{m.val}</div>
            </div>
          ))}
        </div>
        {/* Transactions */}
        <div className="prev-tx-list">
          {[
            {desc:'Salary',         amt:'+$4,800', c:'#52c98a'},
            {desc:'Rent',           amt:'-$1,800', c:'#e05c5c'},
            {desc:'Dining Out',     amt:'-$620',   c:'#e05c5c'},
            {desc:'Subscriptions',  amt:'-$184',   c:'#e05c5c'},
          ].map((t,i)=>(
            <div key={i} className="prev-tx">
              <span className="prev-tx-dot" style={{background:t.c}}/>
              <span className="prev-tx-desc">{t.desc}</span>
              <span className="prev-tx-amt" style={{color:t.c}}>{t.amt}</span>
            </div>
          ))}
        </div>
        {/* Guidance — pain */}
        <div className="prev-guidance" style={{borderColor:'rgba(248,113,113,0.3)', background:'rgba(248,113,113,0.06)'}}>
          <div className="prev-guidance-icon" style={{background:'rgba(248,113,113,0.2)',color:'#f87171'}}>!</div>
          <div className="prev-guidance-text">Your dining out spending alone is costing you <strong style={{color:'#f87171'}}>4.2 years</strong> of your life. At this savings rate you retire at <strong style={{color:'#f87171'}}>age 65.</strong></div>
        </div>
      </div>
    ),
    fireCalc: (
      <div className="preview-screen">
        <div className="prev-fire-layout">
          <div className="prev-fire-inputs">
            <div className="prev-section-label">Your Freedom Numbers</div>
            {[
              {label:'Annual Expenses', val:'$48,000'},
              {label:'Annual Savings',  val:'$4,800'},
              {label:'Current Savings', val:'$14,200'},
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
            <div className="prev-whatif-result">Saves <strong style={{color:'#52c98a'}}>8.1 years</strong> — retire in <strong style={{color:'#a78bfa'}}>21.9 years</strong></div>
          </div>
          <div className="prev-fire-results">
            <div className="prev-stat-grid">
              {[
                {label:'Freedom Number', val:'$1,200,000', color:'#fbbf24'},
                {label:'Years Away',     val:'30 yrs',     color:'#f87171'},
                {label:'Freedom Date',   val:'Mar 2056',   color:'#f87171'},
                {label:'Hours Left',     val:'62,400',     color:'#f87171'},
              ].map(s=>(
                <div key={s.label} className="prev-stat">
                  <div className="prev-stat-label">{s.label}</div>
                  <div className="prev-stat-val" style={{color:s.color, fontSize: s.label==='Freedom Number'?12:15}}>{s.val}</div>
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
          {label:'Income',  val:4800, color:'#52c98a', pct:100},
          {label:'Needs',   val:2600, color:'#e05c5c', pct:54},
          {label:'Wants',   val:1400, color:'#e0825c', pct:29},
          {label:'Savings', val:400,  color:'#f87171', pct:8},
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
          <div className="prev-grade" style={{color:'#f87171'}}>D</div>
          <div className="prev-grade-sub">8% savings rate · 30 yrs to FIRE</div>
        </div>
        <div className="prev-guidance" style={{marginTop:8,borderColor:'rgba(248,113,113,0.3)',background:'rgba(248,113,113,0.06)'}}>
          <div className="prev-guidance-icon" style={{background:'rgba(248,113,113,0.2)',color:'#f87171'}}>!</div>
          <div className="prev-guidance-text">Wants spending is <strong style={{color:'#f87171'}}>29% of income</strong>. Cutting to 20% moves your freedom date to <strong style={{color:'#52c98a'}}>2048</strong>.</div>
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
          <line x1="40" y1="25" x2="390" y2="25" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
          <text x="393" y="29" fontSize="7" fill="#fbbf24" opacity="0.7">FIRE</text>
          <path d="M40,128 L90,122 L140,114 L190,104 L230,90 L270,72 L310,50 L360,30 L390,22 L390,130 L40,130 Z" fill="url(#pg2)"/>
          <path d="M40,128 L90,122 L140,114 L190,104 L230,90 L270,72 L310,50 L360,30 L390,22" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="360" cy="30" r="4" fill="#52c98a" opacity="0.9"/>
          <line x1="360" y1="10" x2="360" y2="130" stroke="#52c98a" strokeWidth="1" strokeDasharray="3 4" opacity="0.3"/>
          <text x="360" y="8" textAnchor="middle" fontSize="7" fill="#52c98a">Free</text>
          {[0,5,10,15,20,25,30,35].map((y,i)=>(
            <text key={y} x={40+i*50} y="138" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.25)">Yr{y}</text>
          ))}
        </svg>
        <div className="prev-mc-result">
          <div className="prev-mc-pct" style={{color:'#fbbf24'}}>54%</div>
          <div className="prev-mc-label">success rate — <strong style={{color:'#f87171'}}>46% of scenarios you run out of money</strong></div>
        </div>
      </div>
    ),
    networth: (
      <div className="preview-screen">
        <div className="prev-section-label" style={{marginBottom:10}}>Net Worth Tracker</div>
        <div className="prev-nw-grid">
          <div className="prev-nw-card" style={{borderColor:'rgba(82,201,138,0.3)'}}>
            <div className="prev-nw-label">Total Assets</div>
            <div className="prev-nw-val" style={{color:'#52c98a'}}>$29,200</div>
            <div className="prev-nw-breakdown">
              {[{l:'Savings',v:'$14,200'},{l:'401k',v:'$8,000'},{l:'Car',v:'$7,000'}].map(r=>(
                <div key={r.l} className="prev-nw-row"><span>{r.l}</span><span style={{color:'#52c98a'}}>{r.v}</span></div>
              ))}
            </div>
          </div>
          <div className="prev-nw-card" style={{borderColor:'rgba(224,92,92,0.3)'}}>
            <div className="prev-nw-label">Total Liabilities</div>
            <div className="prev-nw-val" style={{color:'#e05c5c'}}>$47,000</div>
            <div className="prev-nw-breakdown">
              {[{l:'Student Loan',v:'$28,000'},{l:'Credit Card',v:'$4,000'},{l:'Car Loan',v:'$15,000'}].map(r=>(
                <div key={r.l} className="prev-nw-row"><span>{r.l}</span><span style={{color:'#e05c5c'}}>{r.v}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="prev-nw-total">
          <span>Net Worth</span>
          <span className="prev-nw-total-val" style={{color:'#f87171'}}>-$17,800</span>
        </div>
        <div className="prev-nw-bar-wrap">
          <div className="prev-nw-bar-fill" style={{width:'2%', background:'rgba(248,113,113,0.5)'}}/>
          <div className="prev-nw-bar-text" style={{color:'#f87171'}}>Negative net worth · $1,217,800 from FIRE</div>
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup,   setShowPopup]   = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [openFaq,     setOpenFaq]     = useState(null);

  useEffect(() => {
    if (!localStorage.getItem(POPUP_KEY)) {
      const t = setTimeout(() => setShowPopup(true), 800);
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
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };



  const FAQS = [
    {
      q: 'What problem does FIRE Ledger actually solve?',
      a: 'Most people spend their entire careers with no clear answer to one question: when can I stop working? Generic calculators give vague estimates. Spreadsheets take hours to set up. FIRE Ledger gives you a precise date based on your actual numbers — and updates it in real time as you track your income, spending, and savings each week.'
    },
    {
      q: 'What are the different plans?',
      a: 'Three plans. Lifetime ($5 once) — full access to every feature, but no data is stored between sessions. Each time you open the tool, you start fresh. Perfect for running the numbers and knowing your FIRE date. Monthly ($4.99/mo) and Annual ($59.99/yr) — your transactions, settings, and history are saved to the cloud and sync across devices.'
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

      {/* NAV */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Home</button>
          <button className="nav-link" onClick={() => scrollTo('preview')}>Preview</button>
          <button className="nav-link" onClick={() => scrollTo('story')}>Our Story</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Freedom Price</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button>
        </div>
        <button className="nav-cta" onClick={() => scrollTo('pricing')}>
          See Plans →
        </button>
        {!user && (
          <button className="nav-signin" onClick={() => navigate('/signin')}>
            Sign in
          </button>
        )}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">The question nobody asks — until it's too late.</div>
          <AnimatedHeroTitle />
          <p className="hero-sub">
            Unless you know this number.<br />
            Most people never calculate it. The ones who do retire a decade early.
          </p>
          <div className="hero-actions">
            <button
  className="btn-primary"
  onClick={() => {
    console.log('clicked');
    navigate('/signup');
  }}
>
              Find my freedom date →
            </button>
            <button className="btn-ghost" onClick={() => scrollTo('preview')}>
              See the dashboard
            </button>
          </div>
          <div className="hero-trust">
            <span>✓ From $5 once</span>
            <span>·</span>
            <span>✓ No subscription needed</span>
            <span>·</span>
            <span>✓ Cancel monthly anytime</span>
          </div>
          <div className="hero-stat-strip">
  <div className="hero-stat-item">
    <span className="hero-stat-num">$5</span>
    <span className="hero-stat-label">see when you never have to work again</span>
  </div>
  <div className="hero-stat-div" />
  <div className="hero-stat-item">
    <span className="hero-stat-num">90,000</span>
    <span className="hero-stat-label">avg lifetime work hours — how many are yours?</span>
  </div>
  <div className="hero-stat-div" />
  <div className="hero-stat-item">
    <span className="hero-stat-num">25×</span>
    <span className="hero-stat-label">your annual expenses = your FIRE number</span>
  </div>
</div>
          <SmartScrollHint text="Scroll to see the dashboard" />
        </div>
        <div className="hero-mockup">
          <div className="mockup-card mockup-card-pain">
            {/* Pain header */}
            <div className="mockup-pain-header">
              <span className="mockup-pain-label">YOUR REALITY RIGHT NOW</span>
              <span className="mockup-pain-alert">⚠ Off track</span>
            </div>
            {/* Hours left — the visceral stat */}
            <div className="mockup-hours-wrap">
              <span className="mockup-hours-num">62,400</span>
              <span className="mockup-hours-label">working hours left in your life</span>
            </div>
            {/* Ring — showing bad progress */}
            <div className="mockup-ring-wrap">
              <svg viewBox="0 0 120 120" className="mockup-ring">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#painGrad)" strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset="276" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                <defs><linearGradient id="painGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#e05c5c"/>
                </linearGradient></defs>
              </svg>
              <div className="mockup-ring-text">
                <span className="mockup-pct" style={{color:'#f87171'}}>12%</span>
                <span className="mockup-pct-label">to FIRE</span>
              </div>
            </div>
            {/* Pain stats */}
            <div className="mockup-pain-stats">
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{color:'#f87171'}}>30 yrs</span>
                <span className="mockup-pain-stat-label">until you're free</span>
              </div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{color:'#f87171'}}>D</span>
                <span className="mockup-pain-stat-label">savings grade</span>
              </div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{color:'#fbbf24'}}>$986k</span>
                <span className="mockup-pain-stat-label">FIRE gap</span>
              </div>
            </div>
            {/* Pain guidance */}
            <div className="mockup-pain-tip">
              <span style={{color:'#f87171', fontWeight:700}}>!</span>
              &nbsp;Dining out alone costs you <strong style={{color:'#f87171'}}>4.2 years</strong> of your life. At this rate you retire at <strong style={{color:'#f87171'}}>age 65.</strong>
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
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/></svg>,
                num:'01', title:'Freedom Date Calculator',   desc:'Your exact independence date — updated in real time. Standard, Lean, Fat, and Coast FIRE modes. The one number that changes how you see every purchase.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h10M3 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M17 13l-2.5 2.5L17 18M14.5 15.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'02', title:'Needs vs Wants Tracker',    desc:'Categorise every transaction. See which spending builds wealth and which costs you years — broken down monthly with a savings grade.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17L7.5 11l4 3L16 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="19" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>,
                num:'03', title:'Monte Carlo Simulation',    desc:'500 market scenarios stress-tested against your plan. Know the probability your portfolio survives before it matters.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 9h16" stroke="currentColor" strokeWidth="1.6"/><circle cx="15.5" cy="13.5" r="1.2" fill="currentColor"/><path d="M7 5V3M15 5V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                num:'04', title:'Net Worth Tracker',         desc:'Assets minus liabilities, auto-updated on import. Tracks your real financial position and your FIRE number proximity in one view.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M11 7v4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5L11 5l4-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'05', title:'Financial Guidance System', desc:'After every transaction batch, the app analyses your patterns and tells you what is costing you years — in plain language, with exact numbers.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v11M7 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                num:'06', title:'Smart Bank Import',         desc:'Upload any bank CSV. Auto-detects columns, date formats, debit/credit splits. No reformatting. Net worth syncs automatically on import.' },
            ].map((f,i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-svg">{f.icon}</div>
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
        <div className="pricing-inner pricing-inner-wide">
          <span className="section-eyebrow">Pricing</span>
          <h2 className="section-title">Three plans.<br/>One tool. Your number.</h2>
          <p className="section-sub">Start with $5 and know your FIRE date today. Upgrade when you're ready to track ongoing.</p>

          <div className="pricing-grid-3">

            {/* LIFETIME */}
            <div className="pricing-card pricing-card-lifetime">
              <div className="pricing-badge-new">Lowest barrier</div>
              <div className="pricing-tier">Lifetime Access</div>
              <div className="pricing-price-row">
                <span className="price-amount">$5</span>
                <span className="price-period"> once</span>
              </div>
              <div className="pricing-storage-tag pricing-storage-session">
                ⚡ Session only — no data stored
              </div>
              <p className="pricing-storage-note">
                Every time you open the tool, you start fresh. Perfect for running the numbers and knowing your FIRE date. No account required.
              </p>
              <ul className="pricing-features">
                <li>✓ Full FIRE calculator</li>
                <li>✓ FIRE, Lean, Fat &amp; Coast modes</li>
                <li>✓ Monte Carlo simulation</li>
                <li>✓ Net Worth &amp; Compound Growth</li>
                <li>✓ All insights &amp; projections</li>
                <li className="pricing-feature-dim">✗ Data does not save between sessions</li>
                <li className="pricing-feature-dim">✗ No cloud sync</li>
              </ul>
            </div>

            {/* MONTHLY */}
            <div className="pricing-card pricing-card-monthly">
              <div className="pricing-tier">Monthly</div>
              <div className="pricing-price-row">
                <span className="price-amount">$4.99</span>
                <span className="price-period"> / month</span>
              </div>
              <div className="pricing-storage-tag pricing-storage-cloud">
                ☁ Data saved to cloud
              </div>
              <p className="pricing-storage-note">
                Transactions, settings, and history saved permanently. Pick up exactly where you left off every session.
              </p>
              <ul className="pricing-features">
                <li>✓ Everything in Lifetime</li>
                <li>✓ Cloud data sync</li>
                <li>✓ Transaction history saved</li>
                <li>✓ FIRE settings preserved</li>
                <li>✓ Smart CSV bank import</li>
                <li>✓ Full data export</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </div>

            {/* ANNUAL */}
            <div className="pricing-card pricing-card-annual featured">
              <div className="pricing-badge-new pricing-badge-best">Best value</div>
              <div className="pricing-tier">Annual</div>
              <div className="pricing-price-row">
                <span className="price-amount">$59.99</span>
                <span className="price-period"> / year</span>
              </div>
              <div className="pricing-equiv">Just $5/month · Save 16%</div>
              <div className="pricing-storage-tag pricing-storage-cloud">
                ☁ Data saved to cloud
              </div>
              <p className="pricing-storage-note">
                Everything in Monthly, billed once a year. Best for people tracking their FIRE journey long-term.
              </p>
              <ul className="pricing-features">
                <li>✓ Everything in Monthly</li>
                <li>✓ Cloud data sync</li>
                <li>✓ Transaction history saved</li>
                <li>✓ FIRE settings preserved</li>
                <li>✓ Smart CSV bank import</li>
                <li>✓ Full data export</li>
                <li>✓ 48-hour refund guarantee</li>
              </ul>
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
        <button className="btn-primary" style={{fontSize:17,padding:'16px 40px'}} onClick={() => navigate('/signup')}>
          Find my freedom date →
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
          <div className="footer-links-col" id="contact">
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