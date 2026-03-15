import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

const MONTHLY_PRICE_ID = 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID  = 'pri_01kkk544b2fntpj7s989ntee0x';

export default function Pricing() {
  const { user, signOut } = useAuth();
  const [billing,      setBilling]     = useState('annual');
  const [couponInput,  setCouponInput] = useState('');
  const [coupon,       setCoupon]      = useState('');
  const [couponMsg,    setCouponMsg]   = useState('');
  const [couponValid,  setCouponValid] = useState(false);

  const applyCode = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCoupon(code);
    setCouponValid(true);
    setCouponMsg(`Code "${code}" applied — discount will be reflected at checkout.`);
  };

  const removeCode = () => {
    setCoupon('');
    setCouponInput('');
    setCouponMsg('');
    setCouponValid(false);
  };

  const handleCheckout = async (priceId) => {
    if (!window.Paddle) return alert('Paddle not loaded yet, please try again.');

    const checkoutOptions = {
      items: [{ priceId, quantity: 1 }],
      customer: { email: user?.email },
      successUrl: window.location.origin + '/app',
    };

    // Paddle v2 — discountCode passed at top level
    if (coupon) {
      checkoutOptions.discountCode = coupon;
    }

    try {
      window.Paddle.Checkout.open(checkoutOptions);
    } catch (err) {
      console.error('Paddle checkout error:', err);
      // If discount code caused the error, retry without it
      if (coupon) {
        setCouponValid(false);
        setCoupon('');
        setCouponMsg('');
        setCouponInput('');
        alert('Discount code could not be applied. Please check the code and try again.');
      }
    }
  };

  const monthly = billing === 'monthly';

  return (
    <div className="pricing-page">
      <div className="pricing-bg">
        <div className="p-orb p-orb1" />
        <div className="p-orb p-orb2" />
      </div>
      <nav className="p-nav">
        <div className="p-nav-logo">FIRE<span>Ledger</span></div>
        <button className="p-signout" onClick={signOut}>Sign out</button>
      </nav>
      <div className="pricing-hero">
        <div className="p-badge">One step away</div>
        <h1>Unlock your path to<br /><span>financial freedom</span></h1>
        <p>Join thousands tracking their FIRE journey. Cancel anytime.</p>

        <div className="billing-toggle">
          <button
            className={monthly ? 'active' : ''}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={!monthly ? 'active' : ''}
            onClick={() => setBilling('annual')}
          >
            Annual
          </button>
        </div>

        <div className="p-card">
          <div className="p-card-header">
            <div>
              <div className="p-tier">FIRE Ledger Pro</div>
              <div className="p-price">
                {monthly
                  ? <><span className="p-amount">$4.99</span><span className="p-period">/month</span></>
                  : <><span className="p-amount">$59.99</span><span className="p-period">/year</span></>
                }
              </div>
              {!monthly && <div className="p-equiv">Just $5/month</div>}
            </div>
            <div className="p-flame">🔥</div>
          </div>

          <div className="p-features">
            {[
              'Full transaction history — unlimited',
              'Real-time FIRE calculator & projections',
              'Needs vs Wants breakdown',
              'Recurring transaction tracking',
              'Advanced insights & savings rate',
              'Custom categories',
              'CSV data export',
              'Android app included',
              '48-hour money back guarantee',
            ].map((f, i) => (
              <div key={i} className="p-feature">
                <span className="p-check">✓</span>
                {f}
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div className="p-coupon">
            {!couponValid ? (
              <div className="p-coupon-row">
                <input
                  className="p-coupon-input"
                  type="text"
                  placeholder="Have a discount code?"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyCode(); }}
                />
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

          <button
            className="p-cta"
            onClick={() => handleCheckout(monthly ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID)}
          >
            Start My FIRE Journey
            <span className="p-cta-arrow">→</span>
          </button>
          <p className="p-guarantee">🔒 Secure checkout · 48-hour refund · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
