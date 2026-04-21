import { useAuth } from '../context/AuthContext';

// Static community page — announcements & quick links
// (Announcement API can be wired when backend endpoint is added)
export default function Community() {
  const { user } = useAuth();

  const announcements = [
    { id:1, title:'Water Supply Maintenance', body:'Water supply will be unavailable on Saturday 8 March from 9AM to 1PM due to tank cleaning. Please store water in advance.', category:'Maintenance', pinned:true, date:'2026-03-04', icon:'💧' },
    { id:2, title:'Society Meeting — March AGM', body:'Annual General Meeting scheduled for Sunday 15 March at 6PM in the community hall. All residents are requested to attend.', category:'Meeting', pinned:true, date:'2026-03-01', icon:'📅' },
    { id:3, title:'Gym Renovation Complete', body:'The gym on B-block ground floor has been fully renovated with new equipment. Available from Monday 9 March onwards, 6AM to 10PM.', category:'Facility', pinned:false, date:'2026-02-28', icon:'🏋️' },
    { id:4, title:'New Security Protocol', body:'Starting April 1, all delivery personnel must show ID at the gate. Residents must pre-approve deliveries via the Visitors module.', category:'Security', pinned:false, date:'2026-02-25', icon:'🔐' },
    { id:5, title:'Children Park Upgrade', body:'New play equipment has been installed in the children\'s park. The fountain area will be operational by end of March.', category:'Facility', pinned:false, date:'2026-02-20', icon:'🌳' },
  ];

  const quickLinks = [
    { icon:'📞', label:'Security Desk',   value:'080-XXXX-1234', type:'phone' },
    { icon:'🔧', label:'Maintenance',     value:'080-XXXX-5678', type:'phone' },
    { icon:'🚑', label:'Emergency',       value:'112',           type:'phone' },
    { icon:'🏦', label:'Society Office',  value:'9AM – 6PM',     type:'info'  },
    { icon:'🅿️', label:'Parking Queries', value:'Level B1 & B2', type:'info'  },
    { icon:'🛗', label:'Lift Helpline',   value:'080-XXXX-9999', type:'phone' },
  ];

  const catColor = { Maintenance:'b-warn', Meeting:'b-brand', Facility:'b-ok', Security:'b-bad', Update:'b-info' };

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{marginBottom:28}}>
        <h1 className="page-title">📢 Community</h1>
        <p className="page-sub">Announcements, notices, and quick contacts</p>
      </div>

      {/* Welcome banner */}
      <div style={{padding:'24px 28px',background:'linear-gradient(135deg,rgba(0,212,170,0.12),rgba(78,205,196,0.06))',border:'1px solid var(--border2)',borderRadius:'var(--r-lg)',marginBottom:28,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,background:'radial-gradient(circle,rgba(0,212,170,0.08),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{width:52,height:52,borderRadius:16,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#080C10',fontWeight:900,flexShrink:0}}>P</div>
          <div>
            <h2 style={{fontSize:20,fontWeight:800}}>Prestige Hood Society</h2>
            <p style={{fontSize:14,color:'var(--text2)',marginTop:3}}>
              500 Flats · Bangalore, Karnataka · Resident: {user?.fullName} · Flat {user?.flatId}
            </p>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <span className="badge b-brand">Active Resident</span>
            <span className="badge b-ok">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="g2" style={{alignItems:'start'}}>
        {/* Announcements */}
        <div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📌 Announcements</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {announcements.map(a => (
              <div key={a.id} className="card" style={{padding:'18px 20px',borderLeft:`3px solid ${a.pinned?'var(--brand)':'var(--border)'}`,position:'relative'}}>
                {a.pinned && (
                  <div style={{position:'absolute',top:12,right:12}}>
                    <span className="badge b-brand" style={{fontSize:10}}>📌 Pinned</span>
                  </div>
                )}
                <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:11,background:'rgba(0,212,170,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{a.icon}</div>
                  <div style={{flex:1,paddingRight:a.pinned?60:0}}>
                    <h4 style={{fontSize:15,fontWeight:700,marginBottom:5}}>{a.title}</h4>
                    <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6,marginBottom:8}}>{a.body}</p>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span className={`badge ${catColor[a.category]||'b-info'}`}>{a.category}</span>
                      <span style={{fontSize:11,color:'var(--text3)'}}>{new Date(a.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Quick contacts */}
          <div>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📞 Quick Contacts</h3>
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              {quickLinks.map((l,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<quickLinks.length-1?'1px solid var(--border)':'none',transition:'var(--t)'}}>
                  <div style={{width:38,height:38,borderRadius:10,background:'rgba(0,212,170,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{l.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{l.label}</div>
                    <div style={{fontSize:12,color:'var(--brand)',fontWeight:700}}>{l.value}</div>
                  </div>
                  {l.type==='phone' && <a href={`tel:${l.value.replace(/[^0-9]/g,'')}`} className="btn btn-ghost btn-sm">Call</a>}
                </div>
              ))}
            </div>
          </div>

          {/* Society stats */}
          <div>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🏘️ Society Stats</h3>
            <div className="card">
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[['Total Flats','500','🏠'],['Occupied','487','✅'],['Common Areas','8','🌿'],['Parking Slots','600','🅿️'],['Lifts','12','🛗'],['CCTV Cameras','64','📷']].map(([l,v,i])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span>{i}</span>
                      <span style={{fontSize:13,color:'var(--text2)'}}>{l}</span>
                    </div>
                    <span style={{fontSize:15,fontWeight:800,color:'var(--brand)'}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>👤 My Profile</h3>
            <div className="card">
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand),var(--info))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#080C10'}}>
                  {user?.fullName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>{user?.fullName}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>{user?.role}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[['Society','Prestige Hood'],['Flat No.',user?.flatId],['Role',user?.role],['Member Since','March 2026']].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                    <span style={{color:'var(--text3)'}}>{k}</span>
                    <span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
