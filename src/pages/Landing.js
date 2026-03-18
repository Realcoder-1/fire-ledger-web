import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) navigate('/app');
    else signInWithGoogle();
  };

  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <button className="nav-cta" onClick={handleStart}>Get Started Free →</button>
      </nav>

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
              <span className="mockup-label">FIRE Progress</span>
              <span className="mockup-years">12.4 yrs away</span>
            </div>
            <div className="mockup-ring-wrap">
              <svg viewBox="0 0 120 120" className="mockup-ring">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#fireGrad)" strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset="188" strokeLinecap="round"
                  transform="rotate(-90 60 60)"/>
                <defs>
                  <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a78bfa"/>
                    <stop offset="100%" stopColor="#f472b6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="mockup-ring-text">
                <span className="mockup-pct">40%</span>
                <span className="mockup-pct-label">to FIRE</span>
              </div>
            </div>
            <div className="mockup-transactions">
              {[
                { label: 'Salary',    amt: '+$5,200', type: 'income' },
                { label: 'Rent',      amt: '-$1,400', type: 'need'   },
                { label: 'Groceries', amt: '-$180',   type: 'need'   },
                { label: 'Netflix',   amt: '-$15',    type: 'want'   },
              ].map((t, i) => (
                <div key={i} className="mockup-tx">
                  <span className="mockup-tx-label">{t.label}</span>
                  <span className={`mockup-tx-amt ${t.type}`}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
        <div className="features-grid">
          {[
            { icon: '🔥', title: 'FIRE Calculator',    desc: 'Real-time projection of your financial independence date — Standard, Lean, Fat, and Coast FIRE modes.' },
            { icon: '📊', title: 'Needs vs Wants',     desc: 'Categorize every expense. See exactly where your money leaks and where it builds wealth.' },
            { icon: '📈', title: 'Monte Carlo',        desc: '500 simulations of your portfolio. See your probability of reaching FIRE under real market conditions.' },
            { icon: '💰', title: 'Net Worth Tracker',  desc: 'Assets vs liabilities. Know your real financial picture and how close you are to your FIRE number.' },
            { icon: '📉', title: 'Compound Growth',    desc: 'See exactly how your investments compound over time with inflation adjustment and Rule of 72.' },
            { icon: '💾', title: 'Smart Import',       desc: 'Import any bank statement CSV or PDF. Auto-detects formats — no reformatting needed.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing" id="pricing">
        <h2 className="section-title">Start free.<br/>Upgrade when you're ready.</h2>
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
              <li>✓ Unlimited transaction history</li>
              <li>✓ FIRE, Lean, Fat & Coast FIRE calculators</li>
              <li>✓ Monte Carlo simulation</li>
              <li>✓ Net Worth & Compound Growth tools</li>
              <li>✓ Smart CSV & PDF import</li>
              <li>✓ Custom categories</li>
              <li>✓ Android app included</li>
              <li>✓ 48-hour money back guarantee</li>
            </ul>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleStart}
            >
              Get Started Free →
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#8888aa', marginTop: 12 }}>
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p>Built for people who want to retire early, not just dream about it.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/refund">Refund Policy</a>
          <a href="mailto:support@fireledger.app">Contact</a>
        </div>
      </footer>
    </div>
  );
}
