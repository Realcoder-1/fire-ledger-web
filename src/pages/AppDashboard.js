import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './App.css';

const DEFAULT_CATEGORIES = {
  needs: ['Rent/Mortgage','Groceries','Utilities','Transport','Insurance','Healthcare'],
  wants: ['Dining Out','Entertainment','Shopping','Subscriptions','Travel','Hobbies'],
  savings: ['Investment','Emergency Fund','Retirement','Savings Account']
};

const TABS = ['Home','Transactions','Insights','FIRE','Settings'];

function calcFIRE(annualExpenses, annualSavings, currentSavings) {
  const fireNumber = annualExpenses * 25;
  if (annualSavings <= 0) return { fireNumber, years: Infinity, progress: 0 };
  const r = 0.07;
  let years = 0, balance = currentSavings;
  while (balance < fireNumber && years < 100) {
    balance = balance * (1 + r) + annualSavings;
    years++;
  }
  const progress = Math.min((currentSavings / fireNumber) * 100, 100);
  return { fireNumber, years, progress };
}

export default function AppDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('Home');
  const [transactions, setTransactions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [fireSettings, setFireSettings] = useState({ annualExpenses: 40000, annualSavings: 20000, currentSavings: 50000 });
  const [customCategories, setCustomCategories] = useState(DEFAULT_CATEGORIES);
  const [newCat, setNewCat] = useState({ type: 'needs', name: '' });
  const [form, setForm] = useState({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [txRes, settingsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('user_settings').select('*').eq('user_id', userId).single()
    ]);
    if (txRes.data) setTransactions(txRes.data);
    if (settingsRes.data) {
      if (settingsRes.data.fire_settings) setFireSettings(settingsRes.data.fire_settings);
      if (settingsRes.data.custom_categories) setCustomCategories(settingsRes.data.custom_categories);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveSettings = async (fs, cc) => {
    await supabase.from('user_settings').upsert({
      user_id: userId,
      fire_settings: fs || fireSettings,
      custom_categories: cc || customCategories,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  };

  const addTransaction = async () => {
    if (!form.amount || !form.description) return;
    const tx = { user_id: userId, amount: parseFloat(form.amount), description: form.description, type: form.type, category: form.category, date: form.date, recurring: form.recurring };
    const { data } = await supabase.from('transactions').insert(tx).select().single();
    if (data) setTransactions(prev => [data, ...prev]);
    setForm({ amount: '', description: '', type: 'need', category: '', date: new Date().toISOString().split('T')[0], recurring: false });
    setShowAdd(false);
  };

  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const exportCSV = () => {
    const rows = [['Date','Description','Type','Category','Amount','Recurring'],...transactions.map(t=>[t.date,t.description,t.type,t.category,t.amount,t.recurring])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fire-ledger.csv'; a.click();
  };

  // Computed
  const now = new Date();
  const thisMonth = transactions.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear());
  const totalIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalNeeds = thisMonth.filter(t => t.type === 'need').reduce((s, t) => s + t.amount, 0);
  const totalWants = thisMonth.filter(t => t.type === 'want').reduce((s, t) => s + t.amount, 0);
  const totalSavings = thisMonth.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;
  const fire = calcFIRE(fireSettings.annualExpenses, fireSettings.annualSavings, fireSettings.currentSavings);
  const filtered = filterType === 'all' ? transactions : transactions.filter(t => t.type === filterType);

  const typeColor = { income: '#34d399', need: '#f87171', want: '#f472b6', saving: '#60a5fa' };
  const typeLabel = { income: 'Income', need: 'Need', want: 'Want', saving: 'Saving' };

  if (loading) return <div className="app-loading"><div className="app-spinner" /><p>Loading your ledger...</p></div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">FIRE<span>Ledger</span></div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t} className={`sidebar-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              <span className="tab-icon">{{'Home':'⚡','Transactions':'📋','Insights':'📊','FIRE':'🔥','Settings':'⚙️'}[t]}</span>
              {t}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.email?.[0]?.toUpperCase()}</div>
          <div className="sidebar-email">{user?.email}</div>
          <button className="sidebar-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="app-main">
        {/* HOME TAB */}
        {tab === 'Home' && (
          <div className="tab-content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'} 👋</h1>
                <p className="page-sub">Here's your financial snapshot for {now.toLocaleString('default',{month:'long'})}</p>
              </div>
              <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add Transaction</button>
            </div>
            <div className="cards-grid">
              <div className="metric-card income">
                <div className="metric-label">Income</div>
                <div className="metric-value">${totalIncome.toLocaleString()}</div>
                <div className="metric-sub">This month</div>
              </div>
              <div className="metric-card needs">
                <div className="metric-label">Needs</div>
                <div className="metric-value">${totalNeeds.toLocaleString()}</div>
                <div className="metric-sub">{totalIncome > 0 ? ((totalNeeds/totalIncome)*100).toFixed(0) : 0}% of income</div>
              </div>
              <div className="metric-card wants">
                <div className="metric-label">Wants</div>
                <div className="metric-value">${totalWants.toLocaleString()}</div>
                <div className="metric-sub">{totalIncome > 0 ? ((totalWants/totalIncome)*100).toFixed(0) : 0}% of income</div>
              </div>
              <div className="metric-card savings">
                <div className="metric-label">Savings Rate</div>
                <div className="metric-value">{savingsRate}%</div>
                <div className="metric-sub">Target: 50%+</div>
              </div>
            </div>
            <div className="home-bottom">
              <div className="fire-preview-card">
                <div className="fire-preview-header">
                  <span>🔥 FIRE Progress</span>
                  <button className="link-btn" onClick={() => setTab('FIRE')}>View details →</button>
                </div>
                <div className="fire-ring-wrap">
                  <svg viewBox="0 0 120 120" className="fire-ring">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#fg)" strokeWidth="10"
                      strokeDasharray="314" strokeDashoffset={314 - (314 * fire.progress / 100)}
                      strokeLinecap="round" transform="rotate(-90 60 60)"/>
                    <defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/>
                    </linearGradient></defs>
                  </svg>
                  <div className="fire-ring-inner">
                    <span className="fire-pct">{fire.progress.toFixed(0)}%</span>
                    <span className="fire-pct-sub">to FIRE</span>
                  </div>
                </div>
                <div className="fire-preview-stats">
                  <div><span className="fps-label">Years away</span><span className="fps-val">{fire.years === Infinity ? '∞' : fire.years}</span></div>
                  <div><span className="fps-label">FIRE number</span><span className="fps-val">${(fire.fireNumber/1000).toFixed(0)}k</span></div>
                  <div><span className="fps-label">Saved</span><span className="fps-val">${(fireSettings.currentSavings/1000).toFixed(0)}k</span></div>
                </div>
              </div>
              <div className="recent-card">
                <div className="recent-header">
                  <span>Recent Transactions</span>
                  <button className="link-btn" onClick={() => setTab('Transactions')}>See all →</button>
                </div>
                {transactions.slice(0,6).map(t => (
                  <div key={t.id} className="tx-row">
                    <div className="tx-dot" style={{background: typeColor[t.type]}} />
                    <div className="tx-info">
                      <span className="tx-desc">{t.description}</span>
                      <span className="tx-cat">{t.category || typeLabel[t.type]}</span>
                    </div>
                    <div className="tx-right">
                      <span className="tx-amt" style={{color: t.type === 'income' || t.type === 'saving' ? typeColor[t.type] : typeColor[t.type]}}>
                        {t.type === 'income' || t.type === 'saving' ? '+' : '-'}${t.amount.toLocaleString()}
                      </span>
                      <span className="tx-date">{t.date}</span>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="empty-state">No transactions yet. Add your first one!</p>}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === 'Transactions' && (
          <div className="tab-content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Transactions</h1>
                <p className="page-sub">{transactions.length} total entries</p>
              </div>
              <div className="header-actions">
                <button className="ghost-btn" onClick={exportCSV}>↓ Export CSV</button>
                <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add</button>
              </div>
            </div>
            <div className="filter-row">
              {['all','income','need','want','saving'].map(f => (
                <button key={f} className={`filter-chip ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)}>
                  {f === 'all' ? 'All' : typeLabel[f]}
                </button>
              ))}
            </div>
            <div className="tx-list">
              {filtered.map(t => (
                <div key={t.id} className="tx-card">
                  <div className="tx-type-badge" style={{background: typeColor[t.type] + '22', color: typeColor[t.type]}}>{typeLabel[t.type]}</div>
                  <div className="tx-card-info">
                    <span className="tx-card-desc">{t.description}</span>
                    <span className="tx-card-meta">{t.category} · {t.date} {t.recurring && '· 🔄 Recurring'}</span>
                  </div>
                  <span className="tx-card-amt" style={{color: typeColor[t.type]}}>
                    {t.type === 'income' || t.type === 'saving' ? '+' : '-'}${t.amount.toLocaleString()}
                  </span>
                  <button className="tx-delete" onClick={() => deleteTransaction(t.id)}>×</button>
                </div>
              ))}
              {filtered.length === 0 && <p className="empty-state">No transactions found.</p>}
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {tab === 'Insights' && (
          <div className="tab-content">
            <div className="page-header">
              <div>
                <h1 className="page-title">Insights</h1>
                <p className="page-sub">Your money patterns, simplified</p>
              </div>
            </div>
            <div className="insights-grid">
              <div className="insight-card">
                <h3>Monthly Breakdown</h3>
                <div className="breakdown-bars">
                  {[
                    { label: 'Income', val: totalIncome, color: '#34d399' },
                    { label: 'Needs', val: totalNeeds, color: '#f87171' },
                    { label: 'Wants', val: totalWants, color: '#f472b6' },
                    { label: 'Savings', val: totalSavings, color: '#60a5fa' },
                  ].map(b => (
                    <div key={b.label} className="bar-row">
                      <span className="bar-label">{b.label}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width: `${totalIncome > 0 ? Math.min((b.val/totalIncome)*100,100) : 0}%`, background: b.color}} />
                      </div>
                      <span className="bar-val">${b.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="insight-card">
                <h3>Savings Rate</h3>
                <div className="big-metric">
                  <span className="big-num" style={{color: parseFloat(savingsRate) >= 50 ? '#34d399' : parseFloat(savingsRate) >= 30 ? '#fbbf24' : '#f87171'}}>{savingsRate}%</span>
                  <span className="big-label">{parseFloat(savingsRate) >= 50 ? '🔥 Excellent!' : parseFloat(savingsRate) >= 30 ? '👍 Good' : '📈 Keep pushing'}</span>
                </div>
                <div className="savings-tiers">
                  <div className={`tier ${parseFloat(savingsRate) >= 20 ? 'reached' : ''}`}>20% — Basic FIRE path</div>
                  <div className={`tier ${parseFloat(savingsRate) >= 40 ? 'reached' : ''}`}>40% — Accelerated FIRE</div>
                  <div className={`tier ${parseFloat(savingsRate) >= 60 ? 'reached' : ''}`}>60% — Extreme FIRE</div>
                </div>
              </div>
              <div className="insight-card">
                <h3>50/30/20 Rule</h3>
                <div className="rule-check">
                  {[
                    { label: 'Needs (50%)', actual: totalIncome > 0 ? (totalNeeds/totalIncome)*100 : 0, target: 50, color: '#f87171' },
                    { label: 'Wants (30%)', actual: totalIncome > 0 ? (totalWants/totalIncome)*100 : 0, target: 30, color: '#f472b6' },
                    { label: 'Savings (20%)', actual: totalIncome > 0 ? (totalSavings/totalIncome)*100 : 0, target: 20, color: '#60a5fa' },
                  ].map(r => (
                    <div key={r.label} className="rule-row">
                      <span className="rule-label">{r.label}</span>
                      <span className="rule-actual" style={{color: r.actual <= r.target ? '#34d399' : '#f87171'}}>{r.actual.toFixed(0)}%</span>
                      <span className={`rule-status`}>{r.actual <= r.target ? '✓' : '↑'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="insight-card">
                <h3>Top Expenses</h3>
                {Object.entries(
                  thisMonth.filter(t => t.type === 'need' || t.type === 'want')
                    .reduce((acc, t) => { acc[t.category || t.type] = (acc[t.category || t.type] || 0) + t.amount; return acc; }, {})
                ).sort((a,b) => b[1]-a[1]).slice(0,5).map(([cat,amt]) => (
                  <div key={cat} className="top-exp-row">
                    <span>{cat}</span>
                    <span style={{color:'#f87171'}}>${amt.toLocaleString()}</span>
                  </div>
                ))}
                {thisMonth.filter(t => t.type === 'need' || t.type === 'want').length === 0 && <p className="empty-state">No expenses this month.</p>}
              </div>
            </div>
          </div>
        )}

        {/* FIRE TAB */}
        {tab === 'FIRE' && (
          <div className="tab-content">
            <div className="page-header">
              <div>
                <h1 className="page-title">🔥 FIRE Calculator</h1>
                <p className="page-sub">Financial Independence, Retire Early</p>
              </div>
            </div>
            <div className="fire-layout">
              <div className="fire-settings-card">
                <h3>Your FIRE Numbers</h3>
                {[
                  { key: 'annualExpenses', label: 'Annual Expenses ($)', hint: 'What you spend per year in retirement' },
                  { key: 'annualSavings', label: 'Annual Savings ($)', hint: 'How much you save/invest per year' },
                  { key: 'currentSavings', label: 'Current Savings ($)', hint: 'Your total invested/saved amount today' },
                ].map(f => (
                  <div key={f.key} className="fire-field">
                    <label>{f.label}</label>
                    <input
                      type="number"
                      value={fireSettings[f.key]}
                      onChange={e => setFireSettings(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                      className="fire-input"
                    />
                    <span className="fire-hint">{f.hint}</span>
                  </div>
                ))}
                <button className="add-btn" style={{width:'100%',marginTop:8}} onClick={() => saveSettings(fireSettings, null)}>Save Settings</button>
              </div>
              <div className="fire-result-card">
                <div className="fire-big-ring">
                  <svg viewBox="0 0 200 200" style={{width:200,height:200}}>
                    <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16"/>
                    <circle cx="100" cy="100" r="85" fill="none" stroke="url(#fg2)" strokeWidth="16"
                      strokeDasharray="534" strokeDashoffset={534 - (534 * fire.progress / 100)}
                      strokeLinecap="round" transform="rotate(-90 100 100)"/>
                    <defs><linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/>
                    </linearGradient></defs>
                  </svg>
                  <div className="fire-big-inner">
                    <span className="fire-big-pct">{fire.progress.toFixed(1)}%</span>
                    <span className="fire-big-sub">to FIRE</span>
                  </div>
                </div>
                <div className="fire-result-stats">
                  <div className="fire-stat-box">
                    <span className="fsb-label">FIRE Number</span>
                    <span className="fsb-val">${fire.fireNumber.toLocaleString()}</span>
                    <span className="fsb-hint">25× annual expenses</span>
                  </div>
                  <div className="fire-stat-box">
                    <span className="fsb-label">Years to FIRE</span>
                    <span className="fsb-val" style={{color: fire.years <= 10 ? '#34d399' : fire.years <= 20 ? '#fbbf24' : '#f87171'}}>
                      {fire.years === Infinity ? '∞' : fire.years}
                    </span>
                    <span className="fsb-hint">At 7% annual return</span>
                  </div>
                  <div className="fire-stat-box">
                    <span className="fsb-label">FIRE Date</span>
                    <span className="fsb-val" style={{fontSize:22}}>
                      {fire.years === Infinity ? 'N/A' : new Date(now.getFullYear() + fire.years, now.getMonth()).toLocaleString('default',{month:'short',year:'numeric'})}
                    </span>
                    <span className="fsb-hint">Projected freedom date</span>
                  </div>
                  <div className="fire-stat-box">
                    <span className="fsb-label">Gap Remaining</span>
                    <span className="fsb-val">${Math.max(0, fire.fireNumber - fireSettings.currentSavings).toLocaleString()}</span>
                    <span className="fsb-hint">Still needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'Settings' && (
          <div className="tab-content">
            <div className="page-header">
              <h1 className="page-title">Settings</h1>
            </div>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>Custom Categories</h3>
                <div className="cat-section">
                  {['needs','wants','savings'].map(type => (
                    <div key={type} className="cat-group">
                      <h4 style={{color: type==='needs'?'#f87171':type==='wants'?'#f472b6':'#60a5fa', textTransform:'capitalize', marginBottom:8}}>{type}</h4>
                      <div className="cat-tags">
                        {customCategories[type].map(cat => (
                          <span key={cat} className="cat-tag">
                            {cat}
                            <button onClick={() => {
                              const updated = { ...customCategories, [type]: customCategories[type].filter(c => c !== cat) };
                              setCustomCategories(updated);
                              saveSettings(null, updated);
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="add-cat-row">
                  <select className="fire-input" value={newCat.type} onChange={e => setNewCat(p => ({...p, type: e.target.value}))}>
                    <option value="needs">Needs</option>
                    <option value="wants">Wants</option>
                    <option value="savings">Savings</option>
                  </select>
                  <input className="fire-input" placeholder="Category name" value={newCat.name} onChange={e => setNewCat(p => ({...p, name: e.target.value}))} />
                  <button className="add-btn" onClick={() => {
                    if (!newCat.name.trim()) return;
                    const updated = { ...customCategories, [newCat.type]: [...customCategories[newCat.type], newCat.name.trim()] };
                    setCustomCategories(updated);
                    saveSettings(null, updated);
                    setNewCat(p => ({...p, name: ''}));
                  }}>Add</button>
                </div>
              </div>
              <div className="settings-card">
                <h3>Account</h3>
                <div className="account-info">
                  <div className="account-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{fontWeight:600}}>{user?.email}</div>
                    <div style={{fontSize:12,color:'var(--text2)',marginTop:4}}>Free Plan</div>
                  </div>
                </div>
                <button className="ghost-btn" style={{marginTop:20,width:'100%'}} onClick={exportCSV}>Export All Data (CSV)</button>
                <button className="danger-btn" style={{marginTop:12,width:'100%'}} onClick={signOut}>Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD TRANSACTION MODAL */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Type</label>
                <div className="type-tabs">
                  {['income','need','want','saving'].map(t => (
                    <button key={t} className={`type-tab ${form.type === t ? 'active' : ''}`}
                      style={form.type === t ? {background: typeColor[t] + '33', borderColor: typeColor[t], color: typeColor[t]} : {}}
                      onClick={() => setForm(p => ({...p, type: t}))}>
                      {typeLabel[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>Amount ($)</label>
                <input className="fire-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} />
              </div>
              <div className="form-row">
                <label>Description</label>
                <input className="fire-input" placeholder="What was this for?" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              </div>
              <div className="form-row">
                <label>Category</label>
                <select className="fire-input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  <option value="">Select category</option>
                  {(customCategories[form.type === 'need' ? 'needs' : form.type === 'want' ? 'wants' : form.type === 'saving' ? 'savings' : null] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Date</label>
                <input className="fire-input" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
              </div>
              <div className="form-row form-row-inline">
                <label>Recurring?</label>
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({...p, recurring: e.target.checked}))} />
              </div>
              <button className="add-btn" style={{width:'100%',marginTop:8}} onClick={addTransaction}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
