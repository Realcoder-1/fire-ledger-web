import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './AppDashboard.css';
import { GuidanceInsightsPanel, GuidanceHomeWidget } from '../components/GuidancePanel';
import '../components/Guidance.css';

// ─── SVG Icon System — no emojis ─────────────────────────────────────────────
const Icon = {
  Dashboard: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" /></svg>,
  Transactions: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M13 10l-2 2 2 2M11 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Insights: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13L5.5 8.5L8.5 10.5L12 5L14 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Fire: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14c3.314 0 5-2 5-4.5 0-1.5-.8-2.8-2-3.5.2 1-.3 2-1 2.5 0-2-1.5-4-3-5 0 2.5-2 3.5-2 5.5C5 11.5 6 14 8 14z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>,
  Projections: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12L6 7l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="13" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M2 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Export: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Guide: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M8 11V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="5.5" r="0.75" fill="currentColor" /></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  LogOut: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M9.5 9.5L12 7l-2.5-2.5M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Plus: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  ChevLeft: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  ChevRight: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  ArrowUp: () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9.5V1.5M2 5L5.5 1.5 9 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  ArrowDown: () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1.5v8M2 6l3.5 3.5L9 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  ArrowRight: () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Star: () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1l1.1 3.4H10L7.4 6.5l1 3.5-2.9-2-2.9 2 1-3.5L1 4.4h3.4L5.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>,
  Import: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M1.5 10v1.5a.5.5 0 00.5.5h8.5a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Flame: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18c4 0 6.5-2.5 6.5-6 0-2.2-1.1-3.8-2.8-4.8.2 1.2-.4 2.5-1.2 3.2C12.5 7.2 10 5 8 3.5c0 3-2.5 4.2-2.5 6.5C5.5 14.5 7 18 10 18z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Book: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M10 2v3h3M5 7h5M5 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Target: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="8" r="1" fill="currentColor" /></svg>,
  Wallet: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" /><circle cx="11.5" cy="10" r="1" fill="currentColor" /><path d="M5 2h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 9.5V11h1.5l5-5L7 4.5l-5 5zM10.5 3l-.8-.8a.7.7 0 00-1 0L8 2.9l1.5 1.5.7-.7a.7.7 0 000-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>,
  Lightning: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 2L4 9h5.5L6.5 14l6.5-7H7.5L9.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M11 3.5l-.8 8a.5.5 0 01-.5.5H4.3a.5.5 0 01-.5-.5L3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Coffee: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h8v6a3 3 0 01-3 3H6a3 3 0 01-3-3V5z" stroke="currentColor" strokeWidth="1.4" /><path d="M11 7h1.5A1.5 1.5 0 0114 8.5v0A1.5 1.5 0 0112.5 10H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M6 3c0-1 1-1 1-2M9 3c0-1 1-1 1-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
};

// ─── Currency config ──────────────────────────────────────────────────────────
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
};

const DEFAULT_CATS = {
  needs: ['Rent', 'Groceries', 'Utilities', 'Transport', 'Insurance', 'Healthcare'],
  wants: ['Dining', 'Entertainment', 'Shopping', 'Subscriptions', 'Travel', 'Hobbies'],
  savings: ['Investments', 'Emergency Fund', 'Retirement', 'Savings'],
};

// ─── FIRE math ────────────────────────────────────────────────────────────────
function calcFIRE(annualExp, annualSav, currentSav, returnRate = 0.07) {
  const fireNum = annualExp * 25;
  if (annualSav <= 0) return { fireNum, years: Infinity, progress: 0 };
  let years = 0, bal = currentSav;
  while (bal < fireNum && years < 100) { bal = bal * (1 + returnRate) + annualSav; years++; }
  return { fireNum, years, progress: Math.min((currentSav / fireNum) * 100, 100) };
}

function buildProjection(currentSav, annualSav, annualExp, years = 35) {
  const fireNum = annualExp * 25;
  const pts = [];
  let bal = currentSav;
  for (let y = 0; y <= years; y++) { pts.push({ year: y, value: Math.round(bal), target: Math.round(fireNum) }); bal = bal * 1.07 + annualSav; }
  return pts;
}

function runMonteCarlo(currentSav, annualSav, annualExp, simYears = 35, runs = 500) {
  const fireNum = annualExp * 25;
  let success = 0;
  const pct = { p10: [], p50: [], p90: [] };
  const all = [];
  for (let r = 0; r < runs; r++) {
    let bal = currentSav; const path = [bal];
    for (let y = 0; y < simYears; y++) {
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      bal = Math.max(0, bal * (1 + 0.07 + 0.12 * z) + annualSav);
      path.push(Math.round(bal));
    }
    all.push(path); if (bal >= fireNum) success++;
  }
  for (let y = 0; y <= simYears; y++) {
    const v = all.map(p => p[y]).sort((a, b) => a - b);
    pct.p10.push(v[Math.floor(runs * 0.1)]); pct.p50.push(v[Math.floor(runs * 0.5)]); pct.p90.push(v[Math.floor(runs * 0.9)]);
  }
  return { successRate: Math.round((success / runs) * 100), percentiles: pct, fireNum };
}

const makeFmt = (currency) => {
  const { symbol } = CURRENCIES[currency] || CURRENCIES.USD;
  return {
    fmt: n => `${symbol}${Math.abs(n) >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : Math.abs(n) >= 1000 ? (n / 1000).toFixed(0) + 'k' : Math.round(n)}`,
    fmtD: n => `${symbol}${Math.abs(parseFloat(n)).toFixed(2)}`,
    sym: symbol,
  };
};

const TYPE_COLOR = { income: '#52c98a', need: '#e05c5c', want: '#e0825c', saving: '#fbbf24' };
const TYPE_LABEL = { income: 'Income', need: 'Need', want: 'Want', saving: 'Saving' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const amtColor = t => t === 'income' ? 'var(--green)' : t === 'saving' ? 'var(--gold)' : 'var(--red)';
const fmtInput = v => { if (!v && v !== 0) return ''; const n = v.toString().replace(/[^0-9.]/g, ''); const p = n.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); };

