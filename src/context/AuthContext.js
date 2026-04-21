import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem('ph_user');
      if (u) setUser(JSON.parse(u));
    } catch {}
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('ph_token', token);
    localStorage.setItem('ph_user',  JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
