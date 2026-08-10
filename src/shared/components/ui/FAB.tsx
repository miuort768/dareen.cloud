import React from 'react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  isOpen?: boolean;
  variant?: 'primary' | 'success' | 'error';
}

const variants = {
  primary: 'bg-primary text-on-primary shadow-xl shadow-primary/30 hover:shadow-primary/40',
  success: 'bg-success text-on-success shadow-xl shadow-success/30 hover:shadow-success/40',
  error: 'bg-error text-on-error shadow-xl shadow-error/30 hover:shadow-error/40',
};

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, icon, label, isOpen, variant = 'primary', onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('medium');
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-label={label}
        className={cn(
          'fixed bottom-6 end-6 z-50',
          'w-12 h-12 rounded-full',
          'flex items-center justify-center',
          'transition-all duration-300',
          'active:scale-90',
          'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          variants[variant],
          isOpen && 'rotate-45',
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

FAB.displayName = 'FAB';
