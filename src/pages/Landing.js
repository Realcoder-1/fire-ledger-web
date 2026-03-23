import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HoursPopup from '../components/HoursPopup';
import './Landing.css';

const CYCLING_WORDS = ['optional', 'clear', 'visible', 'real'];

const problemCards = [
  {
    number: '01',
    title: 'No clear answer',
    body:
      'You may be earning well, saving well, and still not know the date. That uncertainty keeps every decision fuzzy.',
  },
  {
    number: '02',
    title: 'Blind spots stay expensive',
    body:
      'A recurring expense is not just money out. It can be months or years added back onto your timeline without you feeling it.',
  },
  {
    number: '03',
    title: 'Confidence can be false',
    body:
      'A spreadsheet can look reassuring right until inflation, bad returns, or lifestyle drift break the plan you thought was safe.',
  },
];

const proofPoints = [
  {
    title: 'Built from a real founder problem',
    body:
      'FIRE Ledger started with one question: "When can I actually stop working?" The product exists because generic calculators and scattered spreadsheets did not answer it well enough.',
  },
  {
    title: 'Designed by a finance professional',
    body:
      'The framing is grounded in financial modelling and practical decision-making, not content marketing or vague personal finance inspiration.',
  },
  {
    title: 'Trust built into the stack',
    body:
      'Checkout is handled by Paddle, and your card details never touch our servers. Your plan data stays separate from payment processing.',
  },
  {
    title: 'A tool for action, not just analysis',
    body:
      'The goal is not to impress you with charts. The goal is to show your number, stress-test the path, and rank the next moves that matter.',
  },
];

const dreamSteps = [
  {
    label: 'Week 1',
    title: 'You stop wondering where you stand',
    body:
      'You input your numbers once and finally see your FIRE target, projected date, and current probability in one place.',
  },
  {
    label: 'Month 1',
    title: 'Your decisions become deliberate',
    body:
      'Instead of vague goals like "save more", you know which expense, savings, or income move shortens the timeline fastest.',
  },
  {
    label: 'Month 6',
    title: 'You are operating with conviction',
    body:
      'You are not just "trying to be good with money". You are running a plan, tracking progress, and adjusting with evidence.',
  },
];

const testimonials = [
  {
    quote:
      'This was the first tool that translated my habits into an actual freedom date. I finally knew what to change and what to ignore.',
    role: 'Early user · Software',
  },
  {
    quote:
      'The simulation made the biggest difference. I stopped asking whether my plan felt good and started checking whether it held up.',
    role: 'Early user · Finance',
  },
  {
    quote:
      'The ranked guidance is the killer feature. It turns financial independence from a concept into a set of moves.',
    role: 'Early user · Accounting',
  },
];

const plans = [
  {
    badge: 'Lowest friction',
    tier: 'Lifetime',
    price: '$5',
    period: 'once',
    detail: 'Full access every session. Ideal if you want your number today without committing to a subscription.',
    tag: 'Session access',
    featured: false,
    cta: 'Get lifetime access',
    features: [
      'Full FIRE calculator',
      'All FIRE modes',
      'Monte Carlo simulation',
      'Net worth and projection tools',
      'Personalised guidance engine',
      'Re-enter data each new session',
    ],
  },
  {
    badge: null,
    tier: 'Monthly',
    price: '$4.99',
    period: '/mo',
    detail: 'Persistent cloud sync so your data, progress, and timeline stay available every time you come back.',
    tag: 'Cloud sync',
    featured: false,
    cta: 'Start monthly',
    features: [
      'Everything in Lifetime',
      'Permanent cloud data sync',
      'History and trend tracking',
      'CSV bank import',
      'Full data export',
      'Cancel anytime',
    ],
  },
  {
    badge: 'Best value',
    tier: 'Annual',
    price: '$59.99',
    period: '/yr',
    detail: 'Best for the long game. Use it as your operating system while your date moves closer month by month.',
    tag: 'Cloud sync',
    featured: true,
    cta: 'Start annual',
    features: [
      'Everything in Monthly',
      'Cloud sync and history',
      'CSV bank import',
      'Full data export',
      '48-hour refund window',
      'Lowest annual cost',
    ],
  },
];

