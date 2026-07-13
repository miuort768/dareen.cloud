import React from 'react';
import { cn } from '../../../lib/utils';
import { ChevronDown } from 'lucide-react';
import { FormField } from './FormField';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, required, size = 'md', ...props }, ref) => {
    return (
      <FormField.Root error={error} required={required} size={size}>
        {label && <FormField.Label>{label}</FormField.Label>}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full bg-card border border-border/70 rounded-xl font-medium outline-none transition-all duration-200 appearance-none cursor-pointer',
              'focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm',
              'hover:border-border-strong',
              sizeStyles[size],
              error ? 'border-error/70 focus:border-error focus:ring-error/10' : '',
              className
            )}
            aria-invalid={!!error}
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
          <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {error && <FormField.Error>{error}</FormField.Error>}
      </FormField.Root>
    );
  }
);

Select.displayName = 'Select';
