import { Star, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { PointLogEntry } from './types'

interface RecentActivityProps {
  allPointLogs: PointLogEntry[]
}

const formatDate = (timestamp: string) => {
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return ''
    return format(d, 'eeee, d MMMM HH:mm', { locale: ar })
  } catch {
    return ''
  }
}

export const RecentActivity = ({ allPointLogs }: RecentActivityProps) => {
  const recent = allPointLogs.slice(0, 5)

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card">
      <h3 className="mb-4 text-[13px] font-bold text-main dark:text-main">آخر النشاطات</h3>

      <div className="relative">
        <div className="absolute bottom-0 end-[11px] top-0 w-px bg-border dark:bg-border" />

        <div className="space-y-3">
          {recent.map((log, i) => (
            <div key={log.id || `log-${i}`} className="relative flex items-start gap-3">
              <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-success-soft dark:bg-success-soft">
                <Star size={11} className="text-success dark:text-success" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-main dark:text-main">
                    {log.action}
                  </p>
                  <p className="text-[11px] font-medium text-muted dark:text-muted">
                    {log.studentName}
                  </p>
                  {log.timestamp && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted dark:text-muted">
                      <Clock size={9} /> {formatDate(log.timestamp)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success dark:bg-success-soft">
                  +{log.amount || log.points || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recent.length === 0 && (
        <div className="py-8 text-center">
          <Star size={24} className="mx-auto mb-2 text-muted dark:text-muted" />
          <p className="text-[11px] font-medium text-muted dark:text-muted">لا توجد نشاطات حديثة</p>
        </div>
      )}
    </div>
  )
}
