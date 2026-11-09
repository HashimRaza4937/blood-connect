import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClaimVoucherModal } from '../components/ClaimVoucherModal';
import { BloodBankTrackerModal } from '../components/BloodBankTrackerModal';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Gift, 
  FileCheck2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Save, 
  Clock, 
  Phone, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Navigation,
  RefreshCw,
  CreditCard,
  UserCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

export const BloodBankDashboard = () => {
  const { user, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'donations' | 'claims'
  const [bank, setBank] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingInv, setSavingInv] = useState(false);

  // Claim modal for printing
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);

  // Determine current bank ID:
  // If user has bloodBankId, use it. Otherwise use the default Ghotki Central Blood Bank!
  const currentBankId = user?.bloodBankId || 'bb_ghotki_central';

  const fetchBankData = async () => {
    try {
      const [bankRes, donRes, claimsRes] = await Promise.all([
        api.bloodbanks.getById(currentBankId),
        api.donations.getByBank(currentBankId),
        api.claims.getByBank(currentBankId)
      ]);

      if (bankRes.success) {
        setBank(bankRes.bloodBank);
        setInventory(bankRes.bloodBank.inventory || []);
      }
      if (donRes.success) setDonations(donRes.donations);
      if (claimsRes.success) setClaims(claimsRes.claims);
    } catch (err) {
      console.error('Error fetching blood bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, [user, currentBankId]);

  // Adjust local inventory before saving
  const handleAdjustInventory = (bloodGroup, field, delta) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.bloodGroup === bloodGroup) {
          const currentVal = item[field] || 0;
          return {
            ...item,
            [field]: Math.max(0, currentVal + delta)
          };
        }
        return item;
      })
    );
  };

  const handleSaveInventory = async () => {
    setSavingInv(true);
    try {
      const res = await api.bloodbanks.updateInventory(bank._id, inventory);
      if (res.success) {
        showToast('Blood inventory saved successfully!', 'success');
        setBank(res.bloodBank);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingInv(false);
    }
  };

  // Workflow B Step 8: Verify donor donation into free stock
  const handleVerifyDonation = async (donationId, status) => {
    try {
      const res = await api.donations.verify(
        donationId,
        status,
        status === 'verified' ? 'Medical screening passed. Unit added to free emergency reserve.' : 'Deferred due to clinical criteria.'
      );
      if (res.success) {
        showToast(res.message, 'success');
        await fetchBankData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Workflow C Step 8 & 10: Approve recipient free blood claim
  const handleUpdateClaimStatus = async (claimId, status) => {
    try {
      const res = await api.claims.updateStatus(
        claimId,
        status,
        status === 'approved' ? 'Approved for free allocation. Ready at counter.' : 'Could not approve.'
      );
      if (res.success) {
        showToast(res.message, 'success');
        await fetchBankData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const pendingClaims = claims.filter(c => c.status === 'pending');

  const totalRegular = inventory.reduce((a, i) => a + (i.regularUnits || 0), 0);
  const totalFree = inventory.reduce((a, i) => a + (i.freeUnits || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Bank Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Blood Bank Management Portal</span>
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified by SBTA</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {bank?.name || 'Ghotki Central Blood Bank'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{bank?.address || 'Civil Hospital Road, Ghotki, Sindh'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Emergency: {bank?.emergencyPhone || '+92 300 1234567'}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowTrackerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Preview Google Maps Route & Pin</span>
            </button>
          </div>
        </div>

        {/* Total Stock Badges */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 self-start md:self-auto">
          <div className="text-center px-3 border-r border-slate-200">
            <div className="text-xs text-slate-400 font-bold uppercase">Regular Stock</div>
            <div className="text-2xl font-black text-slate-900">{totalRegular}</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xs text-emerald-600 font-bold uppercase">Free Donated</div>
            <div className="text-2xl font-black text-emerald-600">{totalFree}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory Matrix ({totalRegular + totalFree} Units)</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'donations'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Donation Verifications (Workflow B)</span>
          {pendingDonations.length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingDonations.length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'claims'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Patient Requisitions & Claims</span>
          {pendingClaims.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingClaims.length} New
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Blood Group Inventory Controls
              </h3>
              <p className="text-xs text-slate-500">
                Manage Regular Hospital Stock and Verified Free Donated Units for all 8 blood groups.
              </p>
            </div>

            <button
              onClick={handleSaveInventory}
              disabled={savingInv}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{savingInv ? 'Saving Changes...' : 'Save All Inventory'}</span>
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOOD_GROUPS.map((bg) => {
              const item = inventory.find((i) => i.bloodGroup === bg) || {
                bloodGroup: bg,
                regularUnits: 0,
                freeUnits: 0
              };
              const isLowStock = (item.regularUnits + item.freeUnits) < 3;

              return (
                <div
                  key={bg}
                  className={`p-4 rounded-2xl border transition-all text-xs ${
                    isLowStock
                      ? 'bg-rose-50/60 border-rose-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-black text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                      {bg}
                    </span>
                    {isLowStock ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {(item.regularUnits || 0) + (item.freeUnits || 0)} Total Units
                      </span>
                    )}
                  </div>

                  {/* Regular Units Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Regular Stock</div>
                        <div className="text-sm font-extrabold text-slate-900">{item.regularUnits || 0} Units</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustInventory(bg, 'regularUnits', -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustInventory(bg, 'regularUnits', 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Free Units Controls */}
                    <div className="flex items-center justify-between bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          <span>Free Units</span>
                        </div>
                        <div className="text-sm font-extrabold text-emerald-900">{item.freeUnits || 0} Units</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustInventory(bg, 'freeUnits', -1)}
                          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustInventory(bg, 'freeUnits', 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING DONOR VERIFICATIONS (Workflow B) */}
      {activeTab === 'donations' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                Workflow B (Step 7 & 8)
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Donor Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                When a voluntary donor logs a donation at your center, medically verify and accept the units here. Verified units are automatically added to your Free Stock!
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {donations.length} Total Submissions
            </span>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No donation records submitted for this blood bank yet.
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((don) => {
                const isPending = don.status === 'pending';
                const isVerified = don.status === 'verified';

                return (
                  <div
                    key={don._id}
                    className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isPending ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-rose-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {don.bloodGroup}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">{don.donorName}</span>
                        <span className="text-slate-500 text-[11px]">📞 {don.donorPhone}</span>
                      </div>
                      <div className="text-slate-600 text-[11px] flex flex-wrap items-center gap-3">
                        <span>Slip/Token: <strong>{don.slipNumber}</strong></span>
                        <span>Date: <strong>{don.donationDate}</strong></span>
                        <span>Quantity: <strong>{don.units || 1} Free Unit</strong></span>
                      </div>
                      {don.notes && (
                        <div className="text-slate-500 italic text-[11px]">
                          Note: "{don.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleVerifyDonation(don._id, 'verified')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Medically Verify & Accept</span>
                          </button>
                          <button
                            onClick={() => handleVerifyDonation(don._id, 'rejected')}
                            className="bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified & Added to Free Pool</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BLOOD REQUISITIONS & CLAIMS MANAGEMENT (Workflow C) */}
      {activeTab === 'claims' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                Workflow C (Step 7 - 10) & 3 Acquisition Channels
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Patient Requisitions & Allocation Claims
              </h3>
              <p className="text-xs text-slate-500">
                Review recipient patient requisitions across all 3 options: Free Donated, Exchange Donor (خون کے بدلے خون), and Non-Profit Lab Screening Fee.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-center">
              {claims.length} Requisitions Total
            </span>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No recipient claims registered for this blood bank yet.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => {
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const acqType = claim.acquisitionType || 'free';

                return (
                  <div
                    key={claim._id}
                    className={`p-5 rounded-2xl border text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                      isPending ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                          {claim.bloodGroup}
                        </span>

                        {/* Acquisition Type Badge */}
                        {acqType === 'free' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Gift className="w-3 h-3 text-emerald-600" />
                            100% Free Donated Blood (PKR 0)
                          </span>
                        )}

                        {acqType === 'replacement_donor' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            <RefreshCw className="w-3 h-3 text-amber-700" />
                            Exchange / Replacement Donor (خون کے بدلے خون)
                          </span>
                        )}

                        {acqType === 'screening_fee' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                            <CreditCard className="w-3 h-3 text-purple-700" />
                            Lab Screening Fee: PKR {claim.feeAmount?.toLocaleString() || '1,800'}
                          </span>
                        )}

                        <span className="font-mono text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          Token: {claim.allocationToken}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 text-xs">
                        <span className="font-extrabold text-slate-900">
                          Patient: {claim.patientName} {claim.patientAge ? `(${claim.patientAge}y)` : ''}
                        </span>
                        <span>Hospital: <strong>{claim.hospitalName}</strong></span>
                        <span>Applicant: <strong>{claim.recipientName} ({claim.recipientPhone})</strong></span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          claim.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {claim.urgency} Urgency
                        </span>
                      </div>

                      {/* Channel-Specific Details */}
                      {acqType === 'replacement_donor' && claim.replacementDonor && (
                        <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-200 text-amber-950 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                            Replacement Donor:
                          </span>
                          <span><strong>{claim.replacementDonor.donorName}</strong> ({claim.replacementDonor.relationship || 'Relative'})</span>
                          <span>Group: <strong className="bg-white px-1.5 py-0.5 rounded border border-amber-300 text-rose-700">{claim.replacementDonor.donorBloodGroup || 'Any'}</strong></span>
                          <span>Phone: <strong>{claim.replacementDonor.donorPhone}</strong></span>
                          {claim.replacementDonor.donorCnic && (
                            <span>CNIC: {claim.replacementDonor.donorCnic}</span>
                          )}
                        </div>
                      )}

                      {acqType === 'screening_fee' && (
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-purple-950 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                            Fee Details:
                          </span>
                          <span>Subsidized Test Fee: <strong>PKR {claim.feeAmount?.toLocaleString() || '1,800'}</strong></span>
                          <span>Payment Method: <strong>{claim.paymentMethod === 'cash_at_counter' ? 'Cash at Collection Counter' : 'Digital (EasyPaisa/JazzCash)'}</strong></span>
                          <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                            SBTA Non-Profit Testing Fee
                          </span>
                        </div>
                      )}

                      {claim.doctorPrescription && (
                        <div className="text-slate-500 text-[11px] italic">
                          Prescription / Requisition Note: "{claim.doctorPrescription}" {claim.doctorName && `(Dr. ${claim.doctorName})`}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-end lg:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateClaimStatus(claim._id, 'approved')}
                            className={`text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors ${
                              acqType === 'replacement_donor'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : acqType === 'screening_fee'
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {acqType === 'replacement_donor' ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Accept Exchange & Allocate</span>
                              </>
                            ) : acqType === 'screening_fee' ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Confirm Fee & Allocate Unit</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Allocate Free Unit</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdateClaimStatus(claim._id, 'rejected')}
                            className="bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors text-center"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Allocated & Dispatched</span>
                          </span>
                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setShowVoucherModal(true);
                            }}
                            className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Voucher Slip
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Printable Voucher Modal */}
      {showVoucherModal && selectedClaim && (
        <ClaimVoucherModal
          claim={selectedClaim}
          onClose={() => setShowVoucherModal(false)}
        />
      )}

      {/* Google Maps Live Tracker Modal */}
      {showTrackerModal && bank && (
        <BloodBankTrackerModal
          bloodBank={bank}
          onClose={() => setShowTrackerModal(false)}
        />
      )}
    </div>
  );
};
