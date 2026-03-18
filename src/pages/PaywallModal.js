import { useNavigate } from 'react-router-dom';
import './PaywallModal.css';

export default function PaywallModal({ feature, yearsToFire, onClose }) {
  const navigate = useNavigate();

  const hook = yearsToFire != null && isFinite(yearsToFire)
    ? `You're ${yearsToFire} years from never working again.`
    : `Your freedom is closer than you think.`;

  return (
    <div className="pw-overlay" onClick={onClose}>
      <div className="pw-card" onClick={e => e.stopPropagation()}>

        <div className="pw-glow" />

        <button className="pw-close" onClick={onClose}>✕</button>

        <div className="pw-flame">🔥</div>

        <h2 className="pw-hook">{hook}</h2>
        <p className="pw-sub">
          Most people retire at 65 wondering where their money went.{' '}
          <em>You don't have to be one of them.</em>
        </p>

        <ul className="pw-bullets">
          <li><span className="pw-bullet-icon green">↓</span> See exactly how many years you're <strong>leaving on the table</strong></li>
          <li><span className="pw-bullet-icon red">↑</span> That one subscription is probably costing you <strong>8 months of freedom</strong></li>
          <li><span className="pw-bullet-icon purple">◎</span> Know with certainty your plan actually works — <strong>before it's too late</strong></li>
          <li><span className="pw-bullet-icon gold">★</span> Wake up every day knowing <strong>exactly when you're free</strong></li>
        </ul>

        <button className="pw-cta" onClick={() => { onClose(); navigate('/pricing'); }}>
          Claim my freedom — $4.99/mo
          <span className="pw-arrow">→</span>
        </button>

        <p className="pw-fine">$4.99/mo · Less than one coffee · Your freedom is worth more</p>
      </div>
    </div>
  );
}
