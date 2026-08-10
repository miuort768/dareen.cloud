import React from 'react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass' | 'premium' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    'bg-primary text-on-primary shadow-sm border border-primary/80' +
    ' hover:bg-primary-hover hover:shadow-md hover:border-primary-hover' +
    ' active:bg-primary-active active:shadow-sm active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  secondary:
    'bg-card text-main border border-border shadow-sm' +
    ' hover:bg-hover hover:shadow-md hover:border-border-strong' +
    ' active:bg-hover active:shadow-sm active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  outline:
    'bg-transparent text-primary border-2 border-primary/30' +
    ' hover:bg-primary-soft hover:border-primary/60 hover:shadow-sm' +
    ' active:bg-primary-soft active:border-primary active:text-primary active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-muted border border-transparent' +
    ' hover:bg-hover hover:text-main hover:border-border/50' +
    ' active:bg-hover active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  destructive:
    'bg-error text-on-error shadow-sm border border-error/80' +
    ' hover:bg-error-hover hover:shadow-md hover:border-error-hover' +
    ' active:bg-error-active active:shadow-sm active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
  success:
    'bg-success text-on-success shadow-sm border border-success/80' +
    ' hover:brightness-110 hover:shadow-md' +
    ' active:brightness-95 active:shadow-sm active:scale-[0.98]' +
    ' focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2',
  glass:
    'bg-white/70 dark:bg-card/60 backdrop-blur-xl text-main border border-white/20 dark:border-white/10 shadow-sm' +
    ' hover:bg-white/90 dark:hover:bg-card/80 hover:shadow-md hover:border-white/30 dark:hover:border-white/20' +
    ' active:scale-[0.98] active:shadow-sm' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
  premium:
    'bg-gradient-to-l from-primary via-primary-hover to-primary-active text-on-primary shadow-lg shadow-primary/20 border border-primary/50' +
    ' hover:shadow-xl hover:shadow-primary/25 hover:brightness-110' +
    ' active:scale-[0.98] active:shadow-md' +
    ' focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
};

const sizes = {
  sm: 'h-8 px-3.5 text-xs rounded-lg gap-1.5 font-semibold',
  md: 'h-10 px-5 text-sm rounded-lg gap-2 font-semibold',
  lg: 'h-12 px-7 text-base rounded-xl gap-2.5 font-semibold',
  icon: 'h-10 w-10 rounded-lg',
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
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap select-none',
          'transition-all duration-200 ease-out',
          'disabled:opacity-40 disabled:pointer-events-none disabled:scale-100',
          '[&_svg]:shrink-0 [&_svg]:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0 [&_svg]:w-4 [&_svg]:h-4">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0 [&_svg]:w-4 [&_svg]:h-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
