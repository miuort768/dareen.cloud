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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none transition-all duration-300",
            "focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-bold text-red-500 dark:text-red-400">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {helperText}
          </span>
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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none transition-all duration-300 min-h-[100px]",
            "focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-bold text-red-500 dark:text-red-400">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
