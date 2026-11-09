import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  PlusCircle, 
  Phone, 
  MapPin, 
  Hospital, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  User,
  Heart
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

export const UrgentDemandsPage = () => {
  const { user, showToast } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal / form for new emergency demand
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('Civil Hospital Ghotki');
  const [city, setCity] = useState('Ghotki');
  const [urgency, setUrgency] = useState('critical');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.requests.getAll({
        bloodGroup: selectedGroup !== 'All' ? selectedGroup : undefined,
        status: 'open'
      });
      if (res.success) setRequests(res.requests);
    } catch (err) {
      console.error('Error fetching emergency requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedGroup]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in or use the Recipient Demo Switcher to broadcast a request', 'info');
      return;
    }
    if (!patientName.trim()) {
      showToast('Please enter patient name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.requests.create({
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        patientName,
        hospitalName,
        city,
        urgency,
        description
      });
      if (res.success) {
        showToast('Emergency blood request broadcasted to donors!', 'success');
        setShowCreateModal(false);
        setPatientName('');
        setDescription('');
        await fetchRequests();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Real-Time Community SOS</span>
            </span>
            <span className="text-xs text-slate-500">Ghotki, Mirpur Mathelo, Daharki</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Urgent Hospital Blood Demands
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct patient emergency appeals. Voluntary donors can view hospital locations and contact attendants immediately.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Emergency Demand</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <span className="font-bold text-slate-500 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Blood Group:</span>
        </span>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            onClick={() => setSelectedGroup(bg)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedGroup === bg
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Demands Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading active demands...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active emergency appeals</h3>
          <p className="text-xs max-w-sm mx-auto">
            All current hospital requisitions in Ghotki are matched with blood bank stock.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                    {req.bloodGroup}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.urgency === 'critical'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.urgency}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Patient: {req.patientName}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>{req.hospitalName} ({req.city})</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                  "{req.description || 'Emergency blood required immediately. Please contact patient attendants.'}"
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Required Units</div>
                  <div className="font-extrabold text-slate-900">{req.unitsNeeded} Unit(s)</div>
                </div>

                <a
                  href={`tel:${req.recipientPhone}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Attendant</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to Post Emergency Demand */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                Post Urgent Blood Appeal
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast an emergency notice to donors in Ghotki and Sindh.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Blood Group Required
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    {['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asadullah Jamali"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Hospital in Ghotki
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    City / Town
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="Ghotki">Ghotki</option>
                    <option value="Mirpur Mathelo">Mirpur Mathelo</option>
                    <option value="Daharki">Daharki</option>
                    <option value="Sukkur">Sukkur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Emergency Details / Ward
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. ICU patient undergoing trauma surgery, urgently needs 2 bags"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow"
                >
                  {submitting ? 'Broadcasting...' : 'Publish Urgent Appeal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
