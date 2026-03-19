import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

const POPUP_KEY  = 'fl_hours_popup_seen';
const TIMER_KEY  = 'fl_urgency_expires';
const TRIAL_MINS = 60;

function UrgencyTimer({ onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    let expiry = localStorage.getItem(TIMER_KEY);
    if (!expiry) { expiry = Date.now() + TRIAL_MINS * 60 * 1000; localStorage.setItem(TIMER_KEY, expiry); }
    const tick = () => { const left = Math.max(0, parseInt(expiry) - Date.now()); setTimeLeft(left); if (left === 0 && onExpire) onExpire(); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire]);
  if (timeLeft === null) return null;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const expired = timeLeft === 0;
  return (
    <div className="urgency-bar" style={{ background: expired ? 'rgba(224,92,92,0.1)' : 'rgba(251,191,36,0.07)', borderColor: expired ? 'rgba(224,92,92,0.3)' : 'rgba(251,191,36,0.2)' }}>
      <span className="urgency-dot" style={{ background: expired ? '#e05c5c' : '#fbbf24' }} />
      {expired
        ? <span>Free trial offer expired — <strong>standard pricing now applies</strong></span>
        : <span>Free trial expires in <strong style={{ fontFamily: 'monospace', color: mins < 5 ? '#e05c5c' : '#fbbf24' }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</strong> — start free, no card required</span>
      }
    </div>
  );
}

export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [showPopup,    setShowPopup]    = useState(false);
  const [navScrolled,  setNavScrolled]  = useState(false);
  const [openFaq,      setOpenFaq]      = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(POPUP_KEY)) { const t = setTimeout(() => setShowPopup(true), 3500); return () => clearTimeout(t); }
  }, []);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handlePopupClose = () => { localStorage.setItem(POPUP_KEY, '1'); setShowPopup(false); };
  const handleStart = () => { if (user) navigate('/app'); else signInWithGoogle(); };
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  const FAQS = [
    { q: 'Is the 7-day trial really free?', a: 'Yes. No credit card required. Sign in with Google and you have full access to every feature for 7 days. After that, $4.99/month or $59.99/year — less than one coffee per week.' },
    { q: 'How does FIRE Ledger calculate my retirement date?', a: 'Using the 4% rule — a standard from decades of retirement research. Your FIRE number is annual expenses × 25. Portfolio growth is modelled at 7% annual return. Monte Carlo runs 500 market scenarios to stress-test your plan.' },
    { q: 'Is my financial data safe?', a: 'Your data is stored on Supabase infrastructure (AWS), encrypted in transit and at rest. We do not sell or share your data with any third party, ever. You can export or delete everything at any time.' },
    { q: 'Should I treat this as financial advice?', a: 'No. FIRE Ledger is a financial planning and tracking tool. Projections are estimates based on your inputs and established financial models. For personalised investment guidance, consult a qualified financial adviser.' },
    { q: 'How do I import my bank transactions?', a: 'Export & Import → Smart Import. Download a CSV from your bank and upload it. The importer handles any column format, date style, or debit/credit structure automatically.' },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose} />}
      <UrgencyTimer onExpire={() => setTimerExpired(true)} />

      {/* NAV */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('story')}>Our Story</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
        </div>
        <button className="nav-cta" onClick={handleStart}>
          {timerExpired ? 'Get Started →' : 'Start Free Trial →'}
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">THE QUESTION NOBODY ASKS UNTIL IT'S TOO LATE</div>
          <h1 className="hero-title">
            You will work until<br />
            <span className="hero-accent">you die.</span>
          </h1>
          <p className="hero-sub">
            Unless you know this number. Most people never calculate it.<br />
            The ones who do retire a decade early.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              Find my number — it's free →
            </button>
            <button className="btn-secondary" onClick={() => scrollTo('story')}>
              Why we built this
            </button>
          </div>
          <div className="hero-trust">
            <span>✓ 7 days free</span>
            <span className="hero-trust-dot">·</span>
            <span>✓ No credit card</span>
            <span className="hero-trust-dot">·</span>
            <span>✓ Cancel anytime</span>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">90,000</span><span className="stat-label">Avg lifetime work hours</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">25×</span><span className="stat-label">Your FIRE target</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">4%</span><span className="stat-label">Safe withdrawal rate</span></div>
          </div>
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
                { label:'Salary',    amt:'+$5,200', type:'income' },
                { label:'Rent',      amt:'-$1,400', type:'need'   },
                { label:'Groceries', amt:'-$180',   type:'need'   },
                { label:'Netflix',   amt:'-$15',    type:'want'   },
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
            <p>Not "when does the government say I can retire." Not a vague number from a generic calculator assuming I'd spend my whole career at one salary. The real question — based on what I actually earn, what I actually spend, and what I've actually saved.</p>
            <p>Every tool I found either required a finance degree to understand, gave me a number with no context, or was so generic it was useless. None of them tracked whether I was on pace. None told me what my discretionary spending was costing me in years of my life.</p>
            <p>So I built FIRE Ledger. For myself. A system where I enter the numbers and get a date. And then track weekly whether I'm getting closer or further away. It occurred to me others might be going through the same thing.</p>
          </div>

          <div className="story-quote">
            <div className="story-quote-mark">"</div>
            <p className="story-quote-text">
              The question isn't whether you can retire early. It's whether you've ever actually run the numbers. Most people haven't — not because they don't want to, but because no one gave them a tool simple enough to do it in five minutes.
            </p>
            <div className="story-quote-author">
              <div className="story-quote-avatar">S</div>
              <div>
                <div className="story-quote-name">Saran</div>
                <div className="story-quote-role">Founder, FIRE Ledger</div>
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

      {/* FEATURES */}
      <section className="features" id="features">
        <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
        <div className="features-grid">
          {[
            { icon:'🔥', title:'Your Exact FIRE Date',       desc:'A precise date — not a vague range. Updated in real time as your income, spending and savings change.' },
            { icon:'⏱', title:'Working Hours Left',          desc:'Not years — hours. The number that makes your timeline concrete and the cost of inaction impossible to ignore.' },
            { icon:'📊', title:'Needs vs Wants',             desc:'See which spending categories are costing you years of freedom, broken down month by month.' },
            { icon:'📈', title:'Monte Carlo Simulation',     desc:'500 market scenarios stress-tested against your plan. Know the probability it holds before it matters.' },
            { icon:'💰', title:'Net Worth Tracker',          desc:'Assets minus liabilities — the only number that tells you where you actually stand.' },
            { icon:'🏦', title:'Smart Bank Import',          desc:'Upload any bank statement CSV. Auto-detects every format — no manual entry, no reformatting.' },
            { icon:'🤖', title:'Financial Guidance',         desc:'After every transaction batch, the app analyses your patterns and tells you what is costing you years.' },
            { icon:'🛤',  title:'FIRE, Lean, Fat & Coast',  desc:'Four retirement models — Standard FIRE, bare minimum, full lifestyle, and Coast FIRE.' },
          ].map((f,i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <h2 className="section-title">One plan.<br/>Everything included.</h2>
        {!timerExpired && (
          <div className="pricing-urgency">
            <span>🕐</span>
            <span>Free trial window is open — start now, no card required</span>
          </div>
        )}
        <div className="single-pricing">
          <div className="pricing-card featured">
            {!timerExpired && <div className="pricing-trial-badge">7 days free · No card needed</div>}
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
                <span className="price-save">Best value</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Your exact FIRE date — updated in real time</li>
              <li>✓ Working hours remaining counter</li>
              <li>✓ FIRE, Lean, Fat & Coast FIRE calculators</li>
              <li>✓ Monte Carlo simulation — 500 scenarios</li>
              <li>✓ Net Worth tracker & Compound Growth calculator</li>
              <li>✓ Financial guidance after every transaction</li>
              <li>✓ Smart bank statement import</li>
              <li>✓ Full data export — no lock-in</li>
              <li>✓ 48-hour money back guarantee</li>
            </ul>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleStart}>
              {timerExpired ? 'Get started →' : 'Start free — 7 days, no card →'}
            </button>
            <p style={{textAlign:'center',fontSize:13,color:'#8888aa',marginTop:12}}>
              Less than one coffee per week · Cancel anytime
            </p>
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
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section">
        <div className="problem-inner">
          <span className="section-eyebrow">The reality most people avoid</span>
          <h2 className="section-title">
            Most people will work until 65.<br/>
            <em>Not by choice —<br/>because they never ran the numbers.</em>
          </h2>
          <p className="problem-body">
            There is a precise point at which your investments generate enough income that work becomes optional. It has a date. It has a number. It is calculable right now. Most people never calculate it. FIRE Ledger exists for the ones who want to.
          </p>
          <button className="btn-primary" style={{marginTop:32}} onClick={handleStart}>
            Calculate mine — free →
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
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
        <p className="final-cta-sub">Most people go their whole careers without ever calculating it. You now have a tool that answers it in five minutes.</p>
        <button className="btn-primary" style={{fontSize:17,padding:'16px 40px'}} onClick={handleStart}>
          Find my number — free for 7 days →
        </button>
        <p style={{fontSize:12,color:'#8888aa',marginTop:12}}>No credit card · No commitment · Just the truth about your timeline</p>
      </section>

      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p>Built for people who want to retire early, not just dream about it.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/refund">Refund Policy</a>
          <a href="mailto:thimbleforgeapps@gmail.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
