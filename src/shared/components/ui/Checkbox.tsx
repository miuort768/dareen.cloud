import React from 'react';
import { cn } from '../../../lib/utils';

const sizeMap = {
    sm: { box: 'w-4 h-4', icon: 'w-3 h-3', text: 'text-xs' },
    md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-sm' },
    lg: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base' },
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, id, size = 'md', indeterminate, checked, ...props }, ref) => {
        const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
        const s = sizeMap[size];
        return (
            <label htmlFor={inputId} className={cn('inline-flex items-center gap-2 cursor-pointer select-none group', s.text, className)}>
                <div className="relative shrink-0">
                    <input
                        ref={ref}
                        id={inputId}
                        type="checkbox"
                        className="sr-only peer"
                        checked={checked}
                        aria-checked={indeterminate ? 'mixed' : checked}
                        {...props}
                    />
                    <div className={cn(
                        s.box,
                        'rounded-md border-2 flex items-center justify-center transition-all duration-150',
                        'bg-card border-border group-hover:border-primary/50',
                        'peer-checked:bg-primary peer-checked:border-primary peer-checked:text-on-primary',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-card',
                        'dark:bg-card dark:border-border dark:peer-checked:bg-primary dark:peer-checked:border-primary'
                    )}>
                        <svg
                            className={cn(s.icon, 'text-on-primary', (checked || indeterminate) ? 'opacity-100 scale-100' : 'opacity-0 scale-0')}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ transition: 'opacity 0.15s, transform 0.15s' }}
                        >
                            {indeterminate ? (
                                <line x1="5" y1="12" x2="19" y2="12" />
                            ) : (
                                <polyline points="20 6 9 17 4 12" />
                            )}
                        </svg>
                    </div>
                </div>
                {label && <span className="text-main">{label}</span>}
            </label>
        );
    }
);
Checkbox.displayName = 'Checkbox';

const radioSizeMap = {
    sm: { outer: 'w-4 h-4', inner: 'w-2 h-2', text: 'text-xs' },
    md: { outer: 'w-5 h-5', inner: 'w-2.5 h-2.5', text: 'text-sm' },
    lg: { outer: 'w-6 h-6', inner: 'w-3 h-3', text: 'text-base' },
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, id, size = 'md', ...props }, ref) => {
        const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;
        const s = radioSizeMap[size];
        return (
            <label htmlFor={inputId} className={cn('inline-flex items-center gap-2 cursor-pointer select-none group', s.text, className)}>
                <div className="relative shrink-0">
                    <input
                        ref={ref}
                        id={inputId}
                        type="radio"
                        className="sr-only peer"
                        {...props}
                    />
                    <div className={cn(
                        s.outer,
                        'rounded-full border-2 flex items-center justify-center transition-all duration-150',
                        'bg-card border-border group-hover:border-primary/50',
                        'peer-checked:border-primary',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-card',
                        'dark:bg-card dark:border-border dark:peer-checked:border-primary'
                    )}>
                        <div className={cn(
                            s.inner,
                            'rounded-full bg-primary transition-all duration-150 scale-0 peer-checked:scale-100'
                        )} />
                    </div>
                </div>
                {label && <span className="text-main">{label}</span>}
            </label>
        );
    }
);
Radio.displayName = 'Radio';
