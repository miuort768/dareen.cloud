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
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-right" dir="rtl">
        {label && (
          <label className="text-xs font-bold text-main">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300 appearance-none cursor-pointer',
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
          <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {error && (
          <span className="text-[11px] font-bold text-error">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
