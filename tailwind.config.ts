import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0:    '#060a18',
          1:    '#0c1024',
          2:    '#111830',
          card: '#141929',
          hover:'#1a2035',
        },
        primary: {
          DEFAULT: '#7c3aed',
          light:   '#a78bfa',
        },
        gold: {
          DEFAULT: '#f59e0b',
          light:   '#fcd34d',
        },
        success: {
          DEFAULT: '#10b981',
          light:   '#34d399',
        },
        txt: {
          1: '#ffffff',
          2: '#cbd5e1',
          3: '#64748b',
          4: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        sm:           '0 2px 8px rgba(0,0,0,0.3)',
        md:           '0 8px 24px rgba(0,0,0,0.4)',
        lg:           '0 20px 60px rgba(0,0,0,0.5)',
        'glow-purple':'0 0 30px rgba(124,58,237,0.25)',
        'glow-gold':  '0 0 30px rgba(245,158,11,0.25)',
        'glow-green': '0 0 20px rgba(16,185,129,0.2)',
      },
      backgroundImage: {
        'grad-hero':   'linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#0ea5e9 100%)',
        'grad-purple': 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        'grad-gold':   'linear-gradient(135deg,#f59e0b,#d97706)',
        'grad-green':  'linear-gradient(135deg,#10b981,#059669)',
        'grad-card':   'linear-gradient(145deg,#141929,#0c1024)',
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'pulse-slow':'pulse 2s ease-in-out infinite',
        'ticker':   'ticker 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} satisfies Config
