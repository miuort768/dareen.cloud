import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('bg-card border border-border/60 rounded-2xl shadow-sm', className)}>
        {children}
    </div>
);

export const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <Icon size={15} />
        </div>
        <div>
            <p className="text-xs font-bold text-main">{label}</p>
            {sub && <p className="text-[8px] text-muted mt-0.5">{sub}</p>}
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
            'flex items-center justify-center gap-2 bg-primary text-on-primary text-[9px] font-bold px-4 py-2 transition-all active:scale-[0.97] rounded-xl hover:bg-primary-hover',
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
            'flex items-center justify-center gap-2 bg-card hover:bg-surface',
            'text-muted text-[9px] font-bold px-3 py-2 border border-border/60 transition-all rounded-xl',
            'active:scale-[0.97]',
            className
        )}
    >
        {children}
    </button>
);

/** Premium KPI card — replaces StatItem */
export const KpiCard = ({ title, value, icon: Icon, accent, subValue, trend }: {
    title: string; value: string | number; icon: React.ComponentType<{ size?: number }>;
    accent: 'primary' | 'success' | 'error' | 'warning'; subValue?: string; trend?: { value: number; positive: boolean };
}) => {
    const gradientMap = {
        primary: 'from-primary to-purple-400',
        success: 'from-success to-emerald-400',
        error: 'from-error to-rose-400',
        warning: 'from-warning to-amber-400',
    };
    const bgMap = {
        primary: 'bg-primary/[8%] text-primary',
        success: 'bg-success/[8%] text-success',
        error: 'bg-error/[8%] text-error',
        warning: 'bg-warning/[8%] text-warning',
    };
    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -1 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all p-3.5"
        >
            <div className={`absolute inset-0 opacity-[0.02] bg-gradient-to-br ${gradientMap[accent]}`} />
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientMap[accent]}`} />
            <div className="relative flex items-start justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgMap[accent]}`}>
                    <Icon size={14} />
                </div>
                {trend && (
                    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold ${trend.positive ? 'bg-success/[10%] text-success' : 'bg-error/[10%] text-error'}`}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="relative mt-2.5">
                <p className="text-[9px] font-bold text-muted">{title}</p>
                <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold text-main tabular-nums leading-none mt-0.5"
                >
                    {value}
                </motion.p>
                {subValue && (
                    <p className="text-[8px] font-bold text-muted mt-1.5 pt-1.5 border-t border-border/40">{subValue}</p>
                )}
            </div>
        </motion.div>
    );
};

/** Legacy StatItem — wrapped by KpiCard now */
export const StatItem = KpiCard;