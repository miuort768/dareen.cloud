import React from 'react';
import { cn } from '../../../lib/utils';
import { FormField, useFormField } from './FormField';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-3 py-2 text-xs min-h-[80px]',
  md: 'px-4 py-3 text-sm min-h-[100px]',
  lg: 'px-5 py-4 text-base min-h-[120px]',
};

const TextareaInner = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size: sizeProp, ...props }, ref) => {
    const { id, error, size } = useFormField();
    const sz = sizeProp || size;
    return (
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full bg-card border border-border/70 rounded-xl font-medium outline-none transition-all duration-normal resize-y',
          'focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm',
          'hover:border-border-strong',
          'placeholder:text-dim/50',
          sizeStyles[sz],
          error ? 'border-error/70 focus:border-error focus:ring-error/10' : '',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
TextareaInner.displayName = 'TextareaInner';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, ...props }, ref) => {
    return (
      <FormField.Root error={error} required={required}>
        {label && <FormField.Label>{label}</FormField.Label>}
        <TextareaInner ref={ref} {...props} />
        {error && <FormField.Error>{error}</FormField.Error>}
        {!error && helperText && <FormField.Hint>{helperText}</FormField.Hint>}
      </FormField.Root>
    );
  }
);

Textarea.displayName = 'Textarea';
