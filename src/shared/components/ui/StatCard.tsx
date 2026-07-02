import React from 'react';
import { cn } from '../../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: { value: number; isUp: boolean; label?: string };
  unit?: string;
  badge?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

const styles: Record<string, { card: string; icon: string; value: string; title: string; trend: string; skeleton: string }> = {
  default: {
    card: 'bg-card border border-border text-main',
    icon: 'bg-primary-soft text-primary',
    value: 'text-main',
    title: 'text-muted',
    trend: 'text-muted',
    skeleton: 'bg-border',
  },
  primary: {
    card: 'bg-primary text-on-primary',
    icon: 'bg-white/20 text-on-primary',
    value: 'text-on-primary',
    title: 'text-on-primary opacity-70',
    trend: 'text-on-primary opacity-80',
    skeleton: 'bg-white/20',
  },
  success: {
    card: 'bg-success text-on-success',
    icon: 'bg-white/20 text-on-success',
    value: 'text-on-success',
    title: 'text-on-success opacity-70',
    trend: 'text-on-success opacity-80',
    skeleton: 'bg-white/20',
  },
  warning: {
    card: 'bg-warning text-on-warning',
    icon: 'bg-white/20 text-on-warning',
    value: 'text-on-warning',
    title: 'text-on-warning opacity-70',
    trend: 'text-on-warning opacity-80',
    skeleton: 'bg-white/20',
  },
  error: {
    card: 'bg-error text-on-error',
    icon: 'bg-white/20 text-on-error',
    value: 'text-on-error',
    title: 'text-on-error opacity-70',
    trend: 'text-on-error opacity-80',
    skeleton: 'bg-white/20',
  },
  info: {
    card: 'bg-info text-on-info',
    icon: 'bg-white/20 text-on-info',
    value: 'text-on-info',
    title: 'text-on-info opacity-70',
    trend: 'text-on-info opacity-80',
    skeleton: 'bg-white/20',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  unit,
  badge,
  subtitle,
  loading = false,
  className,
}: StatCardProps) => {
  const s = styles[variant];

  return (
    <div className={cn(
      'relative p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
      s.card,
      className
    )}>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className={cn('w-10 h-10 rounded-xl', s.skeleton)} />
          <div className="space-y-2">
            <div className={cn('h-3 w-20 rounded', s.skeleton)} />
            <div className={cn('h-7 w-28 rounded', s.skeleton)} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            {Icon && (
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.icon)}>
                <Icon size={18} />
              </div>
            )}
            {badge && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0', s.title)}>
                {badge}
              </span>
            )}
          </div>

          <div className="mt-3 min-w-0">
            <p className={cn('text-2xl font-black tabular-nums tracking-tight leading-none', s.value)}>
              {value ?? '—'}
              {unit && <span className={cn('text-xs font-bold mr-1', s.title)}>{unit}</span>}
            </p>
            <p className={cn('text-[11px] font-medium mt-1 truncate', s.title)}>
              {title}
            </p>
            {subtitle && (
              <p className={cn('text-[10px] font-medium mt-0.5 truncate opacity-60', s.title)}>
                {subtitle}
              </p>
            )}
          </div>

          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-semibold', s.trend)}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              {trend.label && <span className="opacity-60">{trend.label}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

StatCard.displayName = 'StatCard';
