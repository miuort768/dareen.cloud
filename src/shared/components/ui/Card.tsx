import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'sharp' | 'premium' | 'glow';
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hoverLift = true, children, ...props }, ref) => {
    const variants = {
      glass: 'bg-white/80 dark:bg-primary-active/80 backdrop-blur-xl border border-border/50 shadow-card',
      elevated: 'bg-card border border-border shadow-md hover:shadow-lg',
      sharp: 'bg-card border-2 border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.15)] rounded-none',
      premium: 'bg-gradient-to-br from-white to-primary-soft/50 dark:from-primary-active dark:to-primary-soft/20 border border-primary/10 dark:border-primary/20 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10',
      glow: 'bg-card border border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20',
    };

    const motionProps = hoverLift && variant !== 'sharp'
      ? { whileHover: { y: -4 } }
      : {};

    return (
      <motion.div
        ref={ref}
        {...motionProps}
        className={cn('p-6 rounded-2xl transition-all duration-slow border overflow-hidden relative', variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
