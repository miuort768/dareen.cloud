import { FileText } from 'lucide-react'
import type { Student } from '../../types'

interface HomeworkNotesProps {
  children: Student[]
}

export const HomeworkNotes = ({ children: kids }: HomeworkNotesProps) => {
  const hasNotes = kids.some((child) => child.enrollments?.some((en) => en.nextSessionNotes))
  if (!hasNotes) return null

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-soft dark:bg-warning-soft">
          <FileText size={13} className="text-warning dark:text-warning" />
        </div>
        <h3 className="text-sm font-bold text-main dark:text-main">الواجبات والملاحظات</h3>
      </div>
      <div className="space-y-3">
        {kids
          .filter((child) => child.enrollments?.some((en) => en.nextSessionNotes))
          .map((child) => (
            <div key={child.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary" />
                <span className="text-xs font-bold text-muted dark:text-muted">{child.name}</span>
              </div>
              <div className="ms-4 space-y-2">
                {child.enrollments
                  .filter((en) => en.nextSessionNotes)
                  .map((en, idx) => (
                    <div
                      key={`note-${child.id}-${idx}`}
                      className="rounded-xl border border-primary/10 bg-primary-soft p-3 dark:border-primary/10 dark:bg-primary/5"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary dark:text-primary">
                          {en.subject}
                        </span>
                        <span className="text-[11px] text-muted dark:text-muted">
                          {(typeof en.teacher === 'string' ? en.teacher : en.teacher?.name) ||
                            en.teacherName}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-main dark:text-main">
                        {en.nextSessionNotes}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
