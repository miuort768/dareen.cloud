import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import type { Teacher } from '../../teachers/types'
import type { ScheduleSlot } from '../types'
import { CURRENCY_OPTIONS } from '../../../config/constants'
import { parseNumberSafe } from '../../../lib/utils'

interface EnrollmentFormProps {
  teachers: Teacher[]
  onSubmit: (data: {
    teacherId?: string
    teacher: string
    subject: string
    curr: string
    curriculum?: string
    totalSessions: number
    teacherPrice?: number
    schedule: ScheduleSlot[]
  }) => void
  isLoading?: boolean
  defaultCurrency?: string
}

export const EnrollmentForm = ({
  teachers,
  onSubmit,
  isLoading,
  defaultCurrency,
}: EnrollmentFormProps) => {
  const [form, setForm] = useState({
    teacherId: '',
    subject: '',
    curr: defaultCurrency || 'EGP',
    curriculum: '',
    totalSessions: '',
    teacherPrice: '',
  })
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [slotInput, setSlotInput] = useState({ day: '', hour: '', period: 'pm' })

  const selectedTeacher = teachers.find((t) => t.id === form.teacherId)

  const handleAddSlot = () => {
    if (!slotInput.day || !slotInput.hour) return
    setSchedule([...schedule, { ...slotInput } as ScheduleSlot])
    setSlotInput({ ...slotInput, day: '', hour: '' })
  }

  const handleRemoveSlot = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      teacherId: form.teacherId || undefined,
      teacher: selectedTeacher?.name || '',
      subject: form.subject,
      curr: form.curr,
      curriculum: form.curriculum,
      totalSessions: parseNumberSafe(form.totalSessions),
      teacherPrice: parseNumberSafe(form.teacherPrice) || undefined,
      schedule,
    })
    setForm({
      teacherId: '',
      subject: '',
      curr: defaultCurrency || 'EGP',
      curriculum: '',
      totalSessions: '',
      teacherPrice: '',
    })
    setSchedule([])
  }

  return (
    <div className="border-t border-border pt-8">
      <h4 className="mb-4 text-micro font-medium uppercase tracking-widest text-main">
        إضافة اشتراك جديد
      </h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            required
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            aria-label="اختر المعلمة"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          >
            <option value="">المعلمة</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="المادة"
            aria-label="المادة"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            required
            value={form.curr}
            onChange={(e) => setForm({ ...form, curr: e.target.value })}
            aria-label="العملة"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            placeholder="المنهج"
            aria-label="المنهج"
            value={form.curriculum}
            onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            type="number"
            placeholder="عدد الحصص"
            aria-label="عدد الحصص"
            value={form.totalSessions}
            onChange={(e) => setForm({ ...form, totalSessions: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          />
          <input
            type="number"
            min="0"
            placeholder="سعر حصة المعلمة"
            aria-label="سعر الحصة التي ستحصل عليها المعلمة"
            value={form.teacherPrice}
            onChange={(e) => setForm({ ...form, teacherPrice: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-normal text-main"
          />
        </div>

        <div className="space-y-3 rounded-xl bg-primary-soft p-3">
          <p className="text-micro font-medium uppercase text-primary">المواعيد</p>
          <div className="flex gap-2">
            <select
              value={slotInput.day}
              onChange={(e) => setSlotInput({ ...slotInput, day: e.target.value })}
              aria-label="اختر اليوم"
              className="flex-1 rounded-xl border border-border bg-surface px-2 py-1 text-micro font-normal text-main"
            >
              <option value="">اليوم</option>
              {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ),
              )}
            </select>
            <input
              placeholder="الساعة"
              aria-label="الساعة"
              value={slotInput.hour}
              onChange={(e) =>
                setSlotInput({ ...slotInput, hour: e.target.value.replace(/^0+/, '') })
              }
              className="w-20 rounded-xl border border-border bg-surface px-2 py-1 text-micro font-normal text-main"
            />
            <select
              value={slotInput.period}
              onChange={(e) => setSlotInput({ ...slotInput, period: e.target.value })}
              aria-label="الفترة صباحاً أو مساءً"
              className="w-16 rounded-xl border border-border bg-surface px-1 py-1 text-micro font-normal text-main"
            >
              <option value="am">صباحاً</option>
              <option value="pm">مساءً</option>
            </select>
            <button
              type="button"
              onClick={handleAddSlot}
              className="rounded-xl bg-primary px-2 text-on-primary outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              aria-label="إضافة"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {schedule.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 rounded-xl border border-primary-soft bg-card px-2 py-1 text-micro font-medium shadow-elevation-1"
              >
                {s.day} {s.hour}
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(idx)}
                  className="text-error outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  aria-label="إزالة"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-medium text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'جاري الحفظ...' : 'تأكيد وحفظ الاشتراك'}
        </button>
      </form>
    </div>
  )
}
