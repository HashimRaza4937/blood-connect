import React from 'react';
import { X, Printer, Award, Droplet, Heart, CheckCircle2 } from 'lucide-react';

export const DonorCertificateModal = ({ donor, donation, onClose }) => {
  if (!donor) return null;

  const handlePrint = () => {
    window.print();
  };

  const donorName = donor.name || 'Voluntary Donor';
  const bloodGroup = donor.bloodGroup || donation?.bloodGroup || 'O+';
  const donationCount = donor.totalDonations || 1;
  const verifiedBank = donation?.bloodBankName || 'Ghotki Central Blood Bank';
  const dateStr = donation?.donationDate || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border-4 border-rose-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Frame */}
        <div className="border-2 border-rose-300 p-6 rounded-xl bg-gradient-to-b from-rose-50/50 via-white to-amber-50/30 text-center relative">
          {/* Top Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-200 mb-3">
            <Award className="w-9 h-9" />
          </div>

          <div className="text-[11px] font-extrabold uppercase tracking-widest text-rose-700">
            Government of Sindh • Blood Transfusion Authority Partner
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 mb-1 font-serif tracking-tight">
            Certificate of Life Saving Appreciation
          </h2>
          <p className="text-xs text-slate-500 italic max-w-md mx-auto mb-6">
            In recognition of selfless voluntary blood donation dedicated to saving human lives in Ghotki District and Sindh.
          </p>

          <div className="my-6">
            <span className="text-xs text-slate-400 uppercase tracking-wider">This honor is proudly conferred to</span>
            <div className="text-2xl font-black text-rose-900 underline decoration-rose-300 decoration-wavy underline-offset-8 mt-1">
              {donorName}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto bg-white p-3.5 rounded-xl border border-rose-100 shadow-sm text-xs mb-6">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Blood Group</div>
              <div className="text-base font-extrabold text-rose-600 mt-0.5">{bloodGroup}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Lifetime Donations</div>
              <div className="text-base font-extrabold text-slate-800 mt-0.5">{donationCount} Times</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Lives Impacted</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">~{donationCount * 3} Patients</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            "Whoever saves one life, it is as if he had saved mankind entirely." (Quran 5:32)
            <br />
            Verified at <strong>{verifiedBank}</strong> on <strong>{dateStr}</strong>.
          </p>

          {/* Signatures */}
          <div className="flex items-center justify-between border-t border-rose-200/80 pt-4 px-6 text-xs text-slate-500">
            <div className="text-center">
              <div className="font-serif italic font-bold text-slate-800">Dr. Asif Ali Channa</div>
              <div className="text-[10px] text-slate-400">Chief Lab Officer, Ghotki</div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Hero Donor</span>
            </div>
            <div className="text-center">
              <div className="font-serif italic font-bold text-slate-800">Prof. Tariq Mahar</div>
              <div className="text-[10px] text-slate-400">Sindh Blood Connect Directorate</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="no-print mt-5 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
