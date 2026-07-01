import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-sm',
  secondary: 'bg-card text-main border border-border hover:bg-hover active:bg-hover',
  outline: 'border border-primary text-primary hover:bg-primary-soft active:bg-primary active:text-on-primary',
  ghost: 'text-muted hover:bg-hover active:text-dim',
  destructive: 'bg-error text-on-error hover:bg-error-hover active:bg-error-active shadow-sm',
  glass: 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-main border border-white/20 dark:border-white/10 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, onClick, ...props },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light');
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-card focus:outline-none focus:ring-2 focus:ring-focus',
          'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant], sizes[size], className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
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
