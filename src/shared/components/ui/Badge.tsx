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
  default: 'bg-hover text-main border-transparent',
  success: 'bg-success text-on-success border-success shadow-soft',
  warning: 'bg-warning text-on-warning border-warning shadow-soft',
  error: 'bg-error text-on-error border-error shadow-soft',
  info: 'bg-info text-on-info border-info shadow-soft',
  premium: 'bg-accent text-on-accent border-accent shadow-elevation-1',
  glow: 'bg-primary text-on-primary border-primary shadow-soft',
  outline: 'bg-transparent text-main border-border',
  destructive: 'bg-error text-on-error border-error shadow-soft',
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
