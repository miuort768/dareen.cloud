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

export const PrimaryBtn = ({ onClick, children, className = '', disabled, type = 'button' }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500',
            'text-white text-[11px] font-bold px-4 py-2.5 transition-all active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const statBgMap: Record<string, string> = {
  'إجمالي المهتمين': 'from-indigo-500 to-violet-600',
  'عملاء جدد': 'from-blue-500 to-cyan-500',
  'تم التحويل': 'from-emerald-500 to-green-600',
  'معدل التحويل': 'from-amber-400 to-orange-500',
};

export const StatItem = ({ title, value, icon: Icon, bg }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }>, bg?: string }) => (
    <div className={cn(
        "relative flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/90 shadow-sm",
        "transition-all duration-200 hover:shadow-md"
    )}>
        <div className={cn(
            "w-10 h-10 flex items-center justify-center bg-gradient-to-br text-white shrink-0",
            statBgMap[title] || 'from-indigo-500 to-violet-600'
        )}>
            <Icon size={18} />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mb-1">{title}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums leading-none">{value}</p>
        </div>
    </div>
);
