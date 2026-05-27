import React from 'react';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-2xl',
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
            'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500',
            'text-white text-[11px] font-bold px-4 py-2.5 transition-all active:scale-95 rounded-xl',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const statBgMap: Record<string, string> = {
  'إجمالي المهتمين': 'from-blue-500 to-blue-600',
  'عملاء جدد': 'from-blue-500 to-cyan-500',
  'تم التحويل': 'from-emerald-500 to-green-600',
  'معدل التحويل': 'from-amber-400 to-orange-500',
};

export const StatItem = ({ title, value, icon: Icon, bg }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }>, bg?: string }) => (
    <div className={cn(
        "relative flex flex-col items-center text-center text-white overflow-hidden rounded-2xl",
        "bg-gradient-to-br shadow-sm border border-white/10",
        statBgMap[title] || 'from-blue-500 to-blue-600'
    )}>
        <div className="absolute left-2 bottom-0 opacity-15">
            <Icon size={56} className="md:size-[72px]" />
        </div>
        <div className="relative z-10 w-full px-3 py-4 md:px-4 md:py-5 flex flex-col items-center gap-1 md:gap-1.5">
            <Icon size={18} className="md:w-5 md:h-5 text-white/90" />
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/80">{title}</p>
            <p className="text-base md:text-2xl font-black tabular-nums">{value}</p>
        </div>
    </div>
);
