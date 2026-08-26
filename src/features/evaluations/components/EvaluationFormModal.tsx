import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, X, CheckCircle2, Zap, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { RATING_OPTIONS } from '../types/constants'
import type { Student } from '../../../types'

interface EvaluationFormModalProps {
  isOpen: boolean
  formData: { studentId: string; rating: string; points: number; notes: string }
  students: Student[]
  teacherStudents: Student[]
  isSubmitting?: boolean
  onClose: () => void
  onChange: (data: { studentId: string; rating: string; points: number; notes: string }) => void
  onSubmit: (e: React.FormEvent) => void
}

export const EvaluationFormModal = ({
  isOpen,
  formData,
  students,
  teacherStudents,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: EvaluationFormModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="eval-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={formData.studentId ? 'تعديل تقييم طالب' : 'إضافة تقييم جديد'}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-elevation-3 sm:rounded-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                  <Award size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-main">
                    {formData.studentId
                      ? `تقييم: ${students.find((s) => s.id === formData.studentId)?.name || ''}`
                      : 'إضافة تقييم جديد'}
                  </h3>
                  <p className="mt-0.5 text-micro text-muted">تقييم أداء الطالب</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted transition-all hover:bg-error-soft hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <div className="no-scrollbar flex-1 overflow-y-auto p-4">
              <form id="evaluation-form" onSubmit={onSubmit} className="space-y-5">
                {!formData.studentId && (
                  <div>
                    <label
                      htmlFor="eval-student"
                      className="mb-2 block text-xs font-bold text-muted"
                    >
                      اختر الطالب
                    </label>
                    <select
                      id="eval-student"
                      value={formData.studentId}
                      onChange={(e) => onChange({ ...formData, studentId: e.target.value })}
                      required
                      aria-label="اختر الطالب"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:bg-card dark:text-main dark:focus:border-primary"
                    >
                      <option value="">-- اختر من قائمة طلابك --</option>
                      {teacherStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.grade})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="mb-2.5 block text-xs font-bold text-muted">مستوى التميز</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {RATING_OPTIONS.map((opt) => {
                      const isSelected = formData.rating === opt.value
                      const OptIcon = opt.icon
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => onChange({ ...formData, rating: opt.value })}
                          aria-pressed={isSelected}
                          className={cn(
                            'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                            isSelected
                              ? cn(opt.bg, opt.border, opt.color)
                              : 'border-border bg-card text-main hover:border-primary/40',
                          )}
                        >
                          {/* علامة التحديد الواضحة — لا اعتماد على اللون فقط */}
                          {isSelected && (
                            <motion.span
                              layoutId="rating-check"
                              className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                              style={{ backgroundColor: 'currentColor' }}
                              aria-hidden="true"
                            >
                              <Check size={10} strokeWidth={3.5} className="text-white" />
                            </motion.span>
                          )}
                          <OptIcon size={22} strokeWidth={isSelected ? 2.4 : 1.9} />
                          <span className="text-center text-xs font-extrabold leading-snug">
                            {opt.value}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* XP Points */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-muted">نقاط المكافأة (XP)</label>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {[5, 10, 15, 20, 25, 30, 50].map((p) => {
                      const isSelected = formData.points === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => onChange({ ...formData, points: p })}
                          aria-pressed={isSelected}
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                            isSelected
                              ? 'border-warning bg-warning-light font-black text-warning-strong shadow-sm dark:bg-warning-soft'
                              : 'border-border bg-surface text-muted hover:border-warning hover:text-warning-strong',
                          )}
                        >
                          +{p}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warning bg-warning-light dark:bg-warning-soft">
                      <Zap size={16} className="text-warning-strong" />
                    </div>
                    <input
                      type="number"
                      value={formData.points || ''}
                      onChange={(e) =>
                        onChange({
                          ...formData,
                          points: Math.min(50, Math.max(0, Number(e.target.value))),
                        })
                      }
                      placeholder="0"
                      min="0"
                      max="50"
                      aria-label="عدد النقاط من 0 إلى 50"
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-center text-sm font-bold tabular-nums text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus"
                    />
                    <span className="text-micro text-muted">/ 50</span>
                  </div>
                  <p className="mt-1.5 text-micro text-muted">الحد الأقصى 50 نقطة في كل تقييم</p>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="eval-notes" className="mb-2 block text-xs font-bold text-muted">
                    رسالة الإشادة (تظهر لولي الأمر)
                  </label>
                  <textarea
                    id="eval-notes"
                    value={formData.notes}
                    onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm transition-all placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 dark:bg-card dark:text-main"
                    placeholder="مثال: أداء ممتاز اليوم..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-border bg-card p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-surface py-3 text-xs font-bold text-main transition-all hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="evaluation-form"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
