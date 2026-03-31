import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';
import { supabase } from '../lib/supabase';

const YT_ID   = 'TKpPgpjJimM';
const POPUP_KEY = 'fl_hours_popup_seen';

// ── Animated hero title ─────────────────────────────────────────────────────
const HERO_CAPTIONS = [
  { line1: 'You will work until you die.', accent: 'Unless you make a change.' },
  { line1: 'Most people never know', accent: 'when they could stop working.' },
  { line1: 'Every year without a plan', accent: 'is another year you sell away.' },
  { line1: 'Your freedom date is moving.', accent: 'You are just not tracking it.' },
  { line1: 'The people who retire early', accent: 'faced the number before you did.' },
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
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, [idx]);
  const c = HERO_CAPTIONS[idx];
  return (
    <h1 className={`hero-title hero-title-anim hero-title-${phase}`}>
      {c.line1}<br /><span className="hero-accent">{c.accent}</span>
    </h1>
  );
}

// ── Scroll arrow ────────────────────────────────────────────────────────────
function ScrollArrow({ targetId }) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <button className="scroll-arrow-btn" onClick={handleClick} aria-label="Scroll down">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3v16M4 12l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ── Consolidated Demo ───────────────────────────────────────────────────────
const DEMO_SCENES = [
  { id: 'pain',     tag: 'The problem',   time: '0:00', headline: '62,400 hours left.',                          sub: 'Most people never calculate how much working time they have left. The ones who do retire a decade earlier.',                                                        accent: { label: 'Working hours remaining',   value: '62,400',  color: '#f87171' } },
  { id: 'date',     tag: 'Freedom date',  time: '0:08', headline: 'Your exact date. Not an estimate.',           sub: 'Enter your numbers once. The dashboard calculates your precise financial independence date and updates it every time you log.',                                 accent: { label: 'Your freedom date',         value: 'Mar 2038', color: '#a78bfa' } },
  { id: 'track',    tag: 'Live tracking', time: '0:16', headline: 'Every transaction moves the date.',           sub: 'Log income, spending, and savings. Watch your freedom date shift in real time. Every dollar saved is visible progress.',                                        accent: { label: 'Savings rate this month',   value: '41% ↑',   color: '#52c98a' } },
  { id: 'guidance', tag: 'Guidance',      time: '0:24', headline: "Know what to fix. Not just what's wrong.",   sub: 'The guidance system tells you which habits cost the most years — and exactly what to change to move your date forward.',                                        accent: { label: 'Years you can save',        value: '2.4 yrs', color: '#fbbf24' } },
  { id: 'timeline', tag: 'Timeline',      time: '0:32', headline: 'See the full arc of your wealth.',           sub: 'Watch your portfolio compound across every age on the path to freedom. The finish line becomes visible — not abstract.',                                        accent: { label: 'Portfolio at age 45',       value: '$486k',   color: '#60a5fa' } },
];

