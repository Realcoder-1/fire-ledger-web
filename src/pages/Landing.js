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
        <button className="nav-cta" onClick={handleStart}>
          {user ? 'Open App' : 'Get Started Free'}
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
          <div className="hero-badge">Financial Independence · Retire Early</div>
          <h1 className="hero-title">
            Know exactly when<br />
            <span className="hero-accent">you're free.</span>
          </h1>
          <p className="hero-sub">
            Track every dollar. Watch your FIRE number shrink.<br />
            The only finance app built for people who want out.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleStart}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5Z" fill="white" fillOpacity="0.2"/>
                <path d="M7.125 6L11.625 9L7.125 12V6Z" fill="white"/>
              </svg>
              Start Tracking Free
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('pricing').scrollIntoView({behavior:'smooth'})}>
              See Pricing
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">4%</span><span className="stat-label">Safe withdrawal rule</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">25×</span><span className="stat-label">Your FIRE number</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">∞</span><span className="stat-label">Years reclaimed</span></div>
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
                { label: 'Salary', amt: '+$5,200', type: 'income' },
                { label: 'Rent', amt: '-$1,400', type: 'need' },
                { label: 'Groceries', amt: '-$180', type: 'need' },
                { label: 'Netflix', amt: '-$15', type: 'want' },
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
            { icon: '🔥', title: 'FIRE Calculator', desc: 'Real-time projection of your financial independence date based on your actual spending.' },
            { icon: '📊', title: 'Needs vs Wants', desc: 'Categorize every expense. See exactly where your money leaks and where it builds wealth.' },
            { icon: '🔄', title: 'Recurring Tracking', desc: 'Auto-log subscriptions and recurring expenses. Never miss a drain on your FIRE timeline.' },
            { icon: '📈', title: 'Savings Rate', desc: 'Your most important metric. Track it daily, weekly, monthly — watch freedom approach.' },
            { icon: '💾', title: 'CSV Export', desc: 'Your data, always yours. Export everything, analyze in Excel, share with your advisor.' },
            { icon: '🎯', title: 'Custom Categories', desc: 'Build a system that reflects your life. Every category tuned to your FIRE strategy.' },
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
        <h2 className="section-title">Simple pricing.<br/>Serious results.</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">$0<span>/mo</span></div>
            <ul className="pricing-features">
              <li>✓ Transaction logging</li>
              <li>✓ Basic FIRE calculation</li>
              <li>✓ 3 months history</li>
              <li>✓ Needs vs Wants split</li>
              <li className="disabled">✗ Full history</li>
              <li className="disabled">✗ Advanced insights</li>
              <li className="disabled">✗ CSV export</li>
            </ul>
            <button className="btn-outline" onClick={handleStart}>Start Free</button>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-tier">Pro</div>
            <div className="pricing-price">$4.99<span>/mo</span></div>
            <ul className="pricing-features">
              <li>✓ Everything in Free</li>
              <li>✓ Unlimited history</li>
              <li>✓ Advanced FIRE insights</li>
              <li>✓ CSV export</li>
              <li>✓ Recurring transactions</li>
              <li>✓ Custom categories</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="btn-primary" onClick={handleStart}>Go Pro</button>
          </div>
          <div className="pricing-card">
            <div className="pricing-tier">Annual</div>
            <div className="pricing-price">$39.99<span>/yr</span></div>
            <div className="pricing-save">Save 33%</div>
            <ul className="pricing-features">
              <li>✓ Everything in Pro</li>
              <li>✓ Best value</li>
              <li>✓ Early access features</li>
              <li>✓ Android app included</li>
            </ul>
            <button className="btn-outline" onClick={handleStart}>Go Annual</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">FIRE<span>Ledger</span></div>
        <p>Built for people who want to retire early, not just dream about it.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="mailto:support@fireledger.app">Contact</a>
        </div>
      </footer>
    </div>
  );
}
