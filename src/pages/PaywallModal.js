import { useNavigate } from 'react-router-dom';
import './PaywallModal.css';

/**
 * PaywallModal
 *
 * Props:
 *   feature     – string, the locked feature name e.g. "Monte Carlo"
 *   yearsToFire – number | null, passed in so we can personalise the hook
 *   onClose     – () => void
 */
export default function PaywallModal({ feature, yearsToFire, onClose }) {
  const navigate = useNavigate();

  const hook = yearsToFire != null && isFinite(yearsToFire)
    ? `You're ${yearsToFire} years from financial freedom.`
    : `You're closer than you think.`;

  return (
    <div className="pw-overlay" onClick={onClose}>
      <div className="pw-card" onClick={e => e.stopPropagation()}>

        {/* Ambient glow */}
        <div className="pw-glow" />

        <button className="pw-close" onClick={onClose}>✕</button>

        <div className="pw-flame">🔥</div>

        <h2 className="pw-hook">{hook}</h2>
        <p className="pw-sub">
          Unlock <strong>{feature}</strong> — and every other Pro tool — to
          see exactly how to get there <em>years earlier</em>.
        </p>

        {/* Impact bullets — time-framed, not feature-framed */}
        <ul className="pw-bullets">
          <li><span className="pw-bullet-icon green">↓</span> See how investing $200 more/month <strong>cuts years off</strong></li>
          <li><span className="pw-bullet-icon red">↑</span> Discover which expenses delay you <strong>the most</strong></li>
          <li><span className="pw-bullet-icon purple">◎</span> Run 500 market scenarios to <strong>stress-test your plan</strong></li>
          <li><span className="pw-bullet-icon gold">★</span> Full projections, insights, export — <strong>everything</strong></li>
        </ul>

        <button className="pw-cta" onClick={() => { onClose(); navigate('/pricing'); }}>
          Unlock Pro — $4.99/mo
          <span className="pw-arrow">→</span>
        </button>

        <p className="pw-fine">7-day free trial · No credit card · Cancel anytime</p>
      </div>
    </div>
  );
}
