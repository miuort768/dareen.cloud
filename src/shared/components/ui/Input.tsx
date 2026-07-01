import React from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-right" dir="rtl">
        {label && (
          <label className="text-xs font-bold text-main">{label}</label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2.5 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300',
            'focus:border-primary focus:ring-2 focus:ring-focus',
            error ? 'border-error focus:border-error focus:ring-2 focus:ring-focus' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-bold text-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-muted">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-right" dir="rtl">
        {label && (
          <label className="text-xs font-bold text-main">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300 min-h-[100px]',
            'focus:border-primary focus:ring-2 focus:ring-focus',
            error ? 'border-error focus:border-error focus:ring-2 focus:ring-focus' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-bold text-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-muted">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
