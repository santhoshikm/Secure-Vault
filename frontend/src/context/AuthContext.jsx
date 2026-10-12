import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../utils/api';

const AuthContext = createContext(null);

const API = API_BASE_URL;

// Helper: read from localStorage first, fall back to sessionStorage
const readStorage = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key) || null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('USER');
  const [userMfa, setUserMfa] = useState(false);

  // Fetch the current user's profile (role, MFA status) from backend
  const fetchProfile = useCallback(async (token) => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const data = await r.json();
        setUserRole(data.role || 'USER');
        setUserMfa(data.mfaEnabled || false);
        // Cache in whichever storage has the token
        const store = localStorage.getItem('token') ? localStorage : sessionStorage;
        store.setItem('userRole', data.role || 'USER');
        store.setItem('userMfa', String(data.mfaEnabled || false));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const token = readStorage('token');
    const username = readStorage('username');
    const role = readStorage('userRole') || 'USER';
    const mfa = readStorage('userMfa') === 'true';
    if (token && username) {
      setUser({ token, username });
      setUserRole(role);
      setUserMfa(mfa);
      // Refresh profile from server
      fetchProfile(token);
    }
    setLoading(false);
  }, [fetchProfile]);

  // rememberMe = true  → localStorage (survives browser restart)
  // rememberMe = false → sessionStorage (cleared when tab/browser closes)
  const login = (token, username, rememberMe = false) => {
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem('token', token);
    store.setItem('username', username);
    setUser({ token, username });
    fetchProfile(token);
  };

  const logout = () => {
    ['token', 'username', 'userRole', 'userMfa'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setUser(null);
    setUserRole('USER');
    setUserMfa(false);
  };

  const refreshProfile = () => {
    if (user?.token) fetchProfile(user.token);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, userRole, userMfa, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
