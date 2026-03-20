/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e8f0fe',
          100: '#d2e3fc',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1557b0',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':  'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
