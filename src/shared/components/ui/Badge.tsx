import React from 'react'
import { cn } from '../../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'premium'
    | 'glow'
    | 'outline'
    | 'destructive'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-hover text-muted border-transparent',
  success: 'bg-success-soft text-success-dark border-success-soft',
  warning: 'bg-warning-soft text-warning-dark border-warning-soft',
  error: 'bg-error-soft text-error-dark border-error-soft',
  info: 'bg-info-soft text-info-dark border-info-soft',
  premium:
    'bg-gradient-to-l from-accent to-accent-light text-on-accent border-accent-soft shadow-elevation-1',
  glow: 'bg-primary-soft text-primary-active border-primary/20',
  outline: 'bg-transparent text-muted border-border',
  destructive: 'bg-error text-on-error border-error',
}

const sizes = {
  sm: 'px-2 py-0.5 text-micro tracking-wide',
  md: 'px-2.5 py-1 text-xs tracking-wide',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-bold transition-colors duration-normal',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
