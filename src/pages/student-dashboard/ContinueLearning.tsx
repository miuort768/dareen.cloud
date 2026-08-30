import { BookOpen, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Enrollment } from './types'

interface ContinueLearningProps {
  enrollments: Enrollment[]
}

export const ContinueLearning = ({ enrollments }: ContinueLearningProps) => {
  const navigate = useNavigate()

  if (enrollments.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-main dark:text-main">تابع تعلمك</h3>
        <button
          onClick={() => navigate('/schedule')}
          className="text-xs font-semibold text-primary transition-all hover:underline dark:text-primary"
        >
          عرض الكل
        </button>
      </div>

      <div
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
        role="region"
        aria-label="المتابعة التعلم"
        tabIndex={0}
      >
        {enrollments.slice(0, 5).map((en, idx) => {
          const used = Number(en.sessionsUsed || 0)
          const total = Number(en.sessionsTotal || 1)
          const progress = Math.min(Math.round((used / total) * 100), 100)

          return (
            <div
              key={en.id || idx}
              className="min-w-[200px] shrink-0 snap-start rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:shadow-elevation-1 dark:border-primary/20 dark:bg-card"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
                  <BookOpen size={16} className="text-primary dark:text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-bold text-main dark:text-main">
                    {en.subject || 'دورة'}
                  </h4>
                  {en.teacherName && (
                    <p className="truncate text-[11px] text-muted dark:text-muted">
                      {en.teacherName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-border dark:bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 dark:bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted dark:text-muted">{progress}%</span>
                <button
                  onClick={() => navigate('/schedule')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary transition-all hover:underline"
                >
                  متابعة <ArrowLeft size={10} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
