import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HoursPopup({ onClose }) {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [hours] = useState(Math.round(Math.random() * 20000 + 30000));

  const handleStart = () => {
    onClose();
    if (user) navigate('/app');
    else signInWithGoogle();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 2000, padding: 24
    }} onClick={onClose}>
      <div style={{
        background: '#0e0e1a', border: '1px solid rgba(167,139,250,0.3)',
        borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%',
        textAlign: 'center', position: 'relative',
        boxShadow: '0 0 80px rgba(167,139,250,0.15), 0 40px 80px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none',
          border: 'none', color: '#8888aa', fontSize: 18, cursor: 'pointer'
        }}>✕</button>

        <div style={{ fontSize: 48, marginBottom: 8 }}>⏱</div>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 900,
          letterSpacing: -2, color: '#f472b6', marginBottom: 8
        }}>
          {hours.toLocaleString()}
        </div>
        <div style={{ fontSize: 14, color: '#8888aa', marginBottom: 24, lineHeight: 1.6 }}>
          The average person has <strong style={{ color: '#f0f0f8' }}>this many working hours left</strong> before retirement age.<br/>
          How many of yours are actually necessary?
        </div>
        <button onClick={handleStart} style={{
          width: '100%', background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
          color: 'white', border: 'none', padding: '14px 24px', borderRadius: 12,
          fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', marginBottom: 10,
          boxShadow: '0 0 30px rgba(167,139,250,0.4)'
        }}>
          Find out how many I can cut →
        </button>
        <div style={{ fontSize: 12, color: '#8888aa' }}>Free to start · No credit card</div>
      </div>
    </div>
  );
}
