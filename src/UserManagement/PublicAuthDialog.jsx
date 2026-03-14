import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PublicAuthDialog = ({ open, onClose, defaultMode = 'register' }) => {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    homeAddress: '',
    contactNumber: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    setInfo('');
    setLoading(false);
  }, [open]);

  const title = useMemo(() => (mode === 'login' ? 'Log in' : 'Create account'), [mode]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setError('Authentication service is unavailable.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, home_address, contact_number, email, password')
          .eq('email', form.email)
          .eq('password', form.password)
          .maybeSingle();

        if (error || !data) {
          setError('Invalid email or password.');
          return;
        }

        // Save current public user in localStorage for follow feature
        try {
          localStorage.setItem('rcc-public-user', JSON.stringify(data));
        } catch {
          // ignore
        }

        onClose();
        window.location.reload();
        return;
      }

      // Register directly into user_profiles (no supabase.auth)
      const newId =
        typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: newId,
          full_name: form.fullName,
          home_address: form.homeAddress,
          contact_number: form.contactNumber,
          email: form.email,
          password: form.password,
        })
        .select()
        .maybeSingle();

      if (error || !data) {
        setError(error?.message || 'Unable to create account.');
        return;
      }

      try {
        localStorage.setItem('rcc-public-user', JSON.stringify(data));
      } catch {
        // ignore
      }

      onClose();
      window.location.reload();
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
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#111827]">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              You need an account to follow this page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {(error || info) && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium border ${
              error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {error || info}
          </div>
        )}

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Contact number</label>
                  <input
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none"
                    placeholder="09xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Home address</label>
                <input
                  name="homeAddress"
                  value={form.homeAddress}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none"
                  placeholder="Street, Barangay, City, Province"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-reptilez-green-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-reptilez-green-600 text-white text-sm font-semibold shadow-md hover:bg-reptilez-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          <div className="text-center text-xs sm:text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                No account yet?{' '}
                <button
                  type="button"
                  className="font-semibold text-reptilez-green-700 hover:underline"
                  onClick={() => setMode('register')}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-reptilez-green-700 hover:underline"
                  onClick={() => setMode('login')}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicAuthDialog;

