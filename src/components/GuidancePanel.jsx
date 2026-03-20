// ─── GuidancePanel.jsx ───────────────────────────────────────────────────────
// Rule-based financial guidance only. No API calls, no external dependencies.
// Two exports:
//   GuidanceHomeWidget    — compact single tip card for the home/dashboard tab
//   GuidanceInsightsPanel — full panel with up to 4 tips for the insights tab
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { buildSnapshot, getRuleGuidance } from './GuidanceEngine';

// ── Type → visual config ─────────────────────────────────────────────────────
const TYPE_STYLE = {
  critical:  { bg: 'rgba(248,113,113,0.07)',  border: 'rgba(248,113,113,0.25)',  color: '#f87171',  label: 'Action needed' },
  warning:   { bg: 'rgba(251,191,36,0.07)',   border: 'rgba(251,191,36,0.25)',   color: '#fbbf24',  label: 'Heads up'      },
  insight:   { bg: 'rgba(167,139,250,0.07)',  border: 'rgba(167,139,250,0.25)',  color: '#a78bfa',  label: 'Insight'       },
  positive:  { bg: 'rgba(82,201,138,0.07)',   border: 'rgba(82,201,138,0.25)',   color: '#52c98a',  label: 'On track'      },
  milestone: { bg: 'rgba(96,165,250,0.07)',   border: 'rgba(96,165,250,0.25)',   color: '#60a5fa',  label: 'Milestone'     },
  info:      { bg: 'rgba(136,136,170,0.07)',  border: 'rgba(136,136,170,0.2)',   color: '#8888aa',  label: 'Note'          },
};

// ── Home tab compact card ─────────────────────────────────────────────────────
function GuidanceHomeCard({ tip }) {
  if (!tip) return null;
  const s = TYPE_STYLE[tip.type] || TYPE_STYLE.info;
  return (
    <div className="fl-guidance-home" style={{ background: s.bg, borderColor: s.border }}>
      <div className="fl-guidance-home-left">
        <span className="fl-guidance-home-icon" style={{ color: s.color }}>{tip.icon}</span>
      </div>
      <div className="fl-guidance-home-body">
        <div className="fl-guidance-home-label" style={{ color: s.color }}>{s.label.toUpperCase()}</div>
        <div className="fl-guidance-home-title">{tip.title}</div>
        <div className="fl-guidance-home-text">{tip.body}</div>
      </div>
    </div>
  );
}

// ── Full guidance panel for insights tab ──────────────────────────────────────
export function GuidanceInsightsPanel({ txs, fire, currency }) {
  const [ruleTips, setRuleTips] = useState([]);
  const [hasData,  setHasData]  = useState(false);

  useEffect(() => {
    const snap = buildSnapshot(txs, fire, currency);
    setHasData(snap.hasData);
    setRuleTips(getRuleGuidance(snap));
  }, [txs, fire, currency]);

  return (
    <div className="fl-guidance-panel">
      <div className="fl-guidance-header">
        <div>
          <h3 className="fl-guidance-title">Financial Guidance</h3>
          <p className="fl-guidance-subtitle">
            {hasData
              ? 'Based on your actual transaction data this month.'
              : 'Log at least 3 transactions to unlock personalised guidance.'}
          </p>
        </div>
      </div>

      {!hasData && (
        <div className="fl-guidance-empty">
          <div className="fl-guidance-empty-icon">◈</div>
          <p>Log your income and a few expenses to see personalised financial guidance here.</p>
        </div>
      )}

      {hasData && ruleTips.length > 0 && (
        <div className="fl-guidance-tips">
          {ruleTips.map((tip, i) => {
            const s = TYPE_STYLE[tip.type] || TYPE_STYLE.info;
            return (
              <div key={i} className="fl-guidance-tip" style={{ background: s.bg, borderColor: s.border }}>
                <div className="fl-guidance-tip-top">
                  <span
                    className="fl-guidance-tip-badge"
                    style={{ color: s.color, background: s.bg, borderColor: s.border }}
                  >
                    {tip.icon} {s.label}
                  </span>
                </div>
                <div className="fl-guidance-tip-title">{tip.title}</div>
                <div className="fl-guidance-tip-body">{tip.body}</div>
              </div>
            );
          })}
        </div>
      )}

      {hasData && ruleTips.length === 0 && (
        <div className="fl-guidance-empty">
          <div className="fl-guidance-empty-icon">✓</div>
          <p>Your numbers look solid this month. Keep logging to stay on track.</p>
        </div>
      )}

      <p className="fl-guidance-disclaimer">
        Guidance is generated from your transaction data for informational purposes only.
        It does not constitute financial advice. Consult a qualified adviser for investment decisions.
      </p>
    </div>
  );
}

// ── Home tab compact widget ───────────────────────────────────────────────────
export function GuidanceHomeWidget({ txs, fire, currency }) {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (!txs || txs.length < 3) return;
    const snap = buildSnapshot(txs, fire, currency);
    const tips = getRuleGuidance(snap);
    setTip(tips.length > 0 ? tips[0] : null);
  }, [txs, fire, currency]);

  if (!tip) return null;
  return <GuidanceHomeCard tip={tip} />;
}
