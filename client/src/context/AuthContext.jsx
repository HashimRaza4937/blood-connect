import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bc_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadCurrentUser = async () => {
    const savedToken = localStorage.getItem('bc_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('bc_token');
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to load user with token:', err.message);
      localStorage.removeItem('bc_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('bc_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('bc_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Account registered successfully as ${res.user.role}!`);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('bc_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  // Instant Demo Switcher for contest judges
  const switchDemoRole = async (roleOrEmail) => {
    try {
      const isEmail = roleOrEmail.includes('@');
      const res = await api.auth.demoLogin(
        isEmail ? null : roleOrEmail,
        isEmail ? roleOrEmail : null
      );
      if (res.success && res.token) {
        localStorage.setItem('bc_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Switched Demo Persona: ${res.user.name} (${res.user.role.toUpperCase()})`, 'info');
        return res.user;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const resetDemoData = async () => {
    try {
      await api.admin.quickReset();
      showToast('Platform demo data reset to default Ghotki scenario!', 'success');
      await loadCurrentUser();
    } catch (err) {
      showToast('Error resetting demo: ' + err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        resetDemoData,
        showToast,
        refreshUser: loadCurrentUser
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 max-w-md px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-bounce-short transition-all">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              toast.type === 'error'
                ? 'bg-rose-500'
                : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-emerald-500'
            }`}
          />
          <div
            className={`flex-1 ${
              toast.type === 'error'
                ? 'text-rose-900 bg-rose-50 border-rose-200'
                : toast.type === 'info'
                ? 'text-blue-900 bg-blue-50 border-blue-200'
                : 'text-emerald-900 bg-emerald-50 border-emerald-200'
            }`}
          >
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-base font-bold leading-none"
          >
            &times;
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
