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
        className="rounded-none border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow"
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
      className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-slow hover:shadow-elevation-1"
    >
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
        className="group inline-flex min-h-12 w-full items-center gap-3 rounded-2xl bg-primary pe-2.5 ps-4 text-start text-on-primary shadow-soft transition-all duration-normal hover:bg-primary-hover hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        aria-label="عرض تفاصيل الحصة القادمة في الجدول"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-primary">
          <CalendarClock size={18} />
        </span>
        <span className="min-w-0 flex-1 text-xs font-black text-on-primary">عرض التفاصيل</span>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-primary transition-transform duration-normal group-hover:-translate-x-1"
        >
          <ArrowLeft size={16} />
        </span>
      </button>
    </section>
  )
}
