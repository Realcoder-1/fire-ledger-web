// ─── GuidanceEngine.js ───────────────────────────────────────────────────────
// Generates contextual financial guidance based on real transaction data.
// Two tiers:
//   1. Rule-based (instant, always available)
//   2. Claude API (deeper, called on demand)
// ─────────────────────────────────────────────────────────────────────────────

const WORK_HRS_PER_YEAR = 2080;

/**
 * Build a structured financial snapshot from transactions + FIRE settings.
 * Used by both rule engine and Claude prompt.
 */
export function buildSnapshot(txs, fire, currency = 'USD') {
  const now = new Date();
  const thisMonth = txs.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });


  const sum = (arr, type) => arr.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

  const mIncome  = sum(thisMonth, 'income');
  const mNeeds   = sum(thisMonth, 'need');
  const mWants   = sum(thisMonth, 'want');
  const mSavings = sum(thisMonth, 'saving');
  const savRate  = mIncome > 0 ? (mSavings / mIncome) * 100 : 0;
  const needsPct = mIncome > 0 ? (mNeeds / mIncome) * 100 : 0;
  const wantsPct = mIncome > 0 ? (mWants / mIncome) * 100 : 0;

  // Top spending categories this month
  const catMap = {};
  thisMonth.filter(t => t.type === 'need' || t.type === 'want').forEach(t => {
    const k = t.category || t.description || 'Other';
    catMap[k] = (catMap[k] || 0) + t.amount;
  });
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => ({ cat, amt, pct: mIncome > 0 ? (amt / mIncome) * 100 : 0 }));

  // FIRE numbers
  const fireNum  = fire.annualExpenses * 25;
  const progress = fireNum > 0 ? (fire.currentSavings / fireNum) * 100 : 0;
  let yearsToFire = Infinity;
  if (fire.annualSavings > 0) {
    let bal = fire.currentSavings, y = 0;
    while (bal < fireNum && y < 100) { bal = bal * 1.07 + fire.annualSavings; y++; }
    yearsToFire = y;
  }

  // Impact of each want category in years
  const wantImpact = topCategories
    .filter(c => thisMonth.some(t => (t.category === c.cat || t.description === c.cat) && t.type === 'want'))
    .map(c => ({
      cat: c.cat,
      amt: c.amt,
      annualCost: c.amt * 12,
      yearsAdded: fire.annualSavings > 0
        ? parseFloat(((c.amt * 12) / fire.annualSavings).toFixed(1))
        : 0,
    }));

  // Savings grade
  const grade = savRate >= 60 ? 'A+' : savRate >= 50 ? 'A' : savRate >= 40 ? 'B' : savRate >= 30 ? 'C' : 'D';

  // Hours of work remaining
  const hoursLeft = isFinite(yearsToFire) ? Math.round(yearsToFire * WORK_HRS_PER_YEAR) : null;

  return {
    currency,
    month: { income: mIncome, needs: mNeeds, wants: mWants, savings: mSavings, spend: mNeeds + mWants },
    rates: { savings: savRate, needs: needsPct, wants: wantsPct },
    topCategories,
    wantImpact,
    fire: {
      num: fireNum,
      current: fire.currentSavings,
      annualSavings: fire.annualSavings,
      annualExpenses: fire.annualExpenses,
      progress,
      yearsToFire,
      hoursLeft,
    },
    grade,
    txCount: txs.length,
    hasData: txs.length >= 3,
  };
}

/**
 * Rule-based guidance — instant, no API call.
 * Returns array of { type, title, body, priority, icon }
 */
