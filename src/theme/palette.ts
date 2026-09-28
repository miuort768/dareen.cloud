/**
 * Palette — اختيار الدرجات المعتمدة لهوية دارين السابعة
 *
 * هذا الملف هو الطبقة الوحيدة التي تختار الدرجات من primitives.
 * جميع المكونات تتعامل مع semantic.ts فقط.
 */

import { blue, slate, gold, green, amber, red, sky } from './primitives'

export const palette = {
  // Primary (Solid Blue)
  primary: blue[600],
  primaryHover: blue[700],
  primaryActive: blue[800],
  primarySoft: blue[50],
  primaryLight: blue[100],
  primary200: blue[200],
  primary400: blue[400],
  primaryDark: blue[900], // Deep Blue

  // Accent (Solid Gold)
  accent: gold[500],
  accentHover: gold[600],
  accentSoft: gold[50],
  accentLight: gold[100],

  // Neutral (Slate / White)
  surface: slate[50],
  background: slate[100],
  card: '#ffffff',
  cardDark: slate[900],
  border: slate[200],
  borderAccent: slate[300],
  divider: slate[200],

  // Text
  text: slate[900],
  textMuted: slate[500],
  textDim: slate[400],
  textInverse: '#ffffff',
  textOnPrimary: '#ffffff',

  // Status — ثابتة في جميع الثيمات وبألوان واضحة Solid
  success: green[600],
  successSoft: green[50],
  successLight: green[100],
  successDark: green[700],

  warning: amber[600],
  warningSoft: amber[50],
  warningLight: amber[100],
  warningDark: amber[700],

  error: red[600],
  errorSoft: red[50],
  errorLight: red[100],
  errorDark: red[700],
  errorHover: red[700],
  errorActive: red[800],

  info: sky[600],
  infoSoft: sky[50],
  infoLight: sky[100],
  infoDark: sky[700],

  // Text on colored backgrounds (Contrast is priority)
  textOnAccent: '#18181b', // navy ink on gold – AA
  textOnError: '#ffffff',
  textOnSuccess: '#ffffff',
  textOnWarning: '#ffffff',
  textOnInfo: '#ffffff',

  // Focus
  focusRing: blue[600],

  // Hover backgrounds
  hover: slate[100],
  hoverDark: slate[800],
  surfaceActive: slate[200],

  // Aliases
  textSecondary: slate[600],
  borderHover: slate[300],
} as const

export type PaletteToken = keyof typeof palette
