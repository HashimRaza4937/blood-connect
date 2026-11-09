import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

const BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];
const CITIES = ['Ghotki', 'Mirpur Mathelo', 'Daharki', 'Khanpur Mahar', 'Ubauro', 'Sukkur'];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('donor'); // 'donor' | 'recipient' | 'bloodbank'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+92 3');
  const [city, setCity] = useState('Ghotki');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('68');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        city,
        bloodGroup: role === 'bloodbank' ? undefined : bloodGroup,
        age: role === 'donor' ? Number(age) : undefined,
        weight: role === 'donor' ? Number(weight) : undefined
      });

      if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'bloodbank') navigate('/bank/dashboard');
      else navigate('/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Create Blood Connect Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the Ghotki & Sindh Lifesaving Blood Network
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Role Selection Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
            Select Your Account Role *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                role === 'donor'
                  ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-xs ring-1 ring-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-5 h-5 mx-auto mb-1 ${role === 'donor' ? 'fill-rose-500 text-rose-500' : ''}`} />
              <div className="font-extrabold text-xs">Blood Donor</div>
              <div className="text-[10px] text-slate-400">Voluntary</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('recipient')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                role === 'recipient'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs ring-1 ring-emerald-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <div className="font-extrabold text-xs">Recipient</div>
              <div className="text-[10px] text-slate-400">Patient Family</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('bloodbank')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                role === 'bloodbank'
                  ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-xs ring-1 ring-blue-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="font-extrabold text-xs">Blood Bank</div>
              <div className="text-[10px] text-slate-400">Hospital/Lab</div>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asif Kalhoro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="text"
                required
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                City / District
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {role !== 'bloodbank' && (
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Additional Donor details */}
          {role === 'donor' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/60 rounded-xl border border-rose-200">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Age (18 - 65)
                </label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">
                  Weight in Kg (&gt; 50kg)
                </label>
                <input
                  type="number"
                  min="45"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500">
            By creating an account, you agree to Blood Connect's Voluntary Donation & Patient Privacy Guidelines. Blood Connect does not buy or sell blood.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 text-xs"
          >
            <span>{loading ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rose-600 hover:underline">
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
