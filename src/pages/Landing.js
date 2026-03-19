import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

const POPUP_KEY = 'fl_hours_popup_seen';

export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup]   = useState(false);
  const [openFaq,   setOpenFaq]     = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(POPUP_KEY)) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePopupClose = () => {
    localStorage.setItem(POPUP_KEY, '1');
    setShowPopup(false);
  };

  const handleStart = () => {
    if (user) navigate('/app');
    else signInWithGoogle();
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const FAQS = [
    {
      q: 'Is my financial data safe?',
      a: 'Yes. Your data is stored on Supabase, which runs on AWS infrastructure with encryption in transit and at rest. We never sell or share your data. You can export or delete it at any time.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'Payments are processed by Paddle — a globally trusted payment provider used by thousands of software companies. Paddle accepts all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay where available. You can verify Paddle\'s credentials at paddle.com.',
    },
    {
      q: 'How does FIRE Ledger calculate my retirement date?',
      a: 'We use the 4% rule — a widely cited retirement research standard. Your FIRE number is your annual expenses × 25. We then model portfolio growth at a conservative 7% annual return against your current savings and annual contributions to project when you\'ll cross that number.',
    },
    {
      q: 'What happens to my data if I cancel?',
      a: 'Your data stays intact for 30 days after cancellation in case you return. After that, you can request full deletion by emailing thimbleforgeapps@gmail.com. We do not retain financial data beyond that window.',
    },
    {
      q: 'Is this financial advice?',
      a: 'No. FIRE Ledger is a planning and tracking tool. The projections are estimates based on your inputs and standard models. For regulated financial advice, please consult a qualified financial adviser.',
    },
    {
      q: 'Can I trust the projections?',
      a: 'The projections are based on the same models used by financial planners worldwide — the 4% rule and 7% real return assumption. They are estimates, not guarantees, and are most useful as a directional guide. Markets vary. Life changes. The projections update in real time as your numbers change.',
    },
    {
      q: 'How do I import my bank transactions?',
      a: 'Go to Export & Import → Smart Import. Download a CSV from your bank\'s website and upload it. The importer automatically detects column formats, date styles, and debit/credit splits — no reformatting needed.',
    },
    {
      q: 'Still have questions?',
      a: 'Email us at thimbleforgeapps@gmail.com, DM on Twitter/X @Fireledger01, or Instagram @fire_ledger. We respond within 24 hours.',
    },
  ];

  return (
    <div className="landing">
      {showPopup && <HoursPopup onClose={handlePopupClose} />}

      {/* ── NAVIGATION ─────────────────────────────────── */}
      <nav className={`nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>

        {/* Horizontal section links */}
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('faq')}>FAQ</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button>
          <a className="nav-link nav-link-social" href="https://x.com/Fireledger01" target="_blank" rel="noopener noreferrer" title="Twitter / X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a className="nav-link nav-link-social" href="https://www.instagram.com/fire_ledger/" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
        </div>

        <button className="nav-cta" onClick={handleStart}>Find my retirement date →</button>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="orb orb3" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">THE QUESTION NOBODY ASKS UNTIL IT'S TOO LATE</div>
          <h1 className="hero-title">
            You will work until<br />
            <span className="hero-accent">you die.</span>
          </h1>
          <p className="hero-sub">
            Unless you know this number.<br />
            Most people never calculate it. The ones who do retire a decade early.<br />
            Find yours in 60 seconds — free.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              Find my number — it's free →
            </button>
          </div>
          <div className="hero-trust">
            <span>✓ No credit card</span>
            <span>·</span>
            <span>✓ No commitment</span>
            <span>·</span>
            <span>✓ Just the truth about your timeline</span>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">4%</span>
              <span className="stat-label">Safe withdrawal rule</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">25×</span>
              <span className="stat-label">Your FIRE number</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">Free</span>
              <span className="stat-label">To get started</span>
            </div>
          </div>
          <p className="hero-disclaimer">
            * FIRE Ledger is a financial planning tool for informational purposes only. Projections are estimates based on your inputs and do not constitute financial advice. Past market performance does not guarantee future results. Consult a qualified financial advisor before making investment decisions.
          </p>
        </div>

        <div className="hero-mockup">
          <div className="mockup-card">
            <div className="mockup-header">
              <span className="mockup-label">Your FIRE Dashboard</span>
              <span className="mockup-badge-danger">Action needed</span>
            </div>
            <div className="mockup-fire-date">
              <span className="mockup-fire-label">At your current rate, you retire at</span>
              <span className="mockup-fire-age">Age 67</span>
              <span className="mockup-fire-sub">That's 31 years — 64,480 hours — from now</span>
            </div>
            <div className="mockup-stats">
              <div className="mockup-stat">
                <span className="mockup-stat-label">Savings grade</span>
                <span className="mockup-stat-val danger">D</span>
              </div>
              <div className="mockup-stat">
                <span className="mockup-stat-label">Hours left to work</span>
                <span className="mockup-stat-val danger">64,480</span>
              </div>
              <div className="mockup-stat">
                <span className="mockup-stat-label">Savings rate</span>
                <span className="mockup-stat-val warning">11%</span>
              </div>
              <div className="mockup-stat">
                <span className="mockup-stat-label">FIRE progress</span>
                <span className="mockup-stat-val good">14%</span>
              </div>
            </div>
            <div className="mockup-cta-hint">See your real numbers →</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="features" id="features">
        <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
        <div className="features-grid">
          {[
            { icon: '📅', title: 'Your FIRE Date',      desc: 'See the exact date you stop working — updated in real time as your numbers change.' },
            { icon: '⏱',  title: 'Hours Left to Work',  desc: 'Not years. Hours. The number that makes it real — calculated from your savings rate and withdrawal target.' },
            { icon: '📊', title: 'Needs vs Wants',      desc: 'See exactly which expenses are costing you years of freedom — not just dollars.' },
            { icon: '📈', title: 'Monte Carlo',         desc: '500 market simulations. Know if your plan survives a crash before it\'s too late.' },
            { icon: '💰', title: 'Net Worth Tracker',   desc: 'The number that actually tells you where you stand. Not income — net worth.' },
            { icon: '💾', title: 'Smart Import',        desc: 'Import any bank statement in seconds. The truth about your spending, instantly.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section className="pricing" id="pricing">
        <h2 className="section-title">One number stands between you<br/>and never working again.</h2>
        <p className="pricing-sub">Most people spend 40 years finding out too late. You don't have to.</p>
        <div className="single-pricing">
          <div className="pricing-card featured">
            <div className="pricing-badge">Free to Start</div>
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
              <li>✓ Hours left to work — the number that changes behaviour</li>
              <li>✓ FIRE, Lean, Fat & Coast FIRE calculators</li>
              <li>✓ Monte Carlo simulation — stress test your plan</li>
              <li>✓ Net Worth & Compound Growth tools</li>
              <li>✓ Smart CSV & PDF import</li>
              <li>✓ AI-powered guidance after every transaction</li>
              <li>✓ Android app included</li>
              <li>✓ 48-hour money back guarantee</li>
            </ul>

            {/* Payment trust logos */}
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

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleStart}
            >
              Find my retirement date — free →
            </button>
            <p className="pricing-fine">
              No credit card required · Cancel anytime · Less than one coffee a week
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="faq-header">
            <div className="faq-badge">BEFORE YOU SIGN UP</div>
            <h2 className="section-title" style={{textAlign:'left',marginBottom:8}}>
              The questions worth asking<br/><span className="faq-title-accent">before trusting anyone with your finances.</span>
            </h2>
            <p className="faq-intro">
              We answer them here — honestly. If something's missing, contact us directly. Response within 24 hours, always.
            </p>
          </div>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="faq-a">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-badge">REAL PERSON. REAL RESPONSES.</div>
          <h2 className="contact-title">Talk to the founder</h2>
          <p className="contact-sub">
            This is a solo product. Every message goes directly to me. If something's broken, unclear, or you just want to say hi — reach out. I read everything.
          </p>
          <div className="contact-channels">
            <a href="mailto:thimbleforgeapps@gmail.com" className="contact-channel">
              <span className="contact-ch-icon">✉</span>
              <div>
                <span className="contact-ch-label">Email</span>
                <span className="contact-ch-value">thimbleforgeapps@gmail.com</span>
              </div>
            </a>
            <a href="https://x.com/Fireledger01" target="_blank" rel="noopener noreferrer" className="contact-channel">
              <span className="contact-ch-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </span>
              <div>
                <span className="contact-ch-label">Twitter / X</span>
                <span className="contact-ch-value">@Fireledger01</span>
              </div>
            </a>
            <a href="https://www.instagram.com/fire_ledger/" target="_blank" rel="noopener noreferrer" className="contact-channel">
              <span className="contact-ch-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </span>
              <div>
                <span className="contact-ch-label">Instagram</span>
                <span className="contact-ch-value">@fire_ledger</span>
              </div>
            </a>
          </div>
          <p className="contact-response">Response time: within 24 hours</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p>Built for people who want to retire early, not just dream about it.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/refund">Refund Policy</a>
          <a href="mailto:thimbleforgeapps@gmail.com">Contact</a>
          <a href="https://x.com/Fireledger01" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://www.instagram.com/fire_ledger/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} FIRELedger. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
