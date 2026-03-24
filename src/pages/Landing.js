import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import ScrollHint from '../components/ScrollHint';
import './Landing.css';
import { supabase } from '../lib/supabase';

// ── Animated cycling caption (AnyInterview-style) ──────
const HERO_CAPTIONS = [
  { line1: 'Get a clear understanding of', accent: 'your financial future.' },
  { line1: 'See your exact', accent: 'freedom timeline.' },
  { line1: 'Know what every decision does to', accent: 'your future date.' },
  { line1: 'Turn vague money goals into a', accent: 'living plan.' },
  { line1: 'Track the path from today to', accent: 'financial independence.' },
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

function MiniRing({ pct, size = 90 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="45"
        cy="45"
        r={r}
        fill="none"
        stroke="url(#landing-ring-grad)"
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
      />
      <defs>
        <linearGradient id="landing-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DashboardPreview() {
  const navItems = [
    { label: 'Dashboard', active: true },
    { label: 'Transactions' },
    { label: 'Insights' },
    { label: 'FIRE Calc' },
    { label: 'Timeline' },
    { label: 'Net Worth' },
    { label: 'Guide' },
    { label: 'Export & Import' },
    { label: 'Settings' },
  ];

  const timelinePoints = [
    { age: 30, value: '$124k' },
    { age: 35, value: '$212k' },
    { age: 40, value: '$338k' },
    { age: 45, value: '$486k' },
    { age: 47, value: 'Freedom' },
  ];

  return (
    <div className="preview-frame">
      <div className="preview-chrome">
        <div className="chrome-dot red" />
        <div className="chrome-dot yellow" />
        <div className="chrome-dot green" />
        <span className="chrome-url">app.fireledger.app/dashboard</span>
      </div>
      <div className="preview-dashboard">
        <div className="preview-sidebar">
          <div className="preview-brand">FIRELedger</div>
          {navItems.map((item) => (
            <div key={item.label} className={`preview-nav-item ${item.active ? 'active' : ''}`}>
              <div className="preview-nav-dot" />
              {item.label}
            </div>
          ))}
        </div>
        <div className="preview-main">
          <div className="preview-page-title">Good morning</div>
          <div className="preview-page-sub">$142 spent today · 12-day streak</div>

          <div className="preview-fire-card">
            <div className="preview-fire-left">
              <div className="preview-fire-eyebrow">Financial Independence</div>
              <div className="preview-fire-years">18 <span className="preview-fire-years-sub">years away</span></div>
              <div className="preview-fire-date">Projected freedom: <strong>Mar 2043</strong></div>
              <div className="preview-fire-hours">37,440 working hours remaining</div>
              <div className="preview-progress-bar">
                <div className="preview-progress-fill" />
              </div>
              <div className="preview-progress-copy">23.1% complete · $115,500 of $500,000</div>
            </div>
            <div className="preview-fire-right">
              <MiniRing pct={23} />
              <div className="preview-ring-label">
                <span className="preview-ring-pct">23%</span>
                <span className="preview-ring-sub">to FIRE</span>
              </div>
            </div>
          </div>

          <div className="preview-metrics-grid">
            {[
              { label: 'Income', value: '$5,200', sub: 'This month', color: '#52c98a' },
              { label: 'Spent', value: '$3,140', sub: '60% of income', color: '#e05c5c' },
              { label: 'Saved', value: '$1,200', sub: '23% savings rate', color: '#fbbf24' },
              { label: 'Grade', value: 'C', sub: 'Monthly score', color: '#a78bfa' },
            ].map((metric) => (
              <div key={metric.label} className="preview-metric-card">
                <div className="preview-metric-label">{metric.label}</div>
                <div className="preview-metric-value" style={{ color: metric.color }}>{metric.value}</div>
                <div className="preview-metric-sub">{metric.sub}</div>
              </div>
            ))}
          </div>

          <div className="preview-lower-grid">
            <div className="preview-panel">
              <div className="preview-panel-head">
                <span>Recent Transactions</span>
                <span>View all →</span>
              </div>
              <div className="preview-tx-list-static">
                {[
                  { desc: 'Monthly salary', meta: 'Income', amt: '+$5,200.00', color: '#52c98a' },
                  { desc: 'Rent - March', meta: 'Need · 2d', amt: '-$1,400.00', color: '#e05c5c' },
                  { desc: 'Index fund - ISA', meta: 'Saving · 3d', amt: '+$800.00', color: '#fbbf24' },
                  { desc: 'Groceries', meta: 'Need · 4d', amt: '-$142.00', color: '#e05c5c' },
                ].map((tx, index) => (
                  <div key={index} className="preview-tx-row-static">
                    <div className="preview-tx-dot" style={{ background: tx.color }} />
                    <span className="preview-tx-desc-static">{tx.desc}</span>
                    <span className="preview-tx-meta-static">{tx.meta}</span>
                    <span className="preview-tx-amt-static" style={{ color: tx.color }}>{tx.amt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="preview-panel">
              <div className="preview-panel-head">
                <span>Financial Timeline</span>
                <span>Age-based view</span>
              </div>
              <div className="preview-timeline-chart">
                <svg viewBox="0 0 320 110" className="preview-proj-chart">
                  <defs>
                    <linearGradient id="preview-timeline-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="16" y1="24" x2="304" y2="24" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 4" opacity="0.45" />
                  <text x="304" y="18" textAnchor="end" fontSize="8" fill="#fbbf24" opacity="0.8">FIRE line</text>
                  <path d="M16,94 L80,88 L144,72 L208,52 L248,36 L288,22 L288,96 L16,96 Z" fill="url(#preview-timeline-fill)" />
                  <path d="M16,94 L80,88 L144,72 L208,52 L248,36 L288,22" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="288" cy="22" r="4" fill="#52c98a" />
                  <line x1="288" y1="14" x2="288" y2="96" stroke="#52c98a" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
                  <text x="288" y="10" textAnchor="middle" fontSize="8" fill="#52c98a">Free</text>
                </svg>
              </div>
              <div className="preview-timeline-points">
                {timelinePoints.map((point) => (
                  <div key={point.age} className="preview-timeline-point">
                    <span className="preview-timeline-age">Age {point.age}</span>
                    <span className={`preview-timeline-value ${point.value === 'Freedom' ? 'success' : ''}`}>{point.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="preview-guidance-banner">
            Wants spending is costing you <strong>2.4 years</strong>. Cutting it by $300/month moves your freedom date to <strong>November 2040</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoReel() {
  const scenes = [
    {
      eyebrow: 'Dashboard overview',
      title: 'See the full picture instantly',
      body: 'Income, spending, savings rate, freedom progress, and your projected date in one place.',
      badge: '00:04',
      accent: 'Mar 2043',
    },
    {
      eyebrow: 'Timeline',
      title: 'Watch the path to financial independence',
      body: 'See where your portfolio is heading by age, and when the line crosses into freedom.',
      badge: '00:08',
      accent: 'Age 47',
    },
    {
      eyebrow: 'Guidance',
      title: 'See what is slowing you down',
      body: 'The system points out which habits are delaying freedom and what changes move the date forward.',
      badge: '00:12',
      accent: '2.4 years saved',
    },
    {
      eyebrow: 'Tracking',
      title: 'Log once. Update everything.',
      body: 'Each transaction feeds the dashboard, timeline, and guidance layer so the plan stays current.',
      badge: '00:16',
      accent: 'Live sync',
    },
  ];

  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [scenes.length]);

  const current = scenes[sceneIndex];

  return (
    <div className="demo-reel" aria-label="Autoplay product demo">
      <div className="demo-reel-copy">
        <div className="demo-reel-head">
          <span className="demo-reel-badge">Autoplay demo</span>
          <span className="demo-reel-timer">{current.badge}</span>
        </div>
        <div className="demo-reel-step">{current.eyebrow}</div>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <div className="demo-reel-accent">{current.accent}</div>
        <div className="demo-reel-progress">
          {scenes.map((scene, index) => (
            <span
              key={scene.eyebrow}
              className={`demo-reel-dot ${index === sceneIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="demo-reel-frame">
        <DashboardPreview />
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
  const [email, setEmail] = useState('');
const [waitlistMessage, setWaitlistMessage] = useState('');

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
      a: 'Three plans. Lifetime ($4.99 once) — full access to every feature, but no data is stored between sessions. Each time you open the tool, you start fresh. Perfect for running the numbers and knowing your FIRE date. Monthly ($4.99/mo) and Annual ($59.99/yr) — your transactions, settings, and history are saved to the cloud and sync across devices.'
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
          <div className="hero-badge">Outcome-first financial guidance</div>
          <AnimatedHeroTitle />
          <p className="hero-sub">
            A guided dashboard that shows where you are, where you are headed, and what to change to get there faster.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scrollTo('preview')}>
              Watch the demo
            </button>
            <button className="btn-ghost" onClick={() => scrollTo('preview')}>
              See the dashboard
            </button>
          </div>
          <div className="hero-trust">
            <span>✓ Clear timeline</span>
            <span>·</span>
            <span>✓ Ongoing guidance</span>
            <span>·</span>
            <span>✓ Cloud-backed progress tracking</span>
          </div>
          <div className="hero-stat-strip">
  <div className="hero-stat-item">
    <span className="hero-stat-num">1 dashboard</span>
    <span className="hero-stat-label">to see your current position, next moves, and freedom date</span>
  </div>
  <div className="hero-stat-div" />
  <div className="hero-stat-item">
    <span className="hero-stat-num">Live guidance</span>
    <span className="hero-stat-label">not just a calculator, a system that reacts to your inputs</span>
  </div>
  <div className="hero-stat-div" />
  <div className="hero-stat-item">
    <span className="hero-stat-num">Timeline clarity</span>
    <span className="hero-stat-label">see how today’s decisions change your financial future</span>
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
          <h2 className="section-title">Understand your financial future in minutes.</h2>
          <p className="section-sub">A fast walkthrough of the internal dashboard, the timeline, and the guidance layer that keeps the plan current.</p>
          <DemoReel />
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
            <p>So I built FIRE Ledger. For myself. A system where I enter my numbers and get a clear timeline of exactly when I can stop working, then track every week whether I'm getting closer or further away. As time passed, I realised others had long been asking the same question. So I decided to share it with the world. </p>
          </div>
            <div className="story-quote">
            <div className="story-quote-mark">"</div>
            <p className="story-quote-text">
              "Most people will work until they're told they can stop — not because they have to, but because they never had a system that showed them exactly when they could walk away and what it would take to get there faster. FIRE Ledger changes that.  It doesn't just tell you where you stand. It tells you what to do about it.
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
              <p className="validation-body">"This is what the FIRE community has been missing. Not another calculator, a system that holds you accountable to your own timeline and tells you exactly what needs to change. Once you see your freedom date moving, you can't unsee it.</p>
              <div className="validation-source">— Finance community feedback, March 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — 6 clean, no emojis */}
      <section className="features" id="features">
        <div className="features-inner">
          <span className="section-eyebrow">What's inside</span>
          <h2 className="section-title">Four tools.<br/>One freedom date.</h2>
          <div className="features-grid">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/></svg>,
                num:'01', title:'Your Freedom Date', desc:'A precise date tied to your actual numbers. It updates as you log, so you always know how far away freedom really is.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17L7.5 11l4 3L16 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="19" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>,
                num:'02', title:'Your Financial Timeline', desc:'See how your portfolio compounds across different ages on the way to retirement. The path becomes visible, not abstract.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M11 7v4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5L11 5l4-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'03', title:'Deviation Guidance', desc:'When spending or saving pushes you off track, the app tells you what changed, what it cost, and what would move the date back.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h10M3 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M17 13l-2.5 2.5L17 18M14.5 15.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'04', title:'Live Transaction Tracking', desc:'Every income, expense, and savings entry feeds the timeline. This is what turns a calculator into an ongoing decision system.' },
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
       

<div className="email-capture">
  <input
    type="email"
    placeholder="Enter your email"
    className="email-input"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <button
    className="btn-primary"
    onClick={async () => {
      if (!email) {
        setWaitlistMessage('Enter your email');
        setTimeout(() => setWaitlistMessage(''), 5000);
        return;
      }

      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) {
        console.error(error);
        setWaitlistMessage('Something went wrong');
      } else {
        setWaitlistMessage('You are on your way to early retirement');
        setEmail('');
      }

      // Clear message after 5s
      setTimeout(() => setWaitlistMessage(''), 5000);
    }}
  >
    Join waitlist →
  </button>

  {/* Inline message */}
  {waitlistMessage && (
    <div style={{ marginTop: 8, fontSize: 14, color: '#52c98a' }}>
      {waitlistMessage}
    </div>
  )}
</div>        <p style={{fontSize:12,color:'#8888aa',marginTop:12}}>No credit card · No commitment · Just the truth about your timeline</p>
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
