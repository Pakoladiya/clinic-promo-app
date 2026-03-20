import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ContentCard({ item, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 22, stiffness: 200 }}
      onClick={() => navigate(`/content/${item.id}`, { state: { content: item } })}
      className="press-scale glass rounded-2xl p-5 shadow-sm cursor-pointer active:shadow-none"
    >
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-2">
        {item.discipline}
      </span>
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1.5">
        {item.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {item.body}
      </p>
      <div className="mt-3 flex items-center text-xs text-brand-600 font-semibold gap-1">
        Use this content
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </motion.div>
  );
}
