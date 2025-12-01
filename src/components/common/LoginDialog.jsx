import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Admin credentials
const ADMIN_USERNAME = 'adminrcc';
const ADMIN_PASSWORD = 'rccadmin2020';

const LoginDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check admin credentials first
      if (formData.email === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
        // Admin login successful
        // Store admin session in localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', ADMIN_USERNAME);
        
        // Close dialog and reset form
        onClose();
        setFormData({ email: '', password: '' });
        
        // Reload page to update UI
        window.location.reload();
        return;
      }

      // If not admin, try Supabase authentication (if configured)
      const { data, error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        setError(signInError.message || 'Invalid username or password');
      } else if (data) {
        onClose();
        setFormData({ email: '', password: '' });
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
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
        
        {error && (
          <div className="mb-6 rounded-lg bg-accent/20 border border-accent/50 px-4 py-3 text-sm text-white">
            {error}
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
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-lg border border-primary/30 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
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

