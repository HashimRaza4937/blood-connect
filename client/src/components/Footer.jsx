import React from 'react';
import { Droplet, Phone, Shield, MapPin, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Blood<span className="text-rose-500">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Blood Availability, Free Donation & Blood Bank Management Platform. Connecting recipients, voluntary donors, and certified blood centers.
            </p>
            <div className="flex items-center text-xs text-rose-400 gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>Initial Focus: Ghotki, Sindh, Pakistan</span>
            </div>
            <div className="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded">
              Contest Prototype (Demo System)
            </div>
          </div>

          {/* Col 2: Core Workflows */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors">
                  • Search Nearby Blood Banks (Ghotki)
                </span>
              </li>
              <li>
                <span className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  • Free Donated Blood Verification (Workflow B)
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors">
                  • Online Free Blood Claiming (Workflow C)
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors">
                  • Real-time Inventory Management
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors">
                  • Master Admin Demand vs Supply Analytics
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency & Medical Notice */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Sindh Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Civil Hospital Ghotki: +92 723 681234</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rescue 1122 Sindh: 1122 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Edhi Ambulance Ghotki: 115</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Blood collection & transfusion must follow Sindh Blood Transfusion Authority (SBTA) safety standards.
              </div>
            </div>
          </div>

          {/* Col 4: Important Regulatory Note */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase mb-2">
              <Shield className="w-4 h-4" />
              <span>Important Medical Notice</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              The Blood Connect platform strictly complies with healthcare regulations: <strong className="text-white">This platform does not sell blood.</strong> Any applicable lab screening or processing charges follow government and hospital regulations.
            </p>
            <div className="text-[10px] text-slate-400">
              Vision: <span className="italic text-rose-300 font-semibold">"Find Blood Faster. Connect Donors. Save Lives."</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Blood Connect. Developed for Contest Demonstration. Sindh, Pakistan.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Targeting Ghotki, Sukkur, Larkana, Hyderabad & Karachi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
