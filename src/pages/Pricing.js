import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

const MONTHLY_PRICE_ID = 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID = 'pri_01kkk544b2fntpj7s989ntee0x';

export default function Pricing() {
  const { user, signOut } = useAuth();
  const [billing, setBilling] = useState('annual');

  const handleCheckout = async (priceId) => {
    if (!window.Paddle) return alert('Paddle not loaded yet, please try again.');
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: user?.email },
      successUrl: window.location.origin + '/app',
    });
  };

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
          <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>Monthly</button>
          <button className={billing === 'annual' ? 'active' : ''} onClick={() => setBilling('annual')}>
            Annual <span className="save-badge">Save 33%</span>
          </button>
        </div>

        <div className="p-card">
          <div className="p-card-header">
            <div>
              <div className="p-tier">FIRE Ledger Pro</div>
              <div className="p-price">
                {billing === 'monthly' ? <><span className="p-amount">$4.99</span><span className="p-period">/month</span></> : <><span className="p-amount">$39.99</span><span className="p-period">/year</span></>}
              </div>
              {billing === 'annual' && <div className="p-equiv">Just $3.33/month</div>}
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
              '7-day money back guarantee',
            ].map((f, i) => (
              <div key={i} className="p-feature">
                <span className="p-check">✓</span>
                {f}
              </div>
            ))}
          </div>

          <button className="p-cta" onClick={() => handleCheckout(billing === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID)}>
            Start My FIRE Journey
            <span className="p-cta-arrow">→</span>
          </button>
          <p className="p-guarantee">🔒 Secure checkout · 7-day refund · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
