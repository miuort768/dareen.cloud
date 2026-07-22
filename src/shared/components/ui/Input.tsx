import React from 'react';
import { cn } from '../../../lib/utils';
import { FormField, useFormField } from './FormField';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const InputInner = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, type = 'text', size: sizeProp, ...props }, ref) => {
    const { id, error, size } = useFormField();
    const sz = sizeProp || size;
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</span>
        )}
        {rightIcon && (
          <span className="absolute end-2 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'w-full bg-card border border-border/70 rounded-xl font-medium outline-none transition-all duration-normal',
            'focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm',
            'hover:border-border-strong',
            'placeholder:text-dim/50',
            sizeStyles[sz],
            leftIcon ? 'ps-10' : '',
            rightIcon ? 'pe-12' : '',
            error ? 'border-error/70 focus:border-error focus:ring-error/10' : '',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>
    );
  }
);
InputInner.displayName = 'InputInner';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, ...props }, ref) => {
    const isUsingFormField = !!(props as Record<string, unknown>)['data-form-field'];
    if (isUsingFormField) {
      return <InputInner ref={ref} {...props} />;
    }
    return (
      <FormField.Root error={error} required={required}>
        {label && <FormField.Label>{label}</FormField.Label>}
        <InputInner ref={ref} {...props} data-form-field="true" />
        {error && <FormField.Error>{error}</FormField.Error>}
        {!error && helperText && <FormField.Hint>{helperText}</FormField.Hint>}
      </FormField.Root>
    );
  }
);

Input.displayName = 'Input';
