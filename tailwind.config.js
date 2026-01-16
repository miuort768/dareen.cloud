/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
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
      }
    },
  },
  plugins: [],
}