function parseDateStr(raw) {
  if (!raw) return new Date().toISOString().split('T')[0];
  const s = raw.replace(/['"]/g, '').trim();
  const native = new Date(s);
  if (!isNaN(native.getTime()) && s.length > 5) {
    return native.toISOString().split('T')[0];
  }
  const m = s.match(/(\d{1,4})[/.-]([\d]{1,2})[/.-](\d{2,4})/);
  if (m) {
    let [, a, b, cc] = m;
    const year = cc.length === 2 ? '20' + cc : cc;
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${cc.padStart(2, '0')}`;
    if (parseInt(a) > 12) return `${year}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
    return `${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
  }
  const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const ml = s.toLowerCase().match(/(\d{1,2})\s*([a-z]{3})[a-z]*\s*(\d{2,4})/);
  if (ml) { const y = ml[3].length === 2 ? '20' + ml[3] : ml[3]; return `${y}-${String(months[ml[2]] || 1).padStart(2, '0')}-${ml[1].padStart(2, '0')}`; }
  const mr = s.toLowerCase().match(/([a-z]{3})[a-z]*\s*(\d{1,2})[,\s]+(\d{2,4})/);
  if (mr) { const y = mr[3].length === 2 ? '20' + mr[3] : mr[3]; return `${y}-${String(months[mr[1]] || 1).padStart(2, '0')}-${mr[2].padStart(2, '0')}`; }
  return new Date().toISOString().split('T')[0];
}

function parseAmount(raw) {
  if (!raw) return 0;
  const clean = raw.toString().replace(/[^0-9.-]/g, '');
  return Math.abs(parseFloat(clean)) || 0;
}

function detectType(desc, cat, rawType) {
  const t = (desc + ' ' + cat + ' ' + rawType).toLowerCase();
  const typeMap = {
    income: ['salary', 'income', 'credit', 'deposit', 'received', 'earning', 'revenue', 'refund', 'transfer in', 'payment received', 'payroll'],
    saving: ['investment', 'invest', 'saving', 'ira', '401k', 'pension', 'retirement', 'fund', 'sip', 'mutual', 'etf', 'stocks', 'brokerage'],
    want: ['restaurant', 'dining', 'cafe', 'coffee', 'amazon', 'netflix', 'spotify', 'entertainment', 'shopping', 'uber', 'lyft', 'hotel', 'travel', 'holiday', 'leisure', 'clothing', 'apparel', 'gym', 'subscription'],
    need: ['rent', 'mortgage', 'grocery', 'groceries', 'supermarket', 'pharmacy', 'medical', 'health', 'insurance', 'utility', 'utilities', 'electric', 'water', 'gas', 'internet', 'phone', 'transport', 'fuel', 'petrol', 'commute'],
  };
  for (const [type, words] of Object.entries(typeMap)) {
    if (words.some(w => t.includes(w))) return type;
  }
  return 'need';
}

function smartParseCSV(text) {
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length < 2) return { rows: [], error: 'File appears empty or has only one row.' };

  const sample = rawLines[0];
  const delim = sample.includes('\t') ? '\t' : sample.includes(';') ? ';' : ',';

  const parseLine = line => {
    const cols = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === delim && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  };

  let headerIdx = 0;
  for (let i = 0; i < Math.min(8, rawLines.length); i++) {
    const cols = parseLine(rawLines[i]);
    const alphaCount = cols.filter(c => /[a-zA-Z]{2,}/.test(c)).length;
    if (alphaCount >= 2) { headerIdx = i; break; }
  }

  const headers = parseLine(rawLines[headerIdx]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const detect = (...kws) => { for (const kw of kws) { const idx = headers.findIndex(h => h.includes(kw)); if (idx !== -1) return idx; } return -1; };

  const dateIdx = detect('date', 'dt', 'time', 'transactiondate', 'valuedate', 'postingdate', 'period');
  const descIdx = detect('description', 'desc', 'narrative', 'memo', 'narration', 'payee', 'detail', 'particulars', 'name', 'reference', 'merchant', 'transaction', 'note', 'remarks');
  const amtIdx = detect('amount', 'amt', 'value', 'sum', 'total');
  const debitIdx = detect('debit', 'withdrawal', 'dr', 'withdrawals', 'expense', 'debitamount');
  const creditIdx = detect('credit', 'deposit', 'cr', 'deposits', 'creditamount');
  const catIdx = detect('category', 'cat', 'type', 'subcategory', 'group', 'classification');

  const rows = rawLines.slice(headerIdx + 1).map((line, lineNum) => {
    if (!line.trim()) return null;
    const cols = parseLine(line);
    const get = idx => (idx >= 0 && idx < cols.length) ? cols[idx].replace(/^["']|["']$/g, '').trim() : '';

    const rawDesc = get(descIdx);
    const rawCat = get(catIdx);
    const rawDate = get(dateIdx);

    let amount = 0;
    let type = 'need';

    if (amtIdx !== -1) {
      const raw = get(amtIdx);
      const signed = parseFloat(raw.replace(/[^0-9.-]/g, ''));
      amount = Math.abs(signed);
      if (!isNaN(signed) && signed > 0) type = 'income';
    } else if (debitIdx !== -1 || creditIdx !== -1) {
      const debit = parseAmount(get(debitIdx));
      const credit = parseAmount(get(creditIdx));
      if (credit > 0 && debit === 0) { amount = credit; type = 'income'; }
      else if (debit > 0) { amount = debit; type = 'need'; }
      else { amount = Math.max(credit, debit); }
    }

    if (!amount || amount <= 0) return null;

    const detectedType = detectType(rawDesc, rawCat, type === 'income' ? 'income' : '');
    if (type !== 'income') type = detectedType;

    const date = parseDateStr(rawDate);

    return {
      date,
      description: (rawDesc || rawCat || `Transaction ${lineNum + 1}`).slice(0, 100),
      type,
      category: rawCat.slice(0, 50),
      amount,
      recurring: false,
    };
  }).filter(Boolean);

  return { rows };
}

// ─── Projection chart ─────────────────────────────────────────────────────────
function ProjectionChart({ points, fireNum, sym, mcResult }) {
  const W = 560, H = 200, PAD = { top: 16, right: 24, bottom: 32, left: 62 };
  const maxVal = Math.max(fireNum * 1.2, ...points.map(p => p.value), mcResult ? Math.max(...mcResult.percentiles.p90) : 0);
  const xS = y => PAD.left + (y / (points.length - 1)) * (W - PAD.left - PAD.right);
  const yS = v => PAD.top + (1 - v / maxVal) * (H - PAD.top - PAD.bottom);
  const pathD = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');
  const aD = (top, bot) => { const t = top.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' '); const b = [...bot].reverse().map((v, i) => `L${xS(bot.length - 1 - i).toFixed(1)},${yS(v).toFixed(1)}`).join(' '); return `${t} ${b} Z`; };
  const fireY = yS(fireNum);
  const crossIdx = points.findIndex(p => p.value >= fireNum);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: maxVal * f, y: yS(maxVal * f) }));
  const xTicks = points.filter((_, i) => i % 5 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="fl-proj-chart" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="proj-fill-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--purple-light)" stopOpacity="0.25" /><stop offset="100%" stopColor="var(--purple-light)" stopOpacity="0" /></linearGradient>
        <linearGradient id="proj-mc-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--purple-light)" stopOpacity="0.06" /><stop offset="100%" stopColor="var(--purple-light)" stopOpacity="0.01" /></linearGradient>
      </defs>
      {yTicks.map(t => <g key={t.v}><line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" /><text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.25)">{t.v >= 1000000 ? `${sym}${(t.v / 1000000).toFixed(1)}M` : t.v >= 1000 ? `${sym}${(t.v / 1000).toFixed(0)}k` : `${sym}${Math.round(t.v)}`}</text></g>)}
      {xTicks.map(p => <text key={p.year} x={xS(p.year)} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)">Yr {p.year}</text>)}
      {mcResult && <path d={aD(mcResult.percentiles.p90, mcResult.percentiles.p10)} fill="url(#proj-mc-band)" />}
      {mcResult && <><path d={pathD(mcResult.percentiles.p90)} fill="none" stroke="var(--purple-light)" strokeWidth="1" strokeDasharray="3 4" opacity="0.25" /><path d={pathD(mcResult.percentiles.p10)} fill="none" stroke="var(--red)" strokeWidth="1" strokeDasharray="3 4" opacity="0.25" /></>}
      <path d={`${pathD(points.map(p => p.value))} L${xS(points.length - 1)},${yS(0)} L${xS(0)},${yS(0)} Z`} fill="url(#proj-fill-grad)" />
      {fireY > PAD.top && fireY < H - PAD.bottom && <><line x1={PAD.left} y1={fireY} x2={W - PAD.right} y2={fireY} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.6" /><text x={W - PAD.right + 3} y={fireY + 4} fontSize="9" fill="var(--gold)" opacity="0.7">FIRE</text></>}
      {crossIdx > 0 && <><circle cx={xS(crossIdx)} cy={yS(points[crossIdx].value)} r="4.5" fill="var(--green)" opacity="0.9" /><line x1={xS(crossIdx)} y1={PAD.top} x2={xS(crossIdx)} y2={H - PAD.bottom} stroke="var(--green)" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" /><text x={xS(crossIdx)} y={PAD.top - 3} textAnchor="middle" fontSize="9" fill="var(--green)">Free</text></>}
      <path d={pathD(points.map(p => p.value))} fill="none" stroke="var(--purple-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xS(0)} cy={yS(points[0].value)} r="3.5" fill="var(--purple-light)" />
    </svg>
  );
}

// ─── Walkthrough Tour ─────────────────────────────────────────────────────────
const TOUR_STEPS = [
  { tab: 'home', title: 'Dashboard', body: 'Your financial independence overview. The ring shows your FIRE progress in real time. The hours metric shows exactly how much work time remains before you\'re free.' },
  { tab: 'home', title: 'Log a Transaction', body: 'Tap "+ Log transaction" to record income, expenses, or savings. Every transaction updates your freedom date instantly — Income, Need, Want, or Saving.' },
  { tab: 'fire', title: 'FIRE Calculator', body: 'Enter your annual expenses, annual savings, and current savings. Your exact FIRE number and freedom date calculate instantly. Use the What-If slider to model extra savings.' },
  { tab: 'projections', title: 'Wealth Projections', body: 'Your portfolio trajectory charted over time. Run 500 Monte Carlo simulations to stress-test your plan across different market scenarios.' },
  { tab: 'insights', title: 'Insights & Grade', body: 'Your savings grade, 50/30/20 breakdown, and AI guidance after every transaction batch. The grade tells you exactly where you stand.' },
  { tab: 'networth', title: 'Net Worth Tracker', body: 'Assets minus liabilities — see your full financial picture. Tracks your real net worth and what percentage of your FIRE number you\'ve already reached.' },
  { tab: 'export', title: 'Export & Import', body: 'Export to Excel or CSV anytime. Import from any bank CSV — the smart importer handles any column format, date style, and debit/credit split automatically.' },
];

function TourOverlay({ step, onNext, onSkip }) {
  if (step < 0 || step >= TOUR_STEPS.length) return null;
  const s = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  return (
    <div className="fl-tour-overlay">
      <div className="fl-tour-card">
        <div className="fl-tour-header">
          <div className="fl-tour-progress">
            {TOUR_STEPS.map((_, i) => <div key={i} className={`fl-tour-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />)}
          </div>
          <button className="fl-tour-skip" onClick={onSkip}>Skip tour</button>
        </div>
        <h3 className="fl-tour-title">{s.title}</h3>
        <p className="fl-tour-body">{s.body}</p>
        <div className="fl-tour-footer">
          <span className="fl-tour-count">{step + 1} of {TOUR_STEPS.length}</span>
          <button className="fl-btn-primary" onClick={onNext} style={{ padding: '8px 20px', fontSize: 13 }}>
            {isLast ? 'Done ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guide page ───────────────────────────────────────────────────────────────
function GuidePage() {
  const [active, setActive] = useState(0);
  const sections = [
    {
      title: 'Getting Started',
      icon: <Icon.Lightning />,
      steps: [
        { title: 'Set your FIRE numbers', body: 'Go to FIRE Calc and enter your annual expenses, annual savings, and current savings. These three numbers power every calculation in the app. Annual expenses × 25 = your FIRE number — the amount you need invested to retire.' },
        { title: 'Log your first transaction', body: 'Click "+ Log" in the top right. Choose Income, Need, Want, or Saving. Income is money coming in. Needs are essential expenses — rent, groceries, utilities. Wants are discretionary — dining, entertainment, shopping. Savings are money you\'re investing.' },
        { title: 'Check your dashboard', body: 'Your dashboard updates in real time. The hero card shows years to financial independence. The four metric cards show this month\'s income, spending, savings, and your savings grade.' },
      ]
    },
    {
      title: 'Logging Transactions',
      icon: <Icon.Transactions />,
      steps: [
        { title: 'Four transaction types', body: 'Income — salary, freelance, dividends, any money you receive. Need — rent, groceries, utilities, transport, insurance. Want — dining out, Netflix, clothing, travel, anything non-essential. Saving — index funds, pension contributions, emergency fund deposits.' },
        { title: 'Quick amounts', body: 'Use the $10, $25, $50, $100 quick buttons for common amounts. For other amounts type directly into the field. The currency symbol shows your selected currency.' },
        { title: 'Recurring transactions', body: 'Check "Recurring" for fixed monthly expenses like rent or subscriptions. This helps identify patterns in your spending over time.' },
        { title: 'Importing from a bank', body: 'Go to Export & Import → Smart Import. Download a CSV from your bank\'s website and upload it. The importer auto-detects column names and date formats — no reformatting needed.' },
      ]
    },
    {
      title: 'Understanding FIRE',
      icon: <Icon.Fire />,
      steps: [
        { title: 'The 4% rule', body: 'The FIRE number is calculated using the 4% rule: your annual expenses × 25. If you can withdraw 4% of your portfolio per year and it covers your expenses, you\'re financially independent. A $40,000/year lifestyle needs a $1,000,000 portfolio.' },
        { title: 'The 7% return assumption', body: 'The calculator assumes 7% average annual investment returns — a conservative real (inflation-adjusted) return for a diversified index fund portfolio. Your actual returns will vary.' },
        { title: 'Savings rate matters most', body: 'Savings rate — the percentage of income you save — is the single biggest lever. A 50% savings rate means you can retire in roughly 17 years from zero. A 10% rate takes 40+ years. The Grade on your dashboard scores your monthly rate.' },
        { title: 'The 50/30/20 rule', body: 'A classic budgeting framework: 50% of income on Needs, 30% on Wants, 20% on Savings. FIRE followers typically aim for 40/20/40 or even 30/20/50. Check your breakdown on the Insights page.' },
      ]
    },
    {
      title: 'Projections & Monte Carlo',
      icon: <Icon.Projections />,
      steps: [
        { title: 'What the projection chart shows', body: 'The Projections page charts your expected portfolio value over time at a steady 7% annual return. The gold dashed line is your FIRE target. The green dot marks the year your portfolio crosses that target.' },
        { title: 'Monte Carlo simulation', body: 'Real markets are unpredictable. Monte Carlo runs 500 simulations with randomised yearly returns (average 7%, standard deviation 12%) to model different possible futures. The success rate is the percentage of simulations where you reached FIRE within your target years.' },
        { title: 'Reading the bands', body: 'P90 (optimistic) — the top 10% of outcomes. P50 (median) — the middle outcome. P10 (pessimistic) — the bottom 10%. A 70–80% success rate is generally considered solid for FIRE planning.' },
        { title: 'Disclaimer', body: 'Simulations are illustrative only. They do not account for inflation, tax, fees, career changes, or sequence-of-returns risk. Consult a qualified financial adviser before making retirement decisions.' },
      ]
    },
    {
      title: 'Exporting Your Data',
      icon: <Icon.Export />,
      steps: [
        { title: 'Excel / Google Sheets report', body: 'Export & Import → Excel Report downloads a formatted CSV with your FIRE summary at the top and all transactions below. Open in Excel, Google Sheets, or Apple Numbers.' },
        { title: 'Raw CSV export', body: 'Export & Import → CSV Export downloads a clean transaction list. Use this to import into other finance apps like YNAB, Mint, or a personal spreadsheet.' },
        { title: 'Importing data', body: 'Upload any CSV from your bank or another tool. The smart importer handles different column names, date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD), and debit/credit split columns. Preview before confirming.' },
      ]
    },
  ];

  return (
    <div className="fl-page">
      <div className="fl-page-top">
        <div>
          <h1 className="fl-title">Guide</h1>
          <p className="fl-subtitle">Everything you need to know to get the most out of FIRE Ledger</p>
        </div>
      </div>

      <div className="fl-guide-layout">
        <nav className="fl-guide-nav">
          {sections.map((s, i) => (
            <button key={i} className={`fl-guide-nav-item ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>
              <span className="fl-guide-nav-icon">{s.icon}</span>
              <span>{s.title}</span>
              {active === i && <div className="fl-guide-nav-bar" />}
            </button>
          ))}
        </nav>

        <div className="fl-guide-content">
          <div className="fl-guide-section-title">
            <span className="fl-guide-section-icon">{sections[active].icon}</span>
            <h2>{sections[active].title}</h2>
          </div>
          <div className="fl-guide-steps">
            {sections[active].steps.map((step, i) => (
              <div key={i} className="fl-guide-step">
                <div className="fl-guide-step-num">{i + 1}</div>
                <div className="fl-guide-step-body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {active === 0 && (
            <div className="fl-guide-ref">
              <h4>Quick Reference</h4>
              <div className="fl-guide-ref-grid">
                {[
                  { label: 'FIRE Number', value: 'Annual expenses × 25', color: 'var(--gold)' },
                  { label: 'Return assumption', value: '7% per year', color: 'var(--purple-light)' },
                  { label: 'Safe withdrawal rate', value: '4% per year', color: 'var(--green)' },
                  { label: 'Target savings rate', value: '20%+ (FIRE: 40%+)', color: 'var(--blue)' },
                ].map((r, i) => (
                  <div key={i} className="fl-guide-ref-item">
                    <span className="fl-guide-ref-label">{r.label}</span>
                    <span className="fl-guide-ref-value" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 2 && (
            <div className="fl-guide-ref">
              <h4>Savings Rate vs Years to FIRE</h4>
              <div className="fl-guide-fire-table">
                {[
                  { rate: '10%', years: '40+ yrs' }, { rate: '20%', years: '37 yrs' },
                  { rate: '30%', years: '28 yrs' }, { rate: '40%', years: '22 yrs' },
                  { rate: '50%', years: '17 yrs' }, { rate: '60%', years: '12 yrs' },
                  { rate: '70%', years: '8 yrs' }, { rate: '80%', years: '5 yrs' },
                ].map((r, i) => (
                  <div key={i} className="fl-guide-fire-row">
                    <span className="fl-guide-fire-rate" style={{ color: parseInt(r.rate) >= 50 ? 'var(--green)' : parseInt(r.rate) >= 30 ? 'var(--gold)' : 'var(--t2)' }}>{r.rate}</span>
                    <div className="fl-guide-fire-bar-track"><div className="fl-guide-fire-bar" style={{ width: `${parseInt(r.rate)}%`, background: parseInt(r.rate) >= 50 ? 'var(--green)' : parseInt(r.rate) >= 30 ? 'var(--gold)' : 'var(--purple-light)' }} /></div>
                    <span className="fl-guide-fire-yrs">{r.years}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AppDashboard() {
  const { user, signOut, isLifetime } = useAuth();

  const [tab, setTab] = useState('home');
  const [txs, setTxs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [tourStep, setTourStep] = useState(-1);
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [fire, setFire] = useState({ annualExpenses: 40000, annualSavings: 20000, currentSavings: 50000 });
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState(null);
  const [whatIf, setWhatIf] = useState(0);
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [importModal, setImportModal] = useState(false);
  const [importPreview, setImportPrev] = useState([]);
  const [importAll, setImportAll] = useState([]);
  const [milestone, setMilestone] = useState(null);
  const [rawAmt, setRawAmt] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [mcResult, setMcResult] = useState(null);
  const [mcRunning, setMcRunning] = useState(false);
  const [projYears, setProjYears] = useState(35);
  const [inflation, setInflation] = useState(3);
  // ── Active FIRE mode shared between FIRE calc and dashboard ──
  const [fireMode, setFireMode] = useState('standard');
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [swr, setSwr] = useState(4);
  const [contribMode, setContribMode] = useState('annual');
  const [contribs, setContribs] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [nw, setNw] = useState({ houseValue: 0, carValue: 0, cashSavings: 0, investments: 0, otherAssets: 0, creditCard: 0, studentLoan: 0, mortgage: 0, personalLoan: 0, otherLiabilities: 0 });
  const [cg, setCg] = useState({ initial: 0, years: 10, growthRate: 7, inflationRate: 3, contribType: 'annual', contribution: 0, compounding: 'annual' });
  const [cgResult, setCgResult] = useState(null);
  const [form, setForm] = useState({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
  const addAmtRef = useRef(null);
  const fileRef = useRef(null);
  const userId = user?.id;
  const { fmt, fmtD, sym } = makeFmt(currency);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  // ── FIX: track onboarding completion separately to prevent repeat on reload ──
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    if (isLifetime) {
      // For lifetime/session users, only show onboard once per session
      const sessionOnboarded = sessionStorage.getItem(`fl_onboarded_${userId}`);
      if (!sessionOnboarded) {
        setShowOnboard(true);
      }
      setLoading(false);
      return;
    }
    const [txRes, setRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    ]);
    if (txRes.data) setTxs(txRes.data);
    if (setRes.data) {
      if (setRes.data.fire_settings) setFire(setRes.data.fire_settings);
      if (setRes.data.custom_categories) setCats(setRes.data.custom_categories);
      if (setRes.data.currency) setCurrency(setRes.data.currency);
      if (setRes.data.current_age) setCurrentAge(setRes.data.current_age);
      if (setRes.data.retire_age) setRetireAge(setRes.data.retire_age);
      if (setRes.data.fire_mode) setFireMode(setRes.data.fire_mode);
      // Settings row exists → onboarding was completed, never show again
    } else {
      // No settings row → first time ever for this account
      setShowOnboard(true);
    }
    setLoading(false);
  }, [userId, isLifetime]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const p = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings).progress;
    if (p >= 75 && p < 76) setMilestone('You reached 75% of your FIRE number');
    else if (p >= 50 && p < 51) setMilestone('Halfway to financial independence');
    else if (p >= 25 && p < 26) setMilestone('25% of your FIRE number reached');
  }, [fire]);

  useEffect(() => {
    if (!showAdd) return;
    const h = e => { if (e.key === 'Escape') closeModal(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) (editTx ? saveEdit : addTx)(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdd, form]);

  const saveSettings = async (fs, cc, cur, age, retire, fm) => {
    if (isLifetime) return;
    await supabase.from('user_settings').upsert({
      user_id: userId,
      fire_settings: fs || fire,
      custom_categories: cc || cats,
      currency: cur || currency,
      current_age: age !== undefined ? age : currentAge,
      retire_age: retire !== undefined ? retire : retireAge,
      fire_mode: fm !== undefined ? fm : fireMode,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  };

  const addTx = async () => {
    if (!form.amount || !form.description) return;
    const base = { amount: parseFloat(form.amount), description: form.description, type: form.type, category: form.category, date: form.date, recurring: form.recurring };
    if (isLifetime) {
      const tx = { ...base, id: Date.now() };
      setTxs(p => [tx, ...p]);
      showToast(`${TYPE_LABEL[form.type]} logged (session only)`);
    } else {
      const { data } = await supabase.from('transactions').insert({ ...base, user_id: userId }).select().single();
      if (data) { setTxs(p => [data, ...p]); showToast(`${TYPE_LABEL[form.type]} logged`); }
    }
    setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
    setRawAmt(''); setShowAdd(false);
  };

  const deleteTx = async id => {
    if (!isLifetime) await supabase.from('transactions').delete().eq('id', id);
    setTxs(p => p.filter(t => t.id !== id));
    showToast('Deleted', 'error');
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setForm({ amount: tx.amount.toString(), description: tx.description, type: tx.type, category: tx.category || '', date: tx.date, recurring: tx.recurring });
    setRawAmt(fmtInput(tx.amount.toString()));
    setShowAdd(true);
  };

  const saveEdit = async () => {
    if (!form.amount || !form.description) return;
    const updates = { amount: parseFloat(form.amount), description: form.description, type: form.type, category: form.category, date: form.date, recurring: form.recurring };
    if (isLifetime) {
      setTxs(p => p.map(t => t.id === editTx.id ? { ...t, ...updates } : t));
      showToast('Transaction updated (session only)');
    } else {
      const { data } = await supabase.from('transactions').update(updates).eq('id', editTx.id).select().single();
      if (data) { setTxs(p => p.map(t => t.id === editTx.id ? data : t)); showToast('Transaction updated'); }
    }
    setEditTx(null); setShowAdd(false);
    setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
    setRawAmt('');
  };

  const closeModal = () => {
    setShowAdd(false); setEditTx(null);
    setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
    setRawAmt('');
  };

  // ── Delete all user data ──
  const deleteAllData = async () => {
    if (isLifetime) {
      setTxs([]);
      setDeleteConfirm(false);
      showToast('Session data cleared');
      return;
    }
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('user_id', userId),
    ]);
    setTxs([]);
    setFire({ annualExpenses: 40000, annualSavings: 20000, currentSavings: 50000 });
    setCats(DEFAULT_CATS);
    setDeleteConfirm(false);
    showToast('All data deleted', 'error');
    // Re-show onboarding since settings are gone
    setOnboardStep(0);
    setShowOnboard(true);
  };

  const handleImportFile = e => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = '';
    const reader = new FileReader();

    const processText = text => {
      const { rows, error } = smartParseCSV(text);
      if (error || !rows || rows.length === 0) {
        showToast('No transactions detected — check your file has date and amount columns', 'error');
        return;
      }
      setImportAll(rows); setImportPrev(rows.slice(0, 5)); setImportModal(true);
    };

    if (file.name.toLowerCase().endsWith('.pdf')) {
      reader.onload = ev => {
        const raw = ev.target.result || '';
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
        const txLines = lines.filter(l =>
          /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(l) && /\d+\.\d{2}/.test(l)
        );
        if (txLines.length === 0) {
          showToast('PDF could not be read — please export as CSV from your bank instead', 'error');
          return;
        }
        const pseudoCSV = 'Date,Description,Amount\n' + txLines.map(l => {
          const dateM = l.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
          const amtM = l.match(/(\d[\d,]*\.\d{2})/g);
          const date = dateM ? dateM[0] : '';
          const amount = amtM ? amtM[amtM.length - 1].replace(/,/g, '') : '0';
          const desc = l.replace(date, '').replace(amount, '').replace(/[",]/g, ' ').trim().slice(0, 80);
          return `${date},"${desc}",${amount}`;
        }).join('\n');
        processText(pseudoCSV);
      };
      reader.readAsText(file);
    } else {
      reader.onload = ev => processText(ev.target.result);
      reader.readAsText(file);
    }
  };

  const confirmImport = async () => {
    if (isLifetime) {
      const rows = importAll.map((t, i) => ({ ...t, id: Date.now() + i }));
      setTxs(p => [...rows, ...p]);
      showToast(`${rows.length} transactions imported (session only)`);
    } else {
      const { data } = await supabase.from('transactions').insert(importAll.map(t => ({ ...t, user_id: userId }))).select();
      if (data) { setTxs(p => [...data, ...p]); showToast(`${data.length} transactions imported`); }
    }
    setImportModal(false); setImportPrev([]); setImportAll([]);
  };

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Type', 'Category', 'Amount', 'Recurring'], ...txs.map(t => [t.date, `"${t.description}"`, t.type, t.category || '', t.amount, t.recurring ? 'Yes' : 'No'])];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })); a.download = 'fire-ledger.csv'; a.click();
    showToast('CSV exported');
  };

  const exportExcel = () => {
    const fc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
    const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const rows = [['FIRE LEDGER — FINANCIAL REPORT', '', '', '', '', ''],
    [`Currency: ${currency} · Generated: ${new Date().toLocaleDateString()}`, '', '', '', '', ''], ['', '', '', '', '', ''],
    ['FIRE NUMBER', fc.fireNum, '', 'CURRENT SAVINGS', fire.currentSavings, ''],
    ['YEARS TO FIRE', fc.years === Infinity ? 'N/A' : fc.years, '', 'PROGRESS', `${fc.progress.toFixed(1)}%`, ''],
    ['ANNUAL EXPENSES', fire.annualExpenses, '', 'ANNUAL SAVINGS', fire.annualSavings, ''], ['', '', '', '', '', ''],
    ['TOTAL INCOME', inc, '', 'SAVINGS RATE', inc > 0 ? `${((txs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0) / inc) * 100).toFixed(1)}%` : 0, ''],
    ['', '', '', '', '', ''],
    ['Date', 'Description', 'Type', 'Category', 'Amount', 'Recurring'],
    ...txs.map(t => [t.date, t.description, t.type, t.category || '', t.amount, t.recurring ? 'Yes' : 'No'])];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'fire-ledger-report.csv'; a.click();
    showToast('Report exported');
  };

  const runMC = () => { setMcRunning(true); setTimeout(() => { setMcResult(runMonteCarlo(fire.currentSavings, fire.annualSavings, fire.annualExpenses, projYears)); setMcRunning(false); }, 50); };

  // Computed
  const now = new Date();
  const isCurr = selMonth === now.getMonth() && selYear === now.getFullYear();
  const mTxs = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === selMonth && d.getFullYear() === selYear; });
  const income = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const needs = mTxs.filter(t => t.type === 'need').reduce((s, t) => s + t.amount, 0);
  const wants = mTxs.filter(t => t.type === 'want').reduce((s, t) => s + t.amount, 0);
  const savings = mTxs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const savRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  const fireCalc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
  const fireWI = calcFIRE(fire.annualExpenses, fire.annualSavings + (whatIf * 12), fire.currentSavings);
  const todayStr = now.toISOString().split('T')[0];
  const todaySpd = txs.filter(t => t.date === todayStr && (t.type === 'need' || t.type === 'want')).reduce((s, t) => s + t.amount, 0);
  const streak = (() => { let s = 0; for (let i = 0; i < 30; i++) { const d = new Date(now); d.setDate(d.getDate() - i); if (txs.some(t => t.date === d.toISOString().split('T')[0])) s++; else break; } return s; })();
  const filtered = filterType === 'all' ? txs : txs.filter(t => t.type === filterType);
  const gradeRaw = parseFloat(savRate);
  const grade = gradeRaw >= 60 ? 'A+' : gradeRaw >= 50 ? 'A' : gradeRaw >= 40 ? 'B' : gradeRaw >= 30 ? 'C' : 'D';
  const gradeClr = gradeRaw >= 50 ? 'var(--green)' : gradeRaw >= 35 ? 'var(--gold)' : 'var(--red)';
  const projPts = buildProjection(fire.currentSavings, fire.annualSavings, fire.annualExpenses, projYears);

  // ── FIRE mode derived numbers (shared between FIRE Calc and Dashboard) ──
  const yearsToGrow = Math.max(1, retireAge - currentAge);
  const annualContrib = contribMode === 'monthly' ? contribs * 12 : contribs;
  const leanNum = fire.annualExpenses * 0.75 * 25;
  const fatNum = fire.annualExpenses * 1.5 * 25;
  const coastAmt = Math.max(0, (fireCalc.fireNum - annualContrib * ((Math.pow(1.07, yearsToGrow) - 1) / 0.07)) / Math.pow(1.07, yearsToGrow));
  const coastReached = fire.currentSavings >= coastAmt;
  // Barista FIRE: semi-retire, need part-time income to cover ~40% of expenses
  const baristaPartTimeIncome = fire.annualExpenses * 0.4;
  const baristaNetExp = fire.annualExpenses * 0.6;
  const baristaNum = baristaNetExp * 25;
  const baristaReached = fire.currentSavings >= baristaNum;

  const activeModeNum = fireMode === 'lean' ? leanNum : fireMode === 'fat' ? fatNum : fireMode === 'coast' ? coastAmt : fireMode === 'barista' ? baristaNum : fireCalc.fireNum;
  const activeModeCalc = calcFIRE(
    fireMode === 'lean' ? fire.annualExpenses * 0.75 : fireMode === 'fat' ? fire.annualExpenses * 1.5 : fireMode === 'barista' ? baristaNetExp : fire.annualExpenses,
    fire.annualSavings,
    fire.currentSavings,
  );
  const activeModeProgress = activeModeNum > 0 ? Math.min((fire.currentSavings / activeModeNum) * 100, 100) : 0;
  const activeModeYears = fireMode === 'coast' ? (coastReached ? 0 : activeModeCalc.years) : activeModeCalc.years;
  const activeModeDate = activeModeYears < 100 ? new Date(now.getFullYear() + activeModeYears, now.getMonth()).toLocaleString('default', { month: 'short', year: 'numeric' }) : '—';
  const ageAtFIRE = currentAge + (isFinite(activeModeYears) ? activeModeYears : 0);
  const workingHoursLeft = isFinite(activeModeYears) && activeModeYears > 0 ? Math.round(activeModeYears * 52 * 40) : 0;

  const realReturn = Math.max(0.001, (1.07 / (1 + inflation / 100)) - 1);
  const adjFireCalc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings, realReturn);


  const navMonth = (dir) => { let m = selMonth + dir, y = selYear; if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } setSelMonth(m); setSelYear(y); };

  const typeConfig = {
    income: { label: 'Income', icon: <Icon.ArrowUp />, color: 'var(--green)', bg: 'rgba(82,201,138,0.1)', border: 'rgba(82,201,138,0.35)' },
    need: { label: 'Need', icon: <Icon.ArrowDown />, color: 'var(--red)', bg: 'rgba(224,92,92,0.1)', border: 'rgba(224,92,92,0.35)' },
    want: { label: 'Want', icon: <Icon.ArrowDown />, color: 'var(--red)', bg: 'rgba(224,92,92,0.1)', border: 'rgba(224,92,92,0.35)' },
    saving: { label: 'Saving', icon: <Icon.ArrowRight />, color: 'var(--gold)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.35)' },
  };

  // ── Nav order: Dashboard → FIRE Calc → Insights → Transactions → … ──
  const NAV_ITEMS = [
    { id: 'home', icon: <Icon.Dashboard />, label: 'Dashboard' },
    { id: 'fire', icon: <Icon.Fire />, label: 'FIRE Calc' },
    { id: 'insights', icon: <Icon.Insights />, label: 'Insights' },
    { id: 'transactions', icon: <Icon.Transactions />, label: 'Transactions' },
    { id: 'projections', icon: <Icon.Projections />, label: 'Projections' },
    { id: 'networth', icon: <Icon.Wallet />, label: 'Net Worth' },
    { id: 'compound', icon: <Icon.Lightning />, label: 'Compound Growth' },
    { id: 'export', icon: <Icon.Export />, label: 'Export & Import' },
    { id: 'guide', icon: <Icon.Guide />, label: 'Guide' },
    { id: 'settings', icon: <Icon.Settings />, label: 'Settings' },
  ];

  if (loading) return (
    <div className="fl-loading">
      <div className="fl-logo-mark"><Icon.Flame /></div>
      <div className="fl-logo-load">FIRELedger</div>
      <div className="fl-spinner" />
    </div>
  );

  return (
    <div className="fl-shell">
      {toast && <div className={`fl-toast ${toast.type}`}>{toast.msg}</div>}
      <TourOverlay step={tourStep} onNext={() => { const next = TOUR_STEPS[tourStep + 1]; if (next?.tab) setTab(next.tab); setTourStep(p => p + 1 >= TOUR_STEPS.length ? -1 : p + 1); }} onSkip={() => setTourStep(-1)} />
      {milestone && (
        <div className="fl-milestone" onClick={() => setMilestone(null)}>
          <Icon.CheckCircle />
          <span>{milestone}</span>
          <button><Icon.X /></button>
        </div>
      )}

      {/* ONBOARDING — only shown when no settings row exists (first login) */}
      {showOnboard && (
        <div className="fl-overlay">
          <div className="fl-onboard">
            <div className="ob-brand"><Icon.Flame /><span>FIRELedger</span></div>
            <div className="ob-progress">{[0, 1, 2, 3, 4].map(i => <div key={i} className={`ob-dot ${onboardStep >= i ? 'active' : ''}`} />)}</div>

            {onboardStep === 0 && <div className="ob-step"><h2>Welcome to FIRELedger</h2><p>Your personal financial independence tracker. Let's set up your profile in 5 steps so your dashboard reflects your actual numbers from day one.</p><button className="fl-btn-primary" onClick={() => setOnboardStep(1)}>Get started</button></div>}

            {onboardStep === 1 && <div className="ob-step"><h2>Select your currency</h2><p>All figures will be displayed in your chosen currency.</p><div className="ob-currency-grid">{Object.entries(CURRENCIES).map(([code, c]) => <button key={code} className={`ob-currency-btn ${currency === code ? 'active' : ''}`} onClick={() => setCurrency(code)}><span className="ob-curr-code">{code}</span><span className="ob-curr-name">{c.name}</span><span className="ob-curr-sym">{c.symbol}</span></button>)}</div><button className="fl-btn-primary" onClick={() => setOnboardStep(2)}>Continue</button></div>}

            {onboardStep === 2 && <div className="ob-step">
              <h2>Your age</h2>
              <p>Used to calculate when you'll reach financial independence and which FIRE path fits your life stage.</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="ob-input-wrap" style={{ flex: 1 }}>
                  <span className="ob-sym">Now</span>
                  <input className="fl-input-lg ob-input" type="number" placeholder="30" value={currentAge || ''} onChange={e => setCurrentAge(parseInt(e.target.value) || 0)} />
                </div>
                <div className="ob-input-wrap" style={{ flex: 1 }}>
                  <span className="ob-sym">Goal</span>
                  <input className="fl-input-lg ob-input" type="number" placeholder="45" value={retireAge || ''} onChange={e => setRetireAge(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="ob-hint">
                {retireAge > currentAge
                  ? `You want to stop working in ${retireAge - currentAge} years, at age ${retireAge}`
                  : 'Enter your current age and target retirement age'}
              </div>
              <button className="fl-btn-primary" onClick={() => setOnboardStep(3)}>Continue</button>
            </div>}

            {onboardStep === 3 && <div className="ob-step"><h2>Annual expenses</h2><p>How much do you expect to spend per year in retirement? This sets your FIRE number (expenses × 25).</p><div className="ob-input-wrap"><span className="ob-sym">{sym}</span><input className="fl-input-lg ob-input" type="number" placeholder="40000" value={fire.annualExpenses || ''} onChange={e => setFire(p => ({ ...p, annualExpenses: parseFloat(e.target.value) || 0 }))} /></div><div className="ob-hint">FIRE target = {fmt(fire.annualExpenses * 25)}</div><button className="fl-btn-primary" onClick={() => setOnboardStep(4)}>Continue</button></div>}

            {onboardStep === 4 && <div className="ob-step"><h2>Your savings</h2><p>Annual savings and total invested so far.</p><div className="ob-input-wrap"><span className="ob-sym">{sym}</span><input className="fl-input-lg ob-input" type="number" placeholder="Annual savings" value={fire.annualSavings || ''} onChange={e => setFire(p => ({ ...p, annualSavings: parseFloat(e.target.value) || 0 }))} /></div><div className="ob-input-wrap" style={{ marginTop: 10 }}><span className="ob-sym">{sym}</span><input className="fl-input-lg ob-input" type="number" placeholder="Current savings" value={fire.currentSavings || ''} onChange={e => setFire(p => ({ ...p, currentSavings: parseFloat(e.target.value) || 0 }))} /></div><div className="ob-hint">{calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings).years === Infinity ? 'Set savings to calculate' : 'Estimated ' + calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings).years + ' years to FIRE — you\'d be ' + (currentAge + calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings).years) + ' years old'}</div><button className="fl-btn-primary" style={{ marginTop: 12 }} onClick={async () => {
              await saveSettings(fire, cats, currency, currentAge, retireAge, fireMode);
              if (isLifetime) sessionStorage.setItem(`fl_onboarded_${userId}`, '1');
              setShowOnboard(false);
              showToast('Profile saved');
              setTimeout(() => setTourStep(0), 300);
            }}>Launch dashboard</button></div>}
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {importModal && (
        <div className="fl-overlay" onClick={() => setImportModal(false)}>
          <div className="fl-modal" onClick={e => e.stopPropagation()}>
            <div className="fl-modal-header"><div><h2>Import Preview</h2><p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>{importAll.length} transactions detected</p></div><button className="fl-modal-close" onClick={() => setImportModal(false)}><Icon.X /></button></div>
            <div className="fl-modal-body">
              {importPreview.length === 0 ? <div className="fl-empty"><p>No transactions detected. Ensure your file contains date and amount columns.</p></div> : importPreview.map((t, i) => (
                <div key={i} className="fl-tx-card"><div className="fl-tx-card-badge" style={{ background: amtColor(t.type) + '18', color: amtColor(t.type) }}>{TYPE_LABEL[t.type]}</div><div className="fl-tx-card-body"><span className="fl-tx-card-desc">{t.description}</span><span className="fl-tx-card-meta">{t.date}{t.category ? ` · ${t.category}` : ''}</span></div><span className="fl-tx-card-amount" style={{ color: amtColor(t.type) }}>{fmtD(t.amount)}</span></div>
              ))}
              {importPreview.length > 0 && <button className="fl-btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={confirmImport}>Import {importAll.length} transactions</button>}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fl-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="fl-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="fl-modal-header"><h2>Delete all data</h2><button className="fl-modal-close" onClick={() => setDeleteConfirm(false)}><Icon.X /></button></div>
            <div className="fl-modal-body">
              <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 20 }}>This will permanently delete all your transactions, FIRE settings, and account preferences. This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="fl-btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button className="fl-btn-danger" style={{ flex: 1 }} onClick={deleteAllData}>Yes, delete everything</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="fl-sidebar">
        <div className="fl-brand">
          <div className="fl-brand-icon-wrap"><Icon.Flame /></div>
          <span className="fl-brand-name">FIRELedger</span>
        </div>
        <nav className="fl-nav">
          {NAV_ITEMS.map(t => (
            <button key={t.id} className={`fl-nav-item ${tab === t.id ? 'active' : ''} ${tourStep >= 0 && TOUR_STEPS[tourStep]?.tab === t.id ? 'fl-nav-tour-glow' : ''}`} onClick={() => setTab(t.id)}>
              <span className="fl-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
              {tab === t.id && <div className="fl-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="fl-sidebar-footer">
          {isLifetime && (
            <div className="fl-trial-banner" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
              <div className="fl-trial-days" style={{ background: 'rgba(251,191,36,0.12)' }}>
                <span className="fl-trial-num" style={{ color: '#fbbf24', fontSize: 16 }}>⚡</span>
                <span className="fl-trial-label">Local</span>
              </div>
              <div className="fl-trial-info">
                <span>Session only</span>
                <a href="/pricing" className="fl-trial-upgrade">Upgrade →</a>
              </div>
            </div>
          )}
          {isLifetime ? (
            <a href="/pricing" className="fl-upgrade-btn fl-upgrade-btn-session">Upgrade to save data →</a>
          ) : (
            <a href="/pricing" className="fl-upgrade-btn">Manage plan →</a>
          )}
          <div className="fl-user-chip">
            <div className="fl-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="fl-user-info"><span className="fl-user-email">{user?.email?.split('@')[0]}</span><span className="fl-user-plan">Pro</span></div>
          </div>
          <div className="fl-curr-wrap">
            <button className="fl-curr-btn" onClick={() => setShowCurrMenu(p => !p)}>{currency}</button>
            {showCurrMenu && <div className="fl-curr-menu">{Object.entries(CURRENCIES).map(([code, c]) => <button key={code} className={`fl-curr-opt ${currency === code ? 'active' : ''}`} onClick={() => { setCurrency(code); saveSettings(null, null, code); setShowCurrMenu(false); showToast(`Currency: ${code}`) }}>{c.symbol} {code}</button>)}</div>}
          </div>
          <button className="fl-signout" onClick={signOut} title="Sign out"><Icon.LogOut /></button>
        </div>
      </aside>

      <main className="fl-main" id="fl-main-scroll">

        {/* ── DASHBOARD ── */}
        {tab === 'home' && (
          <div key="home" className="fl-page">
            <div className="fl-page-top">
              <div>
                <h1 className="fl-title">{now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}</h1>
                <p className="fl-subtitle">{todaySpd > 0 ? `${fmtD(todaySpd)} spent today` : 'No spending logged today'}{streak > 1 && <span className="fl-streak"> · {streak}-day streak</span>}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="fl-month-nav"><button onClick={() => navMonth(-1)}><Icon.ChevLeft /></button><span>{MONTHS[selMonth]} {selYear}</span><button onClick={() => navMonth(1)} disabled={isCurr}><Icon.ChevRight /></button></div>
                <button className="fl-add-fab" onClick={() => { setEditTx(null); setRawAmt(''); setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false }); setShowAdd(true); setTimeout(() => addAmtRef.current?.focus(), 80); }}><Icon.Plus />Log transaction</button>
              </div>
            </div>

            {isLifetime && (
              <div className="fl-lifetime-nudge">
                <span>⚡ Session only — your data will clear when you close this tab.</span>
                <a href="/pricing" className="fl-lifetime-upgrade">Save data permanently →</a>
              </div>
            )}

            {/* Hero — reflects active FIRE mode */}
            <div className="fl-fire-hero">
              <div className="fl-fire-hero-left">
                <div className="fl-fire-label">
                  {fireMode === 'standard' ? 'Financial Independence' : fireMode === 'lean' ? 'Lean FIRE' : fireMode === 'fat' ? 'Fat FIRE' : fireMode === 'coast' ? 'Coast FIRE' : 'Barista FIRE'}
                  {' · '}{CURRENCIES[currency].symbol} {currency}
                  {fireMode !== 'standard' && (
                    <button className="fl-fire-mode-badge-btn" onClick={() => setTab('fire')} title="Change FIRE mode" style={{marginBottom: 4, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: 'var(--purple-light)', borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer'}}>
                      {fireMode === 'lean' ? 'Lean' : fireMode === 'fat' ? 'Fat' : fireMode === 'coast' ? 'Coast' : 'Barista'}
                    </button>
                  )}
                </div>
                <div className="fl-fire-years">
                  {(activeModeYears === Infinity || (activeModeYears === 0 && fireMode === 'coast' && coastReached)) ? '—' : activeModeYears}
                  <span className="fl-fire-years-unit">
                    {fireMode === 'coast' && coastReached ? ' coast reached' : activeModeYears !== Infinity ? ' years away' : ''}
                  </span>
                </div>
                <div className="fl-fire-date">
  {fireMode === 'coast' && coastReached
    ? 'You have reached Coast FIRE — keep contributing and compound does the rest'
    : <>Projected freedom: <strong>{activeModeDate}</strong> · age <strong>{isFinite(ageAtFIRE) ? ageAtFIRE : '—'}</strong>{fireMode === 'barista' && <> · part-time {fmt(baristaPartTimeIncome)}/yr</>}</>
  }
</div>
                {fireMode === 'barista' && (
                  <div className="fl-fire-barista-note" style={{ marginTop: 6, fontSize: 13 }}>
                    Work part-time earning {fmt(baristaPartTimeIncome)}/yr · portfolio covers the rest
                  </div>
                )}
                {isFinite(activeModeYears) && activeModeYears > 0 && (
               <div className="fl-fire-hours-row" style={{maxWidth: 420}}>
  <span className="fl-fire-hours-num">{workingHoursLeft.toLocaleString()}</span>
  {' '}
  <span className="fl-fire-hours-label">working hours until you never have to work again</span>
</div>
                )}
                <div className="fl-fire-progress-bar"><div className="fl-fire-progress-fill" style={{ width: `${activeModeProgress}%` }} /></div>
                <div className="fl-fire-progress-label">{activeModeProgress.toFixed(1)}% of the way there &nbsp;·&nbsp; {fmt(fire.currentSavings)} of {fmt(activeModeNum)}</div>
              </div>
              <div className="fl-fire-hero-right">
                <svg viewBox="0 0 200 200" className="fl-fire-ring" style={{width: 200, height: 200}}>
  <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
  <circle cx="100" cy="100" r="82" fill="none" stroke="url(#hero-ring-grad)" strokeWidth="14" strokeDasharray="515" strokeDashoffset={515 - (515 * activeModeProgress / 100)} strokeLinecap="round" transform="rotate(-90 100 100)" />strokeDasharray="352" strokeDashoffset={352 - (352 * activeModeProgress / 100)} strokeLinecap="round" transform="rotate(-90 70 70)" />
                  <defs><linearGradient id="hero-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--purple-light)" /><stop offset="100%" stopColor="var(--purple-dark)" /></linearGradient></defs>
                </svg>
                <div className="fl-ring-center">
                  <span className="fl-ring-pct">{activeModeProgress.toFixed(0)}%</span>
                  <span className="fl-ring-sub">to {fireMode === 'lean' ? 'Lean ' : fireMode === 'fat' ? 'Fat ' : fireMode === 'coast' ? 'Coast ' : fireMode === 'barista' ? 'Barista ' : ''}FIRE</span>
                </div>
              </div>
            </div>

            <div className="fl-metrics">
              {[
                { label: 'Income', value: fmt(income), sub: 'This month', color: 'var(--green)', icon: <Icon.ArrowUp /> },
                { label: 'Spent', value: fmt(needs + wants), sub: `${income > 0 ? (((needs + wants) / income) * 100).toFixed(0) : 0}% of income`, color: 'var(--red)', icon: <Icon.ArrowDown /> },
                { label: 'Saved', value: fmt(savings), sub: `${savRate}% savings rate`, color: 'var(--gold)', icon: <Icon.ArrowRight /> },
                { label: 'Grade', value: grade, sub: 'Monthly savings score', color: gradeClr, icon: <Icon.Star /> },
              ].map((m, i) => (
                <div key={i} className="fl-metric-card" style={{ '--accent': m.color }}>
                  <div className="fl-metric-top"><span className="fl-metric-label">{m.label}</span><span style={{ color: m.color }} className="fl-metric-icon-wrap">{m.icon}</span></div>
                  <div className="fl-metric-value" style={{ color: m.color }}>{m.value}</div>
                  <div className="fl-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            <GuidanceHomeWidget txs={mTxs} fire={fire} currency={currency} />

            <div className="fl-section-header"><h2 className="fl-section-title">Recent Transactions</h2><button className="fl-link-btn" onClick={() => setTab('transactions')}>View all</button></div>
            <div className="fl-tx-list">
              {txs.slice(0, 8).map(t => (
                <div key={t.id} className="fl-tx-row">
                  <div className="fl-tx-type-dot" style={{ background: amtColor(t.type) }} />
                  <div className="fl-tx-body"><span className="fl-tx-desc">{t.description}</span><span className="fl-tx-meta">{t.category || TYPE_LABEL[t.type]} · {t.date}</span></div>
                  <span className="fl-tx-amount" style={{ color: amtColor(t.type) }}>{t.type === 'income' || t.type === 'saving' ? '+' : '-'}{fmtD(t.amount)}</span>
                </div>
              ))}
              {txs.length === 0 && <div className="fl-empty"><p>No transactions yet. Log your first transaction to get started.</p><button className="fl-btn-primary" onClick={() => setShowAdd(true)}>Log transaction</button></div>}
            </div>
          </div>
        )}

        {/* ── FIRE CALC ── (moved up in nav) */}
        {tab === 'fire' && (() => {
          const displayNum = fireMode === 'lean' ? leanNum : fireMode === 'fat' ? fatNum : fireMode === 'coast' ? coastAmt : fireMode === 'barista' ? baristaNum : fireCalc.fireNum;
          const displayProgress = displayNum > 0 ? Math.min((fire.currentSavings / displayNum) * 100, 100) : 0;
          const displayAgeAtFIRE = currentAge + (isFinite(activeModeYears) ? activeModeYears : 0);
          return (
            <div key="fire" className="fl-page">
              <div className="fl-page-top">
                <div><h1 className="fl-title">FIRE Calculator</h1><p className="fl-subtitle">Financial Independence, Retire Early</p></div>
                <div className="fl-fire-mode-tabs">
                  {[
                    { id: 'standard', label: 'FIRE' },
                    { id: 'lean', label: 'Lean FIRE' },
                    { id: 'barista', label: 'Barista FIRE', icon: <Icon.Coffee /> },
                    { id: 'coast', label: 'Coast FIRE' },
                    { id: 'fat', label: 'Fat FIRE' },
                  ].map(m => (
                    <button key={m.id} className={`fl-fire-mode-btn ${fireMode === m.id ? 'active' : ''}`} onClick={() => { setFireMode(m.id); saveSettings(null, null, null, null, null, m.id); }}>
                      {m.icon && <span style={{ marginRight: 4 }}>{m.icon}</span>}{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fl-fire-mode-desc">
                {fireMode === 'standard' && <p><strong>FIRE</strong> — Standard financial independence. 25× your current annual expenses invested. Withdraw {swr}% per year indefinitely.</p>}
                {fireMode === 'lean' && <p><strong>Lean FIRE</strong> — Retire on 75% of your current expenses. Requires a frugal lifestyle. FIRE number = {fmt(leanNum)}.</p>}
                {fireMode === 'fat' && <p><strong>Fat FIRE</strong> — Retire on 150% of your current expenses. Full lifestyle, no compromises. FIRE number = {fmt(fatNum)}.</p>}
                {fireMode === 'coast' && <p><strong>Coast FIRE</strong> — Save enough now that compound growth alone reaches your FIRE number. Coast number = {fmt(coastAmt)}. {coastReached ? '✓ You have reached Coast FIRE.' : 'You need ' + fmt(Math.max(0, coastAmt - fire.currentSavings)) + ' more.'}</p>}
                {fireMode === 'barista' && <p><strong>Barista FIRE</strong> — Semi-retire now. Work part-time earning ~{fmt(baristaPartTimeIncome)}/yr to cover 40% of expenses. Your portfolio ({fmt(baristaNum)}) covers the remaining 60%. {baristaReached ? '✓ You have reached Barista FIRE.' : 'You need ' + fmt(Math.max(0, baristaNum - fire.currentSavings)) + ' more.'}</p>}
              </div>

              <div className="fl-scroll-hint"><Icon.ArrowDown /><span>Scroll down to see your FIRE projection and statistics</span></div>
              <div className="fl-fire-layout">
                <div className="fl-fire-inputs">
                  <h3>Your Numbers</h3>

                  {/* Age inputs — always visible */}
                  <div className="fl-fire-field">
                    <label>Age</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="fl-fire-input-wrap" style={{ flex: 1 }}>
                        <span className="fl-input-prefix">Now</span>
                        <input className="fl-fire-input" type="number" placeholder="30"
                          value={currentAge || ''} onChange={e => { setCurrentAge(parseInt(e.target.value) || 0); }} />
                      </div>
                      <div className="fl-fire-input-wrap" style={{ flex: 1 }}>
                        <span className="fl-input-prefix">Goal</span>
                        <input className="fl-fire-input" type="number" placeholder="45"
                          value={retireAge || ''} onChange={e => { setRetireAge(parseInt(e.target.value) || 0); }} />
                      </div>
                    </div>
                    <span className="fl-fire-hint">{retireAge > currentAge ? `${retireAge - currentAge} years to your target retirement age` : 'Set your current and target age'}</span>
                  </div>

                  {[
                    { key: 'annualExpenses', label: 'Annual Expenses', hint: 'Expected yearly spend in retirement' },
                    { key: 'annualSavings', label: 'Annual Savings', hint: 'Amount you invest per year' },
                    { key: 'currentSavings', label: 'Current Savings', hint: 'Total already invested or saved' },
                  ].map(f => (
                    <div key={f.key} className="fl-fire-field">
                      <label>{f.label}</label>
                      <div className="fl-fire-input-wrap">
                        <span className="fl-input-prefix">{sym}</span>
                        <input className="fl-fire-input" type="number" placeholder="0"
                          value={fire[f.key] || ''}
                          onChange={e => setFire(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} />
                      </div>
                      <span className="fl-fire-hint">{f.hint}</span>
                    </div>
                  ))}

                  <div className="fl-fire-field">
                    <label>Inflation Rate</label>
                    <div className="fl-fire-input-wrap">
                      <span className="fl-input-prefix">%</span>
                      <input className="fl-fire-input" type="number" placeholder="3" step="0.5"
                        value={inflation || ''} onChange={e => setInflation(parseFloat(e.target.value) || 0)} />
                    </div>
                    <span className="fl-fire-hint">Real return adjusted for inflation (default 3%)</span>
                  </div>

                  <div className="fl-fire-field">
                    <label>Safe Withdrawal Rate</label>
                    <div className="fl-fire-input-wrap">
                      <span className="fl-input-prefix">%</span>
                      <input className="fl-fire-input" type="number" placeholder="4" step="0.1"
                        value={swr || ''} onChange={e => setSwr(parseFloat(e.target.value) || 4)} />
                    </div>
                    <span className="fl-fire-hint">Annual % drawn from portfolio (default 4%)</span>
                  </div>

                  {(fireMode === 'coast') && <>
                    <div className="fl-fire-field">
                      <label>Contributions</label>
                      <div className="fl-contrib-toggle">
                        <button className={contribMode === 'annual' ? 'active' : ''} onClick={() => setContribMode('annual')}>Annual</button>
                        <button className={contribMode === 'monthly' ? 'active' : ''} onClick={() => setContribMode('monthly')}>Monthly</button>
                      </div>
                      <div className="fl-fire-input-wrap" style={{ marginTop: 6 }}>
                        <span className="fl-input-prefix">{sym}</span>
                        <input className="fl-fire-input" type="number" placeholder="0"
                          value={contribs || ''} onChange={e => setContribs(parseFloat(e.target.value) || 0)} />
                      </div>
                      <span className="fl-fire-hint">Optional — how much you still plan to contribute</span>
                    </div>
                  </>}

                  {fireMode === 'barista' && (
                    <div className="fl-fire-field">
                      <label>Part-time income coverage</label>
                      <div className="fl-fire-input-wrap">
                        <span className="fl-input-prefix">{sym}</span>
                        <input className="fl-fire-input" type="number" readOnly value={Math.round(baristaPartTimeIncome)} style={{ opacity: 0.6 }} />
                      </div>
                      <span className="fl-fire-hint">40% of annual expenses — what your part-time work covers</span>
                    </div>
                  )}

                  <button className="fl-btn-primary" style={{ width: '100%' }} onClick={() => { saveSettings(fire, null, null, currentAge, retireAge, fireMode); showToast('Settings saved'); }}>Save settings</button>

                  <div className="fl-whatif">
                    <h4>What if I saved more?</h4>
                    <div className="fl-whatif-row">
                      <span style={{ whiteSpace: 'nowrap', minWidth: 90 }}>{sym}{whatIf.toLocaleString()} /mo</span>
                      <input type="range" min="0" max="5000" step="50" value={whatIf} onChange={e => setWhatIf(parseInt(e.target.value))} className="fl-slider" />
                    </div>
                    {whatIf > 0 && <div className="fl-whatif-result">Saves <strong style={{ color: 'var(--green)' }}>{Math.max(0, fireCalc.years - fireWI.years)} years</strong> — retire in <strong style={{ color: 'var(--purple-light)' }}>{fireWI.years} years</strong></div>}
                  </div>
                </div>

                <div className="fl-fire-results">
                  <div className="fl-fire-big-ring">
                    <svg viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
                      <circle cx="100" cy="100" r="85" fill="none" stroke="url(#fire-calc-grad)" strokeWidth="16"
                        strokeDasharray="534" strokeDashoffset={534 - (534 * displayProgress / 100)}
                        strokeLinecap="round" transform="rotate(-90 100 100)" />
                      <defs><linearGradient id="fire-calc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--purple-light)" />
                        <stop offset="100%" stopColor="var(--purple-dark)" />
                      </linearGradient></defs>
                    </svg>
                    <div className="fl-fire-big-center">
                      <span className="fl-fire-big-pct">{displayProgress.toFixed(1)}%</span>
                      <span className="fl-fire-big-sub">to {fireMode === 'lean' ? 'Lean ' : fireMode === 'fat' ? 'Fat ' : fireMode === 'coast' ? 'Coast ' : fireMode === 'barista' ? 'Barista ' : ''}FIRE</span>
                    </div>
                  </div>

                  <div className="fl-fire-stat-grid">
                    {/* Common stats for all modes */}
                    {(() => {
                      const modeLabel = fireMode === 'lean' ? 'Lean ' : fireMode === 'fat' ? 'Fat ' : fireMode === 'coast' ? 'Coast ' : fireMode === 'barista' ? 'Barista ' : '';
                      const modeIncome = displayNum * (swr / 100);
                      const stats = fireMode === 'coast' ? [
                        { label: 'Coast FIRE Number', value: fmt(coastAmt), hint: 'Needed now to coast', color: 'var(--gold)' },
                        { label: 'Current Savings', value: fmt(fire.currentSavings), hint: 'What you have today', color: coastReached ? 'var(--green)' : 'var(--t1)' },
                        { label: 'Gap to Coast', value: coastReached ? 'Reached ✓' : fmt(Math.max(0, coastAmt - fire.currentSavings)), hint: coastReached ? 'Stop contributing — compound does the rest' : 'Still needed', color: coastReached ? 'var(--green)' : 'var(--red)' },
                        { label: 'Age at Freedom', value: coastReached ? currentAge : displayAgeAtFIRE, hint: `You'd be ${coastReached ? currentAge : displayAgeAtFIRE} when you stop working`, color: 'var(--purple-light)' },
                        { label: 'Annual Income', value: fmt(modeIncome), hint: `At ${swr}% withdrawal`, color: 'var(--green)' },
                        { label: 'Monthly Income', value: fmt(modeIncome / 12), hint: 'Per month in retirement', color: 'var(--green)' },
                      ] : fireMode === 'barista' ? [
                        { label: 'Barista FIRE Number', value: fmt(baristaNum), hint: '60% of expenses × 25', color: 'var(--gold)' },
                        { label: 'Gap', value: baristaReached ? 'Reached ✓' : fmt(Math.max(0, baristaNum - fire.currentSavings)), hint: baristaReached ? 'Semi-retire now' : 'Still needed', color: baristaReached ? 'var(--green)' : 'var(--red)' },
                        { label: 'Years Away', value: baristaReached ? 0 : activeModeYears === Infinity ? '—' : activeModeYears, hint: 'At 7% return', color: baristaReached ? 'var(--green)' : 'var(--gold)' },
                        { label: 'Age at Freedom', value: displayAgeAtFIRE, hint: `You'd be ${displayAgeAtFIRE} when you semi-retire`, color: 'var(--purple-light)' },
                        { label: 'Portfolio income', value: fmt(baristaNum * (swr / 100)), hint: `${swr}% from portfolio`, color: 'var(--green)' },
                        { label: 'Part-time needed', value: fmt(baristaPartTimeIncome), hint: '40% of expenses covered by work', color: 'var(--gold)' },
                      ] : [
                        { label: `${modeLabel}FIRE Number`, value: fmt(displayNum), hint: fireMode === 'lean' ? '75% of expenses × 25' : fireMode === 'fat' ? '150% of expenses × 25' : '25× annual expenses', color: 'var(--gold)' },
                        { label: 'Years Away', value: adjFireCalc.years === Infinity ? '—' : activeModeYears, hint: `At 7% return, ${inflation}% inflation`, color: activeModeYears <= 10 ? 'var(--green)' : activeModeYears <= 20 ? 'var(--gold)' : 'var(--red)' },
                        { label: 'Freedom Date', value: activeModeDate, hint: 'Inflation-adjusted projection', color: 'var(--purple-light)' },
                        { label: 'Age at Freedom', value: displayAgeAtFIRE, hint: `You'll be ${displayAgeAtFIRE} when you stop working`, color: 'var(--purple-light)' },
                        { label: 'Annual Income', value: fmt(modeIncome), hint: `At ${swr}% withdrawal rate`, color: 'var(--green)' },
                        { label: 'Monthly Income', value: fmt(modeIncome / 12), hint: 'Per month in retirement', color: 'var(--green)' },
                      ];
                      return stats.map((s, i) => (
                        <div key={i} className="fl-fire-stat">
                          <span className="fl-fire-stat-label">{s.label}</span>
                          <span className="fl-fire-stat-value" style={{ color: s.color, fontSize: s.label.includes('Date') || s.label.includes('Gap') ? 16 : 22 }}>{s.value}</span>
                          <span className="fl-fire-stat-hint">{s.hint}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Working hours remaining */}
                  {isFinite(activeModeYears) && activeModeYears > 0 && (
                    <div className="fl-hours-callout">
                      <span className="fl-hours-callout-num">{workingHoursLeft.toLocaleString()}</span>
                      {' '}
                      <span className="fl-hours-callout-label">working hours until you never have to work again</span>
                    </div>
                  )}

                  {inflation > 0 && adjFireCalc.years !== fireCalc.years && (
                    <div className="fl-inflation-note">
                      ⚠ Inflation-adjusted: adds <strong style={{ margin: '0 4px' }}>{adjFireCalc.years - fireCalc.years} years</strong> vs nominal projection
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── INSIGHTS ── */}
        {tab === 'insights' && (
          <div key="insights" className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Insights</h1><p className="fl-subtitle">Financial patterns for {MONTHS[selMonth]} {selYear}</p></div>
              <div className="fl-month-nav"><button onClick={() => navMonth(-1)}><Icon.ChevLeft /></button><span>{MONTHS[selMonth]} {selYear}</span><button onClick={() => navMonth(1)} disabled={isCurr}><Icon.ChevRight /></button></div>
            </div>
            <div className="fl-scroll-hint"><Icon.ArrowDown /><span>Scroll down for your savings grade and spending breakdown</span></div>
            <div className="fl-insights-grid">
              <div className="fl-insight-card fl-insight-wide">
                <h3>Monthly Overview</h3>
                <div className="fl-overview-bars">
                  {[{ label: 'Income', val: income, color: 'var(--green)' }, { label: 'Needs', val: needs, color: 'var(--red)' }, { label: 'Wants', val: wants, color: 'var(--red)' }, { label: 'Savings', val: savings, color: 'var(--gold)' }].map(b => (
                    <div key={b.label} className="fl-bar-row">
                      <span className="fl-bar-label">{b.label}</span>
                      <div className="fl-bar-track"><div className="fl-bar-fill" style={{ width: `${income > 0 ? Math.min((b.val / income) * 100, 100) : 0}%`, background: b.color }} /></div>
                      <span className="fl-bar-val" style={{ color: b.color }}>{fmt(b.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>Savings Grade</h3>
                <div className="fl-grade-display"><span className="fl-grade-letter" style={{ color: gradeClr }}>{grade}</span><span className="fl-grade-rate">{savRate}% savings rate</span></div>
                <div className="fl-grade-tiers">
                  {[{ g: 'A+', min: 60, max: 999 }, { g: 'A', min: 50, max: 60 }, { g: 'B', min: 40, max: 50 }, { g: 'C', min: 30, max: 40 }, { g: 'D', min: 0, max: 30 }].map(t => (
                    <div key={t.g} className={`fl-grade-tier ${gradeRaw >= t.min && gradeRaw < t.max ? 'active' : ''}`}><span>{t.g}</span><span>{t.min}%+</span></div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>50 / 30 / 20 Rule</h3>
                <div className="fl-rule-list">
                  {[{ label: 'Needs', actual: income > 0 ? (needs / income) * 100 : 0, target: 50, color: 'var(--red)' }, { label: 'Wants', actual: income > 0 ? (wants / income) * 100 : 0, target: 30, color: 'var(--red)' }, { label: 'Savings', actual: income > 0 ? (savings / income) * 100 : 0, target: 20, color: 'var(--gold)' }].map(r => (
                    <div key={r.label} className="fl-rule-row">
                      <span>{r.label}</span>
                      <div className="fl-rule-bar-track"><div className="fl-rule-bar-fill" style={{ width: `${Math.min(r.actual, 100)}%`, background: r.color }} /><div className="fl-rule-target" style={{ left: `${r.target}%` }} /></div>
                      <span style={{ color: r.actual <= r.target + 5 ? 'var(--green)' : 'var(--red)', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{r.actual.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>Top Expenses</h3>
                {Object.entries(mTxs.filter(t => t.type === 'need' || t.type === 'want').reduce((a, t) => { const k = t.category || t.description; a[k] = (a[k] || 0) + t.amount; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, amt]) => (
                  <div key={cat} className="fl-top-exp"><span>{cat}</span><div className="fl-top-exp-bar" style={{ width: `${income > 0 ? Math.min((amt / income) * 100, 60) : 10}%` }} /><span style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(amt)}</span></div>
                ))}
                {mTxs.filter(t => t.type === 'need' || t.type === 'want').length === 0 && <p className="fl-empty-sm">No expenses this month</p>}
              </div>
            </div>
            <GuidanceInsightsPanel txs={mTxs} fire={fire} currency={currency} />
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === 'transactions' && (
          <div key="tx" className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Transactions</h1><p className="fl-subtitle">{txs.length} entries</p></div>
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                <button className="fl-btn-ghost fl-btn-icon" onClick={() => fileRef.current?.click()}><Icon.Import />Import</button>
                <button className="fl-btn-ghost fl-btn-icon" onClick={exportCSV}><Icon.Export />Export</button>
                <button className="fl-add-fab" onClick={() => setShowAdd(true)}><Icon.Plus />Add</button>
                <input ref={fileRef} type="file" accept=".csv,.txt,.pdf" style={{ display: 'none' }} onChange={handleImportFile} />
              </div>
            </div>
            <div className="fl-filter-row">
              {['all', 'income', 'need', 'want', 'saving'].map(f => (
                <button key={f} className={`fl-chip ${filterType === f ? 'active' : ''}`}
                  style={filterType === f && f !== 'all' ? { borderColor: TYPE_COLOR[f], color: TYPE_COLOR[f], background: TYPE_COLOR[f] + '18' } : {}}
                  onClick={() => setFilterType(f)}>{f === 'all' ? 'All' : TYPE_LABEL[f]}</button>
              ))}
            </div>
            <div className="fl-tx-cards">
              {filtered.map(t => (
                <div key={t.id} className="fl-tx-card">
                  <div className="fl-tx-card-badge" style={{ background: amtColor(t.type) + '18', color: amtColor(t.type) }}>{TYPE_LABEL[t.type]}</div>
                  <div className="fl-tx-card-body"><span className="fl-tx-card-desc">{t.description}</span><span className="fl-tx-card-meta">{t.category ? `${t.category} · ` : ''}{t.date}{t.recurring ? ' · Recurring' : ''}</span></div>
                  <span className="fl-tx-card-amount" style={{ color: amtColor(t.type) }}>{t.type === 'income' || t.type === 'saving' ? '+' : '-'}{fmtD(t.amount)}</span>
                  <button className="fl-tx-edit" onClick={() => openEdit(t)}><Icon.Edit /></button>
                  <button className="fl-tx-del" onClick={() => deleteTx(t.id)}><Icon.X /></button>
                </div>
              ))}
              {filtered.length === 0 && <div className="fl-empty"><p>No transactions found</p></div>}
            </div>
          </div>
        )}

        {/* ── PROJECTIONS ── */}
        {tab === 'projections' && (
          <div key="proj" className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Projections</h1><p className="fl-subtitle">Wealth trajectory and scenario modelling</p></div>
              <select className="fl-field-input" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }} value={projYears} onChange={e => { setProjYears(parseInt(e.target.value)); setMcResult(null); }}>
                {[10, 15, 20, 25, 30, 35, 40].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
            <div className="fl-scroll-hint"><Icon.ArrowDown /><span>Scroll down to see your wealth trajectory chart</span></div>
            <div className="fl-proj-card">
              <div className="fl-proj-card-header">
                <div><h3>Wealth Trajectory</h3><p>Deterministic projection at 7% annual return{mcResult ? ' with Monte Carlo probability bands' : ''}</p></div>
                <div className="fl-proj-legend">
                  <span className="fl-legend-item" style={{ color: 'var(--purple-light)' }}>Projected</span>
                  {mcResult && <><span className="fl-legend-item" style={{ color: 'var(--purple-light)', opacity: 0.5 }}>P90</span><span className="fl-legend-item" style={{ color: 'var(--red)', opacity: 0.5 }}>P10</span></>}
                  <span className="fl-legend-item" style={{ color: 'var(--gold)' }}>FIRE target</span>
                  {projPts.some(p => p.value >= fireCalc.fireNum) && <span className="fl-legend-item" style={{ color: 'var(--green)' }}>Crossover</span>}
                </div>
              </div>
              <ProjectionChart points={projPts} fireNum={fireCalc.fireNum} sym={sym} mcResult={mcResult} />
              <div className="fl-proj-milestones">
                {[0.25, 0.5, 0.75, 1.0].map(pct => { const target = fireCalc.fireNum * pct; const yr = projPts.findIndex(p => p.value >= target); return yr > 0 ? <div key={pct} className="fl-proj-milestone"><span className="fl-proj-ms-label">{Math.round(pct * 100)}%</span><span className="fl-proj-ms-val">{fmt(target)}</span><span className="fl-proj-ms-yr">Year {yr}</span></div> : null; })}
              </div>
            </div>
            <div className="fl-proj-stats">
              {[{ label: 'Value at Year 10', value: fmt(projPts[Math.min(10, projPts.length - 1)]?.value || 0), color: 'var(--t1)' }, { label: 'Value at Year 20', value: fmt(projPts[Math.min(20, projPts.length - 1)]?.value || 0), color: 'var(--t1)' }, { label: `Value at Year ${projYears}`, value: fmt(projPts[projPts.length - 1]?.value || 0), color: 'var(--purple-light)' }, { label: 'FIRE Target', value: fmt(fireCalc.fireNum), color: 'var(--gold)' }].map((s, i) => (
                <div key={i} className="fl-proj-stat-box"><span className="fl-proj-stat-label">{s.label}</span><span className="fl-proj-stat-val" style={{ color: s.color }}>{s.value}</span></div>
              ))}
            </div>
            <div className="fl-mc-card">
              <div className="fl-mc-header">
                <div><h3>Monte Carlo Simulation</h3><p>500 simulations with randomised annual returns (mean 7%, standard deviation 12%) to model real-world market variance.</p></div>
                <button className="fl-btn-primary" onClick={runMC} disabled={mcRunning}>{mcRunning ? 'Running…' : 'Run simulation'}</button>
              </div>
              {mcResult && <>
                <div className="fl-mc-result">
                  <div className="fl-mc-success"><div className="fl-mc-pct" style={{ color: mcResult.successRate >= 80 ? 'var(--green)' : mcResult.successRate >= 60 ? 'var(--gold)' : 'var(--red)' }}>{mcResult.successRate}%</div><div className="fl-mc-success-label">Success rate</div><div className="fl-mc-success-sub">{mcResult.successRate} of 500 simulations reached FIRE in {projYears} years</div></div>
                  <div className="fl-mc-bands">
                    {[{ label: 'Optimistic (P90)', val: mcResult.percentiles.p90[projYears], color: 'var(--green)' }, { label: 'Median (P50)', val: mcResult.percentiles.p50[projYears], color: 'var(--purple-light)' }, { label: 'Pessimistic (P10)', val: mcResult.percentiles.p10[projYears], color: 'var(--red)' }].map(b => (
                      <div key={b.label} className="fl-mc-band-row"><span style={{ color: b.color, fontWeight: 600, fontSize: 12 }}>{b.label}</span><span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', fontSize: 15, color: b.color }}>{fmt(b.val || 0)}</span><span style={{ fontSize: 11, color: 'var(--t3)' }}>{(b.val || 0) >= mcResult.fireNum ? 'FIRE reached' : 'Below target'}</span></div>
                    ))}
                  </div>
                </div>
                <div className="fl-mc-bar-wrap"><div className="fl-mc-bar" style={{ width: `${mcResult.successRate}%`, background: mcResult.successRate >= 80 ? 'var(--green)' : mcResult.successRate >= 60 ? 'var(--gold)' : 'var(--red)' }} /></div>
                <p className="fl-mc-disclaimer"><strong>Disclaimer:</strong> Monte Carlo simulations are for illustrative purposes only and do not constitute financial advice. Past market performance does not guarantee future results. Actual outcomes may differ materially due to inflation, taxation, fees, sequence-of-returns risk, and personal circumstances. Consult a qualified financial adviser before making investment or retirement decisions.</p>
              </>}
              {!mcResult && <div className="fl-mc-empty"><p>Run the simulation to see how your portfolio might perform across 500 different market scenarios.</p></div>}
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {tab === 'export' && (
          <div key="export" className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">Export & Import</h1><p className="fl-subtitle">Your data, your way — no lock-in</p></div></div>
            <div className="fl-export-grid">
              <div className="fl-export-card"><div className="fl-export-icon-wrap"><Icon.Insights /></div><h3>Excel Report</h3><p>Full financial report with FIRE summary and all transactions — formatted for Excel or Google Sheets.</p><button className="fl-btn-primary" onClick={exportExcel}>Download report</button></div>
              <div className="fl-export-card"><div className="fl-export-icon-wrap"><Icon.Transactions /></div><h3>CSV Export</h3><p>Raw transaction data. Compatible with any spreadsheet application or finance tool.</p><button className="fl-btn-primary" onClick={exportCSV}>Download CSV</button></div>
              <div className="fl-export-card">
                <div className="fl-export-icon-wrap"><Icon.Import /></div><h3>Smart Import</h3>
                <p>Import from any CSV or PDF bank statement. Auto-detects column layouts, date formats, debit/credit columns, and semicolon or tab-separated files. No reformatting required.</p>
                <button className="fl-btn-primary" onClick={() => fileRef.current?.click()}>Choose file</button>
                <input ref={fileRef} type="file" accept=".csv,.txt,.pdf" style={{ display: 'none' }} onChange={handleImportFile} />
              </div>
              <div className="fl-export-card">
                <div className="fl-export-icon-wrap"><Icon.Book /></div><h3>Template</h3>
                <p>Download a starter CSV with the recommended column structure and example rows.</p>
                <div className="fl-format-table">{['Date', 'Description', 'Type (income / need / want / saving)', 'Category', 'Amount', 'Recurring (Yes / No)'].map((c, i) => <div key={i} className="fl-format-row"><span className="fl-format-num">{i + 1}</span><span>{c}</span></div>)}</div>
                <button className="fl-btn-ghost" style={{ marginTop: 8 }} onClick={() => { const s = 'Date,Description,Type,Category,Amount,Recurring\n2026-03-01,Monthly salary,income,,5000,No\n2026-03-02,Rent,need,Rent,1400,Yes\n2026-03-05,Groceries,need,Groceries,180,No'; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv' })); a.download = 'fire-ledger-template.csv'; a.click(); showToast('Template downloaded'); }}>Download template</button>
              </div>
            </div>
          </div>
        )}

        {/* ── NET WORTH ── */}
        {tab === 'networth' && (
          <div key="networth" className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">Net Worth</h1><p className="fl-subtitle">Assets minus liabilities — your real financial picture</p></div></div>
            <div className="fl-scroll-hint"><Icon.ArrowDown /><span>Fill in your figures — net worth appears below</span></div>
            <div className="fl-nw-layout">
              <div className="fl-nw-col">
                <div className="fl-nw-section fl-nw-assets">
                  <h3>Assets</h3>
                  {[
                    { key: 'houseValue', label: 'Property Value' },
                    { key: 'carValue', label: 'Vehicle Value' },
                    { key: 'cashSavings', label: 'Cash & Savings' },
                    { key: 'investments', label: 'Investments' },
                    { key: 'otherAssets', label: 'Other Assets' },
                  ].map(f => (
                    <div key={f.key} className="fl-nw-field">
                      <label>{f.label}</label>
                      <div className="fl-fire-input-wrap">
                        <span className="fl-input-prefix">{sym}</span>
                        <input className="fl-fire-input" type="number" placeholder="0"
                          value={nw[f.key] || ''}
                          onChange={e => setNw(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>
                  ))}
                  <div className="fl-nw-subtotal fl-nw-subtotal-green">
                    <span>Total Assets</span>
                    <strong>{fmt(Object.entries(nw).filter(([k]) => ['houseValue', 'carValue', 'cashSavings', 'investments', 'otherAssets'].includes(k)).reduce((s, [, v]) => s + v, 0))}</strong>
                  </div>
                </div>
              </div>
              <div className="fl-nw-col">
                <div className="fl-nw-section fl-nw-liabilities">
                  <h3>Liabilities</h3>
                  {[
                    { key: 'mortgage', label: 'Mortgage' },
                    { key: 'creditCard', label: 'Credit Card Debt' },
                    { key: 'studentLoan', label: 'Student Loan' },
                    { key: 'personalLoan', label: 'Personal Loan' },
                    { key: 'otherLiabilities', label: 'Other Liabilities' },
                  ].map(f => (
                    <div key={f.key} className="fl-nw-field">
                      <label>{f.label}</label>
                      <div className="fl-fire-input-wrap">
                        <span className="fl-input-prefix">{sym}</span>
                        <input className="fl-fire-input" type="number" placeholder="0"
                          value={nw[f.key] || ''}
                          onChange={e => setNw(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>
                  ))}
                  <div className="fl-nw-subtotal fl-nw-subtotal-red">
                    <span>Total Liabilities</span>
                    <strong>{fmt(Object.entries(nw).filter(([k]) => ['mortgage', 'creditCard', 'studentLoan', 'personalLoan', 'otherLiabilities'].includes(k)).reduce((s, [, v]) => s + v, 0))}</strong>
                  </div>
                </div>
              </div>
            </div>
            {(() => {
              const assets = ['houseValue', 'carValue', 'cashSavings', 'investments', 'otherAssets'].reduce((s, k) => s + nw[k], 0);
              const liabs = ['mortgage', 'creditCard', 'studentLoan', 'personalLoan', 'otherLiabilities'].reduce((s, k) => s + nw[k], 0);
              const netWorth = assets - liabs;
              const debtRatio = assets > 0 ? ((liabs / assets) * 100).toFixed(1) : 0;
              return (
                <div className="fl-nw-result">
                  <div className="fl-nw-result-main">
                    <span className="fl-nw-result-label">Net Worth</span>
                    <span className="fl-nw-result-value" style={{ color: netWorth >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(netWorth)}</span>
                  </div>
                  <div className="fl-nw-result-stats">
                    <div className="fl-nw-stat"><span>Debt-to-Asset Ratio</span><strong style={{ color: parseFloat(debtRatio) > 50 ? 'var(--red)' : parseFloat(debtRatio) > 30 ? 'var(--gold)' : 'var(--green)' }}>{debtRatio}%</strong></div>
                    <div className="fl-nw-stat"><span>% of FIRE number</span><strong style={{ color: 'var(--purple-light)' }}>{fireCalc.fireNum > 0 ? ((Math.max(0, netWorth) / fireCalc.fireNum) * 100).toFixed(1) : 0}%</strong></div>
                    <div className="fl-nw-stat"><span>FIRE number</span><strong style={{ color: 'var(--gold)' }}>{fmt(fireCalc.fireNum)}</strong></div>
                  </div>
                  <div className="fl-nw-bar-wrap">
                    <div className="fl-nw-bar-track">
                      <div className="fl-nw-bar-assets" style={{ width: `${assets > 0 ? Math.min((assets / (assets + liabs)) * 100, 100) : 100}%` }} />
                    </div>
                    <div className="fl-nw-bar-labels"><span style={{ color: 'var(--green)' }}>Assets {fmt(assets)}</span><span style={{ color: 'var(--red)' }}>Liabilities {fmt(liabs)}</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── COMPOUND GROWTH ── */}
        {tab === 'compound' && (
          <div key="compound" className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">Compound Growth</h1><p className="fl-subtitle">See how your money grows over time</p></div></div>
            <div className="fl-scroll-hint"><Icon.ArrowDown /><span>Enter your numbers — results appear to the right</span></div>
            <div className="fl-cg-layout">
              <div className="fl-cg-inputs">
                <h3>Your Numbers</h3>
                <div className="fl-fire-field">
                  <label>Initial Investment</label>
                  <div className="fl-fire-input-wrap"><span className="fl-input-prefix">{sym}</span>
                    <input className="fl-fire-input" type="number" placeholder="0" value={cg.initial || ''} onChange={e => setCg(p => ({ ...p, initial: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="fl-fire-field">
                  <label>Investment Timeline</label>
                  <div className="fl-fire-input-wrap"><span className="fl-input-prefix">yr</span>
                    <input className="fl-fire-input" type="number" placeholder="10" value={cg.years || ''} onChange={e => setCg(p => ({ ...p, years: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="fl-fire-field">
                  <label>Annual Growth Rate</label>
                  <div className="fl-fire-input-wrap"><span className="fl-input-prefix">%</span>
                    <input className="fl-fire-input" type="number" placeholder="7" step="0.5" value={cg.growthRate || ''} onChange={e => setCg(p => ({ ...p, growthRate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="fl-fire-field">
                  <label>Annual Inflation Rate</label>
                  <div className="fl-fire-input-wrap"><span className="fl-input-prefix">%</span>
                    <input className="fl-fire-input" type="number" placeholder="3" step="0.5" value={cg.inflationRate || ''} onChange={e => setCg(p => ({ ...p, inflationRate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="fl-fire-field">
                  <label>Contributions</label>
                  <div className="fl-contrib-toggle">
                    <button className={cg.contribType === 'annual' ? 'active' : ''} onClick={() => setCg(p => ({ ...p, contribType: 'annual' }))}>Annual</button>
                    <button className={cg.contribType === 'monthly' ? 'active' : ''} onClick={() => setCg(p => ({ ...p, contribType: 'monthly' }))}>Monthly</button>
                  </div>
                  <div className="fl-fire-input-wrap" style={{ marginTop: 6 }}><span className="fl-input-prefix">{sym}</span>
                    <input className="fl-fire-input" type="number" placeholder="0" value={cg.contribution || ''} onChange={e => setCg(p => ({ ...p, contribution: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="fl-fire-field">
                  <label>Compounding Frequency</label>
                  <div className="fl-contrib-toggle">
                    <button className={cg.compounding === 'annual' ? 'active' : ''} onClick={() => setCg(p => ({ ...p, compounding: 'annual' }))}>Annual</button>
                    <button className={cg.compounding === 'monthly' ? 'active' : ''} onClick={() => setCg(p => ({ ...p, compounding: 'monthly' }))}>Monthly</button>
                  </div>
                </div>
                <button className="fl-btn-primary" style={{ width: '100%' }} onClick={() => {
                  const n = cg.compounding === 'monthly' ? cg.years * 12 : cg.years;
                  const r = cg.compounding === 'monthly' ? cg.growthRate / 100 / 12 : cg.growthRate / 100;
                  const annualContribCg = cg.contribType === 'monthly' ? cg.contribution * 12 : cg.contribution;
                  const periodicContrib = cg.compounding === 'monthly' ? annualContribCg / 12 : annualContribCg;
                  const nominal = cg.initial * Math.pow(1 + r, n) + periodicContrib * ((Math.pow(1 + r, n) - 1) / r);
                  const realRate = (1 + cg.growthRate / 100) / (1 + cg.inflationRate / 100) - 1;
                  const rn = cg.compounding === 'monthly' ? realRate / 12 : realRate;
                  const real = cg.initial * Math.pow(1 + rn, n) + periodicContrib * ((Math.pow(1 + rn, n) - 1) / rn);
                  const totalContribs = cg.initial + annualContribCg * cg.years;
                  const rule72 = cg.growthRate > 0 ? (72 / cg.growthRate).toFixed(1) : '—';
                  setCgResult({ nominal, real, totalContribs, growth: nominal - totalContribs, rule72 });
                }}>Calculate Growth</button>
                <button className="fl-btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => { setCg({ initial: 0, years: 10, growthRate: 7, inflationRate: 3, contribType: 'annual', contribution: 0, compounding: 'annual' }); setCgResult(null); }}>Clear</button>
              </div>
              <div className="fl-cg-results">
                {cgResult ? (
                  <>
                    <div className="fl-cg-result-hero">
                      <span className="fl-cg-label">Nominal Value</span>
                      <span className="fl-cg-value" style={{ color: 'var(--purple-light)' }}>{fmt(cgResult.nominal)}</span>
                      <span className="fl-cg-sub">After {cg.years} years at {cg.growthRate}% growth</span>
                    </div>
                    <div className="fl-fire-stat-grid" style={{ marginTop: 16 }}>
                      {[
                        { label: 'Real Value', value: fmt(cgResult.real), hint: 'Inflation-adjusted', color: 'var(--green)' },
                        { label: 'Total Contributed', value: fmt(cgResult.totalContribs), hint: 'Your actual money in', color: 'var(--t1)' },
                        { label: 'Growth', value: fmt(cgResult.growth), hint: 'Compound interest earned', color: 'var(--gold)' },
                        { label: 'Rule of 72', value: `${cgResult.rule72} yrs`, hint: 'Years to double at this rate', color: 'var(--purple-light)' },
                      ].map((s, i) => (
                        <div key={i} className="fl-fire-stat">
                          <span className="fl-fire-stat-label">{s.label}</span>
                          <span className="fl-fire-stat-value" style={{ color: s.color, fontSize: 18 }}>{s.value}</span>
                          <span className="fl-fire-stat-hint">{s.hint}</span>
                        </div>
                      ))}
                    </div>
                    <div className="fl-cg-disclaimer">For illustrative purposes only. Does not constitute financial advice.</div>
                  </>
                ) : (
                  <div className="fl-cg-empty">
                    <div className="fl-cg-empty-icon"><Icon.Lightning /></div>
                    <p>Enter your numbers and click Calculate Growth to see how your investment compounds over time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'guide' && <GuidePage />}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div key="settings" className="fl-page">
            <div className="fl-page-top"><h1 className="fl-title">Settings</h1></div>
            <div className="fl-settings-grid">
              <div className="fl-settings-card">
                <h3>Custom Categories</h3>
                {['needs', 'wants', 'savings'].map(type => (
                  <div key={type} className="fl-cat-group">
                    <h4 style={{ color: type === 'needs' ? 'var(--red)' : type === 'wants' ? 'var(--red)' : 'var(--gold)' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                    <div className="fl-cat-tags">
                      {cats[type].map(cat => <span key={cat} className="fl-cat-tag">{cat}<button onClick={() => { const u = { ...cats, [type]: cats[type].filter(c => c !== cat) }; setCats(u); saveSettings(null, u, null); }}><Icon.X /></button></span>)}
                      <input className="fl-cat-add-input" placeholder="Add category" onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { const u = { ...cats, [type]: [...cats[type], e.target.value.trim()] }; setCats(u); saveSettings(null, u, null); e.target.value = ''; showToast('Category added'); } }} />
                    </div>
                  </div>
                ))}{/* ── Delete all data ── */}
                <div className="fl-danger-zone" style={{ marginTop: 24 }}>
                  <h3 style={{ color: 'var(--red)', marginBottom: 8 }}>Danger Zone</h3>
                  <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12 }}>Permanently delete all your transactions and settings. This cannot be undone.</p>
                  <button className="fl-btn-danger fl-btn-icon" style={{ width: '100%' }} onClick={() => setDeleteConfirm(true)}>
                    <Icon.Trash />Delete all my data
                  </button>
                </div>
              </div>

              <div className="fl-settings-card">
                <h3>Currency</h3>
                <div className="fl-curr-settings-grid">
                  {Object.entries(CURRENCIES).map(([code, c]) => (
                    <button key={code} className={`fl-curr-settings-btn ${currency === code ? 'active' : ''}`} onClick={() => { setCurrency(code); saveSettings(null, null, code); showToast(`Currency set to ${code}`); }}>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>{c.symbol}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{code}</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>{c.name}</span>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: 24, marginBottom: 12 }}>Age</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div className="fl-fire-field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Current Age</label>
                    <div className="fl-fire-input-wrap">
                      <span className="fl-input-prefix">yr</span>
                      <input className="fl-fire-input" type="number" placeholder="30" value={currentAge || ''} onChange={e => setCurrentAge(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div className="fl-fire-field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Retirement Age Goal</label>
                    <div className="fl-fire-input-wrap">
                      <span className="fl-input-prefix">yr</span>
                      <input className="fl-fire-input" type="number" placeholder="45" value={retireAge || ''} onChange={e => setRetireAge(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
                <button className="fl-btn-ghost" style={{ width: '100%', marginBottom: 16 }} onClick={() => { saveSettings(null, null, null, currentAge, retireAge, null); showToast('Age settings saved'); }}>Save age settings</button>

                <h3 style={{ marginTop: 8, marginBottom: 16 }}>Account</h3>
                <div className="fl-account-row">
                  <div className="fl-account-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{user?.email}</div><div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{isLifetime ? 'Lifetime · Session only' : 'Pro · Cloud sync active'}</div></div>
                </div>
                {isLifetime && (
                  <div className="fl-upgrade-card">
                    <div className="fl-upgrade-card-top">
                      <span className="fl-upgrade-card-title">Upgrade to cloud sync</span>
                      <span className="fl-upgrade-card-badge">Save your data</span>
                    </div>
                    <p className="fl-upgrade-card-body">
                      Your data clears every session on the Lifetime plan. Upgrade to Monthly or Annual to save everything permanently — transactions, settings, and history.
                    </p>
                    <div className="fl-upgrade-card-options">
                      <a href="/pricing" className="fl-upgrade-option">
                        <span className="fl-upgrade-option-price">$4.99<span>/mo</span></span>
                        <span className="fl-upgrade-option-label">Monthly</span>
                      </a>
                      <a href="/pricing" className="fl-upgrade-option fl-upgrade-option-featured">
                        <span className="fl-upgrade-option-price">$59.99<span>/yr</span></span>
                        <span className="fl-upgrade-option-label">Annual · Best value</span>
                      </a>
                    </div>
                  </div>
                )}
                <button className="fl-btn-ghost fl-btn-icon" style={{ width: '100%', marginTop: 16 }} onClick={exportExcel}><Icon.Export />Download report</button>
                <button className="fl-btn-ghost fl-btn-icon" style={{ width: '100%', marginTop: 10 }} onClick={signOut}><Icon.LogOut />Sign out</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── ADD / EDIT TRANSACTION MODAL ── */}
      {showAdd && (
        <div className="fl-overlay" onClick={() => setShowAdd(false)}>
          <div className="fl-modal fl-modal-log" onClick={e => e.stopPropagation()}>
            <div className="fl-modal-header"><h2>{editTx ? 'Edit Transaction' : 'Log Transaction'}</h2><button className="fl-modal-close" onClick={closeModal}><Icon.X /></button></div>
            <div className="fl-modal-body">
              <div className="fl-type-grid">
                {['income', 'need', 'want', 'saving'].map(t => { const cfg = typeConfig[t], active = form.type === t; return <button key={t} className={`fl-type-pill ${active ? 'active' : ''}`} style={active ? { background: cfg.bg, borderColor: cfg.border, color: cfg.color } : {}} onClick={() => setForm(p => ({ ...p, type: t }))}><span className="fl-type-pill-icon">{cfg.icon}</span><span>{cfg.label}</span></button>; })}
              </div>
              <div className="fl-amount-section">
                <div className="fl-amount-input-wrap" style={{ borderColor: typeConfig[form.type].border }}>
                  <span className="fl-amount-prefix" style={{ color: typeConfig[form.type].color }}>{sym}</span>
                  <input ref={addAmtRef} className="fl-amount-input" style={{ color: typeConfig[form.type].color }} type="text" inputMode="decimal" placeholder="0.00" value={rawAmt} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setRawAmt(fmtInput(raw)); setForm(p => ({ ...p, amount: raw })); }} onKeyDown={e => { if (e.key === 'Enter') (editTx ? saveEdit : addTx)(); }} />
                </div>
                <div className="fl-quick-amounts">{[10, 25, 50, 100].map(a => <button key={a} className="fl-quick-amt" style={{ borderColor: form.amount === a.toString() ? typeConfig[form.type].border : '' }} onClick={() => { setRawAmt(fmtInput(a.toString())); setForm(p => ({ ...p, amount: a.toString() })); }}>{sym}{a}</button>)}</div>
              </div>
              <div className="fl-field-group"><label className="fl-field-label">Description</label><input className="fl-field-input" placeholder="e.g. Monthly rent, salary, Netflix…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') (editTx ? saveEdit : addTx)(); }} /></div>
              <div className="fl-field-row">
                <div className="fl-field-group" style={{ flex: 1 }}><label className="fl-field-label">Category</label><select className="fl-field-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}><option value="">Optional</option>{(form.type === 'income' ? [] : (cats[form.type === 'need' ? 'needs' : form.type === 'want' ? 'wants' : 'savings'] || [])).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="fl-field-group" style={{ flex: 1 }}><label className="fl-field-label">Date</label><input className="fl-field-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div className="fl-modal-footer">
                <label className="fl-recurring-label"><input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} />Recurring</label>
                <div className="fl-modal-actions"><span className="fl-kbd-hint">Ctrl+Enter to save</span><button className="fl-btn-primary" onClick={editTx ? saveEdit : addTx}>{editTx ? 'Save changes' : 'Log ' + TYPE_LABEL[form.type].toLowerCase()}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
