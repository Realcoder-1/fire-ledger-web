import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';
import './Landing.css';

const LIFETIME_PRICE_ID = 'pri_01km5hzemdp93p7d4mgpky8qz0';
const MONTHLY_PRICE_ID  = 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID   = 'pri_01kkk544b2fntpj7s989ntee0x';
const PADDLE_TOKEN      = process.env.REACT_APP_PADDLE_TOKEN;

export default function Pricing() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [paddleReady, setPaddleReady] = useState(false);
  const [paddleError, setPaddleError] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon,      setCoupon]      = useState('');
  const [couponMsg,   setCouponMsg]   = useState('');
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
    if (window.Paddle) { init(); return; }
    const interval = setInterval(() => {
      if (window.Paddle) { clearInterval(interval); clearTimeout(timeout); init(); }
    }, 200);
    const timeout = setTimeout(() => { clearInterval(interval); setPaddleError(true); }, 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const applyCode = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCoupon(code); setCouponValid(true);
    setCouponMsg(`"${code}" applied — discount reflected at checkout.`);
  };
  const removeCode = () => { setCoupon(''); setCouponInput(''); setCouponMsg(''); setCouponValid(false); };

  const handleCheckout = (priceId, planKey) => {
    if (!paddleReady) { alert('Payment processor loading — try again in a moment.'); return; }
    setActivePlan(planKey);
    const opts = { items: [{ priceId, quantity: 1 }] };
    if (user?.email) opts.customer = { email: user.email };
    if (coupon && planKey !== 'lifetime') opts.discountCode = coupon;
    try {
      window.Paddle.Checkout.open(opts);
    } catch (err) {
      console.error('Checkout error:', err);
      setActivePlan(null);
      if (coupon) { removeCode(); alert('Discount code could not be applied. Please try again.'); }
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-bg">
        <div className="p-orb p-orb1" /><div className="p-orb p-orb2" />
      </div>

      <nav className="p-nav">
        <div className="p-nav-logo" style={{cursor:'pointer'}} onClick={() => navigate('/')}>FIRE<span>Ledger</span></div>
        {user
          ? <button className="p-signout" onClick={signOut}>Sign out</button>
          : <button className="p-signout" onClick={() => navigate('/signin')}>Sign in</button>
        }
      </nav>

      <div className="pricing-hero" style={{maxWidth:1000, width:'100%'}}>
        <div className="p-badge">Choose your plan</div>
        <h1>One tool.<br/><span>Three ways in.</span></h1>
        <p>Pick what works for you. Upgrade or cancel anytime.</p>

        {paddleError && (
          <div className="p-error-banner">
            ⚠ Payment processor failed to load. Please refresh and try again.
          </div>
        )}

        {/* ── SAME 3-CARD GRID AS LANDING ── */}
        <div className="pricing-grid-3" style={{marginTop:36}}>

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
              Full access every session. Data clears when you close the tab. Perfect for running your numbers and knowing your FIRE date.
            </p>
            <ul className="pricing-features">
              <li>✓ Full FIRE calculator</li>
              <li>✓ FIRE, Lean, Fat &amp; Coast modes</li>
              <li>✓ Monte Carlo simulation</li>
              <li>✓ Net Worth &amp; Projections</li>
              <li className="pricing-feature-dim">✗ Data does not persist</li>
              <li className="pricing-feature-dim">✗ No cloud sync</li>
            </ul>
            <button
              className={`pricing-pay-btn${activePlan==='lifetime'?' loading':''}`}
              onClick={() => handleCheckout(LIFETIME_PRICE_ID,'lifetime')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan==='lifetime' ? 'Opening checkout…' : 'Get lifetime access — $5 →'}
            </button>
            <p className="pricing-pay-sub">One payment · Use forever</p>
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
              Transactions, settings, and history saved permanently. Pick up exactly where you left off.
            </p>
            <ul className="pricing-features">
              <li>✓ Everything in Lifetime</li>
              <li>✓ Cloud data sync</li>
              <li>✓ Transaction history saved</li>
              <li>✓ Smart CSV bank import</li>
              <li>✓ Full data export</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button
              className={`pricing-pay-btn${activePlan==='monthly'?' loading':''}`}
              onClick={() => handleCheckout(MONTHLY_PRICE_ID,'monthly')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan==='monthly' ? 'Opening checkout…' : 'Start monthly — $4.99/mo →'}
            </button>
            <p className="pricing-pay-sub">Cancel anytime · No lock-in</p>
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
              Everything in Monthly, billed once a year. Best for tracking your FIRE journey long-term.
            </p>
            <ul className="pricing-features">
              <li>✓ Everything in Monthly</li>
              <li>✓ Cloud data sync</li>
              <li>✓ Transaction history saved</li>
              <li>✓ Smart CSV bank import</li>
              <li>✓ Full data export</li>
              <li>✓ 48-hour refund guarantee</li>
            </ul>
            <button
              className={`pricing-pay-btn pricing-pay-btn-featured${activePlan==='annual'?' loading':''}`}
              onClick={() => handleCheckout(ANNUAL_PRICE_ID,'annual')}
              disabled={!!activePlan || paddleError}
            >
              {activePlan==='annual' ? 'Opening checkout…' : 'Start annual — $59.99/yr →'}
            </button>
            <p className="pricing-pay-sub">Best value · Cancel anytime</p>
          </div>

        </div>

        {/* Discount code */}
        <div className="p-coupon-section" style={{marginTop:28}}>
          <p className="p-coupon-label">Have a discount code? (Monthly &amp; Annual only)</p>
          {!couponValid ? (
            <div className="p-coupon-row">
              <input className="p-coupon-input" type="text" placeholder="Enter code"
                value={couponInput} onChange={e => setCouponInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && applyCode()} />
              <button className="p-coupon-btn" onClick={applyCode}>Apply</button>
            </div>
          ) : (
            <div className="p-coupon-applied">
              <span className="p-coupon-check">✓</span>
              <span>{couponMsg}</span>
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
