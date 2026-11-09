import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Building2, Heart, User, RotateCcw, Sparkles } from 'lucide-react';

export const DemoRoleBar = () => {
  const { user, switchDemoRole, resetDemoData } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-rose-900/50 shadow-md flex flex-wrap items-center justify-between gap-2 z-40 sticky top-0">
      <div className="flex items-center space-x-2">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Contest Demo Switcher
        </span>
        <span className="text-slate-300 hidden md:inline">
          Switch role instantly to test full workflows:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => switchDemoRole('admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
            user?.role === 'admin'
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-white/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Switch to Master Admin (Demand analytics, approve blood banks)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>👑 Master Admin</span>
        </button>

        <button
          onClick={() => switchDemoRole('bloodbank')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
            user?.role === 'bloodbank'
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-white/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Switch to Ghotki Central Blood Bank (Verify donations, allocate free units)"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-300" />
          <span>🏥 Blood Bank Manager</span>
        </button>

        <button
          onClick={() => switchDemoRole('donor')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
            user?.role === 'donor'
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-white/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Switch to Voluntary Donor (Submit donation records, view digital card)"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>🩸 Donor (O+)</span>
        </button>

        <button
          onClick={() => switchDemoRole('recipient')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
            user?.role === 'recipient'
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-white/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Switch to Recipient (Find free blood, submit free claim, claim voucher)"
        >
          <User className="w-3.5 h-3.5 text-emerald-300" />
          <span>🙋‍♂️ Recipient (Patient Family)</span>
        </button>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/90 hover:bg-rose-900/60 text-slate-300 hover:text-white border border-slate-700 transition-colors ml-1"
          title="Reset all demo records and stock to initial contest state"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>

      {user && (
        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700">
          <span className="text-slate-400">Active Persona:</span>
          <span className="font-semibold text-rose-300">{user.name}</span>
          <span className="bg-rose-900/60 text-rose-200 text-[10px] px-1.5 rounded uppercase font-bold">
            {user.role}
          </span>
        </div>
      )}
    </div>
  );
};
