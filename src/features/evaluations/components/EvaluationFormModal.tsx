import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, X, CheckCircle2, Zap } from 'lucide-react'
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
  const dialogRef = useRef<HTMLDivElement>(null)

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
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
                  <Award size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-main">
                    {formData.studentId
                      ? `تقييم: ${students.find((s) => s.id === formData.studentId)?.name || ''}`
                      : 'إضافة تقييم جديد'}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-muted">تقييم أداء الطالب</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted transition-all hover:bg-hover hover:text-main"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <form id="evaluation-form" onSubmit={onSubmit} className="space-y-4">
                {!formData.studentId && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-muted">اختر الطالب</label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => onChange({ ...formData, studentId: e.target.value })}
                      required
                      aria-label="اختر الطالب"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
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

                <div>
                  <label className="mb-2 block text-xs font-bold text-muted">مستوى التميز</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {RATING_OPTIONS.map((opt) => {
                      const isSelected = formData.rating === opt.value
                      const OptIcon = opt.icon
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => onChange({ ...formData, rating: opt.value })}
                          className={cn(
                            'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200',
                            isSelected
                              ? cn(opt.bg, opt.border, opt.color, 'scale-105 shadow-sm')
                              : 'border-border bg-surface text-muted hover:border-primary/30',
                          )}
                        >
                          <OptIcon size={16} strokeWidth={isSelected ? 2.5 : 2} />
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {opt.value}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold text-muted">نقاط المكافأة (XP)</label>
                    <div className="flex gap-1.5">
                      {[5, 10, 15, 20, 25, 30, 50].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => onChange({ ...formData, points: p })}
                          className="border-warning/20 hover:bg-warning/10 rounded-lg border bg-warning-soft px-2 py-1 text-[10px] font-bold text-warning transition-colors"
                        >
                          +{p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="border-warning/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-warning-soft">
                      <Zap size={16} className="text-warning" />
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
                      className="focus:ring-warning/10 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-center text-sm font-medium text-warning transition-all focus:outline-none focus:ring-2"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">الحد الأقصى 50 نقطة في كل تقييم</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-muted">
                    رسالة الإشادة (تظهر لولي الأمر)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm transition-all placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="مثال: أداء ممتاز اليوم..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border bg-card p-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-main transition-all hover:bg-hover"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="evaluation-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
