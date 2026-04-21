import { useState, useEffect, useCallback } from 'react';
import { complaintAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  Open      : { cls:'b-warn', label:'Open',        color:'var(--warn)', icon:'🔴' },
  InProgress: { cls:'b-info', label:'In Progress', color:'var(--info)', icon:'🔧' },
  Resolved  : { cls:'b-ok',   label:'Resolved',    color:'var(--ok)',   icon:'✅' },
  Closed    : { cls:'b-bad',  label:'Closed',      color:'var(--text3)',icon:'🔒' },
};

const PRIORITY_STYLE = {
  Low   : { color:'var(--ok)',   bg:'rgba(34,197,94,0.1)'  },
  Medium: { color:'var(--warn)', bg:'rgba(245,158,11,0.1)' },
  Normal: { color:'var(--warn)', bg:'rgba(245,158,11,0.1)' },
  High  : { color:'var(--bad)',  bg:'rgba(239,68,68,0.1)'  },
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

function RaiseModal({ categories, onClose, onDone }) {
  const [f, setF] = useState({
    complaintCatId:'', title:'', description:'', priority:'Normal'
  });
  const [busy, setBusy] = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      await complaintAPI.create({
        ...f,
        complaintCatId: +f.complaintCatId
      });
      toast.success('📋 Complaint raised! Admin has been notified.');
      onDone();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Failed to raise complaint');
    } finally { setBusy(false); }
  };

  return (
    <Modal title="📋 Raise a Complaint" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="g2" style={{gap:12}}>
          <div className="fg">
            <label className="label">Category *</label>
            <select className="inp" value={f.complaintCatId}
              onChange={e=>s('complaintCatId',e.target.value)} required>
              <option value="">Select category...</option>
              {categories.map(c=>(
                <option key={c.complaintCatId} value={c.complaintCatId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="label">Priority</label>
            <select className="inp" value={f.priority} onChange={e=>s('priority',e.target.value)}>
              <option value="Low">🟢 Low</option>
              <option value="Normal">🟡 Normal</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </div>
        <div className="fg">
          <label className="label">Title *</label>
          <input className="inp" placeholder="e.g. Water leakage in bathroom"
            value={f.title} onChange={e=>s('title',e.target.value)} required />
        </div>
        <div className="fg">
          <label className="label">Description</label>
          <textarea className="inp" rows={4}
            placeholder="Describe the issue in detail..."
            value={f.description} onChange={e=>s('description',e.target.value)}
            style={{resize:'vertical'}} />
        </div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button type="button" className="btn btn-ghost"
            style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-brand"
            style={{flex:2,justifyContent:'center'}} disabled={busy}>
            {busy ? '⏳ Submitting...' : '📋 Raise Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DetailModal({ complaint, onClose }) {
  const ss = STATUS_STYLE[complaint.status] || STATUS_STYLE.Open;
  const ps = PRIORITY_STYLE[complaint.priority] || PRIORITY_STYLE.Normal;

  return (
    <Modal title="📋 Complaint Details" onClose={onClose}>
      <div style={{
        background:'var(--bg3)', borderRadius:12, padding:16, marginBottom:16,
        borderLeft:`3px solid ${ss.color}`
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontWeight:700,fontSize:15}}>{complaint.title}</span>
          <span className={`badge ${ss.cls}`}>{ss.icon} {ss.label}</span>
        </div>
        <div style={{fontSize:13,color:'var(--text2)',marginBottom:8}}>
          {complaint.description}
        </div>
        <div style={{display:'flex',gap:12,fontSize:12,color:'var(--text3)',flexWrap:'wrap'}}>
          <span>📅 {new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
          <span style={{
            background:ps.bg, color:ps.color,
            borderRadius:6, padding:'1px 8px', fontWeight:700
          }}>{complaint.priority} Priority</span>
          {complaint.assignedTo && <span>🔧 {complaint.assignedTo.fullName}</span>}
          {complaint.resolvedAt && <span>✅ Resolved: {new Date(complaint.resolvedAt).toLocaleDateString('en-IN')}</span>}
        </div>
      </div>

      {/* Status Timeline */}
      <div style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'var(--text2)'}}>
          📊 Status Timeline
        </div>
        <div style={{display:'flex',position:'relative'}}>
          {['Open','InProgress','Resolved','Closed'].map((s,i)=>{
            const allStatuses = ['Open','InProgress','Resolved','Closed'];
            const currentIdx  = allStatuses.indexOf(complaint.status);
            const isActive    = i <= currentIdx;
            const isCurrent   = i === currentIdx;
            const st          = STATUS_STYLE[s];
            return (
              <div key={s} style={{flex:1,textAlign:'center',position:'relative'}}>
                {i < 3 && (
                  <div style={{
                    position:'absolute',top:12,left:'50%',width:'100%',height:2,
                    background: isActive && i < currentIdx ? 'var(--brand)' : 'var(--border)',
                    zIndex:0
                  }}/>
                )}
                <div style={{
                  width:24,height:24,borderRadius:'50%',
                  background: isCurrent ? 'var(--brand)' : isActive ? 'rgba(0,212,170,0.3)' : 'var(--bg3)',
                  border:`2px solid ${isActive ? 'var(--brand)' : 'var(--border)'}`,
                  margin:'0 auto 6px',display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:12,position:'relative',zIndex:1
                }}>{isActive ? '✓' : ''}</div>
                <div style={{fontSize:10,color: isCurrent ? 'var(--brand)' : 'var(--text3)',
                  fontWeight: isCurrent ? 700 : 400}}>
                  {st?.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      {complaint.complaintComments?.length > 0 && (
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'var(--text2)'}}>
            💬 Updates from Team
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {complaint.complaintComments.map((c,i)=>(
              <div key={i} style={{
                background:'var(--bg3)',borderRadius:10,padding:'10px 14px',
                fontSize:13,borderLeft:'3px solid var(--brand)'
              }}>
                <div style={{color:'var(--text)',marginBottom:4}}>{c.comment}</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>
                  {new Date(c.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-ghost"
        style={{width:'100%',justifyContent:'center',marginTop:16}}
        onClick={onClose}>Close</button>
    </Modal>
  );
}

const FILTERS = [
  ['','All'],['Open','🔴 Open'],
  ['InProgress','🔧 In Progress'],['Resolved','✅ Resolved'],['Closed','🔒 Closed']
];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter,     setFilter]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [showRaise,  setShowRaise]  = useState(false);
  const [selected,   setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, catRes] = await Promise.all([
        complaintAPI.getAll(filter || undefined),
        complaintAPI.getCategories()
      ]);
      const cData   = cRes.data;
      const catData = catRes.data;
      setComplaints(Array.isArray(cData?.data)   ? cData.data   : []);
      setCategories(Array.isArray(catData?.data) ? catData.data : []);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('complaintStatusUpdate', handler);
    return () => window.removeEventListener('complaintStatusUpdate', handler);
  }, [load]);

  const counts = {
    total     : complaints.length,
    open      : complaints.filter(c=>c.status==='Open').length,
    inProgress: complaints.filter(c=>c.status==='InProgress').length,
    resolved  : complaints.filter(c=>c.status==='Resolved').length,
  };

  return (
    <div className="page fade-in">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
        flexWrap:'wrap',gap:12,marginBottom:24}}>
        <div>
          <h1 className="page-title">📋 My Complaints</h1>
          <p className="page-sub">Track all your society complaints</p>
        </div>
        <button className="btn btn-brand" onClick={()=>setShowRaise(true)}>
          ➕ Raise Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="g4 stagger" style={{marginBottom:24}}>
        {[
          ['📋','Total',      counts.total,      'rgba(0,212,170,0.1)', 'var(--brand)', ''],
          ['🔴','Open',       counts.open,       'rgba(239,68,68,0.1)', 'var(--bad)',   'Open'],
          ['🔧','In Progress',counts.inProgress, 'rgba(78,205,196,0.1)','var(--info)',  'InProgress'],
          ['✅','Resolved',   counts.resolved,   'rgba(34,197,94,0.1)', 'var(--ok)',    'Resolved'],
        ].map(([icon,lbl,val,bg,c,flt])=>(
          <div key={lbl} className="stat-card"
            style={{background:bg,borderColor:'transparent',cursor:'pointer'}}
            onClick={()=>setFilter(flt)}>
            <div style={{fontSize:26,marginBottom:8}}>{icon}</div>
            <div className="stat-val" style={{color:c}}>{val}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {FILTERS.map(([v,l])=>(
          <button key={v} className={`tab${filter===v?' active':''}`}
            onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:80}}>
          <div className="spinner"/>
        </div>
      ) : (
        <div className="card">
          {complaints.length === 0 ? (
            <div className="empty">
              <div className="emo">📋</div>
              <h3>No complaints</h3>
              <p>You haven't raised any complaints yet</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {complaints.map(c => {
                const ss = STATUS_STYLE[c.status] || STATUS_STYLE.Open;
                const ps = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.Normal;
                return (
                  <div key={c.complaintId} className="row"
                    style={{borderLeft:`3px solid ${ss.color}`,cursor:'pointer'}}
                    onClick={()=>setSelected(c)}>
                    <div className="row-icon"
                      style={{background:'rgba(0,212,170,0.08)',flexShrink:0,fontSize:22}}>
                      {ss.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{c.title}</div>
                      <div style={{fontSize:12,color:'var(--text3)',display:'flex',gap:10,flexWrap:'wrap'}}>
                        <span>{c.complaintCat?.categoryName}</span>
                        <span style={{
                          background:ps.bg,color:ps.color,
                          borderRadius:4,padding:'0 6px',fontWeight:700
                        }}>{c.priority}</span>
                        <span>📅 {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                        {c.assignedTo && <span>🔧 {c.assignedTo.fullName}</span>}
                        {c.complaintComments?.length > 0 &&
                          <span>💬 {c.complaintComments.length} update{c.complaintComments.length>1?'s':''}</span>}
                      </div>
                    </div>
                    <span className={`badge ${ss.cls}`}>{ss.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showRaise && (
        <RaiseModal
          categories={categories}
          onClose={()=>setShowRaise(false)}
          onDone={()=>{ setShowRaise(false); load(); }}
        />
      )}
      {selected && (
        <DetailModal complaint={selected} onClose={()=>setSelected(null)} />
      )}
    </div>
  );
}