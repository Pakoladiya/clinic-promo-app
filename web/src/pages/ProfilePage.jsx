import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { getProfile, upsertProfile, uploadLogo } from '../services/profileService';

export default function ProfilePage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const fileRef      = useRef(null);

  const [clinicName, setClinicName] = useState('');
  const [clinicInfo, setClinicInfo] = useState('');
  const [logoUrl,    setLogoUrl]    = useState(null);
  const [logoFile,   setLogoFile]   = useState(null);  // pending upload
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState('');

  /* ── Load existing profile ──────────────────────── */
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) {
        setClinicName(p.clinicName || '');
        setClinicInfo(p.clinicInfo || '');
        setLogoUrl(p.logoUrl || null);
      }
      setLoading(false);
    });
  }, [user]);

  /* ── Logo preview selection ─────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));  // instant preview
  };

  /* ── Save ─────────────────────────────────────────  */
  const handleSave = async () => {
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        finalLogoUrl = await uploadLogo(user.uid, logoFile);
        setLogoFile(null);
      }

      await upsertProfile(user.uid, {
        clinicName,
        clinicInfo,
        logoUrl: finalLogoUrl,
      });

      setToast('Profile saved!');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setToast(`Error: ${err.message}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e8f0fe 0%, #f0f4ff 100%)' }}
    >
      {/* Header */}
      <header className="glass sticky top-0 z-20 pt-safe px-4 pb-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="press-scale w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-gray-700">Clinic Profile</h2>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-safe max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          className="space-y-5"
        >
          {/* Logo uploader */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="press-scale relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-brand-300 bg-white/60 flex items-center justify-center shadow-sm"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-brand-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-center leading-tight">Upload<br/>Logo</span>
                </div>
              )}
              {/* Edit badge */}
              {logoUrl && (
                <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center shadow">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                  </svg>
                </div>
              )}
            </button>
            <p className="text-xs text-gray-400">PNG with transparent background recommended</p>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          </div>

          {/* Fields */}
          <div className="glass rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Clinic Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                placeholder="e.g. Sunrise Physiotherapy"
                className="w-full h-11 px-4 rounded-xl bg-white/70 border border-white/60 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                About Your Clinic
              </label>
              <textarea
                value={clinicInfo}
                onChange={e => setClinicInfo(e.target.value)}
                placeholder="Brief description shown on shared content..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/60 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 resize-none transition"
              />
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="press-scale w-full h-14 rounded-2xl bg-brand-600 text-white font-semibold text-base shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : 'Save Profile'}
          </button>

          {/* Account info */}
          <p className="text-center text-xs text-gray-400">
            Signed in as <strong className="text-gray-600">{user?.email}</strong>
          </p>
        </motion.div>
      </main>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-semibold text-gray-800 shadow-lg whitespace-nowrap"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
