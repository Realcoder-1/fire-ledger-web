import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import ScrollHint from '../components/ScrollHint';
import './Landing.css';
import { supabase } from '../lib/supabase';

// ── YouTube video ID ───────────────────────────────────
const YT_ID = 'TKpPgpjJimM';

// ── Popup storage key ──────────────────────────────────
const POPUP_KEY = 'fl_hours_popup_seen';

// ── Animated hero title ────────────────────────────────
const HERO_CAPTIONS = [
  { line1: 'Get a clear understanding of', accent: 'your financial future.' },
  { line1: 'See your exact', accent: 'freedom timeline.' },
  { line1: 'Know what every decision does to', accent: 'your future date.' },
  { line1: 'Turn vague money goals into a', accent: 'living plan.' },
  { line1: 'Track the path from today to', accent: 'financial independence.' },
];

function AnimatedHeroTitle() {
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState('visible');
  const timerRef          = useRef(null);

  useEffect(() => {
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


// ══════════════════════════════════════════════════════
// CONSOLIDATED DEMO  (replaces DemoReel + DashboardPreview)
// ══════════════════════════════════════════════════════

const DEMO_SCENES = [
  {
    id: 'pain', tag: 'The problem', time: '0:00',
    headline: '62,400 hours left.',
    sub: 'Most people never calculate how much working time they have left. The ones who do retire a decade earlier.',
    accent: { label: 'Working hours remaining', value: '62,400', color: '#f87171' },
  },
  {
    id: 'date', tag: 'Freedom date', time: '0:08',
    headline: 'Your exact date. Not an estimate.',
    sub: 'Enter your numbers once. The dashboard calculates your precise financial independence date and updates it every time you log.',
    accent: { label: 'Your freedom date', value: 'Mar 2038', color: '#a78bfa' },
  },
  {
    id: 'track', tag: 'Live tracking', time: '0:16',
    headline: 'Every transaction moves the date.',
    sub: 'Log income, spending, and savings. Watch your freedom date shift in real time. Every dollar saved is visible progress.',
    accent: { label: 'Savings rate this month', value: '41%  ↑', color: '#52c98a' },
  },
  {
    id: 'guidance', tag: 'Guidance layer', time: '0:24',
    headline: "Know what to fix. Not just what's wrong.",
    sub: 'The guidance system tells you which habits cost the most years — and exactly what to change to move your date forward.',
    accent: { label: 'Years you can save', value: '2.4 yrs', color: '#fbbf24' },
  },
  {
    id: 'timeline', tag: 'Timeline', time: '0:32',
    headline: 'See the full arc of your wealth.',
    sub: 'Watch your portfolio compound across every age on the path to freedom. The finish line becomes visible — not abstract.',
    accent: { label: 'Portfolio at age 45', value: '$486k', color: '#60a5fa' },
  },
];

function SceneVisual({ sceneId }) {
  const visuals = {
    pain: (
      <div className="cdemo-visual cdemo-pain">
        <div className="cdemo-pain-num">62,400</div>
        <div className="cdemo-pain-label">working hours left in your life</div>
        <div className="cdemo-pain-bar"><div className="cdemo-pain-fill" style={{ width: '12%' }} /></div>
        <div className="cdemo-pain-sub">12% to FIRE · 30 years remaining · Grade D</div>
        <div className="cdemo-pain-tip">⚠ Dining out alone is costing you <strong>4.2 years</strong> of your life</div>
      </div>
    ),
    date: (
      <div className="cdemo-visual cdemo-date">
        <div className="cdemo-date-eyebrow">Financial Independence</div>
        <div className="cdemo-date-years">12 <span>years away</span></div>
        <div className="cdemo-date-target">Freedom date: <strong>Mar 2038</strong></div>
        <div className="cdemo-date-ring-row">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#cg1)" strokeWidth="7"
              strokeDasharray="201" strokeDashoffset="155" strokeLinecap="round" transform="rotate(-90 40 40)" />
            <defs>
              <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Playfair Display,serif', color: '#a78bfa' }}>23%</div>
            <div style={{ fontSize: 10, color: '#55557a' }}>to FIRE</div>
          </div>
        </div>
        <div className="cdemo-date-progress">$115,500 of $500,000</div>
      </div>
    ),
    track: (
      <div className="cdemo-visual cdemo-track">
        {[
          { desc: 'Monthly salary',  type: 'income',  amt: '+$5,200', color: '#52c98a' },
          { desc: 'Rent · March',    type: 'need',    amt: '-$1,400', color: '#f87171' },
          { desc: 'Index fund',      type: 'saving',  amt: '+$800',   color: '#fbbf24' },
          { desc: 'Groceries',       type: 'need',    amt: '-$142',   color: '#f87171' },
          { desc: 'Coffee shops',    type: 'want',    amt: '-$68',    color: '#f472b6' },
        ].map((tx, i) => (
          <div key={i} className="cdemo-tx">
            <div className="cdemo-tx-dot" style={{ background: tx.color }} />
            <span className="cdemo-tx-desc">{tx.desc}</span>
            <span className="cdemo-tx-type">{tx.type}</span>
            <span className="cdemo-tx-amt" style={{ color: tx.color }}>{tx.amt}</span>
          </div>
        ))}
        <div className="cdemo-track-footer">
          <span style={{ color: '#55557a' }}>Savings rate</span>
          <span style={{ color: '#52c98a', fontWeight: 700 }}>41% ↑</span>
        </div>
      </div>
    ),
    guidance: (
      <div className="cdemo-visual cdemo-guidance">
        {[
          { type: 'warning',  icon: '↑', label: 'Heads up',  title: 'Wants spending above target',   body: "At 38% of income, you're over the 30% guideline by $240/month." },
          { type: 'insight',  icon: '◎', label: 'Insight',   title: 'Coffee is costing 2.4 years',   body: 'At $68/month, cutting this by half moves your date 1.2 years closer.' },
          { type: 'positive', icon: '✓', label: 'On track',  title: 'Savings rate: 41% — Grade B',   body: 'Strong rate. At this pace you hit FIRE in 12 years.' },
        ].map((tip, i) => {
          const colors = { warning: '#fbbf24', insight: '#a78bfa', positive: '#52c98a' };
          const c = colors[tip.type];
          return (
            <div key={i} className="cdemo-tip" style={{ borderColor: `${c}44`, background: `${c}11` }}>
              <span className="cdemo-tip-badge" style={{ color: c, borderColor: `${c}44` }}>{tip.icon} {tip.label}</span>
              <div className="cdemo-tip-title">{tip.title}</div>
              <div className="cdemo-tip-body">{tip.body}</div>
            </div>
          );
        })}
      </div>
    ),
    timeline: (
      <div className="cdemo-visual cdemo-timeline">
        <svg viewBox="0 0 340 120" style={{ width: '100%', marginBottom: 12 }}>
          <defs>
            <linearGradient id="tlfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="16" y1="28" x2="324" y2="28" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 4" opacity="0.4" />
          <text x="320" y="22" textAnchor="end" fontSize="9" fill="#fbbf24" opacity="0.7">FIRE line</text>
          <path d="M16,98 L85,92 L155,76 L220,54 L262,36 L300,24 L300,100 L16,100 Z" fill="url(#tlfill)" />
          <path d="M16,98 L85,92 L155,76 L220,54 L262,36 L300,24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="300" cy="24" r="5" fill="#52c98a" />
          <line x1="300" y1="16" x2="300" y2="100" stroke="#52c98a" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />
          <text x="300" y="12" textAnchor="middle" fontSize="8" fill="#52c98a">Free</text>
        </svg>
        <div className="cdemo-timeline-pts">
          {[
            { age: 30, val: '$124k' }, { age: 35, val: '$212k' },
            { age: 40, val: '$338k' }, { age: 45, val: '$486k' },
            { age: 47, val: '🔥 Free', green: true },
          ].map(p => (
            <div key={p.age} className="cdemo-timeline-pt">
              <span className="cdemo-timeline-age">Age {p.age}</span>
              <span className="cdemo-timeline-val" style={{ color: p.green ? '#52c98a' : '#f0f0f8' }}>{p.val}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };
  return visuals[sceneId] || null;
}

function ConsolidatedDemo() {
  const [active, setActive]     = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef             = useRef(null);
  const SCENE_DURATION          = 3500;

  const startTimer = (fromScene) => {
    clearInterval(intervalRef.current);
    setProgress(0);
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 50;
      setProgress((elapsed / SCENE_DURATION) * 100);
      if (elapsed >= SCENE_DURATION) {
        clearInterval(intervalRef.current);
        const next = (fromScene + 1) % DEMO_SCENES.length;
        setActive(next);
        startTimer(next);
      }
    }, 50);
  };

  useEffect(() => {
    startTimer(0);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line

  const handleSceneClick = (i) => { setActive(i); startTimer(i); };
  const scene = DEMO_SCENES[active];

  return (
    <div className="cdemo-wrap">
      {/* Left sidebar — scene selector */}
      <div className="cdemo-sidebar">
        <div className="cdemo-sidebar-label">Product walkthrough</div>
        {DEMO_SCENES.map((s, i) => (
          <button key={s.id} className={`cdemo-scene-btn ${i === active ? 'active' : ''}`} onClick={() => handleSceneClick(i)}>
            <div className="cdemo-scene-btn-inner">
              <span className="cdemo-scene-tag">{s.tag}</span>
              <span className="cdemo-scene-time">{s.time}</span>
            </div>
            {i === active && (
              <div className="cdemo-scene-progress">
                <div className="cdemo-scene-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Right — copy + visual */}
      <div className="cdemo-content">
        <div className="cdemo-content-top">
          <div className="cdemo-content-eyebrow">{scene.tag}</div>
          <h3 className="cdemo-content-headline">{scene.headline}</h3>
          <p className="cdemo-content-sub">{scene.sub}</p>
          <div className="cdemo-content-accent">
            <span className="cdemo-accent-label">{scene.accent.label}</span>
            <span className="cdemo-accent-value" style={{ color: scene.accent.color }}>{scene.accent.value}</span>
          </div>
        </div>
        <div className="cdemo-frame">
          <div className="cdemo-chrome">
            <div className="cdemo-chrome-dot" style={{ background: '#ff5f57' }} />
            <div className="cdemo-chrome-dot" style={{ background: '#ffbd2e' }} />
            <div className="cdemo-chrome-dot" style={{ background: '#28ca41' }} />
            <span className="cdemo-chrome-url">app.fireledger.app</span>
          </div>
          <div className="cdemo-frame-body">
            <SceneVisual sceneId={scene.id} />
          </div>
        </div>
        <div className="cdemo-dots">
          {DEMO_SCENES.map((_, i) => (
            <button key={i} className={`cdemo-dot ${i === active ? 'active' : ''}`} onClick={() => handleSceneClick(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// VIDEO SECTION
// ══════════════════════════════════════════════════════

function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="vsect-wrap" id="video">
      <div className="vsect-inner">
        <span className="section-eyebrow">Product walkthrough</span>
        <h2 className="section-title">See it in action.</h2>
        <p className="section-sub">
          A full walkthrough of the dashboard — from logging your first transaction
          to seeing your exact freedom date.
        </p>

        <div className="vsect-player">
          {playing ? (
            <iframe
              className="vsect-iframe"
              src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1&showinfo=0&color=white`}
              title="FIRELedger Dashboard Walkthrough"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="vsect-thumb" onClick={() => setPlaying(true)}>
              <img
                className="vsect-thumb-img"
                src={`https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`}
                alt="FIRELedger dashboard walkthrough"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="vsect-thumb-overlay" />
              <div className="vsect-play-wrap">
                <div className="vsect-play-btn">
                  <div className="vsect-play-ring" />
                  <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
                    <path d="M2 2l22 13L2 28V2z" fill="white" />
                  </svg>
                </div>
                <span className="vsect-play-label">Watch the full walkthrough</span>
                <span className="vsect-play-duration">FIRELedger · Dashboard Guide</span>
              </div>
              <div className="vsect-thumb-bar">
                <div className="vsect-thumb-bar-left">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M15.68.72C15.5.05 14.96-.03 14.32.01 12.3.14 8 .14 8 .14S3.7.14 1.68.01C1.04-.03.5.05.32.72.11 1.53 0 3.06 0 6s.11 4.47.32 5.28c.18.67.72.75 1.36.71C3.7 11.86 8 11.86 8 11.86s4.3 0 6.32.13c.64.04 1.18-.04 1.36-.71C15.89 10.47 16 8.94 16 6s-.11-4.47-.32-5.28zM6.4 8.57V3.43L10.86 6 6.4 8.57z" fill="#FF0000"/>
                  </svg>
                  <span className="vsect-yt-label">YouTube · Unlisted</span>
                </div>
                <span className="vsect-yt-hint">Click to play</span>
              </div>
            </div>
          )}
        </div>

        <div className="vsect-below">
          <span>✓ No account needed</span>
          <span>·</span>
          <span>✓ Full dashboard shown</span>
          <span>·</span>
          <span>✓ Works on mobile</span>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// AFFILIATE BANNER
// ══════════════════════════════════════════════════════

function AffiliateBanner() {
  return (
    <section className="affbanner-section">
      <div className="affbanner-inner">
        <div className="affbanner-left">
          <div className="affbanner-eyebrow">Affiliate program</div>
          <h2 className="affbanner-title">
            Know someone chasing FIRE?<br />
            <span className="affbanner-accent">Earn 30% for telling them.</span>
          </h2>
          <p className="affbanner-sub">
            Share your referral link. Earn 30% commission on every paying customer — monthly, annual, or lifetime. No cap. 90-day cookie window.
          </p>
          <div className="affbanner-stats">
            <div className="affbanner-stat">
              <span className="affbanner-stat-num" style={{ color: '#52c98a' }}>30%</span>
              <span className="affbanner-stat-label">commission</span>
            </div>
            <div className="affbanner-stat-div" />
            <div className="affbanner-stat">
              <span className="affbanner-stat-num" style={{ color: '#a78bfa' }}>$18</span>
              <span className="affbanner-stat-label">per annual referral</span>
            </div>
            <div className="affbanner-stat-div" />
            <div className="affbanner-stat">
              <span className="affbanner-stat-num" style={{ color: '#fbbf24' }}>90 days</span>
              <span className="affbanner-stat-label">cookie window</span>
            </div>
          </div>
        </div>

        <div className="affbanner-right">
          <div className="affbanner-card">
            <div className="affbanner-card-head">
              <span className="affbanner-card-title">Your affiliate dashboard</span>
              <span className="affbanner-card-badge">Preview</span>
            </div>
            <div className="affbanner-card-stats">
              {[
                { val: '$214', label: 'total earned',  color: '#52c98a' },
                { val: '14',   label: 'referrals',     color: '#a78bfa' },
                { val: '8.3%', label: 'conversion',    color: '#fbbf24' },
              ].map(s => (
                <div key={s.label} className="affbanner-card-stat">
                  <span style={{ color: s.color, fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 900 }}>{s.val}</span>
                  <span style={{ fontSize: 10, color: '#55557a' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="affbanner-link-preview">
              <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace' }}>fireledger.app/?ref=yourname</span>
            </div>
          </div>
          <a href="/affiliate" className="affbanner-cta">
            Apply for free — 24h approval →
          </a>
          <p className="affbanner-fine">Free to join · No minimum audience · Monthly payouts</p>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// SCROLL HINT
// ══════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════
// MAIN LANDING
// ══════════════════════════════════════════════════════

export default function Landing() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [showPopup,    setShowPopup]    = useState(false);
  const [navScrolled,  setNavScrolled]  = useState(false);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [email,        setEmail]        = useState('');
  const [waitlistMsg,  setWaitlistMsg]  = useState('');

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
    { q: 'What problem does FIRE Ledger actually solve?', a: 'Most people spend their entire careers with no clear answer to one question: when can I stop working? Generic calculators give vague estimates. Spreadsheets take hours to set up. FIRE Ledger gives you a precise date based on your actual numbers — and updates it in real time as you track your income, spending, and savings each week.' },
    { q: 'What are the different plans?', a: "Three plans. Lifetime ($4.99 once) — full access to every feature, but no data is stored between sessions. Each time you open the tool, you start fresh. Perfect for running the numbers and knowing your FIRE date. Monthly ($4.99/mo) and Annual ($59.99/yr) — your transactions, settings, and history are saved to the cloud and sync across devices." },
    { q: 'How is my freedom date calculated?', a: 'Using the 4% rule — the most widely cited standard in retirement research. Your FIRE number is your annual expenses × 25. We model portfolio growth at 7% annual return. The Monte Carlo simulation stress-tests this across 500 different market scenarios.' },
    { q: 'Is this financial advice?', a: 'FIRE Ledger is a financial guidance and planning tool — not personalised financial advice. For that, consult a qualified financial adviser. All projections are illustrative estimates based on established models.' },
    { q: 'Is my financial data safe?', a: 'Your data is stored on Supabase (AWS infrastructure), encrypted in transit and at rest using TLS and AES-256. We do not sell, share, or monetise your data. You can export your complete transaction history at any time.' },
    { q: 'How does payment work?', a: 'Payments are handled entirely by Paddle — a regulated merchant of record operating in 200+ countries. We never see or store your card details. Accepted: Visa, Mastercard, American Express, PayPal.' },
    { q: 'What if I already have bank data I want to import?', a: "Go to Export & Import → Smart Import. Download a CSV from your bank's website and upload it. The importer auto-detects column names, date formats, and debit/credit split columns." },
    { q: 'Can I cancel anytime?', a: "Yes. Cancel directly from your Paddle billing portal — no email required. If you cancel within 48 hours of subscribing and haven't used the data export feature, you're eligible for a full refund." },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose} />}

      {/* ── NAV ── */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
          <button className="nav-link" onClick={() => scrollTo('preview')}>Preview</button>
          <button className="nav-link" onClick={() => scrollTo('video')}>Watch</button>
          <button className="nav-link" onClick={() => scrollTo('story')}>Our Story</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button>
        </div>
        <button className="nav-cta" onClick={() => scrollTo('pricing')}>See Plans →</button>
        {!user && (
          <button className="nav-signin" onClick={() => navigate('/signin')}>Sign in</button>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Outcome-first financial guidance</div>
          <AnimatedHeroTitle />
          <p className="hero-sub">
            A guided dashboard that shows where you are, where you are headed,
            and what to change to get there faster.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scrollTo('preview')}>Watch the demo</button>
            <button className="btn-ghost"   onClick={() => scrollTo('video')}>See the walkthrough</button>
          </div>
          <div className="hero-trust">
            <span>✓ Clear timeline</span><span>·</span>
            <span>✓ Ongoing guidance</span><span>·</span>
            <span>✓ Cloud-backed progress tracking</span>
          </div>
          <div className="hero-stat-strip">
            <div className="hero-stat-item">
              <span className="hero-stat-num">1 dashboard</span>
              <span className="hero-stat-label">to see your position, next moves, and freedom date</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">Live guidance</span>
              <span className="hero-stat-label">not just a calculator — a system that reacts to your inputs</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">Timeline clarity</span>
              <span className="hero-stat-label">see how today's decisions change your financial future</span>
            </div>
          </div>
          <SmartScrollHint text="Scroll to see the dashboard" />
        </div>

        {/* Hero mockup — pain card */}
        <div className="hero-mockup">
          <div className="mockup-card mockup-card-pain">
            <div className="mockup-pain-header">
              <span className="mockup-pain-label">YOUR REALITY RIGHT NOW</span>
              <span className="mockup-pain-alert">⚠ Off track</span>
            </div>
            <div className="mockup-hours-wrap">
              <span className="mockup-hours-num">62,400</span>
              <span className="mockup-hours-label">working hours left in your life</span>
            </div>
            <div className="mockup-ring-wrap">
              <svg viewBox="0 0 120 120" className="mockup-ring">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#painGrad)" strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset="276" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                <defs>
                  <linearGradient id="painGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#e05c5c"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="mockup-ring-text">
                <span className="mockup-pct" style={{ color: '#f87171' }}>12%</span>
                <span className="mockup-pct-label">to FIRE</span>
              </div>
            </div>
            <div className="mockup-pain-stats">
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{ color: '#f87171' }}>30 yrs</span>
                <span className="mockup-pain-stat-label">until you're free</span>
              </div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{ color: '#f87171' }}>D</span>
                <span className="mockup-pain-stat-label">savings grade</span>
              </div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat">
                <span className="mockup-pain-stat-val" style={{ color: '#fbbf24' }}>$986k</span>
                <span className="mockup-pain-stat-label">FIRE gap</span>
              </div>
            </div>
            <div className="mockup-pain-tip">
              <span style={{ color: '#f87171', fontWeight: 700 }}>!</span>
              &nbsp;Dining out alone costs you <strong style={{ color: '#f87171' }}>4.2 years</strong> of your life.
              At this rate you retire at <strong style={{ color: '#f87171' }}>age 65.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSOLIDATED DEMO PREVIEW ── */}
      <section className="preview-section" id="preview">
        <div className="preview-section-inner">
          <span className="section-eyebrow">Live product preview</span>
          <h2 className="section-title">Understand your financial future in minutes.</h2>
          <p className="section-sub">Click any scene to explore the dashboard, the timeline, and the guidance layer.</p>
          <ConsolidatedDemo />
          <SmartScrollHint text="Continue reading" />
        </div>
      </section>

      {/* ── VIDEO SECTION ── */}
      <VideoSection />

      {/* ── BEFORE / AFTER ── */}
      <section className="before-after-section">
        <div className="before-after-inner">
          <span className="section-eyebrow">The difference it makes</span>
          <h2 className="section-title">Before FIRE Ledger.<br/>After FIRE Ledger.</h2>
          <div className="ba-grid">
            <div className="ba-card ba-before">
              <div className="ba-card-label">Before</div>
              <div className="ba-mockup-janky">
                <div className="janky-header">retirement_calc_v3_FINAL.xlsx</div>
                {['Current age: 28','Retire at: 65 (maybe?)','Savings: somewhere around 50k','Monthly budget: idk, roughly','Freedom date: ???','=IF(B12>C12,"maybe","probably not")'].map((r,i)=>(
                  <div key={i} className="janky-row">{r}</div>
                ))}
              </div>
              <ul className="ba-list">
                <li>Vague retirement age based on assumptions</li>
                <li>No real-time updates when spending changes</li>
                <li>No way to see what each expense costs in years</li>
                <li>Manual spreadsheet that breaks constantly</li>
              </ul>
            </div>
            <div className="ba-card ba-after">
              <div className="ba-card-label" style={{ background:'rgba(82,201,138,0.15)', color:'#52c98a', borderColor:'rgba(82,201,138,0.3)' }}>After</div>
              <div className="ba-mockup-clean">
                <div className="ba-clean-header">
                  <span>Financial Independence</span>
                  <span style={{ color:'#a78bfa' }}>Mar 2038</span>
                </div>
                <div className="ba-clean-years">12<span style={{ fontSize:14, color:'rgba(240,240,248,0.5)' }}> years away</span></div>
                <div className="ba-clean-progress">
                  <div style={{ width:'40%', height:'100%', background:'linear-gradient(90deg,#a78bfa,#f472b6)', borderRadius:4 }}/>
                </div>
                <div className="ba-clean-metrics">
                  {[{l:'Income',v:'$5,200',c:'#52c98a'},{l:'Spent',v:'$2,100',c:'#e05c5c'},{l:'Saved',v:'$1,400',c:'#5b9cf6'}].map(m=>(
                    <div key={m.l} className="ba-clean-metric"><span>{m.l}</span><span style={{ color:m.c, fontWeight:700 }}>{m.v}</span></div>
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

      {/* ── FOUNDER STORY ── */}
      <section className="story-section" id="story">
        <div className="story-inner">
          <span className="section-eyebrow">Why this exists</span>
          <h2 className="section-title">I built this because<br /><em>I couldn't find the answer myself.</em></h2>
          <div className="story-body">
            <p>A few years ago, I sat down and tried to answer a simple question: <strong>when can I actually stop working?</strong></p>
            <p>Not when the government says I can retire. Not a vague number from a generic calculator. The real question — based on what I actually earn, what I actually spend, and what I've actually saved.</p>
            <p>Every tool I found either required a finance degree to understand, gave me a number with no context, or was so generic it was useless. None of them tracked whether I was on pace. None told me what my discretionary spending was costing me in years of my life.</p>
            <p>So I built FIRE Ledger. For myself. Then I realised others had long been asking the same question — so I decided to share it with the world.</p>
          </div>
          <div className="story-quote">
            <div className="story-quote-mark">"</div>
            <p className="story-quote-text">Most people will work until they're told they can stop — not because they have to, but because they never had a system that showed them exactly when they could walk away. FIRE Ledger changes that. It doesn't just tell you where you stand. It tells you what to do about it.</p>
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
              <p className="validation-body">"This is what the FIRE community has been missing. Not another calculator — a system that holds you accountable to your own timeline and tells you exactly what needs to change."</p>
              <div className="validation-source">— Finance community feedback, March 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="features-inner">
          <span className="section-eyebrow">What's inside</span>
          <h2 className="section-title">Four tools.<br/>One freedom date.</h2>
          <div className="features-grid">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/></svg>,
                num:'01', title:'Your Freedom Date', desc:'A precise date tied to your actual numbers. It updates as you log, so you always know how far away freedom really is.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17L7.5 11l4 3L16 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="19" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>,
                num:'02', title:'Your Financial Timeline', desc:'See how your portfolio compounds across different ages. The path becomes visible, not abstract.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M11 7v4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5L11 5l4-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'03', title:'Deviation Guidance', desc:'When spending or saving pushes you off track, the app tells you what changed, what it cost, and what would move the date back.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h10M3 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M17 13l-2.5 2.5L17 18M14.5 15.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'04', title:'Live Transaction Tracking', desc:'Every income, expense, and savings entry feeds the timeline. This turns a calculator into an ongoing decision system.' },
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

      {/* ── PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner pricing-inner-wide">
          <span className="section-eyebrow">Pricing</span>
          <h2 className="section-title">Three plans.<br/>One tool. Your number.</h2>
          <p className="section-sub">Start with $5 and know your FIRE date today. Upgrade when you're ready to track ongoing.</p>
          <div className="pricing-grid-3">
            <div className="pricing-card pricing-card-lifetime">
              <div className="pricing-badge-new">Lowest barrier</div>
              <div className="pricing-tier">Lifetime Access</div>
              <div className="pricing-price-row"><span className="price-amount">$5</span><span className="price-period"> once</span></div>
              <div className="pricing-storage-tag pricing-storage-session">⚡ Session only — no data stored</div>
              <p className="pricing-storage-note">Every time you open the tool, you start fresh. Perfect for running the numbers and knowing your FIRE date.</p>
              <ul className="pricing-features">
                <li>✓ Full FIRE calculator</li><li>✓ FIRE, Lean, Fat &amp; Coast modes</li>
                <li>✓ Monte Carlo simulation</li><li>✓ Net Worth &amp; Compound Growth</li>
                <li>✓ All insights &amp; projections</li>
                <li className="pricing-feature-dim">✗ Data does not save between sessions</li>
                <li className="pricing-feature-dim">✗ No cloud sync</li>
              </ul>
            </div>
            <div className="pricing-card pricing-card-monthly">
              <div className="pricing-tier">Monthly</div>
              <div className="pricing-price-row"><span className="price-amount">$4.99</span><span className="price-period"> / month</span></div>
              <div className="pricing-storage-tag pricing-storage-cloud">☁ Data saved to cloud</div>
              <p className="pricing-storage-note">Transactions, settings, and history saved permanently. Pick up exactly where you left off every session.</p>
              <ul className="pricing-features">
                <li>✓ Everything in Lifetime</li><li>✓ Cloud data sync</li>
                <li>✓ Transaction history saved</li><li>✓ FIRE settings preserved</li>
                <li>✓ Smart CSV bank import</li><li>✓ Full data export</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </div>
            <div className="pricing-card pricing-card-annual featured">
              <div className="pricing-badge-new pricing-badge-best">Best value</div>
              <div className="pricing-tier">Annual</div>
              <div className="pricing-price-row"><span className="price-amount">$59.99</span><span className="price-period"> / year</span></div>
              <div className="pricing-equiv">Just $5/month · Save 16%</div>
              <div className="pricing-storage-tag pricing-storage-cloud">☁ Data saved to cloud</div>
              <p className="pricing-storage-note">Everything in Monthly, billed once a year. Best for people tracking their FIRE journey long-term.</p>
              <ul className="pricing-features">
                <li>✓ Everything in Monthly</li><li>✓ Cloud data sync</li>
                <li>✓ Transaction history saved</li><li>✓ FIRE settings preserved</li>
                <li>✓ Smart CSV bank import</li><li>✓ Full data export</li>
                <li>✓ 48-hour refund guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <span className="section-eyebrow">Common questions</span>
          <h2 className="section-title">Before you sign up</h2>
          <div className="faq-list">
            {FAQS.map((item, i) => (
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

      {/* ── FINAL CTA ── */}
      <section className="final-cta-section">
        <h2 className="final-cta-title">The question is simple.<br/>When can you stop working?</h2>
        <p className="final-cta-sub">Most people go their whole careers without ever calculating it. You now have a tool that answers it in five minutes — and keeps the answer updated every week.</p>
        <div className="email-capture">
          <input type="email" placeholder="Enter your email" className="email-input"
            value={email} onChange={e => setEmail(e.target.value)} />
          <button className="btn-primary" onClick={async () => {
            if (!email) { setWaitlistMsg('Enter your email'); setTimeout(() => setWaitlistMsg(''), 5000); return; }
            const { error } = await supabase.from('waitlist').insert([{ email }]);
            if (error) { setWaitlistMsg('Something went wrong'); }
            else { setWaitlistMsg('You are on your way to early retirement'); setEmail(''); }
            setTimeout(() => setWaitlistMsg(''), 5000);
          }}>
            Join waitlist →
          </button>
          {waitlistMsg && <div style={{ marginTop: 8, fontSize: 14, color: '#52c98a' }}>{waitlistMsg}</div>}
        </div>
        <p style={{ fontSize: 12, color: '#8888aa', marginTop: 12 }}>No credit card · No commitment · Just the truth about your timeline</p>
      </section>

      {/* ── AFFILIATE BANNER ── */}
      <AffiliateBanner />

      {/* ── FOOTER ── */}
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
            <a href="https://www.instagram.com/fire_ledger/" target="_blank" rel="noreferrer">Instagram → @fire_ledger</a>
            <a href="https://x.com/Fireledger01" target="_blank" rel="noreferrer">X.com → @fireledger01</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Affiliate</div>
            <a href="/affiliate">Join the program</a>
            <a href="/affiliate#aff-how">How it works</a>
            <a href="/affiliate#aff-apply">Apply now</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Payment</div>
            <p style={{ fontSize:12, color:'#55557a', lineHeight:1.7 }}>All billing handled by <strong style={{ color:'#8888aa' }}>Paddle</strong> — a regulated merchant of record. We never store your card details.</p>
            <div className="footer-pay-logos">
              <span className="pay-logo">VISA</span><span className="pay-logo">MC</span>
              <span className="pay-logo">AMEX</span><span className="pay-logo pay-logo-paddle">Paddle</span>
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
