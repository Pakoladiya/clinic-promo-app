import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DetailsPage() {
  const { id }       = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const content      = state?.content;

  // Fallback — shouldn't happen if navigating from ContentCard
  if (!content) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Content not found.</p>
        <button onClick={() => navigate(-1)} className="text-brand-600 font-semibold text-sm">
          ← Go back
        </button>
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
        <h2 className="text-sm font-semibold text-gray-700 truncate">Content Detail</h2>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-safe max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
        >
          {/* Discipline badge */}
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-3">
            {content.discipline}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
            {content.title}
          </h1>

          <div className="glass rounded-2xl p-5 mb-6 shadow-sm">
            <p className="text-gray-700 text-[15px] leading-7">
              {content.body}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(`/editor/${content.id}`, { state: { content } })}
            className="press-scale w-full h-14 rounded-2xl bg-brand-600 text-white font-semibold text-base shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 active:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            Add My Logo & Download
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Drop your clinic logo onto the content and export it ready to share.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
