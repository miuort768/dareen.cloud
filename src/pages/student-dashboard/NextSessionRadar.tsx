import { useNavigate } from 'react-router-dom'
import { CalendarClock, Clock, User, FileText, ArrowLeft, Sparkles } from 'lucide-react'
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
        className="rounded-[24px] border border-border bg-card p-5 shadow-elevation-1 transition-colors duration-slow"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <CalendarClock size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-main">لا توجد حصص قادمة</p>
            <p className="text-xs text-muted">استرح، أو راجع جدولك الدراسي المتبقي</p>
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
      className="border-border/80 p-5.5 group relative flex flex-col justify-between overflow-hidden rounded-[26px] border bg-card shadow-elevation-1 transition-all duration-normal hover:shadow-elevation-2 sm:p-6"
    >
      {/* Decorative accent top bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-hover to-primary-deep" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p className="flex items-center gap-2 text-xs font-bold text-main">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary shadow-soft">
              <CalendarClock size={15} />
            </span>
            الحصة القادمة
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tabular-nums text-primary">
            <Clock size={12} />
            {when}
          </span>
        </div>

        <p className="mt-4 truncate text-xl font-black leading-tight text-main md:text-2xl">
          {session.subject}
        </p>

        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary">
            <User size={12} />
          </span>
          <span className="truncate">المعلم: {session.teacher}</span>
        </p>

        {session.notes && (
          <p className="bg-primary-soft/50 mt-3.5 flex items-start gap-2 rounded-2xl border border-primary/20 p-3 text-xs leading-relaxed text-main">
            <FileText size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{session.notes}</span>
          </p>
        )}
      </div>

      <button
        onClick={() => navigate('/schedule')}
        className="group/btn mt-5 inline-flex min-h-12 w-full items-center justify-between rounded-2xl bg-primary px-4 text-start font-bold text-on-primary shadow-elevation-1 transition-all duration-normal hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
        aria-label="عرض تفاصيل الحصة القادمة في الجدول"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-on-primary">
            <Sparkles size={15} />
          </span>
          <span className="text-xs font-bold text-on-primary">الانتقال للجدول الدراسي</span>
        </div>
        <ArrowLeft
          size={16}
          className="text-on-primary transition-transform duration-normal group-hover/btn:-translate-x-1"
        />
      </button>
    </section>
  )
}
