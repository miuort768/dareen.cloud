import { createPortal } from 'react-dom'
import { useDialogFocus } from '../../../shared/hooks/useDialogFocus'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, X } from 'lucide-react'
import { EvaluationFormFields } from './EvaluationFormFields'
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
  const { containerRef, handleKeyDown } = useDialogFocus(isOpen, onClose)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="eval-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label={formData.studentId ? 'تعديل تقييم طالب' : 'إضافة تقييم جديد'}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative mb-[calc(96px+env(safe-area-inset-bottom))] flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3 sm:mb-0 sm:rounded-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
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
              {!formData.studentId && (
                <div className="mb-5">
                  <label htmlFor="eval-student" className="mb-2 block text-xs font-bold text-muted">
                    اختر الطالب
                  </label>
                  <select
                    id="eval-student"
                    value={formData.studentId}
                    onChange={(e) => onChange({ ...formData, studentId: e.target.value })}
                    required
                    aria-label="اختر الطالب"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-card dark:text-main dark:focus:border-primary"
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
              <EvaluationFormFields
                formData={formData}
                onChange={(d) => onChange({ ...formData, ...d })}
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
                formId="evaluation-form"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
