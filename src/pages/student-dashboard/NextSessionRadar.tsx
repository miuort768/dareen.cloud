import { useNavigate } from 'react-router-dom'
import { CalendarClock, ArrowLeft, FileText } from 'lucide-react'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import type { NextSessionInfo } from './types'

interface NextSessionRadarProps {
  session: NextSessionInfo | null
}

export const NextSessionRadar = ({ session }: NextSessionRadarProps) => {
  const navigate = useNavigate()

  if (!session) {
    return (
      <section
        aria-label="الحصة القادمة"
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors duration-slow"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
            <CalendarClock size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-main">لا توجد حصص قادمة</p>
            <p className="text-[11px] font-bold text-muted">استرح، أو راجع جدولك الأسبوعي</p>
          </div>
        </div>
      </section>
    )
  }

  const when = session.isToday
    ? `اليوم ${session.hour} ${periodLabel(session.period, true)}`
    : `${session.day} ${session.hour} ${periodLabel(session.period, true)}`

  return (
    <section
      aria-label="الحصة القادمة"
      className="overflow-hidden rounded-2xl border border-primary/30 bg-surface shadow-sm transition-colors duration-slow"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 bg-primary-soft px-5 py-3">
        <p className="flex items-center gap-2 text-xs font-black text-main">
          <CalendarClock size={14} className="text-primary" />
          الحصة القادمة
        </p>
        <span className="rounded-2xl bg-surface px-2.5 py-1 text-[11px] font-black tabular-nums text-main">
          {when}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-main">{session.subject}</p>
          <p className="truncate text-[11px] font-bold text-muted">مع {session.teacher}</p>
          {session.notes && (
            <p className="mt-2 flex items-start gap-1.5 rounded-2xl border border-primary/20 bg-primary-soft p-2.5 text-[11px] font-bold leading-relaxed text-main">
              <FileText size={12} className="mt-0.5 shrink-0 text-primary" />
              {session.notes}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/schedule')}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-on-primary shadow-sm transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          aria-label="فتح الجدول الأسبوعي"
        >
          الجدول
          <ArrowLeft size={13} />
        </button>
      </div>
    </section>
  )
}
