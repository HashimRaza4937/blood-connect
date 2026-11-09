import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClaimVoucherModal } from '../components/ClaimVoucherModal';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  Gift, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Hospital, 
  Building2, 
  AlertCircle,
  PlusCircle,
  Printer,
  Navigation,
  RefreshCw,
  CreditCard
} from 'lucide-react';

export const MyClaimsPage = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await api.claims.getMy();
      if (res.success) {
        setClaims(res.claims);
      }
    } catch (err) {
      console.error('Error fetching recipient claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              <span>Recipient Requisition Tracker</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Blood Requisitions & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status of submitted blood requests across all 3 options: Free Donated, Exchange Donor (خون کے بدلے خون), and Lab Screening Fee.
          </p>
        </div>

        <Link
          to="/free-blood"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Blood Requisition</span>
        </Link>
      </div>

      {/* Claims List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading requisitions...</div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Gift className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No blood requisitions found</h3>
            <p className="text-xs max-w-sm mx-auto">
              If you or a patient in Ghotki need blood, you can search blood banks and choose from 3 acquisition options (Free, Exchange Donor, or Lab Fee).
            </p>
            <Link
              to="/free-blood"
              className="inline-block bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Start Blood Requisition (3 Options)
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => {
              const isApproved = claim.status === 'approved';
              const isPending = claim.status === 'pending';
              const acqType = claim.acquisitionType || 'free';

              return (
                <div
                  key={claim._id}
                  className={`p-5 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isApproved ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-base text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                        {claim.bloodGroup}
                      </span>

                      {/* Pathway Badge */}
                      {acqType === 'free' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          100% Free Donated (PKR 0)
                        </span>
                      )}

                      {acqType === 'replacement_donor' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <RefreshCw className="w-3 h-3 text-amber-700" />
                          Exchange Donor (خون کے بدلے خون)
                        </span>
                      )}

                      {acqType === 'screening_fee' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                          <CreditCard className="w-3 h-3 text-purple-700" />
                          Lab Screening Fee (PKR {claim.feeAmount?.toLocaleString() || '1,800'})
                        </span>
                      )}

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Patient: {claim.patientName} {claim.patientAge ? `(${claim.patientAge} yrs)` : ''}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>🏢 Blood Bank: <strong>{claim.bloodBankName}</strong></div>
                      <div>📍 Hospital: <strong>{claim.hospitalName}</strong></div>
                      <div>🎫 Voucher Token: <strong className="font-mono text-rose-600">{claim.allocationToken}</strong></div>
                      <div>🕒 Submitted: {new Date(claim.createdAt).toLocaleDateString()}</div>
                      <div>
                        Urgency:{' '}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          claim.urgency === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {claim.urgency}
                        </span>
                      </div>
                    </div>

                    {acqType === 'replacement_donor' && claim.replacementDonor && (
                      <div className="bg-amber-100/70 p-2 rounded-xl text-amber-950 text-[11px] flex flex-wrap items-center gap-3">
                        <span><strong>Exchange Donor:</strong> {claim.replacementDonor.donorName} ({claim.replacementDonor.relationship || 'Relative'})</span>
                        <span>Group: <strong>{claim.replacementDonor.donorBloodGroup || 'Any'}</strong></span>
                        <span>Phone: <strong>{claim.replacementDonor.donorPhone}</strong></span>
                      </div>
                    )}

                    {acqType === 'screening_fee' && (
                      <div className="bg-purple-100/70 p-2 rounded-xl text-purple-950 text-[11px] flex flex-wrap items-center gap-3">
                        <span><strong>Subsidized Consumable Fee:</strong> PKR {claim.feeAmount?.toLocaleString() || '1,800'}</span>
                        <span>Method: <strong>{claim.paymentMethod === 'cash_at_counter' ? 'Pay at Blood Bank Counter' : 'Digital (EasyPaisa/JazzCash)'}</strong></span>
                      </div>
                    )}

                    {claim.bloodBankRemarks && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                        Blood Bank Note: {claim.bloodBankRemarks}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 animate-pulse-subtle'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{isApproved ? 'Approved for Collection' : isPending ? 'Pending Blood Bank Review' : claim.status}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(claim.bloodBankName + ', Ghotki, Sindh')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </a>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setShowVoucherModal(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Print Slip' : 'Tracking Voucher'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && selectedClaim && (
        <ClaimVoucherModal
          claim={selectedClaim}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </div>
  );
};
