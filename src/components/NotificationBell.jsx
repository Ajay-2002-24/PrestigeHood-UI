import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON = {
  visitor_pending : '🔔',
  visitor_approved: '✅',
  visitor_rejected: '❌',
  visitor_checkout: '🏠',
  Visitor         : '🚪',
  VisitorApproval : '✅',
  default         : '📢'
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, connected } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:'relative', background:'var(--bg3)', border:'1px solid var(--border)',
          borderRadius:10, width:40, height:40, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, transition:'all 0.2s',
          boxShadow: open ? '0 0 0 2px var(--brand)' : 'none'
        }}
        title={connected ? 'Notifications (live)' : 'Notifications (offline)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position:'absolute', top:-4, right:-4,
            background:'var(--bad)', color:'#fff',
            borderRadius:999, fontSize:10, fontWeight:700,
            minWidth:18, height:18, display:'flex',
            alignItems:'center', justifyContent:'center',
            padding:'0 4px', border:'2px solid var(--bg)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Live indicator dot */}
        <span style={{
          position:'absolute', bottom:2, right:2,
          width:7, height:7, borderRadius:'50%',
          background: connected ? 'var(--ok)' : 'var(--text3)',
          border:'1.5px solid var(--bg3)'
        }} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position:'absolute', top:48, right:0, width:340, maxHeight:480,
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          overflow:'hidden', display:'flex', flexDirection:'column',
          zIndex:1000, animation:'fadeIn 0.15s ease'
        }}>
          {/* Header */}
          <div style={{
            padding:'14px 16px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{ fontWeight:700, fontSize:14 }}>
              Notifications {unreadCount > 0 && (
                <span style={{
                  background:'var(--bad)', color:'#fff',
                  borderRadius:999, fontSize:11, padding:'1px 7px', marginLeft:6
                }}>{unreadCount}</span>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:11, color: connected ? 'var(--ok)' : 'var(--text3)' }}>
                {connected ? '● Live' : '○ Offline'}
              </span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  background:'none', border:'none', color:'var(--brand)',
                  fontSize:12, cursor:'pointer', fontWeight:600
                }}>Mark all read</button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {notifications.length === 0 ? (
              <div style={{
                padding:32, textAlign:'center',
                color:'var(--text3)', fontSize:13
              }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => {
                const icon = TYPE_ICON[n.notificationType] || TYPE_ICON.default;
                return (
                  <div
                    key={n.notificationId || i}
                    onClick={() => !n.isRead && markRead(n.notificationId)}
                    style={{
                      padding:'12px 16px',
                      borderBottom:'1px solid var(--border)',
                      background: n.isRead ? 'transparent' : 'rgba(0,212,170,0.05)',
                      cursor: n.isRead ? 'default' : 'pointer',
                      display:'flex', gap:12, alignItems:'flex-start',
                      transition:'background 0.2s'
                    }}
                  >
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background: n.isRead ? 'var(--bg3)' : 'rgba(0,212,170,0.12)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18
                    }}>{icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontWeight: n.isRead ? 500 : 700,
                        fontSize:13, marginBottom:2,
                        color: n.isRead ? 'var(--text2)' : 'var(--text)'
                      }}>{n.title}</div>
                      <div style={{
                        fontSize:12, color:'var(--text3)',
                        lineHeight:1.4, marginBottom:4
                      }}>{n.body}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width:8, height:8, borderRadius:'50%',
                        background:'var(--brand)', flexShrink:0, marginTop:4
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
