import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  ExternalLink, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  Car
} from 'lucide-react';
import { getGoogleMapsDirUrl, getGoogleMapsEmbedUrl, calculateDistanceKm } from '../utils/distance';

export const InteractiveMap = ({ bloodBanks = [], selectedGroup = 'all', onSelectBank, onTrackBank }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [activeView, setActiveView] = useState('google'); // 'google' | 'leaflet'
  const [selectedBank, setSelectedBank] = useState(bloodBanks[0] || null);

  useEffect(() => {
    if (bloodBanks.length > 0 && !selectedBank) {
      setSelectedBank(bloodBanks[0]);
    }
  }, [bloodBanks]);

  // Leaflet initialization when activeView is 'leaflet'
  useEffect(() => {
    if (activeView !== 'leaflet' || !mapContainerRef.current) return;

    const initMap = () => {
      if (!window.L) return;

      const ghotkiLat = 28.0065;
      const ghotkiLng = 69.3168;

      if (!mapInstanceRef.current) {
        const map = window.L.map(mapContainerRef.current, {
          scrollWheelZoom: false
        }).setView([ghotkiLat, ghotkiLng], 11);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // Clear previous markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      bloodBanks.forEach((bank) => {
        const lat = bank.latitude || 28.0065;
        const lng = bank.longitude || 69.3168;

        const totalFree = bank.inventory?.reduce((a, i) => a + (i.freeUnits || 0), 0) || 0;
        const totalStock = bank.inventory?.reduce((a, i) => a + (i.regularUnits || 0) + (i.freeUnits || 0), 0) || 0;

        const markerHtml = `
          <div style="background-color: #dc2626; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.5); border: 2px solid white; font-weight: bold; font-size: 14px; cursor: pointer;">
            🩸
          </div>
        `;

        const customIcon = window.L.divIcon({
          className: 'bc-map-marker',
          html: markerHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });

        const popupHtml = `
          <div style="font-family: inherit; padding: 4px; min-width: 200px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${bank.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${bank.address}</div>
            <div style="background: #fff1f2; padding: 5px 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #fecdd3; font-size: 11px;">
              <strong style="color: #be123c;">${totalStock} Units in Stock</strong> (${totalFree} Free)
            </div>
            <button id="track-btn-${bank._id}" style="width: 100%; background: #2563eb; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer;">
              🧭 Track on Google Maps
            </button>
          </div>
        `;

        const marker = window.L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`track-btn-${bank._id}`);
          if (btn) {
            btn.onclick = () => {
              if (onTrackBank) onTrackBank(bank);
            };
          }
        });

        marker.on('click', () => {
          setSelectedBank(bank);
          if (onSelectBank) onSelectBank(bank);
        });

        markersRef.current.push(marker);
      });
    };

    if (window.L) {
      initMap();
    } else {
      const timer = setTimeout(initMap, 500);
      return () => clearTimeout(timer);
    }
  }, [activeView, bloodBanks]);

  const currentLat = selectedBank?.latitude || 28.0065;
  const currentLng = selectedBank?.longitude || 69.3168;
  const googleEmbedUrl = getGoogleMapsEmbedUrl(currentLat, currentLng, 14);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Top Map Toolbar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              Blood Bank Location & GPS Tracking Map
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Ghotki, Mirpur Mathelo, Daharki & Sindh Emergency Centers
            </p>
          </div>
        </div>

        {/* View Toggle (Google Maps vs Street Overview) */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveView('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Google Map View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('leaflet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'leaflet'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>District Street View</span>
          </button>
        </div>
      </div>

      {/* Blood Bank Selector Quick Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-slate-500 font-bold whitespace-nowrap text-[11px]">Select Blood Bank:</span>
          {bloodBanks.map((bank) => (
            <button
              key={bank._id}
              type="button"
              onClick={() => {
                setSelectedBank(bank);
                if (onSelectBank) onSelectBank(bank);
              }}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 text-[11px] ${
                selectedBank?._id === bank._id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{bank.name.replace('Blood Bank', '').replace('Blood Center', '')}</span>
              <span className="text-[10px] opacity-80">({bank.city})</span>
            </button>
          ))}
        </div>

        {selectedBank && (
          <button
            type="button"
            onClick={() => onTrackBank && onTrackBank(selectedBank)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Track on Google Maps</span>
          </button>
        )}
      </div>

      {/* Map Viewports */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100">
        {activeView === 'google' ? (
          <iframe
            title="Google Maps Blood Bank Tracker"
            src={googleEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Floating Quick Navigation Card */}
        {selectedBank && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs space-y-2 z-10">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs truncate">
                {selectedBank.name}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              📍 {selectedBank.address}
            </p>
            <div className="flex items-center justify-between pt-1 gap-2">
              <a
                href={getGoogleMapsDirUrl(selectedBank.latitude || 28.0065, selectedBank.longitude || 69.3168)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-1.5 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Open GPS</span>
              </a>
              <button
                type="button"
                onClick={() => onTrackBank && onTrackBank(selectedBank)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-center py-1.5 px-2 rounded-xl font-bold text-[11px]"
              >
                Full Route
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Landmark Distance Bar */}
      <div className="bg-slate-50 p-3 text-[11px] text-slate-600 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-rose-600" />
          <span>
            Current Location: <strong>{selectedBank?.name || 'Ghotki Central'}</strong> ({selectedBank?.city || 'Ghotki'}, Sindh)
          </span>
        </div>
        <div className="text-slate-400">
          Landmark: {selectedBank?.landmark || 'Opposite Civil Hospital'}
        </div>
      </div>
    </div>
  );
};
