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
      <div className="rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 dark:border-border dark:bg-card md:p-7">
        <div className="flex flex-col items-center gap-5 md:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
            <Clock size={24} className="text-primary dark:text-primary" />
          </div>
          <div className="text-center md:text-start">
            <p className="mb-1 text-lg font-bold text-main dark:text-main">لا توجد حصص اليوم</p>
            <p className="text-sm font-medium text-muted dark:text-muted">
              استرح وتابع أنشطتك الأخرى.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:shadow-elevation-1 dark:border-border dark:bg-card">
      <div className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <Clock size={16} className="text-primary dark:text-primary" />
          </div>
          <h3 className="text-base font-bold text-main dark:text-main md:text-lg">الحصة القادمة</h3>
          <span className="me-auto text-xs font-medium text-muted dark:text-muted">
            {nextSession.time}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
            <GraduationCap size={24} className="text-primary dark:text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-main dark:text-main md:text-lg">
              {nextSession.subject}
            </p>
            {nextSession.teacher && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted dark:text-muted">
                <BookOpen size={12} /> {nextSession.teacher}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-all duration-200 hover:bg-primary-hover active:scale-95 dark:bg-primary dark:text-on-primary dark:hover:bg-primary-hover"
            aria-label={`دخول حصة ${nextSession.subject}`}
          >
            دخول <ArrowLeft size={12} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  )
}
