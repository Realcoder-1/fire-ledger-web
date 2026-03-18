import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

export default function Landing() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [popupDone, setPopupDone] = useState(false);

  const handleStart = () => {
    if (user) navigate('/app');
    else signInWithGoogle();
  };

  return (
    <div className="landing">

      {!popupDone && <HoursPopup onClose={() => setPopupDone(true)} />}

      <nav className="nav">
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <button className="nav-cta" onClick={handleStart}>
          Find your retirement date →
        </button>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="orb orb3" />
          <div className="grid-overlay" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            MOST PEOPLE NEVER CALCULATE THIS
          </div>

          <h1 className="hero-title">
            You’ll work longer than you think.<br />
            <span className="hero-accent">Unless you change the math.</span>
          </h1>

          <p className="hero-sub">
            Your retirement isn’t based on age — it’s based on numbers.<br />
            Most people guess. The ones who calculate retire earlier.<br />
            Find yours in under a minute.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              Find your number — free →
            </button>
          </div>

          <div className="hero-trust">
            <span>No credit card</span>
            <span>·</span>
            <span>No commitment</span>
            <span>·</span>
            <span>Real projections</span>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">90,000</span>
              <span className="stat-label">Lifetime work hours</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">25×</span>
              <span className="stat-label">FIRE target multiple</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">Free</span>
              <span className="stat-label">To calculate yours</span>
            </div>
          </div>

          <p className="hero-disclaimer">
            * FIRE Ledger provides estimates based on your inputs. This is not financial advice.
          </p>
        </div>

        {/* 🔥 IMPROVED MOCKUP */}
        <div className="hero-mockup">
          <div className="mockup-card">

            <div className="mockup-header">
              <span className="mockup-label">FIRE Projection</span>
              <span className="mockup-badge-danger">Behind target</span>
            </div>

            <div className="mockup-fire-date">
              <span className="mockup-fire-label">
                Estimated retirement
              </span>

              <span className="mockup-fire-age">
                Age 67
              </span>

              {/* ✅ FIXED YEARS + HOURS */}
              <span className="mockup-fire-sub">
                31 years (64,480 hrs remaining)
              </span>
            </div>

            <div className="mockup-stats">
              <div className="mockup-stat">
                <span className="mockup-stat-label">Savings rate</span>
                <span className="mockup-stat-val warning">11%</span>
              </div>

              <div className="mockup-stat">
                <span className="mockup-stat-label">FIRE progress</span>
                <span className="mockup-stat-val good">14%</span>
              </div>

              <div className="mockup-stat">
                <span className="mockup-stat-label">Years lost</span>
                <span className="mockup-stat-val danger">8.2 yrs</span>
              </div>

              <div className="mockup-stat">
                <span className="mockup-stat-label">Projection grade</span>
                <span className="mockup-stat-val danger">D</span>
              </div>
            </div>

            <div className="mockup-cta-hint">
              View full dashboard →
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES unchanged (already good) */}
      <section className="features">
        <h2 className="section-title">
          Everything you need.<br/>Nothing you don’t.
        </h2>

        <div className="features-grid">
          {[
            { title: 'Your Exact FIRE Date', desc: 'See the precise date you stop working — updated in real time.' },
            { title: 'Needs vs Wants', desc: 'Understand what’s actually delaying your freedom.' },
            { title: 'Monte Carlo Simulation', desc: 'Test your plan against real market scenarios.' },
            { title: 'Net Worth Tracker', desc: 'Track the number that actually matters.' },
            { title: 'Compound Growth', desc: 'See how time impacts your trajectory daily.' },
            { title: 'Smart Import', desc: 'Upload statements and categorize instantly.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-dash">—</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING unchanged */}
      <section className="pricing" id="pricing">
        <h2 className="section-title">
          One number stands between you<br/>and financial independence.
        </h2>

        <p className="pricing-sub">
          Most people never calculate it. You can.
        </p>

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
              <li>Real-time FIRE projections</li>
              <li>Multiple FIRE strategies</li>
              <li>Monte Carlo simulation</li>
              <li>Net worth tracking</li>
              <li>Smart import tools</li>
            </ul>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleStart}
            >
              Find your retirement date — free →
            </button>

            <p className="pricing-fine">
              No credit card required · Cancel anytime
            </p>

          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p>Built for people who want control over their time.</p>

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