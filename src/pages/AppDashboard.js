import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './AppDashboard.css';

const DEFAULT_CATS = {
  needs: ['Rent','Groceries','Utilities','Transport','Insurance','Healthcare'],
  wants: ['Dining','Entertainment','Shopping','Subscriptions','Travel','Hobbies'],
  savings: ['Investments','Emergency Fund','Retirement','Savings']
};

function calcFIRE(annualExp, annualSav, currentSav) {
  const fireNum = annualExp * 25;
  if (annualSav <= 0) return { fireNum, years: Infinity, progress: 0 };
  const r = 0.07;
  let years = 0, bal = currentSav;
  while (bal < fireNum && years < 100) { bal = bal * (1 + r) + annualSav; years++; }
  const progress = Math.min((currentSav / fireNum) * 100, 100);
  return { fireNum, years, progress };
}

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtD = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
// eslint-disable-next-line no-unused-vars
const TYPE_COLOR = { income: '#4ade80', need: '#f87171', want: '#f87171', saving: '#fbbf24' };
const TYPE_LABEL = { income: 'Income', need: 'Need', want: 'Want', saving: 'Saving' };
const QUICK_AMTS = [10, 25, 50, 100];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Amount color helper — green for income, gold for saving, red for need/want
const amtColor = (type) => {
  if (type === 'income') return 'var(--green)';
  if (type === 'saving') return 'var(--gold)';
  return 'var(--red)';
};

