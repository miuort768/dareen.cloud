import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light');
      if (onClick) {
        onClick(e);
      }
    };

    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none rounded-xl';

    const variants = {
      primary: 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-[0_4px_15px_rgba(239,68,68,0.25)] dark:from-teal-500 dark:to-emerald-400 dark:text-slate-950 dark:shadow-[0_4px_15px_rgba(20,184,166,0.25)] border-0',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50',
      glass: 'bg-white/40 hover:bg-white/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-white/20 dark:border-white/10 shadow-sm',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
      destructive: 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="ml-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="mr-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
