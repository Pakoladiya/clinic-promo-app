import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { logout } from '../services/authService';
import { useAdmin } from '../hooks/useAdmin';
import { fetchByDiscipline } from '../services/contentService';
import FilterBar from '../components/FilterBar';
import ContentCard from '../components/ContentCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isAdmin   = useAdmin();
  const [discipline, setDiscipline] = useState('Physio');
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchByDiscipline(discipline).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else setItems(data ?? []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [discipline]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e8f0fe 0%, #f0f4ff 100%)' }}
    >
      {/* Header */}
      <header className="glass sticky top-0 z-20 pt-safe px-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Welcome back</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Content Library</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="press-scale w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600"
                title="Admin Panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="press-scale w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white shadow"
              title="Profile"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="press-scale w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-500"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-2 -mx-4">
          <FilterBar selected={discipline} onChange={setDiscipline} />
        </div>
      </header>

      {/* Content list */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-safe max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex justify-center pt-16">
            <span className="w-8 h-8 rounded-full border-3 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-400 pt-16 text-sm">{error}</p>
        ) : items.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-gray-400 pt-16 text-sm"
          >
            No content for <strong>{discipline}</strong> yet.
          </motion.p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <ContentCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
