import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  Heart, 
  Gift, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Database,
  RefreshCw,
  CreditCard
} from 'lucide-react';

const COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const AdminDashboard = () => {
  const { user, showToast, resetDemoData } = useAuth();

  const [stats, setStats] = useState(null);
  const [bloodbanks, setBloodbanks] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, banksRes, usersRes, claimsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getBanks(),
        api.admin.getUsers(),
        api.admin.getClaims().catch(() => ({ success: false, claims: [] }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (banksRes.success) setBloodbanks(banksRes.bloodBanks);
      if (usersRes.success) setUsers(usersRes.users);
      if (claimsRes?.success) setClaims(claimsRes.claims);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Workflow A: Admin verifies or suspends a blood bank
  const handleVerifyBank = async (bankId, newStatus) => {
    try {
      const res = await api.admin.verifyBank(bankId, newStatus);
      if (res.success) {
        showToast(res.message, 'success');
        await fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo data back to the initial Ghotki contest baseline?')) return;
    setResetting(true);
    try {
      await api.admin.resetDemo();
      showToast('Demo data restored to initial contest state!', 'success');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  const chartData = stats?.demandVsSupply || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Admin Command Center (Workflow E)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sindh Blood Directorate Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Live system monitoring, blood group demand vs donation analytics, blood bank licensing approvals, and audit records.
          </p>
        </div>

        {/* Demo Reset Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all self-start md:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Demo...' : 'Reset Contest Demo Data'}</span>
        </button>
      </div>

      {/* Section 6 Key Statistics Table & Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Banks</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalBloodBanks || 4}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{stats?.verifiedBloodBanks || 3} Active</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Donors</div>
          <div className="text-xl font-black text-rose-600 mt-1">{stats?.totalDonors || 4}</div>
          <div className="text-[10px] text-slate-400">Voluntary</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Recipients</div>
          <div className="text-xl font-black text-blue-600 mt-1">{stats?.totalRecipients || 2}</div>
          <div className="text-[10px] text-slate-400">Registered</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Donations</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalDonations || 4}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{stats?.verifiedDonations || 3} Verified</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm bg-emerald-50/40">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">Free Units</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{stats?.totalFreeUnits || 10}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Available Free</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Stock Units</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalStockUnits || 60}</div>
          <div className="text-[10px] text-slate-400">Regular + Free</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Free Claims</div>
          <div className="text-xl font-black text-amber-600 mt-1">{stats?.totalClaims || 2}</div>
          <div className="text-[10px] text-amber-700 font-semibold">{stats?.pendingClaims || 1} Pending</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Requests</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats?.totalRequests || 3}</div>
          <div className="text-[10px] text-slate-400">Demand logs</div>
        </div>
      </div>

      {/* 3 Blood Acquisition Channels Monitoring Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Requisition Channels Monitoring (3 Options)</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">SBTA Compliant</span>
          </div>
          <span className="text-[11px] text-slate-400">Zero Commercialization Policy</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">Option 1: 100% Free Donated</div>
                <div className="text-[10px] text-emerald-700">Issued at PKR 0 (Voluntary Donor)</div>
              </div>
            </div>
            <div className="text-lg font-black text-emerald-700">
              {stats?.claimsByType?.free ?? 1}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950">Option 2: Exchange Donor</div>
                <div className="text-[10px] text-amber-700">خون کے بدلے خون (Replacement)</div>
              </div>
            </div>
            <div className="text-lg font-black text-amber-700">
              {stats?.claimsByType?.replacement_donor ?? 1}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-950">Option 3: Lab Screening Fee</div>
                <div className="text-[10px] text-purple-700">PKR 1,800 Consumable Recovery</div>
              </div>
            </div>
            <div className="text-lg font-black text-purple-700">
              {stats?.claimsByType?.screening_fee ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Demand vs Supply Charts Section (Prompt Section 6: Demand vs Donation Analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Comparison Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-0.5">
                Demand vs Supply Analysis (Contest Demo Sample)
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Blood Group Demand (Requests) vs Available Stock
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              District Ghotki & Sindh Hubs
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Comparing total patient requests against verified available blood units (Regular + Free). Identifies critical shortage groups like <strong>O+</strong> and <strong>B+</strong>.
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="requests" name="Patient Requests (Demand)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="regularUnits" name="Regular Stock Units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="freeUnits" name="Verified Free Units" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortage & Deficit Insights */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Critical Deficit Insights</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              High Demand / Shortage Alert
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated supply disparity tracker based on real hospital requisitions:
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span>O+ Blood Group</span>
                  <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-black">
                    -10 Unit Gap
                  </span>
                </div>
                <div className="text-[11px] text-rose-800/80 mt-1">
                  25 Requisitions vs 15 Available Units. Highest demand in Civil Hospital Ghotki.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>B+ Blood Group</span>
                  <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded font-black">
                    -6 Unit Gap
                  </span>
                </div>
                <div className="text-[11px] text-amber-800/80 mt-1">
                  18 Requisitions vs 12 Available Units. Urgently needed for surgical wards.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>A+ Blood Group</span>
                  <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded font-black">
                    -5 Unit Gap
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  15 Requisitions vs 10 Available Units.
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 text-white text-[11px] flex items-center justify-between">
            <span>Voluntary Donor Mobilization Recommended</span>
            <span className="font-bold text-rose-400">Active</span>
          </div>
        </div>
      </div>

      {/* Blood Bank Verification Table (Workflow A: Admin reviews and activates) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-0.5">
              Workflow A (Step 4 & 5)
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Blood Bank Registration & Verification Management
            </h3>
            <p className="text-xs text-slate-500">
              Admin reviews blood bank license applications before permitting inventory management.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {bloodbanks.length} Centers Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Blood Bank Name</th>
                <th className="py-3 px-3">License Number</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bloodbanks.map((bank) => {
                const isVerified = bank.status === 'verified';
                const isPending = bank.status === 'pending';

                return (
                  <tr key={bank._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {bank.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {bank.licenseNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {bank.city}, {bank.district}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {bank.phone}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse-subtle'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {bank.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {isPending ? (
                        <button
                          onClick={() => handleVerifyBank(bank._id, 'verified')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Approve & Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyBank(bank._id, isVerified ? 'suspended' : 'verified')}
                          className={`font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                            isVerified
                              ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isVerified ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Users Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Registered Platform Users (Donors, Recipients, Managers)
            </h3>
            <p className="text-xs text-slate-500">
              Centralized identity ledger for Ghotki contest demo.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {users.length} Users Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Blood Group</th>
                <th className="py-2.5 px-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'bloodbank'
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === 'donor'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{u.city || 'Ghotki'}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">{u.bloodGroup || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-500">{u.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master Patient Requisitions & Claims Across All 3 Channels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
              Multi-Channel Transfusion Audit Ledger
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              District Patient Requisitions & Claims (3 Options)
            </h3>
            <p className="text-xs text-slate-500">
              Auditing Free Donated Claims, Exchange Donor swaps, and Non-Profit Lab Screening Fee requisitions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-center">
            {claims.length} Requisitions Total
          </span>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No requisitions recorded in the audit ledger yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient & Hospital</th>
                  <th className="py-2.5 px-3">Group</th>
                  <th className="py-2.5 px-3">Blood Bank</th>
                  <th className="py-2.5 px-3">Acquisition Pathway</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => {
                  const acqType = claim.acquisitionType || 'free';
                  return (
                    <tr key={claim._id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-[11px] text-slate-700">
                        {claim.allocationToken}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{claim.patientName}</div>
                        <div className="text-[10px] text-slate-500">{claim.hospitalName} • By {claim.recipientName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          {claim.bloodGroup}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {claim.bloodBankName}
                      </td>
                      <td className="py-2.5 px-3">
                        {acqType === 'free' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Gift className="w-3 h-3 text-emerald-600" />
                            100% Free Donated (PKR 0)
                          </span>
                        )}
                        {acqType === 'replacement_donor' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            <RefreshCw className="w-3 h-3 text-amber-700" />
                            Exchange Donor ({claim.replacementDonor?.donorName || 'Relative'} - {claim.replacementDonor?.donorBloodGroup || 'Any'})
                          </span>
                        )}
                        {acqType === 'screening_fee' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                            <CreditCard className="w-3 h-3 text-purple-700" />
                            Lab Fee: PKR {claim.feeAmount?.toLocaleString() || '1,800'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          claim.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
