import { cn } from '../../../lib/utils'

/**
 * Premium floating-action surface. Positioning is caller-owned (fixed/sticky
 * classes on `className`) since each page places its FAB differently.
 */
export const FAB_SURFACE =
  'inline-flex items-center justify-center bg-primary text-on-primary border border-primary/60 ring-1 ring-inset ring-white/10 shadow-button transition-all duration-normal ease-out hover:bg-primary-hover hover:border-primary-hover hover:shadow-button-hover active:scale-[0.985] active:shadow-button-pressed active:duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus'

export type SoftTone = 'primary' | 'info' | 'success' | 'warning' | 'error'

export const softActionBase =
  'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold shadow-button transition-all duration-normal ease-out hover:shadow-button-hover active:scale-95 active:shadow-button-pressed outline-none focus-visible:ring-2 focus-visible:ring-focus'

export const softActionTone: Record<SoftTone, string> = {
  primary:
    'bg-primary-soft text-primary border border-primary/20 hover:border-primary/40 hover:bg-primary hover:text-on-primary',
  info: 'bg-info-soft text-info hover:bg-info hover:text-on-info',
  success: 'bg-success-soft text-success hover:bg-success hover:text-on-success',
  warning: 'bg-warning-soft text-warning hover:bg-warning hover:text-on-warning',
  error: 'bg-error-soft text-error hover:bg-error hover:text-on-error',
}

/** Soft chip-action button with a solid fill + `on-*` text on hover. */
export const softActionClasses = (tone: SoftTone) => cn(softActionBase, softActionTone[tone])
