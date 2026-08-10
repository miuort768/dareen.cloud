import React from 'react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface FilterPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ className, active, count, icon, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light');
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5',
          'rounded-xl text-[10px] font-bold',
          'border transition-all duration-200',
          'active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          active
            ? 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/25 dark:text-primary dark:border-primary/35'
            : 'bg-surface text-muted border-border hover:bg-hover hover:text-main dark:bg-card dark:text-muted dark:border-white/[0.06] dark:hover:bg-hover dark:hover:text-main',
          className
        )}
        {...props}
      >
        {icon && <span className="[&_svg]:w-3 [&_svg]:h-3">{icon}</span>}
        {children}
        {count !== undefined && (
          <span className={cn(
            'min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center',
            active
              ? 'bg-primary text-on-primary'
              : 'bg-border/60 text-muted dark:bg-white/10 dark:text-dim'
          )}>
            {count}
          </span>
        )}
      </button>
    );
  }
);

FilterPill.displayName = 'FilterPill';
