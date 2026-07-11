import React from 'react';
import { cn } from '../../../lib/utils';
import { Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-card border border-border/50 shadow-soft rounded-card',
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
            'flex items-center justify-center gap-2 bg-success hover:bg-success-dark active:bg-success-dark',
            'text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-soft',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

const statConfig: { title: string; icon: React.ComponentType<{ size?: number }>; bg: string; iconBg: string }[] = [
    { title: 'إجمالي المهتمين', icon: Users, bg: 'bg-primary', iconBg: 'bg-primary-soft' },
    { title: 'عملاء جدد', icon: Clock, bg: 'bg-info', iconBg: 'bg-info-soft' },
    { title: 'تم التحويل', icon: CheckCircle2, bg: 'bg-success', iconBg: 'bg-success-soft' },
    { title: 'معدل التحويل', icon: TrendingUp, bg: 'bg-warning', iconBg: 'bg-warning-soft' },
];

export const StatItem = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ComponentType<{ size?: number }> }) => {
    const cfg = statConfig.find(s => s.title === title);
    return (
        <div className={cn('flex items-center gap-3 p-4 rounded-card shadow-soft bg-card border border-border/50')}>
            <div className={cn('w-11 h-11 rounded-card flex items-center justify-center shrink-0', cfg?.iconBg || 'bg-primary-soft')}>
                <Icon size={20} className={cn('text-primary', cfg?.title === 'عملاء جدد' && 'text-info', cfg?.title === 'تم التحويل' && 'text-success', cfg?.title === 'معدل التحويل' && 'text-warning')} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted leading-none">{title}</p>
                <p className="text-card-title font-bold text-main tabular-nums mt-1">{value}</p>
            </div>
        </div>
    );
};