export function getRuleGuidance(snap) {
  if (!snap.hasData) return [];
  const tips = [];
  const { rates, month, fire, wantImpact, grade } = snap;

  // ── Critical: Savings rate too low ──────────────────────────────────
  if (rates.savings < 10 && month.income > 0) {
    const extraNeeded = Math.max(0, month.income * 0.2 - month.savings);
    tips.push({
      type: 'critical',
      icon: '⚠',
      title: 'Savings rate is critically low',
      body: `At ${rates.savings.toFixed(1)}% you're saving far below what financial independence requires. A 20% savings rate is the minimum baseline — you need to find an additional ${fmtAmt(extraNeeded, snap.currency)}/month to get there. At this rate, retirement is likely past age 65.`,
      priority: 1,
    });
  }

  // ── Wants exceeding 30% ──────────────────────────────────────────────
  if (rates.wants > 35 && month.income > 0) {
    const overBy = month.wants - (month.income * 0.3);
    tips.push({
      type: 'warning',
      icon: '↑',
      title: 'Discretionary spending is above target',
      body: `Wants are ${rates.wants.toFixed(0)}% of income — the guideline is 30%. You're spending ${fmtAmt(overBy, snap.currency)}/month above that threshold. Redirecting this to savings would shorten your path to independence by ${fire.annualSavings > 0 ? ((overBy * 12) / fire.annualSavings).toFixed(1) : '?'} years.`,
      priority: 2,
    });
  }

  // ── Top want category costing serious years ──────────────────────────
  const bigWant = wantImpact.find(w => w.yearsAdded >= 1);
  if (bigWant) {
    tips.push({
      type: 'insight',
      icon: '◎',
      title: `${bigWant.cat} is costing you ${bigWant.yearsAdded} years`,
      body: `At ${fmtAmt(bigWant.amt, snap.currency)}/month, ${bigWant.cat} costs you ${fmtAmt(bigWant.annualCost, snap.currency)}/year. If you cut this by half and invested the difference, you'd retire ${(bigWant.yearsAdded / 2).toFixed(1)} years earlier.`,
      priority: 3,
    });
  }

  // ── On track: good savings rate ──────────────────────────────────────
  if (rates.savings >= 40 && month.income > 0) {
    tips.push({
      type: 'positive',
      icon: '✓',
      title: `Strong savings rate — grade ${grade}`,
      body: `${rates.savings.toFixed(1)}% savings rate puts you in the top tier of FIRE candidates. At this pace ${isFinite(fire.yearsToFire) ? `you reach financial independence in ${fire.yearsToFire} years` : 'you are on track'}. Keep compounding — every year at this rate cuts more time off your sentence.`,
      priority: 4,
    });
  }

  // ── Progress milestone callout ───────────────────────────────────────
  if (fire.progress >= 10 && fire.progress < 90) {
    const pct = fire.progress.toFixed(1);
    const remaining = fire.num - fire.current;
    tips.push({
      type: 'milestone',
      icon: '◈',
      title: `${pct}% of the way to financial independence`,
      body: `You have ${fmtAmt(remaining, snap.currency)} left to reach your FIRE number of ${fmtAmt(fire.num, snap.currency)}. At your current annual savings rate, that's ${isFinite(fire.yearsToFire) ? `${fire.yearsToFire} years away` : 'a long road — increase annual savings to close the gap faster'}.`,
      priority: 5,
    });
  }

  // ── Needs > 60% — lifestyle inflation risk ───────────────────────────
  if (rates.needs > 60 && month.income > 0) {
    tips.push({
      type: 'warning',
      icon: '↑',
      title: 'Essential spending is very high',
      body: `Needs are consuming ${rates.needs.toFixed(0)}% of income. The 50/30/20 rule targets 50%. High fixed costs — especially rent or mortgage — compress your ability to save. Consider whether any essential costs can be reduced or offset by increased income.`,
      priority: 6,
    });
  }

  // ── No income logged ─────────────────────────────────────────────────
  if (month.income === 0 && snap.txCount > 0) {
    tips.push({
      type: 'info',
      icon: 'ℹ',
      title: 'No income logged this month',
      body: `Log your income for the month to unlock savings rate tracking, grade calculation, and guidance personalised to your actual numbers. Without income data, projections are based on your FIRE settings only.`,
      priority: 7,
    });
  }

  return tips.sort((a, b) => a.priority - b.priority).slice(0, 4);
}



// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtAmt(n, currency = 'USD') {
  const sym = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }[currency] || '$';
  if (n >= 1000000) return `${sym}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${sym}${(n / 1000).toFixed(0)}k`;
  return `${sym}${Math.round(n)}`;
}
