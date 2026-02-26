import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const LoginDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rcc-remembered-email');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      // Supabase authentication (any user from Authentication > Users)
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError(signInError.message || 'Invalid username or password');
      } else if (data && data.user) {
        if (rememberMe) {
          localStorage.setItem('rcc-remembered-email', formData.email);
        } else {
          localStorage.removeItem('rcc-remembered-email');
        }

        // Simulate delay before proceeding
        await new Promise((resolve) => setTimeout(resolve, 2000));

        onClose();
        setFormData({ email: rememberMe ? formData.email : '', password: '' });
        setInfo('');
        // Any authenticated user can access admin dashboard
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');

    if (!formData.email) {
      setError('Enter your email first to reset your password.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError('Password reset is unavailable right now.');
      return;
    }

    try {
      await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin,
      });
      setInfo('Password reset link sent! Check your inbox.');
    } catch (resetError) {
      setError(resetError.message || 'Unable to send reset email. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 md:p-8 shadow-xl animate-[slideUp_0.4s_ease-out] relative overflow-hidden">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 sm:mb-6 gap-3">
            <div className="flex-1"></div>
            <div className="flex-1 flex flex-col items-center gap-3 sm:gap-4">
              <div className="relative">
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain relative z-10"
                />
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700 transition-all duration-300 rounded-lg p-1 hover:bg-gray-100"
                onClick={onClose}
                type="button"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
              </button>
            </div>
          </div>
          
          {/* Error/Info Messages */}
          {(error || info) && (
            <div
              className={`mb-4 sm:mb-6 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border animate-[slideDown_0.3s_ease-out] ${
                error
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg">
                  {error ? 'error' : 'check_circle'}
                </span>
                <span>{error || info}</span>
              </div>
            </div>
          )}
          
          {/* Form Login */}
          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg text-reptilez-green-600">person</span>
                Username or Email
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg text-reptilez-green-600">lock</span>
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 sm:px-5 py-3 sm:py-3.5 pr-12 sm:pr-14 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-reptilez-green-600 focus:ring-4 focus:ring-reptilez-green-100 focus:outline-none transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-gray-400 hover:text-reptilez-green-600 transition-colors duration-300 rounded-lg hover:bg-gray-50 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
              <label className="flex items-center gap-2 sm:gap-2.5 text-gray-700 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`size-4 sm:size-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                    rememberMe 
                      ? 'bg-reptilez-green-600 border-reptilez-green-600' 
                      : 'border-gray-300 bg-white group-hover:border-reptilez-green-400'
                  }`}>
                    {rememberMe && (
                      <span className="material-symbols-outlined text-white text-sm sm:text-base">check</span>
                    )}
                  </div>
                </div>
                <span className="whitespace-nowrap">Remember me</span>
              </label>
              <button
                type="button"
                className="text-reptilez-green-600 hover:text-reptilez-green-700 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors duration-300 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 sm:mt-3 rounded-xl bg-reptilez-green-600 px-5 sm:px-6 py-3 sm:py-3.5 text-center text-sm sm:text-base font-bold text-white transition-all duration-300 hover:bg-reptilez-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
