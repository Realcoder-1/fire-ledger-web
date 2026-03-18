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
        <button className="nav-cta" onClick={handleStart}>Find my retirement date →</button>
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
              <span className="mockup-label">Your FIRE Dashboard</span>
              <span className="mockup-badge-danger">Action needed</span>
            </div>

            <div className="mockup-fire-date">
              <span className="mockup-fire-label">At your current rate, you retire at</span>
              <span className="mockup-fire-age">Age 67</span>
              <span className="mockup-fire-sub">That's 31 years from now</span>
            </div>

            <div className="mockup-stats">
              <div className="mockup-stat">
                <span className="mockup-stat-label">Savings grade</span>
                <span className="mockup-stat-val danger">D</span>
              </div>
              <div className="mockup-stat">
                <span className="mockup-stat-label">Years lost to wants</span>
                <span className="mockup-stat-val danger">8.2 yrs</span>
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

            <div className="mockup-cta-hint">
              See your real numbers →
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
        <div className="features-grid">
          {[
            { icon: '📅', title: 'Your FIRE Date',      desc: 'See the exact date you stop working — updated in real time as your numbers change.' },
            { icon: '📊', title: 'Needs vs Wants',      desc: 'See exactly which expenses are costing you years of freedom — not just dollars.' },
            { icon: '📈', title: 'Monte Carlo',         desc: '500 market simulations. Know if your plan survives a crash before it\'s too late.' },
            { icon: '💰', title: 'Net Worth Tracker',   desc: 'The number that actually tells you where you stand. Not income — net worth.' },
            { icon: '📉', title: 'Compound Growth',     desc: 'See how time is either working for you or against you — every single day.' },
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
              <li>✓ FIRE, Lean, Fat & Coast FIRE calculators</li>
              <li>✓ Monte Carlo simulation — stress test your plan</li>
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
              Find my retirement date — free →
            </button>
            <p className="pricing-fine">
              No credit card required · Cancel anytime · Less than one coffee a week
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
