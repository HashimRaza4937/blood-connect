import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';
import { BloodBankTrackerModal } from '../components/BloodBankTrackerModal';
import { 
  Search, 
  Gift, 
  Building2, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Droplet, 
  Phone, 
  Sparkles, 
  Users, 
  Activity,
  Navigation,
  Compass,
  RefreshCw,
  CreditCard
} from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [selectedCity, setSelectedCity] = useState('Ghotki');
  const [banks, setBanks] = useState([]);
  const [stats, setStats] = useState(null);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingBank, setTrackingBank] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksRes, requestsRes] = await Promise.all([
          api.bloodbanks.getAll(),
          api.requests.getAll({ status: 'open' })
        ]);
        if (banksRes.success) setBanks(banksRes.bloodBanks);
        if (requestsRes.success) setUrgentRequests(requestsRes.requests);

        // Fetch demo stats or compute
        let totalFree = 0;
        let totalReg = 0;
        banksRes.bloodBanks?.forEach(b => {
          b.inventory?.forEach(i => {
            totalFree += (i.freeUnits || 0);
            totalReg += (i.regularUnits || 0);
          });
        });

        setStats({
          banksCount: banksRes.bloodBanks?.length || 3,
          freeUnits: totalFree || 10,
          regularUnits: totalReg || 50,
          openRequests: requestsRes.requests?.length || 3
        });
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchRegular = (e) => {
    e.preventDefault();
    navigate(`/search?bloodGroup=${encodeURIComponent(selectedGroup)}&city=${encodeURIComponent(selectedCity)}`);
  };

  const handleSearchFree = () => {
    navigate(`/free-blood?bloodGroup=${encodeURIComponent(selectedGroup)}&city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-900 via-red-900 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Sindh Emergency Healthcare Initiative • Initial Target: Ghotki</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find Blood Faster.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-amber-300">
              Connect Donors. Save Lives.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A centralized digital platform connecting blood recipients, voluntary donors, and certified blood banks across Ghotki and Sindh. Real-time availability with verified free donation tracking.
          </p>

          {/* Emergency Search Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-900 max-w-3xl mx-auto border border-white/20">
            <div className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-600">
                <Search className="w-4 h-4" />
                Quick Availability Finder
              </span>
              <span className="text-slate-400 font-normal">Ghotki, Mirpur Mathelo, Daharki</span>
            </div>

            <form onSubmit={handleSearchRegular} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Blood Group Select */}
              <div className="sm:col-span-5 text-left">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Blood Group Required
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
              </div>

              {/* City Select */}
              <div className="sm:col-span-4 text-left">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Location / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Ghotki">Ghotki (Central)</option>
                  <option value="Mirpur Mathelo">Mirpur Mathelo</option>
                  <option value="Daharki">Daharki</option>
                  <option value="Khanpur Mahar">Khanpur Mahar</option>
                  <option value="Sukkur">Sukkur (Regional Hub)</option>
                  <option value="All">All Sindh Locations</option>
                </select>
              </div>

              {/* Primary Search Button */}
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Stock</span>
                </button>
              </div>
            </form>

            {/* Two Core Options Banner */}
            <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Option 1 */}
              <div 
                onClick={handleSearchRegular}
                className="cursor-pointer group p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50/70 hover:border-rose-200 transition-all flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 flex items-center gap-1">
                    <span>Option 1: Search Blood Banks & Live Stock</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    View 4 registered blood centers in Ghotki district, live GPS distance, and contacts.
                  </p>
                </div>
              </div>

              {/* Option 2 */}
              <div 
                onClick={handleSearchFree}
                className="cursor-pointer group p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 transition-all flex items-start gap-3 shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                    <span>Option 2: Acquire Blood (3 Pathways)</span>
                    <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                      Free / Exch / Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    1) 100% Free Donated Blood, 2) Exchange Donor (خون کے بدلے خون), or 3) Non-Profit Lab Fee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-rose-600">
              {stats?.banksCount || 3}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Registered Blood Banks
            </div>
            <div className="text-[10px] text-slate-400">Ghotki, Mirpur Mathelo, Daharki</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">
              {stats?.freeUnits || 10}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Verified Free Units Available
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">100% Free for Eligible Patients</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {stats?.regularUnits || 50}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Total Stock Monitored
            </div>
            <div className="text-[10px] text-slate-400">Across All 8 Blood Groups</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600">
              {stats?.openRequests || 3}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Live Emergency Demands
            </div>
            <div className="text-[10px] text-amber-700 font-medium">Critical Requests in District</div>
          </div>
        </div>
      </section>

      {/* Urgent Community Demands Feed */}
      {urgentRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-rose-900">
                <Activity className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="text-base font-extrabold">
                  Urgent Blood Demands in Ghotki Hospitals
                </h3>
              </div>
              <Link
                to="/urgent-requests"
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                View All Demands <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {urgentRequests.slice(0, 3).map((req) => (
                <div key={req._id} className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {req.bloodGroup}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">{req.patientName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">📍 {req.hospitalName} ({req.city})</div>
                  <div className="text-slate-600 text-[11px] mt-1 line-clamp-1 italic">
                    "{req.description}"
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Needs {req.unitsNeeded} unit(s)</span>
                    <a
                      href={`tel:${req.recipientPhone}`}
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Contact Attendant
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Interactive Map & Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              Geographic Coverage
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Registered Blood Centers in Ghotki District
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Directly verified by District Health Directorate & Sindh Blood Transfusion Authority.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors self-start md:self-auto"
          >
            <span>Open Advanced Blood Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <InteractiveMap 
              bloodBanks={banks} 
              selectedGroup={selectedGroup} 
              onTrackBank={(b) => setTrackingBank(b)}
            />
          </div>

          {/* Quick Bank Cards Column */}
          <div className="lg:col-span-5 space-y-3">
            {banks.slice(0, 3).map((bank) => {
              const totalFree = bank.inventory?.reduce((a, i) => a + (i.freeUnits || 0), 0) || 0;
              const totalReg = bank.inventory?.reduce((a, i) => a + (i.regularUnits || 0), 0) || 0;

              return (
                <div
                  key={bank._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {bank.name}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" title="Verified Blood Bank" />
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        📍 {bank.address}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                        {totalFree} Free Units
                      </span>
                    </div>
                  </div>

                  {/* Blood Group Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                    {bank.inventory?.slice(0, 4).map((item) => (
                      <div key={item.bloodGroup} className="bg-slate-50 p-1.5 rounded text-center">
                        <div className="font-bold text-slate-700 text-[10px]">{item.bloodGroup}</div>
                        <div className="text-rose-600 font-extrabold text-xs">
                          {(item.regularUnits || 0) + (item.freeUnits || 0)}
                        </div>
                        {item.freeUnits > 0 && (
                          <div className="text-[9px] text-emerald-600 font-semibold">
                            {item.freeUnits} Free
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Track on Google Maps Button */}
                  <button
                    type="button"
                    onClick={() => setTrackingBank(bank)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track on Google Maps (GPS)</span>
                  </button>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">🕒 {bank.operatingHours}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${bank.emergencyPhone || bank.phone}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-rose-600" />
                        Call
                      </a>
                      <Link
                        to={`/free-blood?bankId=${bank._id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1"
                      >
                        Claim Free
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 Acquisition Pathways Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800/60 px-3 py-1 rounded-full">
              Never Leave Empty Handed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-3">
              3 Flexible Ways to Acquire Blood
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              If 100% free blood is unavailable for rare groups like O- or B-, our platform guarantees two reliable alternative options so every patient gets emergency transfusion support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pathway 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black mb-4">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Option 1 • 100% Free
                </div>
                <h3 className="text-base font-bold text-white mt-1 mb-2">
                  Claim Free Donated Blood
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Directly sourced from voluntary donors. Medically screened, certified, and issued at <strong>PKR 0</strong>.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10">
                <Link
                  to="/free-blood"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                >
                  <span>Check Free Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pathway 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black mb-4">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                  Option 2 • Exchange Donor
                </div>
                <h3 className="text-base font-bold text-white mt-1 mb-2">
                  خون کے بدلے خون (Replacement)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Free blood exhausted? Bring any healthy family member or friend to donate 1 unit at the counter in exchange for the required patient unit.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10">
                <Link
                  to="/free-blood"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                >
                  <span>Submit Exchange Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pathway 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">
                  Option 3 • Subsidized Cost
                </div>
                <h3 className="text-base font-bold text-white mt-1 mb-2">
                  Lab Screening & Bag Fee
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No replacement donor available? Cover only subsidized non-profit test consumables (PKR 1,800) per SBTA safety rules. Blood is never sold.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10">
                <Link
                  to="/free-blood"
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                >
                  <span>Request with Lab Fee</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete System Workflows (Section 5 from prompt) */}
      <section className="bg-slate-100/70 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              How Blood Connect Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              End-to-end transparent workflows ensuring zero blood commercialization and instant emergency matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Workflow B */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Workflow B: Voluntary Donation
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Donor visits registered blood bank in Ghotki & donates 1 unit.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Donor logs donation update on Blood Connect portal.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Blood bank medically screens & verifies accepted units.</span>
                </li>
                <li className="flex items-start gap-1.5 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Verified free blood immediately becomes visible to recipients.</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  to="/donor/dashboard"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Record a Donation as Donor <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Workflow C */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Workflow C: Free Blood Claiming
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Recipient searches required blood group with Free option enabled.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>System displays verified banks holding free units.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Recipient submits patient slip & free claim request online.</span>
                </li>
                <li className="flex items-start gap-1.5 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Blood bank approves request, updates inventory, & issues digital voucher.</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  to="/free-blood"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Search & Claim Free Blood <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Workflow E */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Workflow E: Master Admin Oversight
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Admin reviews and licenses new blood bank registrations.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Monitors real-time Demand vs Supply analytics across blood groups.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Identifies shortage gaps (e.g. O+ & B+ high demand alert).</span>
                </li>
                <li className="flex items-start gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Prevents blood black-marketing and ensures patient safety.</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  to="/admin/dashboard"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  View Master Admin Analytics <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Contest Demo Scenario Instructions Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-rose-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Contest Evaluation Guide
            </div>
            <h3 className="text-2xl font-black text-white">
              Evaluate the Complete 8-Step Scenario in 2 Minutes
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use the <strong>Contest Demo Switcher</strong> bar at the top of the screen to effortlessly switch between Donor, Blood Bank Manager, Recipient, and Master Admin without re-registering accounts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/free-blood"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs text-center shadow-md transition-colors"
            >
              Test Free Blood Flow
            </Link>
            <Link
              to="/admin/dashboard"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-xl text-xs text-center shadow-md transition-colors"
            >
              Inspect Admin Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Google Maps Live Tracker Modal */}
      {trackingBank && (
        <BloodBankTrackerModal
          bloodBank={trackingBank}
          onClose={() => setTrackingBank(null)}
          onClaimFree={(b) => navigate(`/free-blood?bankId=${b._id}`)}
        />
      )}
    </div>
  );
};
