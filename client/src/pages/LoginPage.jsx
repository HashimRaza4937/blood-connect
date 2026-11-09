import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, ShieldCheck, Building2, Heart, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    await switchDemoRole(role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'bloodbank') navigate('/bank/dashboard');
    else if (role === 'donor') navigate('/donor/dashboard');
    else if (role === 'recipient') navigate('/free-blood');
    else navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Contest Demo Quick Sign-In */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 rounded-3xl shadow-xl border border-rose-900/50 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Contest Presentation 1-Click Login</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Click any role below to log in instantly with preloaded dummy data for Ghotki:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 font-bold transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-white">Master Admin</div>
              <div className="text-[9px] text-slate-400 font-normal">Prof. Tariq Mahar</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('bloodbank')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 font-bold transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-white">Blood Bank</div>
              <div className="text-[9px] text-slate-400 font-normal">Ghotki Central Bank</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('donor')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 font-bold transition-all flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <div>
              <div className="text-white">Donor (O+)</div>
              <div className="text-[9px] text-slate-400 font-normal">Bilal Kalhoro</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('recipient')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 font-bold transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-white">Recipient</div>
              <div className="text-[9px] text-slate-400 font-normal">Wahid Jamali</div>
            </div>
          </button>
        </div>
      </div>

      {/* Standard Email Login Form */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Log In to Blood Connect
          </h2>
          <p className="text-xs text-slate-500">
            Sindh's Centralized Emergency Blood Network
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@bloodconnect.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 text-xs"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-rose-600 hover:underline">
            Register as Donor or Recipient
          </Link>
        </div>
      </div>
    </div>
  );
};
