import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../../lib/utils';
import type { LeadStatus, LeadPriority } from '../../../features/crm/types';

const avatarGradients = [
    'from-primary to-info',
    'from-success to-info',
    'from-warning to-error',
    'from-info to-primary',
    'from-error to-warning',
    'from-primary to-success',
];
const getGradient = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

export const GradientAvatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
    const gradient = getGradient(name);
    const sizes = { sm: 'w-7 h-7 text-[11px]', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
    return (
        <div className={cn(
            'shrink-0 rounded-xl flex items-center justify-center font-bold text-on-primary shadow-sm',
            `bg-gradient-to-br ${gradient}`,
            sizes[size],
        )}>
            {name.charAt(0) || 'ع'}
        </div>
    );
};

export const Sparkline = ({ value, color, height = 5 }: { value: number; color: string; height?: number }) => {
    const bars = useRef<number[]>([]);
    useEffect(() => {
        const base = Math.max(value * 0.6, 5);
        bars.current = [
            base * 0.3, base * 0.7, base * 0.5,
            base * 0.9, base * 0.6, base * 0.8, base,
        ];
    }, [value]);
    const max = Math.max(...bars.current, 1);
    return (
        <div className="flex items-end gap-[2px]" style={{ height }}>
            {bars.current.map((v, i) => (
                <div key={i} className={cn('w-1 rounded-t-[1px] transition-all', color)} style={{ height: `${(v / max) * 100}%` }} />
            ))}
        </div>
    );
};

export const statEmojis: Record<string, string> = {
    'إجمالي العملاء': '👥',
    'عملاء جدد': '🆕',
    'تم التحويل': '✅',
    'معدل التحويل': '📈',
};

export const StatCard = ({ title, value, icon: Icon, sparklineColor, trend }: {
    title: string;
    value: string | number;
    icon?: React.ComponentType<{ size?: number }>;
    sparklineColor?: string;
    trend?: { value: string; up: boolean };
}) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    useEffect(() => {
        const target = numericValue;
        const duration = 800;
        const steps = 20;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setAnimatedValue(target);
                clearInterval(timer);
            } else {
                setAnimatedValue(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [numericValue]);

    return (
        <div className="relative p-4 rounded-2xl bg-card border border-border overflow-hidden group hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-2">
                <span className="text-lg">{statEmojis[title] || '📊'}</span>
                {trend && (
                    <span className={cn('text-[10px] font-bold flex items-center gap-0.5', trend.up ? 'text-success' : 'text-error')}>
                        {trend.up ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <p className="text-xl font-bold text-main tabular-nums leading-none">{typeof value === 'string' && isNaN(Number(value)) ? value : animatedValue}</p>
            <p className="text-[11px] text-muted mt-1">{title}</p>
            {sparklineColor && <div className="mt-2"><Sparkline value={numericValue} color={sparklineColor} /></div>}
        </div>
    );
};

export const statusEmojis: Record<LeadStatus | 'all', string> = {
    all: '📊',
    new: '🆕',
    contacted: '📞',
    interested: '⭐',
    trial: '🎯',
    converted: '✅',
    lost: '❌',
};
export const statusColors: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
    new: { label: 'جديد', color: 'text-info', bg: 'bg-info-soft', dot: 'bg-info' },
    contacted: { label: 'تم الاتصال', color: 'text-warning', bg: 'bg-warning-soft', dot: 'bg-warning' },
    interested: { label: 'مهتم', color: 'text-success', bg: 'bg-success-soft', dot: 'bg-success' },
    trial: { label: 'حصة تجريبية', color: 'text-primary', bg: 'bg-primary-soft', dot: 'bg-primary' },
    converted: { label: 'محول', color: 'text-info', bg: 'bg-info-soft', dot: 'bg-info' },
    lost: { label: 'مفقود', color: 'text-error', bg: 'bg-error-soft', dot: 'bg-error' },
};

export const StatusChip = ({ status, size = 'sm' }: { status: LeadStatus; size?: 'sm' | 'md' }) => {
    const cfg = statusColors[status];
    const emoji = statusEmojis[status];
    return (
        <span className={cn(
            'inline-flex items-center gap-1 font-bold rounded-full border transition-all',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            cfg.bg, cfg.color, 'border-current/15'
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {emoji && <span className="text-[10px]">{emoji}</span>}
            {cfg.label}
        </span>
    );
};

export const priorityConfig: Record<LeadPriority, { label: string; color: string; bg: string }> = {
    high: { label: 'عالية', color: 'text-error', bg: 'bg-error-soft' },
    medium: { label: 'متوسطة', color: 'text-warning', bg: 'bg-warning-soft' },
    low: { label: 'منخفضة', color: 'text-muted', bg: 'bg-surface' },
};
export const getPriority = (p: LeadPriority | string) => priorityConfig[p as LeadPriority] || priorityConfig.low;

export const getLeadAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return { text: 'الآن', color: 'text-success' };
    if (diffMins < 60) return { text: `منذ ${diffMins} د`, color: 'text-success' };
    if (diffHours < 24) return { text: `منذ ${diffHours} س`, color: 'text-info' };
    if (diffDays < 7) return { text: `منذ ${diffDays} أيام`, color: 'text-warning' };
    if (diffDays < 30) return { text: `منذ ${diffDays} يوم`, color: 'text-error' };
    return { text: created.toLocaleDateString('ar-SA'), color: 'text-muted' };
};

export const ActionBtn = ({ onClick, icon: Icon, label, color = 'success', title }: {
    onClick: (e: React.MouseEvent) => void;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    color?: 'success' | 'error' | 'info' | 'warning' | 'primary';
    title?: string;
}) => {
    const colorMap = {
        success: 'bg-success/10 text-success hover:bg-success/20 active:bg-success/30',
        error: 'bg-error/10 text-error hover:bg-error/20 active:bg-error/30',
        info: 'bg-info/10 text-info hover:bg-info/20 active:bg-info/30',
        warning: 'bg-warning/10 text-warning hover:bg-warning/20 active:bg-warning/30',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30',
    };
    return (
        <button
            onClick={onClick}
            title={title || label}
            aria-label={title || label}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all',
                'sm:opacity-70 sm:hover:opacity-100 active:scale-95',
                colorMap[color],
            )}
        >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border rounded-2xl', className)}>{children}</div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled, type = 'button' }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover active:bg-primary-active',
            'text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);