// Format number with commas for display in input
const fmtInput = (val) => {
  if (!val && val !== 0) return '';
  const num = val.toString().replace(/[^0-9.]/g, '');
  const parts = num.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

function smartParseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], mapping: {}, headers: [] };

  const parseLine = line => {
    const cols = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    cols.push(cur.trim()); return cols;
  };

  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/[a-zA-Z]{3,}/.test(lines[i])) { headerIdx = i; break; }
  }
  const headers = parseLine(lines[headerIdx]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const detect = (keywords) => {
    for (const kw of keywords) {
      const idx = headers.findIndex(h => h.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const mapping = {
    date:        detect(['date','day','time','when','period','month']),
    description: detect(['desc','name','memo','narr','payee','detail','title','note','item','transaction','particulars']),
    amount:      detect(['amount','amt','value','sum','total','debit','credit','price','cost','money','inr','usd','gbp','eur']),
    type:        detect(['type','category','cat','class','kind','label','tag','group']),
    category:    detect(['category','cat','subcategory','subcat','group']),
    recurring:   detect(['recurring','repeat','regular','periodic','recur']),
  };

  const debitIdx  = detect(['debit','withdrawal','expense','spent','out']);
  const creditIdx = detect(['credit','income','deposit','received','in']);

  const dataLines = lines.slice(headerIdx + 1);
  const rows = dataLines.map(line => {
    const cols = parseLine(line);
    const get = idx => (idx >= 0 && idx < cols.length) ? cols[idx] : '';

    let rawDate = get(mapping.date);
    let rawAmt  = get(mapping.amount);
    let rawDesc = get(mapping.description);
    let rawType = get(mapping.type).toLowerCase();
    let rawCat  = mapping.category !== mapping.type ? get(mapping.category) : '';
    let rawRec  = get(mapping.recurring);

    if (mapping.amount === -1 && (debitIdx !== -1 || creditIdx !== -1)) {
      const debit  = parseFloat(get(debitIdx).replace(/[^0-9.-]/g, '')) || 0;
      const credit = parseFloat(get(creditIdx).replace(/[^0-9.-]/g, '')) || 0;
      if (credit > 0) { rawAmt = credit.toString(); rawType = rawType || 'income'; }
      else             { rawAmt = debit.toString();  rawType = rawType || 'need';   }
    }

    const amtClean = rawAmt.replace(/[^0-9.-]/g, '');
    const amount   = Math.abs(parseFloat(amtClean));
    if (!amount) return null;

    if (!rawType && amtClean.startsWith('-')) rawType = 'need';
    if (!rawType && parseFloat(amtClean) > 0)  rawType = 'income';

    const typeMap = {
      income:['income','salary','credit','deposit','received','earn','revenue','gain','in'],
      need:  ['need','essential','expense','debit','bill','rent','utility','transport','grocery','insurance','health','withdrawal','out'],
      want:  ['want','discretionary','leisure','entertainment','dining','shopping','travel','fun','hobby'],
      saving:['saving','invest','investment','retirement','fund','ira','401','pension','emergency','saving']
    };
    let type = 'need';
    for (const [t, words] of Object.entries(typeMap)) {
      if (words.some(w => rawType.includes(w) || rawCat.toLowerCase().includes(w) || rawDesc.toLowerCase().includes(w.slice(0,5)))) {
        type = t; break;
      }
    }

    let date = rawDate.replace(/['"]/g, '').trim();
    if (!date) date = new Date().toISOString().split('T')[0];
    const dateParts = date.match(/(\d{1,4})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (dateParts) {
      const [,a,b,c] = dateParts;
      if (a.length === 4) date = `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;
      else if (parseInt(a) > 12) date = `${c.length===2?'20'+c:c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;
      else date = `${c.length===2?'20'+c:c}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;
    }

    if (isNaN(new Date(date).getTime())) date = new Date().toISOString().split('T')[0];

    const description = rawDesc || rawCat || rawType || 'Transaction';
    const category    = rawCat || '';
    const recurring   = /yes|true|1|y/i.test(rawRec);

    return { date, description: description.slice(0,100), type, category: category.slice(0,50), amount, recurring };
  }).filter(Boolean);

  return { rows, headers, mapping };
}

export default function AppDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('home');
  const [txs, setTxs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [fire, setFireSettings] = useState({ annualExpenses: 40000, annualSavings: 20000, currentSavings: 50000 });
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState(null);
  const [whatIf, setWhatIf] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [importModal, setImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [rawAmountInput, setRawAmountInput] = useState('');
  const [form, setForm] = useState({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
  const addAmtRef = useRef(null);
  const fileInputRef = useRef(null);
  const userId = user?.id;

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [txRes, setRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('user_settings').select('*').eq('user_id', userId).single()
    ]);
    if (txRes.data) setTxs(txRes.data);
    if (setRes.data) {
      if (setRes.data.fire_settings) setFireSettings(setRes.data.fire_settings);
      if (setRes.data.custom_categories) setCats(setRes.data.custom_categories);
    } else { setShowOnboard(true); }
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Milestone check
  useEffect(() => {
    const fc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
    const p = fc.progress;
    if (p >= 75 && p < 76) setMilestone('🎉 You hit 75% to FIRE!');
    else if (p >= 50 && p < 51) setMilestone('🔥 Halfway to FIRE!');
    else if (p >= 25 && p < 26) setMilestone('⚡ 25% to FIRE — great start!');
  }, [fire]);

  // Keyboard shortcuts for modal
  useEffect(() => {
    if (!showAdd) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setShowAdd(false); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { addTx(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdd, form]);

  const saveSettings = async (fs, cc) => {
    await supabase.from('user_settings').upsert({ user_id: userId, fire_settings: fs || fire, custom_categories: cc || cats, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  };

  const addTx = async () => {
    if (!form.amount || !form.description) return;
    const tx = { user_id: userId, amount: parseFloat(form.amount), description: form.description, type: form.type, category: form.category, date: form.date, recurring: form.recurring };
    const { data } = await supabase.from('transactions').insert(tx).select().single();
    if (data) { setTxs(p => [data, ...p]); showToast(`${TYPE_LABEL[form.type]} logged ✓`); }
    setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
    setRawAmountInput('');
    setShowAdd(false);
  };

  const deleteTx = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTxs(p => p.filter(t => t.id !== id));
    showToast('Deleted', 'error');
  };

  // EXPORT TO CSV
  const exportCSV = () => {
    const rows = [['Date','Description','Type','Category','Amount','Recurring'], ...txs.map(t => [t.date, `"${t.description}"`, t.type, t.category || '', t.amount, t.recurring])];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fire-ledger-transactions.csv'; a.click();
    showToast('CSV exported — open in Excel or Google Sheets ✓');
  };

  // EXPORT TO EXCEL (formatted)
  const exportExcel = () => {
    const now = new Date();
    const fireCalc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
    const income = txs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
    const needs = txs.filter(t => t.type === 'need').reduce((s,t) => s+t.amount, 0);
    const wants = txs.filter(t => t.type === 'want').reduce((s,t) => s+t.amount, 0);
    const savings = txs.filter(t => t.type === 'saving').reduce((s,t) => s+t.amount, 0);
    const savRate = income > 0 ? ((savings/income)*100).toFixed(1) : 0;

    const summaryRows = [
      ['FIRE LEDGER — FINANCIAL REPORT','','','','',''],
      [`Generated: ${now.toLocaleDateString()}`,'','','','',''],
      ['','','','','',''],
      ['FIRE SUMMARY','','','','',''],
      ['FIRE Number', fireCalc.fireNum,'','Current Savings', fire.currentSavings,''],
      ['Years to FIRE', fireCalc.years === Infinity ? 'N/A' : fireCalc.years,'','Progress', `${fireCalc.progress.toFixed(1)}%`,''],
      ['Annual Expenses', fire.annualExpenses,'','Annual Savings', fire.annualSavings,''],
      ['','','','','',''],
      ['MONTHLY SUMMARY','','','','',''],
      ['Total Income', income,'','Savings Rate', `${savRate}%`,''],
      ['Total Needs', needs,'','Total Wants', wants,''],
      ['Total Savings', savings,'','','',''],
      ['','','','','',''],
      ['TRANSACTIONS','','','','',''],
      ['Date','Description','Type','Category','Amount','Recurring'],
      ...txs.map(t => [t.date, t.description, t.type, t.category||'', t.amount, t.recurring ? 'Yes' : 'No'])
    ];

    const csv = summaryRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fire-ledger-report.csv'; a.click();
    showToast('Excel report exported ✓');
  };

  // IMPORT — smart parser handles any CSV format
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows } = smartParseCSV(ev.target.result);
      setImportPreview(rows.slice(0, 6));
      setImportModal(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    const reader = new FileReader();
    reader.onload = async ev => {
      const { rows } = smartParseCSV(ev.target.result);
      const toInsert = rows.map(r => ({ ...r, user_id: userId }));
      if (toInsert.length > 0) {
        const { data } = await supabase.from('transactions').insert(toInsert).select();
        if (data) { setTxs(p => [...data, ...p]); showToast(`${data.length} transactions imported ✓`); }
      }
      setImportModal(false); setImportPreview([]); setImportFile(null);
    };
    reader.readAsText(importFile);
  };

  // Computed
  const now = new Date();
  const monthTxs = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear; });
  const income = monthTxs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const needs = monthTxs.filter(t => t.type === 'need').reduce((s,t) => s+t.amount, 0);
  const wants = monthTxs.filter(t => t.type === 'want').reduce((s,t) => s+t.amount, 0);
  const savings = monthTxs.filter(t => t.type === 'saving').reduce((s,t) => s+t.amount, 0);
  const spent = needs + wants;
  const savRate = income > 0 ? ((savings/income)*100).toFixed(1) : 0;
  const fireCalc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
  const fireWhatIf = calcFIRE(fire.annualExpenses, fire.annualSavings + (whatIf * 12), fire.currentSavings);
  const todayStr = now.toISOString().split('T')[0];
  const todaySpend = txs.filter(t => t.date === todayStr && (t.type === 'need' || t.type === 'want')).reduce((s,t) => s+t.amount, 0);
  const streak = (() => { let s = 0; const d = new Date(); for(let i=0;i<30;i++){const ds=new Date(d); ds.setDate(ds.getDate()-i); const dss=ds.toISOString().split('T')[0]; if(txs.some(t=>t.date===dss)) s++; else break;} return s; })();
  const fireDate = fireCalc.years < 100 ? new Date(now.getFullYear() + fireCalc.years, now.getMonth()).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Keep saving';
  const filtered = filterType === 'all' ? txs : txs.filter(t => t.type === filterType);
  const gradeRaw = parseFloat(savRate);
  const grade = gradeRaw >= 60 ? 'A+' : gradeRaw >= 50 ? 'A' : gradeRaw >= 40 ? 'B' : gradeRaw >= 30 ? 'C' : 'D';
  const gradeColor = gradeRaw >= 50 ? 'var(--green)' : gradeRaw >= 35 ? 'var(--gold)' : 'var(--red)';
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const navMonth = (dir) => {
    let m = selectedMonth + dir, y = selectedYear;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    setSelectedMonth(m); setSelectedYear(y);
  };

  // Type button config for modal
  const typeConfig = {
    income: { label: 'Income',  icon: '↑', color: 'var(--green)', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.4)' },
    need:   { label: 'Need',    icon: '↓', color: 'var(--red)',   bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.4)' },
    want:   { label: 'Want',    icon: '↓', color: 'var(--red)',   bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.4)' },
    saving: { label: 'Saving',  icon: '→', color: 'var(--gold)',  bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.4)' },
  };

  if (loading) return (
    <div className="fl-loading">
      <div className="fl-logo-load">FL</div>
      <div className="fl-spinner" />
    </div>
  );

  return (
    <div className="fl-shell">
      {toast && <div className={`fl-toast ${toast.type}`}>{toast.msg}</div>}
      {milestone && (
        <div className="fl-milestone" onClick={() => setMilestone(null)}>
          <span>{milestone}</span>
          <button onClick={() => setMilestone(null)}>×</button>
        </div>
      )}

      {/* ONBOARDING */}
      {showOnboard && (
        <div className="fl-overlay">
          <div className="fl-onboard">
            <div className="ob-progress">
              {[0,1,2].map(i => <div key={i} className={`ob-dot ${onboardStep >= i ? 'active' : ''}`} />)}
            </div>
            {onboardStep === 0 && (
              <div className="ob-step">
                <div className="ob-icon">🔥</div>
                <h2>Welcome to FIRE Ledger</h2>
                <p>Set up your financial independence profile in 3 quick steps.</p>
                <button className="fl-btn-primary" onClick={() => setOnboardStep(1)}>Let's go →</button>
              </div>
            )}
            {onboardStep === 1 && (
              <div className="ob-step">
                <div className="ob-icon">💰</div>
                <h2>Annual Expenses</h2>
                <p>How much do you spend per year in retirement?</p>
                <input className="fl-input-lg" type="number" placeholder="e.g. 40000" value={fire.annualExpenses||''} onChange={e => setFireSettings(p=>({...p,annualExpenses:parseFloat(e.target.value)||0}))} />
                <div className="ob-hint">Your FIRE number = {fmt(fire.annualExpenses * 25)}</div>
                <button className="fl-btn-primary" onClick={() => setOnboardStep(2)}>Next →</button>
              </div>
            )}
            {onboardStep === 2 && (
              <div className="ob-step">
                <div className="ob-icon">📈</div>
                <h2>Your Savings</h2>
                <input className="fl-input-lg" type="number" placeholder="Annual savings (e.g. 20000)" value={fire.annualSavings||''} onChange={e => setFireSettings(p=>({...p,annualSavings:parseFloat(e.target.value)||0}))} />
                <input className="fl-input-lg" type="number" placeholder="Current savings (e.g. 50000)" value={fire.currentSavings||''} style={{marginTop:10}} onChange={e => setFireSettings(p=>({...p,currentSavings:parseFloat(e.target.value)||0}))} />
                <button className="fl-btn-primary" style={{marginTop:12}} onClick={async()=>{await saveSettings(fire,cats);setShowOnboard(false);showToast('Welcome to FIRE Ledger ✓');}}>Start tracking →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMPORT PREVIEW MODAL */}
      {importModal && (
        <div className="fl-overlay" onClick={() => setImportModal(false)}>
          <div className="fl-modal" onClick={e => e.stopPropagation()}>
            <div className="fl-modal-header">
              <h2>Import Preview</h2>
              <button className="fl-modal-close" onClick={() => setImportModal(false)}>×</button>
            </div>
            <div className="fl-modal-body">
              <p style={{color:'var(--t2)',fontSize:13,marginBottom:8}}>
                {importPreview.length > 0
                  ? `Detected ${importPreview.length}+ transactions. Columns were auto-detected — review before importing.`
                  : 'Could not detect transactions. Make sure your file has at least a date and amount column.'}
              </p>
              {importPreview.map((t,i) => (
                <div key={i} className="fl-tx-card" style={{marginBottom:8}}>
                  <div className="fl-tx-card-badge" style={{background: amtColor(t.type) + '22', color: amtColor(t.type)}}>{TYPE_LABEL[t.type]}</div>
                  <div className="fl-tx-card-body">
                    <span className="fl-tx-card-desc">{t.description}</span>
                    <span className="fl-tx-card-meta">{t.date}{t.category && ` · ${t.category}`}</span>
                  </div>
                  <span className="fl-tx-card-amount" style={{color: amtColor(t.type)}}>{fmtD(t.amount)}</span>
                </div>
              ))}
              {importPreview.length === 0 && <p style={{color:'var(--t2)',fontSize:13}}>No valid rows found.</p>}
              {importPreview.length > 0 && (
                <button className="fl-btn-primary" style={{width:'100%',marginTop:4}} onClick={confirmImport}>
                  Import All →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="fl-sidebar">
        <div className="fl-brand">
          <span className="fl-brand-icon">🔥</span>
          <span className="fl-brand-name">FIRELedger</span>
        </div>
        <nav className="fl-nav">
          {[
            {id:'home',icon:'⚡',label:'Dashboard'},
            {id:'transactions',icon:'📋',label:'Transactions'},
            {id:'insights',icon:'📊',label:'Insights'},
            {id:'fire',icon:'🔥',label:'FIRE Calc'},
            {id:'export',icon:'↗',label:'Export & Import'},
            {id:'settings',icon:'⚙️',label:'Settings'},
          ].map(t => (
            <button key={t.id} className={`fl-nav-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              <span className="fl-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
              {tab===t.id && <div className="fl-nav-indicator"/>}
            </button>
          ))}
        </nav>
        <div className="fl-sidebar-footer">
          <div className="fl-user-chip">
            <div className="fl-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="fl-user-info">
              <span className="fl-user-email">{user?.email?.split('@')[0]}</span>
              <span className="fl-user-plan">Pro</span>
            </div>
          </div>
          <button className="fl-signout" onClick={signOut} title="Sign out">↗</button>
        </div>
      </aside>

      <main className="fl-main">

        {/* DASHBOARD */}
        {tab === 'home' && (
          <div className="fl-page">
            <div className="fl-page-top">
              <div>
                <h1 className="fl-title">{now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening'}</h1>
                <p className="fl-subtitle">
                  {todaySpend > 0 ? `${fmtD(todaySpend)} spent today` : 'No spending logged today'}
                  {streak > 1 && <span className="fl-streak"> · 🔥 {streak}-day streak</span>}
                </p>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div className="fl-month-nav">
                  <button onClick={() => navMonth(-1)}>‹</button>
                  <span>{MONTHS[selectedMonth]} {selectedYear}</span>
                  <button onClick={() => navMonth(1)} disabled={isCurrentMonth}>›</button>
                </div>
                <button className="fl-add-fab" onClick={() => {setShowAdd(true);setTimeout(()=>addAmtRef.current?.focus(),100);}}>+ Log</button>
              </div>
            </div>

            {/* FIRE HERO */}
            <div className="fl-fire-hero">
              <div className="fl-fire-hero-left">
                <div className="fl-fire-label">Financial Independence</div>
                <div className="fl-fire-years">{fireCalc.years===Infinity?'∞':fireCalc.years}<span className="fl-fire-years-unit">yrs away</span></div>
                <div className="fl-fire-date">Freedom: <strong>{fireDate}</strong></div>
                <div className="fl-fire-progress-bar"><div className="fl-fire-progress-fill" style={{width:`${fireCalc.progress}%`}}/></div>
                <div className="fl-fire-progress-label">{fireCalc.progress.toFixed(1)}% · {fmt(fire.currentSavings)} of {fmt(fireCalc.fireNum)}</div>
              </div>
              <div className="fl-fire-hero-right">
                <svg viewBox="0 0 140 140" className="fl-fire-ring">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                  <circle cx="70" cy="70" r="58" fill="none" stroke="url(#hg)" strokeWidth="12" strokeDasharray="364" strokeDashoffset={364-(364*fireCalc.progress/100)} strokeLinecap="round" transform="rotate(-90 70 70)"/>
                  <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--purple-light)"/><stop offset="100%" stopColor="var(--purple-dark)"/></linearGradient></defs>
                </svg>
                <div className="fl-ring-center"><span className="fl-ring-pct">{fireCalc.progress.toFixed(0)}%</span><span className="fl-ring-sub">to FIRE</span></div>
              </div>
            </div>

            {/* METRICS */}
            <div className="fl-metrics">
              {[
                {label:'Income', value:fmt(income), sub:'This month', color:'var(--green)', icon:'↑'},
                {label:'Spent',  value:fmt(spent),  sub:`${income>0?((spent/income)*100).toFixed(0):0}% of income`, color:'var(--red)',  icon:'↓'},
                {label:'Saved',  value:fmt(savings), sub:`${savRate}% rate`, color:'var(--gold)', icon:'→'},
                {label:'Grade',  value:grade, sub:'Savings rate', color:gradeColor, icon:'★'},
              ].map((m,i) => (
                <div key={i} className="fl-metric-card" style={{'--accent':m.color}}>
                  <div className="fl-metric-top"><span className="fl-metric-label">{m.label}</span><span style={{color:m.color,fontWeight:700}}>{m.icon}</span></div>
                  <div className="fl-metric-value" style={{color:m.color}}>{m.value}</div>
                  <div className="fl-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            <div className="fl-section-header">
              <h2 className="fl-section-title">Recent Transactions</h2>
              <button className="fl-link-btn" onClick={() => setTab('transactions')}>View all →</button>
            </div>
            <div className="fl-tx-list">
              {txs.slice(0,8).map(t => (
                <div key={t.id} className="fl-tx-row">
                  <div className="fl-tx-type-dot" style={{background: amtColor(t.type)}}/>
                  <div className="fl-tx-body"><span className="fl-tx-desc">{t.description}</span><span className="fl-tx-meta">{t.category||TYPE_LABEL[t.type]} · {t.date}</span></div>
                  <span className="fl-tx-amount" style={{color: amtColor(t.type)}}>
                    {t.type==='income'||t.type==='saving'?'+':'-'}{fmtD(t.amount)}
                  </span>
                </div>
              ))}
              {txs.length===0 && <div className="fl-empty"><div className="fl-empty-icon">📝</div><p>No transactions yet</p><button className="fl-btn-primary" onClick={()=>setShowAdd(true)}>Log your first transaction</button></div>}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === 'transactions' && (
          <div className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Transactions</h1><p className="fl-subtitle">{txs.length} total</p></div>
              <div style={{display:'flex',gap:10}}>
                <button className="fl-btn-ghost" onClick={() => fileInputRef.current?.click()}>↑ Import</button>
                <button className="fl-btn-ghost" onClick={exportCSV}>↓ CSV</button>
                <button className="fl-add-fab" onClick={() => setShowAdd(true)}>+ Add</button>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt" style={{display:'none'}} onChange={handleImportFile}/>
              </div>
            </div>
            <div className="fl-filter-row">
              {['all','income','need','want','saving'].map(f => (
                <button key={f} className={`fl-chip ${filterType===f?'active':''}`}
                  style={filterType===f&&f!=='all'?{borderColor: amtColor(f), color: amtColor(f), background: amtColor(f).replace(')', ',0.12)').replace('var(','rgba(')}:{}}
                  onClick={() => setFilterType(f)}>{f==='all'?'All':TYPE_LABEL[f]}</button>
              ))}
            </div>
            <div className="fl-tx-cards">
              {filtered.map(t => (
                <div key={t.id} className="fl-tx-card">
                  <div className="fl-tx-card-badge" style={{background: amtColor(t.type)+'22', color: amtColor(t.type)}}>{TYPE_LABEL[t.type]}</div>
                  <div className="fl-tx-card-body"><span className="fl-tx-card-desc">{t.description}</span><span className="fl-tx-card-meta">{t.category&&`${t.category} · `}{t.date}{t.recurring?' · 🔄':''}</span></div>
                  <span className="fl-tx-card-amount" style={{color: amtColor(t.type)}}>
                    {t.type==='income'||t.type==='saving'?'+':'-'}{fmtD(t.amount)}
                  </span>
                  <button className="fl-tx-del" onClick={() => deleteTx(t.id)}>×</button>
                </div>
              ))}
              {filtered.length===0 && <div className="fl-empty"><div className="fl-empty-icon">🔍</div><p>No transactions found</p></div>}
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === 'insights' && (
          <div className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Insights</h1><p className="fl-subtitle">{MONTHS[selectedMonth]} {selectedYear}</p></div>
              <div className="fl-month-nav">
                <button onClick={() => navMonth(-1)}>‹</button>
                <span>{MONTHS[selectedMonth]} {selectedYear}</span>
                <button onClick={() => navMonth(1)} disabled={isCurrentMonth}>›</button>
              </div>
            </div>
            <div className="fl-insights-grid">
              <div className="fl-insight-card fl-insight-wide">
                <h3>Monthly Overview</h3>
                <div className="fl-overview-bars">
                  {[{label:'Income',val:income,color:'var(--green)'},{label:'Needs',val:needs,color:'var(--red)'},{label:'Wants',val:wants,color:'var(--red)'},{label:'Savings',val:savings,color:'var(--gold)'}].map(b => (
                    <div key={b.label} className="fl-bar-row">
                      <span className="fl-bar-label">{b.label}</span>
                      <div className="fl-bar-track"><div className="fl-bar-fill" style={{width:`${income>0?Math.min((b.val/income)*100,100):0}%`,background:b.color}}/></div>
                      <span className="fl-bar-val">{fmt(b.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>Savings Grade</h3>
                <div className="fl-grade-display"><span className="fl-grade-letter" style={{color:gradeColor}}>{grade}</span><span className="fl-grade-rate">{savRate}% savings rate</span></div>
                <div className="fl-grade-tiers">
                  {[{g:'A+',min:60},{g:'A',min:50},{g:'B',min:40},{g:'C',min:30},{g:'D',min:0}].map(t => (
                    <div key={t.g} className={`fl-grade-tier ${gradeRaw>=t.min&&(t.g==='D'||gradeRaw<(({'A+':999,'A':60,'B':50,'C':40,'D':30})[t.g]||999))?'active':''}`}>
                      <span>{t.g}</span><span>{t.min}%+</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>50/30/20 Check</h3>
                <div className="fl-rule-list">
                  {[{label:'Needs',actual:income>0?(needs/income)*100:0,target:50,color:'var(--red)'},{label:'Wants',actual:income>0?(wants/income)*100:0,target:30,color:'var(--red)'},{label:'Savings',actual:income>0?(savings/income)*100:0,target:20,color:'var(--gold)'}].map(r => (
                    <div key={r.label} className="fl-rule-row">
                      <span>{r.label}</span>
                      <div className="fl-rule-bar-track"><div className="fl-rule-bar-fill" style={{width:`${Math.min(r.actual,100)}%`,background:r.color}}/><div className="fl-rule-target" style={{left:`${r.target}%`}}/></div>
                      <span style={{color:r.actual<=r.target+5?'var(--green)':'var(--red)',fontWeight:700,minWidth:36,textAlign:'right'}}>{r.actual.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>Top Expenses</h3>
                {Object.entries(monthTxs.filter(t=>t.type==='need'||t.type==='want').reduce((a,t)=>{a[t.category||t.type]=(a[t.category||t.type]||0)+t.amount;return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cat,amt]) => (
                  <div key={cat} className="fl-top-exp">
                    <span>{cat}</span>
                    <div className="fl-top-exp-bar" style={{width:`${income>0?(amt/income)*100:0}%`}}/>
                    <span style={{color:'var(--red)',fontWeight:600}}>{fmt(amt)}</span>
                  </div>
                ))}
                {monthTxs.filter(t=>t.type==='need'||t.type==='want').length===0&&<p className="fl-empty-sm">No expenses this month</p>}
              </div>
            </div>
          </div>
        )}

        {/* FIRE */}
        {tab === 'fire' && (
          <div className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">FIRE Calculator</h1><p className="fl-subtitle">Financial Independence, Retire Early</p></div></div>
            <div className="fl-fire-layout">
              <div className="fl-fire-inputs">
                <h3>Your Numbers</h3>
                {[{key:'annualExpenses',label:'Annual Expenses',hint:'What you spend per year'},{key:'annualSavings',label:'Annual Savings',hint:'What you invest per year'},{key:'currentSavings',label:'Current Savings',hint:'Total invested today'}].map(f => (
                  <div key={f.key} className="fl-fire-field">
                    <label>{f.label}</label>
                    <div className="fl-fire-input-wrap"><span className="fl-input-prefix">$</span><input className="fl-fire-input" type="number" value={fire[f.key]} onChange={e=>setFireSettings(p=>({...p,[f.key]:parseFloat(e.target.value)||0}))}/></div>
                    <span className="fl-fire-hint">{f.hint}</span>
                  </div>
                ))}
                <button className="fl-btn-primary" style={{width:'100%'}} onClick={()=>{saveSettings(fire,null);showToast('Saved ✓');}}>Save Settings</button>
                <div className="fl-whatif">
                  <h4>What if I saved more?</h4>
                  <div className="fl-whatif-row"><span style={{whiteSpace:'nowrap'}}>+{fmt(whatIf)}/mo</span><input type="range" min="0" max="2000" step="50" value={whatIf} onChange={e=>setWhatIf(parseInt(e.target.value))} className="fl-slider"/></div>
                  {whatIf>0&&<div className="fl-whatif-result">Saves <strong style={{color:'var(--green)'}}>{Math.max(0,fireCalc.years-fireWhatIf.years)} years</strong> — retire in <strong style={{color:'var(--gold)'}}>{fireWhatIf.years} yrs</strong></div>}
                </div>
              </div>
              <div className="fl-fire-results">
                <div className="fl-fire-big-ring">
                  <svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="95" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="18"/><circle cx="110" cy="110" r="95" fill="none" stroke="url(#fg2)" strokeWidth="18" strokeDasharray="597" strokeDashoffset={597-(597*fireCalc.progress/100)} strokeLinecap="round" transform="rotate(-90 110 110)"/><defs><linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--purple-light)"/><stop offset="100%" stopColor="var(--purple-dark)"/></linearGradient></defs></svg>
                  <div className="fl-fire-big-center"><span className="fl-fire-big-pct">{fireCalc.progress.toFixed(1)}%</span><span className="fl-fire-big-sub">to FIRE</span></div>
                </div>
                <div className="fl-fire-stat-grid">
                  {[{label:'FIRE Number',value:fmt(fireCalc.fireNum),hint:'25× expenses',color:'var(--gold)'},{label:'Years Away',value:fireCalc.years===Infinity?'∞':fireCalc.years,hint:'At 7% return',color:fireCalc.years<=10?'var(--green)':fireCalc.years<=20?'var(--gold)':'var(--red)'},{label:'Freedom Date',value:fireDate,hint:'Projected',color:'var(--purple-light)'},{label:'Gap',value:fmt(Math.max(0,fireCalc.fireNum-fire.currentSavings)),hint:'Still needed',color:'var(--blue)'}].map((s,i)=>(
                    <div key={i} className="fl-fire-stat"><span className="fl-fire-stat-label">{s.label}</span><span className="fl-fire-stat-value" style={{color:s.color,fontSize:s.label==='Freedom Date'?18:22}}>{s.value}</span><span className="fl-fire-stat-hint">{s.hint}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT & IMPORT */}
        {tab === 'export' && (
          <div className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">Export & Import</h1><p className="fl-subtitle">Your data, your way — no format required</p></div></div>
            <div className="fl-export-grid">
              <div className="fl-export-card">
                <div className="fl-export-icon">📊</div>
                <h3>Excel / Google Sheets Report</h3>
                <p>Full financial report with FIRE summary, monthly totals, and all transactions. Open directly in Excel, Numbers, or Google Sheets.</p>
                <button className="fl-btn-primary" onClick={exportExcel}>Download Report (.csv)</button>
              </div>
              <div className="fl-export-card">
                <div className="fl-export-icon">📋</div>
                <h3>Raw CSV Export</h3>
                <p>Clean transaction data. Import into any tool — YNAB, Mint, Personal Capital, or your own spreadsheet.</p>
                <button className="fl-btn-primary" onClick={exportCSV}>Download CSV</button>
              </div>
              <div className="fl-export-card">
                <div className="fl-export-icon">🧠</div>
                <h3>Smart Import — Any Format</h3>
                <p>Import from <strong>any</strong> CSV or bank export. Auto-detects columns — dates, amounts, descriptions — regardless of column order or naming. Works with bank statements, YNAB exports, Excel files saved as CSV, and more.</p>
                <button className="fl-btn-primary" onClick={()=>fileInputRef.current?.click()}>Import File</button>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{display:'none'}} onChange={handleImportFile}/>
              </div>
              <div className="fl-export-card">
                <div className="fl-export-icon">📎</div>
                <h3>Import Tips</h3>
                <p>The smart importer handles most formats automatically. For best results your file should have:</p>
                <div className="fl-format-table">
                  {['A date column (any name, any format)','An amount or debit/credit column','A description or memo column','Optional: Type, Category, Recurring'].map((col,i)=>(
                    <div key={i} className="fl-format-row"><span className="fl-format-num">{i+1}</span><span>{col}</span></div>
                  ))}
                </div>
                <button className="fl-btn-ghost" style={{marginTop:8}} onClick={()=>{
                  const s='Date,Description,Type,Category,Amount,Recurring\n2026-03-01,Salary,income,,5000,No\n2026-03-02,Rent,need,Rent,1400,Yes\n2026-03-03,Groceries,need,Groceries,180,No';
                  const b=new Blob([s],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='fire-ledger-template.csv'; a.click();
                  showToast('Template downloaded ✓');
                }}>Download Template</button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="fl-page">
            <div className="fl-page-top"><h1 className="fl-title">Settings</h1></div>
            <div className="fl-settings-grid">
              <div className="fl-settings-card">
                <h3>Custom Categories</h3>
                {['needs','wants','savings'].map(type => (
                  <div key={type} className="fl-cat-group">
                    <h4 style={{color:type==='needs'?'var(--red)':type==='wants'?'var(--red)':'var(--gold)'}}>{type.charAt(0).toUpperCase()+type.slice(1)}</h4>
                    <div className="fl-cat-tags">
                      {cats[type].map(cat => (
                        <span key={cat} className="fl-cat-tag">{cat}<button onClick={()=>{const u={...cats,[type]:cats[type].filter(c=>c!==cat)};setCats(u);saveSettings(null,u);}}>×</button></span>
                      ))}
                      <input className="fl-cat-add-input" placeholder="+ Add" onKeyDown={e=>{if(e.key==='Enter'&&e.target.value.trim()){const u={...cats,[type]:[...cats[type],e.target.value.trim()]};setCats(u);saveSettings(null,u);e.target.value='';showToast('Category added ✓');}}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="fl-settings-card">
                <h3>Account</h3>
                <div className="fl-account-row">
                  <div className="fl-account-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                  <div><div style={{fontWeight:600,fontSize:15}}>{user?.email}</div><div style={{fontSize:12,color:'var(--t2)',marginTop:2}}>Pro · Active</div></div>
                </div>
                <button className="fl-btn-ghost" style={{width:'100%',marginTop:20}} onClick={exportExcel}>↓ Download Full Report</button>
                <button className="fl-btn-ghost" style={{width:'100%',marginTop:10}} onClick={exportCSV}>↓ Export CSV</button>
                <button className="fl-btn-danger" style={{width:'100%',marginTop:16}} onClick={signOut}>Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD TRANSACTION MODAL — redesigned */}
      {showAdd && (
        <div className="fl-overlay" onClick={() => setShowAdd(false)}>
          <div className="fl-modal fl-modal-log" onClick={e=>e.stopPropagation()}>
            <div className="fl-modal-header">
              <h2>Log Transaction</h2>
              <button className="fl-modal-close" onClick={()=>setShowAdd(false)}>×</button>
            </div>
            <div className="fl-modal-body">

              {/* Type selector — pill style */}
              <div className="fl-type-grid">
                {['income','need','want','saving'].map(t => {
                  const cfg = typeConfig[t];
                  const active = form.type === t;
                  return (
                    <button key={t}
                      className={`fl-type-pill ${active ? 'active' : ''}`}
                      style={active ? {background: cfg.bg, borderColor: cfg.border, color: cfg.color} : {}}
                      onClick={() => setForm(p => ({...p, type: t}))}>
                      <span className="fl-type-pill-icon">{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Amount input with live comma formatting */}
              <div className="fl-amount-section">
                <div className="fl-amount-input-wrap" style={{borderColor: typeConfig[form.type].border}}>
                  <span className="fl-amount-prefix" style={{color: typeConfig[form.type].color}}>$</span>
                  <input
                    ref={addAmtRef}
                    className="fl-amount-input"
                    style={{color: typeConfig[form.type].color}}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={rawAmountInput}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9.]/g, '');
                      setRawAmountInput(fmtInput(raw));
                      setForm(p => ({...p, amount: raw}));
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') addTx(); }}
                  />
                </div>
                <div className="fl-quick-amounts">
                  {QUICK_AMTS.map(a=>(
                    <button key={a} className="fl-quick-amt"
                      style={{borderColor: form.amount === a.toString() ? typeConfig[form.type].border : ''}}
                      onClick={()=>{setRawAmountInput(fmtInput(a.toString())); setForm(p=>({...p,amount:a.toString()}));}}>
                      ${a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="fl-field-group">
                <label className="fl-field-label">Description</label>
                <input
                  className="fl-field-input"
                  placeholder="e.g. Monthly rent, Salary, Netflix..."
                  value={form.description}
                  onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                  onKeyDown={e=>{ if(e.key==='Enter') addTx(); }}
                />
              </div>

              {/* Category + Date row */}
              <div className="fl-field-row">
                <div className="fl-field-group" style={{flex:1}}>
                  <label className="fl-field-label">Category</label>
                  <select className="fl-field-input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    <option value="">Optional</option>
                    {(cats[form.type==='need'?'needs':form.type==='want'?'wants':form.type==='saving'?'savings':null]||[]).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fl-field-group" style={{flex:1}}>
                  <label className="fl-field-label">Date</label>
                  <input className="fl-field-input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/>
                </div>
              </div>

              {/* Recurring + submit */}
              <div className="fl-modal-footer">
                <label className="fl-recurring-label">
                  <input type="checkbox" checked={form.recurring} onChange={e=>setForm(p=>({...p,recurring:e.target.checked}))}/>
                  Recurring
                </label>
                <div className="fl-modal-actions">
                  <span className="fl-kbd-hint">↵ Enter to save · Esc to cancel</span>
                  <button className="fl-btn-primary" onClick={addTx}>
                    Log {TYPE_LABEL[form.type]}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
