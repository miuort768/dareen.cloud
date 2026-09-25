/**
 * Palette — اختيار الدرجات المعتمدة لهوية دارين السابعة
 *
 * هذا الملف هو الطبقة الوحيدة التي تختار الدرجات من primitives.
 * جميع المكونات تتعامل مع semantic.ts فقط.
 */

import { royalBlue, charcoal, warmIvory, matteGold, emerald, amber, rose, sky } from './primitives'

export const palette = {
  // Primary (Deep Navy / Royal Blue)
  primary: royalBlue[600],
  primaryHover: royalBlue[700],
  primaryActive: royalBlue[800],
  primarySoft: royalBlue[50],
  primaryLight: royalBlue[100],
  primary200: royalBlue[200],
  primary400: royalBlue[400],
  primaryDark: royalBlue[900],

  // Accent (Matte Gold — استخدام محدود)
  accent: matteGold[500],
  accentHover: matteGold[600],
  accentSoft: matteGold[50],
  accentLight: matteGold[100],

  // Neutral (Charcoal / Ivory)
  surface: warmIvory[50],
  background: warmIvory[100],
  card: '#ffffff',
  cardDark: charcoal[800],
  border: warmIvory[300],
  borderAccent: warmIvory[400],
  divider: warmIvory[300],

  // Text
  text: charcoal[900],
  textMuted: charcoal[500],
  textDim: charcoal[400],
  textInverse: '#ffffff',
  textOnPrimary: '#ffffff',

  // Status — ثابتة في جميع الثيمات
  success: emerald[600],
  successSoft: emerald[50],
  successLight: emerald[100],
  successDark: emerald[700],

  warning: amber[700],
  warningSoft: amber[50],
  warningLight: amber[100],
  warningDark: amber[700],

  error: rose[600],
  errorSoft: rose[50],
  errorLight: rose[100],
  errorDark: rose[700],
  errorHover: rose[700],
  errorActive: rose[800],

  info: sky[700],
  infoSoft: sky[50],
  infoLight: sky[100],
  infoDark: sky[700],

  // Text on colored backgrounds
  textOnAccent: charcoal[900],
  textOnError: '#ffffff',
  textOnSuccess: '#ffffff',
  textOnWarning: '#ffffff',
  textOnInfo: '#ffffff',

  // Focus
  focusRing: royalBlue[600],

  // Hover backgrounds
  hover: warmIvory[200],
  hoverDark: charcoal[700],
  surfaceActive: warmIvory[300],

  // Aliases
  textSecondary: charcoal[600],
  borderHover: warmIvory[400],
} as const

export type PaletteToken = keyof typeof palette
