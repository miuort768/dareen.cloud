import { User, Star, MessageSquare, Award, X, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '../../../shared/components/ui'

interface BriefSession {
  date: string
  topics: string
  homework?: string
  rating: string
}

interface BriefStudent {
  id: string
  name: string
  grade: string
  notes?: string
  curriculum?: string
  totalPoints?: number
}

interface StudentQuickBriefProps {
  isOpen: boolean
  onClose: () => void
  onGenerateReport?: (student: BriefStudent) => void
  student: BriefStudent | null
  enrollment?: {
    subject: string
    nextSessionNotes?: string
  }
  recentSessions: BriefSession[]
}

export const StudentQuickBrief = ({
  isOpen,
  onClose,
  onGenerateReport,
  student,
  enrollment,
  recentSessions,
}: StudentQuickBriefProps) => {
  if (!isOpen || !student) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-background dark:bg-black/70 md:items-center md:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={`ملخص ${student.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[12px_12px_0px_0px_black] dark:border-primary/20 dark:bg-card">
        {/* Header Section */}
        <div className="border-b-2 border-border bg-background p-6 dark:border-primary/20 dark:bg-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-background text-main shadow-md dark:border-primary/20 dark:bg-surface dark:text-main">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-medium uppercase tracking-tight text-main">
                  {student.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-background px-2 py-0.5 text-micro font-medium uppercase text-main dark:bg-surface dark:text-main">
                    {student.grade}
                  </span>
                  <span className="flex items-center gap-1 border-2 border-border bg-warning px-2 py-0.5 text-micro font-medium uppercase text-on-warning dark:border-primary/20 dark:bg-primary dark:text-on-primary">
                    <Star size={10} className="fill-warning dark:fill-primary" />
                    {student.totalPoints || 0} النقاط
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="h-8 w-8 rounded-2xl border-2 border-border hover:bg-error hover:text-on-error dark:border-primary/20"
              aria-label="إغلاق"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
          {/* Reminder Row */}
          {enrollment?.nextSessionNotes && (
            <div className="relative rounded-2xl border-2 border-warning bg-warning-soft p-5 dark:border-primary/30 dark:bg-primary/5">
              <div className="absolute end-2 top-2">
                <Sparkles size={16} className="text-warning" />
              </div>
              <p className="mb-2 text-micro font-medium uppercase text-warning dark:text-primary">
                تحضير الجلسة القادمة
              </p>
              <p className="text-sm font-normal leading-tight text-warning dark:text-primary/80">
                "{enrollment.nextSessionNotes}"
              </p>
            </div>
          )}

          {/* Context Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted">
              <MessageSquare size={14} className="text-primary dark:text-primary" />
              <h4 className="text-micro font-medium uppercase">سياق ولي الأمر</h4>
            </div>
            <div className="rounded-2xl border-2 border-border bg-background p-5 text-sm font-normal leading-relaxed text-main dark:border-primary/20 dark:bg-card dark:text-main">
              {student.notes || 'لا توجد ملاحظات من ولي الأمر لهذا الطالب.'}
            </div>
          </div>

          {/* Timeline Row */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted">
              <TrendingUp size={14} className="text-success" />
              <h4 className="text-micro font-medium uppercase">مسار التعلم الأخير</h4>
            </div>

            <div className="space-y-2">
              {recentSessions.length > 0 ? (
                recentSessions.map((sess, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between rounded-2xl border-2 border-divider bg-card p-4 transition-all hover:border-border dark:border-primary/10 dark:bg-card dark:hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="mb-1 text-micro font-medium uppercase text-muted">
                        {sess.date}
                      </p>
                      <p className="truncate text-sm font-medium uppercase tracking-tight text-main">
                        {sess.topics}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-2xl border border-divider bg-success"></div>
                        <p className="text-micro font-medium uppercase text-success">
                          الأداء: {sess.rating}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-border bg-background text-muted dark:border-primary/20 dark:bg-surface dark:text-muted">
                      <Award size={20} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border bg-background py-12 text-center dark:border-primary/20 dark:bg-card">
                  <p className="text-micro font-medium uppercase text-muted">مرحلة البدء</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 border-t-2 border-border bg-background p-6 dark:border-primary/20 dark:bg-card">
          <Button
            onClick={() => onGenerateReport?.(student)}
            className="h-12 flex-1 rounded-2xl border-2 border-border bg-success text-on-success shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
          >
            <Sparkles size={16} />
            إصدار تقرير شهري
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="h-12 rounded-2xl border-2 border-border px-8 shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}
