import { Radio } from 'lucide-react'
import type { ActiveTimerSession } from './types'

interface LiveNowBannerProps {
  activeTimers: ActiveTimerSession[]
  childNames: Record<string, string>
  formatTime: (startedAt: string | null | undefined) => string
}

export const LiveNowBanner = ({ activeTimers, childNames, formatTime }: LiveNowBannerProps) => {
  if (activeTimers.length === 0) return null

  return (
    <section aria-label="حصص جارية الآن" className="space-y-2">
      {activeTimers.map((session) => (
        <div
          key={session.id}
          className="border-warning/40 relative overflow-hidden rounded-3xl border bg-warning-soft p-4 shadow-sm transition-colors duration-300"
          role="status"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
                <Radio size={18} className="text-warning" />
                <span
                  className="border-warning/40 absolute inset-0 animate-ping rounded-xl border-2"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-black text-main">
                  حصة جارية الآن
                  <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
                </p>
                <p className="truncate text-[11px] font-bold text-muted">
                  {childNames[session.studentId] || 'الابن'} — {session.subject}
                </p>
              </div>
            </div>
            <div
              className="shrink-0 rounded-xl bg-surface px-3 py-1.5 font-mono text-lg font-black tabular-nums tracking-widest text-main"
              aria-live="off"
            >
              {formatTime(session.startedAt)}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
