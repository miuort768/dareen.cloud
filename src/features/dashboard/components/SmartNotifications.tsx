import { AlertCircle, Clock, AlertTriangle, Info, BellRing, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LowBalanceStudent } from '../types'

interface FocusStudent {
  id: string
  name: string
  reason: string
  type: string
}

interface SmartNotificationsProps {
  lowBalanceStudents: LowBalanceStudent[]
  focusStudents: FocusStudent[]
}

export const SmartNotifications = ({
  lowBalanceStudents,
  focusStudents,
}: SmartNotificationsProps) => {
  const expired = lowBalanceStudents.filter((s) => s.remainingSessions === 0)
  const low = lowBalanceStudents.filter((s) => s.remainingSessions > 0 && s.remainingSessions <= 2)

  const alerts: {
    icon: LucideIcon
    border: string
    bg: string
    text: string
    iconColor: string
    accent: string
    title: string
    desc: string
  }[] = []

  if (expired.length > 0) {
    alerts.push({
      icon: AlertCircle,
      border: 'border-error dark:border-error',
      bg: 'bg-error-soft dark:bg-error-soft',
      text: 'text-error dark:text-error',
      iconColor: 'text-error dark:text-error',
      accent: 'bg-error dark:bg-error',
      title: `${expired.length} طالب منتهي اشتراكهم`,
      desc:
        expired
          .slice(0, 3)
          .map((s) => s.studentName)
          .join('، ') + (expired.length > 3 ? ` و${expired.length - 3} آخرين` : ''),
    })
  }

  if (low.length > 0) {
    alerts.push({
      icon: Clock,
      border: 'border-warning dark:border-warning',
      bg: 'bg-warning-soft dark:bg-warning-soft',
      text: 'text-warning dark:text-warning',
      iconColor: 'text-warning dark:text-warning',
      accent: 'bg-warning dark:bg-warning',
      title: `${low.length} طالب رصيدهم على وشك النفاد`,
      desc:
        low
          .slice(0, 3)
          .map((s) => `${s.studentName} (${s.remainingSessions} حصص)`)
          .join('، ') + (low.length > 3 ? ` و${low.length - 3} آخرين` : ''),
    })
  }

  focusStudents.slice(0, 3).forEach((f) => {
    alerts.push({
      icon: AlertTriangle,
      border: 'border-warning dark:border-warning',
      bg: 'bg-warning-soft dark:bg-warning-soft',
      text: 'text-warning dark:text-warning',
      iconColor: 'text-warning dark:text-warning',
      accent: 'bg-warning dark:bg-warning',
      title: f.name,
      desc: f.reason,
    })
  })

  if (alerts.length === 0) {
    alerts.push({
      icon: Info,
      border: 'border-success dark:border-success',
      bg: 'bg-success-soft dark:bg-success-soft',
      text: 'text-success dark:text-success',
      iconColor: 'text-success dark:text-success',
      accent: 'bg-success dark:bg-success',
      title: 'كل شيء على ما يرام',
      desc: 'لا توجد تنبيهات حالياً',
    })
  }

  const urgencyLabel = expired.length > 0 ? 'عاجل' : low.length > 0 ? 'مهم' : ''

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black text-main">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <BellRing size={14} className="text-primary dark:text-primary" />
          </div>
          مركز التنبيهات
          {urgencyLabel && (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                expired.length > 0
                  ? 'bg-error-soft text-error dark:bg-error-soft dark:text-error'
                  : 'bg-warning-soft text-warning dark:bg-warning-soft dark:text-warning',
              )}
            >
              {urgencyLabel}
            </span>
          )}
        </h3>
        <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[10px] font-bold text-muted dark:border-border dark:bg-hover dark:text-muted">
          {alerts.length} تنبيه
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {alerts.map((alert, i) => (
          <div
            key={`alert-${i}`}
            className={cn(
              'relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 transition-colors duration-200',
              alert.bg,
              alert.border,
            )}
          >
            <div className={cn('absolute bottom-0 start-0 top-0 w-1', alert.accent)} />
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card dark:border-border dark:bg-hover',
              )}
            >
              <alert.icon size={17} className={alert.iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('mb-1 text-sm font-bold', alert.text)}>{alert.title}</p>
              <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-muted">
                {alert.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
