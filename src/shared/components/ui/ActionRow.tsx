import React from 'react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  color?: 'success' | 'error' | 'info' | 'warning' | 'primary';
  tooltip?: string;
}

const colorMap = {
  success: 'bg-success/10 text-success hover:bg-success/20 border-success/20 dark:bg-success/15 dark:text-success dark:border-success/15',
  error: 'bg-error/10 text-error hover:bg-error/20 border-error/20 dark:bg-error/15 dark:text-error dark:border-error/15',
  info: 'bg-info/10 text-info hover:bg-info/20 border-info/20 dark:bg-info/15 dark:text-info dark:border-info/15',
  warning: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20 dark:bg-warning/15 dark:text-warning dark:border-warning/15',
  primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/15',
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, icon, label, color = 'success', tooltip, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light');
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        title={tooltip || label}
        aria-label={tooltip || label}
        className={cn(
          'inline-flex items-center justify-center',
          'w-8 h-8 rounded-xl border',
          'text-[10px] font-bold',
          'transition-all duration-200',
          'active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          colorMap[color],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

export interface ActionRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ActionRow = ({ children, className }: ActionRowProps) => (
  <div className={cn('flex items-center justify-end gap-1.5', className)}>
    {children}
  </div>
);
