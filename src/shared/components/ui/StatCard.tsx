import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'soft-primary'
    | 'soft-success'
    | 'soft-warning'
    | 'soft-error'
    | 'soft-info'
  trend?: { value: number; isUp: boolean; label?: string }
  unit?: string
  badge?: string
  subtitle?: string
  /** أيقونة كبيرة شفافة كزخرفة في الزاوية السفلية */
  watermark?: boolean
  loading?: boolean
  className?: string
}

type StatVariant = NonNullable<StatCardProps['variant']>

const styles: Record<
  StatVariant,
  { card: string; icon: string; value: string; title: string; trend: string; skeleton: string }
> = {
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
  'soft-primary': {
    card: 'bg-primary-soft text-main',
    icon: 'bg-card text-primary shadow-elevation-1',
    value: 'text-main',
    title: 'text-muted',
    trend: '',
    skeleton: 'bg-card',
  },
  'soft-success': {
    card: 'bg-success-soft text-main',
    icon: 'bg-card text-success-strong shadow-elevation-1',
    value: 'text-main',
    title: 'text-muted',
    trend: '',
    skeleton: 'bg-card',
  },
  'soft-warning': {
    card: 'bg-warning-soft text-main',
    icon: 'bg-card text-warning-strong shadow-elevation-1',
    value: 'text-main',
    title: 'text-muted',
    trend: '',
    skeleton: 'bg-card',
  },
  'soft-error': {
    card: 'bg-error-soft text-main',
    icon: 'bg-card text-error-strong shadow-elevation-1',
    value: 'text-main',
    title: 'text-muted',
    trend: '',
    skeleton: 'bg-card',
  },
  'soft-info': {
    card: 'bg-info-soft text-main',
    icon: 'bg-card text-info-strong shadow-elevation-1',
    value: 'text-main',
    title: 'text-muted',
    trend: '',
    skeleton: 'bg-card',
  },
}

const isSoftVariant = (v: StatVariant) => v.startsWith('soft-') || v === 'default'

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  unit,
  badge,
  subtitle,
  watermark = false,
  loading = false,
  className,
}: StatCardProps) => {
  const s = styles[variant]
  const soft = isSoftVariant(variant)
  const wmColor = !soft
    ? 'text-on-primary opacity-10'
    : variant.endsWith('-success')
      ? 'text-success-strong opacity-[0.08]'
      : variant.endsWith('-error')
        ? 'text-error-strong opacity-[0.08]'
        : variant.endsWith('-warning')
          ? 'text-warning-strong opacity-[0.08]'
          : variant.endsWith('-info')
            ? 'text-info-strong opacity-[0.08]'
            : 'text-primary opacity-[0.08]'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5 shadow-soft transition-all duration-slow hover:-translate-y-1 hover:shadow-elevation-1',
        s.card,
        className,
      )}
    >
      {watermark && Icon && (
        <Icon
          size={84}
          strokeWidth={0.75}
          className={cn(
            'pointer-events-none absolute -bottom-4 -end-4 transition-transform duration-slow group-hover:scale-110',
            wmColor,
          )}
          aria-hidden="true"
        />
      )}
      {loading ? (
        <div className="relative z-10 flex animate-pulse flex-col gap-3">
          <div className={cn('h-10 w-24 rounded-lg', s.skeleton)} />
          <div className={cn('h-4 w-32 rounded', s.skeleton)} />
          <div className={cn('h-4 w-20 rounded', s.skeleton)} />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col">
          <div className="mb-3 flex items-start justify-between">
            <p
              className={cn(
                'text-3xl font-black tabular-nums leading-none tracking-tight',
                s.value,
              )}
            >
              {value ?? '—'}
              {unit && <span className={cn('ms-1 text-sm font-bold', s.title)}>{unit}</span>}
            </p>
            {Icon && !watermark && (
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  s.icon,
                )}
              >
                <Icon size={18} />
              </div>
            )}
            {badge && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  s.title,
                  'border border-current',
                )}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className={cn('truncate text-sm font-bold tracking-wide', s.title)}>{title}</p>

            {(subtitle || trend) && (
              <div className="mt-1 flex items-center gap-2">
                {trend && (
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-semibold',
                      soft
                        ? trend.isUp
                          ? 'bg-success-soft text-success-strong'
                          : 'bg-error-soft text-error-strong'
                        : s.trend,
                    )}
                  >
                    <span>
                      {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </span>
                    <span>{trend.value}%</span>
                    {trend.label && <span className="font-medium opacity-70">{trend.label}</span>}
                  </div>
                )}
                {subtitle && (
                  <p className={cn('truncate text-xs font-medium opacity-70', s.title)}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

StatCard.displayName = 'StatCard'
