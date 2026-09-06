import { useDialogFocus } from '../../../shared/hooks/useDialogFocus'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Award,
  Star,
  Calendar,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Trash2,
  History,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { ProgressBar } from '../../../shared/components/ui'
import { RATING_OPTIONS, averageRatingOf, getAvatarGradient } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface EvaluationDrawerProps {
  student: Student | null
  evaluations: Evaluation[]
  canDelete: (ev: Evaluation) => boolean
  onDelete: (id: string) => void
  onClose: () => void
}

export const EvaluationDrawer = ({
  student,
  evaluations,
  canDelete,
  onDelete,
  onClose,
}: EvaluationDrawerProps) => {
  const [visibleCount, setVisibleCount] = useState(3)
  const studentEvals = useMemo(
    () =>
      (evaluations || [])
        .filter((ev) => ev.studentId === student?.id)
        .sort(
          (a, b) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime(),
        ),
    [evaluations, student?.id],
  )

  const { containerRef, handleKeyDown } = useDialogFocus(!!student, onClose)
  const totalXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0)
  const totalSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0)
  const usedSessions = (student?.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0)
  const progress = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0
  const gradient = getAvatarGradient(student?.name || '')
  const avgRating = averageRatingOf(studentEvals)

  return (
    <AnimatePresence>
      {student && (
        <motion.div
          key="drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div
            className="absolute inset-0 bg-black/30"
            role="presentation"
            aria-hidden="true"
            onClick={onClose}
          />
          <motion.div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label={`ملف التقييمات: ${student?.name}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="relative flex max-h-[75vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3"
            dir="rtl"
          >
            {/* Header — محايد وهادئ مع أفاتار ملون */}
            <div className="relative border-b border-border bg-surface px-4 py-3">
              <button
                onClick={onClose}
                aria-label="إغلاق الملف"
                className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted transition-all hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X size={13} />
              </button>
              <div className="flex items-center gap-3 pe-8">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold shadow-elevation-2 ring-2 ring-primary/10',
                    gradient.g,
                    gradient.on,
                  )}
                >
                  {(student?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-black text-main">{student?.name}</h2>
                  <p className="text-micro font-medium text-muted">{student?.grade || '—'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-micro font-bold text-main">
                      <Star size={8} className="text-info-strong" /> {avgRating || '—'}
                    </span>
                    {totalXP > 0 && (
                      <span className="flex items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-micro font-bold text-primary dark:bg-primary/10">
                        <Award size={8} /> {totalXP} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    icon: BookOpen,
                    value: (student?.enrollments || []).length,
                    label: 'المواد',
                    color: 'text-primary bg-primary-soft dark:bg-primary/10',
                  },
                  {
                    icon: Calendar,
                    value: `${usedSessions}/${totalSessions}`,
                    label: 'الحصص',
                    color: 'text-info-strong bg-info-soft',
                  },
                  {
                    icon: TrendingUp,
                    value: `${progress}%`,
                    label: 'الحضور',
                    color: 'text-success-strong bg-success-soft',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-surface p-2 text-center"
                  >
                    <div
                      className={cn(
                        'mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-md',
                        item.color,
                      )}
                    >
                      <item.icon size={11} />
                    </div>
                    <p className="text-xs font-bold tabular-nums text-main">{item.value}</p>
                    <p className="text-micro text-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {totalSessions > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-micro text-muted">
                    <span>تقدم الحصص</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <ProgressBar
                    value={progress}
                    variant={progress >= 75 ? 'success' : progress >= 50 ? 'info' : 'error'}
                    className="h-1.5"
                  />
                </div>
              )}

              {/* Enrollments */}
              {(student?.enrollments || []).length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="flex items-center gap-1 text-micro font-bold text-muted">
                    <GraduationCap size={10} /> المواد
                  </h5>
                  {(student?.enrollments || []).map((en, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-main">{en.subject}</p>
                        <p className="text-micro text-muted">
                          {typeof en.teacher === 'string' ? en.teacher : en.teacher?.name}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-bold tabular-nums text-main">
                        {en.sessionsUsed}/{en.sessionsTotal}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Evaluations History */}
              <div className="space-y-1.5">
                <h5 className="flex items-center gap-1 text-micro font-bold text-muted">
                  <History size={10} /> سجل التقييمات
                  <span className="rounded bg-primary-soft px-1 py-0.5 text-micro font-bold text-primary">
                    {studentEvals.length}
                  </span>
                </h5>
                {studentEvals.length > 0 ? (
                  <>
                    {studentEvals.slice(0, visibleCount).map((ev) => {
                      const r =
                        RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
                      return (
                        <div key={ev.id} className="rounded-lg border border-border bg-surface p-2">
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span
                                className={cn(
                                  'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-micro font-bold',
                                  r.pill,
                                )}
                              >
                                <r.icon size={8} />
                                {ev.rating}
                              </span>
                              {ev.points > 0 && (
                                <span className="rounded bg-primary-soft px-1 py-0.5 text-micro font-bold text-primary dark:bg-primary/10">
                                  +{ev.points}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-micro text-muted">
                                {format(new Date(ev.created_at || ev.date), 'dd/MM')}
                              </span>
                              {canDelete(ev) && (
                                <button
                                  onClick={() => onDelete(ev.id)}
                                  aria-label={`حذف تقييم ${format(new Date(ev.created_at || ev.date), 'dd/MM')}`}
                                  className="rounded p-1 text-muted transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-micro leading-relaxed text-muted">
                            {ev.notes || 'بدون ملاحظات'}
                          </p>
                        </div>
                      )
                    })}
                    {studentEvals.length > visibleCount && (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 3)}
                        className="flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-surface py-2 text-micro font-bold text-muted transition-all hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        <ChevronDown size={12} />
                        المزيد ({studentEvals.length - visibleCount})
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-border py-6 text-center">
                    <History size={16} className="mx-auto mb-1 text-muted" />
                    <p className="text-xs font-bold text-muted">لا يوجد سجل</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-surface px-3 py-2">
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-main transition-colors hover:border-primary/30 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
