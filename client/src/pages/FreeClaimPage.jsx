import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClaimVoucherModal } from '../components/ClaimVoucherModal';
import { BloodBankTrackerModal } from '../components/BloodBankTrackerModal';
import { 
  Gift, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Hospital, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Heart,
  Navigation,
  RefreshCw,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

const GHOTKI_HOSPITALS = [
  'Civil Hospital Ghotki (Emergency Ward)',
  'THQ Hospital Mirpur Mathelo',
  'Al-Khidmat Hospital Daharki',
  'District Headquarter Hospital (DHQ) Ghotki',
  'Fatimid Thalassemia Center Partner Clinic',
  'Syed Thalassemia & Blood Foundation Ghotki'
];

export const FreeClaimPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const preselectedBankId = searchParams.get('bankId') || '';
  const preselectedGroup = searchParams.get('bloodGroup') || 'O-';
  const preselectedMode = searchParams.get('mode') || ''; // 'free' | 'exchange' | 'fee'

  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(preselectedBankId);
  const [bloodGroup, setBloodGroup] = useState(preselectedGroup);
  const [unitsNeeded, setUnitsNeeded] = useState(1);

  // 3 Acquisition Options: 'free' | 'replacement_donor' | 'screening_fee'
  const [acquisitionType, setAcquisitionType] = useState(
    preselectedMode === 'exchange' ? 'replacement_donor' : preselectedMode === 'fee' ? 'screening_fee' : 'free'
  );

  // Option 2: Replacement / Exchange Donor Details
  const [replacementDonorName, setReplacementDonorName] = useState('');
  const [replacementDonorPhone, setReplacementDonorPhone] = useState('+92 3');
  const [replacementDonorBloodGroup, setReplacementDonorBloodGroup] = useState('A+');
  const [replacementDonorRelation, setReplacementDonorRelation] = useState('Brother');
  const [donorPresentReady, setDonorPresentReady] = useState(true);

  // Option 3: Standard Lab Processing & Screening Fee Details
  const [paymentMethod, setPaymentMethod] = useState('counter_cash'); // 'counter_cash' | 'jazzcash' | 'easypaisa'

  // Patient Info
  const [patientName, setPatientName] = useState(user?.name ? `${user.name.split(' ')[0]}'s Patient` : '');
  const [patientAge, setPatientAge] = useState('32');
  const [hospitalName, setHospitalName] = useState(GHOTKI_HOSPITALS[0]);
  const [customHospital, setCustomHospital] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Ghulam Rasool Mahar');
  const [doctorPrescription, setDoctorPrescription] = useState('Requisition Ref #CHG-EMG-2026 for urgent transfusion');
  const [urgency, setUrgency] = useState('urgent');

  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all verified blood banks (both regular & free stock)
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.bloodbanks.getAll({ status: 'verified' });
        if (res.success) {
          setBanks(res.bloodBanks);
          if (!selectedBankId && res.bloodBanks.length > 0) {
            setSelectedBankId(res.bloodBanks[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching banks for requisition:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const selectedBank = banks.find(b => b._id === selectedBankId);
  const currentItem = selectedBank?.inventory?.find(i => i.bloodGroup === bloodGroup.toUpperCase());
  const freeUnitsForGroup = currentItem ? (currentItem.freeUnits || 0) : 0;
  const regularUnitsForGroup = currentItem ? (currentItem.regularUnits || 0) : 0;
  const totalUnitsAvailable = freeUnitsForGroup + regularUnitsForGroup;

  // Auto-switch away from 'free' if freeUnits is 0 and regular stock exists!
  useEffect(() => {
    if (freeUnitsForGroup === 0 && regularUnitsForGroup > 0 && acquisitionType === 'free') {
      setAcquisitionType('replacement_donor');
    }
  }, [freeUnitsForGroup, regularUnitsForGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in or use the Recipient Demo Switcher to submit', 'info');
      navigate('/login?redirect=/free-blood');
      return;
    }

    if (!selectedBankId) {
      showToast('Please select a blood bank', 'error');
      return;
    }

    if (!patientName.trim()) {
      showToast('Please enter patient name', 'error');
      return;
    }

    // Pathway 1 validation
    if (acquisitionType === 'free') {
      if (freeUnitsForGroup < unitsNeeded) {
        showToast(
          `Free stock not available for ${bloodGroup} (0 Free Units). Please select Option 2 (Give a Donor) or Option 3 (Pay Lab Fee).`,
          'error'
        );
        return;
      }
    } 
    // Pathway 2 & 3 validation
    else {
      if (totalUnitsAvailable < unitsNeeded) {
        showToast(
          `Insufficient stock of ${bloodGroup} at ${selectedBank?.name}. Total units available: ${totalUnitsAvailable}.`,
          'error'
        );
        return;
      }

      if (acquisitionType === 'replacement_donor') {
        if (!replacementDonorName.trim() || !replacementDonorBloodGroup) {
          showToast('Please provide the Replacement Donor name and blood group', 'error');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const finalHospital = hospitalName === 'Other' ? customHospital : hospitalName;

      const res = await api.claims.submit({
        bloodBankId: selectedBankId,
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        patientName,
        patientAge: Number(patientAge),
        hospitalName: finalHospital || 'Civil Hospital Ghotki',
        doctorName,
        doctorPrescription,
        urgency,
        acquisitionType,
        // Option 2 fields
        replacementDonorName: acquisitionType === 'replacement_donor' ? replacementDonorName : '',
        replacementDonorPhone: acquisitionType === 'replacement_donor' ? replacementDonorPhone : '',
        replacementDonorBloodGroup: acquisitionType === 'replacement_donor' ? replacementDonorBloodGroup : '',
        replacementDonorRelation: acquisitionType === 'replacement_donor' ? replacementDonorRelation : '',
        // Option 3 fields
        feeAmount: acquisitionType === 'screening_fee' ? Number(unitsNeeded) * 1800 : 0,
        paymentMethod: acquisitionType === 'screening_fee' ? paymentMethod : 'none'
      });

      if (res.success) {
        setSubmittedClaim(res.claim);
        setShowVoucherModal(true);
        showToast(res.message || 'Requisition registered successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Context */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-rose-500/30">
            <Gift className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Channel Blood Acquisition (3 Methods Available)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Acquire Required Blood Group
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Get your required blood group through 3 legal medical pathways: <strong>1) Free Donated Blood Claim</strong>, <strong>2) Exchange / Replacement Donor ("خون کے بدلے خون")</strong>, or <strong>3) Standard Non-Profit Lab Screening Fee</strong>.
          </p>
        </div>
      </div>

      {/* Success Notification if already submitted */}
      {submittedClaim && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-md text-emerald-950 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Blood Requisition Successfully Registered!
              </h3>
            </div>
            <span className="bg-emerald-700 text-white font-mono font-bold text-xs px-3 py-1 rounded-full self-start sm:self-auto">
              Token: {submittedClaim.allocationToken}
            </span>
          </div>

          <div className="text-xs text-emerald-900">
            Requisition for <strong>{submittedClaim.unitsNeeded} unit(s) of {submittedClaim.bloodGroup}</strong> at <strong>{submittedClaim.bloodBankName}</strong> has been created.
            {submittedClaim.acquisitionType === 'replacement_donor' && (
              <span className="block mt-1 font-semibold text-blue-900">
                🔄 Method: Exchange Donor — Bring <strong>{submittedClaim.replacementDonorName} ({submittedClaim.replacementDonorBloodGroup})</strong> with CNIC to the blood bank counter.
              </span>
            )}
            {submittedClaim.acquisitionType === 'screening_fee' && (
              <span className="block mt-1 font-semibold text-amber-900">
                💳 Method: Subsidized Lab Screening Fee (PKR {submittedClaim.feeAmount}) — Payable upon collection.
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setShowVoucherModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>View & Print Collection Slip</span>
            </button>
            <Link
              to="/my-claims"
              className="bg-white border border-emerald-300 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-100/60 transition-colors flex items-center gap-1.5"
            >
              Go to My Requisitions
            </Link>
          </div>
        </div>
      )}

      {/* Main Requisition Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Section 1: Blood Group & Bank Selection */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Step 1: Select Blood Bank & Required Blood Group
              </h3>
              <p className="text-xs text-slate-500">
                Check real-time stock availability in Ghotki District centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Blood Bank (Ghotki District)
                </label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                >
                  {banks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name} ({bank.city})
                    </option>
                  ))}
                </select>

                {selectedBank && (
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-500 truncate max-w-[200px]">📍 {selectedBank.address}</span>
                    <button
                      type="button"
                      onClick={() => setShowTrackerModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline ml-auto"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Track on Google Maps</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Blood Group Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Required Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Stock Status Indicator */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">
                  Current Stock at {selectedBank?.name}:
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {bloodGroup}: {totalUnitsAvailable} Units Total
                  </span>
                  <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                    freeUnitsForGroup > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {freeUnitsForGroup} Free Units
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black text-[11px]">
                    {regularUnitsForGroup} Regular Stock
                  </span>
                </div>
              </div>

              {freeUnitsForGroup === 0 && regularUnitsForGroup > 0 && (
                <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Free pool exhausted for {bloodGroup}. Choose Option 2 or 3 below!</span>
                </div>
              )}

              {totalUnitsAvailable === 0 && (
                <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>0 Units in stock. Please select another bank or broadcast emergency appeal.</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Choose 1 of 3 Acquisition Pathways */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Step 2: Choose How You Wish to Acquire This Blood
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select the option that best matches your situation.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Pathway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Free Claim */}
              <div
                onClick={() => {
                  if (freeUnitsForGroup > 0) setAcquisitionType('free');
                }}
                className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                  freeUnitsForGroup === 0
                    ? 'opacity-60 bg-slate-100 border-slate-200 cursor-not-allowed'
                    : acquisitionType === 'free'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-sm ring-2 ring-emerald-600 cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-emerald-300 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Gift className="w-4 h-4" />
                    </div>
                    {freeUnitsForGroup > 0 ? (
                      <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        {freeUnitsForGroup} Available
                      </span>
                    ) : (
                      <span className="bg-slate-300 text-slate-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                        0 Units
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Option 1: 100% Free Donated Blood
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Provided from verified voluntary donor pool. No blood charges or screening fees.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700">Cost: PKR 0</span>
                  <span className="text-[10px] text-slate-400">Prescription required</span>
                </div>
              </div>

              {/* Option 2: Exchange / Replacement Donor */}
              <div
                onClick={() => setAcquisitionType('replacement_donor')}
                className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  acquisitionType === 'replacement_donor'
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Exchange Donor
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Option 2: Exchange Donor
                  </h4>
                  <div className="text-[10px] font-bold text-blue-700 mt-0.5">
                    (خون کے بدلے خون)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Bring any healthy donor (relative/friend) to donate at counter in exchange for required {bloodGroup}.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-700">Give 1 Unit → Get 1 Unit</span>
                  <span className="text-[10px] text-slate-400">Any donor group</span>
                </div>
              </div>

              {/* Option 3: Standard Lab Processing Fee */}
              <div
                onClick={() => setAcquisitionType('screening_fee')}
                className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  acquisitionType === 'screening_fee'
                    ? 'bg-amber-50/80 border-amber-600 shadow-sm ring-2 ring-amber-600'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Lab Charges
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Option 3: Standard Lab Fee
                  </h4>
                  <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                    (سرکاری اسکریننگ فیس)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Pay standard non-profit lab screening & component charges (PKR 1,800/unit). No replacement donor needed.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-800">PKR 1,800 / Unit</span>
                  <span className="text-[10px] text-slate-400">Pay at counter</span>
                </div>
              </div>
            </div>

            {/* Conditional Details based on Selected Option */}

            {/* IF OPTION 2: Replacement Donor Form */}
            {acquisitionType === 'replacement_donor' && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Replacement / Exchange Donor Information</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  The blood bank requires 1 replacement donor to donate at the counter. The replacement donor can have <strong>any healthy blood group</strong> (e.g., A+, B+, O+), and you will receive your needed <strong>{bloodGroup}</strong> in return.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Replacement Donor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Farhan Ali Kalhoro"
                      value={replacementDonorName}
                      onChange={(e) => setReplacementDonorName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Replacement Donor Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+92 300 1234567"
                      value={replacementDonorPhone}
                      onChange={(e) => setReplacementDonorPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Donor's Blood Group (What will they donate?)
                    </label>
                    <select
                      value={replacementDonorBloodGroup}
                      onChange={(e) => setReplacementDonorBloodGroup(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                      <option value="Unknown">Not sure (Will test at bank counter)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Relationship to Patient
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Brother, Cousin, Colleague, Friend"
                      value={replacementDonorRelation}
                      onChange={(e) => setReplacementDonorRelation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] font-semibold text-blue-950">
                  <input
                    type="checkbox"
                    checked={donorPresentReady}
                    onChange={(e) => setDonorPresentReady(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Replacement donor is healthy (18-65y, &gt;50kg) and will visit the blood bank counter with original CNIC.</span>
                </label>
              </div>
            )}

            {/* IF OPTION 3: Standard Screening Fee Form */}
            {acquisitionType === 'screening_fee' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Standard Subsidized Screening Charges</span>
                  </div>
                  <span className="bg-amber-600 text-white font-mono px-2.5 py-0.5 rounded-lg text-xs">
                    PKR {unitsNeeded * 1800} Total
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 text-[11px] text-slate-700">
                  <div className="font-bold text-slate-900 text-xs">Official Fee Transparency Breakdown:</div>
                  <div className="flex justify-between">
                    <span>• 5-Marker Safety Screening (HIV, Hepatitis B/C, Syphilis, Malaria):</span>
                    <span className="font-bold">PKR 1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Major/Minor Cross-Matching & Blood Bag Kit:</span>
                    <span className="font-bold">PKR 600</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-extrabold text-slate-900">
                    <span>Total Subsidized Charges per Unit:</span>
                    <span>PKR 1,800</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic pt-1">
                    *Note: Under Sindh healthcare law, blood itself is non-saleable. This fee covers strictly verified laboratory screening reagents and medical consumables.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Payment Preference
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="counter_cash">💵 Pay at Blood Bank Counter upon Collection (Cash/Card)</option>
                    <option value="easypaisa">📱 EasyPaisa Online Transfer (Simulated Demo)</option>
                    <option value="jazzcash">📱 JazzCash Online Transfer (Simulated Demo)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Patient & Hospital Details */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Step 3: Patient & Hospital Information
              </h3>
              <p className="text-xs text-slate-500">
                Required for clinical cross-matching verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Imran Jamali"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Units Needed
                </label>
                <select
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-rose-500"
                >
                  <option value={1}>1 Unit (Standard)</option>
                  <option value={2}>2 Units</option>
                  <option value={3}>3 Units</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Hospital in Ghotki / Sindh *
                </label>
                <select
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 mb-2"
                >
                  {GHOTKI_HOSPITALS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                  <option value="Other">Other Hospital / Private Clinic</option>
                </select>

                {hospitalName === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter Clinic or Hospital Name & Location"
                    value={customHospital}
                    onChange={(e) => setCustomHospital(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Attending Doctor / Consultant
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Ghulam Rasool Mahar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-rose-500"
                >
                  <option value="critical">🔴 Critical / Emergency OT (Immediate)</option>
                  <option value="urgent">🟠 Urgent (Within 12 Hours)</option>
                  <option value="normal">🟢 Scheduled / Routine Transfusion</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Doctor Prescription / Hospital Slip Reference
                </label>
                <textarea
                  rows={2}
                  value={doctorPrescription}
                  onChange={(e) => setDoctorPrescription(e.target.value)}
                  placeholder="Slip reference, diagnosis, or clinical notes"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Compliance Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">
                Sindh Blood Transfusion Authority (SBTA) Legal Compliance
              </div>
              <p className="mt-0.5">
                Blood Connect strictly complies with medical safety standards. Any selected lab screening fee represents standard laboratory consumable tests. Replacement donors must undergo cross-match screening at the counter.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/search"
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Blood Banks
            </Link>

            <button
              type="submit"
              disabled={submitting || totalUnitsAvailable === 0}
              className={`font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all ${
                totalUnitsAvailable === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : acquisitionType === 'free'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : acquisitionType === 'replacement_donor'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {submitting ? (
                <>Submitting Requisition...</>
              ) : (
                <>
                  {acquisitionType === 'free' && <Gift className="w-4 h-4" />}
                  {acquisitionType === 'replacement_donor' && <RefreshCw className="w-4 h-4" />}
                  {acquisitionType === 'screening_fee' && <CreditCard className="w-4 h-4" />}
                  <span>
                    {acquisitionType === 'free' && 'Submit Free Blood Claim (PKR 0)'}
                    {acquisitionType === 'replacement_donor' && 'Submit Exchange Donor Requisition'}
                    {acquisitionType === 'screening_fee' && `Submit Requisition with Lab Fee (PKR ${unitsNeeded * 1800})`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && submittedClaim && (
        <ClaimVoucherModal
          claim={submittedClaim}
          onClose={() => setShowVoucherModal(false)}
        />
      )}

      {/* Google Maps Live Tracker Modal */}
      {showTrackerModal && selectedBank && (
        <BloodBankTrackerModal
          bloodBank={selectedBank}
          onClose={() => setShowTrackerModal(false)}
        />
      )}
    </div>
  );
};
