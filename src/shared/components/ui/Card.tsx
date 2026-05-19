import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'sharp';
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hoverLift = true, children, ...props }, ref) => {
    const baseStyle = 'p-6 rounded-2xl transition-all duration-300 border overflow-hidden relative';

    const variants = {
      glass: 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
      elevated: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)]',
      sharp: 'bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(20,184,166,0.15)] rounded-none',
    };

    const motionProps = hoverLift && variant !== 'sharp' 
      ? {
          whileHover: { 
            y: -6, 
            boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.08), 0 0 20px rgba(var(--color-primary), 0.05)',
            borderColor: 'rgba(var(--color-primary), 0.2)' 
          }
        }
      : {};

    return (
      <motion.div
        ref={ref}
        {...motionProps}
        className={cn(baseStyle, variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
