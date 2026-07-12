import React from 'react';
import { cn } from '../../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium' | 'glow';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-surface text-muted border-border',
  success: 'bg-success-soft text-success-dark border-success/50',
  warning: 'bg-warning-soft text-warning-dark border-warning/50',
  error: 'bg-error-soft text-error-dark border-error/50',
  info: 'bg-info-soft text-info-dark border-info/50',
  premium: 'bg-gradient-to-l from-amber-400 to-yellow-500 text-white border-amber-300/50 shadow-sm shadow-amber-200/30',
  glow: 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/10',
};

const sizes = {
  sm: 'px-2 py-0.5 text-micro',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-bold rounded-full border transition-all duration-200',
          variants[variant], sizes[size], className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
