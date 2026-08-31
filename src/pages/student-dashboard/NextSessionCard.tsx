import { Clock, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { NextSession as NextSessionType } from './types'

interface NextSessionCardProps {
  nextSession: NextSessionType | null
}

export const NextSessionCard = ({ nextSession }: NextSessionCardProps) => {
  const navigate = useNavigate()

  if (!nextSession) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
            <Clock size={22} className="text-primary" />
          </div>
          <div>
            <p className="mb-0.5 text-base font-bold text-main">لا توجد حصص اليوم</p>
            <p className="text-sm font-medium text-muted">
              استرح وتابع أنشطتك الأخرى، أو راجع جدولك الأسبوعي.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/30 bg-surface shadow-sm transition-colors duration-300 dark:border-primary/30 dark:bg-card">
      <div className="p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <Clock size={15} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-main sm:text-base">الحصة القادمة</h3>
          <div className="ms-auto flex items-center gap-1.5">
            <span className="rounded-lg bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary dark:bg-primary/10 dark:text-primary">
              {nextSession.day}
            </span>
            <span className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-bold tabular-nums text-muted">
              {nextSession.time}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10 sm:h-14 sm:w-14">
            <GraduationCap size={24} className="text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-main md:text-lg">
              {nextSession.subject}
            </p>
            {nextSession.teacher && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-muted">
                <BookOpen size={12} className="shrink-0" /> {nextSession.teacher}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            aria-label={`دخول حصة ${nextSession.subject}`}
          >
            دخول <ArrowLeft size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
