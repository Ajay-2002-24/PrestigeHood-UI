import { expenseAPI, visitorAPI, complaintAPI } from '../services/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';

const PALETTE = ['#00D4AA','#FF6B6B','#FFD93D','#4ECDC4','#C084FC','#F97316','#22C55E','#3B82F6'];

function StatCard({ icon, label, value, sub, bg, to }) {
  return (
    <Link to={to} style={{textDecoration:'none'}}>
      <div className="stat-card">
        <div className="stat-icon" style={{background:bg}}>{icon}</div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </Link>
  );
}

const CustomTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:10,padding:'10px 14px'}}>
      <div style={{fontWeight:700,fontSize:13,color:'var(--brand)'}}>{payload[0].name}</div>
      <div style={{fontSize:14,color:'var(--text)'}}>₹{payload[0].value?.toLocaleString()}</div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary,    setSummary]    = useState(null);
  const [pendingV,   setPendingV]   = useState([]);
  const [openC,      setOpenC]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const now = new Date();

  useEffect(() => {
    Promise.all([
      expenseAPI.getSummary(now.getMonth()+1, now.getFullYear()),
      visitorAPI.getAll('Pending'),
      complaintAPI.getAll('Open'),
    ]).then(([s,v,c]) => {
      setSummary(s.data.data);
      setPendingV(v.data.data || []);
      setOpenC(c.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <div className="spinner" style={{margin:'0 auto 16px'}}/>
        <div style={{color:'var(--text3)',fontSize:13}}>Loading your dashboard...</div>
      </div>
    </div>
  );

  const pieData = (summary?.categories || []).filter(c => c.totalSpent > 0).map(c => ({ name:c.categoryName, value:c.totalSpent }));
  const barData = (summary?.categories || []).filter(c => c.budgetAmount > 0).slice(0,6).map(c => ({ name:c.categoryName.slice(0,6), budget:c.budgetAmount, spent:c.totalSpent }));
  const pct = summary?.usedPercent || 0;
  const pctColor = pct > 90 ? 'var(--bad)' : pct > 70 ? 'var(--warn)' : 'var(--brand)';
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page fade-in">

      {/* ── Header ── */}
      <div style={{marginBottom:28,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-sub">{now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <span className="badge b-brand">Flat {user?.flatId}</span>
          <span className="badge b-info">{user?.role}</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="g4 stagger" style={{marginBottom:24}}>
        <StatCard icon="💰" label="Monthly Budget" value={`₹${(summary?.totalBudget||0).toLocaleString()}`} sub={`${pct}% utilised`} bg="rgba(0,212,170,0.12)" to="/expenses" />
        <StatCard icon="💸" label="Total Spent" value={`₹${(summary?.totalSpent||0).toLocaleString()}`} sub={`₹${((summary?.totalBudget||0)-(summary?.totalSpent||0)).toLocaleString()} remaining`} bg="rgba(239,68,68,0.12)" to="/expenses" />
        <StatCard icon="🚪" label="Pending Visitors" value={pendingV.length} sub={pendingV.length ? 'Need approval' : 'All clear'} bg="rgba(245,158,11,0.12)" to="/visitors" />
        <StatCard icon="📋" label="Open Complaints" value={openC.length} sub={openC.length ? 'Need attention' : 'All resolved'} bg="rgba(192,132,252,0.12)" to="/complaints" />
      </div>

      {/* ── Charts row ── */}
      <div className="g2" style={{marginBottom:24}}>

        {/* Budget Overview */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700}}>Budget Overview</h3>
              <p style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{now.toLocaleString('default',{month:'long'})} {now.getFullYear()}</p>
            </div>
            <Link to="/expenses" className="btn btn-ghost btn-sm">View All</Link>
          </div>

          {/* Big progress */}
          <div style={{padding:16,background:'var(--bg3)',borderRadius:12,marginBottom:18}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600}}>Overall Usage</span>
              <span style={{fontSize:22,fontWeight:800,color:pctColor,fontFamily:'Outfit,sans-serif'}}>{pct}%</span>
            </div>
            <div className="bar-track" style={{height:8}}>
              <div className="bar-fill" style={{width:`${Math.min(pct,100)}%`,background:pctColor}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
              <span style={{fontSize:11,color:'var(--text3)'}}>₹{(summary?.totalSpent||0).toLocaleString()} spent</span>
              <span style={{fontSize:11,color:'var(--text3)'}}>₹{(summary?.totalBudget||0).toLocaleString()} total</span>
            </div>
          </div>

          {/* Per category */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {(summary?.categories||[]).slice(0,5).map((c,i) => (
              <div key={c.categoryId}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:PALETTE[i%8],flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500}}>{c.categoryName}</span>
                    {c.alertSent && <span className="badge b-bad" style={{fontSize:9}}>⚠ Alert</span>}
                  </div>
                  <span style={{fontSize:12,color:'var(--text3)'}}>₹{c.totalSpent.toLocaleString()} / ₹{c.budgetAmount.toLocaleString()}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{width:`${Math.min(c.usedPercent||0,100)}%`,background:c.usedPercent>90?'var(--bad)':c.usedPercent>70?'var(--warn)':PALETTE[i%8]}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Distribution */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700}}>Spending Distribution</h3>
              <p style={{fontSize:12,color:'var(--text3)',marginTop:2}}>By category this month</p>
            </div>
          </div>

          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} dataKey="value" paddingAngle={4} strokeWidth={0}>
                    {pieData.map((_,i) => <Cell key={i} fill={PALETTE[i%8]} />)}
                  </Pie>
                  <Tooltip content={<CustomTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px 16px',marginTop:8}}>
                {pieData.map((d,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:PALETTE[i%8],flexShrink:0}}/>
                    <span style={{fontSize:12,color:'var(--text2)'}}>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty"><div className="emo">📊</div><h3>No data yet</h3><p>Add expenses to see charts</p></div>
          )}
        </div>
      </div>

      {/* ── Bar chart (full width) ── */}
      {barData.length > 0 && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Budget vs Spent — by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text3)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="budget" fill="rgba(0,212,170,0.2)" name="Budget" radius={[4,4,0,0]}/>
              <Bar dataKey="spent"  fill="var(--brand)"         name="Spent"  radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:16,marginTop:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:12,height:12,borderRadius:3,background:'rgba(0,212,170,0.3)'}}/><span style={{fontSize:12,color:'var(--text2)'}}>Budget</span></div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:12,height:12,borderRadius:3,background:'var(--brand)'}}/><span style={{fontSize:12,color:'var(--text2)'}}>Spent</span></div>
          </div>
        </div>
      )}

      {/* ── Pending visitors ── */}
      {pendingV.length > 0 && (
        <div className="card" style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700}}>⏳ Pending Visitor Approvals</h3>
            <Link to="/visitors" className="btn btn-ghost btn-sm">See All</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {pendingV.slice(0,3).map(v => (
              <div key={v.visitorId} className="row" style={{borderLeft:'3px solid var(--warn)'}}>
                <div className="row-icon" style={{background:'rgba(245,158,11,0.12)'}}>👤</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{v.visitorName}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>{v.purposeOfVisit||'Visit'} · {new Date(v.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <span className="badge b-warn">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Open complaints ── */}
      {openC.length > 0 && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700}}>🔴 Open Complaints</h3>
            <Link to="/complaints" className="btn btn-ghost btn-sm">See All</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {openC.slice(0,3).map(c => (
              <div key={c.complaintId} className="row" style={{borderLeft:'3px solid var(--bad)'}}>
                <div className="row-icon" style={{background:'rgba(239,68,68,0.1)'}}>{c.priority==='High'||c.priority==='Critical'?'🚨':'📋'}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{c.title}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>{c.priority} Priority · {new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`badge ${c.priority==='High'||c.priority==='Critical'?'b-bad':'b-warn'}`}>{c.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
