import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await login(email.trim(), password);
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 pt-safe pb-safe"
      style={{ background: 'linear-gradient(145deg, #e8f0fe 0%, #f0f4ff 50%, #e3f2fd 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-64 h-64 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 180 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo lockup */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ClinicPromo</h1>
          <p className="text-sm text-gray-500 mt-1">Branded health content for your clinic</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-3xl p-8 shadow-xl shadow-brand-600/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                className="w-full h-12 px-4 rounded-xl bg-white/70 border border-white/60 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-white/70 border border-white/60 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600 transition"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="press-scale w-full h-12 rounded-xl bg-brand-600 text-white font-semibold text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 active:shadow-none transition-shadow"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Contact your admin to get access
        </p>
      </motion.div>
    </div>
  );
}
