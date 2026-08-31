import { useNavigate } from 'react-router-dom'
import { ChevronLeft, BookOpen, Clock, TrendingUp, Users } from 'lucide-react'
import type { Student } from '../../types'

interface ChildrenCardsProps {
  children: Student[]
}

export const ChildrenCards = ({ children: kids }: ChildrenCardsProps) => {
  const navigate = useNavigate()

  if (kids.length === 0) return null

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft dark:bg-primary/10">
            <Users size={16} className="text-primary dark:text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-main dark:text-main">الأبناء</h3>
            <p className="text-[10px] text-muted dark:text-muted">
              {kids.length} {kids.length === 1 ? 'ابن' : 'أبناء'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/parent-students')}
          className="flex items-center gap-1 rounded-lg text-[11px] font-semibold text-primary transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:text-primary"
        >
          عرض الكل <ChevronLeft size={12} />
        </button>
      </div>
      <div className="space-y-3">
        {kids.map((child) => {
          const enrollments = child.enrollments || []
          const totalUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0)
          const totalSessions = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0)
          const progress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0

          return (
            <button
              key={child.id}
              onClick={() => navigate('/parent-students')}
              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-end transition-all duration-200 hover:bg-hover hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] dark:border-border dark:bg-surface dark:hover:bg-hover"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary dark:bg-primary">
                <span className="text-sm font-bold text-on-primary dark:text-on-primary">
                  {(child.name || 'ط').charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-main dark:text-main">
                  {child.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted dark:text-muted">
                  {child.grade && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={9} /> {child.grade}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock size={9} /> {enrollments.length} مواد
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className="relative h-10 w-10">
                  <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      className="text-border dark:text-border"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-primary dark:text-primary"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 94.2} 94.2`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-main dark:text-main">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  <TrendingUp size={8} />
                  <span>التفاصيل</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
