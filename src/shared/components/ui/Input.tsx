import React from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, type = 'text', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full flex flex-col gap-1.5 text-start" dir="rtl">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-main/80">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full h-11 px-4 bg-card border border-border/70 rounded-xl text-sm font-medium outline-none transition-all duration-200',
              'focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm',
              'hover:border-border-strong',
              leftIcon ? 'ps-10' : '',
              error ? 'border-error/70 focus:border-error focus:ring-error/10' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-bold text-error/90 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted/80">{helperText}</span>
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
          <label htmlFor={textareaId} className="text-xs font-bold text-main/80">{label}</label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 bg-card border border-border/70 rounded-xl text-sm font-medium outline-none transition-all duration-200 min-h-[100px]',
            'focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:shadow-sm',
            'hover:border-border-strong',
            error ? 'border-error/70 focus:border-error focus:ring-error/10' : '',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-bold text-error/90 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted/80">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
