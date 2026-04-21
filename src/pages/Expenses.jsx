import { expenseAPI } from '../services/api';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const now = new Date();
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PALETTE = ['#00D4AA','#FF6B6B','#FFD93D','#4ECDC4','#C084FC','#F97316','#22C55E','#3B82F6'];
const CAT_ICONS = { Food:'🍽️', Electricity:'⚡', Water:'💧', Internet:'📶', Grocery:'🛒', Medicine:'💊', Transport:'🚗', Maintenance:'🔧', Entertainment:'🎬', Others:'💰' };

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddExpenseModal({ categories, onClose, onDone }) {
  const [f, setF] = useState({ categoryId:'', title:'', amount:'', expenseDate:now.toISOString().slice(0,10), notes:'', paymentMode:'UPI' });
  const [busy, setBusy] = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      await expenseAPI.add({...f, categoryId:+f.categoryId, amount:+f.amount});
      toast.success('Expense added!'); onDone();
    } catch { toast.error('Failed to add expense'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="➕ Add Expense" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Category</label>
            <select className="inp" value={f.categoryId} onChange={e=>s('categoryId',e.target.value)} required>
              <option value="">Select category...</option>
              {categories.map(c=><option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="label">Amount (₹)</label>
            <input className="inp" type="number" step="0.01" placeholder="0.00" value={f.amount} onChange={e=>s('amount',e.target.value)} required />
          </div>
        </div>
        <div className="fg">
          <label className="label">Title / Description</label>
          <input className="inp" placeholder="e.g. Monthly grocery shopping" value={f.title} onChange={e=>s('title',e.target.value)} required />
        </div>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Date</label>
            <input className="inp" type="date" value={f.expenseDate} onChange={e=>s('expenseDate',e.target.value)} required />
          </div>
          <div className="fg">
            <label className="label">Payment Mode</label>
            <select className="inp" value={f.paymentMode} onChange={e=>s('paymentMode',e.target.value)}>
              {['UPI','Cash','Card','Net Banking','Cheque'].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="fg">
          <label className="label">Notes (optional)</label>
          <input className="inp" placeholder="Any additional notes..." value={f.notes} onChange={e=>s('notes',e.target.value)} />
        </div>
        <div style={{display:'flex',gap:10,marginTop:4}}>
          <button type="button" className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand" style={{flex:2,justifyContent:'center'}} disabled={busy}>{busy?'⏳ Saving...':'💾 Save Expense'}</button>
        </div>
      </form>
    </Modal>
  );
}

function BudgetModal({ categories, month, year, onClose, onDone }) {
  const [items, setItems] = useState(categories.map(c=>({...c, amt:'', pct:80})));
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      const valid = items.filter(b=>+b.amt>0).map(b=>({categoryId:b.categoryId,budgetAmount:+b.amt,alertPercent:+b.pct}));
      if (!valid.length) { toast.error('Enter at least one budget amount'); setBusy(false); return; }
      await expenseAPI.setBudgets(month, year, valid);
      toast.success('Budgets saved!'); onDone();
    } catch { toast.error('Failed to save'); }
    finally { setBusy(false); }
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:'85vh',overflow:'auto'}}>
        <div className="modal-head">
          <h3>📊 Set Monthly Budgets</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <p style={{fontSize:13,color:'var(--text2)',marginBottom:16}}>Set spending limits for each category. Leave blank to skip.</p>
        <form onSubmit={submit}>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {items.map((b,i)=>(
              <div key={b.categoryId} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'var(--bg3)',borderRadius:10}}>
                <span style={{fontSize:18,flexShrink:0}}>{CAT_ICONS[b.categoryName]||'💰'}</span>
                <span style={{fontSize:13,fontWeight:600,flex:1,minWidth:80}}>{b.categoryName}</span>
                <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                  <span style={{fontSize:13,color:'var(--text3)'}}>₹</span>
                  <input className="inp" type="number" step="100" placeholder="Budget" style={{width:120}}
                    value={b.amt} onChange={e=>{const c=[...items];c[i]={...c[i],amt:e.target.value};setItems(c);}} />
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button type="button" className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-brand" style={{flex:2,justifyContent:'center'}} disabled={busy}>{busy?'⏳ Saving...':'💾 Save All Budgets'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [summary,    setSummary]    = useState(null);
  const [expenses,   setExpenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [month,      setMonth]      = useState(now.getMonth()+1);
  const [year,       setYear]       = useState(now.getFullYear());
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([expenseAPI.getSummary(month,year), expenseAPI.getAll(month,year)]);
      setSummary(s.data.data);
      setExpenses(e.data.data || []);
      if (!categories.length) setCategories(s.data.data?.categories?.map(c=>({categoryId:c.categoryId,categoryName:c.categoryName})) || []);
    } catch {}
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const del = async id => {
    if (!window.confirm('Delete this expense?')) return;
    try { await expenseAPI.remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const modeIcon = { UPI:'📱', Cash:'💵', Card:'💳', 'Net Banking':'🏦', Cheque:'📄' };

  return (
    <div className="page fade-in">

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:24}}>
        <div>
          <h1 className="page-title">💰 Expenses</h1>
          <p className="page-sub">Track household spending and manage budgets</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={()=>setShowBudget(true)}>📊 Set Budgets</button>
          <button className="btn btn-brand" onClick={()=>setShowAdd(true)}>➕ Add Expense</button>
        </div>
      </div>

      {/* Month selector */}
      <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        {MONTHS.map((m,i)=>(
          <button key={i} onClick={()=>setMonth(i+1)} className={`tab ${month===i+1?'active':''}`}>{m}</button>
        ))}
        <select value={year} onChange={e=>setYear(+e.target.value)} className="inp" style={{width:90,padding:'7px 10px'}}>
          {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner"/></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="g3 stagger" style={{marginBottom:24}}>
            {[['Budget','₹'+(summary?.totalBudget||0).toLocaleString(),'var(--brand)','rgba(0,212,170,0.1)'],
              ['Spent','₹'+(summary?.totalSpent||0).toLocaleString(),'var(--bad)','rgba(239,68,68,0.1)'],
              ['Remaining','₹'+((summary?.totalBudget||0)-(summary?.totalSpent||0)).toLocaleString(),'var(--warn)','rgba(245,158,11,0.1)']
            ].map(([l,v,c,bg])=>(
              <div key={l} className="card" style={{background:bg,borderColor:'transparent'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text3)',marginBottom:6}}>{l}</div>
                <div style={{fontSize:30,fontWeight:900,letterSpacing:'-1px',color:c,fontFamily:'Outfit,sans-serif'}}>{v}</div>
                <div style={{marginTop:10}}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${Math.min(summary?.usedPercent||0,100)}%`,background:c}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="card" style={{marginBottom:24}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Category Breakdown</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
              {(summary?.categories||[]).map((cat,i)=>(
                <div key={cat.categoryId} style={{padding:14,background:'var(--bg3)',borderRadius:12,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${PALETTE[i%8]}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{CAT_ICONS[cat.categoryName]||'💰'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{cat.categoryName}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>₹{cat.totalSpent.toLocaleString()} of ₹{cat.budgetAmount.toLocaleString()}</div>
                    </div>
                    {cat.alertSent && <span className="badge b-bad" style={{fontSize:9}}>⚠</span>}
                    <span style={{fontSize:13,fontWeight:800,color:cat.usedPercent>90?'var(--bad)':cat.usedPercent>70?'var(--warn)':PALETTE[i%8]}}>{cat.usedPercent||0}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${Math.min(cat.usedPercent||0,100)}%`,background:cat.usedPercent>90?'var(--bad)':cat.usedPercent>70?'var(--warn)':PALETTE[i%8]}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontSize:15,fontWeight:700}}>Transactions ({expenses.length})</h3>
            </div>
            {expenses.length === 0 ? (
              <div className="empty"><div className="emo">💸</div><h3>No transactions yet</h3><p>Add your first expense for this month</p></div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {expenses.map(e=>(
                  <div key={e.expenseId} className="row">
                    <div className="row-icon" style={{background:'rgba(0,212,170,0.08)'}}>{CAT_ICONS[e.category?.categoryName]||'💰'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:14}}>{e.title}</div>
                      <div style={{fontSize:12,color:'var(--text3)',display:'flex',gap:10,flexWrap:'wrap',marginTop:2}}>
                        <span>{e.category?.categoryName}</span>
                        <span>{new Date(e.expenseDate+'T00:00:00').toLocaleDateString('en-IN')}</span>
                        <span>{modeIcon[e.paymentMode]||''} {e.paymentMode}</span>
                      </div>
                      {e.notes && <div style={{fontSize:11,color:'var(--text3)',marginTop:2,fontStyle:'italic'}}>{e.notes}</div>}
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontWeight:800,fontSize:16,color:'var(--bad)',fontFamily:'Outfit,sans-serif'}}>-₹{e.amount.toLocaleString()}</div>
                      <button className="btn btn-danger btn-sm" style={{marginTop:4}} onClick={()=>del(e.expenseId)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showAdd    && <AddExpenseModal categories={categories} onClose={()=>setShowAdd(false)}    onDone={()=>{setShowAdd(false);load();}} />}
      {showBudget && <BudgetModal     categories={categories} month={month} year={year} onClose={()=>setShowBudget(false)} onDone={()=>{setShowBudget(false);load();}} />}
    </div>
  );
}
