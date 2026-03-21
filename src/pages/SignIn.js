import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './SignIn.css';

export default function SignIn() {
  const { user, hasSubscription, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [mode,     setMode]     = useState('login');  // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    if (user && hasSubscription) navigate('/app');
    else if (user) navigate('/pricing');
  }, [user, hasSubscription, navigate]);

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }

    if (mode === 'signup') {
  if (password !== confirm) { setError('Passwords do not match.'); return; }
  if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
  setLoading(true);
  const { error: err } = await signUpWithEmail(email, password);
  setLoading(false);
  if (err) { setError(err.message); return; }
  setSuccess('Account created! Check your email to confirm, then sign in.');
  setMode('login');
} else {
  setLoading(true);
  const { error: err } = await signInWithEmail(email, password);
  setLoading(false);
  if (err) { setError('Incorrect email or password.'); return; }
}
  };

  return (
    <div className="signin-page">
      <div className="signin-bg">
        <div className="signin-orb signin-orb1" />
        <div className="signin-orb signin-orb2" />
      </div>

      <div className="signin-card">
        <div className="signin-logo" onClick={() => navigate('/')}>FIRE<span>Ledger</span></div>

        {/* Mode toggle */}
        <div className="signin-toggle">
          <button className={`signin-toggle-btn ${mode==='login'?'active':''}`} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            Sign in
          </button>
          <button className={`signin-toggle-btn ${mode==='signup'?'active':''}`} onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
            Create account
          </button>
        </div>

        <h1 className="signin-title">
          {mode === 'login' ? 'Welcome back.' : 'Start your journey.'}
        </h1>
        <p className="signin-sub">
          {mode === 'login'
            ? 'Sign in to access your dashboard.'
            : 'Create your account to get started.'}
        </p>

        {/* Google */}
        <button className="signin-google-btn" onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{flexShrink:0}}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="signin-divider"><span>or</span></div>

        {/* Email / password fields */}
        <div className="signin-fields">
          <div className="signin-field">
            <label className="signin-label">Email</label>
            <input
              className="signin-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="signin-field">
            <label className="signin-label">Password</label>
            <input
              className="signin-input"
              type="password"
              placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {mode === 'signup' && (
            <div className="signin-field">
              <label className="signin-label">Confirm password</label>
              <input
                className="signin-input"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}
        </div>

        {error   && <p className="signin-error">{error}</p>}
        {success && <p className="signin-success">{success}</p>}

        <button className="signin-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
        </button>

        <p className="signin-fine">
          By continuing you agree to our{' '}
          <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
        </p>

        <button className="signin-back" onClick={() => navigate('/')}>
          ← Back to home
        </button>
      </div>
    </div>
  );
}
