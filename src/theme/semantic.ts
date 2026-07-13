/**
 * Semantic Tokens — ربط الألوان بوظائفها داخل الواجهة
 *
 * هذه هي الطبقة الوحيدة التي تستخدمها المكونات.
 * ممنوع استخدام palette أو primitives مباشرة داخل أي Component.
 */

import { palette } from './palette';

export const semantic = {
  // Backgrounds
  'bg-surface': palette.surface,
  'bg-background': palette.background,
  'bg-card': palette.card,
  'bg-card-dark': palette.cardDark,
  'bg-hover': palette.hover,
  'bg-hover-dark': palette.hoverDark,

  // Primary
  'bg-primary': palette.primary,
  'bg-primary-hover': palette.primaryHover,
  'bg-primary-active': palette.primaryActive,
  'bg-primary-soft': palette.primarySoft,
  'bg-primary-light': palette.primaryLight,
  'bg-primary-200': palette.primary200,
  'bg-primary-400': palette.primary400,
  'bg-primary-dark': palette.primaryDark,
  'text-primary': palette.primary,
  'text-primary-200': palette.primary200,
  'text-primary-400': palette.primary400,
  'text-on-primary': palette.textOnPrimary,
  'border-primary': palette.primary,
  'ring-primary': palette.primary,

  // Accent (Gold)
  'text-accent': palette.accent,
  'text-on-accent': palette.textOnAccent,
  'bg-accent': palette.accent,
  'bg-accent-hover': palette.accentHover,
  'bg-accent-soft': palette.accentSoft,
  'bg-accent-light': palette.accentLight,
  'border-accent': palette.accent,

  // Text
  'text-main': palette.text,
  'text-muted': palette.textMuted,
  'text-dim': palette.textDim,
  'text-inverse': palette.textInverse,
  'text-secondary': palette.textSecondary,

  // Focus
  'ring-focus': palette.focusRing,

  // Borders
  'border': palette.border,
  'border-strong': palette.borderAccent,
  'border-hover': palette.borderHover,
  'divider': palette.divider,
  'bg-surface-active': palette.surfaceActive,

  // Success
  'text-on-success': palette.textOnSuccess,
  'bg-success': palette.success,
  'bg-success-soft': palette.successSoft,
  'bg-success-light': palette.successLight,
  'text-success': palette.success,
  'text-success-dark': palette.successDark,
  'border-success': palette.success,

  // Warning
  'text-on-warning': palette.textOnWarning,
  'bg-warning': palette.warning,
  'bg-warning-soft': palette.warningSoft,
  'bg-warning-light': palette.warningLight,
  'text-warning': palette.warning,
  'text-warning-dark': palette.warningDark,
  'border-warning': palette.warning,

  // Error
  'bg-error': palette.error,
  'bg-error-hover': palette.errorHover,
  'bg-error-active': palette.errorActive,
  'bg-error-soft': palette.errorSoft,
  'bg-error-light': palette.errorLight,
  'text-error': palette.error,
  'text-error-dark': palette.errorDark,
  'text-on-error': palette.textOnError,
  'border-error': palette.error,

  // Info
  'text-on-info': palette.textOnInfo,
  'bg-info': palette.info,
  'bg-info-soft': palette.infoSoft,
  'bg-info-light': palette.infoLight,
  'text-info': palette.info,
  'text-info-dark': palette.infoDark,
  'border-info': palette.info,
} as const;

export type SemanticToken = keyof typeof semantic;

/**
 * Returns the CSS variable name for a semantic token.
 * Example: 'bg-surface' → '--bg-surface'
 */
export function tokenToCssVar(token: SemanticToken): string {
  return `--${token}`;
}

/**
 * Returns the CSS variable reference for a semantic token.
 * Example: 'bg-surface' → 'var(--bg-surface)'
 */
export function tokenToCssRef(token: SemanticToken): string {
  return `var(--${token})`;
}
