import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MobileMetricItem {
  id?: string
  title: string
  value: string | number
  icon: LucideIcon
  tone?: 'primary' | 'success' | 'warning' | 'info' | 'accent'
  trend?: {
    value: string | number
    isUp?: boolean
  }
  onClick?: () => void
}

export interface MobileMetricGridProps {
  metrics: MobileMetricItem[]
  className?: string
}

const TONE_STYLES = {
  primary: {
    iconBg: 'bg-primary-soft text-primary dark:bg-primary/20',
  },
  success: {
    iconBg: 'bg-success-soft text-success dark:bg-success/20',
  },
  warning: {
    iconBg: 'bg-warning-soft text-warning dark:bg-warning/20',
  },
  info: {
    iconBg: 'bg-info-soft text-info dark:bg-info/20',
  },
  accent: {
    iconBg: 'bg-accent-soft text-accent dark:bg-accent/20',
  },
}

/**
 * شبكة الإحصائيات 2×2 الموحدة للوحات الجوال (نفس تصميم Academy Finance في الصور)
 * بطاقات بيضاء ناعمة بظل خفيف، أيقونة دائرية/مربعة ناعمة في الأعلى، وقيمة كبيرة في المنتصف،
 * ومسمى المؤشر مع نسبة النمو/التغير في الأسفل.
 */
export const MobileMetricGrid: React.FC<MobileMetricGridProps> = ({ metrics, className }) => {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)} dir="rtl">
      {metrics.map((item, index) => {
        const Icon = item.icon
        const toneStyle = TONE_STYLES[item.tone || 'primary']

        return (
          <div
            key={item.id || index}
            onClick={item.onClick}
            role={item.onClick ? 'button' : undefined}
            tabIndex={item.onClick ? 0 : undefined}
            className={cn(
              'border-border/80 group relative flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-elevation-2',
              item.onClick && 'cursor-pointer active:scale-[0.98]',
            )}
          >
            {/* Top row: Icon */}
            <div className="mb-3 flex items-center justify-between">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-normal group-hover:scale-105',
                  toneStyle.iconBg,
                )}
              >
                <Icon size={20} strokeWidth={1.9} />
              </div>

              {item.trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-medium',
                    item.trend.isUp !== false ? 'text-success' : 'text-error',
                  )}
                >
                  {item.trend.isUp !== false ? (
                    <TrendingUp size={13} strokeWidth={2.2} />
                  ) : (
                    <TrendingDown size={13} strokeWidth={2.2} />
                  )}
                  <span>{item.trend.value}</span>
                </div>
              )}
            </div>

            {/* Middle: Big Value */}
            <div>
              <p className="truncate font-dash text-xl font-medium tracking-tight text-main sm:text-2xl">
                {item.value}
              </p>

              {/* Bottom: Title */}
              <p className="mt-1 truncate text-xs font-normal text-muted">{item.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
