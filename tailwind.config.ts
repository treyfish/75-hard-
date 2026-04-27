import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0c0f',
          900: '#0d0f12',
          800: '#14171c',
          700: '#1a1d22',
          600: '#23272d',
          500: '#3a3f47',
        },
        gold: {
          50: '#fbf6e8',
          100: '#f3e6bf',
          300: '#e6c37c',
          400: '#dcb164',
          500: '#d4a85a',
          600: '#b88a3d',
          700: '#8a652c',
        },
        parchment: '#e8e3d6',
        success: '#5fb672',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(212,168,90,0.6), 0 0 24px rgba(212,168,90,0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
