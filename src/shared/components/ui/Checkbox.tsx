import React from 'react';
import { cn } from '../../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-main cursor-pointer select-none">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            'rounded border-border text-primary focus:ring-2 focus:ring-focus focus:outline-none cursor-pointer',
            className
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-main cursor-pointer select-none">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn(
            'border-border text-primary focus:ring-2 focus:ring-focus focus:outline-none cursor-pointer',
            className
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
