import './ScrollHint.css';

export default function ScrollHint({ text }) {
  return (
    <div className="scroll-hint">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>{text || 'Scroll down to see more'}</span>
    </div>
  );
}
