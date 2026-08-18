import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, History, Award } from 'lucide-react'
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
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/30" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="relative flex max-h-[70vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2"
            dir="rtl"
          >
            {/* Compact Header */}
            <div className="flex items-center justify-between bg-primary px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-on-primary">
                  {(student?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold text-on-primary">سجل التقييمات</h3>
                  <p className="text-on-primary/70 truncate text-[10px]">{student?.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-on-primary transition-colors hover:bg-white/25"
              >
                <X size={14} />
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
              <span className="flex items-center gap-1 rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                <History size={9} /> {studentEvals.length} تقييم
              </span>
              {totalXP > 0 && (
                <span className="flex items-center gap-1 rounded bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
                  <Award size={9} /> {totalXP} XP
                </span>
              )}
            </div>

            {/* Evaluation List */}
            <div className="no-scrollbar flex-1 overflow-y-auto p-3">
              {studentEvals.length > 0 ? (
                <div className="space-y-2">
                  {studentEvals.map((ev, idx) => {
                    const r =
                      RATING_OPTIONS.find((ro) => ro.value === ev.rating) || RATING_OPTIONS[0]
                    return (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="rounded-lg border border-border bg-surface p-2.5"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold',
                                r.pill,
                              )}
                            >
                              <r.icon size={8} strokeWidth={2.5} />
                              {ev.rating}
                            </span>
                            {ev.points > 0 && (
                              <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[9px] font-bold text-warning">
                                +{ev.points}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted">
                              {format(new Date(ev.created_at || ev.date), 'dd/MM')}
                            </span>
                            {canDelete(ev) && (
                              <button
                                aria-label="حذف"
                                onClick={() => onDelete(ev.id)}
                                className="rounded p-0.5 text-muted transition-colors hover:text-error"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted">
                          {ev.notes || 'بدون ملاحظات'}
                        </p>
                        <p className="text-muted/60 mt-0.5 text-[8px]">
                          {ev.teacherName || 'نظام آلي'}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <History size={20} className="text-muted/30 mx-auto mb-1.5" />
                  <p className="text-[10px] text-muted">لا يوجد سجل تقييمات</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5">
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-surface py-2 text-[10px] font-bold text-main transition-colors hover:bg-hover"
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
