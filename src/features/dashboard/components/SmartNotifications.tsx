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

export const SmartNotifications = ({
  lowBalanceStudents,
  focusStudents,
}: SmartNotificationsProps) => {
  const expired = lowBalanceStudents.filter((s) => s.remainingSessions === 0)
  const low = lowBalanceStudents.filter((s) => s.remainingSessions > 0 && s.remainingSessions <= 2)

  const alerts: {
    icon: LucideIcon
    bg: string
    on: string
    title: string
    desc: string
  }[] = []

  if (expired.length > 0) {
    alerts.push({
      icon: AlertCircle,
      bg: 'bg-error',
      on: 'text-on-error',
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
      bg: 'bg-warning',
      on: 'text-on-warning',
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
      bg: 'bg-warning',
      on: 'text-on-warning',
      title: f.name,
      desc: f.reason,
    })
  })

  if (alerts.length === 0) {
    alerts.push({
      icon: Info,
      bg: 'bg-success',
      on: 'text-on-success',
      title: 'كل شيء على ما يرام',
      desc: 'لا توجد تنبيهات حالياً',
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
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                expired.length > 0
                  ? 'bg-error-soft text-error-strong'
                  : 'bg-warning-soft text-warning-strong',
              )}
            >
              {urgencyLabel}
            </span>
          ) : null
        }
        action={
          <span className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1 text-[10px] font-bold text-muted">
            {alerts.length} تنبيه
          </span>
        }
      />

      <div className="grid auto-rows-fr grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-1">
        {alerts.map((alert, i) => (
          <div
            key={`alert-${i}`}
            className={cn(
              'flex h-full items-start justify-between gap-3 rounded-2xl p-3.5 transition-all duration-normal hover:shadow-elevation-1',
              alert.bg,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25">
                <alert.icon size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className={cn('mb-1 text-sm font-black', alert.on)}>{alert.title}</p>
                <p className="line-clamp-3 text-[11px] font-medium leading-relaxed text-white/80">
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
