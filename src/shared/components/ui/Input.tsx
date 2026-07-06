import React from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full flex flex-col gap-1.5 text-start" dir="rtl">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-main">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full h-10 px-4 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300',
            'focus:border-primary focus:ring-2 focus:ring-focus',
            error ? 'border-error focus:border-error focus:ring-2 focus:ring-focus' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-bold text-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted">{helperText}</span>
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
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full flex flex-col gap-1.5 text-start" dir="rtl">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-main">{label}</label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-2.5 bg-card border border-border rounded-card text-sm font-medium outline-none transition-all duration-300 min-h-[100px]',
            'focus:border-primary focus:ring-2 focus:ring-focus',
            error ? 'border-error focus:border-error focus:ring-2 focus:ring-focus' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-bold text-error">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
