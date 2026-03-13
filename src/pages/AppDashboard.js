import { useMemo, useState } from 'react';
import './AppDashboard.css';

export default function FireCalcWhatIfDemo() {
  const [whatIfInput, setWhatIfInput] = useState('0');
  const [whatIf, setWhatIf] = useState(0);

  const tickLabels = useMemo(() => ['$0', '$5k', '$10k', '$15k', '$20k+'], []);

  const handleInputChange = (value) => {
    // Keep UI stable while typing but only allow digits.
    const next = value.replace(/[^\d]/g, '');
    setWhatIfInput(next);
    setWhatIf(Number.parseInt(next || '0', 10));
  };

  const commitInput = () => {
    const clamped = Math.max(0, Number.parseInt(whatIfInput || '0', 10));
    setWhatIf(clamped);
    setWhatIfInput(String(clamped));
  };

  return (
    <section className="fl-whatif">
      <h4>What if I saved more?</h4>
      <div className="fl-whatif-input-row">
        <span className="fl-whatif-prefix">+$</span>
        <input
          className="fl-whatif-number-input"
          type="text"
          inputMode="numeric"
          value={whatIfInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={commitInput}
          aria-label="Additional monthly savings"
        />
        <span className="fl-whatif-suffix">/mo</span>
      </div>

      <input
        type="range"
        min="0"
        max="20000"
        step="100"
        value={Math.min(whatIf, 20000)}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          setWhatIf(n);
          setWhatIfInput(String(n));
        }}
        className="fl-slider"
      />

      <div className="fl-whatif-ticks">
        {tickLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </section>
  );
}