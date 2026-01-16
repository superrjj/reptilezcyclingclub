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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl px-3 sm:px-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-black via-gray-900/95 to-black p-5 sm:p-6 md:p-8 shadow-[0_0_80px_rgba(0,255,0,0.15),0_40px_140px_rgba(0,0,0,0.9)] animate-[slideUp_0.4s_ease-out] relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 sm:mb-6 gap-3">
            <div className="flex-1"></div>
            <div className="flex-1 flex flex-col items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse"></div>
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,255,0,0.4)]"
                />
              </div>
              <div className="text-center">
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                className="text-white/60 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110 rounded-lg p-1 hover:bg-white/10"
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
              className={`mb-4 sm:mb-6 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium backdrop-blur-sm border-2 animate-[slideDown_0.3s_ease-out] ${
                error
                  ? 'bg-red-500/10 border-red-400/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : 'bg-emerald-500/10 border-emerald-400/50 text-emerald-200 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
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
          
          {/* Form */}
          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-white/90 flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg text-primary">person</span>
                Username or Email
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-primary/30 bg-black/50 backdrop-blur-sm px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-300 hover:border-primary/50 focus:bg-black/60"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-focus-within:from-primary/5 group-focus-within:via-primary/10 group-focus-within:to-primary/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            {/* Password Input */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-white/90 flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg text-primary">lock</span>
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-primary/30 bg-black/50 backdrop-blur-sm px-4 sm:px-5 py-3 sm:py-3.5 pr-12 sm:pr-14 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-300 hover:border-primary/50 focus:bg-black/60"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-focus-within:from-primary/5 group-focus-within:via-primary/10 group-focus-within:to-primary/5 transition-all duration-300 pointer-events-none"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-white/50 hover:text-primary transition-colors duration-300 rounded-lg hover:bg-white/5 p-1"
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
              <label className="flex items-center gap-2 sm:gap-2.5 text-white/80 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`size-4 sm:size-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                    rememberMe 
                      ? 'bg-primary border-primary shadow-[0_0_15px_rgba(0,255,0,0.4)]' 
                      : 'border-primary/40 bg-transparent group-hover:border-primary/70'
                  }`}>
                    {rememberMe && (
                      <span className="material-symbols-outlined text-white text-sm sm:text-base">check</span>
                    )}
                  </div>
                </div>
                <span className="whitespace-nowrap group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-primary hover:text-white font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors duration-300 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 sm:mt-3 rounded-xl bg-gradient-to-r from-primary via-green-500 to-primary px-5 sm:px-6 py-3 sm:py-3.5 text-center text-sm sm:text-base font-black uppercase tracking-wider text-black transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;

