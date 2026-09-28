/**
 * Design Primitives — Raw Color Scales
 *
 * ممنوع استيراد هذا الملف مباشرة داخل أي Component.
 * استخدم palette.ts أو semantic.ts بدلاً من ذلك.
 */

export const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb', // Primary Blue
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a', // Deep Blue
  950: '#172554',
} as const

export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const

export const green = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a', // Success
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
} as const

export const amber = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706', // Warning
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const

export const red = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626', // Error
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const

export const sky = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7', // Info
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49',
} as const

export const gold = {
  50: '#fcfaf2',
  100: '#f7f2df',
  200: '#eee0af',
  300: '#e4ca7a',
  400: '#dbb650',
  500: '#d4af37', // Gold Accent
  600: '#b08f26',
  700: '#8c6d1b',
  800: '#71551b',
  900: '#60481b',
  950: '#38280a',
} as const

export type ColorFamily = keyof typeof primitives
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export const primitives = {
  blue,
  slate,
  green,
  amber,
  red,
  sky,
  gold,
} as const
