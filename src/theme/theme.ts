/**
 * Theme — Light / Dark mapping
 *
 * يربط الـ Semantic Tokens بقيمها في الوضع الفاتح والغامق.
 * مستقبلاً يمكن إضافة ثيمات إضافية هنا.
 */

import { indigo, slate, gold, emerald, amber, rose, sky } from './primitives';
import type { SemanticToken } from './semantic';

export interface ThemeColors {
  [token: string]: string;
}

/**
 * Light mode palette
 */
export const light: ThemeColors = {
  // Backgrounds
  'bg-surface': slate[50],
  'bg-background': slate[100],
  'bg-card': '#ffffff',
  'bg-hover': slate[100],

  // Primary
  'bg-primary': indigo[600],
  'bg-primary-hover': indigo[700],
  'bg-primary-active': indigo[800],
  'bg-primary-soft': indigo[50],
  'bg-primary-light': indigo[100],
  'text-primary': indigo[600],
  'text-on-primary': '#ffffff',
  'border-primary': indigo[600],

  // Accent
  'text-accent': gold[500],
  'bg-accent': gold[500],
  'bg-accent-hover': gold[600],
  'bg-accent-soft': gold[50],
  'bg-accent-light': gold[100],
  'border-accent': gold[500],

  // Text
  'text-main': slate[900],
  'text-muted': slate[500],
  'text-dim': slate[400],
  'text-inverse': '#ffffff',

  // Focus
  'ring-focus': indigo[600],

  // Borders
  'border': slate[200],
  'border-strong': slate[300],
  'divider': slate[200],

  // Success
  'bg-success': emerald[500],
  'bg-success-soft': emerald[50],
  'bg-success-light': emerald[100],
  'text-success': emerald[500],
  'text-success-dark': emerald[700],
  'border-success': emerald[500],

  // Warning
  'bg-warning': amber[500],
  'bg-warning-soft': amber[50],
  'bg-warning-light': amber[100],
  'text-warning': amber[500],
  'text-warning-dark': amber[700],
  'border-warning': amber[500],

  // Error
  'bg-error': rose[500],
  'bg-error-hover': rose[600],
  'bg-error-active': rose[700],
  'bg-error-soft': rose[50],
  'bg-error-light': rose[100],
  'text-error': rose[500],
  'text-error-dark': rose[700],
  'text-on-error': '#ffffff',
  'border-error': rose[500],

  // Info
  'bg-info': sky[500],
  'bg-info-soft': sky[50],
  'bg-info-light': sky[100],
  'text-info': sky[500],
  'text-info-dark': sky[700],
  'border-info': sky[500],
};

/**
 * Dark mode palette
 */
export const dark: ThemeColors = {
  // Backgrounds
  'bg-surface': slate[950] || '#020617',
  'bg-background': slate[900],
  'bg-card': slate[800],
  'bg-hover': slate[700],

  // Primary
  'bg-primary': indigo[500],
  'bg-primary-hover': indigo[400],
  'bg-primary-active': indigo[300],
  'bg-primary-soft': indigo[900],
  'bg-primary-light': indigo[800],
  'text-primary': indigo[400],
  'text-on-primary': '#ffffff',
  'border-primary': indigo[500],

  // Accent
  'text-accent': gold[400],
  'bg-accent': gold[500],
  'bg-accent-hover': gold[400],
  'bg-accent-soft': gold[900],
  'bg-accent-light': gold[800],
  'border-accent': gold[500],

  // Text
  'text-main': slate[100],
  'text-muted': slate[400],
  'text-dim': slate[500],
  'text-inverse': slate[900],

  // Focus
  'ring-focus': indigo[400],

  // Borders
  'border': slate[700],
  'border-strong': slate[600],
  'divider': slate[700],

  // Status (ثابتة لكن بتعديل طفيف للتباين)
  'bg-success': emerald[600],
  'bg-success-soft': emerald[900],
  'bg-success-light': emerald[800],
  'text-success': emerald[400],
  'text-success-dark': emerald[300],
  'border-success': emerald[600],

  'bg-warning': amber[600],
  'bg-warning-soft': amber[900],
  'bg-warning-light': amber[800],
  'text-warning': amber[400],
  'text-warning-dark': amber[300],
  'border-warning': amber[600],

  'bg-error': rose[600],
  'bg-error-hover': rose[500],
  'bg-error-active': rose[400],
  'bg-error-soft': rose[900],
  'bg-error-light': rose[800],
  'text-error': rose[400],
  'text-error-dark': rose[300],
  'text-on-error': '#ffffff',
  'border-error': rose[600],

  'bg-info': sky[600],
  'bg-info-soft': sky[900],
  'bg-info-light': sky[800],
  'text-info': sky[400],
  'text-info-dark': sky[300],
  'border-info': sky[600],
};

/**
 * Generates CSS custom properties string from a ThemeColors object
 */
export function generateCssVars(theme: ThemeColors, prefix = ''): string {
  return Object.entries(theme)
    .map(([token, value]) => `  ${prefix}${token}: ${value};`)
    .join('\n');
}
