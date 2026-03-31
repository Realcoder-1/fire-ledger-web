import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Affiliate.css';
import { markAffiliateAuthIntent } from '../lib/affiliateReferral';

const STATS = [
  { num: '30%', label: 'Commission per sale', color: '#52c98a' },
  { num: '$1.50', label: 'Per lifetime referral', color: '#a78bfa' },
  { num: '$1.50', label: 'Per monthly referral', color: '#f472b6' },
  { num: '90 days', label: 'Cookie window', color: '#fbbf24' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your account', body: 'Set up your affiliate login directly and enter the dashboard immediately.' },
  { step: '02', title: 'Get your link', body: 'Your unique referral link is generated inside your dashboard as soon as your profile is created.' },
  { step: '03', title: 'Promote', body: 'Share on YouTube, Twitter, Instagram, newsletters, blogs — wherever your audience is.' },
  { step: '04', title: 'Get paid', body: 'Earn 30% on every paying customer you refer. Paid monthly via PayPal or bank transfer.' },
];

const PROMO_IDEAS = [
  { icon: '▶', label: 'YouTube', desc: '"I tracked my FIRE journey for 30 days" — these videos get 50k+ views' },
  { icon: '𝕏', label: 'Twitter / X', desc: 'Thread your savings rate progress — FIRE content goes viral regularly' },
  { icon: '📸', label: 'Instagram', desc: 'Before/after financial transformation posts — high engagement niche' },
  { icon: '✉', label: 'Newsletter', desc: 'Any personal finance, FIRE, or early retirement audience is a perfect fit' },
];

const FAQS = [
  { q: 'When and how do I get paid?', a: 'Commissions are paid monthly, on the 1st of each month, for the previous month\'s conversions. Minimum payout is $20. We pay via PayPal or bank transfer.' },
  { q: 'What counts as a conversion?', a: 'Any paying customer who signed up using your referral link within the 90-day cookie window. This includes all three plans: Lifetime ($5), Monthly ($4.99/mo), and Annual ($59.99/yr).' },
  { q: 'Can I use paid ads?', a: 'Yes, but you cannot bid on branded keywords (FIRE Ledger, FIRELedger, fireledger.app). Violating this results in immediate termination.' },
  { q: 'Is there a minimum audience size to join?', a: 'No. We care more about relevance than size. A niche FIRE blog with 500 readers is a better fit than a generic finance account with 50k followers.' },
  { q: 'Do referrals stack if the same person upgrades?', a: 'Yes. If someone buys Lifetime through your link and later upgrades to Annual, you earn commission on both transactions.' },
];

const PLAN_PAYOUTS = [
  { key: 'lifetime', label: 'If they choose lifetime', amount: 1.5, suffix: 'per sale', color: '#a78bfa' },
  { key: 'monthly', label: 'If they choose monthly', amount: 1.5, suffix: 'per customer / mo', color: '#f472b6' },
  { key: 'annual', label: 'If they choose annual', amount: 18, suffix: 'per sale', color: '#52c98a' },
];

// ── Mock affiliate dashboard data ────────────────────
const MOCK_REFERRALS = [
  { date: 'Mar 18', plan: 'Annual', amount: '$18.00', status: 'paid' },
  { date: 'Mar 12', plan: 'Lifetime', amount: '$1.50', status: 'paid' },
  { date: 'Mar 9',  plan: 'Monthly', amount: '$1.50', status: 'pending' },
  { date: 'Feb 28', plan: 'Annual',  amount: '$18.00', status: 'paid' },
  { date: 'Feb 21', plan: 'Monthly', amount: '$1.50', status: 'paid' },
];

function MockDashboard() {
  const [copied, setCopied] = useState(false);
  const link = 'fire-ledger-web.vercel.app/?ref=YOURCODE';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="aff-dash">
      <div className="aff-dash-header">
        <div className="aff-dash-title">Your affiliate dashboard</div>
        <div className="aff-dash-badge">Preview — live after signup</div>
      </div>

      {/* Stats row */}
      <div className="aff-dash-stats">
        {[
          { label: 'This month', value: '$39.00', color: '#52c98a' },
          { label: 'Total earned', value: '$214.50', color: '#a78bfa' },
          { label: 'Referrals', value: '14', color: '#f0f0f8' },
          { label: 'Conversion', value: '8.3%', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="aff-dash-stat">
            <span className="aff-dash-stat-val" style={{ color: s.color }}>{s.value}</span>
            <span className="aff-dash-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="aff-dash-link-row">
        <div className="aff-dash-link-label">Your referral link</div>
        <div className="aff-dash-link-box">
          <span className="aff-dash-link-url">{link}</span>
          <button className="aff-dash-copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referrals table */}
      <div className="aff-dash-table-wrap">
        <div className="aff-dash-table-head">
          <span>Date</span><span>Plan</span><span>Commission</span><span>Status</span>
        </div>
        {MOCK_REFERRALS.map((r, i) => (
          <div key={i} className="aff-dash-table-row">
            <span className="aff-col-date">{r.date}</span>
            <span className="aff-col-plan">{r.plan}</span>
            <span className="aff-col-amt">{r.amount}</span>
            <span className={`aff-col-status ${r.status}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Affiliate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(null);
  const [monthlyReferrals, setMonthlyReferrals] = useState(12);

  useEffect(() => {
    const targetId = location.hash.replace('#', '');
    const scrollTarget = () => {
      if (!targetId) {
        window.scrollTo(0, 0);
        return;
      }
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const timer = setTimeout(scrollTarget, 60);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const goToAffiliateSignup = () => {
    markAffiliateAuthIntent();
    navigate('/affiliate/dashboard');
  };

  const scrollToJoin = () => {
    const el = document.getElementById('aff-apply');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const lifetimeProjection = monthlyReferrals * 1.5;
  const monthlyProjection = monthlyReferrals * 1.5;
  const annualProjection = monthlyReferrals * 18;
  const blendedMonthly = (monthlyReferrals * 0.5 * 1.5) + (monthlyReferrals * 0.35 * 18) + (monthlyReferrals * 0.15 * 1.5);
  const blendedAnnual = blendedMonthly * 12;

  return (
    <div className="aff-page">
      {/* ── Background ── */}
      <div className="aff-bg">
        <div className="aff-orb aff-orb1" />
        <div className="aff-orb aff-orb2" />
        <div className="aff-grid" />
      </div>

      {/* ── Nav ── */}
      <nav className="aff-nav">
        <div className="aff-nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          FIRE<span>Ledger</span>
        </div>
        <div className="aff-nav-links">
          <button className="aff-nav-link" onClick={() => navigate('/')}>Home</button>
          <button className="aff-nav-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>
        <button className="aff-nav-cta" onClick={scrollToJoin}>
          Create account →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="aff-hero">
        <div className="aff-hero-inner">
          <div className="aff-eyebrow">Affiliate Program</div>
          <h1 className="aff-title">
            Earn while helping people<br />
            <span className="aff-accent">find their freedom date.</span>
          </h1>
          <p className="aff-sub">
            30% commission on every paying customer you refer. No cap. 90-day cookie. Monthly payouts.
          </p>

          {/* Stats strip */}
          <div className="aff-stats-strip">
            {STATS.map(s => (
              <div key={s.label} className="aff-stat-item">
                <span className="aff-stat-num" style={{ color: s.color }}>{s.num}</span>
                <span className="aff-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="aff-hero-btns">
            <button className="aff-btn-primary" id="aff-cta" onClick={goToAffiliateSignup}>
              Create affiliate account →
            </button>
            <button className="aff-btn-ghost" onClick={() => document.getElementById('aff-how')?.scrollIntoView({ behavior: 'smooth' })}>
              See how it works
            </button>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="aff-hero-dash">
          <MockDashboard />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="aff-section" id="aff-how">
        <div className="aff-section-inner">
          <span className="aff-section-eyebrow">The process</span>
          <h2 className="aff-section-title">Four steps to your first payout.</h2>
          <div className="aff-steps-grid">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="aff-step-card">
                <div className="aff-step-num">{s.step}</div>
                <h3 className="aff-step-title">{s.title}</h3>
                <p className="aff-step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commission breakdown ── */}
      <section className="aff-section aff-section-dark">
        <div className="aff-section-inner">
          <span className="aff-section-eyebrow">What you earn</span>
          <h2 className="aff-section-title">30% on every plan. Forever.</h2>
          <p className="aff-section-sub">A single annual referral earns you $18. Refer 10 people a month and you're making $180/mo passively.</p>

          <div className="aff-commission-grid">
            {[
              { plan: 'Lifetime', price: '$5', earn: '$1.50', tag: 'one-time', color: '#a78bfa' },
              { plan: 'Monthly', price: '$4.99/mo', earn: '$1.50/mo', tag: 'recurring', color: '#f472b6', featured: true },
              { plan: 'Annual', price: '$59.99/yr', earn: '$18.00/yr', tag: 'best value', color: '#52c98a' },
            ].map(p => (
              <div key={p.plan} className={`aff-comm-card ${p.featured ? 'aff-comm-featured' : ''}`}>
                {p.featured && <div className="aff-comm-badge">Most referred</div>}
                <div className="aff-comm-plan">{p.plan}</div>
                <div className="aff-comm-price">{p.price}</div>
                <div className="aff-comm-arrow">↓</div>
                <div className="aff-comm-earn" style={{ color: p.color }}>{p.earn}</div>
                <div className="aff-comm-label">you earn</div>
                <div className="aff-comm-tag">{p.tag}</div>
              </div>
            ))}
          </div>

          <div className="aff-earnings-lab">
            <div className="aff-earnings-head">
              <div>
                <span className="aff-section-eyebrow">Scale it up</span>
                <h3 className="aff-earnings-title">Move the regulator and see what this can become.</h3>
              </div>
              <div className="aff-earnings-highlight">
                <span className="aff-earnings-highlight-label">Blended example</span>
                <span className="aff-earnings-highlight-value">${blendedMonthly.toFixed(2)}/mo</span>
                <span className="aff-earnings-highlight-sub">${blendedAnnual.toFixed(0)}/yr at this pace</span>
              </div>
            </div>

            <div className="aff-earnings-slider-card">
              <div className="aff-earnings-slider-top">
                <span className="aff-earnings-slider-label">Paying referrals per month</span>
                <span className="aff-earnings-slider-value">{monthlyReferrals}</span>
              </div>
              <input
                className="aff-earnings-slider"
                type="range"
                min="1"
                max="100"
                step="1"
                value={monthlyReferrals}
                onChange={e => setMonthlyReferrals(Number(e.target.value))}
              />
              <div className="aff-earnings-slider-scale">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            <div className="aff-earnings-grid">
              {[
                { label: PLAN_PAYOUTS[0].label, value: `$${lifetimeProjection.toFixed(2)}`, sub: PLAN_PAYOUTS[0].suffix, color: PLAN_PAYOUTS[0].color },
                { label: PLAN_PAYOUTS[1].label, value: `$${monthlyProjection.toFixed(2)}/mo`, sub: PLAN_PAYOUTS[1].suffix, color: PLAN_PAYOUTS[1].color },
                { label: PLAN_PAYOUTS[2].label, value: `$${annualProjection.toFixed(2)}`, sub: PLAN_PAYOUTS[2].suffix, color: PLAN_PAYOUTS[2].color },
              ].map(card => (
                <div key={card.label} className="aff-earnings-card">
                  <span className="aff-earnings-card-label">{card.label}</span>
                  <span className="aff-earnings-card-value" style={{ color: card.color }}>{card.value}</span>
                  <span className="aff-earnings-card-sub">{card.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="aff-section">
        <div className="aff-section-inner">
          <span className="aff-section-eyebrow">Who promotes us</span>
          <h2 className="aff-section-title">If your audience cares about money,<br />they care about this.</h2>
          <div className="aff-promo-grid">
            {PROMO_IDEAS.map(p => (
              <div key={p.label} className="aff-promo-card">
                <div className="aff-promo-icon">{p.icon}</div>
                <div className="aff-promo-label">{p.label}</div>
                <p className="aff-promo-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="aff-section aff-section-dark" id="aff-apply">
        <div className="aff-section-inner aff-apply-inner">
          <div className="aff-apply-left">
            <span className="aff-section-eyebrow">Join now</span>
            <h2 className="aff-section-title" style={{ textAlign: 'left' }}>
              Join the program.<br />Start earning.
            </h2>
            <p className="aff-apply-body">
              Create your affiliate account directly, get your referral link, and start promoting immediately. Your dashboard gives you your code, link, and payout visibility in one place.
            </p>
            <div className="aff-apply-trust">
              <span>✓ Free to join</span>
              <span>✓ No minimum audience</span>
              <span>✓ Instant access</span>
              <span>✓ Monthly payouts</span>
            </div>
          </div>

          <div className="aff-apply-right">
            <div className="aff-apply-visual">
              <div className="aff-apply-visual-head">
                <span className="aff-apply-visual-eyebrow">What opens immediately</span>
                <span className="aff-apply-visual-badge">Live after signup</span>
              </div>
              <div className="aff-apply-visual-grid">
                {[
                  { label: 'Your referral link', value: 'Generated instantly' },
                  { label: 'Your custom code', value: 'Saved into Paddle' },
                  { label: 'Your payout details', value: 'Ready in dashboard' },
                  { label: 'Your conversion ledger', value: 'Tracks every referral' },
                ].map(item => (
                  <div key={item.label} className="aff-apply-visual-card">
                    <span className="aff-apply-visual-card-label">{item.label}</span>
                    <span className="aff-apply-visual-card-value">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="aff-apply-visual-link">
                <span className="aff-apply-visual-link-label">Sample link</span>
                <span className="aff-apply-visual-link-url">fire-ledger-web.vercel.app/?ref=YOURCODE</span>
              </div>
              <button className="aff-form-submit" type="button" onClick={goToAffiliateSignup}>
                Create account →
              </button>
              <p className="aff-form-fine">You will create your login in the affiliate dashboard and get your link immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="aff-section">
        <div className="aff-section-inner aff-faq-inner">
          <span className="aff-section-eyebrow">Questions</span>
          <h2 className="aff-section-title">Before you join</h2>
          <div className="aff-faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className="aff-faq-item">
                <button className="aff-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="aff-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="aff-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aff-section aff-bottom-cta-section">
        <div className="aff-section-inner aff-bottom-cta-inner">
          <span className="aff-section-eyebrow">Ready to start</span>
          <h2 className="aff-section-title">When you are ready, go straight to the account button.</h2>
          <p className="aff-section-sub">No long application. No waiting room. Jump back up and create the affiliate account when you want to start.</p>
          <button className="aff-btn-primary aff-bottom-cta-btn" type="button" onClick={scrollToJoin}>
            Take me back to create account →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="aff-footer">
        <div className="aff-footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          FIRE<span>Ledger</span>
        </div>
        <p>Questions? Email us at <a href="mailto:thimbleforgeapps@gmail.com">thimbleforgeapps@gmail.com</a></p>
        <div className="aff-footer-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/pricing">Pricing</a>
        </div>
        <p className="aff-footer-note">© {new Date().getFullYear()} FIRE Ledger · Affiliate Program</p>
      </footer>
    </div>
  );
}
