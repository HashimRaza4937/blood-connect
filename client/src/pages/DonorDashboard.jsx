import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DonorCertificateModal } from '../components/DonorCertificateModal';
import { 
  Heart, 
  Award, 
  Calendar, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  Building2, 
  AlertCircle, 
  FileCheck2, 
  Droplet,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const DonorDashboard = () => {
  const { user, showToast, refreshUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New donation form
  const [selectedBankId, setSelectedBankId] = useState('');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [slipNumber, setSlipNumber] = useState(`GCBB-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('Voluntary blood donation for community emergency pool.');
  const [submitting, setSubmitting] = useState(false);

  // Modal
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchData = async () => {
    try {
      const [donRes, bankRes] = await Promise.all([
        api.donations.getMy(),
        api.bloodbanks.getAll()
      ]);
      if (donRes.success) setDonations(donRes.donations);
      if (bankRes.success) {
        setBanks(bankRes.bloodBanks);
        if (bankRes.bloodBanks.length > 0 && !selectedBankId) {
          setSelectedBankId(bankRes.bloodBanks[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!selectedBankId) {
      showToast('Please select a blood bank', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.donations.submit({
        bloodBankId: selectedBankId,
        bloodGroup,
        units: 1,
        donationDate,
        slipNumber,
        notes
      });

      if (res.success) {
        showToast('Donation submitted! Blood Bank will now review and verify into free stock.', 'success');
        setSlipNumber(`GCBB-2026-${Math.floor(100 + Math.random() * 900)}`);
        await fetchData();
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Eligibility Calculation: 90 days between donations
  const calculateEligibility = () => {
    if (!user?.lastDonationDate) return { eligible: true, daysLeft: 0, percent: 100 };
    const lastDate = new Date(user.lastDonationDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 90 - diffDays);
    const percent = Math.min(100, Math.round((diffDays / 90) * 100));
    return {
      eligible: daysLeft === 0,
      daysLeft,
      diffDays,
      percent
    };
  };

  const eligibility = calculateEligibility();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Donor Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-rose-700/50">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>Voluntary Donor Portal • Ghotki Chapter</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Voluntary Donor'}
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl leading-relaxed">
            Record your voluntary donations at registered blood banks in Ghotki, track verification statuses, and download your official Life Saver recognition certificate.
          </p>
        </div>

        {/* Quick Certificate View Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              setSelectedDonation(donations.find(d => d.status === 'verified') || donations[0]);
              setShowCertificate(true);
            }}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Award className="w-4 h-4" />
            <span>View Donor Certificate</span>
          </button>
        </div>
      </div>

      {/* Donor Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Blood Group */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-black">
            {user?.bloodGroup || 'O+'}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Blood Type
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              Voluntary Donor
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Ghotki, Sindh</div>
          </div>
        </div>

        {/* Total Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-black">
            {user?.totalDonations || donations.length || 4}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Recorded Donations
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              Verified Units
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Free pool contributor</div>
          </div>
        </div>

        {/* Lives Saved Estimate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-black">
            {(user?.totalDonations || 4) * 3}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Estimated Impact
            </div>
            <div className="text-base font-extrabold text-emerald-700 mt-0.5">
              Lives Saved
            </div>
            <div className="text-[11px] text-slate-500 font-medium">1 unit aids up to 3 patients</div>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-600">Donation Eligibility</span>
            <span className={`font-extrabold ${eligibility.eligible ? 'text-emerald-600' : 'text-amber-600'}`}>
              {eligibility.eligible ? 'Ready to Donate!' : `${eligibility.daysLeft}d recovery`}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                eligibility.eligible ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${eligibility.percent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Interval: 90 days</span>
            <span>Last: {user?.lastDonationDate || '2026-08-15'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Record Donation vs History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Workflow B Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
              Workflow B
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Record a Blood Donation
            </h3>
            <p className="text-xs text-slate-500">
              Did you donate blood at a registered blood center? Submit your record so the bank can verify and add your unit to the free availability pool!
            </p>
          </div>

          <form onSubmit={handleSubmitDonation} className="space-y-4 text-xs">
            {/* Select Blood Bank */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Blood Bank Where Donated *
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
              >
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Group & Units */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Blood Group Donated
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                >
                  {['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Units (Standard: 1)
                </label>
                <input
                  type="number"
                  readOnly
                  value="1"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Date & Slip Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Donation Date
                </label>
                <input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Bank Slip / Token #
                </label>
                <input
                  type="text"
                  value={slipNumber}
                  onChange={(e) => setSlipNumber(e.target.value)}
                  placeholder="e.g. GCBB-2026-904"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Donation Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Medical screening comments or counter details"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Record...' : 'Submit Donation to Blood Bank'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Donation Records History */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                My Donation History
              </h3>
              <p className="text-xs text-slate-500">
                Track verification by blood bank laboratory officers.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {donations.length} Record(s)
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No donation records found yet. Submit your first donation using the form on the left!
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((don) => {
                const isVerified = don.status === 'verified';
                const isPending = don.status === 'pending';

                return (
                  <div
                    key={don._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all text-xs bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded text-xs">
                          {don.bloodGroup}
                        </span>
                        <span className="font-bold text-slate-900">{don.bloodBankName}</span>
                        <span className="text-slate-400">| Slip: {don.slipNumber}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{don.donationDate}</span>
                        </span>
                        <span>{don.units || 1} Unit Donated Free</span>
                      </div>
                      {don.notes && (
                        <div className="text-[11px] text-slate-600 italic">
                          "{don.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse-subtle'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{isVerified ? 'Verified Free Unit' : isPending ? 'Pending Bank Verification' : don.status}</span>
                      </span>

                      {isVerified && (
                        <button
                          onClick={() => {
                            setSelectedDonation(don);
                            setShowCertificate(true);
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <DonorCertificateModal
          donor={user}
          donation={selectedDonation}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
