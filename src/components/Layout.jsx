import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const RESIDENT_NAV = [
  { to:'/dashboard',  icon:'🏠', label:'Dashboard'   },
  { to:'/expenses',   icon:'💰', label:'Expenses'    },
  { to:'/visitors',   icon:'🚪', label:'Visitors'    },
  { to:'/complaints', icon:'📋', label:'Complaints'  },
  { to:'/community',  icon:'📢', label:'Community'   },
];

const SECURITY_NAV = [
  { to:'/dashboard', icon:'🛡️', label:'Gate Control' },
  { to:'/visitors',  icon:'🚪', label:'All Visitors'  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isSecurity = user?.role === 'Guard'; 
  const NAV        = isSecurity ? SECURITY_NAV : RESIDENT_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'var(--bg)'}}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 210,
        background:'var(--bg2)',
        borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        flexShrink:0, overflow:'hidden'
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight:70
        }}>
          {!collapsed && (
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{
                width:36, height:36, background:'var(--brand)',
                borderRadius:10, display:'flex', alignItems:'center',
                justifyContent:'center', fontWeight:900, fontSize:16,
                color:'var(--bg)', flexShrink:0
              }}>P</div>
              <div>
                <div style={{fontWeight:800, fontSize:14, lineHeight:1}}>
                  <span style={{color:'var(--text)'}}>Prestige</span>
                  <span style={{color:'var(--brand)'}}>Hood</span>
                </div>
                <div style={{fontSize:10, color:'var(--text3)', marginTop:2}}>
                  {isSecurity ? 'SECURITY PORTAL' : 'COMMUNITY APP'}
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width:36, height:36, background:'var(--brand)',
              borderRadius:10, display:'flex', alignItems:'center',
              justifyContent:'center', fontWeight:900, color:'var(--bg)'
            }}>P</div>
          )}
          <button onClick={()=>setCollapsed(c=>!c)} style={{
            background:'none', border:'none', color:'var(--text3)',
            cursor:'pointer', fontSize:16, padding:4, flexShrink:0
          }}>{collapsed ? '›' : '‹'}</button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{padding:'10px 16px'}}>
            <div style={{
              background: isSecurity ? 'rgba(245,158,11,0.15)' : 'rgba(0,212,170,0.1)',
              border: `1px solid ${isSecurity ? 'rgba(245,158,11,0.3)' : 'rgba(0,212,170,0.2)'}`,
              borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:700,
              color: isSecurity ? 'var(--warn)' : 'var(--brand)',
              textAlign:'center'
            }}>
              {isSecurity ? '🛡️ SECURITY' : '🏠 RESIDENT'}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{flex:1,padding:'8px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(({to,icon,label})=>(
            <NavLink key={to} to={to} style={({isActive})=>({
              display:'flex', alignItems:'center',
              gap:10, padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:600,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'var(--brand)' : 'var(--text2)',
              background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
              transition:'all 0.15s'
            })}>
              <span style={{fontSize:18, flexShrink:0}}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{padding:'12px 8px', borderTop:'1px solid var(--border)'}}>
          {!collapsed && (
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 8px', marginBottom:6
            }}>
              <div style={{
                width:34, height:34, borderRadius:'50%',
                background:'var(--brand)', display:'flex',
                alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:13, color:'var(--bg)', flexShrink:0
              }}>
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {user?.fullName}
                </div>
                <div style={{fontSize:11,color:'var(--text3)'}}>
                  {isSecurity ? 'Security Guard' : `Flat ${user?.flatId}`}
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width:'100%', padding: collapsed ? '8px 0' : '8px 12px',
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)',
            borderRadius:10, color:'var(--bad)', cursor:'pointer',
            fontSize:12, fontWeight:700, display:'flex',
            alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap:8, transition:'all 0.15s'
          }}>
            <span>🚪</span>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column'}}>
        {/* Top bar with notification bell */}
        <div style={{
          padding:'12px 24px', borderBottom:'1px solid var(--border)',
          background:'var(--bg2)', display:'flex',
          alignItems:'center', justifyContent:'flex-end', gap:12,
          position:'sticky', top:0, zIndex:100
        }}>
          <NotificationBell />
        </div>

        <div style={{flex:1, padding:'24px', overflow:'auto'}}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
