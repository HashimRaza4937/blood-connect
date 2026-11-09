import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Share2, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Car, 
  Bike, 
  Compass, 
  CheckCircle2, 
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  calculateDistanceKm, 
  estimateTravelTime, 
  getGoogleMapsDirUrl, 
  getGoogleMapsSearchUrl, 
  getGoogleMapsEmbedUrl,
  GHOTKI_LANDMARKS 
} from '../utils/distance';

export const BloodBankTrackerModal = ({ bloodBank, onClose, onClaimFree }) => {
  if (!bloodBank) return null;

  // Default starting point: Civil Hospital Ghotki
  const [userLocation, setUserLocation] = useState({
    name: 'Civil Hospital Ghotki (Default)',
    lat: 28.0060,
    lng: 69.3160,
    isGps: false
  });
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mapType, setMapType] = useState('google'); // 'google' | 'street'

  const bankLat = bloodBank.latitude || 28.0065;
  const bankLng = bloodBank.longitude || 69.3168;

  // Calculate live distance & ETA
  const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, bankLat, bankLng);
  const travelTime = estimateTravelTime(distanceKm);

  // Detect real GPS location
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          name: 'My Current GPS Location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          isGps: true
        });
        setDetectingGps(false);
      },
      (error) => {
        setGpsError('Could not access GPS. Please check location permissions.');
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Google Maps navigation URL
  const googleMapsNavUrl = getGoogleMapsDirUrl(
    bankLat, 
    bankLng, 
    userLocation.lat, 
    userLocation.lng
  );

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `🚨 *Blood Connect Emergency Location*\n` +
      `🏥 *${bloodBank.name}*\n` +
      `📍 Address: ${bloodBank.address}\n` +
      `📌 Landmark: ${bloodBank.landmark || 'Near Civil Hospital'}\n` +
      `📞 Emergency Phone: ${bloodBank.emergencyPhone || bloodBank.phone}\n` +
      `🗺️ *Open in Google Maps for Navigation:* ${googleMapsNavUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Total available units
  const totalRegular = bloodBank.inventory?.reduce((a, i) => a + (i.regularUnits || 0), 0) || 0;
  const totalFree = bloodBank.inventory?.reduce((a, i) => a + (i.freeUnits || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-rose-900 via-red-800 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative flex-shrink-0">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Live Google Maps Navigation</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Center</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {bloodBank.name}
            </h2>
            <p className="text-xs text-rose-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>{bloodBank.address}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Live ETA & Distance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Distance from Starting Point
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-baseline gap-1 mt-0.5">
                  <span>{distanceKm !== null ? distanceKm : '—'}</span>
                  <span className="text-sm font-bold text-slate-300">Kilometers</span>
                </div>
              </div>

              {/* Estimated times */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Car className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Car / Ambulance</div>
                    <div className="font-extrabold text-white">{travelTime ? travelTime.car : '—'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Bike className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Bike / Rickshaw</div>
                    <div className="font-extrabold text-white">{travelTime ? travelTime.bike : '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Starting Point Selector / Live GPS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">From:</span>
                <select
                  value={userLocation.name}
                  onChange={(e) => {
                    const match = GHOTKI_LANDMARKS.find(l => l.name === e.target.value);
                    if (match) {
                      setUserLocation({ name: match.name, lat: match.lat, lng: match.lng, isGps: false });
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-rose-500 w-full sm:w-auto"
                >
                  <option value={userLocation.name}>{userLocation.name}</option>
                  {GHOTKI_LANDMARKS.map(l => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Compass className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'Locating GPS...' : 'Use My Live GPS'}</span>
              </button>
            </div>

            {gpsError && (
              <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Interactive Embedded Google Map View */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
            <div className="bg-slate-100 px-4 py-2 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Official Google Map Satellite & Street View</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Lat: {bankLat.toFixed(4)}, Lng: {bankLng.toFixed(4)}
              </span>
            </div>

            {/* Embedded Responsive Google Map */}
            <div className="w-full h-72 sm:h-80 bg-slate-200 relative">
              <iframe
                title={`Google Map - ${bloodBank.name}`}
                src={getGoogleMapsEmbedUrl(bankLat, bankLng, 15)}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 flex items-center justify-between">
              <span>📍 Landmark: <strong>{bloodBank.landmark || 'Main Road Landmark'}</strong></span>
              <span>🕒 {bloodBank.operatingHours}</span>
            </div>
          </div>

          {/* Stock Summary Snapshot */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-800">Available Blood Units at This Location:</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                {totalFree} Verified Free Units
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
              {bloodBank.inventory?.map(i => {
                const total = (i.regularUnits || 0) + (i.freeUnits || 0);
                return (
                  <div key={i.bloodGroup} className="bg-white p-1.5 rounded-lg border border-rose-100">
                    <div className="font-black text-rose-600 text-[11px]">{i.bloodGroup}</div>
                    <div className="text-xs font-bold text-slate-800">{total}</div>
                    {i.freeUnits > 0 && (
                      <div className="text-[8px] text-emerald-600 font-extrabold">{i.freeUnits} free</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Direct Phone Call */}
            <a
              href={`tel:${bloodBank.emergencyPhone || bloodBank.phone}`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Call Bank</span>
            </a>

            {/* Share WhatsApp */}
            <button
              type="button"
              onClick={shareViaWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Location</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Google Maps App */}
            <a
              href={googleMapsNavUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all animate-pulse-subtle"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Google Maps GPS</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            {onClaimFree && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onClaimFree(bloodBank);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-colors"
              >
                Acquire Blood (3 Options)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
