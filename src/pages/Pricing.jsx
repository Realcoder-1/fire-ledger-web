import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

const LIFETIME_PRICE_ID = 'pri_01km5hzemdp93p7d4mgpky8qz0'; // $5 one-time
const MONTHLY_PRICE_ID  = 'pri_01kkk53619cxb49atjaykftcn7'; // $4.99/mo
const ANNUAL_PRICE_ID   = 'pri_01kkk544b2fntpj7s989ntee0x'; // $59.99/yr

const PADDLE_TOKEN = process.env.REACT_APP_PADDLE_TOKEN;

export default function Pricing() {
  const { user, signOut } = useAuth();
  const [paddleReady, setPaddleReady] = useState(false);
  const [paddleError, setPaddleError] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon,      setCoupon]      = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [activePlan,  setActivePlan]  = useState(null);

  useEffect(() => {
    const init = () => {
      if (!window.Paddle) { setPaddleError(true); return; }
      try {
        window.Paddle.Initialize({
          token: PADDLE_TOKEN,
          eventCallback: (e) => {
            if (e.name === 'checkout.completed') {
              setTimeout(() => { window.location.href = '/app'; }, 1500);
            }
          },
        });
        setPaddleReady(true);
      } catch (err) {
        console.error('Paddle init error:', err);
        setPaddleError(true);
      }
    };

    if (window.Paddle) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.Paddle) { clearInterval(interval); clearTimeout(timeout); init(); }
      }, 200);
      const timeout = setTimeout(() => {
        clearInterval(interval); setPaddleError(true);
      }, 8000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, []);

  const applyCode = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCoupon(code);
    setCouponValid(true);
  };

  const removeCode = () => {
    setCoupon('');
    setCouponInput('');
    setCouponValid(false);
  };

  const handleCheckout = (priceId, planKey) => {
    if (!paddleReady) {
      alert('Payment processor loading — please wait a moment and try again.');
      return;
    }
    setActivePlan(planKey);
    const opts = { items: [{ priceId, quantity: 1 }] };
    if (user?.email) opts.customer = { email: user.email };
    // Only apply discount to Monthly / Annual — not Lifetime
    if (coupon && planKey !== 'lifetime') opts.discountCode = coupon;

    try {
      window.Paddle.Checkout.open(opts);
    } catch (err) {
      console.error('Checkout error:', err);
      setActivePlan(null);
      if (coupon) {
        removeCode();
        alert('Discount code could not be applied. Please try again.');
      }
    }
    // Reset activePlan after a short delay so button doesn't stay stuck
    setTimeout(() => setActivePlan(null), 4000);
  };

  return (
    <div className="pricing-page">
      <div className="pricing-bg">
        <div className="p-orb p-orb1" /><div className="p-orb p-orb2" />
      </div>

      <nav className="p-nav">
        <div className="p-nav-logo">FIRE<span>Ledger</span></div>
        {user && <button className="p-signout" onClick={signOut}>Sign out</button>}
      </nav>

      <div className="pricing-hero">
        <div className="p-badge">Choose your plan</div>
        <h1>One tool.<br /><span>Three ways in.</span></h1>
        <p>Pick what works for you. Upgrade or cancel anytime.</p>

        {paddleError && (
          <div className="p-error-banner">
            ⚠ Payment processor failed to load. Please refresh the page and try again.
          </div>
        )}

        {/* ── 3-PLAN GRID — matches landing page visuals exactly ── */}
        <div className="p-plans-grid">

          {/* LIFETIME */}
          <div className="p-plan-card">
            <div className="p-plan-badge-top">Lowest barrier</div>
            <div className="p-plan-label">Lifetime Access</div>
            <div className="p-plan-price">
              <span className="p-amount">$5</span>
              <span className="p-period"> once</span>
            </div>
            <div className="p-plan-storage p-storage-session">⚡ Session only — no data stored</div>
            <p className="p-plan-note">
              Full access every session. Data clears when you close the tab. Perfect for
              running your numbers and knowing your FIRE date.
            </p>
            <ul className="p-plan-features">
              <li><span className="p-check">✓</span> Full FIRE calculator</li>
              <li><span className="p-check">✓</span> All 4 FIRE modes</li>
              <li><span className="p-check">✓</span> Monte Carlo simulation</li>
              <li><span className="p-check">✓</span> Net Worth &amp; Projections</li>
              <li><span className="p-check">✓</span> Compound Growth calculator</li>
              <li><span className="p-check p-cross">✗</span> Data does not persist between sessions</li>
              <li><span className="p-check p-cross">✗</span> No cloud sync</li>
            </ul>
            <button
              className={`p-plan-btn${activePlan === 'lifetime' ? ' loading' : ''}`}
              onClick={() => handleCheckout(LIFETIME_PRICE_ID, 'lifetime')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan === 'lifetime' ? 'Opening checkout…' : 'Get lifetime access — $5 →'}
            </button>
            <p className="p-plan-sub">One payment · Use forever</p>
          </div>

          {/* MONTHLY */}
          <div className="p-plan-card">
            <div className="p-plan-label">Monthly</div>
            <div className="p-plan-price">
              <span className="p-amount">$4.99</span>
              <span className="p-period"> / month</span>
            </div>
            <div className="p-plan-storage p-storage-cloud">☁ Data saved to cloud</div>
            <p className="p-plan-note">
              Transactions, settings, and history saved permanently. Pick up exactly where
              you left off every session.
            </p>
            <ul className="p-plan-features">
              <li><span className="p-check">✓</span> Everything in Lifetime</li>
              <li><span className="p-check">✓</span> Cloud data sync</li>
              <li><span className="p-check">✓</span> Transaction history saved</li>
              <li><span className="p-check">✓</span> FIRE settings preserved</li>
              <li><span className="p-check">✓</span> Smart CSV bank import</li>
              <li><span className="p-check">✓</span> Full data export</li>
              <li><span className="p-check">✓</span> Cancel anytime</li>
            </ul>
            <button
              className={`p-plan-btn${activePlan === 'monthly' ? ' loading' : ''}`}
              onClick={() => handleCheckout(MONTHLY_PRICE_ID, 'monthly')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan === 'monthly' ? 'Opening checkout…' : 'Start monthly — $4.99/mo →'}
            </button>
            <p className="p-plan-sub">Cancel anytime · No lock-in</p>
          </div>

          {/* ANNUAL */}
          <div className="p-plan-card p-plan-featured">
            <div className="p-plan-badge">Best value</div>
            <div className="p-plan-label">Annual</div>
            <div className="p-plan-price">
              <span className="p-amount">$59.99</span>
              <span className="p-period"> / year</span>
            </div>
            <div className="p-plan-equiv">Just $5/month · Save 16%</div>
            <div className="p-plan-storage p-storage-cloud">☁ Data saved to cloud</div>
            <p className="p-plan-note">
              Everything in Monthly, billed once a year. Best for tracking your FIRE
              journey long-term.
            </p>
            <ul className="p-plan-features">
              <li><span className="p-check">✓</span> Everything in Monthly</li>
              <li><span className="p-check">✓</span> Cloud data sync</li>
              <li><span className="p-check">✓</span> Transaction history saved</li>
              <li><span className="p-check">✓</span> FIRE settings preserved</li>
              <li><span className="p-check">✓</span> Smart CSV bank import</li>
              <li><span className="p-check">✓</span> Full data export</li>
              <li><span className="p-check">✓</span> 48-hour refund guarantee</li>
            </ul>
            <button
              className={`p-plan-btn p-plan-btn-featured${activePlan === 'annual' ? ' loading' : ''}`}
              onClick={() => handleCheckout(ANNUAL_PRICE_ID, 'annual')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan === 'annual' ? 'Opening checkout…' : 'Start annual — $59.99/yr →'}
            </button>
            <p className="p-plan-sub">Best value · Cancel anytime</p>
          </div>

        </div>

        {/* ── Discount code ── */}
        <div className="p-coupon-section">
          <p className="p-coupon-label">Have a discount code? (Monthly &amp; Annual only)</p>
          {!couponValid ? (
            <div className="p-coupon-row">
              <input
                className="p-coupon-input"
                type="text"
                placeholder="Enter code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && applyCode()}
              />
              <button className="p-coupon-btn" onClick={applyCode}>Apply</button>
            </div>
          ) : (
            <div className="p-coupon-applied">
              <div className="p-coupon-applied-left">
                <span className="p-coupon-check">✓</span>
                <span className="p-coupon-applied-text">Code "{coupon}" applied — discount reflected at checkout.</span>
              </div>
              <button className="p-coupon-remove" onClick={removeCode}>Remove</button>
            </div>
          )}
        </div>

        <p className="p-guarantee">🔒 Secure checkout via Paddle · Your card details never touch our servers</p>
        <div className="p-pay-logos">
          <span className="pay-logo">VISA</span>
          <span className="pay-logo">MC</span>
          <span className="pay-logo">AMEX</span>
          <span className="pay-logo">PayPal</span>
          <span className="pay-logo pay-logo-paddle">Paddle</span>
        </div>
      </div>
    </div>
  );
}
