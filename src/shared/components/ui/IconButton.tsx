import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../../lib/utils'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — used as aria-label and title */
  label: string
  size?: 'sm' | 'md'
  variant?: 'neutral' | 'primary' | 'warning' | 'error' | 'success' | 'info'
}

const sizes = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-xl',
}

const variants = {
  neutral:
    'border border-border bg-card text-muted shadow-button hover:bg-hover hover:text-main hover:shadow-button-hover',
  primary:
    'border border-primary/60 bg-primary text-on-primary ring-1 ring-inset ring-white/10 shadow-button hover:bg-primary-hover hover:border-primary-hover hover:shadow-button-hover',
  warning:
    'border border-warning bg-warning text-on-warning ring-1 ring-inset ring-white/10 shadow-button hover:bg-warning-hover hover:shadow-button-hover',
  error:
    'border border-error bg-error text-on-error ring-1 ring-inset ring-white/10 shadow-button hover:bg-error-hover hover:shadow-button-hover',
  success:
    'border border-success bg-success text-on-success ring-1 ring-inset ring-white/10 shadow-button hover:bg-success-hover hover:shadow-button-hover',
  info: 'border border-info bg-info text-on-info ring-1 ring-inset ring-white/10 shadow-button hover:bg-info-hover hover:shadow-button-hover',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', variant = 'neutral', className, type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center outline-none transition-all duration-normal ease-out focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985] active:shadow-button-pressed active:duration-fast',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

IconButton.displayName = 'IconButton'
