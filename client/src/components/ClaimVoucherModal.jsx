import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Shield, 
  Droplet, 
  Building2, 
  Calendar, 
  User, 
  FileText, 
  Navigation, 
  ExternalLink,
  RefreshCw,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const ClaimVoucherModal = ({ claim, onClose }) => {
  if (!claim) return null;

  const handlePrint = () => {
    window.print();
  };

  const isApproved = claim.status === 'approved';
  const isExchange = claim.acquisitionType === 'replacement_donor';
  const isFee = claim.acquisitionType === 'screening_fee';
  const isFree = !isExchange && !isFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Voucher Header */}
        <div className="border-b-2 border-dashed border-slate-200 pb-5 mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mb-2">
            <Droplet className="w-6 h-6 fill-rose-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {isFree && 'Free Blood Allocation Voucher'}
            {isExchange && 'Exchange Donor Blood Requisition Voucher'}
            {isFee && 'Lab Screening Fee Blood Requisition Voucher'}
          </h3>
          <p className="text-xs text-slate-500">
            Blood Connect — Ghotki Emergency Network (Sindh, Pakistan)
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 border">
              <span>Token:</span>
              <span className="text-rose-600 font-mono text-sm font-black">{claim.allocationToken || 'BC-REQ-PENDING'}</span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {claim.status === 'approved' ? 'Approved for Collection' : 'Pending Verification'}
            </span>

            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              isExchange ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {isFree ? '100% Free Donated' : isExchange ? 'Exchange Donor' : 'Standard Lab Fee'}
            </span>
          </div>
        </div>

        {/* Voucher Body Details */}
        <div className="grid grid-cols-2 gap-3.5 text-xs mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <div className="text-slate-400 font-medium">Patient Name</div>
            <div className="font-extrabold text-slate-900 text-sm mt-0.5">{claim.patientName}</div>
            {claim.patientAge && <div className="text-slate-500">Age: {claim.patientAge} years</div>}
          </div>

          <div>
            <div className="text-slate-400 font-medium">Required Blood Group</div>
            <div className="font-black text-rose-600 text-base mt-0.5">
              {claim.bloodGroup} <span className="text-xs text-slate-600 font-normal">({claim.unitsNeeded || 1} Unit)</span>
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Allocating Blood Bank</div>
            <div className="font-bold text-slate-900 mt-0.5">{claim.bloodBankName}</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Hospital / Medical Center</div>
            <div className="font-semibold text-slate-800 mt-0.5">{claim.hospitalName}</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Doctor / Prescriber</div>
            <div className="text-slate-700 mt-0.5 font-medium">{claim.doctorName || 'Attending Physician'}</div>
            <div className="text-[10px] text-slate-500 truncate">{claim.doctorPrescription}</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Issue / Verification Date</div>
            <div className="text-slate-700 mt-0.5 font-medium">
              {new Date(claim.updatedAt || claim.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Method-Specific Highlight Box */}
        {isExchange && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl mb-4 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Exchange / Replacement Donor Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>Donor Name: <strong>{claim.replacementDonorName || 'Attendant Donor'}</strong></div>
              <div>Donor Group: <strong className="text-blue-700">{claim.replacementDonorBloodGroup || 'Any'}</strong></div>
              <div>Relationship: {claim.replacementDonorRelation || 'Relative'}</div>
              <div>Donor Phone: {claim.replacementDonorPhone || 'On File'}</div>
            </div>
            <p className="text-[10px] text-blue-700/90 pt-1">
              *The exchange donor must accompany attendants with original CNIC for extraction at counter.
            </p>
          </div>
        )}

        {isFee && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-4 text-xs text-amber-900 space-y-1">
            <div className="flex items-center justify-between font-extrabold">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Subsidized Laboratory Screening Charges Receipt</span>
              </div>
              <span className="font-mono text-sm font-black">PKR {claim.feeAmount || 1800}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span>Status: <strong className="text-amber-800">Payable at Blood Bank Counter (Cash/Card)</strong></span>
              <span>5-Marker NAT/ELISA Screening</span>
            </div>
          </div>
        )}

        {/* Status Instructions */}
        {isApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Allocation Approved by Blood Bank Laboratory</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Present this digital token / printed slip along with hospital requisition slip and cold-box at <strong>{claim.bloodBankName}</strong> counter for final cross-match handover.
            </p>
            {claim.bloodBankRemarks && (
              <div className="mt-1.5 text-[11px] bg-white p-2 rounded-xl border border-emerald-200 font-medium">
                Bank Note: {claim.bloodBankRemarks}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Pending Blood Bank Review & Verification</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your requisition has been dispatched to <strong>{claim.bloodBankName}</strong>. Once lab technicians review the request, this status will change to Approved.
            </p>
          </div>
        )}

        {/* Simulated Barcode */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 mb-4">
          <div className="text-[10px] text-slate-400">
            <div>Verification: Blood Connect Digital Registry</div>
            <div>SBTA Certified Non-Commercialization Protocol</div>
          </div>
          <div className="font-mono text-xs tracking-widest bg-slate-100 px-3 py-1 rounded border border-slate-300">
            |||| || | |||| ||| | |||
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(claim.bloodBankName + ', Ghotki, Sindh')}`}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate on Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
