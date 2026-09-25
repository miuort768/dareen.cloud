/**
 * Design Primitives — Raw Color Scales
 *
 * ممنوع استيراد هذا الملف مباشرة داخل أي Component.
 * استخدم palette.ts أو semantic.ts بدلاً من ذلك.
 */

export const royalBlue = {
  50: '#f4f6fb',
  100: '#e7ecf6',
  200: '#cddaf0',
  300: '#a3bee5',
  400: '#739bd6',
  500: '#4e7bc5',
  600: '#3a5fa9',
  700: '#304d89',
  800: '#2a4173',
  900: '#25385f',
  950: '#17223b',
} as const

export const charcoal = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#0c0c0e',
} as const

export const warmIvory = {
  50: '#fdfcfb',
  100: '#fbfaf8',
  200: '#f5f3ef',
  300: '#ece9e2',
  400: '#ded8cc',
  500: '#ccc3b2',
  600: '#bcae97',
  700: '#a39277',
  800: '#877864',
  900: '#6d6153',
  950: '#3a342c',
} as const

export const matteGold = {
  50: '#fdfbf6',
  100: '#fbf6ea',
  200: '#f5ead0',
  300: '#ecdaaa',
  400: '#dfc37a',
  500: '#d1ab52',
  600: '#b88d3d',
  700: '#946932',
  800: '#79542e',
  900: '#644528',
  950: '#382313',
} as const

export const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
} as const

export const amber = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const

export const rose = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
} as const

export const sky = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
} as const

export type ColorFamily = keyof typeof primitives
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export const primitives = {
  royalBlue,
  charcoal,
  warmIvory,
  matteGold,
  emerald,
  amber,
  rose,
  sky,
} as const
