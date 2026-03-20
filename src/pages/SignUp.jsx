import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

export default function SignUp() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [mode,     setMode]     = useState('signup'); // signup | signin | forgot
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  // Already signed in → go to pricing
  useEffect(() => {
    if (user) navigate('/pricing');
  }, [user, navigate]);

  const clearMessages = () => { setError(''); setMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.'); return;
    }
    if (mode !== 'forgot' && password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { supabase } = await import('../lib/supabase');
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/pricing'
        });
        if (resetErr) setError(resetErr.message);
        else setMsg('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const { error: err } = await signUpWithEmail(email, password);
        if (err) {
          setError(err.message);
        } else {
          // immediately sign in — skip confirmation entirely
          const { error: signInErr } = await signInWithEmail(email, password);
          if (signInErr) setError(signInErr.message);
          // useEffect catches user and redirects to /pricing
        }
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) setError(err.message);
        // success: useEffect catches user change and navigates to /pricing
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="su-page">
      <div className="su-bg">
        <div className="su-orb su-orb1" />
        <div className="su-orb su-orb2" />
      </div>

      <nav className="su-nav">
        <Link to="/" className="su-logo">FIRE<span>Ledger</span></Link>
      </nav>

      <div className="su-card">
        <div className="su-badge">
          {mode === 'signup' ? 'Create your account' : mode === 'signin' ? 'Welcome back' : 'Reset password'}
        </div>

        <h1 className="su-title">
          {mode === 'signup' ? <>Start your<br /><span>FIRE journey</span></> :
           mode === 'signin' ? <>Sign back<br /><span>in</span></> :
           <>Reset your<br /><span>password</span></>}
        </h1>

        <p className="su-sub">
          {mode === 'signup' ? "Sign up and choose your plan. From $5 once — no subscription required." :
           mode === 'signin' ? "Sign in to access your dashboard and pick up where you left off." :
           "Enter your email and we'll send you a reset link."}
        </p>

        {/* Google */}
        {mode !== 'forgot' && (
          <>
            <button className="su-google-btn" onClick={() => signInWithGoogle()}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <div className="su-divider"><span>or</span></div>
          </>
        )}

        {/* Email form */}
        <form className="su-form" onSubmit={handleSubmit}>
          <div className="su-field">
            <label className="su-label">Email address</label>
            <input className="su-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); clearMessages(); }}
              required autoFocus />
          </div>

          {mode !== 'forgot' && (
            <div className="su-field">
              <label className="su-label">Password</label>
              <input className="su-input" type="password" placeholder="Min. 6 characters"
                value={password} onChange={e => { setPassword(e.target.value); clearMessages(); }}
                required />
            </div>
          )}

          {mode === 'signup' && (
            <div className="su-field">
              <label className="su-label">Confirm password</label>
              <input className={`su-input ${confirm && password !== confirm ? 'su-input-error' : ''}`}
                type="password" placeholder="Re-enter your password"
                value={confirm} onChange={e => { setConfirm(e.target.value); clearMessages(); }}
                required />
              {confirm && password !== confirm && (
                <span className="su-field-error">Passwords do not match</span>
              )}
            </div>
          )}

          {error && <div className="su-error">{error}</div>}
          {msg   && <div className="su-msg">{msg}</div>}

          <button className="su-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' :
             mode === 'signup' ? 'Create account →' :
             mode === 'signin' ? 'Sign in →' :
             'Send reset link →'}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="su-links">
          {mode === 'signup' && <>
            <span>Already have an account?</span>
            <button className="su-link" onClick={() => { setMode('signin'); clearMessages(); }}>Sign in</button>
          </>}
          {mode === 'signin' && <>
            <span>No account yet?</span>
            <button className="su-link" onClick={() => { setMode('signup'); clearMessages(); }}>Sign up</button>
            <span className="su-dot">·</span>
            <button className="su-link" onClick={() => { setMode('forgot'); clearMessages(); }}>Forgot password?</button>
          </>}
          {mode === 'forgot' && (
            <button className="su-link" onClick={() => { setMode('signin'); clearMessages(); }}>← Back to sign in</button>
          )}
        </div>

        <p className="su-fine">
          By continuing you agree to our{' '}
          <Link to="/terms" className="su-fine-link">Terms</Link>{' '}and{' '}
          <Link to="/privacy" className="su-fine-link">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
