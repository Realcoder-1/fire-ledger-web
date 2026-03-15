import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './AppDashboard.css';

// ─── Currency config ──────────────────────────────────────────────────────────
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar',     flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro',           flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound',  flag: '🇬🇧' },
  INR: { symbol: '₹', name: 'Indian Rupee',   flag: '🇮🇳' },
};

const DEFAULT_CATS = {
  needs:   ['Rent','Groceries','Utilities','Transport','Insurance','Healthcare'],
  wants:   ['Dining','Entertainment','Shopping','Subscriptions','Travel','Hobbies'],
  savings: ['Investments','Emergency Fund','Retirement','Savings'],
};

// ─── FIRE math ────────────────────────────────────────────────────────────────
function calcFIRE(annualExp, annualSav, currentSav, returnRate = 0.07) {
  const fireNum = annualExp * 25;
  if (annualSav <= 0) return { fireNum, years: Infinity, progress: 0 };
  let years = 0, bal = currentSav;
  while (bal < fireNum && years < 100) { bal = bal * (1 + returnRate) + annualSav; years++; }
  return { fireNum, years, progress: Math.min((currentSav / fireNum) * 100, 100) };
}

// ─── Projection curve (deterministic) ────────────────────────────────────────
function buildProjection(currentSav, annualSav, annualExp, years = 35) {
  const fireNum = annualExp * 25;
  const points = [];
  let bal = currentSav;
  for (let y = 0; y <= years; y++) {
    points.push({ year: y, value: Math.round(bal), target: Math.round(fireNum) });
    bal = bal * 1.07 + annualSav;
  }
  return points;
}

