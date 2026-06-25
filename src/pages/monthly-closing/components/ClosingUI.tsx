import React from 'react';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl',
        className
    )}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub, color = '#6C4BFF' }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string; color?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}12`, color }}>
            <Icon size={15} />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-[#64748B] mt-0.5">{sub}</p>}
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
            'flex items-center justify-center gap-2 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] hover:from-[#5A3FE0] hover:to-[#7C4DE6]',
            'text-white text-xs font-bold px-4 py-2 transition-all shadow-sm active:scale-[0.97] rounded-xl',
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
            'text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-2 border border-slate-200 dark:border-slate-700 transition-all shadow-sm rounded-xl',
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70">{title}</p>
                <p className="text-lg font-black leading-none mt-0.5 text-white">{value}</p>
                {subValue && <p className="text-[9px] font-bold text-white/60 mt-1">{subValue}</p>}
            </div>
        </div>
    </div>
);
