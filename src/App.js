import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Visitors from './pages/Visitors';
import Complaints from './pages/Complaints';
import Community from './pages/Community';
import SecurityDashboard from './pages/SecurityDashboard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const isSecurity = user?.role === 'Security';

  return (
    <NotificationProvider user={user}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            isSecurity ? <SecurityDashboard /> : <Dashboard />
          } />
          {/* Residents only */}
          {!isSecurity && <>
            <Route path="expenses"   element={<Expenses />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="community"  element={<Community />} />
          </>}
          {/* Both can see visitors */}
          <Route path="visitors" element={<Visitors />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
