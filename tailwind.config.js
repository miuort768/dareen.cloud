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
        sans: 'var(--font-family-sans)',
        heading: 'var(--font-family-heading)',
        dash: 'var(--font-family-dash)',
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-2xl)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-3xl)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-4xl)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-5xl)' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: 'var(--line-height-6xl)' }],
        '7xl': ['var(--font-size-7xl)', { lineHeight: 'var(--line-height-7xl)' }],
        'display': ['var(--font-size-display)', { lineHeight: 'var(--line-height-display)' }],
        'section': ['var(--font-size-section)', { lineHeight: 'var(--line-height-section)' }],
        'card-title': ['var(--font-size-card-title)', { lineHeight: 'var(--line-height-card-title)' }],
        'button': ['var(--font-size-button)', { lineHeight: 'var(--line-height-button)' }],
        'micro': ['var(--font-size-micro)', { lineHeight: 'var(--line-height-micro)' }],
      },
      colors: {
        /* ========== Legacy Colors (للمكونات الحالية — ستستبدل تدريجيًا) ========== */
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
        },

        /* ========== Semantic Tokens (Design System v0.9) ========== */
        // Background levels
        surface: 'var(--bg-surface)',
        background: 'var(--bg-background)',
        card: 'var(--bg-card)',

        // Text levels
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        dim: 'var(--text-dim)',
        inverse: 'var(--text-inverse)',

        // Background levels
        hover: 'var(--bg-hover)',

        // Border
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        divider: 'var(--divider)',

        // Accent (Gold)
        accent: {
          DEFAULT: 'var(--bg-accent)',
          hover: 'var(--bg-accent-hover)',
          soft: 'var(--bg-accent-soft)',
          light: 'var(--bg-accent-light)',
        },

        // Text on colored backgrounds — key name = what follows "text-"
        'on-primary': 'var(--text-on-primary)',
        'on-success': 'var(--text-on-success)',
        'on-warning': 'var(--text-on-warning)',
        'on-error': 'var(--text-on-error)',
        'on-info': 'var(--text-on-info)',
        'on-accent': 'var(--text-on-accent)',

        // Primary extended
        'primary-hover': 'var(--bg-primary-hover)',
        'primary-active': 'var(--bg-primary-active)',
        'primary-soft': 'var(--bg-primary-soft)',
        'primary-light': 'var(--bg-primary-light)',

        // Focus (ring)
        focus: 'var(--ring-focus)',

        // Chart colors
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
          6: 'var(--chart-6)',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--bg-success)',
          dark: 'var(--bg-success-dark)',
          soft: 'var(--bg-success-soft)',
          light: 'var(--bg-success-light)',
        },
        warning: {
          DEFAULT: 'var(--bg-warning)',
          dark: 'var(--text-warning-dark)',
          soft: 'var(--bg-warning-soft)',
          light: 'var(--bg-warning-light)',
        },
        error: {
          DEFAULT: 'var(--bg-error)',
          hover: 'var(--bg-error-hover)',
          active: 'var(--bg-error-active)',
          dark: 'var(--text-error-dark)',
          soft: 'var(--bg-error-soft)',
          light: 'var(--bg-error-light)',
        },
        info: {
          DEFAULT: 'var(--bg-info)',
          dark: 'var(--text-info-dark)',
          soft: 'var(--bg-info-soft)',
          light: 'var(--bg-info-light)',
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      maxWidth: {
        page: 'var(--container-width)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        none: '0 0 #0000',
        card: 'var(--shadow-card)',
        gold: 'var(--shadow-gold)',
        'gold-hover': 'var(--shadow-gold-hover)',
        glass: 'var(--shadow-glass)',
        soft: 'var(--shadow-soft)',
        broad: 'var(--shadow-broad)',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'shine-slow': 'shine 3s ease-in-out infinite',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
