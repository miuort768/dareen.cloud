import React from 'react';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden',
        className
    )}>
        {children}
    </div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled, type = 'button' }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

export const StatItem = ({ title, value, icon: Icon, subValue, bg }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }>, subValue?: string, bg: string }) => (
    <div className={cn("p-4 rounded-2xl shadow-sm flex flex-col items-center text-center text-white relative overflow-hidden", bg)}>
        <div className="absolute -right-4 -top-4 opacity-10">
            <Icon size={64} />
        </div>
        <div className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-white/10 backdrop-blur-sm">
            <Icon size={16} className="text-white" />
        </div>
        <p className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/80">{title}</p>
        <p className="relative z-10 text-lg md:text-xl font-black mt-1 font-mono">{value}</p>
        {subValue && <p className="relative z-10 text-[9px] mt-1 font-bold text-white/60">{subValue}</p>}
    </div>
);
