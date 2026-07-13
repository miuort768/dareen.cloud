import React, { createContext, useContext, useId } from 'react';
import { cn } from '../../../lib/utils';

interface FormFieldContextValue {
    id: string;
    error?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export const useFormField = () => {
    const ctx = useContext(FormFieldContext);
    if (!ctx) throw new Error('useFormField must be used within <FormField>');
    return ctx;
};

interface FormFieldProps {
    children: React.ReactNode;
    error?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Root = ({ children, error, required, size = 'md', className }: FormFieldProps) => {
    const id = useId();
    return (
        <FormFieldContext.Provider value={{ id, error, required, size }}>
            <div className={cn('w-full flex flex-col gap-1.5 text-start', className)} dir="rtl">
                {children}
            </div>
        </FormFieldContext.Provider>
    );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

const Label = ({ children, className, ...props }: LabelProps) => {
    const { id, required } = useFormField();
    return (
        <label htmlFor={id} className={cn('text-xs font-bold text-main', className)} {...props}>
            {children}
            {required && <span className="text-error ms-1" aria-hidden="true">*</span>}
        </label>
    );
};

interface HintProps {
    children: React.ReactNode;
    className?: string;
}

const Hint = ({ children, className }: HintProps) => (
    <p className={cn('text-xs text-muted', className)}>{children}</p>
);

interface ErrorProps {
    children: React.ReactNode;
    className?: string;
}

const ErrorMsg = ({ children, className }: ErrorProps) => (
    <span className={cn('text-xs font-bold text-error flex items-center gap-1', className)}>
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {children}
    </span>
);

export const FormField = { Root, Label, Hint, Error: ErrorMsg };
