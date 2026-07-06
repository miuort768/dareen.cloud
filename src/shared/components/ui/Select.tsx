import React from 'react';
import { cn } from '../../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full flex flex-col gap-1.5 text-end" dir="rtl">
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-main">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 px-4 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300 appearance-none cursor-pointer',
              'focus:border-primary focus:ring-2 focus:ring-focus',
              error ? 'border-error focus:border-error' : '',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {error && (
          <span className="text-xs font-bold text-error">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
