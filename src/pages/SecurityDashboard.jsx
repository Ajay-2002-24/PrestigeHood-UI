import { useState, useEffect, useCallback } from 'react';
import { visitorAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  Pending   : { cls:'b-warn', label:'Pending',     color:'var(--warn)' },
  Approved  : { cls:'b-ok',   label:'Approved',    color:'var(--ok)'   },
  Rejected  : { cls:'b-bad',  label:'Rejected',    color:'var(--bad)'  },
  CheckedOut: { cls:'b-info', label:'Checked Out', color:'var(--info)' },
};

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

function NewEntryModal({ types, onClose, onDone }) {
  const [f, setF] = useState({
    flatId:'', visitorTypeId:'', visitorName:'',
    visitorPhone:'', purposeOfVisit:'', deliveryPartner:'', vehicleNumber:''
  });
  const [busy, setBusy] = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      await visitorAPI.create({...f, visitorTypeId:+f.visitorTypeId, flatId:+f.flatId});
      toast.success('✅ Visitor entry created! Resident notified.');
      onDone();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Failed to create entry');
    } finally { setBusy(false); }
  };

  return (
    <Modal title="🚪 Register Visitor at Gate" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Visitor Name *</label>
            <input className="inp" placeholder="Full name" value={f.visitorName}
              onChange={e=>s('visitorName',e.target.value)} required />
          </div>
          <div className="fg">
            <label className="label">Phone</label>
            <input className="inp" type="tel" placeholder="9999999999"
              value={f.visitorPhone} onChange={e=>s('visitorPhone',e.target.value)} />
          </div>
        </div>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Visitor Type *</label>
            <select className="inp" value={f.visitorTypeId}
              onChange={e=>s('visitorTypeId',e.target.value)} required>
              <option value="">Select type...</option>
              {types.map(t=><option key={t.visitorTypeId} value={t.visitorTypeId}>{t.typeName}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="label">Visiting Flat # *</label>
            <input className="inp" type="number" placeholder="e.g. 2"
              value={f.flatId} onChange={e=>s('flatId',e.target.value)} required />
          </div>
        </div>
        <div className="fg">
          <label className="label">Purpose of Visit</label>
          <input className="inp" placeholder="Delivery / Meeting / Repair..."
            value={f.purposeOfVisit} onChange={e=>s('purposeOfVisit',e.target.value)} />
        </div>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Delivery Partner</label>
            <input className="inp" placeholder="Swiggy / Zomato / Amazon..."
              value={f.deliveryPartner} onChange={e=>s('deliveryPartner',e.target.value)} />
          </div>
          <div className="fg">
            <label className="label">Vehicle Number</label>
            <input className="inp" placeholder="KA 01 AB 1234"
              value={f.vehicleNumber} onChange={e=>s('vehicleNumber',e.target.value)} />
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button type="button" className="btn btn-ghost"
            style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand"
            style={{flex:2,justifyContent:'center'}} disabled={busy}>
            {busy ? '⏳ Sending notification...' : '📲 Create & Notify Resident'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const FILTERS = [
  ['','All'],['Pending','⏳ Pending'],
  ['Approved','✅ Approved'],['CheckedOut','🏠 Checked Out'],['Rejected','❌ Rejected']
];

export default function SecurityDashboard() {
  const [visitors,  setVisitors]  = useState([]);
  const [types,     setTypes]     = useState([]);
  const [filter,    setFilter]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const { notifications }         = useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        visitorAPI.getAll(filter || undefined),
        visitorAPI.getTypes()
      ]);
      const vData = vRes.data;
      const tData = tRes.data;
      setVisitors(Array.isArray(vData?.data) ? vData.data : Array.isArray(vData) ? vData : []);
      setTypes(Array.isArray(tData?.data) ? tData.data : Array.isArray(tData) ? tData : []);
    } catch(err) {
      toast.error('Failed to load visitors');
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // Auto-reload when SignalR pushes a status update
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('visitorStatusUpdate', handler);
    return () => window.removeEventListener('visitorStatusUpdate', handler);
  }, [load]);

  const checkout = async id => {
    try {
      await visitorAPI.checkout(id);
      toast.success('🏠 Visitor checked out!');
      load();
    } catch { toast.error('Failed'); }
  };

  const counts = {
    total    : visitors.length,
    pending  : visitors.filter(v=>v.status==='Pending').length,
    approved : visitors.filter(v=>v.status==='Approved').length,
    checkedOut: visitors.filter(v=>v.status==='CheckedOut').length,
  };

  // Latest notifications for Security
  const recentNotifs = notifications.slice(0, 3);

  return (
    <div className="page fade-in">

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:24}}>
        <div>
          <h1 className="page-title">🛡️ Security Gate</h1>
          <p className="page-sub">All visitor entries across the society</p>
        </div>
        <button className="btn btn-brand" onClick={()=>setShowAdd(true)}>
          ➕ Register Visitor
        </button>
      </div>

      {/* Recent notifications for security */}
      {recentNotifs.filter(n=>!n.isRead).length > 0 && (
        <div style={{
          background:'rgba(0,212,170,0.06)', border:'1px solid rgba(0,212,170,0.2)',
          borderRadius:14, padding:16, marginBottom:20
        }}>
          <div style={{fontWeight:700, fontSize:13, color:'var(--brand)', marginBottom:10}}>
            🔔 Recent Updates
          </div>
          {recentNotifs.filter(n=>!n.isRead).map((n,i)=>(
            <div key={i} style={{
              display:'flex', gap:10, alignItems:'center',
              padding:'8px 0', borderBottom: i < recentNotifs.length-1 ? '1px solid var(--border)' : 'none'
            }}>
              <span style={{fontSize:20}}>{n.title?.startsWith('✅') ? '✅' : n.title?.startsWith('❌') ? '❌' : '🔔'}</span>
              <div>
                <div style={{fontWeight:600, fontSize:13}}>{n.title}</div>
                <div style={{fontSize:12, color:'var(--text3)'}}>{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="g4 stagger" style={{marginBottom:24}}>
        {[
          ['👥','Total',     counts.total,      'rgba(0,212,170,0.1)', 'var(--brand)', ''],
          ['⏳','Pending',   counts.pending,    'rgba(245,158,11,0.1)','var(--warn)',  'Pending'],
          ['✅','Approved',  counts.approved,   'rgba(34,197,94,0.1)', 'var(--ok)',    'Approved'],
          ['🏠','Checked Out',counts.checkedOut,'rgba(78,205,196,0.1)','var(--info)', 'CheckedOut'],
        ].map(([icon,lbl,val,bg,c,flt])=>(
          <div key={lbl} className="stat-card"
            style={{background:bg,borderColor:'transparent',cursor:'pointer'}}
            onClick={()=>setFilter(flt)}>
            <div style={{background:'transparent',fontSize:28,marginBottom:8}}>{icon}</div>
            <div className="stat-val" style={{color:c}}>{val}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tab-bar">
        {FILTERS.map(([v,l])=>(
          <button key={v} className={`tab${filter===v?' active':''}`}
            onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {/* Visitor list */}
      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:80}}>
          <div className="spinner"/>
        </div>
      ) : (
        <div className="card">
          {visitors.length === 0 ? (
            <div className="empty">
              <div className="emo">🚪</div>
              <h3>No visitors</h3>
              <p>No entries match this filter</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {visitors.map(v => {
                const ss = STATUS_STYLE[v.status] || STATUS_STYLE.Pending;
                return (
                  <div key={v.visitorId} className="row"
                    style={{borderLeft:`3px solid ${ss.color}`, animation:'fadeIn 0.3s ease'}}>
                    <div className="row-icon"
                      style={{background:'rgba(0,212,170,0.08)',flexShrink:0,fontSize:22}}>
                      {v.visitorType?.typeName === 'Delivery' ? '📦'
                        : v.visitorType?.typeName === 'Cab' ? '🚗'
                        : v.visitorType?.typeName === 'Service' ? '🔧'
                        : '👤'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14}}>{v.visitorName}</div>
                      <div style={{fontSize:12,color:'var(--text3)',display:'flex',gap:10,flexWrap:'wrap',marginTop:2}}>
                        <span>🏠 Flat {v.flatId}</span>
                        {v.purposeOfVisit  && <span>🎯 {v.purposeOfVisit}</span>}
                        {v.deliveryPartner && <span>📦 {v.deliveryPartner}</span>}
                        {v.vehicleNumber   && <span>🚗 {v.vehicleNumber}</span>}
                        <span>🕐 {new Date(v.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span className={`badge ${ss.cls}`}>{ss.label}</span>
                      {v.status === 'Approved' && (
                        <button className="btn btn-ok btn-sm"
                          onClick={()=>checkout(v.visitorId)}>
                          🏠 Check Out
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <NewEntryModal
          types={types}
          onClose={()=>setShowAdd(false)}
          onDone={()=>{ setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}
