import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const DISCIPLINES = ['Physio', 'Ophthalmology', 'Cardiology', 'Dermatology', 'Dentistry', 'Nutrition'];

export default function FilterBar({ selected, onChange }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2"
    >
      {DISCIPLINES.map((d) => {
        const active = selected === d;
        return (
          <motion.button
            key={d}
            onClick={() => onChange(d)}
            whileTap={{ scale: 0.93 }}
            className={[
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
              active
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-white/80 text-gray-600 border border-gray-200',
            ].join(' ')}
          >
            {d}
          </motion.button>
        );
      })}
    </div>
  );
}
