import React from 'react'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'warning'
    | 'success'
    | 'glass'
    | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/* ── Premium button language ──
   resting = shadow-button · hover = shadow-button-hover · pressed = shadow-button-pressed + micro-scale
   filled variants carry an inner white/10 hairline (ring-1 ring-inset) and an inset focus ring.
*/

const HAIRLINE = 'ring-1 ring-inset ring-white/10'
const PRESSED = 'active:scale-[0.985] active:shadow-button-pressed'
const FOCUS_RING = 'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2'
const FOCUS_RING_INSET = 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus'

const variants = {
  primary:
    'bg-primary text-on-primary border border-primary/60 shadow-button' +
    ` ${HAIRLINE}` +
    ' hover:bg-primary-hover hover:border-primary-hover hover:shadow-button-hover' +
    ` ${PRESSED} active:bg-primary-active active:border-primary-active` +
    ` ${FOCUS_RING_INSET}`,
  secondary:
    'bg-card text-main border border-border shadow-button' +
    ' hover:bg-hover hover:border-border-strong hover:shadow-button-hover' +
    ` ${PRESSED} active:bg-hover active:border-border-strong` +
    ` ${FOCUS_RING}`,
  outline:
    'bg-transparent text-primary border border-primary/40 shadow-none' +
    ' hover:bg-primary-soft hover:border-primary/60 hover:shadow-button' +
    ` ${PRESSED} active:bg-primary-soft active:border-primary` +
    ` ${FOCUS_RING}`,
  ghost:
    'bg-transparent text-muted border border-transparent' +
    ' hover:bg-hover hover:text-main hover:border-border' +
    ` ${PRESSED} active:bg-hover active:text-main` +
    ` ${FOCUS_RING}`,
  destructive:
    'bg-error text-on-error border border-error shadow-button' +
    ` ${HAIRLINE}` +
    ' hover:bg-error-hover hover:border-error-hover hover:shadow-button-hover' +
    ` ${PRESSED} active:bg-error-active active:border-error-active` +
    ' focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error',
  warning:
    'bg-warning text-on-warning border border-warning shadow-button' +
    ` ${HAIRLINE}` +
    ' hover:bg-warning-hover hover:border-warning-dark hover:shadow-button-hover' +
    ` ${PRESSED} active:bg-warning-dark active:border-warning-dark` +
    ' focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning',
  success:
    'bg-success text-on-success border border-success shadow-button' +
    ` ${HAIRLINE}` +
    ' hover:bg-success-hover hover:border-success-dark hover:shadow-button-hover' +
    ` ${PRESSED} active:bg-success-dark active:border-success-dark` +
    ' focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success',
  glass:
    'bg-white/70 dark:bg-card backdrop-blur-xl text-main border border-white/20 dark:border-white/10 shadow-button' +
    ' hover:bg-white/90 dark:hover:bg-card hover:shadow-button-hover hover:border-white/30 dark:hover:border-white/20' +
    ` ${PRESSED} active:bg-white/80` +
    ` ${FOCUS_RING}`,
  premium:
    'bg-gradient-to-l from-primary via-primary-hover to-primary-active text-on-primary border border-primary/50' +
    ` shadow-button shadow-primary/20 ${HAIRLINE}` +
    ' hover:shadow-button-hover hover:shadow-primary/25 hover:brightness-110' +
    ` ${PRESSED}` +
    ` ${FOCUS_RING_INSET}`,
}

const sizes = {
  sm: 'h-10 px-3.5 text-xs rounded-md gap-1.5 font-semibold md:h-8 md:px-3.5',
  md: 'h-11 px-5 text-sm rounded-lg gap-2 font-bold md:h-10 md:px-5',
  lg: 'h-12 px-6 text-base rounded-card gap-2.5 font-bold md:px-7',
  icon: 'h-11 w-11 rounded-lg md:h-10 md:w-10',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light')
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex select-none items-center justify-center whitespace-nowrap',
          'transition-all duration-normal ease-out active:duration-fast',
          'disabled:pointer-events-none disabled:scale-100 disabled:opacity-40 disabled:shadow-none',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
          fullWidth && 'w-full',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{rightIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