const faqs = [
  {
    q: 'Is this just another retirement calculator?',
    a:
      'No. The calculator is one part of the experience. FIRE Ledger also translates spending into timeline impact, stress-tests your path with simulation, and ranks the actions most likely to move your date.',
  },
  {
    q: 'Why would I pay if I can use a spreadsheet?',
    a:
      'You can use a spreadsheet. Most people already have. The issue is not logging data. The issue is converting your real numbers into a trustworthy answer and a clear next action without building and maintaining the system yourself.',
  },
  {
    q: 'How does payment work?',
    a:
      'Checkout is handled by Paddle. Paddle processes the payment, manages the secure payment flow, and confirms the purchase to us. We do not receive or store your card details.',
  },
  {
    q: 'How accurate is the plan?',
    a:
      'The output is only as good as the inputs, but the framework is transparent. FIRE targets are based on established withdrawal-rate logic, while simulations help you see how the plan behaves under less-than-perfect market conditions.',
  },
  {
    q: 'What if I only want the answer once?',
    a:
      'That is exactly why the $5 lifetime option exists. It gives you full access to the tools each session without requiring an ongoing subscription.',
  },
  {
    q: 'Is this financial advice?',
    a:
      'No. FIRE Ledger is an informational planning tool. It helps you model scenarios and understand tradeoffs, but it does not replace a licensed financial adviser.',
  },
];

function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('visible');

  useEffect(() => {
    const cycle = () => {
      setPhase('exit');
      setTimeout(() => {
        setIndex((current) => (current + 1) % CYCLING_WORDS.length);
        setPhase('enter');
      }, 240);
      setTimeout(() => setPhase('visible'), 480);
    };

    const interval = setInterval(cycle, 2400);
    return () => clearInterval(interval);
  }, []);

  return <span className={`hero-anim-word hero-anim-${phase}`}>{CYCLING_WORDS[index]}</span>;
}

function ScrollArrow({ targetId }) {
  return (
    <button
      className="scroll-arrow-cta"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })}
      aria-label="Scroll to next section"
    >
      <span>See the case</span>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 4v12M5.5 11.5 10 16l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen((current) => !current)}>
        <span>{q}</span>
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

