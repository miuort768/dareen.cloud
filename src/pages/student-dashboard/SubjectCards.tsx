import { BookOpen, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Enrollment } from './types'

interface SubjectCardsProps {
  enrollments: Enrollment[]
}

const subjectColors = [
  { bg: 'bg-primary-soft dark:bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
  { bg: 'bg-success-soft dark:bg-success-soft', text: 'text-success', bar: 'bg-success' },
  { bg: 'bg-info-soft dark:bg-info-soft', text: 'text-info', bar: 'bg-info' },
  { bg: 'bg-warning-soft dark:bg-warning-soft', text: 'text-warning', bar: 'bg-warning' },
  { bg: 'bg-error-soft dark:bg-error-soft', text: 'text-error', bar: 'bg-error' },
]

export const SubjectCards = ({ enrollments }: SubjectCardsProps) => {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/schedule')}
          className="text-[11px] font-semibold text-primary transition-all hover:underline dark:text-primary"
        >
          عرض الكل
        </button>
        <h3 className="text-[13px] font-bold text-main dark:text-main">المواد</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((en, idx) => {
          const used = Number(en.sessionsUsed || 0)
          const total = Number(en.sessionsTotal || 1)
          const progress = Math.min(Math.round((used / total) * 100), 100)
          const color = subjectColors[idx % subjectColors.length]!

          return (
            <div
              key={en.id || idx}
              className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:shadow-elevation-1 dark:border-primary/20 dark:bg-card"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl ${color.bg} flex shrink-0 items-center justify-center`}
                >
                  <BookOpen size={18} className={color.text} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-[13px] font-bold text-main dark:text-main">
                    {en.subject || 'دورة'}
                  </h4>
                  {en.teacherName && (
                    <p className="flex items-center gap-1 text-[11px] text-muted dark:text-muted">
                      <User size={9} /> {en.teacherName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-border dark:bg-border">
                  <div
                    className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted dark:text-muted">
                  {used} من {total} حصة
                </span>
                <span className={`text-[11px] font-bold ${color.text}`}>{progress}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
