import React from 'react';
import { cn } from '../../../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const inputId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            {...props}
          />
          <div className={cn(
            'w-10 h-6 rounded-full transition-colors border border-border',
            'peer-checked:bg-primary peer-checked:border-primary',
            'bg-surface',
            className
          )} />
          <div className={cn(
            'absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white dark:bg-surface shadow-sm transition-transform',
            'peer-checked:translate-x-4'
          )} />
        </div>
        {label && <span className="text-sm text-main">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