// ─── Monte Carlo simulator ────────────────────────────────────────────────────
function runMonteCarlo(currentSav, annualSav, annualExp, simYears = 35, runs = 500) {
  const fireNum = annualExp * 25;
  let successCount = 0;
  const percentiles = { p10: [], p50: [], p90: [] };
  const allRuns = [];

  for (let r = 0; r < runs; r++) {
    let bal = currentSav;
    const path = [bal];
    for (let y = 0; y < simYears; y++) {
      const mean = 0.07, std = 0.12;
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const ret = mean + std * z;
      bal = bal * (1 + ret) + annualSav;
      path.push(Math.max(0, Math.round(bal)));
    }
    allRuns.push(path);
    if (bal >= fireNum) successCount++;
  }

  // Build percentile bands
  for (let y = 0; y <= simYears; y++) {
    const vals = allRuns.map(p => p[y]).sort((a, b) => a - b);
    percentiles.p10.push(vals[Math.floor(runs * 0.10)]);
    percentiles.p50.push(vals[Math.floor(runs * 0.50)]);
    percentiles.p90.push(vals[Math.floor(runs * 0.90)]);
  }

  return {
    successRate: Math.round((successCount / runs) * 100),
    percentiles,
    fireNum,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeFmt = (currency) => {
  const { symbol } = CURRENCIES[currency] || CURRENCIES.USD;
  return {
    fmt:  n => `${symbol}${Math.abs(n) >= 1000 ? (Math.abs(n) >= 1000000 ? (n/1000000).toFixed(1)+'M' : (n/1000).toFixed(0)+'k') : Math.round(n)}`,
    fmtD: n => `${symbol}${Math.abs(parseFloat(n)).toFixed(2)}`,
    sym:  symbol,
  };
};

const TYPE_COLOR = { income: '#4ade80', need: '#f87171', want: '#f87171', saving: '#fbbf24' };
const TYPE_LABEL = { income: 'Income', need: 'Need', want: 'Want', saving: 'Saving' };
const QUICK_AMTS = [10, 25, 50, 100];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const amtColor = t => t === 'income' ? 'var(--green)' : t === 'saving' ? 'var(--gold)' : 'var(--red)';
const fmtInput = v => { if (!v && v !== 0) return ''; const n = v.toString().replace(/[^0-9.]/g,''); const p = n.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g,','); return p.join('.'); };

// ─── Smart CSV parser (unchanged) ─────────────────────────────────────────────
function smartParseCSV(text) {
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [] };
  const parseLine = line => { const cols=[]; let cur='',inQ=false; for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){inQ=!inQ;continue;}if(c===','&&!inQ){cols.push(cur.trim());cur='';continue;}cur+=c;}cols.push(cur.trim());return cols;};
  let headerIdx=0; for(let i=0;i<Math.min(5,lines.length);i++){if(/[a-zA-Z]{3,}/.test(lines[i])){headerIdx=i;break;}}
  const headers=parseLine(lines[headerIdx]).map(h=>h.toLowerCase().replace(/[^a-z0-9]/g,''));
  const detect=kws=>{for(const kw of kws){const idx=headers.findIndex(h=>h.includes(kw));if(idx!==-1)return idx;}return -1;};
  const mapping={date:detect(['date','day','time','when','period']),description:detect(['desc','name','memo','narr','payee','detail','title','note','item','particulars']),amount:detect(['amount','amt','value','sum','total','debit','credit','price','cost']),type:detect(['type','category','cat','class','kind','label']),category:detect(['category','cat','subcategory','group']),recurring:detect(['recurring','repeat','regular','recur'])};
  const debitIdx=detect(['debit','withdrawal','expense','spent','out']),creditIdx=detect(['credit','income','deposit','received','in']);
  const rows=lines.slice(headerIdx+1).map(line=>{
    const cols=parseLine(line),get=idx=>(idx>=0&&idx<cols.length)?cols[idx]:'';
    let rawDate=get(mapping.date),rawAmt=get(mapping.amount),rawDesc=get(mapping.description),rawType=get(mapping.type).toLowerCase(),rawCat=mapping.category!==mapping.type?get(mapping.category):'',rawRec=get(mapping.recurring);
    if(mapping.amount===-1&&(debitIdx!==-1||creditIdx!==-1)){const d=parseFloat(get(debitIdx).replace(/[^0-9.-]/g,''))||0,cr=parseFloat(get(creditIdx).replace(/[^0-9.-]/g,''))||0;if(cr>0){rawAmt=cr.toString();rawType=rawType||'income';}else{rawAmt=d.toString();rawType=rawType||'need';}}
    const amtClean=rawAmt.replace(/[^0-9.-]/g,''),amount=Math.abs(parseFloat(amtClean));
    if(!amount)return null;
    if(!rawType&&amtClean.startsWith('-'))rawType='need';
    const typeMap={income:['income','salary','credit','deposit','received','earn','revenue'],need:['need','essential','expense','debit','bill','rent','utility','transport','grocery','insurance','health'],want:['want','discretionary','leisure','entertainment','dining','shopping','travel','fun'],saving:['saving','invest','investment','retirement','fund','ira','401','pension','emergency']};
    let type='need';for(const[t,words]of Object.entries(typeMap)){if(words.some(w=>rawType.includes(w)||rawCat.toLowerCase().includes(w)||rawDesc.toLowerCase().includes(w.slice(0,5)))){type=t;break;}}
    let date=rawDate.replace(/['"]/g,'').trim();if(!date)date=new Date().toISOString().split('T')[0];
    const dp=date.match(/(\d{1,4})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if(dp){const[,a,b,c]=dp;if(a.length===4)date=`${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;else if(parseInt(a)>12)date=`${c.length===2?'20'+c:c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;else date=`${c.length===2?'20'+c:c}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;}
    if(isNaN(new Date(date).getTime()))date=new Date().toISOString().split('T')[0];
    return{date,description:(rawDesc||rawCat||rawType||'Transaction').slice(0,100),type,category:(rawCat||'').slice(0,50),amount,recurring:/yes|true|1|y/i.test(rawRec)};
  }).filter(Boolean);
  return { rows };
}

// ─── Mini SVG projection chart ────────────────────────────────────────────────
function ProjectionChart({ points, fireNum, sym, mcResult }) {
  const W = 560, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 60 };
  const maxVal = Math.max(fireNum * 1.2, ...points.map(p => p.value), mcResult ? Math.max(...mcResult.percentiles.p90) : 0);
  const xScale = y => PAD.left + (y / (points.length - 1)) * (W - PAD.left - PAD.right);
  const yScale = v => PAD.top + (1 - v / maxVal) * (H - PAD.top - PAD.bottom);
  const pathD = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
  const areaD = (top, bot) => {
    const t = top.map((v,i) => `${i===0?'M':'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
    const b = [...bot].reverse().map((v,i) => `L${xScale(bot.length-1-i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');
    return `${t} ${b} Z`;
  };

  const fireY = yScale(fireNum);
  const crossIdx = points.findIndex(p => p.value >= fireNum);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: maxVal * f, y: yScale(maxVal * f) }));
  const xTicks = points.filter((_, i) => i % 5 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="fl-proj-chart" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--purple-light)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--purple-light)" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="mcBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--purple-light)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--purple-light)" stopOpacity="0.02"/>
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(t => (
        <g key={t.v}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
            {t.v >= 1000000 ? `${sym}${(t.v/1000000).toFixed(1)}M` : t.v >= 1000 ? `${sym}${(t.v/1000).toFixed(0)}k` : `${sym}${Math.round(t.v)}`}
          </text>
        </g>
      ))}

      {/* X axis ticks */}
      {xTicks.map(p => (
        <text key={p.year} x={xScale(p.year)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">Yr {p.year}</text>
      ))}

      {/* Monte Carlo band */}
      {mcResult && (
        <path d={areaD(mcResult.percentiles.p90, mcResult.percentiles.p10)} fill="url(#mcBand)" />
      )}

      {/* P90 / P10 lines */}
      {mcResult && <>
        <path d={pathD(mcResult.percentiles.p90)} fill="none" stroke="var(--purple-light)" strokeWidth="1" strokeDasharray="3 4" opacity="0.3"/>
        <path d={pathD(mcResult.percentiles.p10)} fill="none" stroke="var(--red)" strokeWidth="1" strokeDasharray="3 4" opacity="0.3"/>
      </>}

      {/* Area fill under median */}
      <path d={`${pathD(points.map(p=>p.value))} L${xScale(points.length-1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`} fill="url(#projGrad)"/>

      {/* FIRE target line */}
      {fireY > PAD.top && fireY < H - PAD.bottom && (
        <>
          <line x1={PAD.left} y1={fireY} x2={W - PAD.right} y2={fireY} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7"/>
          <text x={W - PAD.right + 2} y={fireY + 4} fontSize="9" fill="var(--gold)" opacity="0.8">FIRE</text>
        </>
      )}

      {/* Crossover point */}
      {crossIdx > 0 && (
        <>
          <circle cx={xScale(crossIdx)} cy={yScale(points[crossIdx].value)} r="5" fill="var(--green)" opacity="0.9"/>
          <line x1={xScale(crossIdx)} y1={PAD.top} x2={xScale(crossIdx)} y2={H - PAD.bottom} stroke="var(--green)" strokeWidth="1" strokeDasharray="3 4" opacity="0.4"/>
          <text x={xScale(crossIdx)} y={PAD.top - 4} textAnchor="middle" fontSize="9" fill="var(--green)">Free</text>
        </>
      )}

      {/* Main projection line */}
      <path d={pathD(points.map(p=>p.value))} fill="none" stroke="var(--purple-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Current dot */}
      <circle cx={xScale(0)} cy={yScale(points[0].value)} r="4" fill="var(--purple-light)"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AppDashboard() {
  const { user, signOut } = useAuth();
  const [tab,           setTab]          = useState('home');
  const [txs,           setTxs]          = useState([]);
  const [showAdd,       setShowAdd]      = useState(false);
  const [showOnboard,   setShowOnboard]  = useState(false);
  const [onboardStep,   setOnboardStep]  = useState(0);
  const [fire,          setFireSettings] = useState({ annualExpenses: 40000, annualSavings: 20000, currentSavings: 50000 });
  const [cats,          setCats]         = useState(DEFAULT_CATS);
  const [loading,       setLoading]      = useState(true);
  const [filterType,    setFilterType]   = useState('all');
  const [toast,         setToast]        = useState(null);
  const [whatIf,        setWhatIf]       = useState(0);
  const [selectedMonth, setSelMonth]     = useState(new Date().getMonth());
  const [selectedYear,  setSelYear]      = useState(new Date().getFullYear());
  const [importModal,   setImportModal]  = useState(false);
  const [importPreview, setImportPreview]= useState([]);
  const [importFile,    setImportFile]   = useState(null);
  const [milestone,     setMilestone]    = useState(null);
  const [rawAmountInput,setRawAmt]       = useState('');
  const [currency,      setCurrency]     = useState('USD');
  const [showCurrMenu,  setShowCurrMenu] = useState(false);
  const [mcResult,      setMcResult]     = useState(null);
  const [mcRunning,     setMcRunning]    = useState(false);
  const [projYears,     setProjYears]    = useState(35);
  const [form, setForm] = useState({ amount:'', description:'', type:'need', category:'', date:new Date().toISOString().split('T')[0], recurring:false });
  const addAmtRef  = useRef(null);
  const fileInputRef = useRef(null);
  const userId = user?.id;
  const { fmt, fmtD, sym } = makeFmt(currency);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [txRes, setRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id',userId).order('date',{ascending:false}),
      supabase.from('user_settings').select('*').eq('user_id',userId).single(),
    ]);
    if (txRes.data) setTxs(txRes.data);
    if (setRes.data) {
      if (setRes.data.fire_settings)     setFireSettings(setRes.data.fire_settings);
      if (setRes.data.custom_categories) setCats(setRes.data.custom_categories);
      if (setRes.data.currency)          setCurrency(setRes.data.currency);
    } else {
      setShowOnboard(true);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const fc = calcFIRE(fire.annualExpenses, fire.annualSavings, fire.currentSavings);
    const p = fc.progress;
    if (p >= 75 && p < 76) setMilestone('🎉 You hit 75% to FIRE!');
    else if (p >= 50 && p < 51) setMilestone('🔥 Halfway to FIRE!');
    else if (p >= 25 && p < 26) setMilestone('⚡ 25% to FIRE — great start!');
  }, [fire]);

  useEffect(() => {
    if (!showAdd) return;
    const h = (e) => { if(e.key==='Escape') setShowAdd(false); if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)) addTx(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdd, form]);

  const saveSettings = async (fs, cc, cur) => {
    await supabase.from('user_settings').upsert({
      user_id: userId,
      fire_settings: fs || fire,
      custom_categories: cc || cats,
      currency: cur || currency,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  };

  const addTx = async () => {
    if (!form.amount || !form.description) return;
    const tx = { user_id:userId, amount:parseFloat(form.amount), description:form.description, type:form.type, category:form.category, date:form.date, recurring:form.recurring };
    const { data } = await supabase.from('transactions').insert(tx).select().single();
    if (data) { setTxs(p=>[data,...p]); showToast(`${TYPE_LABEL[form.type]} logged ✓`); }
    setForm({ amount:'', description:'', type:'need', category:'', date:new Date().toISOString().split('T')[0], recurring:false });
    setRawAmt(''); setShowAdd(false);
  };

  const deleteTx = async (id) => {
    await supabase.from('transactions').delete().eq('id',id);
    setTxs(p=>p.filter(t=>t.id!==id));
    showToast('Deleted','error');
  };

  const exportCSV = () => {
    const rows=[['Date','Description','Type','Category','Amount','Recurring'],...txs.map(t=>[t.date,`"${t.description}"`,t.type,t.category||'',t.amount,t.recurring])];
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})); a.download='fire-ledger.csv'; a.click();
    showToast('CSV exported ✓');
  };

  const exportExcel = () => {
    const fc=calcFIRE(fire.annualExpenses,fire.annualSavings,fire.currentSavings);
    const inc=txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const rows=[
      ['FIRE LEDGER REPORT','','','','',''],
      [`Currency: ${currency} · Generated: ${new Date().toLocaleDateString()}`,'','','','',''],['','','','','',''],
      ['FIRE NUMBER',fc.fireNum,'','CURRENT SAVINGS',fire.currentSavings,''],
      ['YEARS TO FIRE',fc.years===Infinity?'N/A':fc.years,'','PROGRESS',`${fc.progress.toFixed(1)}%`,''],
      ['ANNUAL EXPENSES',fire.annualExpenses,'','ANNUAL SAVINGS',fire.annualSavings,''],['','','','','',''],
      ['TOTAL INCOME',inc,'','SAVINGS RATE',inc>0?`${((txs.filter(t=>t.type==='saving').reduce((s,t)=>s+t.amount,0)/inc)*100).toFixed(1)}%`:0,''],
      ['','','','','',''],
      ['Date','Description','Type','Category','Amount','Recurring'],
      ...txs.map(t=>[t.date,t.description,t.type,t.category||'',t.amount,t.recurring?'Yes':'No'])
    ];
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')],{type:'text/csv'})); a.download='fire-ledger-report.csv'; a.click();
    showToast('Report exported ✓');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { const { rows } = smartParseCSV(ev.target.result); setImportPreview(rows.slice(0,6)); setImportModal(true); };
    reader.readAsText(file); e.target.value='';
  };

  const confirmImport = async () => {
    const reader = new FileReader();
    reader.onload = async ev => {
      const { rows } = smartParseCSV(ev.target.result);
      const { data } = await supabase.from('transactions').insert(rows.map(r=>({...r,user_id:userId}))).select();
      if (data) { setTxs(p=>[...data,...p]); showToast(`${data.length} transactions imported ✓`); }
      setImportModal(false); setImportPreview([]); setImportFile(null);
    };
    reader.readAsText(importFile);
  };

  const runMC = () => {
    setMcRunning(true);
    setTimeout(() => {
      const result = runMonteCarlo(fire.currentSavings, fire.annualSavings, fire.annualExpenses, projYears);
      setMcResult(result);
      setMcRunning(false);
    }, 50);
  };

  // ── Computed ──
  const now         = new Date();
  const isCurrent   = selectedMonth===now.getMonth()&&selectedYear===now.getFullYear();
  const monthTxs    = txs.filter(t=>{ const d=new Date(t.date); return d.getMonth()===selectedMonth&&d.getFullYear()===selectedYear; });
  const income      = monthTxs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const needs       = monthTxs.filter(t=>t.type==='need').reduce((s,t)=>s+t.amount,0);
  const wants       = monthTxs.filter(t=>t.type==='want').reduce((s,t)=>s+t.amount,0);
  const savings     = monthTxs.filter(t=>t.type==='saving').reduce((s,t)=>s+t.amount,0);
  const savRate     = income>0?((savings/income)*100).toFixed(1):0;
  const fireCalc    = calcFIRE(fire.annualExpenses,fire.annualSavings,fire.currentSavings);
  const fireWhatIf  = calcFIRE(fire.annualExpenses,fire.annualSavings+(whatIf*12),fire.currentSavings);
  const todayStr    = now.toISOString().split('T')[0];
  const todaySpend  = txs.filter(t=>t.date===todayStr&&(t.type==='need'||t.type==='want')).reduce((s,t)=>s+t.amount,0);
  const streak      = (()=>{ let s=0; for(let i=0;i<30;i++){ const d=new Date(now); d.setDate(d.getDate()-i); if(txs.some(t=>t.date===d.toISOString().split('T')[0])) s++; else break; } return s; })();
  const fireDate    = fireCalc.years<100?new Date(now.getFullYear()+fireCalc.years,now.getMonth()).toLocaleString('default',{month:'short',year:'numeric'}):'Keep saving';
  const filtered    = filterType==='all'?txs:txs.filter(t=>t.type===filterType);
  const gradeRaw    = parseFloat(savRate);
  const grade       = gradeRaw>=60?'A+':gradeRaw>=50?'A':gradeRaw>=40?'B':gradeRaw>=30?'C':'D';
  const gradeColor  = gradeRaw>=50?'var(--green)':gradeRaw>=35?'var(--gold)':'var(--red)';
  const projPoints  = buildProjection(fire.currentSavings,fire.annualSavings,fire.annualExpenses,projYears);

  const navMonth = (dir) => { let m=selectedMonth+dir,y=selectedYear; if(m<0){m=11;y--;}else if(m>11){m=0;y++;} setSelMonth(m);setSelYear(y); };

  const typeConfig = {
    income: { label:'Income', icon:'↑', color:'var(--green)', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.4)' },
    need:   { label:'Need',   icon:'↓', color:'var(--red)',   bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.4)' },
    want:   { label:'Want',   icon:'↓', color:'var(--red)',   bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.4)' },
    saving: { label:'Saving', icon:'→', color:'var(--gold)',  bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.4)' },
  };

  if (loading) return (
    <div className="fl-loading"><div className="fl-logo-load">FL</div><div className="fl-spinner"/></div>
  );

  return (
    <div className="fl-shell">
      {toast    && <div className={`fl-toast ${toast.type}`}>{toast.msg}</div>}
      {milestone&& <div className="fl-milestone" onClick={()=>setMilestone(null)}><span>{milestone}</span><button>×</button></div>}

      {/* ── ONBOARDING ── */}
      {showOnboard && (
        <div className="fl-overlay">
          <div className="fl-onboard">
            <div className="ob-progress">{[0,1,2,3].map(i=><div key={i} className={`ob-dot ${onboardStep>=i?'active':''}`}/>)}</div>

            {onboardStep===0 && <div className="ob-step">
              <div className="ob-icon">🔥</div>
              <h2>Welcome to FIRE Ledger</h2>
              <p>Let's set up your profile in 4 quick steps so your dashboard reflects your real numbers from day one.</p>
              <button className="fl-btn-primary" onClick={()=>setOnboardStep(1)}>Get started →</button>
            </div>}

            {onboardStep===1 && <div className="ob-step">
              <div className="ob-icon">💱</div>
              <h2>Your Currency</h2>
              <p>Choose your primary currency — you can change this anytime.</p>
              <div className="ob-currency-grid">
                {Object.entries(CURRENCIES).map(([code,c])=>(
                  <button key={code} className={`ob-currency-btn ${currency===code?'active':''}`} onClick={()=>setCurrency(code)}>
                    <span>{c.flag}</span><span>{code}</span><span className="ob-curr-name">{c.name}</span>
                  </button>
                ))}
              </div>
              <button className="fl-btn-primary" onClick={()=>setOnboardStep(2)}>Next →</button>
            </div>}

            {onboardStep===2 && <div className="ob-step">
              <div className="ob-icon">💸</div>
              <h2>Annual Expenses</h2>
              <p>How much do you spend per year? This sets your FIRE target.</p>
              <div className="ob-input-wrap"><span className="ob-sym">{sym}</span>
                <input className="fl-input-lg ob-input" type="number" placeholder="e.g. 40000" value={fire.annualExpenses||''} onChange={e=>setFireSettings(p=>({...p,annualExpenses:parseFloat(e.target.value)||0}))}/>
              </div>
              <div className="ob-hint">FIRE number = {fmt(fire.annualExpenses*25)}</div>
              <button className="fl-btn-primary" onClick={()=>setOnboardStep(3)}>Next →</button>
            </div>}

            {onboardStep===3 && <div className="ob-step">
              <div className="ob-icon">📈</div>
              <h2>Your Savings</h2>
              <p>How much do you save per year, and what have you accumulated so far?</p>
              <div className="ob-input-wrap"><span className="ob-sym">{sym}</span>
                <input className="fl-input-lg ob-input" type="number" placeholder="Annual savings (e.g. 20000)" value={fire.annualSavings||''} onChange={e=>setFireSettings(p=>({...p,annualSavings:parseFloat(e.target.value)||0}))}/>
              </div>
              <div className="ob-input-wrap" style={{marginTop:10}}><span className="ob-sym">{sym}</span>
                <input className="fl-input-lg ob-input" type="number" placeholder="Current savings (e.g. 50000)" value={fire.currentSavings||''} onChange={e=>setFireSettings(p=>({...p,currentSavings:parseFloat(e.target.value)||0}))}/>
              </div>
              <div className="ob-hint" style={{marginTop:4}}>
                At 7% returns — FIRE in approximately <strong style={{color:'var(--purple-light)'}}>{calcFIRE(fire.annualExpenses,fire.annualSavings,fire.currentSavings).years===Infinity?'∞':calcFIRE(fire.annualExpenses,fire.annualSavings,fire.currentSavings).years} years</strong>
              </div>
              <button className="fl-btn-primary" style={{marginTop:12}} onClick={async()=>{
                await saveSettings(fire,cats,currency);
                setShowOnboard(false);
                showToast('Your dashboard is ready ✓');
              }}>Launch my dashboard →</button>
            </div>}
          </div>
        </div>
      )}

      {/* ── IMPORT MODAL ── */}
      {importModal && (
        <div className="fl-overlay" onClick={()=>setImportModal(false)}>
          <div className="fl-modal" onClick={e=>e.stopPropagation()}>
            <div className="fl-modal-header"><h2>Import Preview</h2><button className="fl-modal-close" onClick={()=>setImportModal(false)}>×</button></div>
            <div className="fl-modal-body">
              <p style={{color:'var(--t2)',fontSize:13}}>{importPreview.length>0?`${importPreview.length}+ rows detected — review before importing.`:'No rows found. Check your file has date and amount columns.'}</p>
              {importPreview.map((t,i)=>(
                <div key={i} className="fl-tx-card" style={{marginBottom:7}}>
                  <div className="fl-tx-card-badge" style={{background:amtColor(t.type)+'22',color:amtColor(t.type)}}>{TYPE_LABEL[t.type]}</div>
                  <div className="fl-tx-card-body"><span className="fl-tx-card-desc">{t.description}</span><span className="fl-tx-card-meta">{t.date}{t.category&&` · ${t.category}`}</span></div>
                  <span className="fl-tx-card-amount" style={{color:amtColor(t.type)}}>{fmtD(t.amount)}</span>
                </div>
              ))}
              {importPreview.length>0&&<button className="fl-btn-primary" style={{width:'100%',marginTop:4}} onClick={confirmImport}>Import All →</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="fl-sidebar">
        <div className="fl-brand"><span className="fl-brand-icon">🔥</span><span className="fl-brand-name">FIRELedger</span></div>
        <nav className="fl-nav">
          {[{id:'home',icon:'⚡',label:'Dashboard'},{id:'transactions',icon:'📋',label:'Transactions'},{id:'insights',icon:'📊',label:'Insights'},{id:'fire',icon:'🔥',label:'FIRE Calc'},{id:'projections',icon:'📈',label:'Projections'},{id:'export',icon:'↗',label:'Export & Import'},{id:'settings',icon:'⚙️',label:'Settings'}].map(t=>(
            <button key={t.id} className={`fl-nav-item ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              <span className="fl-nav-icon">{t.icon}</span><span>{t.label}</span>
              {tab===t.id&&<div className="fl-nav-indicator"/>}
            </button>
          ))}
        </nav>
        <div className="fl-sidebar-footer">
          <div className="fl-user-chip">
            <div className="fl-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="fl-user-info"><span className="fl-user-email">{user?.email?.split('@')[0]}</span><span className="fl-user-plan">Pro</span></div>
          </div>
          {/* Currency picker */}
          <div className="fl-curr-wrap">
            <button className="fl-curr-btn" onClick={()=>setShowCurrMenu(p=>!p)} title="Change currency">
              {CURRENCIES[currency].flag}
            </button>
            {showCurrMenu&&(
              <div className="fl-curr-menu">
                {Object.entries(CURRENCIES).map(([code,c])=>(
                  <button key={code} className={`fl-curr-opt ${currency===code?'active':''}`} onClick={()=>{setCurrency(code);saveSettings(null,null,code);setShowCurrMenu(false);showToast(`Currency set to ${code} ✓`);}}>
                    {c.flag} {code}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="fl-signout" onClick={signOut} title="Sign out">↗</button>
        </div>
      </aside>

      <main className="fl-main">

        {/* ── DASHBOARD ── */}
        {tab==='home'&&(
          <div className="fl-page">
            <div className="fl-page-top">
              <div>
                <h1 className="fl-title">{now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening'}</h1>
                <p className="fl-subtitle">{todaySpend>0?`${fmtD(todaySpend)} spent today`:'Nothing logged today'}{streak>1&&<span className="fl-streak"> · 🔥 {streak}-day streak</span>}</p>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div className="fl-month-nav">
                  <button onClick={()=>navMonth(-1)}>‹</button>
                  <span>{MONTHS[selectedMonth]} {selectedYear}</span>
                  <button onClick={()=>navMonth(1)} disabled={isCurrent}>›</button>
                </div>
                <button className="fl-add-fab" onClick={()=>{setShowAdd(true);setTimeout(()=>addAmtRef.current?.focus(),100);}}>+ Log</button>
              </div>
            </div>

            <div className="fl-fire-hero">
              <div className="fl-fire-hero-left">
                <div className="fl-fire-label">Financial Independence · {CURRENCIES[currency].flag} {currency}</div>
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

            <div className="fl-metrics">
              {[
                {label:'Income', value:fmt(income), sub:'This month',                               color:'var(--green)', icon:'↑'},
                {label:'Spent',  value:fmt(needs+wants), sub:`${income>0?(((needs+wants)/income)*100).toFixed(0):0}% of income`, color:'var(--red)', icon:'↓'},
                {label:'Saved',  value:fmt(savings), sub:`${savRate}% rate`,                        color:'var(--gold)', icon:'→'},
                {label:'Grade',  value:grade, sub:'Savings rate score',                             color:gradeColor,  icon:'★'},
              ].map((m,i)=>(
                <div key={i} className="fl-metric-card" style={{'--accent':m.color}}>
                  <div className="fl-metric-top"><span className="fl-metric-label">{m.label}</span><span style={{color:m.color,fontWeight:700}}>{m.icon}</span></div>
                  <div className="fl-metric-value" style={{color:m.color}}>{m.value}</div>
                  <div className="fl-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            <div className="fl-section-header">
              <h2 className="fl-section-title">Recent Transactions</h2>
              <button className="fl-link-btn" onClick={()=>setTab('transactions')}>View all →</button>
            </div>
            <div className="fl-tx-list">
              {txs.slice(0,8).map(t=>(
                <div key={t.id} className="fl-tx-row">
                  <div className="fl-tx-type-dot" style={{background:amtColor(t.type)}}/>
                  <div className="fl-tx-body"><span className="fl-tx-desc">{t.description}</span><span className="fl-tx-meta">{t.category||TYPE_LABEL[t.type]} · {t.date}</span></div>
                  <span className="fl-tx-amount" style={{color:amtColor(t.type)}}>{t.type==='income'||t.type==='saving'?'+':'-'}{fmtD(t.amount)}</span>
                </div>
              ))}
              {txs.length===0&&<div className="fl-empty"><div className="fl-empty-icon">📝</div><p>No transactions yet</p><button className="fl-btn-primary" onClick={()=>setShowAdd(true)}>Log your first</button></div>}
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab==='transactions'&&(
          <div className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Transactions</h1><p className="fl-subtitle">{txs.length} entries · {CURRENCIES[currency].flag} {currency}</p></div>
              <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
                <button className="fl-btn-ghost" onClick={()=>fileInputRef.current?.click()}>↑ Import</button>
                <button className="fl-btn-ghost" onClick={exportCSV}>↓ CSV</button>
                <button className="fl-add-fab" onClick={()=>setShowAdd(true)}>+ Add</button>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{display:'none'}} onChange={handleImportFile}/>
              </div>
            </div>
            <div className="fl-filter-row">
              {['all','income','need','want','saving'].map(f=>(
                <button key={f} className={`fl-chip ${filterType===f?'active':''}`}
                  style={filterType===f&&f!=='all'?{borderColor:TYPE_COLOR[f]||'var(--purple-light)',color:TYPE_COLOR[f]||'var(--purple-light)',background:(TYPE_COLOR[f]||'#a78bfa')+'22'}:{}}
                  onClick={()=>setFilterType(f)}>{f==='all'?'All':TYPE_LABEL[f]}</button>
              ))}
            </div>
            <div className="fl-tx-cards">
              {filtered.map(t=>(
                <div key={t.id} className="fl-tx-card">
                  <div className="fl-tx-card-badge" style={{background:amtColor(t.type)+'22',color:amtColor(t.type)}}>{TYPE_LABEL[t.type]}</div>
                  <div className="fl-tx-card-body"><span className="fl-tx-card-desc">{t.description}</span><span className="fl-tx-card-meta">{t.category&&`${t.category} · `}{t.date}{t.recurring?' · 🔄':''}</span></div>
                  <span className="fl-tx-card-amount" style={{color:amtColor(t.type)}}>{t.type==='income'||t.type==='saving'?'+':'-'}{fmtD(t.amount)}</span>
                  <button className="fl-tx-del" onClick={()=>deleteTx(t.id)}>×</button>
                </div>
              ))}
              {filtered.length===0&&<div className="fl-empty"><div className="fl-empty-icon">🔍</div><p>No transactions found</p></div>}
            </div>
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {tab==='insights'&&(
          <div className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Insights</h1><p className="fl-subtitle">Patterns & performance</p></div>
              <div className="fl-month-nav"><button onClick={()=>navMonth(-1)}>‹</button><span>{MONTHS[selectedMonth]} {selectedYear}</span><button onClick={()=>navMonth(1)} disabled={isCurrent}>›</button></div>
            </div>
            <div className="fl-insights-grid">
              <div className="fl-insight-card fl-insight-wide">
                <h3>Monthly Overview</h3>
                <div className="fl-overview-bars">
                  {[{label:'Income',val:income,color:'var(--green)'},{label:'Needs',val:needs,color:'var(--red)'},{label:'Wants',val:wants,color:'var(--red)'},{label:'Savings',val:savings,color:'var(--gold)'}].map(b=>(
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
                  {[{g:'A+',min:60,max:999},{g:'A',min:50,max:60},{g:'B',min:40,max:50},{g:'C',min:30,max:40},{g:'D',min:0,max:30}].map(t=>(
                    <div key={t.g} className={`fl-grade-tier ${gradeRaw>=t.min&&gradeRaw<t.max?'active':''}`}><span>{t.g}</span><span>{t.min}%+</span></div>
                  ))}
                </div>
              </div>
              <div className="fl-insight-card">
                <h3>50/30/20 Check</h3>
                <div className="fl-rule-list">
                  {[{label:'Needs',actual:income>0?(needs/income)*100:0,target:50,color:'var(--red)'},{label:'Wants',actual:income>0?(wants/income)*100:0,target:30,color:'var(--red)'},{label:'Savings',actual:income>0?(savings/income)*100:0,target:20,color:'var(--gold)'}].map(r=>(
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
                {Object.entries(monthTxs.filter(t=>t.type==='need'||t.type==='want').reduce((a,t)=>{a[t.category||t.type]=(a[t.category||t.type]||0)+t.amount;return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cat,amt])=>(
                  <div key={cat} className="fl-top-exp"><span>{cat}</span><div className="fl-top-exp-bar" style={{width:`${income>0?(amt/income)*100:0}%`}}/><span style={{color:'var(--red)',fontWeight:600}}>{fmt(amt)}</span></div>
                ))}
                {monthTxs.filter(t=>t.type==='need'||t.type==='want').length===0&&<p className="fl-empty-sm">No expenses this month</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── FIRE CALC ── */}
        {tab==='fire'&&(
          <div className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">FIRE Calculator</h1><p className="fl-subtitle">Financial Independence, Retire Early · {CURRENCIES[currency].flag} {currency}</p></div></div>
            <div className="fl-fire-layout">
              <div className="fl-fire-inputs">
                <h3>Your Numbers</h3>
                {[{key:'annualExpenses',label:'Annual Expenses',hint:'Expected yearly spend in retirement'},{key:'annualSavings',label:'Annual Savings',hint:'What you invest per year'},{key:'currentSavings',label:'Current Savings',hint:'Total already invested'}].map(f=>(
                  <div key={f.key} className="fl-fire-field">
                    <label>{f.label}</label>
                    <div className="fl-fire-input-wrap"><span className="fl-input-prefix">{sym}</span><input className="fl-fire-input" type="number" value={fire[f.key]} onChange={e=>setFireSettings(p=>({...p,[f.key]:parseFloat(e.target.value)||0}))}/></div>
                    <span className="fl-fire-hint">{f.hint}</span>
                  </div>
                ))}
                <button className="fl-btn-primary" style={{width:'100%'}} onClick={()=>{saveSettings(fire,null,null);showToast('Saved ✓');}}>Save Settings</button>
                <div className="fl-whatif">
                  <h4>What if I saved more?</h4>
                  <div className="fl-whatif-row"><span style={{whiteSpace:'nowrap',minWidth:90}}>{sym}{whatIf.toLocaleString()}/mo</span><input type="range" min="0" max="2000" step="50" value={whatIf} onChange={e=>setWhatIf(parseInt(e.target.value))} className="fl-slider"/></div>
                  {whatIf>0&&<div className="fl-whatif-result">Saves <strong style={{color:'var(--green)'}}>{Math.max(0,fireCalc.years-fireWhatIf.years)} years</strong> — retire in <strong style={{color:'var(--gold)'}}>{fireWhatIf.years} yrs</strong></div>}
                </div>
              </div>
              <div className="fl-fire-results">
                <div className="fl-fire-big-ring">
                  <svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="95" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="18"/><circle cx="110" cy="110" r="95" fill="none" stroke="url(#fg2)" strokeWidth="18" strokeDasharray="597" strokeDashoffset={597-(597*fireCalc.progress/100)} strokeLinecap="round" transform="rotate(-90 110 110)"/><defs><linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--purple-light)"/><stop offset="100%" stopColor="var(--purple-dark)"/></linearGradient></defs></svg>
                  <div className="fl-fire-big-center"><span className="fl-fire-big-pct">{fireCalc.progress.toFixed(1)}%</span><span className="fl-fire-big-sub">to FIRE</span></div>
                </div>
                <div className="fl-fire-stat-grid">
                  {[{label:'FIRE Number',value:fmt(fireCalc.fireNum),hint:'25× annual expenses',color:'var(--gold)'},{label:'Years Away',value:fireCalc.years===Infinity?'∞':fireCalc.years,hint:'At 7% return',color:fireCalc.years<=10?'var(--green)':fireCalc.years<=20?'var(--gold)':'var(--red)'},{label:'Freedom Date',value:fireDate,hint:'Projected',color:'var(--purple-light)'},{label:'Gap Remaining',value:fmt(Math.max(0,fireCalc.fireNum-fire.currentSavings)),hint:'Still needed',color:'var(--blue)'}].map((s,i)=>(
                    <div key={i} className="fl-fire-stat"><span className="fl-fire-stat-label">{s.label}</span><span className="fl-fire-stat-value" style={{color:s.color,fontSize:s.label==='Freedom Date'?16:22}}>{s.value}</span><span className="fl-fire-stat-hint">{s.hint}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROJECTIONS + MONTE CARLO ── */}
        {tab==='projections'&&(
          <div className="fl-page">
            <div className="fl-page-top">
              <div><h1 className="fl-title">Projections</h1><p className="fl-subtitle">Where your wealth is headed</p></div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <select className="fl-field-input" style={{width:'auto',padding:'8px 12px',fontSize:13}} value={projYears} onChange={e=>{setProjYears(parseInt(e.target.value));setMcResult(null);}}>
                  {[10,15,20,25,30,35,40].map(y=><option key={y} value={y}>{y} years</option>)}
                </select>
              </div>
            </div>

            {/* Projection chart card */}
            <div className="fl-proj-card">
              <div className="fl-proj-card-header">
                <div>
                  <h3>Wealth Trajectory</h3>
                  <p>Deterministic projection at 7% annual return{mcResult?' with Monte Carlo bands':''}</p>
                </div>
                <div className="fl-proj-legend">
                  <span className="fl-legend-item" style={{color:'var(--purple-light)'}}>── Projected</span>
                  {mcResult&&<><span className="fl-legend-item" style={{color:'var(--purple-light)',opacity:0.5}}>- - P90</span><span className="fl-legend-item" style={{color:'var(--red)',opacity:0.5}}>- - P10</span></>}
                  <span className="fl-legend-item" style={{color:'var(--gold)'}}>── FIRE target</span>
                  {projPoints.some(p=>p.value>=fireCalc.fireNum)&&<span className="fl-legend-item" style={{color:'var(--green)'}}>● Crossover</span>}
                </div>
              </div>
              <ProjectionChart points={projPoints} fireNum={fireCalc.fireNum} sym={sym} mcResult={mcResult}/>
              <div className="fl-proj-milestones">
                {[0.25,0.5,0.75,1.0].map(pct=>{
                  const target = fireCalc.fireNum * pct;
                  const yr = projPoints.findIndex(p=>p.value>=target);
                  return yr>0?(
                    <div key={pct} className="fl-proj-milestone">
                      <span className="fl-proj-ms-label">{Math.round(pct*100)}%</span>
                      <span className="fl-proj-ms-val">{fmt(target)}</span>
                      <span className="fl-proj-ms-yr">Year {yr}</span>
                    </div>
                  ):null;
                })}
              </div>
            </div>

            {/* Key projection stats */}
            <div className="fl-proj-stats">
              {[
                {label:'Value at Year 10', value:fmt(projPoints[Math.min(10,projPoints.length-1)]?.value||0), color:'var(--t1)'},
                {label:'Value at Year 20', value:fmt(projPoints[Math.min(20,projPoints.length-1)]?.value||0), color:'var(--t1)'},
                {label:`Value at Year ${projYears}`, value:fmt(projPoints[projPoints.length-1]?.value||0), color:'var(--purple-light)'},
                {label:'FIRE Target', value:fmt(fireCalc.fireNum), color:'var(--gold)'},
              ].map((s,i)=>(
                <div key={i} className="fl-proj-stat-box">
                  <span className="fl-proj-stat-label">{s.label}</span>
                  <span className="fl-proj-stat-val" style={{color:s.color}}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Monte Carlo */}
            <div className="fl-mc-card">
              <div className="fl-mc-header">
                <div>
                  <h3>Monte Carlo Simulation</h3>
                  <p>500 simulations with randomised annual returns (mean 7%, std dev 12%) to model real-world market volatility.</p>
                </div>
                <button className="fl-btn-primary" onClick={runMC} disabled={mcRunning}>
                  {mcRunning?'Running…':'Run Simulation'}
                </button>
              </div>

              {mcResult&&(
                <>
                  <div className="fl-mc-result">
                    <div className="fl-mc-success">
                      <div className="fl-mc-pct" style={{color:mcResult.successRate>=80?'var(--green)':mcResult.successRate>=60?'var(--gold)':'var(--red)'}}>
                        {mcResult.successRate}%
                      </div>
                      <div className="fl-mc-success-label">Success rate</div>
                      <div className="fl-mc-success-sub">of 500 simulations reached FIRE in {projYears} years</div>
                    </div>
                    <div className="fl-mc-bands">
                      {[{label:'Optimistic (P90)',val:mcResult.percentiles.p90[projYears],color:'var(--green)'},{label:'Median (P50)',val:mcResult.percentiles.p50[projYears],color:'var(--purple-light)'},{label:'Pessimistic (P10)',val:mcResult.percentiles.p10[projYears],color:'var(--red)'}].map(b=>(
                        <div key={b.label} className="fl-mc-band-row">
                          <span style={{color:b.color,fontWeight:600,fontSize:12}}>{b.label}</span>
                          <span style={{fontWeight:700,fontFamily:'JetBrains Mono,monospace',fontSize:15,color:b.color}}>{fmt(b.val||0)}</span>
                          <span style={{fontSize:11,color:'var(--t3)'}}>{b.val>=mcResult.fireNum?'✓ FIRE reached':'below FIRE'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="fl-mc-bar-wrap">
                    <div className="fl-mc-bar" style={{width:`${mcResult.successRate}%`, background:mcResult.successRate>=80?'var(--green)':mcResult.successRate>=60?'var(--gold)':'var(--red)'}}/>
                  </div>
                  <p className="fl-mc-disclaimer">
                    ⚠️ <strong>Disclaimer:</strong> Monte Carlo simulations are for illustrative purposes only and do not constitute financial advice. Past market returns do not guarantee future performance. Actual results may differ significantly due to inflation, tax, fees, sequence-of-returns risk, and life events. Consult a qualified financial adviser before making investment decisions.
                  </p>
                </>
              )}
              {!mcResult&&(
                <div className="fl-mc-empty">
                  <p>Run the simulation to see how your portfolio might perform across 500 different market scenarios — from bear markets to bull runs.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXPORT & IMPORT ── */}
        {tab==='export'&&(
          <div className="fl-page">
            <div className="fl-page-top"><div><h1 className="fl-title">Export & Import</h1><p className="fl-subtitle">Your data, your way</p></div></div>
            <div className="fl-export-grid">
              <div className="fl-export-card"><div className="fl-export-icon">📊</div><h3>Excel Report</h3><p>Full report with FIRE summary and all transactions — open in Excel or Google Sheets.</p><button className="fl-btn-primary" onClick={exportExcel}>Download Report</button></div>
              <div className="fl-export-card"><div className="fl-export-icon">📄</div><h3>CSV Export</h3><p>Raw transaction data for any tool — YNAB, Mint, your own spreadsheet.</p><button className="fl-btn-primary" onClick={exportCSV}>Download CSV</button></div>
              <div className="fl-export-card">
                <div className="fl-export-icon">🧠</div><h3>Smart Import</h3>
                <p>Import from <strong>any</strong> CSV — bank statements, Excel exports, other apps. Auto-detects columns and date formats.</p>
                <button className="fl-btn-primary" onClick={()=>fileInputRef.current?.click()}>Import File</button>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{display:'none'}} onChange={handleImportFile}/>
              </div>
              <div className="fl-export-card">
                <div className="fl-export-icon">📎</div><h3>Template</h3>
                <p>Download our starter CSV template with sample data.</p>
                <div className="fl-format-table">
                  {['Date','Description','Type (income/need/want/saving)','Category','Amount','Recurring (Yes/No)'].map((c,i)=><div key={i} className="fl-format-row"><span className="fl-format-num">{i+1}</span><span>{c}</span></div>)}
                </div>
                <button className="fl-btn-ghost" style={{marginTop:8}} onClick={()=>{
                  const s=`Date,Description,Type,Category,Amount,Recurring\n2026-03-01,Salary,income,,5000,No\n2026-03-02,Rent,need,Rent,1400,Yes\n2026-03-05,Groceries,need,Groceries,180,No`;
                  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'})); a.download='fire-ledger-template.csv'; a.click();
                  showToast('Template downloaded ✓');
                }}>Download Template</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==='settings'&&(
          <div className="fl-page">
            <div className="fl-page-top"><h1 className="fl-title">Settings</h1></div>
            <div className="fl-settings-grid">
              <div className="fl-settings-card">
                <h3>Custom Categories</h3>
                {['needs','wants','savings'].map(type=>(
                  <div key={type} className="fl-cat-group">
                    <h4 style={{color:type==='needs'?'var(--red)':type==='wants'?'var(--red)':'var(--gold)'}}>{type.charAt(0).toUpperCase()+type.slice(1)}</h4>
                    <div className="fl-cat-tags">
                      {cats[type].map(cat=><span key={cat} className="fl-cat-tag">{cat}<button onClick={()=>{const u={...cats,[type]:cats[type].filter(c=>c!==cat)};setCats(u);saveSettings(null,u,null);}}>×</button></span>)}
                      <input className="fl-cat-add-input" placeholder="+ Add" onKeyDown={e=>{if(e.key==='Enter'&&e.target.value.trim()){const u={...cats,[type]:[...cats[type],e.target.value.trim()]};setCats(u);saveSettings(null,u,null);e.target.value='';showToast('Category added ✓');}}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="fl-settings-card">
                <h3>Currency</h3>
                <div className="fl-curr-settings-grid">
                  {Object.entries(CURRENCIES).map(([code,c])=>(
                    <button key={code} className={`fl-curr-settings-btn ${currency===code?'active':''}`} onClick={()=>{setCurrency(code);saveSettings(null,null,code);showToast(`Currency set to ${code} ✓`);}}>
                      <span style={{fontSize:20}}>{c.flag}</span>
                      <span style={{fontWeight:700}}>{code}</span>
                      <span style={{fontSize:11,color:'var(--t2)'}}>{c.name}</span>
                    </button>
                  ))}
                </div>
                <h3 style={{marginTop:24}}>Account</h3>
                <div className="fl-account-row" style={{marginTop:12}}>
                  <div className="fl-account-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                  <div><div style={{fontWeight:600,fontSize:14}}>{user?.email}</div><div style={{fontSize:12,color:'var(--t2)',marginTop:2}}>Pro · Active</div></div>
                </div>
                <button className="fl-btn-ghost" style={{width:'100%',marginTop:16}} onClick={exportExcel}>↓ Download Report</button>
                <button className="fl-btn-danger" style={{width:'100%',marginTop:10}} onClick={signOut}>Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── ADD MODAL ── */}
      {showAdd&&(
        <div className="fl-overlay" onClick={()=>setShowAdd(false)}>
          <div className="fl-modal fl-modal-log" onClick={e=>e.stopPropagation()}>
            <div className="fl-modal-header"><h2>Log Transaction</h2><button className="fl-modal-close" onClick={()=>setShowAdd(false)}>×</button></div>
            <div className="fl-modal-body">
              <div className="fl-type-grid">
                {['income','need','want','saving'].map(t=>{
                  const cfg=typeConfig[t],active=form.type===t;
                  return <button key={t} className={`fl-type-pill ${active?'active':''}`} style={active?{background:cfg.bg,borderColor:cfg.border,color:cfg.color}:{}} onClick={()=>setForm(p=>({...p,type:t}))}><span className="fl-type-pill-icon">{cfg.icon}</span><span>{cfg.label}</span></button>;
                })}
              </div>
              <div className="fl-amount-section">
                <div className="fl-amount-input-wrap" style={{borderColor:typeConfig[form.type].border}}>
                  <span className="fl-amount-prefix" style={{color:typeConfig[form.type].color}}>{sym}</span>
                  <input ref={addAmtRef} className="fl-amount-input" style={{color:typeConfig[form.type].color}} type="text" inputMode="decimal" placeholder="0.00" value={rawAmountInput} onChange={e=>{const raw=e.target.value.replace(/[^0-9.]/g,'');setRawAmt(fmtInput(raw));setForm(p=>({...p,amount:raw}));}} onKeyDown={e=>{if(e.key==='Enter')addTx();}}/>
                </div>
                <div className="fl-quick-amounts">{QUICK_AMTS.map(a=><button key={a} className="fl-quick-amt" style={{borderColor:form.amount===a.toString()?typeConfig[form.type].border:''}} onClick={()=>{setRawAmt(fmtInput(a.toString()));setForm(p=>({...p,amount:a.toString()}));}}>{sym}{a}</button>)}</div>
              </div>
              <div className="fl-field-group"><label className="fl-field-label">Description</label><input className="fl-field-input" placeholder="e.g. Monthly rent, Salary, Netflix…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')addTx();}}/></div>
              <div className="fl-field-row">
                <div className="fl-field-group" style={{flex:1}}><label className="fl-field-label">Category</label><select className="fl-field-input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}><option value="">Optional</option>{(cats[form.type==='need'?'needs':form.type==='want'?'wants':form.type==='saving'?'savings':null]||[]).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="fl-field-group" style={{flex:1}}><label className="fl-field-label">Date</label><input className="fl-field-input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
              </div>
              <div className="fl-modal-footer">
                <label className="fl-recurring-label"><input type="checkbox" checked={form.recurring} onChange={e=>setForm(p=>({...p,recurring:e.target.checked}))}/>Recurring</label>
                <div className="fl-modal-actions"><span className="fl-kbd-hint">↵ Enter · Esc cancel</span><button className="fl-btn-primary" onClick={addTx}>Log {TYPE_LABEL[form.type]}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
