import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, Trash2, History, Award, Quote } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { format } from 'date-fns'
import { RATING_OPTIONS } from '../types/constants'
import type { Student, Evaluation } from '../../../types'

interface HistoryModalProps {
  student: Student | null
  evaluations: Evaluation[]
  canDelete: (evaluation: Evaluation) => boolean
  onDelete: (id: string) => void
  onClose: () => void
}

export const HistoryModal = ({
  student,
  evaluations,
  canDelete,
  onDelete,
  onClose,
}: HistoryModalProps) => {
  useEffect(() => {
    if (!student) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [student, onClose])

  const studentEvals = (evaluations || [])
    .filter((ev) => ev.studentId === student?.id)
    .sort(
      (a, b) =>
        new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime(),
    )

  const totalXP = studentEvals.reduce((s, ev) => s + (ev.points || 0), 0)

  return (
    <AnimatePresence>
      {student && (
        <motion.div
          key="history-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3"
            dir="rtl"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-5">
              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-6 -start-6 h-16 w-16 rounded-full bg-black/10 blur-xl" />
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 text-on-primary transition-all hover:bg-black/20"
              >
                <X size={16} />
              </button>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-on-primary shadow-lg ring-2 ring-white/30 backdrop-blur-sm">
                  {(student?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-on-primary">سجل التقييمات</h3>
                  <p className="text-on-primary/80 mt-0.5 truncate text-sm">{student?.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold text-on-primary">
                      <History size={10} /> {studentEvals.length} تقييم
                    </span>
                    {totalXP > 0 && (
                      <span className="bg-warning/80 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold text-on-warning">
                        <Award size={10} /> {totalXP} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation List */}
            <div className="no-scrollbar flex-1 overflow-y-auto bg-surface p-4">
              {studentEvals.length > 0 ? (
                <div className="space-y-3">
                  {studentEvals.map((ev, idx) => {
                    const r =
                      RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
                    return (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-elevation-1"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold',
                                r.pill,
                              )}
                            >
                              <r.icon size={10} strokeWidth={2.5} />
                              {ev.rating}
                            </span>
                            {ev.points > 0 && (
                              <span className="flex items-center gap-1 rounded-lg bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
                                <Award size={9} /> +{ev.points} XP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] tabular-nums text-muted">
                              {format(new Date(ev.created_at || ev.date), 'dd/MM/yyyy')}
                            </span>
                            {canDelete(ev) && (
                              <button
                                aria-label="حذف التقييم"
                                onClick={() => onDelete(ev.id)}
                                className="rounded-lg p-1 text-muted transition-all hover:bg-error-soft hover:text-error"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Quote size={12} className="mt-0.5 shrink-0 rotate-180 text-primary/30" />
                          <p className="text-xs leading-relaxed text-muted">
                            {ev.notes || 'لا يوجد ملاحظات'}
                          </p>
                        </div>
                        <div className="border-border/50 mt-2 flex items-center gap-1.5 border-t pt-2">
                          <User size={10} className="text-muted" />
                          <span className="text-[10px] text-muted">
                            بواسطة: {ev.teacherName || 'نظام آلي'}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-primary-soft/50 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-primary/20">
                    <History size={24} className="text-primary/30" />
                  </div>
                  <p className="text-sm font-bold text-muted">لا يوجد سجل تقييمات</p>
                  <p className="text-muted/60 mt-1 text-xs">لم يتم تقييم هذا الطالب بعد</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-center border-t border-border bg-card p-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-surface px-8 py-2.5 text-xs font-bold text-main transition-all hover:bg-hover active:scale-95"
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
