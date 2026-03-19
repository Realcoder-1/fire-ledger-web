import React from 'react';

export default function ScrollHint({ text }) {
  return (
    <div className="fl-scroll-hint">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 1.5v8M2 6l3.5 3.5L9 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>{text}</span>
    </div>
  );
}
