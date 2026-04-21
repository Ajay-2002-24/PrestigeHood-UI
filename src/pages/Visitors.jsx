import { visitorAPI } from '../services/api';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  Pending:    { cls:'b-warn',  label:'Pending',     bar:'var(--warn)' },
  Approved:   { cls:'b-ok',    label:'Approved',    bar:'var(--ok)'   },
  Rejected:   { cls:'b-bad',   label:'Rejected',    bar:'var(--bad)'  },
  CheckedOut: { cls:'b-info',  label:'Checked Out', bar:'var(--info)' },
};

function Modal({ title, wide, onClose, children }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal${wide?' modal-lg':''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddModal({ types, flatId, onClose, onDone }) {
  const [f, setF] = useState({ flatId, visitorTypeId:'', visitorName:'', visitorPhone:'', purposeOfVisit:'', deliveryPartner:'', vehicleNumber:'' });
  const [busy, setBusy] = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      await visitorAPI.create({...f, visitorTypeId:+f.visitorTypeId, flatId:+f.flatId});
      toast.success('Visitor entry created!'); onDone();
    } catch { toast.error('Failed to create entry'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="🚪 New Visitor Entry" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Visitor Name</label>
            <input className="inp" placeholder="Full name" value={f.visitorName} onChange={e=>s('visitorName',e.target.value)} required />
          </div>
          <div className="fg">
            <label className="label">Phone</label>
            <input className="inp" type="tel" placeholder="9999999999" value={f.visitorPhone} onChange={e=>s('visitorPhone',e.target.value)} />
          </div>
        </div>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Visitor Type</label>
            <select className="inp" value={f.visitorTypeId} onChange={e=>s('visitorTypeId',e.target.value)} required>
              <option value="">Select type...</option>
              {types.map(t=><option key={t.visitorTypeId} value={t.visitorTypeId}>{t.typeName}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="label">Visiting Flat #</label>
            <input className="inp" type="number" value={f.flatId} onChange={e=>s('flatId',e.target.value)} required />
          </div>
        </div>
        <div className="fg">
          <label className="label">Purpose of Visit</label>
          <input className="inp" placeholder="e.g. Meeting, Delivery, Plumbing repair..." value={f.purposeOfVisit} onChange={e=>s('purposeOfVisit',e.target.value)} />
        </div>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Delivery Partner</label>
            <input className="inp" placeholder="Swiggy, Zomato, Amazon..." value={f.deliveryPartner} onChange={e=>s('deliveryPartner',e.target.value)} />
          </div>
          <div className="fg">
            <label className="label">Vehicle Number</label>
            <input className="inp" placeholder="KA 01 AB 1234" value={f.vehicleNumber} onChange={e=>s('vehicleNumber',e.target.value)} />
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:4}}>
          <button type="button" className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand" style={{flex:2,justifyContent:'center'}} disabled={busy}>{busy?'⏳ Creating...':'✓ Create Entry'}</button>
        </div>
      </form>
    </Modal>
  );
}

function ApproveModal({ visitor, onClose, onDone }) {
  const [action, setAction] = useState('Approve');
  const [notes,  setNotes]  = useState('');
  const [busy,   setBusy]   = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await visitorAPI.approve(visitor.visitorId, { action, notes });
      toast.success(`Visitor ${action.toLowerCase()}d!`); onDone();
    } catch { toast.error('Failed to process'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="🔔 Visitor Approval" onClose={onClose}>
      {/* Visitor info */}
      <div style={{padding:16,background:'var(--bg3)',borderRadius:12,marginBottom:20,borderLeft:'3px solid var(--brand)'}}>
        <div style={{fontWeight:700,fontSize:17,marginBottom:4}}>{visitor.visitorName}</div>
        <div style={{fontSize:13,color:'var(--text2)',display:'flex',flexDirection:'column',gap:3}}>
          {visitor.visitorPhone    && <span>📞 {visitor.visitorPhone}</span>}
          {visitor.purposeOfVisit  && <span>🎯 {visitor.purposeOfVisit}</span>}
          {visitor.deliveryPartner && <span>📦 {visitor.deliveryPartner}</span>}
          {visitor.vehicleNumber   && <span>🚗 {visitor.vehicleNumber}</span>}
          <span>🕐 {new Date(visitor.createdAt).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="fg">
        <label className="label">Your Decision</label>
        <div style={{display:'flex',gap:8}}>
          {['Approve','Reject'].map(a=>(
            <button key={a} type="button" onClick={()=>setAction(a)}
              className={`btn ${a==='Approve'?'btn-ok':'btn-danger'}`}
              style={{flex:1,justifyContent:'center',opacity:action===a?1:0.4,transition:'opacity 0.2s'}}>
              {a==='Approve'?'✅ Approve':'❌ Reject'}
            </button>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="label">Notes (optional)</label>
        <input className="inp" placeholder="e.g. Expected visitor, Allow entry..." value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>
      <div style={{display:'flex',gap:10}}>
        <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
        <button className={`btn ${action==='Approve'?'btn-ok':'btn-danger'}`} style={{flex:2,justifyContent:'center'}} onClick={submit} disabled={busy}>
          {busy?'⏳ Processing...': action==='Approve'?'✅ Confirm Approval':'❌ Confirm Rejection'}
        </button>
      </div>
    </Modal>
  );
}

const FILTERS = [['','All Visitors'],['Pending','⏳ Pending'],['Approved','✅ Approved'],['CheckedOut','🏠 Checked Out'],['Rejected','❌ Rejected']];

export default function Visitors() {
  const { user } = useAuth();
  const [visitors,  setVisitors]  = useState([]);
  const [types,     setTypes]     = useState([]);
  const [filter,    setFilter]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [selected,  setSelected]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, t] = await Promise.all([visitorAPI.getAll(filter||undefined), visitorAPI.getTypes()]);
      setVisitors(v.data.data || []);
      setTypes(t.data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const checkout = async id => {
    try { await visitorAPI.checkout(id); toast.success('Visitor checked out!'); load(); }
    catch { toast.error('Failed'); }
  };

  const counts = {
    total: visitors.length,
    pending: visitors.filter(v=>v.status==='Pending').length,
    approved: visitors.filter(v=>v.status==='Approved').length,
    checkedOut: visitors.filter(v=>v.status==='CheckedOut').length,
  };

  return (
    <div className="page fade-in">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:24}}>
        <div>
          <h1 className="page-title">🚪 Visitors</h1>
          <p className="page-sub">Gate management and visitor approvals</p>
        </div>
        <button className="btn btn-brand" onClick={()=>setShowAdd(true)}>➕ New Entry</button>
      </div>

      {/* Quick stats */}
      <div className="g4 stagger" style={{marginBottom:24}}>
        {[['👥','Total',counts.total,'rgba(0,212,170,0.1)','var(--brand)'],
          ['⏳','Pending',counts.pending,'rgba(245,158,11,0.1)','var(--warn)'],
          ['✅','Approved',counts.approved,'rgba(34,197,94,0.1)','var(--ok)'],
          ['🏠','Checked Out',counts.checkedOut,'rgba(78,205,196,0.1)','var(--info)']
        ].map(([icon,lbl,val,bg,c])=>(
          <div key={lbl} className="stat-card" style={{background:bg,borderColor:'transparent',cursor:'pointer'}} onClick={()=>setFilter(lbl==='Total'?'':lbl==='Checked Out'?'CheckedOut':lbl)}>
            <div className="stat-icon" style={{background:'transparent',fontSize:24,marginBottom:8}}>{icon}</div>
            <div className="stat-val" style={{color:c}}>{val}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tab-bar">
        {FILTERS.map(([v,l])=>(
          <button key={v} className={`tab${filter===v?' active':''}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner"/></div>
      ) : (
        <div className="card">
          {visitors.length === 0 ? (
            <div className="empty"><div className="emo">🚪</div><h3>No visitors found</h3><p>No entries match the selected filter</p></div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {visitors.map(v => {
                const ss = STATUS_STYLE[v.status] || STATUS_STYLE.Pending;
                return (
                  <div key={v.visitorId} className="row" style={{borderLeft:`3px solid ${ss.bar}`}}>
                    <div className="row-icon" style={{background:'rgba(0,212,170,0.08)',flexShrink:0}}>👤</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14}}>{v.visitorName}</div>
                      <div style={{fontSize:12,color:'var(--text3)',display:'flex',gap:12,flexWrap:'wrap',marginTop:2}}>
                        <span>{v.visitorType?.typeName||'Visitor'}</span>
                        {v.purposeOfVisit && <span>🎯 {v.purposeOfVisit}</span>}
                        {v.deliveryPartner && <span>📦 {v.deliveryPartner}</span>}
                        <span>Flat {v.flatId}</span>
                        <span>🕐 {new Date(v.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span className={`badge ${ss.cls}`}>{ss.label}</span>
                      {v.status === 'Pending'  && <button className="btn btn-brand btn-sm" onClick={()=>setSelected(v)}>Respond</button>}
                      {v.status === 'Approved' && <button className="btn btn-ghost btn-sm" onClick={()=>checkout(v.visitorId)}>Check Out</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAdd  && <AddModal types={types} flatId={user?.flatId||1} onClose={()=>setShowAdd(false)} onDone={()=>{setShowAdd(false);load();}} />}
      {selected && <ApproveModal visitor={selected} onClose={()=>setSelected(null)} onDone={()=>{setSelected(null);load();}} />}
    </div>
  );
}
