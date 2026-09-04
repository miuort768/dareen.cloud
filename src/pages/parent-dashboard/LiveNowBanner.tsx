import { Radio, ShieldCheck } from 'lucide-react'
import type { ActiveTimerSession } from './types'

interface LiveNowBannerProps {
  activeTimers: ActiveTimerSession[]
  childNames: Record<string, string>
  formatTime: (startedAt: string | null | undefined) => string
}

/** بانر "حصة جارية الآن" — مؤقت مباشر + اسم المعلمة والمادة والابن */
export const LiveNowBanner = ({ activeTimers, childNames, formatTime }: LiveNowBannerProps) => {
  if (activeTimers.length === 0) return null

  return (
    <section aria-label="حصص جارية الآن" className="space-y-2.5">
      {activeTimers.map((session) => (
        <div
          key={session.id}
          className="border-error/40 relative overflow-hidden rounded-2xl border bg-error-soft shadow-sm transition-colors duration-300"
          role="status"
        >
          <div
            className="bg-error/10 pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
                <Radio size={18} className="text-error" />
                <span
                  className="border-error/40 absolute inset-0 animate-ping rounded-2xl border-2"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-black text-main">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-error" />
                  حصة جارية الآن
                </p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-muted">
                  {childNames[session.studentId] || 'الابن'} — {session.subject}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-error">
                  <ShieldCheck size={10} className="shrink-0" />
                  المعلمة: {session.teacherName || 'غير محددة'}
                </p>
              </div>
            </div>
            <div
              className="shrink-0 rounded-2xl bg-card px-3 py-2 text-center shadow-sm"
              aria-live="off"
            >
              <p className="font-mono text-xl font-black tabular-nums leading-none tracking-widest text-error">
                {formatTime(session.startedAt)}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase text-muted">مدة الحصة</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
