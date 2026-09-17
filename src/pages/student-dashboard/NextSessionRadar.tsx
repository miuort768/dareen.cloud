import { useNavigate } from 'react-router-dom'
import { CalendarClock, ArrowLeft, FileText, Clock, User } from 'lucide-react'
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
        className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow"
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
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 shadow-elevation-1 transition-all duration-slow hover:shadow-elevation-2 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* شريط جانبي ملون */}
      <div className="absolute inset-y-0 start-0 w-1 bg-primary" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-black text-main">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CalendarClock size={14} />
            </span>
            الحصة القادمة
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black tabular-nums text-on-primary">
            <Clock size={11} />
            {when}
          </span>
        </div>

        <p className="mt-3 truncate text-lg font-black leading-tight text-main md:text-xl">
          {session.subject}
        </p>

        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-muted">
          <User size={12} className="shrink-0 text-primary" />
          <span className="truncate">مع {session.teacher}</span>
        </p>

        {session.notes && (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-primary/20 bg-primary-soft p-2.5 text-[11px] font-bold leading-relaxed text-main">
            <FileText size={12} className="mt-0.5 shrink-0 text-primary" />
            {session.notes}
          </p>
        )}
      </div>

      <button
        onClick={() => navigate('/schedule')}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-5 py-3 text-xs font-black text-on-primary shadow-elevation-1 transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 sm:self-center"
        aria-label="عرض تفاصيل الحصة القادمة في الجدول"
      >
        عرض التفاصيل
        <ArrowLeft size={14} />
      </button>
    </section>
  )
}
