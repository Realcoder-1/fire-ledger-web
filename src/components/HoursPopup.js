import { useState, useEffect } from 'react';
import './HoursPopup.css';

export default function HoursPopup({ onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div className={`hp-overlay ${visible ? 'visible' : ''}`}>
      <div className={`hp-card ${visible ? 'visible' : ''}`}>
        <div className="hp-site-tag">fireledger.app</div>
        <div className="hp-number">90,000</div>
        <div className="hp-unit">hours</div>
        <p className="hp-statement">
          That's how long the average person spends at work over their lifetime.
        </p>
        <div className="hp-divider" />
        <p className="hp-question">How many do you have left?</p>
        <p className="hp-sub">
          Most people never calculate it.<br />
          The ones who do — retire a decade earlier.
        </p>
        <button className="hp-cta" onClick={handleClose}>
          Calculate mine →
        </button>
        <button className="hp-skip" onClick={handleClose}>
          I'd rather not know
        </button>
      </div>
    </div>
  );
}
