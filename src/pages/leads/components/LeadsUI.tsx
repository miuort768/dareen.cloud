import React from 'react';
import { cn } from '../../../lib/utils';
import { Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

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
            'flex items-center justify-center gap-2 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500',
            'text-white text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const statConfig: { title: string; icon: React.ComponentType<{ size?: number }>; gradient: string }[] = [
    { title: 'إجمالي المهتمين', icon: Users, gradient: 'from-[#6C4BFF] to-[#8B5CF6]' },
    { title: 'عملاء جدد', icon: Clock, gradient: 'from-blue-500 to-blue-600' },
    { title: 'تم التحويل', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
    { title: 'معدل التحويل', icon: TrendingUp, gradient: 'from-amber-500 to-orange-600' },
];

export const StatItem = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }> }) => {
    const cfg = statConfig.find(s => s.title === title);
    return (
        <div className={cn('flex items-center gap-3 p-4 rounded-2xl shadow-sm transition-all hover:shadow-md bg-gradient-to-br', cfg?.gradient || 'from-[#6C4BFF] to-[#8B5CF6]')}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70 leading-none">{title}</p>
                <p className="text-xl font-black text-white tabular-nums mt-1">{value}</p>
            </div>
        </div>
    );
};
