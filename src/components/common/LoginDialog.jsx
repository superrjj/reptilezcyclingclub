import React, { useState } from 'react';

const LoginDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: wire up auth later
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-background-light p-6 text-background-dark shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-black">Login to Reptilez</h3>
          <button
            className="text-sm font-semibold text-accent hover:text-black"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email or username and password to continue.
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
            Email or Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-accent hover:text-white"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginDialog;

