import React from 'react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md',
  secondary: 'bg-card text-main border border-border hover:bg-hover active:bg-hover shadow-sm',
  outline: 'border-2 border-primary/40 text-primary hover:bg-primary-soft hover:border-primary active:bg-primary active:text-on-primary',
  ghost: 'text-muted hover:bg-hover/80 active:text-dim hover:text-main',
  destructive: 'bg-error text-on-error hover:bg-error-hover active:bg-error-active shadow-sm hover:shadow-md',
  glass: 'bg-white/70 dark:bg-primary-active/60 backdrop-blur-xl text-main border border-white/20 dark:border-white/10 shadow-sm hover:shadow-md',
  premium: 'bg-gradient-to-l from-primary via-primary-hover to-primary-active text-on-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] hover:from-primary-hover hover:via-primary-active hover:to-primary-active',
};

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-6 text-button font-medium',
  lg: 'h-12 px-8 text-lg',
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
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-normal rounded-xl focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'active:scale-[0.97] hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none select-none',
          variants[variant], sizes[size], className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
