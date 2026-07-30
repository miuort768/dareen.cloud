import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border/30 rounded-2xl shadow-sm', className)}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <Icon size={15} />
        </div>
        <div>
            <p className="text-sm font-bold text-main">{label}</p>
            {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button disabled={disabled} onClick={onClick}
        className={cn('flex items-center justify-center gap-2 bg-primary text-on-primary text-xs font-bold px-4 py-2 transition-all active:scale-[0.97] rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed', className)}>
        {children}
    </button>
);

export const SecondaryBtn = ({ onClick, children, className = '' }: {
    onClick?: () => void; children: React.ReactNode; className?: string;
}) => (
    <button onClick={onClick}
        className={cn('flex items-center justify-center gap-2 bg-card hover:bg-surface text-muted text-xs font-bold px-3 py-2 border border-border/30 transition-all rounded-xl active:scale-[0.97]', className)}>
        {children}
    </button>
);

const kpiAccentMap = {
    primary: { gradient: 'from-primary/20 to-primary/5', bg: 'bg-primary/10 text-primary', bar: 'bg-primary' },
    success: { gradient: 'from-success/20 to-success/5', bg: 'bg-success/10 text-success', bar: 'bg-success' },
    error: { gradient: 'from-error/20 to-error/5', bg: 'bg-error/10 text-error', bar: 'bg-error' },
    warning: { gradient: 'from-warning/20 to-warning/5', bg: 'bg-warning/10 text-warning', bar: 'bg-warning' },
};

export const KpiCard = ({ title, value, icon: Icon, accent, subValue, trend }: {
    title: string; value: string | number; icon: React.ComponentType<{ size?: number }>;
    accent: 'primary' | 'success' | 'error' | 'warning'; subValue?: string; trend?: { value: number; positive: boolean };
}) => {
    const s = kpiAccentMap[accent];
    return (
        <motion.div whileHover={{ scale: 1.02, y: -2 }}
            className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", s.gradient)}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", s.bg)}><Icon size={16} /></div>
                <div className={cn("h-1 w-12 rounded-full", s.bar)} />
            </div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-muted mb-1">{title}</p>
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-bold text-main tabular-nums leading-none">{value}</motion.p>
                </div>
                {trend && (
                    <div className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold", trend.positive ? 'bg-success/10 text-success' : 'bg-error/10 text-error')}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            {subValue && <p className="text-xs text-muted mt-2 pt-2 border-t border-border/30">{subValue}</p>}
        </motion.div>
    );
};

export const StatItem = KpiCard;