function PreviewPanel({ previewTab }) {
  if (previewTab === 'score') {
    return (
      <div className="preview-panel">
        <div className="preview-panel-top">
          <div>
            <div className="preview-kicker">Freedom Score</div>
            <div className="preview-big-number">11.2 years</div>
            <div className="preview-muted">Projected financial independence date: July 2037</div>
          </div>
          <div className="preview-badge success">82% probability</div>
        </div>
        <div className="preview-metrics">
          <div className="preview-metric">
            <span>FIRE number</span>
            <strong>$910k</strong>
          </div>
          <div className="preview-metric">
            <span>Current net worth</span>
            <strong>$344k</strong>
          </div>
          <div className="preview-metric">
            <span>Savings rate</span>
            <strong>39%</strong>
          </div>
          <div className="preview-metric">
            <span>Work optional age</span>
            <strong>42</strong>
          </div>
        </div>
        <div className="preview-note">
          You are not being shown a vague goal. You are being shown a date, a target, and how much confidence the current path deserves.
        </div>
      </div>
    );
  }

  if (previewTab === 'simulation') {
    return (
      <div className="preview-panel">
        <div className="preview-panel-top">
          <div>
            <div className="preview-kicker">Stress Test</div>
            <div className="preview-big-number">1,000 simulated futures</div>
            <div className="preview-muted">See whether your plan survives bad sequences, inflation pressure, and slower returns.</div>
          </div>
          <div className="preview-badge warning">Scenario-tested</div>
        </div>
        <div className="simulation-list">
          <div className="simulation-row">
            <span>Base case</span>
            <strong>82%</strong>
          </div>
          <div className="simulation-row">
            <span>Higher inflation</span>
            <strong>74%</strong>
          </div>
          <div className="simulation-row">
            <span>Reduced savings rate</span>
            <strong>68%</strong>
          </div>
          <div className="simulation-row">
            <span>Income increase +10%</span>
            <strong>91%</strong>
          </div>
        </div>
        <div className="preview-note">
          Confidence should be earned. This section shows whether the plan still works when life stops being cooperative.
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-panel-top">
        <div>
          <div className="preview-kicker">Guidance Engine</div>
          <div className="preview-big-number">Actions ranked by years saved</div>
          <div className="preview-muted">The app tells you which changes actually move the date and which ones are noise.</div>
        </div>
        <div className="preview-badge accent">Priority moves</div>
      </div>
      <div className="guidance-list">
        <div className="guidance-item">
          <div>
            <strong>Cut dining-out spend by $220/mo</strong>
            <span>Saves 0.7 years</span>
          </div>
          <em>High impact</em>
        </div>
        <div className="guidance-item">
          <div>
            <strong>Increase monthly investing by $300</strong>
            <span>Saves 1.2 years</span>
          </div>
          <em>Highest impact</em>
        </div>
        <div className="guidance-item">
          <div>
            <strong>Delay car upgrade by 18 months</strong>
            <span>Saves 0.5 years</span>
          </div>
          <em>Worth considering</em>
        </div>
      </div>
      <div className="preview-note">
        This is where the product stops being interesting and starts being useful. You do not just see the future. You see how to change it.
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [previewTab, setPreviewTab] = useState('score');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToPricing = () => navigate(user ? '/pricing' : '/signup');

  return (
    <div className="landing">
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">
          FIRE<span>Ledger</span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}>
            Why now
          </button>
          <button className="nav-link" onClick={() => document.getElementById('proof')?.scrollIntoView({ behavior: 'smooth' })}>
            Trust
          </button>
          <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            Pricing
          </button>
        </div>
        <div className="nav-actions">
          <button className="nav-signin" onClick={() => navigate('/signin')}>
            Sign in
          </button>
          <button className="nav-cta" onClick={goToPricing}>
            Get started
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-background" aria-hidden="true">
          <div className="hero-glow hero-glow-a" />
          <div className="hero-glow hero-glow-b" />
          <div className="hero-grid" />
        </div>

        <div className="hero-copy">
          <div className="hero-badge">Financial independence planning for people who want a real answer</div>
          <h1 className="hero-title">Know when work becomes <AnimatedWord />.</h1>
          <p className="hero-sub">
            Most people do not fail financially because they do not care. They fail because they never get a clear answer to the question that matters:
            <strong> when can I stop working, and what would it take to get there sooner?</strong>
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={goToPricing}>
              Find my freedom date
            </button>
            <button className="btn-secondary" onClick={() => setShowPopup(true)}>
              Calculate hours left
            </button>
          </div>
          <div className="hero-proof-strip">
            <div className="hero-proof-item">
              <strong>One clear number</strong>
              <span>Your target and projected date</span>
            </div>
            <div className="hero-proof-item">
              <strong>One pressure test</strong>
              <span>Simulation, not wishful thinking</span>
            </div>
            <div className="hero-proof-item">
              <strong>One next move</strong>
              <span>Actions ranked by years saved</span>
            </div>
          </div>
          <ScrollArrow targetId="problem" />
        </div>

        <div className="hero-panel">
          <div className="hero-panel-header">
            <span>Current trajectory</span>
            <span className="hero-panel-chip">Without a system</span>
          </div>
          <div className="hero-panel-big">52,416</div>
          <div className="hero-panel-label">estimated working hours left on the current path</div>
          <div className="hero-panel-grid">
            <div className="hero-panel-stat">
              <span>Retirement age</span>
              <strong>63</strong>
            </div>
            <div className="hero-panel-stat">
              <span>Confidence</span>
              <strong>Unclear</strong>
            </div>
            <div className="hero-panel-stat">
              <span>FIRE probability</span>
              <strong>63%</strong>
            </div>
            <div className="hero-panel-stat">
              <span>Best next action</span>
              <strong>Unknown</strong>
            </div>
          </div>
          <div className="hero-panel-shift">
            <span>With FIRE Ledger</span>
            <strong>See the date. Stress-test the plan. Pull the right levers.</strong>
          </div>
        </div>
      </section>

      <section id="problem" className="section section-dark">
        <div className="section-head">
          <span className="section-eyebrow">Create the need</span>
          <h2 className="section-title">The real pain is not working hard. It is working hard without a clear answer.</h2>
          <p className="section-sub">
            If you do not know your number, then every savings decision, lifestyle choice, and income move happens in the fog. FIRE Ledger turns that fog into a model.
          </p>
        </div>
        <div className="problem-grid">
          {problemCards.map((card) => (
            <article key={card.number} className="problem-card">
              <span className="problem-number">{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
        <div className="stakes-band">
          <div>
            <span className="stakes-kicker">What this means in practice</span>
            <h3>You can be disciplined for years and still stay lost.</h3>
          </div>
          <p>
            Without a real model, people overspend on low-value habits, underestimate risk, and overestimate how close they are. The cost is not just money. It is time.
          </p>
        </div>
      </section>

      <section id="proof" className="section section-warm">
        <div className="proof-layout">
          <div className="proof-story">
            <span className="section-eyebrow">Why trust this</span>
            <h2 className="section-title align-left">Built from the same frustration your best spreadsheet never solved.</h2>
            <p>
              FIRE Ledger was built for people who are serious about financial independence but tired of living on rough estimates. The founder came at the problem from a finance background and still found the answer incomplete, fragmented, and hard to trust.
            </p>
            <p>
              That is why this product does not stop at a calculator. It turns your numbers into a timeline, checks whether the plan holds up, and shows what actions deserve your attention.
            </p>
            <p>
              The value is not in telling you to save more. The value is in telling you <strong>what changes your future, by how much, and why.</strong>
            </p>
          </div>
          <div className="proof-rail">
            {proofPoints.map((item) => (
              <article key={item.title} className="proof-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-dark">
        <div className="section-head">
          <span className="section-eyebrow">Sell the mechanism</span>
          <h2 className="section-title">This is how the platform turns anxiety into a plan.</h2>
          <p className="section-sub">
            The product has one job: take your current financial reality, simulate the future it produces, and show the shortest honest path toward the future you want.
          </p>
        </div>

        <div className="mechanism-grid">
          <div className="mechanism-list">
            <div className="mechanism-item">
              <strong>1. Map the present</strong>
              <span>Expenses, savings, net worth, and savings rate become a baseline, not a guess.</span>
            </div>
            <div className="mechanism-item">
              <strong>2. Model the future</strong>
              <span>Your FIRE target and date are calculated from your actual numbers, then tested under different market conditions.</span>
            </div>
            <div className="mechanism-item">
              <strong>3. Prioritise the right actions</strong>
              <span>The app identifies what moves the timeline and what only feels productive.</span>
            </div>
          </div>

          <div className="preview-shell">
            <div className="preview-tabs">
              {[
                ['score', 'Freedom score'],
                ['simulation', 'Simulation'],
                ['guidance', 'Guidance'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`preview-tab ${previewTab === value ? 'active' : ''}`}
                  onClick={() => setPreviewTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <PreviewPanel previewTab={previewTab} />
          </div>
        </div>
      </section>

      <section className="section section-contrast">
        <div className="section-head narrow">
          <span className="section-eyebrow">Sell the future</span>
          <h2 className="section-title">What life looks like six months after you stop guessing.</h2>
          <p className="section-sub">
            The dream is not a dashboard. The dream is living with a clear target, a believable path, and enough confidence to make sharper decisions.
          </p>
        </div>
        <div className="journey-grid">
          {dreamSteps.map((step) => (
            <article key={step.label} className="journey-card">
              <span className="journey-label">{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <div className="vision-panel">
          <h3>Your future should feel designed, not accidental.</h3>
          <p>
            You open the app, see your date, see your probability, and know what to do next. That changes how you spend, how you save, how you negotiate, and how you think about work itself.
          </p>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-head">
          <span className="section-eyebrow">Social proof</span>
          <h2 className="section-title">People do not want more information. They want a decision system they can trust.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.role} className="testimonial-card">
              <p>"{item.quote}"</p>
              <span>{item.role}</span>
            </article>
          ))}
        </div>
        <div className="validation-band">
          <div>
            <span className="stakes-kicker">Market signal</span>
            <h3>Personal finance tools are everywhere. Clarity tools are not.</h3>
          </div>
          <p>
            The opportunity is not another budgeting app. It is a product that answers the deeper question professionals actually obsess over: when does work become optional, and what gets me there faster?
          </p>
        </div>
      </section>

      <section id="pricing" className="section section-warm">
        <div className="section-head">
          <span className="section-eyebrow">Offer</span>
          <h2 className="section-title">Buy clarity first. Upgrade to continuity if you want the full operating system.</h2>
          <p className="section-sub">
            The pricing is designed to keep the first step easy. Start once, or keep your data and progress synced over time.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.tier} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.badge && <span className={`pricing-badge ${plan.featured ? 'featured-badge' : ''}`}>{plan.badge}</span>}
              <div className="pricing-tier">{plan.tier}</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <div className="pricing-tag">{plan.tag}</div>
              <p className="pricing-detail">{plan.detail}</p>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button className={`btn-primary btn-full ${plan.featured ? 'featured-cta' : ''}`} onClick={goToPricing}>
                {plan.cta}
              </button>
            </article>
          ))}
        </div>

        <div className="payments-panel">
          <div>
            <span className="section-eyebrow">Payments and trust</span>
            <h3>Paddle handles checkout. We do not touch your card details.</h3>
          </div>
          <p>
            Payments are processed through Paddle, a PCI-compliant merchant of record used across SaaS. You get instant access after checkout, and your payment details stay inside the payment flow, not our application.
          </p>
          <div className="payment-logos">
            {['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Apple Pay', 'Paddle'].map((item) => (
              <span key={item} className={`pay-logo ${item === 'Paddle' ? 'pay-logo-paddle' : ''}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark faq-section">
        <div className="section-head narrow">
          <span className="section-eyebrow">Lower the risk</span>
          <h2 className="section-title">Questions worth answering before you buy.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <section className="final-cta-section">
        <span className="section-eyebrow">Final step</span>
        <h2 className="final-cta-title">Stop hoping your plan works. See whether it does.</h2>
        <p className="final-cta-sub">
          If you know your number, your timeline, and your next move, the path feels lighter immediately. That is what this product sells.
        </p>
        <div className="final-actions">
          <button className="btn-primary" onClick={goToPricing}>
            Find my freedom date
          </button>
          <button className="btn-secondary" onClick={() => setShowPopup(true)}>
            Calculate hours left first
          </button>
        </div>
        <p className="final-note">From $5 once. Instant access. No card details stored on our servers.</p>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              FIRE<span>Ledger</span>
            </div>
            <p>Know your number. See your path. Make work optional on purpose.</p>
          </div>
          <div className="footer-links-col">
            <span className="footer-col-title">Product</span>
            <button className="footer-link-button" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </button>
            <button className="footer-link-button" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Pricing
            </button>
            <button className="footer-link-button" onClick={() => navigate('/signin')}>
              Sign in
            </button>
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
            <span className="footer-support-note">FIRE Ledger is an informational planning tool, not financial advice.</span>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} FIRE Ledger. All rights reserved.</div>
      </footer>

      {showPopup && <HoursPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
