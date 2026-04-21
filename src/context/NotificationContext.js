import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

const NotifContext = createContext(null);

export function NotificationProvider({ children, user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [connected,     setConnected]     = useState(false);
  const connRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll();
      const list = res.data?.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch {}
  }, [user]);

  // Add a new notification to top of list
  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n =>
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  // Setup SignalR
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const token = localStorage.getItem('ph_token');
    const conn = new HubConnectionBuilder()
      .withUrl('https://localhost:7084/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    // Handle incoming notifications
    conn.on('NewNotification', (data) => {
      const newNotif = {
        notificationId  : Date.now(),
        title           : data.title,
        body            : data.body,
        notificationType: data.type,
        referenceId     : data.visitorId,
        isRead          : false,
        createdAt       : new Date().toISOString(),
        ...data
      };
      addNotification(newNotif);

      // Show toast based on type
      if (data.type === 'visitor_pending') {
        toast.custom((t) => (
          <div style={{
            background:'var(--bg2)', border:'1px solid var(--warn)',
            borderRadius:12, padding:'12px 16px', maxWidth:320,
            boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <div style={{fontWeight:700, color:'var(--warn)', marginBottom:4}}>
              🔔 Visitor at Gate
            </div>
            <div style={{fontSize:13, color:'var(--text2)'}}>{data.body}</div>
          </div>
        ), { duration: 6000 });
      } else if (data.type === 'visitor_approved') {
        toast.success(data.body, { duration: 5000 });
      } else if (data.type === 'visitor_rejected') {
        toast.error(data.body, { duration: 5000 });
      } else if (data.type === 'visitor_checkout') {
        toast(data.body, { duration: 4000 });
      }
    });

    conn.on('VisitorStatusUpdate', (data) => {
      // Trigger a page refresh event for Visitors page
      window.dispatchEvent(new CustomEvent('visitorStatusUpdate', { detail: data }));
    });

    conn.start()
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    connRef.current = conn;

    return () => {
      conn.stop();
      connRef.current = null;
    };
  }, [user, loadNotifications, addNotification]);

  return (
    <NotifContext.Provider value={{
      notifications, unreadCount, connected,
      loadNotifications, markRead, markAllRead
    }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotifications = () => useContext(NotifContext);
