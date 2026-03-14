import React, { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BASE = 'https://psgc.cloud/api';

/* ─── Searchable Combobox ─────────────────────────────────────────────── */
const SearchableSelect = ({ label, value, onChange, options, disabled, placeholder }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Sync display name when value changes externally (e.g. reset)
  const selectedOption = options.find((o) => o.code === value);
  const displayValue = selectedOption ? selectedOption.name : '';

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (opt) => {
    onChange(opt.code, opt.name);
    setOpen(false);
    setQuery('');
  };

  const handleInputClick = () => {
    if (!disabled) setOpen(true);
  };

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="text"
          readOnly={!open}
          value={open ? query : displayValue}
          placeholder={disabled ? placeholder : (displayValue || placeholder)}
          onClick={handleInputClick}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 pr-8 focus:border-reptilez-green-600 focus:ring-2 focus:ring-reptilez-green-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer truncate"
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400"
          onClick={handleInputClick}
        >
          <span className="material-symbols-outlined text-sm leading-none">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </span>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">No results found</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.code}
                  onMouseDown={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-reptilez-green-50 hover:text-reptilez-green-700 ${opt.code === value ? 'bg-reptilez-green-50 font-semibold text-reptilez-green-700' : 'text-gray-700'
                    }`}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Dialog ─────────────────────────────────────────────────────── */
const PublicAuthDialog = ({ open, onClose, onRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [provinces, setProvinces] = useState([]);
  const [cityMuns, setCityMuns] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCityMuns, setLoadingCityMuns] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const [provinceCode, setProvinceCode] = useState('');
  const [cityMunCode, setCityMunCode] = useState('');
  const [barangayCode, setBarangayCode] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [cityMunName, setCityMunName] = useState('');
  const [barangayName, setBarangayName] = useState('');

  const [form, setForm] = useState({ fullName: '', email: '' });

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(false);
    setForm({ fullName: '', email: '' });
    setProvinceCode(''); setCityMunCode(''); setBarangayCode('');
    setProvinceName(''); setCityMunName(''); setBarangayName('');
    setCityMuns([]); setBarangays([]);
  }, [open]);

  // Load provinces
  useEffect(() => {
    if (!open) return;
    setLoadingProvinces(true);
    fetch(`${BASE}/provinces`)
      .then((r) => r.json())
      .then((d) => setProvinces(Array.isArray(d) ? d.sort((a, b) => a.name.localeCompare(b.name)) : []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false));
  }, [open]);

  // Load cities/municipalities
  useEffect(() => {
    if (!provinceCode) { setCityMuns([]); setCityMunCode(''); setCityMunName(''); setBarangays([]); setBarangayCode(''); setBarangayName(''); return; }
    setLoadingCityMuns(true);
    setCityMuns([]); setCityMunCode(''); setCityMunName(''); setBarangays([]); setBarangayCode(''); setBarangayName('');
    fetch(`${BASE}/provinces/${provinceCode}/cities-municipalities`)
      .then((r) => r.json())
      .then((d) => setCityMuns(Array.isArray(d) ? d.sort((a, b) => a.name.localeCompare(b.name)) : []))
      .catch(() => setCityMuns([]))
      .finally(() => setLoadingCityMuns(false));
  }, [provinceCode]);

  // Load barangays
  useEffect(() => {
    if (!cityMunCode) { setBarangays([]); setBarangayCode(''); setBarangayName(''); return; }
    setLoadingBarangays(true);
    setBarangays([]); setBarangayCode(''); setBarangayName('');
    fetch(`${BASE}/cities-municipalities/${cityMunCode}/barangays`)
      .then((r) => r.json())
      .then((d) => setBarangays(Array.isArray(d) ? d.sort((a, b) => a.name.localeCompare(b.name)) : []))
      .catch(() => setBarangays([]))
      .finally(() => setLoadingBarangays(false));
  }, [cityMunCode]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!provinceCode || !cityMunCode || !barangayCode) {
      setError('Please complete all location fields.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError('Authentication service is unavailable.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id, full_name, brgy, municipality_or_city, province, email')
        .eq('email', form.email)
        .maybeSingle();

      if (existing) {
        localStorage.setItem('rcc-public-user', JSON.stringify(existing));
        onRegistered?.(existing);
        onClose();
        return;
      }

      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ id: newId, full_name: form.fullName, brgy: barangayName, municipality_or_city: cityMunName, province: provinceName, email: form.email })
        .select()
        .maybeSingle();

      if (error || !data) { setError(error?.message || 'Unable to create account.'); return; }

      localStorage.setItem('rcc-public-user', JSON.stringify(data));
      onRegistered?.(data);
      onClose();
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#111827]">Create account</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">You need an account to follow this page.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100" aria-label="Close dialog">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium border bg-red-50 border-red-200 text-red-700">{error}</div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none"
              placeholder="Juan Dela Cruz"
            />
          </div>

          {/* Province */}
          <SearchableSelect
            label="Province"
            value={provinceCode}
            onChange={(code, name) => { setProvinceCode(code); setProvinceName(name); }}
            options={provinces}
            disabled={loadingProvinces}
            placeholder={loadingProvinces ? 'Loading provinces…' : 'Select province'}
          />

          {/* Municipality / City */}
          <SearchableSelect
            label="Municipality / City"
            value={cityMunCode}
            onChange={(code, name) => { setCityMunCode(code); setCityMunName(name); }}
            options={cityMuns}
            disabled={!provinceCode || loadingCityMuns}
            placeholder={!provinceCode ? 'Select a province first' : loadingCityMuns ? 'Loading cities…' : 'Select municipality / city'}
          />

          {/* Barangay */}
          <SearchableSelect
            label="Barangay"
            value={barangayCode}
            onChange={(code, name) => { setBarangayCode(code); setBarangayName(name); }}
            options={barangays}
            disabled={!cityMunCode || loadingBarangays}
            placeholder={!cityMunCode ? 'Select a city / municipality first' : loadingBarangays ? 'Loading barangays…' : 'Select barangay'}
          />

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none"
              placeholder="you@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-reptilez-green-600 text-white text-sm font-semibold shadow-md hover:bg-reptilez-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicAuthDialog;
