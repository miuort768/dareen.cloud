import React from 'react';
import { cn } from '../../../lib/utils';

const trackSizeMap = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
};

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, id, size = 'md', ...props }, ref) => {
        const inputId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;
        const s = trackSizeMap[size];
        return (
            <label htmlFor={inputId} className={cn('inline-flex items-center gap-3 cursor-pointer select-none group', className)}>
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type="checkbox"
                        className="sr-only peer"
                        {...props}
                    />
                    <div className={cn(
                        s.track,
                        'rounded-full border transition-colors',
                        'bg-surface border-border peer-checked:bg-primary peer-checked:border-primary',
                        'dark:bg-card dark:border-border dark:peer-checked:bg-primary',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-card'
                    )} />
                    <div className={cn(
                        s.thumb,
                        'absolute top-0.5 start-0.5 rounded-full bg-white dark:bg-surface shadow-sm transition-transform',
                        'peer-checked:[transform:translateX(100%)]',
                        'rtl:peer-checked:[transform:translateX(-100%)]'
                    )} />
                </div>
                {label && <span className={cn('text-main', size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm')}>{label}</span>}
            </label>
        );
    }
);

Switch.displayName = 'Switch';
