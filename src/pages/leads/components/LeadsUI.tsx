import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, UserPlus, CheckCircle2, Phone, Star, Target, XCircle, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { LeadStatus, LeadPriority } from '../../../features/crm/types';

const avatarGradients = [
    'from-[#6366f1] to-[#8b5cf6]',
    'from-[#10b981] to-[#06b6d4]',
    'from-[#f59e0b] to-[#ef4444]',
    'from-[#06b6d4] to-[#6366f1]',
    'from-[#ef4444] to-[#f59e0b]',
    'from-[#8b5cf6] to-[#10b981]',
];
const getGradient = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

export const GradientAvatar = ({ name, size = 'md', ring }: { name: string; size?: 'sm' | 'md' | 'lg'; ring?: string }) => {
    const gradient = getGradient(name);
    const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return (
        <div className={cn(
            'shrink-0 rounded-full flex items-center justify-center font-bold text-white',
            `bg-gradient-to-br ${gradient}`,
            ring,
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
        bars.current = [base * 0.3, base * 0.7, base * 0.5, base * 0.9, base * 0.6, base * 0.8, base];
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

export const StatCard = ({ title, value, icon: Icon, sparklineColor, trend }: {
    title: string; value: string | number; icon?: React.ComponentType<{ size?: number; className?: string }>; sparklineColor?: string; trend?: { value: string; up: boolean };
}) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    useEffect(() => {
        const target = numericValue;
        const duration = 800; const steps = 20; const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => { current += increment; if (current >= target) { setAnimatedValue(target); clearInterval(timer); } else { setAnimatedValue(Math.floor(current)); } }, duration / steps);
        return () => clearInterval(timer);
    }, [numericValue]);
    return (
        <div className="relative p-4 rounded-2xl bg-card dark:bg-[#131836] border border-border dark:border-white/[0.06] overflow-hidden group hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-2">
                {Icon ? <Icon size={18} className="text-primary" /> : <BarChart3 size={18} className="text-primary" />}
                {trend && (
                    <span className={cn('text-[10px] font-bold flex items-center gap-0.5', trend.up ? 'text-success' : 'text-error')}>
                        {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {trend.value}
                    </span>
                )}
            </div>
            <p className="text-xl font-bold text-main tabular-nums leading-none">{typeof value === 'string' && isNaN(Number(value)) ? value : animatedValue}</p>
            <p className="text-[11px] text-muted mt-1">{title}</p>
            {sparklineColor && <div className="mt-2"><Sparkline value={numericValue} color={sparklineColor} /></div>}
        </div>
    );
};

export const statusIconComponents: Record<LeadStatus | 'all', React.ComponentType<{ size?: number; className?: string }>> = {
    all: BarChart3, new: UserPlus, contacted: Phone, interested: Star, trial: Target, converted: CheckCircle2, lost: XCircle,
};
export const statusColors: Record<LeadStatus, { label: string; color: string; bg: string; dot: string; darkBg: string; darkText: string }> = {
    new: { label: 'جديد', color: 'text-info', bg: 'bg-info/15', dot: 'bg-info', darkBg: 'bg-info/20', darkText: 'text-info' },
    contacted: { label: 'تم الاتصال', color: 'text-warning', bg: 'bg-warning/15', dot: 'bg-warning', darkBg: 'bg-warning/20', darkText: 'text-warning' },
    interested: { label: 'مهتم', color: 'text-success', bg: 'bg-success/15', dot: 'bg-success', darkBg: 'bg-success/20', darkText: 'text-success' },
    trial: { label: 'حصة تجريبية', color: 'text-primary', bg: 'bg-primary/15', dot: 'bg-primary', darkBg: 'bg-primary/20', darkText: 'text-primary' },
    converted: { label: 'محول', color: 'text-info', bg: 'bg-info/15', dot: 'bg-info', darkBg: 'bg-info/20', darkText: 'text-info' },
    lost: { label: 'مفقود', color: 'text-error', bg: 'bg-error/15', dot: 'bg-error', darkBg: 'bg-error/20', darkText: 'text-error' },
};

export const StatusChip = ({ status, size = 'sm' }: { status: LeadStatus; size?: 'sm' | 'md' }) => {
    const cfg = statusColors[status];
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 font-bold rounded-full border transition-all',
            size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            'dark:border-white/10 border-current/10',
            cfg.bg, cfg.color, cfg.darkBg, cfg.darkText,
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    );
};

export const priorityConfig: Record<LeadPriority, { label: string; color: string; bg: string; darkBg: string; darkText: string }> = {
    high: { label: 'عالية', color: 'text-error', bg: 'bg-error/15', darkBg: 'bg-error/20', darkText: 'text-error' },
    medium: { label: 'متوسطة', color: 'text-warning', bg: 'bg-warning/15', darkBg: 'bg-warning/20', darkText: 'text-warning' },
    low: { label: 'منخفضة', color: 'text-muted', bg: 'bg-surface dark:bg-white/5', darkBg: 'bg-white/5', darkText: 'text-muted' },
};
export const getPriority = (p: LeadPriority | string) => priorityConfig[p as LeadPriority] || priorityConfig.low;

export const getLeadAge = (createdAt: string) => {
    const now = new Date(); const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMins / 60); const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return { text: 'الآن', color: 'text-success' };
    if (diffMins < 60) return { text: `منذ ${diffMins} د`, color: 'text-success' };
    if (diffHours < 24) return { text: `منذ ${diffHours} س`, color: 'text-info' };
    if (diffDays < 7) return { text: `منذ ${diffDays} أيام`, color: 'text-warning' };
    if (diffDays < 30) return { text: `منذ ${diffDays} يوم`, color: 'text-error' };
    return { text: created.toLocaleDateString('ar-SA'), color: 'text-muted' };
};

export const ActionBtn = ({ onClick, icon: Icon, label, color = 'success', title }: {
    onClick: (e: React.MouseEvent) => void; icon: React.ComponentType<{ size?: number }>; label: string;
    color?: 'success' | 'error' | 'info' | 'warning' | 'primary'; title?: string;
}) => {
    const colorMap = {
        success: 'bg-success/10 text-success hover:bg-success/20 border-success/20 dark:bg-success/15 dark:text-success dark:border-success/15',
        error: 'bg-error/10 text-error hover:bg-error/20 border-error/20 dark:bg-error/15 dark:text-error dark:border-error/15',
        info: 'bg-info/10 text-info hover:bg-info/20 border-info/20 dark:bg-info/15 dark:text-info dark:border-info/15',
        warning: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20 dark:bg-warning/15 dark:text-warning dark:border-warning/15',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/15',
    };
    return (
        <button onClick={onClick} title={title || label} aria-label={title || label}
            className={cn('inline-flex items-center justify-center w-8 h-8 text-[10px] font-bold rounded-xl border transition-all active:scale-95', colorMap[color])}>
            <Icon size={14} />
        </button>
    );
};

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card dark:bg-[#131836] border border-border dark:border-white/[0.06] rounded-2xl', className)}>{children}</div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled, type = 'button' }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) => (
    <button type={type} disabled={disabled} onClick={onClick}
        className={cn('inline-flex items-center justify-center gap-2 bg-gradient-to-l from-[#6366f1] to-[#8b5cf6] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed', className)}>
        {children}
    </button>
);
