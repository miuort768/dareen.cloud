import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('rounded-2xl border border-divider bg-card shadow-sm', className)}>
    {children}
  </div>
)

export const SectionTitle = ({
  icon: Icon,
  label,
  sub,
}: {
  icon: LucideIcon
  label: string
  sub?: string
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-sm font-bold text-main">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted">{sub}</p>}
    </div>
  </div>
)

export const PrimaryBtn = ({
  onClick,
  children,
  className = '',
  disabled,
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    {children}
  </button>
)

export const SecondaryBtn = ({
  onClick,
  children,
  className = '',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-xl border border-divider bg-card px-3 py-2 text-xs font-bold text-muted outline-none transition-all hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
      className,
    )}
  >
    {children}
  </button>
)

const kpiAccentMap = {
  primary: {
    gradient: 'from-primary/20 to-primary/5',
    bg: 'bg-primary/10 text-primary',
    bar: 'bg-primary',
  },
  success: {
    gradient: 'from-success-soft to-transparent',
    bg: 'bg-success-soft text-success',
    bar: 'bg-success',
  },
  error: {
    gradient: 'from-error-soft to-transparent',
    bg: 'bg-error-soft text-error',
    bar: 'bg-error',
  },
  warning: {
    gradient: 'from-warning-soft to-transparent',
    bg: 'bg-warning-soft text-warning',
    bar: 'bg-warning',
  },
}

export const KpiCard = ({
  title,
  value,
  icon: Icon,
  accent,
  subValue,
  trend,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  accent: 'primary' | 'success' | 'error' | 'warning'
  subValue?: string
  trend?: { value: number; positive: boolean }
}) => {
  const s = kpiAccentMap[accent]
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4',
        s.gradient,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn('rounded-lg p-2', s.bg)}>
          <Icon size={16} />
        </div>
        <div className={cn('h-1 w-12 rounded-full', s.bar)} />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs text-muted">{title}</p>
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold tabular-nums leading-none text-main"
          >
            {value}
          </motion.p>
        </div>
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
              trend.positive ? 'bg-success-soft text-success' : 'bg-error-soft text-error',
            )}
          >
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{' '}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      {subValue && (
        <p className="mt-2 border-t border-divider pt-2 text-xs text-muted">{subValue}</p>
      )}
    </motion.div>
  )
}

export const StatItem = KpiCard
