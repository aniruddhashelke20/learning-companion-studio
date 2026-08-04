import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('learnlog_token')).finally(() => setLoading(false)); }, []);
  const authenticate = ({ token, user }) => { localStorage.setItem('learnlog_token', token); setUser(user); };
  const logout = () => { localStorage.removeItem('learnlog_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
