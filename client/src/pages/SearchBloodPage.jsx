import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';
import { BloodBankTrackerModal } from '../components/BloodBankTrackerModal';
import { calculateDistanceKm, getGoogleMapsDirUrl } from '../utils/distance';
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Gift, 
  Building2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Layers, 
  Map as MapIcon, 
  Navigation,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];
const CITIES = ['All', 'Ghotki', 'Mirpur Mathelo', 'Daharki', 'Khanpur Mahar', 'Sukkur'];

export const SearchBloodPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bloodGroup') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [freeOnly, setFreeOnly] = useState(searchParams.get('freeOnly') === 'true');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracking Modal State
  const [trackingBank, setTrackingBank] = useState(null);

  // User GPS coordinates for proximity sorting
  const [userCoords, setUserCoords] = useState({ lat: 28.0060, lng: 69.3160, isLiveGps: false });
  const [locatingUser, setLocatingUser] = useState(false);

  const fetchBanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.bloodbanks.getAll({
        bloodGroup: bloodGroup !== 'All' ? bloodGroup : undefined,
        city: city !== 'All' ? city : undefined,
        freeOnly: freeOnly || undefined,
        search: searchQuery || undefined
      });
      if (res.success) {
        let banksList = res.bloodBanks;
        // Calculate distance from user coordinates for each bank
        banksList = banksList.map(b => ({
          ...b,
          distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
        }));
        // Sort by distance if user has live GPS or by default
        banksList.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        setBloodBanks(banksList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [bloodGroup, city, freeOnly, userCoords]);

  // Handle Find Nearest by GPS
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLiveGps: true
        });
        setLocatingUser(false);
      },
      (err) => {
        alert('Could not access GPS. Using default Ghotki Civil Hospital location.');
        setLocatingUser(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBanks();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Live Blood Availability Finder
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Ghotki, Mirpur Mathelo, Daharki, Sindh
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Search Blood Banks & Track Location
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check real-time stock, track exact distance via Google Maps, and claim verified free units.
          </p>
        </div>

        {/* View Toggle & GPS Proximity Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleFindNearest}
            disabled={locatingUser}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              userCoords.isLiveGps
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Compass className={`w-4 h-4 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Detecting GPS...' : userCoords.isLiveGps ? 'Sorted by GPS Proximity' : 'Sort by Nearest to Me'}</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Easy-to-use Filter Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Blood Group Select */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Required Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === 'All' ? 'All Blood Groups' : `${bg} Blood Group`}
                </option>
              ))}
            </select>
          </div>

          {/* City Select */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              City / District
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Ghotki & Sindh' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Search by Name */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Blood Bank or Hospital Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Central, City Care, Al-Rehman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>

        {/* Free Blood Only Toggle */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="font-extrabold flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Show 100% Free Donated Blood Only (Option 2)</span>
            </span>
          </label>

          <span className="text-slate-500 text-xs">
            Found <strong>{bloodBanks.length}</strong> certified blood center(s)
          </span>
        </div>
      </div>

      {/* Main Content: Map or Cards */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <InteractiveMap 
            bloodBanks={bloodBanks} 
            selectedGroup={bloodGroup} 
            onTrackBank={(b) => setTrackingBank(b)}
          />
        </div>
      ) : (
        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <div className="inline-block w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs text-slate-500 font-semibold">Updating blood availability & distances...</div>
            </div>
          ) : bloodBanks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No blood banks match your search criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your location filter, selecting "All Blood Groups", or unchecking the "Free Only" box.
              </p>
              <button
                onClick={() => {
                  setBloodGroup('All');
                  setCity('All');
                  setFreeOnly(false);
                  setSearchQuery('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bloodBanks.map((bank) => {
                const totalRegular = bank.inventory?.reduce((a, i) => a + (i.regularUnits || 0), 0) || 0;
                const totalFree = bank.inventory?.reduce((a, i) => a + (i.freeUnits || 0), 0) || 0;

                let targetItem = null;
                if (bloodGroup !== 'All') {
                  targetItem = bank.inventory?.find(i => i.bloodGroup === bloodGroup.toUpperCase());
                }

                return (
                  <div
                    key={bank._id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-rose-300 transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar with Distance & Free Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              {bank.name}
                            </h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" title="SBTA Verified" />
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span>{bank.city}, Sindh</span>
                            {bank.distanceKm !== null && (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 ml-1">
                                {bank.distanceKm} km away
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
                          {totalFree} Free Units
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed mb-3">
                        📍 {bank.address}
                        {bank.landmark && (
                          <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                            Landmark: {bank.landmark}
                          </span>
                        )}
                      </p>

                      {/* Filtered Blood Group Highlight */}
                      {bloodGroup !== 'All' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-3 text-xs">
                          <div className="text-[10px] uppercase font-bold text-rose-700">
                            Available for {bloodGroup}:
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-sm text-slate-900">
                              {(targetItem?.regularUnits || 0) + (targetItem?.freeUnits || 0)} Units in Stock
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              {targetItem?.freeUnits || 0} Free Units
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Stock Breakdown Grid */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                          Stock Availability by Blood Group:
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                          {bank.inventory?.map((inv) => {
                            const isMatch = bloodGroup !== 'All' && inv.bloodGroup === bloodGroup.toUpperCase();
                            const total = (inv.regularUnits || 0) + (inv.freeUnits || 0);

                            return (
                              <div
                                key={inv.bloodGroup}
                                className={`p-1.5 rounded-xl border transition-all ${
                                  isMatch
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-700'
                                }`}
                              >
                                <div className={`font-black text-[10px] ${isMatch ? 'text-rose-100' : 'text-slate-500'}`}>
                                  {inv.bloodGroup}
                                </div>
                                <div className="font-extrabold text-xs">
                                  {total}
                                </div>
                                {inv.freeUnits > 0 && (
                                  <div className={`text-[8px] font-black ${isMatch ? 'text-emerald-200' : 'text-emerald-600'}`}>
                                    {inv.freeUnits} free
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions with Primary Google Map Tracker */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {/* Prominent Track on Google Maps Button */}
                      <button
                        type="button"
                        onClick={() => setTrackingBank(bank)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Track Location on Google Maps (GPS)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Blood Acquisition Button (Free, Exchange, or Fee) */}
                        <button
                          type="button"
                          onClick={() => {
                            const bgParam = bloodGroup !== 'All' ? bloodGroup : 'O+';
                            navigate(`/free-blood?bankId=${bank._id}&bloodGroup=${encodeURIComponent(bgParam)}`);
                          }}
                          className={`${
                            (targetItem?.freeUnits || 0) > 0 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'bg-rose-600 hover:bg-rose-700'
                          } text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>
                            {(targetItem?.freeUnits || 0) > 0 ? 'Claim Free Unit' : 'Get Blood (3 Options)'}
                          </span>
                        </button>

                        {/* Direct Call Button */}
                        <a
                          href={`tel:${bank.emergencyPhone || bank.phone}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-rose-400" />
                          <span>Call Bank</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Google Maps Live Tracker Modal */}
      {trackingBank && (
        <BloodBankTrackerModal
          bloodBank={trackingBank}
          onClose={() => setTrackingBank(null)}
          onClaimFree={(b) => {
            const bgParam = bloodGroup !== 'All' ? bloodGroup : 'O+';
            navigate(`/free-blood?bankId=${b._id}&bloodGroup=${encodeURIComponent(bgParam)}`);
          }}
        />
      )}
    </div>
  );
};
