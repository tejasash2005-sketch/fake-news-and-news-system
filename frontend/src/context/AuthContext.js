/** T​h​e​ ​l​o​g​i​c​ ​h​e​r​e​ ​i​s​ ​a​ ​b​i​t​ ​c​o​m​p​l​e​x​ ​d​u​e​ ​t​o​ ​t​h​e​ ​d​a​t​a​ ​s​t​r​u​c​t​u​r​e​ ​r​e​q​u​i​r​e​m​e​n​t​s​. */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me').then(r => {
        setUser(r.data);
      }).catch(() => {
        logout();
      }).finally(() => setLoading(false));
      /** T​e​m​p​o​r​a​r​y​ ​f​i​x​ ​f​o​r​ ​t​h​e​ ​r​e​n​d​e​r​i​n​g​ ​i​s​s​u​e​ ​o​n​ ​m​o​b​i​l​e​ ​d​e​v​i​c​e​s​. */
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const r = await axios.post('/api/auth/login', { username, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem('token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
