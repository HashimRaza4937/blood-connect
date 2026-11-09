import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Droplet, 
  Search, 
  Gift, 
  Activity, 
  ShieldAlert, 
  Building2, 
  User, 
  LogOut, 
  Menu, 
  X,
  FileCheck2,
  HeartHandshake
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-8 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  Blood<span className="text-rose-600">Connect</span>
                </span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Ghotki, Sindh
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">
                Find Blood Faster • Save Lives
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/search')
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Blood Banks
            </Link>

            <Link
              to="/free-blood"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/free-blood')
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70'
              }`}
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Get Blood (3 Options)</span>
              <span className="bg-emerald-200/80 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse-subtle">
                Free / Exch / Fee
              </span>
            </Link>

            <Link
              to="/urgent-requests"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/urgent-requests')
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 text-rose-500" />
              Urgent Demands
            </Link>

            {/* Role-Specific Portal shortcuts */}
            {user?.role === 'donor' && (
              <Link
                to="/donor/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/donor/dashboard')
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                Donor Portal
              </Link>
            )}

            {user?.role === 'bloodbank' && (
              <Link
                to="/bank/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/bank/dashboard')
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                Bank Dashboard
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin/dashboard')
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Master Admin
              </Link>
            )}

            {user?.role === 'recipient' && (
              <Link
                to="/my-claims"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/my-claims')
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                My Claims & Slip
              </Link>
            )}
          </nav>

          {/* User profile / Auth buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 flex items-center justify-end gap-1">
                    <span className="capitalize text-rose-600 font-semibold">{user.role}</span>
                    {user.bloodGroup && (
                      <span className="bg-rose-100 text-rose-700 font-bold px-1 rounded text-[10px]">
                        {user.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Search Blood Banks
          </Link>
          <Link
            to="/free-blood"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50 flex items-center justify-between"
          >
            <span>Get Blood (3 Options)</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Free • Exchange • Fee
            </span>
          </Link>
          <Link
            to="/urgent-requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Urgent Demands
          </Link>

          {user?.role === 'donor' && (
            <Link
              to="/donor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
            >
              Donor Portal
            </Link>
          )}

          {user?.role === 'bloodbank' && (
            <Link
              to="/bank/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              Blood Bank Dashboard
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 hover:bg-amber-50"
            >
              Master Admin Dashboard
            </Link>
          )}

          {user?.role === 'recipient' && (
            <Link
              to="/my-claims"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
            >
              My Claims & Slip
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email} ({user.role})</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
