import React from 'react';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#172554] text-white">
            <Icon size={15} />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
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
            'flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1e3a5f]',
            'text-white text-xs font-bold px-4 py-2 transition-all shadow-sm active:scale-[0.97]',
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
            'flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
            'text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm',
            'active:scale-[0.97]',
            className
        )}
    >
        {children}
    </button>
);

export const StatItem = ({ title, value, icon: Icon, color, subValue, bg }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }>, color: string, subValue?: string, bg: string }) => (
    <SectionCard className="p-4 flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
        {subValue && <p className="text-[9px] text-slate-400 mt-0.5">{subValue}</p>}
    </SectionCard>
);
