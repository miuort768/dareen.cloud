import { AlertCircle, Clock, AlertTriangle, Info, BellRing, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LowBalanceStudent } from '../types'
import { DashboardSectionHead } from './DashboardSectionHead'

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

interface AlertItem {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  cardBg: string
  borderColor: string
  titleColor: string
  textColor: string
  title: string
  desc: string
}

export const SmartNotifications = ({
  lowBalanceStudents,
  focusStudents,
}: SmartNotificationsProps) => {
  const expired = lowBalanceStudents.filter((s) => s.remainingSessions === 0)
  const low = lowBalanceStudents.filter((s) => s.remainingSessions > 0 && s.remainingSessions <= 2)

  const alerts: AlertItem[] = []

  if (expired.length > 0) {
    alerts.push({
      icon: AlertCircle,
      iconBg: 'bg-error',
      iconColor: 'text-on-error',
      cardBg: 'bg-error-soft',
      borderColor: 'border-error-soft',
      titleColor: 'text-error-strong',
      textColor: 'text-main',
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
      iconBg: 'bg-warning',
      iconColor: 'text-on-warning',
      cardBg: 'bg-warning-soft',
      borderColor: 'border-warning/25',
      titleColor: 'text-warning-strong',
      textColor: 'text-main',
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
      iconBg: 'bg-warning',
      iconColor: 'text-on-warning',
      cardBg: 'bg-warning-soft',
      borderColor: 'border-warning/25',
      titleColor: 'text-warning-strong',
      textColor: 'text-main',
      title: f.name,
      desc: f.reason,
    })
  })

  if (alerts.length === 0) {
    alerts.push({
      icon: Info,
      iconBg: 'bg-success',
      iconColor: 'text-on-success',
      cardBg: 'bg-success-soft',
      borderColor: 'border-success/25',
      titleColor: 'text-success-strong',
      textColor: 'text-main',
      title: 'كل شيء على ما يرام',
      desc: 'لا توجد تنبيهات تستدعي انتباهك حالياً',
    })
  }

  const urgencyLabel = expired.length > 0 ? 'عاجل' : low.length > 0 ? 'مهم' : ''

  return (
    <div>
      <DashboardSectionHead
        icon={BellRing}
        title="مركز التنبيهات"
        afterTitle={
          urgencyLabel ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-black',
                expired.length > 0
                  ? 'border border-error-soft bg-error-soft text-error-strong'
                  : 'border border-warning-soft bg-warning-soft text-warning-strong',
              )}
            >
              {urgencyLabel}
            </span>
          ) : null
        }
        action={
          <span className="shrink-0 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-black text-muted shadow-elevation-1">
            {alerts.length} تنبيه
          </span>
        }
      />

      <div className="grid auto-rows-fr grid-cols-1 gap-2.5">
        {alerts.map((alert, i) => (
          <div
            key={`alert-${i}`}
            className={cn(
              'flex h-full items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-normal hover:shadow-elevation-1',
              alert.cardBg,
              alert.borderColor,
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-elevation-1',
                  alert.iconBg,
                  alert.iconColor,
                )}
              >
                <alert.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className={cn('mb-0.5 text-xs font-black', alert.titleColor)}>{alert.title}</p>
                <p
                  className={cn(
                    'line-clamp-2 text-[11px] font-medium leading-relaxed',
                    alert.textColor,
                  )}
                >
                  {alert.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
