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

const statStyleMap: Record<string, { color: string }> = {
  'إجمالي المهتمين': { color: '#2563EB' },
  'عملاء جدد': { color: '#38BDF8' },
  'تم التحويل': { color: '#22C55E' },
  'معدل التحويل': { color: '#F59E0B' },
};

export const StatItem = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }> }) => {
    const { color } = statStyleMap[title] || { color: '#2563EB' };
    return (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 p-4 transition-all hover:shadow-md">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12`, color }}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#64748B] leading-none">{title}</p>
                <p className="text-xl font-black text-[#0F172A] dark:text-white tabular-nums mt-1">{value}</p>
            </div>
        </div>
    );
};