function SceneVisual({ sceneId }) {
  const v = {
    pain: (
      <div className="cdemo-visual cdemo-pain">
        <div className="cdemo-pain-num">62,400</div>
        <div className="cdemo-pain-label">working hours left in your life</div>
        <div className="cdemo-pain-bar"><div className="cdemo-pain-fill" style={{ width:'12%' }}/></div>
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
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#cg1)" strokeWidth="7" strokeDasharray="201" strokeDashoffset="155" strokeLinecap="round" transform="rotate(-90 40 40)"/>
            <defs><linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
          </svg>
          <div>
            <div style={{ fontSize:22,fontWeight:900,fontFamily:'Playfair Display,serif',color:'#a78bfa' }}>23%</div>
            <div style={{ fontSize:10,color:'#55557a' }}>to FIRE</div>
          </div>
        </div>
        <div className="cdemo-date-progress">$115,500 of $500,000</div>
      </div>
    ),
    track: (
      <div className="cdemo-visual cdemo-track">
        {[
          { desc:'Monthly salary', type:'income',  amt:'+$5,200', color:'#52c98a' },
          { desc:'Rent · March',   type:'need',    amt:'-$1,400', color:'#f87171' },
          { desc:'Index fund',     type:'saving',  amt:'+$800',   color:'#fbbf24' },
          { desc:'Groceries',      type:'need',    amt:'-$142',   color:'#f87171' },
          { desc:'Coffee shops',   type:'want',    amt:'-$68',    color:'#f472b6' },
        ].map((tx,i)=>(
          <div key={i} className="cdemo-tx">
            <div className="cdemo-tx-dot" style={{ background:tx.color }}/>
            <span className="cdemo-tx-desc">{tx.desc}</span>
            <span className="cdemo-tx-type">{tx.type}</span>
            <span className="cdemo-tx-amt" style={{ color:tx.color }}>{tx.amt}</span>
          </div>
        ))}
        <div className="cdemo-track-footer">
          <span style={{ color:'#55557a' }}>Savings rate</span>
          <span style={{ color:'#52c98a',fontWeight:700 }}>41% ↑</span>
        </div>
      </div>
    ),
    guidance: (
      <div className="cdemo-visual cdemo-guidance">
        {[
          { type:'warning',  icon:'↑', label:'Heads up', title:'Wants spending above target',  body:"At 38% of income, you're over the 30% guideline by $240/month." },
          { type:'insight',  icon:'◎', label:'Insight',  title:'Coffee is costing 2.4 years',  body:'At $68/month, cutting this by half moves your date 1.2 years closer.' },
          { type:'positive', icon:'✓', label:'On track', title:'Savings rate: 41% — Grade B', body:'Strong rate. At this pace you hit FIRE in 12 years.' },
        ].map((tip,i)=>{
          const c={warning:'#fbbf24',insight:'#a78bfa',positive:'#52c98a'}[tip.type];
          return (
            <div key={i} className="cdemo-tip" style={{ borderColor:`${c}44`,background:`${c}11` }}>
              <span className="cdemo-tip-badge" style={{ color:c,borderColor:`${c}44` }}>{tip.icon} {tip.label}</span>
              <div className="cdemo-tip-title">{tip.title}</div>
              <div className="cdemo-tip-body">{tip.body}</div>
            </div>
          );
        })}
      </div>
    ),
    timeline: (
      <div className="cdemo-visual cdemo-timeline">
        <svg viewBox="0 0 340 120" style={{ width:'100%',marginBottom:12 }}>
          <defs><linearGradient id="tlfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity="0.22"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></linearGradient></defs>
          <line x1="16" y1="28" x2="324" y2="28" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5 4" opacity="0.4"/>
          <text x="320" y="22" textAnchor="end" fontSize="9" fill="#fbbf24" opacity="0.7">FIRE line</text>
          <path d="M16,98 L85,92 L155,76 L220,54 L262,36 L300,24 L300,100 L16,100 Z" fill="url(#tlfill)"/>
          <path d="M16,98 L85,92 L155,76 L220,54 L262,36 L300,24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="300" cy="24" r="5" fill="#52c98a"/>
          <text x="300" y="12" textAnchor="middle" fontSize="8" fill="#52c98a">Free</text>
        </svg>
        <div className="cdemo-timeline-pts">
          {[{age:30,val:'$124k'},{age:35,val:'$212k'},{age:40,val:'$338k'},{age:45,val:'$486k'},{age:47,val:'🔥 Free',green:true}].map(p=>(
            <div key={p.age} className="cdemo-timeline-pt">
              <span className="cdemo-timeline-age">Age {p.age}</span>
              <span className="cdemo-timeline-val" style={{ color:p.green?'#52c98a':'#f0f0f8' }}>{p.val}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };
  return v[sceneId] || null;
}

function ConsolidatedDemo() {
  const [active, setActive]     = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef             = useRef(null);
  const SCENE_DURATION          = 3500;

  const startTimer = (from) => {
    clearInterval(intervalRef.current);
    setProgress(0);
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 50;
      setProgress((elapsed / SCENE_DURATION) * 100);
      if (elapsed >= SCENE_DURATION) {
        clearInterval(intervalRef.current);
        const next = (from + 1) % DEMO_SCENES.length;
        setActive(next);
        startTimer(next);
      }
    }, 50);
  };

  useEffect(() => { startTimer(0); return () => clearInterval(intervalRef.current); }, []); // eslint-disable-line

  const click = (i) => { setActive(i); startTimer(i); };
  const scene = DEMO_SCENES[active];

  return (
    <div className="cdemo-wrap">
      <div className="cdemo-sidebar">
        <div className="cdemo-sidebar-label">Product walkthrough</div>
        {DEMO_SCENES.map((s,i) => (
          <button key={s.id} className={`cdemo-scene-btn ${i===active?'active':''}`} onClick={()=>click(i)}>
            <div className="cdemo-scene-btn-inner">
              <span className="cdemo-scene-tag">{s.tag}</span>
              <span className="cdemo-scene-time">{s.time}</span>
            </div>
            {i===active && <div className="cdemo-scene-progress"><div className="cdemo-scene-progress-fill" style={{ width:`${progress}%` }}/></div>}
          </button>
        ))}
      </div>
      <div className="cdemo-content">
        <div className="cdemo-content-top">
          <div className="cdemo-content-eyebrow">{scene.tag}</div>
          <h3 className="cdemo-content-headline">{scene.headline}</h3>
          <p className="cdemo-content-sub">{scene.sub}</p>
          <div className="cdemo-content-accent">
            <span className="cdemo-accent-label">{scene.accent.label}</span>
            <span className="cdemo-accent-value" style={{ color:scene.accent.color }}>{scene.accent.value}</span>
          </div>
        </div>
        <div className="cdemo-frame">
          <div className="cdemo-chrome">
            <div className="cdemo-chrome-dot" style={{ background:'#ff5f57' }}/>
            <div className="cdemo-chrome-dot" style={{ background:'#ffbd2e' }}/>
            <div className="cdemo-chrome-dot" style={{ background:'#28ca41' }}/>
            <span className="cdemo-chrome-url">app.fireledger.app</span>
          </div>
          <div className="cdemo-frame-body"><SceneVisual sceneId={scene.id}/></div>
        </div>
        <div className="cdemo-dots">
          {DEMO_SCENES.map((_,i)=>(
            <button key={i} className={`cdemo-dot ${i===active?'active':''}`} onClick={()=>click(i)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Affiliate banner ────────────────────────────────────────────────────────
function AffiliateBanner() {
  return (
    <section className="affbanner-section">
      <div className="affbanner-inner">
        <div className="affbanner-left">
          <div className="affbanner-eyebrow">Affiliate program</div>
          <h2 className="affbanner-title">
            Know someone who needs this?<br/>
            <span className="affbanner-accent">Earn 30% for telling them.</span>
          </h2>
          <p className="affbanner-sub">Share your referral link. Earn 30% commission on every paying customer — monthly, annual, or lifetime. No cap. 90-day cookie window.</p>
          <div className="affbanner-stats">
            <div className="affbanner-stat"><span className="affbanner-stat-num" style={{ color:'#52c98a' }}>30%</span><span className="affbanner-stat-label">commission</span></div>
            <div className="affbanner-stat-div"/>
            <div className="affbanner-stat"><span className="affbanner-stat-num" style={{ color:'#a78bfa' }}>$18</span><span className="affbanner-stat-label">per annual referral</span></div>
            <div className="affbanner-stat-div"/>
            <div className="affbanner-stat"><span className="affbanner-stat-num" style={{ color:'#fbbf24' }}>90 days</span><span className="affbanner-stat-label">cookie window</span></div>
          </div>
        </div>
        <div className="affbanner-right">
          <div className="affbanner-card">
            <div className="affbanner-card-head">
              <span className="affbanner-card-title">Your affiliate dashboard</span>
              <span className="affbanner-card-badge">Preview</span>
            </div>
            <div className="affbanner-card-stats">
              {[{val:'$214',label:'total earned',color:'#52c98a'},{val:'14',label:'referrals',color:'#a78bfa'},{val:'8.3%',label:'conversion',color:'#fbbf24'}].map(s=>(
                <div key={s.label} className="affbanner-card-stat">
                  <span style={{ color:s.color,fontFamily:'Playfair Display,serif',fontSize:20,fontWeight:900 }}>{s.val}</span>
                  <span style={{ fontSize:10,color:'#55557a' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="affbanner-link-preview">
              <span style={{ fontSize:11,color:'#a78bfa',fontFamily:'monospace' }}>fire-ledger-web.vercel.app/?ref=YOURCODE</span>
            </div>
          </div>
          <a href="/affiliate" className="affbanner-cta">Create affiliate account →</a>
          <p className="affbanner-fine">Free to join · No minimum audience · Monthly payouts</p>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LANDING
// ══════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [showPopup,   setShowPopup]   = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [openFaq,     setOpenFaq]     = useState(null);
  const [email,       setEmail]       = useState('');
  const [waitlistMsg, setWaitlistMsg] = useState('');
  const [videoPlaying,setVideoPlaying]= useState(false);

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

  const handlePopupClose = () => { localStorage.setItem(POPUP_KEY,'1'); setShowPopup(false); };
  const scrollTo = (id) => { const el = document.getElementById(id); if(el) el.scrollIntoView({ behavior:'smooth' }); };

  const FAQS = [
    { q:'When can I actually stop working?', a:'That is exactly what FIRE Ledger tells you. Enter your current savings, annual expenses, and savings rate. The dashboard calculates your precise financial independence date using the 4% rule — the most widely accepted retirement research standard — and updates it every time you log a transaction.' },
    { q:'What are the different plans?', a:'Three plans. Lifetime ($5 once) — full access every session, no data stored between sessions. Monthly ($4.99/mo) and Annual ($59.99/yr) — your transactions, settings, and history are saved to the cloud and sync across devices.' },
    { q:'How is my freedom date calculated?', a:'Using the 4% rule: your FIRE number is annual expenses × 25. Portfolio growth is modelled at 7% annual return. The Monte Carlo simulation stress-tests this across 500 different market scenarios to give you a realistic range.' },
    { q:'Is this financial advice?', a:'FIRE Ledger is a financial planning and guidance tool — not personalised financial advice. All projections are illustrative estimates. Consult a qualified financial adviser for investment decisions.' },
    { q:'Is my financial data safe?', a:'Your data is stored on Supabase (AWS infrastructure), encrypted in transit and at rest using TLS and AES-256. We do not sell, share, or monetise your data. You can export or delete your data at any time.' },
    { q:'How does payment work?', a:'All payments are handled by Paddle — a regulated merchant of record operating in 200+ countries. We never see or store your card details. Accepted: Visa, Mastercard, American Express, PayPal.' },
    { q:'Can I import my bank data?', a:"Go to Export & Import → Smart Import. Download a CSV from your bank's website and upload it. The importer auto-detects column names, date formats, and debit/credit columns." },
    { q:'Can I cancel anytime?', a:"Yes. Cancel from your Paddle billing portal — no email required. Cancel within 48 hours of subscribing without using the data export feature and you are eligible for a full refund." },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose}/>}

      {/* ── NAV ── */}
      <nav className={`nav ${navScrolled?'nav-scrolled':''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Home</button>
          <button className="nav-link" onClick={()=>scrollTo('video')}>Demo</button>
          <button className="nav-link" onClick={()=>scrollTo('story')}>Our Story</button>
          <button className="nav-link" onClick={()=>scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={()=>scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={()=>scrollTo('faq')}>FAQ</button>
          <button className="nav-link" onClick={()=>scrollTo('contact')}>Contact</button>
          <button className="nav-link" onClick={()=>navigate('/affiliate#aff-apply')}>Affiliate</button>
        </div>
        <button className="nav-cta" onClick={()=>navigate('/signup')}>Let me join →</button>
        {!user && <button className="nav-signin" onClick={()=>navigate('/signin')}>Sign in</button>}
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
          <div className="grid-overlay"/>
        </div>
        <div className="hero-content">
          <div className="hero-badge">Your financial future starts with one number</div>
          <AnimatedHeroTitle/>
          <p className="hero-sub">
            Track the number that decides when work becomes optional.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={()=>navigate('/signup')}>Let me join →</button>
            <button className="btn-ghost" onClick={()=>scrollTo('video')}>Show me the demo</button>
          </div>
          <div className="hero-trust">
            <span>✓ Know your exact freedom date</span><span>·</span>
            <span>✓ See what every expense costs in years</span><span>·</span>
            <span>✓ Updated every time you log</span>
          </div>
          <div className="hero-stat-strip">
            <div className="hero-stat-item">
              <span className="hero-stat-num">62,400</span>
              <span className="hero-stat-label">average working hours in a lifetime — do you know how many you have left?</span>
            </div>
            <div className="hero-stat-div"/>
            <div className="hero-stat-item">
              <span className="hero-stat-num">25×</span>
              <span className="hero-stat-label">your annual expenses. That is your freedom number.</span>
            </div>
            <div className="hero-stat-div"/>
            <div className="hero-stat-item">
              <span className="hero-stat-num">10 years</span>
              <span className="hero-stat-label">earlier retirement for people who track versus those who do not</span>
            </div>
          </div>
          {/* Scroll arrow */}
          <div style={{ marginTop:8 }}>
            <ScrollArrow targetId="video"/>
          </div>
        </div>

        {/* Pain mockup */}
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
                <defs><linearGradient id="painGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#e05c5c"/>
                </linearGradient></defs>
              </svg>
              <div className="mockup-ring-text">
                <span className="mockup-pct" style={{ color:'#f87171' }}>12%</span>
                <span className="mockup-pct-label">to FIRE</span>
              </div>
            </div>
            <div className="mockup-pain-stats">
              <div className="mockup-pain-stat"><span className="mockup-pain-stat-val" style={{ color:'#f87171' }}>30 yrs</span><span className="mockup-pain-stat-label">until free</span></div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat"><span className="mockup-pain-stat-val" style={{ color:'#f87171' }}>D</span><span className="mockup-pain-stat-label">savings grade</span></div>
              <div className="mockup-pain-divider"/>
              <div className="mockup-pain-stat"><span className="mockup-pain-stat-val" style={{ color:'#fbbf24' }}>$986k</span><span className="mockup-pain-stat-label">FIRE gap</span></div>
            </div>
            <div className="mockup-pain-tip">
              <span style={{ color:'#f87171',fontWeight:700 }}>!</span>
              &nbsp;Dining out alone costs you <strong style={{ color:'#f87171' }}>4.2 years</strong> of your life. At this rate you retire at <strong style={{ color:'#f87171' }}>age 65.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO — directly below hero ── */}
      <section className="vsect-wrap" id="video">
        <div className="vsect-inner">
          <span className="section-eyebrow">See the product</span>
          <h2 className="section-title">Watch it work.</h2>
          <p className="section-sub">A full walkthrough of the dashboard — from logging your first transaction to seeing your exact freedom date.</p>
          <div className="vsect-player">
            {videoPlaying ? (
              <iframe className="vsect-iframe"
                src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1&showinfo=0&color=white`}
                title="FIRELedger Dashboard Walkthrough"
                allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>
            ) : (
              <div className="vsect-thumb" onClick={()=>setVideoPlaying(true)}>
                <img className="vsect-thumb-img" src={`https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`} alt="FIRELedger dashboard walkthrough" onError={e=>{e.target.style.display='none';}}/>
                <div className="vsect-thumb-overlay"/>
                <div className="vsect-play-wrap">
                  <div className="vsect-play-btn">
                    <div className="vsect-play-ring"/>
                    <svg width="26" height="30" viewBox="0 0 26 30" fill="none"><path d="M2 2l22 13L2 28V2z" fill="white"/></svg>
                  </div>
                  <span className="vsect-play-label">Watch the full walkthrough</span>
                  <span className="vsect-play-duration">FIRELedger · Dashboard Guide</span>
                </div>
                <div className="vsect-thumb-bar">
                  <div className="vsect-thumb-bar-left">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M15.68.72C15.5.05 14.96-.03 14.32.01 12.3.14 8 .14 8 .14S3.7.14 1.68.01C1.04-.03.5.05.32.72.11 1.53 0 3.06 0 6s.11 4.47.32 5.28c.18.67.72.75 1.36.71C3.7 11.86 8 11.86 8 11.86s4.3 0 6.32.13c.64.04 1.18-.04 1.36-.71C15.89 10.47 16 8.94 16 6s-.11-4.47-.32-5.28zM6.4 8.57V3.43L10.86 6 6.4 8.57z" fill="#FF0000"/></svg>
                    <span className="vsect-yt-label">YouTube · Unlisted</span>
                  </div>
                  <span className="vsect-yt-hint">Click to play</span>
                </div>
              </div>
            )}
          </div>
          {/* "I want in" CTA below video */}
          <div className="vsect-cta-row">
            <button className="btn-primary vsect-join-btn" onClick={()=>navigate('/signup')}>
              I want in →
            </button>
            <p className="vsect-cta-sub">Join free · No credit card · Choose your plan after</p>
          </div>
        </div>
      </section>

      {/* ── WHEN CAN YOU ACTUALLY STOP WORKING — replaces Before/After ── */}
      <section className="when-section">
        <div className="when-inner">
          <span className="section-eyebrow">The question no one answers</span>
          <h2 className="section-title">When can you actually<br/>stop working?</h2>
          <p className="section-sub" style={{ marginBottom:48 }}>
            Not when the government says you can. Not a vague number from a generic calculator.
            The real answer — based on what you actually earn, spend, and save right now.
          </p>
          <div className="when-grid">
            <div className="when-card when-without">
              <div className="when-card-label">Without a system</div>
              <div className="when-card-body">
                <div className="when-item">
                  <span className="when-item-icon">—</span>
                  <span>You guess your retirement age. You aim for 65 because that is what everyone else does.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon">—</span>
                  <span>You track nothing. Spending creeps up. Savings drift down. You feel it but can't quantify it.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon">—</span>
                  <span>Every discretionary expense is invisible. You don't know that your coffee habit is costing you 2 years.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon">—</span>
                  <span>You stay up at night wondering if you're on track. You have no way to know. So you scroll instead.</span>
                </div>
                <div className="when-verdict when-verdict-bad">You work until you're told you can stop.</div>
              </div>
            </div>
            <div className="when-card when-with">
              <div className="when-card-label when-card-label-good">With FIRE Ledger</div>
              <div className="when-card-body">
                <div className="when-item">
                  <span className="when-item-icon when-item-good">→</span>
                  <span>You see a precise date. Not 65. Your actual number, based on your actual life.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon when-item-good">→</span>
                  <span>Every transaction updates your timeline. You log a saving. The date moves closer. You feel it.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon when-item-good">→</span>
                  <span>The guidance layer surfaces what matters. You see that cutting one habit buys you 18 months of your life back.</span>
                </div>
                <div className="when-item">
                  <span className="when-item-icon when-item-good">→</span>
                  <span>You open the app on a Sunday night and instead of anxiety, you see progress. The number is there. You're ahead.</span>
                </div>
                <div className="when-verdict when-verdict-good">You stop working when you decide to.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section className="preview-section" id="preview">
        <div className="preview-section-inner">
          <span className="section-eyebrow">Inside the dashboard</span>
          <h2 className="section-title">Five views. One clear picture.</h2>
          <p className="section-sub">Click any scene to explore the dashboard, the timeline, and the guidance layer.</p>
          <ConsolidatedDemo/>
        </div>
      </section>

      {/* ── FOUNDER STORY — trust in the person ── */}
      <section className="story-section" id="story">
        <div className="story-inner">
          <span className="section-eyebrow">Trust in the person behind this</span>
          <h2 className="section-title">I built this because<br/><em>I couldn't find the answer myself.</em></h2>
          <div className="story-body">
            <p>A few years ago, I sat down and tried to answer a simple question: <strong>when can I actually stop working?</strong></p>
            <p>Not a vague number. Not a retirement calculator that assumed I'd spend 40 years at one salary. The real answer — based on what I actually earn, what I actually spend, and what I've actually saved.</p>
            <p>Every tool I found either required a finance degree to understand, gave me a number with no context, or was so generic it was useless. None of them told me whether I was on pace. None told me what my discretionary spending was costing me in years of my life.</p>
            <p>So I built FIRE Ledger. For myself. Then I realised others had been asking the same question for years — and had no honest answer. So I decided to share it.</p>
          </div>
          <div className="story-quote">
            <div className="story-quote-mark">"</div>
            <p className="story-quote-text">Most people will work until they're told they can stop — not because they have to, but because they never had a system that showed them exactly when they could walk away. FIRE Ledger changes that. It doesn't just tell you where you stand. It tells you what to do about it.</p>
            <div className="story-quote-author">
              <div className="story-quote-avatar">F</div>
              <div><div className="story-quote-name">Founder, FIRE Ledger</div></div>
            </div>
          </div>
          <div className="validation-card">
            <div className="validation-icon">✓</div>
            <div>
              <div className="validation-title">Validated by the FIRE community</div>
              <p className="validation-body">"This is what the FIRE community has been missing. Not another calculator — a system that holds you accountable to your own timeline and tells you exactly what needs to change."</p>
              <div className="validation-source">— Finance community feedback, March 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YOUR LIFE IN 6 MONTHS ── */}
      <section className="sixmonth-section">
        <div className="sixmonth-inner">
          <span className="section-eyebrow">What changes</span>
          <h2 className="section-title">Your life in six months.<br/>With financial clarity.</h2>
          <div className="sixmonth-grid">
            <div className="sixmonth-card sixmonth-before">
              <div className="sixmonth-label">Without clarity</div>
              <p className="sixmonth-body">
                Six months from now you will still be opening the same banking apps and feeling the same vague unease. You will have spent approximately $4,800 on things you cannot recall. Your savings rate will be what it was — somewhere, roughly, probably. You will have stayed up on at least a handful of Sunday nights wondering whether you are behind. You will have scrolled past content about financial independence and told yourself you will look into it next month. The date you could stop working will be exactly as unclear as it is today. And another six months will have passed.
              </p>
              <div className="sixmonth-footer sixmonth-footer-bad">Another six months behind where you could be.</div>
            </div>
            <div className="sixmonth-card sixmonth-after">
              <div className="sixmonth-label sixmonth-label-good">With FIRE Ledger</div>
              <p className="sixmonth-body">
                Six months from now you will have a number. A date. One that updates every time you log. You will have seen your freedom date move — maybe by weeks, maybe by months — because you caught a spending pattern before it compounded. You will open the app on a Sunday night and instead of anxiety you will see progress. You will know your savings rate, your grade, and exactly what the next best move is. The vague sense that you should be doing something will be replaced by the specific knowledge that you are. Six months of data is enough to change the trajectory of decades.
              </p>
              <div className="sixmonth-footer sixmonth-footer-good">Six months closer to the day you choose to stop.</div>
            </div>
          </div>
          <div style={{ textAlign:'center',marginTop:40 }}>
            <button className="btn-primary" onClick={()=>navigate('/signup')} style={{ fontSize:16,padding:'15px 36px' }}>
              Start the six months now →
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES — resold around outcomes ── */}
      <section className="features" id="features">
        <div className="features-inner">
          <span className="section-eyebrow">What is inside</span>
          <h2 className="section-title">Four tools built around<br/>one outcome: your freedom date.</h2>
          <p className="section-sub">Not features for features' sake. Each one exists to answer a single question: am I closer to the day I can stop working than I was yesterday?</p>
          <div className="features-grid">
            {[
              {
                icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'01',
                title:'Your Freedom Date',
                desc:'A precise date, not a range. Not a retirement age. The exact month and year you can stop working — calculated from your real income, spending, and savings, updated every time you log. This is the number everything else feeds into.',
              },
              {
                icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17L7.5 11l4 3L16 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                num:'02',
                title:'Your Financial Timeline',
                desc:'See the arc of your wealth from today to freedom. Your portfolio projected by age — at 35, 40, 45, whenever you cross the line. The path becomes visible. When you can see it, you can walk it.',
              },
              {
                icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M11 7v4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                num:'03',
                title:'Guidance That Tells You What to Change',
                desc:'Not just a warning — an instruction. The system identifies which habits are costing the most years and tells you exactly what to adjust. Cut this by half. Redirect that. Your date moves. You see it happen in real time.',
              },
              {
                icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h10M3 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                num:'04',
                title:'Live Transaction Tracking',
                desc:'Every income entry, every expense, every saving feeds directly into your timeline. This is what turns a calculator into a decision system. You stop guessing and start measuring — and measuring changes behaviour.',
              },
            ].map((f,i)=>(
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
          <h2 className="section-title">Three paths.<br/>One roadmap. Your future.</h2>
          <p className="section-sub">Start with $5 and know your FIRE date today. Upgrade when you are ready to track the full journey.</p>
          <div className="pricing-grid-3">
            <div className="pricing-card pricing-card-lifetime">
              <div className="pricing-badge-new">Lowest barrier</div>
              <div className="pricing-tier">Lifetime Access</div>
              <div className="pricing-price-row"><span className="price-amount">$5</span><span className="price-period"> once</span></div>
              <div className="pricing-storage-tag pricing-storage-session">⚡ Session only — no data stored</div>
              <p className="pricing-storage-note">Full access every session. Data clears when you close the tab. Perfect for running the numbers and knowing your FIRE date.</p>
              <ul className="pricing-features">
                <li>✓ Full FIRE calculator</li><li>✓ All 4 FIRE modes</li>
                <li>✓ Monte Carlo simulation</li><li>✓ Net Worth &amp; Projections</li>
                <li>✓ All insights &amp; guidance</li>
                <li className="pricing-feature-dim">✗ Data does not persist between sessions</li>
                <li className="pricing-feature-dim">✗ No cloud sync</li>
              </ul>
              <button className="btn-outline lp-pricing-btn" onClick={()=>navigate('/signup')}>Get started — $5 once →</button>
              <p className="lp-pricing-sub">One payment · Use forever</p>
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
              <button className="btn-outline lp-pricing-btn" onClick={()=>navigate('/signup')}>Start monthly — $4.99/mo →</button>
              <p className="lp-pricing-sub">Cancel anytime · No lock-in</p>
            </div>
            <div className="pricing-card pricing-card-annual featured">
              <div className="pricing-badge-new pricing-badge-best">Best value</div>
              <div className="pricing-tier">Annual</div>
              <div className="pricing-price-row"><span className="price-amount">$59.99</span><span className="price-period"> / year</span></div>
              <div className="pricing-equiv">Just $5/month · Save 16%</div>
              <div className="pricing-storage-tag pricing-storage-cloud">☁ Data saved to cloud</div>
              <p className="pricing-storage-note">Everything in Monthly, billed once a year. Best for tracking your FIRE journey long-term.</p>
              <ul className="pricing-features">
                <li>✓ Everything in Monthly</li><li>✓ Cloud data sync</li>
                <li>✓ Transaction history saved</li><li>✓ FIRE settings preserved</li>
                <li>✓ Smart CSV bank import</li><li>✓ Full data export</li>
                <li>✓ 48-hour refund guarantee</li>
              </ul>
              <button className="btn-primary lp-pricing-btn" style={{ justifyContent:'center' }} onClick={()=>navigate('/signup')}>Start annual — $59.99/yr →</button>
              <p className="lp-pricing-sub">Best value · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <span className="section-eyebrow">Common questions</span>
          <h2 className="section-title">Before you join</h2>
          <div className="faq-list">
            {FAQS.map((item,i)=>(
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  <span>{item.q}</span>
                  <span className="faq-chevron">{openFaq===i?'−':'+'}</span>
                </button>
                {openFaq===i && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST / MAILING LIST ── */}
      <section className="final-cta-section">
        <h2 className="final-cta-title">Stay ahead.<br/>Be first to know.</h2>
        <p className="final-cta-sub">
          Join the mailing list for early access to new features, beta tools, and model improvements before anyone else.
          No spam. No pressure. Just updates worth reading.
        </p>
        <div className="email-capture">
          <input type="email" placeholder="Your email address" className="email-input"
            value={email} onChange={e=>setEmail(e.target.value)}/>
          <button className="btn-primary" onClick={async()=>{
            if(!email){setWaitlistMsg('Enter your email');setTimeout(()=>setWaitlistMsg(''),5000);return;}
            const{error}=await supabase.from('waitlist').insert([{email}]);
            if(error){setWaitlistMsg('Something went wrong');}
            else{setWaitlistMsg('You are on the list. We will be in touch.');setEmail('');}
            setTimeout(()=>setWaitlistMsg(''),6000);
          }}>Keep me updated →</button>
          {waitlistMsg&&<div style={{ marginTop:8,fontSize:14,color:'#52c98a' }}>{waitlistMsg}</div>}
        </div>
        <p style={{ fontSize:12,color:'rgba(136,136,170,0.45)',marginTop:12 }}>Unsubscribe at any time. We never share your email.</p>
      </section>

      {/* ── AFFILIATE BANNER ── */}
      <AffiliateBanner/>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">FIRE<span>Ledger</span></div>
            <p>Built for people who want to retire early — not just dream about it.</p>
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
            <a href="https://x.com/Fireledger01" target="_blank" rel="noreferrer">X → @Fireledger01</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Affiliate</div>
            <a href="/affiliate">Join the program</a>
            <a href="/affiliate#aff-how">How it works</a>
            <a href="/affiliate#aff-apply">Create account</a>
            <a href="/affiliate/dashboard">Affiliate login</a>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Payment</div>
            <p style={{ fontSize:12,color:'#55557a',lineHeight:1.7 }}>All billing handled by <strong style={{ color:'#8888aa' }}>Paddle</strong> — a regulated merchant of record. We never store your card details.</p>
            <div className="footer-pay-logos">
              <span className="pay-logo">VISA</span><span className="pay-logo">MC</span>
              <span className="pay-logo">AMEX</span><span className="pay-logo pay-logo-paddle">Paddle</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FIRE Ledger · All rights reserved</span>
          <span className="footer-bottom-note">
            FIRE Ledger is a financial planning and educational tool provided for informational purposes only. It does not constitute financial advice, investment advice, or any regulated financial service. All projections and calculations are illustrative estimates based on user-provided data and established financial models. Past assumptions are not a guarantee of future results. Always consult a qualified, regulated financial adviser before making any investment or financial planning decisions. FIRE Ledger is not responsible for any financial decisions made based on information provided by this platform.
          </span>
        </div>
      </footer>
    </div>
  );
}
