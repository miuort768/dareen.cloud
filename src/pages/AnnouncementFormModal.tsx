import { useDialogFocus } from '../shared/hooks/useDialogFocus'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone, X, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event'

interface AnnouncementFormModalProps {
  isOpen: boolean
  editingAnnouncement: { id: string } | null
  formData: { title: string; content: string; type: AnnouncementType; isActive: boolean }
  onChange: (
    data: Partial<{ title: string; content: string; type: AnnouncementType; isActive: boolean }>,
  ) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

const TYPE_OPTIONS: {
  value: AnnouncementType
  label: string
  activeClass: string
}[] = [
  { value: 'general', label: 'عام', activeClass: 'bg-primary text-on-primary border-primary' },
  { value: 'urgent', label: 'عاجل', activeClass: 'bg-error text-on-error border-error' },
  { value: 'holiday', label: 'إجازة', activeClass: 'bg-warning text-on-warning border-warning' },
  { value: 'event', label: 'فعالية', activeClass: 'bg-info text-on-info border-info' },
]

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10'

export const AnnouncementFormModal = ({
  isOpen,
  editingAnnouncement,
  formData,
  onChange,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) => {
  const { containerRef, handleKeyDown } = useDialogFocus(isOpen, onClose)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          ref={containerRef}
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label={editingAnnouncement ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:max-w-md sm:rounded-2xl"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border sm:hidden" />

            {/* Header */}
            <div className="mt-4 flex items-center justify-between bg-gradient-to-l from-primary to-primary-deep px-5 py-4 sm:mt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <Megaphone size={16} className="text-on-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-primary">
                    {editingAnnouncement ? 'تعديل الإعلان الحالي' : 'إضافة إعلان جديد'}
                  </h3>
                  <p className="text-micro font-bold text-white/90">
                    {editingAnnouncement
                      ? 'حدّث بيانات الإعلان ثم احفظ'
                      : 'سيظهر الإعلان لجميع المستخدمين'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-on-primary transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4 p-5">
              <div>
                <label htmlFor="ann-title" className="mb-1.5 block text-micro font-bold text-muted">
                  عنوان الإعلان / النبأ
                </label>
                <input
                  id="ann-title"
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className={cn(inputClass, 'h-11 py-0')}
                  placeholder="أدخل عنوان الإعلان..."
                />
              </div>

              <div>
                <span className="mb-1.5 block text-micro font-bold text-muted">نوع الإعلان</span>
                <div className="grid grid-cols-4 gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ type: opt.value })}
                      aria-pressed={formData.type === opt.value}
                      className={cn(
                        'flex h-10 items-center justify-center rounded-xl border font-bold transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
                        formData.type === opt.value
                          ? opt.activeClass
                          : 'border-border bg-surface text-muted hover:bg-hover',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-micro font-bold text-muted">حالة النشر</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ isActive: true })}
                    aria-pressed={formData.isActive}
                    className={cn(
                      'flex h-11 items-center justify-center gap-1.5 rounded-xl border font-bold transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
                      formData.isActive
                        ? 'border-success bg-success text-on-success'
                        : 'border-border bg-surface text-muted hover:bg-hover',
                    )}
                  >
                    <Eye size={14} />
                    نشط
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ isActive: false })}
                    aria-pressed={!formData.isActive}
                    className={cn(
                      'flex h-11 items-center justify-center gap-1.5 rounded-xl border font-bold transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
                      !formData.isActive
                        ? 'border-warning bg-warning text-on-warning'
                        : 'border-border bg-surface text-muted hover:bg-hover',
                    )}
                  >
                    <EyeOff size={14} />
                    مخفي
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ann-content"
                  className="mb-1.5 block text-micro font-bold text-muted"
                >
                  محتوى الإعلان
                </label>
                <textarea
                  id="ann-content"
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => onChange({ content: e.target.value })}
                  className={cn(inputClass, 'resize-none leading-relaxed')}
                  placeholder="اكتب محتوى الإعلان هنا..."
                />
              </div>

              <div
                className="flex gap-2 pt-1"
                style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 flex-1 rounded-xl border border-border bg-surface text-xs font-bold text-main transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex h-12 flex-[1.6] items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-on-primary shadow-elevation-1 transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                >
                  <CheckCircle2 size={16} />
                  {editingAnnouncement ? 'حفظ التعديلات' : 'نشر الإعلان'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
