import React, { useEffect, useState, useRef } from 'react'
import {
  TrendingUp,
  TrendingDown,
  UserPlus,
  CheckCircle2,
  Phone,
  Star,
  Target,
  XCircle,
  BarChart3,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { ActionButton } from '../../../shared/components/ui/ActionRow'
import type { LeadStatus, LeadPriority } from '../../../features/crm/types'

const avatarColors = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-error', 'bg-accent']
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]

export const GradientAvatar = ({
  name,
  size = 'md',
  ring,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  ring?: string
}) => {
  const bg = getAvatarColor(name)
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-on-primary',
        bg,
        ring,
        sizes[size],
      )}
    >
      {name.charAt(0) || 'ع'}
    </div>
  )
}

export const Sparkline = ({
  value,
  color,
  height = 5,
}: {
  value: number
  color: string
  height?: number
}) => {
  const bars = useRef<number[]>([])
  useEffect(() => {
    const base = Math.max(value * 0.6, 5)
    bars.current = [base * 0.3, base * 0.7, base * 0.5, base * 0.9, base * 0.6, base * 0.8, base]
  }, [value])
  const max = Math.max(...bars.current, 1)
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {bars.current.map((v, i) => (
        <div
          key={i}
          className={cn('w-1 rounded-t-[1px] transition-all', color)}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  sparklineColor,
  trend,
}: {
  title: string
  value: string | number
  icon?: React.ComponentType<{ size?: number; className?: string }>
  sparklineColor?: string
  trend?: { value: string; up: boolean }
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  useEffect(() => {
    const target = numericValue
    const duration = 800
    const steps = 20
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedValue(target)
        clearInterval(timer)
      } else {
        setAnimatedValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericValue])
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-elevation-1 dark:hover:border-primary/10">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
          {Icon ? (
            <Icon size={16} className="text-primary" />
          ) : (
            <BarChart3 size={16} className="text-primary" />
          )}
        </div>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-[10px] font-bold',
              trend.up ? 'text-success' : 'text-error',
            )}
          >
            {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {trend.value}
          </span>
        )}
      </div>
      <p className="font-outfit text-2xl font-black tabular-nums leading-none text-main">
        {typeof value === 'string' && isNaN(Number(value)) ? value : animatedValue}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-muted">{title}</p>
      {sparklineColor && (
        <div className="mt-2.5">
          <Sparkline value={numericValue} color={sparklineColor} />
        </div>
      )}
    </div>
  )
}

export const statusIconComponents: Record<
  LeadStatus | 'all',
  React.ComponentType<{ size?: number; className?: string }>
> = {
  all: BarChart3,
  new: UserPlus,
  contacted: Phone,
  interested: Star,
  trial: Target,
  converted: CheckCircle2,
  lost: XCircle,
}
export const statusColors: Record<
  LeadStatus,
  {
    label: string
    color: string
    bg: string
    activeBg: string
    activeText: string
    dot: string
    darkBg: string
    darkText: string
  }
> = {
  new: {
    label: 'جديد',
    color: 'text-info font-bold',
    bg: 'bg-info/15',
    activeBg: 'bg-info',
    activeText: 'text-on-info',
    dot: 'bg-info',
    darkBg: '',
    darkText: '',
  },
  contacted: {
    label: 'تم الاتصال',
    color: 'text-warning font-bold',
    bg: 'bg-warning/15',
    activeBg: 'bg-warning',
    activeText: 'text-on-warning',
    dot: 'bg-warning',
    darkBg: '',
    darkText: '',
  },
  interested: {
    label: 'مهتم',
    color: 'text-success font-bold',
    bg: 'bg-success/15',
    activeBg: 'bg-success',
    activeText: 'text-on-success',
    dot: 'bg-success',
    darkBg: '',
    darkText: '',
  },
  trial: {
    label: 'حصة تجريبية',
    color: 'text-primary font-bold',
    bg: 'bg-primary/15',
    activeBg: 'bg-primary',
    activeText: 'text-on-primary',
    dot: 'bg-primary',
    darkBg: '',
    darkText: '',
  },
  converted: {
    label: 'محول',
    color: 'text-info font-bold',
    bg: 'bg-info/15',
    activeBg: 'bg-info',
    activeText: 'text-on-info',
    dot: 'bg-info',
    darkBg: '',
    darkText: '',
  },
  lost: {
    label: 'مفقود',
    color: 'text-error font-bold',
    bg: 'bg-error/15',
    activeBg: 'bg-error',
    activeText: 'text-on-error',
    dot: 'bg-error',
    darkBg: '',
    darkText: '',
  },
}

export const StatusChip = ({ status, size = 'sm' }: { status: LeadStatus; size?: 'sm' | 'md' }) => {
  const cfg = statusColors[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-bold transition-all',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        cfg.bg,
        cfg.color,
        cfg.darkBg,
        cfg.darkText,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export const priorityConfig: Record<
  LeadPriority,
  { label: string; color: string; bg: string; darkBg: string; darkText: string }
> = {
  high: {
    label: 'عالية',
    color: 'text-error',
    bg: 'bg-error/10',
    darkBg: 'dark:bg-error/15',
    darkText: 'dark:text-error',
  },
  medium: {
    label: 'متوسطة',
    color: 'text-warning',
    bg: 'bg-warning/10',
    darkBg: 'dark:bg-warning/15',
    darkText: 'dark:text-warning',
  },
  low: {
    label: 'منخفضة',
    color: 'text-muted',
    bg: 'bg-surface',
    darkBg: 'dark:bg-white/5',
    darkText: 'dark:text-muted',
  },
}
export const getPriority = (p: LeadPriority | string) =>
  priorityConfig[p as LeadPriority] || priorityConfig.low

export const getLeadAge = (createdAt: string) => {
  if (!createdAt) return { text: 'غير محدد', color: 'text-muted' }
  const now = new Date()
  const created = new Date(createdAt)
  if (isNaN(created.getTime())) return { text: 'غير محدد', color: 'text-muted' }
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return { text: 'الآن', color: 'text-success' }
  if (diffMins < 60) return { text: `منذ ${diffMins} د`, color: 'text-success' }
  if (diffHours < 24) return { text: `منذ ${diffHours} س`, color: 'text-info' }
  if (diffDays < 7) return { text: `منذ ${diffDays} أيام`, color: 'text-warning' }
  if (diffDays < 30) return { text: `منذ ${diffDays} يوم`, color: 'text-error' }
  return { text: created.toLocaleDateString('ar-SA'), color: 'text-muted' }
}

export { ActionButton as ActionBtn }

export const SectionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none',
      className,
    )}
  >
    {children}
  </div>
)

export const PrimaryBtn = ({
  onClick,
  children,
  className = '',
  disabled,
  type = 'button',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm shadow-primary/10 transition-all duration-200 hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    {children}
  </button>
)
