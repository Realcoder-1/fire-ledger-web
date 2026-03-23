import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

// ─── Animated cycling word ────────────────────────────────────────────────────
const CYCLING_WORDS = ['free', 'certain', 'done', 'out'];
function AnimatedWord() {
  const [idx, setIdx]         = useState(0);
  const [phase, setPhase]     = useState('visible');
  useEffect(() => {
    const cycle = () => {
      setPhase('exit');
      setTimeout(() => { setIdx(i => (i + 1) % CYCLING_WORDS.length); setPhase('enter'); }, 350);
      setTimeout(() => setPhase('visible'), 700);
    };
    const t = setInterval(cycle, 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className={`hero-anim-word hero-anim-${phase}`}>
      {CYCLING_WORDS[idx]}
    </span>
  );
}

// ─── Scroll-down CTA arrow ─────────────────────────────────────────────────────
function ScrollArrow({ targetId }) {
  return (
    <button
      className="scroll-arrow-cta"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })}
      aria-label="Scroll down"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v14M4 11l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>See how it works</span>
    </button>
  );
}

// ─── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

// ─── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [previewTab, setPreviewTab] = useState('dashboard');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToPricing = () => navigate(user ? '/pricing' : '/signup');

  return (
    <div className="landing">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">FIRE<span>Ledger</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          <button className="nav-link" onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
          <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="nav-signin" onClick={() => navigate('/signin')}>Sign in</button>
          <button className="nav-cta" onClick={goToPricing}>Get started →</button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 1 — HOOK
          Stop them. Make them feel the discomfort of not knowing.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">Financial Independence · Early Retirement</div>

          <h1 className="hero-title">
            When are you<br />
            <AnimatedWord />?
          </h1>

          <p className="hero-sub">
            Most professionals spend 40+ years working without ever knowing their exact
            freedom date. FIRE Ledger gives you a <strong style={{ color: '#f0f0f8' }}>precise number, a real plan,
            and guidance calibrated to your actual situation</strong> — not generic advice.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={goToPricing}>
              Find my freedom date →
            </button>
            <button className="btn-ghost" onClick={() => setShowPopup(true)}>
              Calculate hours left
            </button>
          </div>

          {/* Pain data strip */}
          <div className="hero-stat-strip">
            <div className="hero-stat-item">
              <span className="hero-stat-num" style={{ color: '#f87171' }}>90,000</span>
              <span className="hero-stat-label">avg hours worked in a lifetime</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat-item">
              <span className="hero-stat-num" style={{ color: '#fbbf24' }}>67</span>
              <span className="hero-stat-label">avg retirement age — the default</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat-item">
              <span className="hero-stat-num" style={{ color: '#52c98a' }}>37–45</span>
              <span className="hero-stat-label">FIRE retirement age — the goal</span>
            </div>
          </div>

          <ScrollArrow targetId="need" />
        </div>

        {/* Hero mockup — pain version */}
        <div className="hero-mockup">
          <div className="mockup-card mockup-card-pain">
            <div className="mockup-pain-header">
              <span className="mockup-pain-label">YOUR SITUATION</span>
              <span className="mockup-pain-alert">Without a plan</span>
            </div>
            <div className="mockup-hours-wrap">
              <div className="mockup-hours-num">52,416</div>
              <div className="mockup-hours-label">working hours remaining<br />at the current trajectory</div>
            </div>
            <div className="mockup-pain-stats">
              <div className="mockup-pain-stat">
                <div className="mockup-pain-stat-val" style={{ color: '#f87171' }}>28 yrs</div>
                <div className="mockup-pain-stat-label">Until retirement</div>
              </div>
              <div className="mockup-pain-divider" />
              <div className="mockup-pain-stat">
                <div className="mockup-pain-stat-val" style={{ color: '#fbbf24' }}>63%</div>
                <div className="mockup-pain-stat-label">FIRE probability</div>
              </div>
              <div className="mockup-pain-divider" />
              <div className="mockup-pain-stat">
                <div className="mockup-pain-stat-val" style={{ color: '#8888aa' }}>C</div>
                <div className="mockup-pain-stat-label">Savings grade</div>
              </div>
            </div>
            <div className="mockup-pain-tip">
              ↑ Your dining out spend is adding 2.3 years to your sentence. Guidance available inside.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 2 — CREATE THE NEED
          The real problem isn't "no tool". It's walking on thin ice with no map.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="need" className="before-after-section">
        <div className="before-after-inner">
          <span className="section-eyebrow">The real problem</span>
          <h2 className="section-title">
            You're making financial decisions<br />
            without knowing the score.
          </h2>
          <p className="section-sub">
            Not because you're careless. Because no one has ever shown you your actual
            numbers — what they mean, where they're going, and what to do next.
          </p>

          <div className="ba-grid">
            <div className="ba-card ba-before">
              <span className="ba-card-label" style={{ background: 'rgba(224,92,92,0.12)', color: '#e05c5c', borderColor: 'rgba(224,92,92,0.3)' }}>Without FIRE Ledger</span>
              <div className="ba-mockup-janky">
                <div className="janky-header">retirement_plan.xlsx</div>
                <div className="janky-row">Savings this month: ??? </div>
                <div className="janky-row">FIRE number: ~$1.2M maybe</div>
                <div className="janky-row">Freedom date: "hopefully early"</div>
                <div className="janky-row">Spending impact: no idea</div>
                <div className="janky-row">Monte Carlo: what's that</div>
              </div>
              <ul className="ba-list">
                <li>Guessing your FIRE number from articles that don't know your situation</li>
                <li>No idea which expenses are killing your timeline</li>
                <li>Every financial decision feels like walking on thin ice</li>
                <li>Freedom feels theoretical, not trackable</li>
              </ul>
            </div>

            <div className="ba-card ba-after">
              <span className="ba-card-label" style={{ background: 'rgba(82,201,138,0.1)', color: '#52c98a', borderColor: 'rgba(82,201,138,0.3)' }}>With FIRE Ledger</span>
              <div className="ba-mockup-clean">
                <div className="ba-clean-header">
                  <span>FIRE Dashboard</span>
                  <span style={{ color: '#52c98a' }}>Grade: A · 89% probability</span>
                </div>
                <div className="ba-clean-years" style={{ color: '#a78bfa' }}>11.4 years</div>
                <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 8 }}>to financial independence · projected 2036</div>
                <div className="ba-clean-progress" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg,#a78bfa,#f472b6)', borderRadius: 2 }} />
                </div>
                <div className="ba-clean-metrics">
                  <div className="ba-clean-metric"><span style={{ color: '#f0f0f8', fontWeight: 700 }}>$847k</span><span>FIRE number</span></div>
                  <div className="ba-clean-metric"><span style={{ color: '#52c98a', fontWeight: 700 }}>$322k</span><span>current</span></div>
                  <div className="ba-clean-metric"><span style={{ color: '#fbbf24', fontWeight: 700 }}>42%</span><span>savings rate</span></div>
                </div>
                <div className="ba-clean-guidance">↑ Reduce dining out by $200/mo → save 0.8 years off your timeline</div>
              </div>
              <ul className="ba-list">
                <li>Your exact FIRE number, calculated from your real expenses</li>
                <li>Every spend shown as <em>years off your timeline</em>, not just dollars</li>
                <li>Guidance on which moves actually move the needle</li>
                <li>Monte Carlo simulation tells you if your plan actually works</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 3 — WHAT IT ACTUALLY IS (reframe the product)
          Kill the "just a calculator" objection before it forms.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="features" style={{ background: '#07070e', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="features-inner">
          <span className="section-eyebrow">What FIRE Ledger actually is</span>
          <h2 className="section-title">
            Not a calculator.<br />A guidance system.
          </h2>
          <p className="section-sub">
            You put in your numbers once. FIRE Ledger tells you where you stand,
            what your plan looks like under real-world conditions, and exactly what
            to do to close the gap faster.
          </p>

          <div className="features-grid">
            {[
              {
                num: '01',
                title: 'Your real FIRE number',
                body: 'Input your annual expenses, current savings, and savings rate. Get your precise independence number and projected freedom date — not an estimate, a calculation.',
              },
              {
                num: '02',
                title: 'Spending shown in years, not dollars',
                body: 'Every expense category is translated into its impact on your timeline. You see that your car payment isn\'t $600/month — it\'s 1.4 years of work. That changes decisions.',
              },
              {
                num: '03',
                title: 'Monte Carlo simulation',
                body: 'Run 1,000 simulated futures. Know the probability your plan survives market downturns, inflation, and real life — before it\'s too late to adjust.',
              },
              {
                num: '04',
                title: 'Four FIRE modes',
                body: 'Lean FIRE, standard FIRE, Fat FIRE, Coast FIRE. Each gives a different target. Know which one you\'re on track for — and what it would take to upgrade.',
              },
              {
                num: '05',
                title: 'Personalised guidance engine',
                body: 'Based on your actual numbers, the guidance engine surfaces the specific levers worth pulling. Not generic advice — actions ranked by years saved.',
              },
              {
                num: '06',
                title: 'Net worth & projection tracking',
                body: 'See your net worth broken down, projected forward, and stress-tested. Your compound growth visualised. Your trajectory confirmed — or corrected.',
              },
            ].map(f => (
              <div key={f.num} className="feature-card">
                <div className="feature-num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 4 — DASHBOARD PREVIEW (show, don't tell)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="preview-section">
        <div className="preview-section-inner">
          <span className="section-eyebrow">Inside the app</span>
          <h2 className="section-title">Everything in one place.<br />Nothing missing.</h2>
          <p className="section-sub">
            The dashboard you wish your bank gave you. Built for people who want to leave the workforce early — and actually know what that takes.
          </p>

          <div className="dashboard-preview">
            <div className="preview-nav">
              {['dashboard', 'fire-calc', 'insights', 'projections', 'net-worth'].map(tab => (
                <button
                  key={tab}
                  className={`prev-nav-tab ${previewTab === tab ? 'active' : ''}`}
                  onClick={() => setPreviewTab(tab)}
                >
                  {tab === 'dashboard' ? 'Dashboard' : tab === 'fire-calc' ? 'FIRE Calculator' : tab === 'insights' ? 'Insights' : tab === 'projections' ? 'Projections' : 'Net Worth'}
                </button>
              ))}
            </div>

            <div className="preview-body">
              {previewTab === 'dashboard' && (
                <div className="preview-screen">
                  <div className="prev-hours-banner">
                    <span className="prev-hours-icon">⏱</span>
                    <div className="prev-hours-body">
                      <div className="prev-hours-num">23,504</div>
                      <div className="prev-hours-label">working hours remaining on your current plan</div>
                    </div>
                    <span className="prev-hours-badge">11.3 years</span>
                  </div>
                  <div className="prev-hero-card">
                    <div>
                      <div className="prev-label">FIRE DATE</div>
                      <div className="prev-years">11.3 <span className="prev-years-unit">years</span></div>
                      <div className="prev-date">Projected: June 2036</div>
                      <div className="prev-progress-bar"><div className="prev-progress-fill" style={{ width: '38%' }} /></div>
                      <div className="prev-progress-label">38% of FIRE number · $322k / $847k</div>
                    </div>
                    <div className="prev-ring-wrap">
                      <svg className="prev-ring" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="url(#g1)" strokeWidth="7" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="116.9" transform="rotate(-90 36 36)"/>
                        <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
                      </svg>
                      <div className="prev-ring-center">
                        <div className="prev-ring-pct">38%</div>
                        <div className="prev-ring-sub">to FIRE</div>
                      </div>
                    </div>
                  </div>
                  <div className="prev-metrics">
                    {[['Savings Rate', '42%', '#52c98a'], ['FIRE Grade', 'A', '#a78bfa'], ['Monte Carlo', '91%', '#60a5fa'], ['Savings/mo', '$2,100', '#34d399']].map(([l, v, c]) => (
                      <div key={l} className="prev-metric">
                        <div className="prev-metric-label">{l}</div>
                        <div className="prev-metric-val" style={{ color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="prev-guidance">
                    <div className="prev-guidance-icon">↑</div>
                    <div className="prev-guidance-text"><strong style={{ color: '#a78bfa' }}>Insight:</strong> Dining out ($340/mo) is adding 1.9 years to your working life. Cutting by half saves $2,040/year and moves your FIRE date to 2035.</div>
                  </div>
                </div>
              )}

              {previewTab === 'fire-calc' && (
                <div className="preview-screen">
                  <div className="prev-fire-layout">
                    <div>
                      <div className="prev-section-label">Your inputs</div>
                      {[['Annual expenses', '$48,000'], ['Current savings', '$322,000'], ['Annual savings', '$25,200'], ['Expected return', '7%']].map(([l, v]) => (
                        <div key={l} className="prev-field"><span className="prev-field-label">{l}</span><span className="prev-field-val">{v}</span></div>
                      ))}
                      <div className="prev-divider" />
                      <div className="prev-section-label" style={{ marginTop: 8 }}>FIRE mode</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        {['Lean', 'Standard', 'Fat', 'Coast'].map(m => (
                          <span key={m} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: m === 'Standard' ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${m === 'Standard' ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)'}`, color: m === 'Standard' ? '#a78bfa' : '#55557a' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="prev-section-label">Results</div>
                      <div className="prev-stat-grid">
                        {[['FIRE Number', '$1,200,000', '#f0f0f8'], ['Years to FIRE', '11.3', '#a78bfa'], ['Progress', '38%', '#52c98a'], ['Freedom date', '2036', '#fbbf24']].map(([l, v, c]) => (
                          <div key={l} className="prev-stat">
                            <span className="prev-stat-label">{l}</span>
                            <span className="prev-stat-val" style={{ color: c }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="prev-divider" />
                      <div className="prev-section-label">What if I saved more?</div>
                      <div className="prev-slider-row">
                        <span className="prev-slider-val">+$500/mo</span>
                        <div className="prev-slider-track"><div className="prev-slider-thumb" style={{ left: '40%' }} /></div>
                      </div>
                      <div className="prev-whatif-result" style={{ color: '#52c98a' }}>→ FIRE date moves to 2034 · saves 2.1 years</div>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'insights' && (
                <div className="preview-screen">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f0f8' }}>This month's spending breakdown</div>
                    <div className="prev-grade-row">
                      <span className="prev-grade-label">Grade</span>
                      <span className="prev-grade" style={{ color: '#a78bfa' }}>A</span>
                      <span className="prev-grade-sub">Top 15%</span>
                    </div>
                  </div>
                  {[['Income', 5000, '#52c98a', '100%'], ['Savings', 2100, '#a78bfa', '42%'], ['Needs', 1800, '#60a5fa', '36%'], ['Wants', 1100, '#f472b6', '22%']].map(([l, v, c, pct]) => (
                    <div key={l} className="prev-bar-row">
                      <span className="prev-bar-label" style={{ color: '#8888aa' }}>{l}</span>
                      <div className="prev-bar-track"><div className="prev-bar-fill" style={{ width: pct, background: c }} /></div>
                      <span className="prev-bar-val" style={{ color: c }}>${v.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      { type: 'warning', icon: '↑', text: 'Dining out ($340) is adding 1.9 years. Cut by half → retire 2035.' },
                      { type: 'positive', icon: '✓', text: '42% savings rate puts you in the top 15% of FIRE candidates.' },
                      { type: 'insight', icon: '◎', text: 'Subscriptions ($190) add 0.9 years. One audit saves almost a year.' },
                    ].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: tip.type === 'warning' ? 'rgba(251,191,36,0.06)' : tip.type === 'positive' ? 'rgba(82,201,138,0.06)' : 'rgba(167,139,250,0.06)', border: `1px solid ${tip.type === 'warning' ? 'rgba(251,191,36,0.2)' : tip.type === 'positive' ? 'rgba(82,201,138,0.2)' : 'rgba(167,139,250,0.2)'}`, borderRadius: 7, fontSize: 11, color: '#8888aa', alignItems: 'flex-start' }}>
                        <span style={{ color: tip.type === 'warning' ? '#fbbf24' : tip.type === 'positive' ? '#52c98a' : '#a78bfa', flexShrink: 0, fontWeight: 700 }}>{tip.icon}</span>
                        <span>{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewTab === 'projections' && (
                <div className="preview-screen">
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f0f8', marginBottom: 4 }}>Monte Carlo simulation</div>
                    <div style={{ fontSize: 11, color: '#8888aa' }}>1,000 scenarios · 7% avg return · 3% inflation</div>
                  </div>
                  <svg viewBox="0 0 400 160" style={{ width: '100%', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                    {/* Simulated MC chart lines */}
                    {[...Array(12)].map((_, i) => {
                      const col = i < 4 ? 'rgba(248,113,113,0.15)' : i < 9 ? 'rgba(167,139,250,0.15)' : 'rgba(82,201,138,0.3)';
                      const endY = 140 - (i * 9) - Math.random() * 20;
                      return <path key={i} d={`M20,140 Q120,${120-i*5} 200,${100-i*7} T380,${endY}`} fill="none" stroke={col} strokeWidth="1.2"/>;
                    })}
                    <path d="M20,140 Q120,100 200,70 T380,20" fill="none" stroke="#a78bfa" strokeWidth="2.5"/>
                    <line x1="20" y1="30" x2="380" y2="30" stroke="rgba(82,201,138,0.3)" strokeWidth="1" strokeDasharray="4,3"/>
                    <text x="385" y="33" fill="#52c98a" fontSize="9">FIRE</text>
                  </svg>
                  <div className="prev-mc-result">
                    <div className="prev-mc-pct" style={{ color: '#52c98a' }}>91%</div>
                    <div className="prev-mc-label">probability of reaching FIRE<br />by your target date of 2036</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#55557a', marginTop: 4 }}>
                    Worst 10% of scenarios: FIRE by 2040 · Best 10%: FIRE by 2033
                  </div>
                </div>
              )}

              {previewTab === 'net-worth' && (
                <div className="preview-screen">
                  <div className="prev-nw-grid">
                    <div className="prev-nw-card">
                      <div className="prev-nw-label">Assets</div>
                      <div className="prev-nw-val" style={{ color: '#52c98a' }}>$438,200</div>
                      <div className="prev-nw-breakdown">
                        {[['Investments', '$322,000'], ['Emergency fund', '$24,000'], ['Property equity', '$92,200']].map(([l, v]) => <div key={l} className="prev-nw-row"><span>{l}</span><span style={{ color: '#f0f0f8' }}>{v}</span></div>)}
                      </div>
                    </div>
                    <div className="prev-nw-card">
                      <div className="prev-nw-label">Liabilities</div>
                      <div className="prev-nw-val" style={{ color: '#f87171' }}>$116,000</div>
                      <div className="prev-nw-breakdown">
                        {[['Mortgage', '$98,000'], ['Car loan', '$18,000']].map(([l, v]) => <div key={l} className="prev-nw-row"><span>{l}</span><span style={{ color: '#f87171' }}>{v}</span></div>)}
                      </div>
                    </div>
                  </div>
                  <div className="prev-nw-total">
                    <span>Net worth</span>
                    <span className="prev-nw-total-val">$322,200</span>
                  </div>
                  <div className="prev-nw-bar-wrap">
                    <div className="prev-nw-bar-fill" style={{ width: '38%', background: 'linear-gradient(90deg,#a78bfa,#f472b6)' }} />
                    <div className="prev-nw-bar-text">38% of FIRE number</div>
                  </div>
                </div>
              )}
            </div>

            <div className="preview-footer">
              <span className="preview-footer-badge">All numbers update in real time as you adjust your inputs</span>
            </div>
          </div>

          <ScrollArrow targetId="story" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 5 — TRUST (story + credibility + validation)
          Who built this, why, and why you should trust it.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="story-section">
        <div className="story-inner">
          <span className="section-eyebrow">Why this exists</span>
          <h2 className="section-title" style={{ textAlign: 'left', fontSize: 'clamp(28px,3.5vw,44px)' }}>
            Built by someone who ran<br />the numbers and couldn't stop.
          </h2>

          <div className="story-body">
            <p>
              I spent years in finance — professional-level accounting, financial modelling, the works. And I still didn't have a clear picture of my own freedom date.
              The spreadsheets were there. The theory was there. But the answer to <strong>"when can I actually stop?"</strong> was always somewhere in the fog.
            </p>
            <p>
              I built FIRE Ledger because I needed it myself. A tool that takes your real numbers — not generic assumptions — and tells you where you stand, what your plan looks like under pressure, and exactly which moves are worth making.
            </p>
            <p>
              It's not a logging app. It's not a budgeting app. It's a <strong>guidance system for people who want financial independence and need to know if they're actually on track.</strong>
            </p>
          </div>

          {/* Testimonials — vague names as requested */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {[
              {
                text: "I'd tried spreadsheets, YNAB, everything. FIRE Ledger was the first thing that gave me an actual number and told me what it would take to hit it. I adjusted two things and my FIRE date moved by 3 years.",
                name: "Software engineer, 31",
                role: "Monthly subscriber",
              },
              {
                text: "The Monte Carlo simulation alone is worth it. I finally stopped wondering 'will my plan survive a bad decade' and started knowing. The answer was yes — but only if I made one specific change. The app told me exactly what.",
                name: "Finance professional, 38",
                role: "Annual subscriber",
              },
              {
                text: "I've been in accounting for 12 years and I still didn't have clarity on my own situation. FIRE Ledger gave me my number, my grade, and a ranked list of what actually matters. Game-changing.",
                name: "Accountant, 35",
                role: "Lifetime access",
              },
            ].map((q, i) => (
              <div key={i} className="story-quote" style={{ marginBottom: 0 }}>
                <div className="story-quote-mark">"</div>
                <p className="story-quote-text">{q.text}</p>
                <div className="story-quote-author">
                  <div className="story-quote-avatar">{q.name[0]}</div>
                  <div>
                    <div className="story-quote-name">{q.name}</div>
                    <div className="story-quote-role">{q.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VC / market validation card */}
          <div className="validation-card">
            <div className="validation-icon">✓</div>
            <div>
              <div className="validation-title">Market validated</div>
              <div className="validation-body">
                "The FIRE movement is one of the fastest-growing personal finance trends globally, with searches for 'FIRE calculator' up 340% since 2020. The gap between desire and actionable guidance is where the real opportunity sits."
              </div>
              <div className="validation-source">Industry research · FIRE movement growth data · 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 6 — SELL THE DREAM (perceived value, not timeline)
          What clarity actually feels like. Paint the picture.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="before-after-section" style={{ background: '#08080f' }}>
        <div className="before-after-inner">
          <span className="section-eyebrow">The real value</span>
          <h2 className="section-title">
            Imagine making every financial<br />
            decision with complete clarity.
          </h2>
          <p className="section-sub">
            This isn't about logging. It's about what happens when you finally know your number —
            when every choice has a cost in years, not just dollars.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 48 }}>
            {[
              {
                icon: '◈',
                color: '#a78bfa',
                title: 'You know your number.',
                body: 'Not a range. Not a guess. Your FIRE number — calculated from your real expenses — with a date attached to it. That number changes everything.',
              },
              {
                icon: '◎',
                color: '#52c98a',
                title: 'Every spend shows its real cost.',
                body: 'You stop seeing expenses in dollars. You see them in time. Your morning coffee isn\'t $5 — it\'s 3 weeks over 10 years. You decide if it\'s worth it.',
              },
              {
                icon: '↑',
                color: '#fbbf24',
                title: 'You stop walking on thin ice.',
                body: 'Monte Carlo runs 1,000 futures. When it says 91% probability — you know your plan is real. Not optimistic. Statistically validated.',
              },
              {
                icon: '→',
                color: '#f472b6',
                title: 'The next move is always clear.',
                body: 'Guidance is ranked by years saved. You\'re never wondering what to do. You know exactly which lever to pull, how much it\'s worth, and what happens when you do.',
              },
            ].map(card => (
              <div key={card.title} className="feature-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 28, color: card.color, marginBottom: 14, fontWeight: 700 }}>{card.icon}</div>
                <h3 style={{ color: '#f0f0f8', fontSize: 16, marginBottom: 10 }}>{card.title}</h3>
                <p style={{ color: '#8888aa', fontSize: 13, lineHeight: 1.7 }}>{card.body}</p>
              </div>
            ))}
          </div>

          {/* The dream paragraph */}
          <div style={{ maxWidth: 680, margin: '48px auto 0', padding: '36px 40px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: '#f0f0f8', lineHeight: 1.5, marginBottom: 16 }}>
              Imagine waking up and knowing exactly when you're free.
            </div>
            <p style={{ fontSize: 15, color: '#8888aa', lineHeight: 1.8, marginBottom: 0 }}>
              Not approximately. Not "hopefully before 60." You see the date.
              You see the probability. You see what you need to do today to keep it.
              That's not a feeling — that's a number. And numbers don't lie.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 7 — PAYMENT TRUST
          Paddle, security, your card never touches our servers.
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '48px 48px', background: '#07070e', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="section-eyebrow">Payments & security</span>
          <p style={{ fontSize: 14, color: '#8888aa', lineHeight: 1.8, marginBottom: 20 }}>
            Checkout is handled entirely by <strong style={{ color: '#a78bfa' }}>Paddle</strong> — a PCI-compliant payment processor used by thousands of SaaS companies worldwide.
            Your card details <strong style={{ color: '#f0f0f8' }}>never touch our servers</strong>. We see a confirmation. That's it.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            {['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Apple Pay'].map(p => (
              <span key={p} className="pay-logo">{p}</span>
            ))}
            <span className="pay-logo pay-logo-paddle">Paddle Payments</span>
          </div>
          <p style={{ fontSize: 12, color: '#55557a' }}>🔒 256-bit SSL · PCI DSS compliant · Instant access after payment</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 8 — PRICING (sell the solution)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="pricing">
        <div className="pricing-inner-wide" style={{ margin: '0 auto' }}>
          <span className="section-eyebrow" style={{ textAlign: 'center', display: 'block' }}>Pricing</span>
          <h2 className="section-title">
            Less than one coffee.<br />More clarity than a year of guessing.
          </h2>
          <p className="section-sub">
            Three ways in. One goal: knowing your number.
          </p>

          <div className="pricing-grid-3">
            {/* LIFETIME */}
            <div className="pricing-card">
              <span className="pricing-badge-new">Lowest barrier</span>
              <div className="pricing-tier">Lifetime</div>
              <div className="pricing-price-row">
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>$5</span>
                <span style={{ fontSize: 14, color: '#8888aa', marginLeft: 4 }}>once</span>
              </div>
              <div style={{ fontSize: 12, color: '#34d399', marginBottom: 12, fontWeight: 500 }}>One payment · Use forever</div>
              <span className="pricing-storage-tag pricing-storage-session">⚡ Session only</span>
              <p className="pricing-storage-note">
                Full access every session. Run your numbers, get your date, know your grade.
                Data clears when you close the tab — perfect for getting your FIRE number today.
              </p>
              <ul className="pricing-features">
                <li>✓ Full FIRE calculator (all 4 modes)</li>
                <li>✓ Monte Carlo simulation</li>
                <li>✓ Net Worth & Projections</li>
                <li>✓ Compound Growth calculator</li>
                <li>✓ Personalised guidance engine</li>
                <li className="pricing-feature-dim">✗ Data doesn't persist between sessions</li>
              </ul>
              <button className="btn-primary btn-full" onClick={goToPricing}>
                Get lifetime access — $5 →
              </button>
            </div>

            {/* MONTHLY */}
            <div className="pricing-card">
              <div className="pricing-tier">Monthly</div>
              <div className="pricing-price-row">
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>$4.99</span>
                <span style={{ fontSize: 14, color: '#8888aa', marginLeft: 4 }}>/mo</span>
              </div>
              <div style={{ height: 20 }} />
              <span className="pricing-storage-tag pricing-storage-cloud">☁ Cloud sync</span>
              <p className="pricing-storage-note">
                Your numbers saved permanently. Pick up exactly where you left off.
                Track your progress as your FIRE date moves closer.
              </p>
              <ul className="pricing-features">
                <li>✓ Everything in Lifetime</li>
                <li>✓ Permanent cloud data sync</li>
                <li>✓ History & trend tracking</li>
                <li>✓ Smart CSV bank import</li>
                <li>✓ Full data export</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button className="btn-primary btn-full" onClick={goToPricing}>
                Start monthly — $4.99/mo →
              </button>
            </div>

            {/* ANNUAL — featured */}
            <div className="pricing-card featured">
              <span className="pricing-badge">Best value</span>
              <div className="pricing-tier">Annual</div>
              <div className="pricing-price-row">
                <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>$59.99</span>
                <span style={{ fontSize: 14, color: '#8888aa', marginLeft: 4 }}>/yr</span>
              </div>
              <div className="pricing-equiv">Just $5/month · Save 16%</div>
              <span className="pricing-storage-tag pricing-storage-cloud">☁ Cloud sync</span>
              <p className="pricing-storage-note">
                Everything in Monthly, billed once. Best for the long game —
                watching your FIRE date move as your plan compounds.
              </p>
              <ul className="pricing-features">
                <li>✓ Everything in Monthly</li>
                <li>✓ Cloud sync & history</li>
                <li>✓ Smart CSV bank import</li>
                <li>✓ Full data export</li>
                <li>✓ 48-hour refund guarantee</li>
                <li>✓ Best rate available</li>
              </ul>
              <button className="btn-primary btn-full" onClick={goToPricing}>
                Start annual — $59.99/yr →
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ fontSize: 13, color: '#8888aa' }}>🔒 Secure checkout via Paddle · 48-hour refund guarantee · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 9 — FAQ (lower action threshold, handle objections)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="faq-section">
        <div className="faq-inner">
          <span className="section-eyebrow">Common questions</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,40px)' }}>Things worth knowing.</h2>
          <div className="faq-list">
            {[
              {
                q: "Is this just a calculator? What makes it different?",
                a: "No — the calculator is one feature inside a guidance system. FIRE Ledger takes your inputs and surfaces ranked, actionable guidance: which expenses are costing you the most years, whether your plan survives real-world scenarios (Monte Carlo), and what specific changes move your freedom date. A calculator gives you a number. FIRE Ledger tells you what to do about it."
              },
              {
                q: "What's the difference between the $5 lifetime and the subscription?",
                a: "The $5 lifetime gives you full access to every feature every session — FIRE calculator, all 4 modes, Monte Carlo, net worth, projections, and the guidance engine. The only limitation is that data clears when you close the tab, so you'd re-enter your numbers each time. Subscriptions add permanent cloud storage so your history tracks and you can watch your FIRE date move over time."
              },
              {
                q: "How accurate are the projections?",
                a: "The FIRE calculator uses the standard 25x rule with a 4% withdrawal rate — the same methodology used across the financial independence community. Monte Carlo runs 1,000 scenarios with variable returns and inflation. The projections are as accurate as the inputs you provide, and we're transparent about the assumptions used."
              },
              {
                q: "What if I don't know all my exact numbers?",
                a: "Start with estimates. A rough annual expense number and approximate savings get you a useful starting point. The point isn't perfect inputs — it's moving from 'I have no idea' to 'I have a number and a direction.' You can refine from there."
              },
              {
                q: "Is my financial data safe?",
                a: "Your data is stored securely via Supabase on AWS infrastructure — encrypted in transit and at rest. We don't sell it, share it, or monetise it. Payments are handled entirely by Paddle — your card details never reach our servers."
              },
              {
                q: "What if I want a refund?",
                a: "Annual subscribers get a 48-hour refund window. If you access the dashboard, run your numbers, and decide it's not for you — contact support@fireledger.app within 48 hours. Subscriptions can be cancelled anytime. The $5 lifetime purchase is final given the low price point, but we're happy to answer questions before you buy."
              },
            ].map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          SECTION 10 — FINAL CTA (close the sale)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="final-cta-section">
        <span className="section-eyebrow">One decision.</span>
        <h2 className="final-cta-title">
          Stop guessing.<br />
          Know your number.
        </h2>
        <p className="final-cta-sub">
          The professionals who retire early aren't smarter or luckier. They know their
          number, they know their plan, and they know it's working. You can know yours today.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: 17, padding: '16px 36px' }} onClick={goToPricing}>
            Find my freedom date →
          </button>
          <button className="btn-ghost" onClick={() => setShowPopup(true)}>
            Calculate hours left first
          </button>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: '#55557a' }}>From $5 once · No subscription required · Instant access</p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">FIRE<span>Ledger</span></div>
            <p>A guidance system for financial independence. Know your number. Know your plan. Know it works.</p>
            <div className="footer-pay-logos">
              {['VISA', 'MC', 'AMEX', 'PayPal'].map(p => <span key={p} className="pay-logo">{p}</span>)}
              <span className="pay-logo pay-logo-paddle">Paddle</span>
            </div>
          </div>
          <div className="footer-links-col">
            <span className="footer-col-title">Product</span>
            <button className="nav-link" style={{ textAlign: 'left', padding: 0, fontSize: 13, color: '#8888aa' }} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
            <button className="nav-link" style={{ textAlign: 'left', padding: 0, fontSize: 13, color: '#8888aa' }} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
            <button className="nav-link" style={{ textAlign: 'left', padding: 0, fontSize: 13, color: '#8888aa' }} onClick={() => navigate('/signin')}>Sign in</button>
          </div>
          <div className="footer-links-col">
            <span className="footer-col-title">Legal</span>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/refund">Refund Policy</a>
          </div>
          <div className="footer-links-col">
            <span className="footer-col-title">Support</span>
            <a href="mailto:support@fireledger.app">support@fireledger.app</a>
            <span style={{ fontSize: 12, color: '#55557a', marginTop: 4 }}>We respond within 24 hours</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FIRE Ledger · All rights reserved</span>
          <p className="footer-bottom-note">
            FIRE Ledger provides financial calculation tools for informational purposes only.
            Nothing on this site constitutes financial advice. Always consult a qualified financial adviser for investment decisions.
          </p>
        </div>
      </footer>

      {/* Hours popup */}
      {showPopup && <HoursPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
