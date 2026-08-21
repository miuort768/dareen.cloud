import { motion } from 'framer-motion'
import { X, CalendarDays, ChevronDown } from 'lucide-react'

interface TrialSessionForm {
  studentName: string
  parentPhone: string
  subject: string
  teacherId: string
  teacherName: string
  date: string
  time: string
  notes: string
}

interface TrialSessionFormModalProps {
  editingId: string | null
  form: TrialSessionForm
  teachers: Record<string, unknown>[]
  isSaving: boolean
  onChange: (form: TrialSessionForm) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

const inputClass =
  'w-full bg-surface border border-border px-3.5 py-3 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-main rounded-xl transition-all duration-200 placeholder:text-muted font-bold'
const labelClass = 'text-[11px] font-bold text-muted mb-1.5 block'
const selectWrapperClass = 'relative'

export const TrialSessionFormModal = ({
  editingId,
  form,
  teachers,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: TrialSessionFormModalProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
    className="p-2.5 sm:p-4"
  >
    <div
      className="overflow-hidden rounded-none border-2 border-primary/30 bg-card shadow-2xl"
      dir="rtl"
    >
      <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-l from-primary to-primary-deep px-5 py-4">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
            <CalendarDays size={18} className="text-on-primary" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-on-primary">
              {editingId ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
            </h2>
            <p className="mt-0.5 text-[10px] text-white/80">أدخل بيانات الحصة التجريبية</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 transition-all hover:bg-white/25"
          aria-label="إغلاق"
        >
          <X size={14} className="text-on-primary" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>اسم الطالب</label>
            <input
              required
              value={form.studentName}
              onChange={(e) => onChange({ ...form, studentName: e.target.value })}
              className={inputClass}
              placeholder="مثال: أم أحمد"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>رقم ولي الأمر</label>
            <input
              required
              value={form.parentPhone}
              onChange={(e) => onChange({ ...form, parentPhone: e.target.value })}
              className={inputClass}
              placeholder="05XXXXXXXX"
              dir="ltr"
              style={{ textAlign: 'right' }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>المادة</label>
            <input
              value={form.subject}
              onChange={(e) => onChange({ ...form, subject: e.target.value })}
              className={inputClass}
              placeholder="مثال: رياضيات"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>المعلمة</label>
            <div className={selectWrapperClass}>
              <select
                value={form.teacherName}
                onChange={(e) => {
                  const t = (Array.isArray(teachers) ? teachers : []).find(
                    (t: { id: string; name: string }) => t.name === e.target.value,
                  )
                  onChange({ ...form, teacherName: e.target.value, teacherId: t?.id || '' })
                }}
                aria-label="اختيار المعلمة"
                className={inputClass + ' appearance-none'}
              >
                <option value="">اختر معلمة</option>
                {(Array.isArray(teachers) ? teachers : []).map(
                  (t: { id: string; name: string }) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ),
                )}
              </select>
              <div className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>التاريخ</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => onChange({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>الوقت</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => onChange({ ...form, time: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>ملاحظات</label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            rows={2}
            className={inputClass + ' resize-none'}
            placeholder="اكتب أي تفاصيل..."
          />
        </div>
        <div className="flex gap-3 pb-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-gradient-to-l from-primary to-primary-deep py-3.5 text-[13px] font-bold text-on-primary shadow-md shadow-primary/15 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إتمام الإضافة'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-surface py-3.5 text-[11px] font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </motion.div>
)
