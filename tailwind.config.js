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
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          hover: '#15803d',
        },
        premium: {
          blue: '#e11d48',
          indigo: '#9f1239',
          gold: '#16a34a',
        }
      },
      boxShadow: {
        'gold': '0 10px 30px -10px rgba(22, 163, 74, 0.3)',
        'gold-hover': '0 20px 40px -10px rgba(22, 163, 74, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      }
    },
  },
  plugins: [],
}
