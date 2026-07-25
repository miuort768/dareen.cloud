import React from 'react';
import { cn } from '../../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'sharp' | 'premium' | 'glow';
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hoverLift = true, children, ...props }, ref) => {
    const variants = {
      glass: 'bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 shadow-card',
      elevated: 'bg-card border border-border shadow-md hover:shadow-lg',
      sharp: 'bg-card border-2 border-strong shadow-[4px_4px_0px_0px_var(--text-main)] dark:shadow-[var(--shadow-sharp)] rounded-none',
      premium: 'bg-gradient-to-br from-white to-primary-soft/50 dark:from-primary-active dark:to-primary-soft/20 border border-primary/10 dark:border-primary/20 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10',
      glow: 'bg-card border border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20',
    };

    return (
      <div
        ref={ref}
        className={cn('p-6 rounded-2xl transition-all duration-slow border overflow-hidden relative', hoverLift && variant !== 'sharp' && 'hover:-translate-y-1', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
