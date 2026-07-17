import React from 'react';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-card border border-border shadow-sm rounded-2xl',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <Icon size={15} />
        </div>
        <div>
            <p className="text-sm font-bold text-main">{label}</p>
            {sub && <p className="text-micro text-muted mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-gradient-to-l from-primary to-primary-hover',
            'text-on-primary text-xs font-bold px-4 py-2 transition-all shadow-sm active:scale-[0.97] rounded-xl hover:brightness-90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

export const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string;
}) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-card hover:bg-hover',
            'text-muted text-xs font-bold px-3 py-2 border border-border transition-all shadow-sm rounded-xl',
            'active:scale-[0.97]',
            className
        )}
    >
        {children}
    </button>
);

export const StatItem = ({ title, value, icon: Icon, color, subValue }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }>, color: string, subValue?: string }) => (
    <div className="rounded-2xl p-4 dark:brightness-[0.65]" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                <Icon size={20} className="text-on-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-micro font-bold text-on-primary/70">{title}</p>
                <p className="text-lg font-black leading-none mt-0.5 text-on-primary">{value}</p>
                {subValue && <p className="text-micro font-bold text-on-primary/60 mt-1">{subValue}</p>}
            </div>
        </div>
    </div>
);
