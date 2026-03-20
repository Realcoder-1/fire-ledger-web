import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HoursPopup.css';

const WORK_HRS_PER_YEAR = 2080;

export default function HoursPopup({ onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  const [visible,    setVisible]    = useState(false);
  const [step,       setStep]       = useState('hook'); // hook | when | result | signin
  const [currentAge, setCurrentAge] = useState('');
  const [retireAge,  setRetireAge]  = useState('');
  const [ageError,   setAgeError]   = useState('');
  const [hoursLeft,  setHoursLeft]  = useState(0);
  const [yearsLeft,  setYearsLeft]  = useState(0);

  // Email auth state
  const [authMode,   setAuthMode]   = useState('signin'); // signin | signup | forgot
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [authError,  setAuthError]  = useState('');
  const [authMsg,    setAuthMsg]    = useState('');
  const [authLoading,setAuthLoading]= useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (user && step === 'signin') {
      handleClose();
      navigate('/pricing');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  const handleCalculate = () => {
    const ca = parseInt(currentAge);
    const ra = parseInt(retireAge);
    if (!ca || !ra || ca < 16 || ca > 80) { setAgeError('Enter a valid current age (16–80).'); return; }
    if (ra <= ca) { setAgeError('Retirement age must be after your current age.'); return; }
    if (ra > 80)  { setAgeError('Retirement age must be 80 or under.'); return; }
    setYearsLeft(ra - ca);
    setHoursLeft(Math.round((ra - ca) * WORK_HRS_PER_YEAR));
    setAgeError('');
    setStep('result');
  };

  const handleResultCTA = () => {
    if (user) { handleClose(); navigate('/pricing'); }
    else setStep('signin');
  };

  const handleScrollToPricing = () => {
    handleClose();
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 420);
  };

  const handleEmailAuth = async () => {
    setAuthError(''); setAuthMsg(''); setAuthLoading(true);
    try {
      if (authMode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setAuthError(error.message);
        else setAuthMsg('Check your email for a reset link.');
      } else if (authMode === 'signup') {
        const { error } = await signUpWithEmail(email, password);
        if (error) setAuthError(error.message);
        else { setAuthMsg('Check your email to confirm your account, then sign in.'); setAuthMode('signin'); }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) setAuthError(error.message);
        // success: useEffect above catches user change and redirects
      }
    } catch (e) {
      setAuthError('Something went wrong. Please try again.');
    }
    setAuthLoading(false);
  };

  return (
    <div className={`hp-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
      <div className={`hp-card ${visible ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>

        {/* ── STEP 1: Hook ── */}
        {step === 'hook' && (<>
          <div className="hp-site-tag">fireledger.app</div>
          <div className="hp-number">90,000</div>
          <div className="hp-unit">hours</div>
          <p className="hp-statement">That's how long the average person spends at work over their lifetime.</p>
          <div className="hp-divider" />
          <p className="hp-question">When will you stop working?</p>
          <p className="hp-sub">Most people never calculate it.<br />The ones who do — retire a decade earlier.</p>
          <button className="hp-cta" onClick={() => setStep('when')}>Calculate mine →</button>
          <button className="hp-skip" onClick={handleClose}>I'd rather not know</button>
        </>)}

        {/* ── STEP 2: Age inputs ── */}
        {step === 'when' && (<>
          <div className="hp-site-tag">fireledger.app</div>
          <p className="hp-question" style={{ marginBottom: 8 }}>When will you stop working?</p>
          <p className="hp-sub" style={{ marginBottom: 24 }}>Enter your age and when you want to be done.</p>
          <div className="hp-input-row">
            <div className="hp-input-group">
              <label className="hp-input-label">Your age now</label>
              <input className="hp-input" type="number" placeholder="28" min="16" max="80"
                value={currentAge} onChange={e => { setCurrentAge(e.target.value); setAgeError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()} autoFocus />
            </div>
            <div className="hp-input-arrow">→</div>
            <div className="hp-input-group">
              <label className="hp-input-label">Retire at age</label>
              <input className="hp-input" type="number" placeholder="45" min="17" max="80"
                value={retireAge} onChange={e => { setRetireAge(e.target.value); setAgeError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()} />
            </div>
          </div>
          {ageError && <p className="hp-error">{ageError}</p>}
          <button className="hp-cta" onClick={handleCalculate}>Show me the number →</button>
          <button className="hp-skip" onClick={() => setStep('hook')}>← Go back</button>
        </>)}

        {/* ── STEP 3: Result ── */}
        {step === 'result' && (<>
          <div className="hp-site-tag">fireledger.app</div>
          <div className="hp-result-line">You have</div>
          <div className="hp-number" style={{ color: '#f87171' }}>{hoursLeft.toLocaleString()}</div>
          <div className="hp-unit">working hours left</div>
          <p className="hp-statement">
            That's <strong style={{ color: '#f0f0f8' }}>{yearsLeft} years</strong> of work before you reach your retirement age.
          </p>
          <div className="hp-divider" />
          <p className="hp-question" style={{ fontSize: 20 }}>The tool that helps you<br />cut that number.</p>
          <p className="hp-sub" style={{ marginBottom: 28 }}>From <strong style={{ color: '#a78bfa' }}>$5 once</strong> — no subscription needed.</p>
          <button className="hp-cta" onClick={handleResultCTA}>Get started →</button>
          <button className="hp-skip" onClick={handleScrollToPricing}>See plans first</button>
        </>)}

        {/* ── STEP 4: Sign in / Sign up ── */}
        {step === 'signin' && (<>
          <div className="hp-site-tag">fireledger.app</div>
          <p className="hp-question" style={{ marginBottom: 4 }}>
            {authMode === 'signup' ? 'Create your account' : authMode === 'forgot' ? 'Reset password' : 'Sign in'}
          </p>
          <p className="hp-sub" style={{ marginBottom: 20 }}>
            You'll choose your plan right after.<br />From $5 once — no subscription required.
          </p>

          {/* Google */}
          {authMode !== 'forgot' && <>
            <button className="hp-google-btn" onClick={() => signInWithGoogle()}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <div className="hp-divider-row"><span>or</span></div>
          </>}

          {/* Email fields */}
          <div className="hp-email-fields">
            <input className="hp-email-input" type="email" placeholder="Email address"
              value={email} onChange={e => { setEmail(e.target.value); setAuthError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
            {authMode !== 'forgot' && (
              <input className="hp-email-input" type="password" placeholder="Password"
                value={password} onChange={e => { setPassword(e.target.value); setAuthError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
            )}
          </div>

          {authError && <p className="hp-error">{authError}</p>}
          {authMsg   && <p className="hp-auth-msg">{authMsg}</p>}

          <button className="hp-cta" onClick={handleEmailAuth} disabled={authLoading} style={{ marginTop: 8 }}>
            {authLoading ? 'Please wait…' : authMode === 'signup' ? 'Create account →' : authMode === 'forgot' ? 'Send reset link →' : 'Sign in →'}
          </button>

          {/* Mode switchers */}
          <div className="hp-auth-links">
            {authMode === 'signin' && <>
              <button className="hp-auth-link" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMsg(''); }}>No account? Sign up</button>
              <button className="hp-auth-link" onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthMsg(''); }}>Forgot password?</button>
            </>}
            {authMode === 'signup' && (
              <button className="hp-auth-link" onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMsg(''); }}>Already have an account? Sign in</button>
            )}
            {authMode === 'forgot' && (
              <button className="hp-auth-link" onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMsg(''); }}>← Back to sign in</button>
            )}
          </div>

          <p className="hp-signin-fine">
            By continuing you agree to our{' '}
            <a href="/terms" className="hp-link" onClick={handleClose}>Terms</a>{' '}and{' '}
            <a href="/privacy" className="hp-link" onClick={handleClose}>Privacy Policy</a>
          </p>
          <button className="hp-skip" onClick={() => setStep('result')}>← Go back</button>
        </>)}

      </div>
    </div>
  );
}
