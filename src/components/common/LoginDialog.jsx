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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-background-dark p-8 shadow-[0_30px_120px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1"></div>
          <div className="flex-1 flex flex-col items-center gap-3">
            <img
              src="/rcc2.png"
              alt="Reptilez Cycling Club logo"
              className="h-12 w-12 object-contain"
            />
            <h3 className="text-xl font-black tracking-tight text-white text-center whitespace-nowrap">Admin Login</h3>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              className="text-white/60 hover:text-white transition-colors -mt-1"
              onClick={onClose}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        
        {(error || info) && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              error
                ? 'bg-accent/20 border border-accent/50 text-white'
                : 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-100'
            }`}
          >
            {error || info}
          </div>
        )}
        
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/80">
              Username or Email
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="rounded-lg border border-primary/30 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/80">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-primary/30 bg-black/40 px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-primary/40 bg-transparent text-primary focus:ring-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-primary hover:text-white font-semibold"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-primary px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginDialog;

