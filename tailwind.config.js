/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        heading: ['Tajawal', 'sans-serif'],
        display: ['Changa', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          50: 'rgb(var(--color-primary) / 0.1)',
          100: 'rgb(var(--color-primary) / 0.15)',
          200: 'rgb(var(--color-primary) / 0.25)',
          300: 'rgb(var(--color-primary) / 0.4)',
          400: 'rgb(var(--color-primary) / 0.6)',
          500: 'rgb(var(--color-primary) / <alpha-value>)',
          600: 'rgb(var(--color-primary) / <alpha-value>)',
          700: 'rgb(var(--color-primary) / 0.85)',
          800: 'rgb(var(--color-primary) / 0.7)',
          900: 'rgb(var(--color-primary) / 0.55)',
          950: 'rgb(var(--color-primary) / 0.4)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F8F1D2',
          hover: '#B8860B',
          glow: 'rgba(212, 175, 55, 0.4)',
        },
        premium: {
          rose: '#e11d48',
          crimson: '#9f1239',
          emerald: '#10b981',
          slate: '#0F172A',
        }
      },
      boxShadow: {
        'gold': '0 10px 30px -10px rgba(212, 175, 55, 0.3)',
        'gold-hover': '0 20px 40px -10px rgba(212, 175, 55, 0.4)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.05)',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        }
      },
      animation: {
        'shine-slow': 'shine 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
