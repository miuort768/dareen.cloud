/**
 * Palette — اختيار الدرجات المعتمدة لهوية دارين السابعة
 *
 * هذا الملف هو الطبقة الوحيدة التي تختار الدرجات من primitives.
 * جميع المكونات تتعامل مع semantic.ts فقط.
 */

import { indigo, slate, gold, emerald, amber, rose, sky } from './primitives'

export const palette = {
  // Primary
  primary: indigo[600],
  primaryHover: indigo[700],
  primaryActive: indigo[800],
  primarySoft: indigo[50],
  primaryLight: indigo[100],
  primary200: indigo[200],
  primary400: indigo[400],
  primaryDark: indigo[900],

  // Accent (Gold — استخدام محدود)
  accent: gold[500],
  accentHover: gold[600],
  accentSoft: gold[50],
  accentLight: gold[100],

  // Neutral (Slate)
  surface: slate[50],
  background: slate[100],
  card: '#ffffff',
  cardDark: slate[800],
  border: slate[200],
  borderAccent: slate[300],
  divider: slate[200],

  // Text
  text: slate[900],
  textMuted: slate[500],
  textDim: slate[400],
  textInverse: '#ffffff',
  textOnPrimary: '#ffffff',

  // Status — ثابتة في جميع الثيمات
  success: emerald[600],
  successSoft: emerald[50],
  successLight: emerald[100],
  successDark: emerald[700],

  warning: amber[500],
  warningSoft: amber[50],
  warningLight: amber[100],
  warningDark: amber[700],

  error: rose[600],
  errorSoft: rose[50],
  errorLight: rose[100],
  errorDark: rose[700],
  errorHover: rose[700],
  errorActive: rose[800],

  info: sky[500],
  infoSoft: sky[50],
  infoLight: sky[100],
  infoDark: sky[700],

  // Text on colored backgrounds
  textOnAccent: slate[900],
  textOnError: '#ffffff',
  textOnSuccess: '#ffffff',
  textOnWarning: '#ffffff',
  textOnInfo: '#ffffff',

  // Focus
  focusRing: indigo[600],

  // Hover backgrounds
  hover: slate[100],
  hoverDark: slate[700],
  surfaceActive: slate[200],

  // Aliases
  textSecondary: slate[500],
  borderHover: slate[300],
} as const

export type PaletteToken = keyof typeof palette
