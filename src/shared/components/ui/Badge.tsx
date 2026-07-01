import React from 'react';
import { cn } from '../../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-surface text-muted border-border',
  success: 'bg-success-soft text-success-dark border-success',
  warning: 'bg-warning-soft text-warning-dark border-warning',
  error: 'bg-error-soft text-error-dark border-error',
  info: 'bg-info-soft text-info-dark border-info',
  premium: 'bg-accent text-on-accent border-accent',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-semibold rounded-full border transition-colors',
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
