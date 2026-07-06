import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'sharp';
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hoverLift = true, children, ...props }, ref) => {
    const variants = {
      glass: 'bg-white/80 dark:bg-primary-active/80 backdrop-blur-xl border border-border shadow-card',
      elevated: 'bg-card border border-border shadow-md',
      sharp: 'bg-card border-2 border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.15)] rounded-none',
    };

    const motionProps = hoverLift && variant !== 'sharp'
      ? { whileHover: { y: -6 } }
      : {};

    return (
      <motion.div
        ref={ref}
        {...motionProps}
        className={cn('p-6 rounded-card transition-all duration-300 border overflow-hidden relative', variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
