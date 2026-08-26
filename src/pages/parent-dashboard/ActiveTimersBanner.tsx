import { Clock } from 'lucide-react'
import type { ActiveTimerSession } from './types'

interface ActiveTimersBannerProps {
  activeTimers: ActiveTimerSession[]
  children: { id: string; name: string }[]
  formatTime: (startedAt: string | null | undefined) => string
}

export const ActiveTimersBanner = ({
  activeTimers,
  children: kids,
  formatTime,
}: ActiveTimersBannerProps) => {
  if (activeTimers.length === 0) return null

  return (
    <div className="space-y-2">
      {activeTimers.map((session) => {
        const child = kids.find((c) => c.id === session.studentId)
        return (
          <div
            key={session.id}
            className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-warning-soft dark:bg-warning-soft">
                  <Clock size={18} className="text-warning dark:text-warning" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-main dark:text-main">حصة جارية الآن</h3>
                  <p className="text-[11px] font-medium text-muted dark:text-muted">
                    {child?.name || 'ابن'} — {session.subject}
                  </p>
                </div>
              </div>
              <div className="font-mono text-xl font-bold tracking-widest text-main dark:text-main">
                {formatTime(session.startedAt)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
