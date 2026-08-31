import { Star, Clock } from 'lucide-react'
import type { PointLog } from './types'

interface RecentActivityProps {
  pointLogs: PointLog[]
}

export const RecentActivity = ({ pointLogs }: RecentActivityProps) => {
  const recent = pointLogs.slice(0, 5)

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-5">
      <h3 className="mb-4 text-sm font-bold text-main dark:text-main">آخر النشاطات</h3>

      <div className="relative">
        <div className="absolute bottom-0 start-[11px] top-0 w-px bg-border dark:bg-border" />

        <div className="space-y-3">
          {recent.map((log, i) => {
            const isPositive = log.amount >= 0
            return (
              <div key={log.id || `log-${i}`} className="relative flex items-start gap-3">
                <div
                  className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                    isPositive ? 'bg-success-soft' : 'bg-error-soft'
                  }`}
                >
                  <Star size={11} className={isPositive ? 'text-success' : 'text-error'} />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-main dark:text-main">
                      {log.action}
                    </p>
                    {log.date && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted dark:text-muted">
                        <Clock size={9} /> {log.date}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${
                      isPositive ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {log.amount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
