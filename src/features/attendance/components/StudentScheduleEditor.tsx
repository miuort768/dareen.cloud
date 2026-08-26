import { useState } from 'react'
import { Clock, Edit, Trash2 } from 'lucide-react'
import type { ScheduleSlot } from '../types'
import { normalizePeriod, periodLabel } from '../utils/slotUtils'

interface StudentScheduleEditorProps {
  schedule: ScheduleSlot[]
  isEditing: boolean
  onToggleEdit: () => void
  onDeleteSlot: (index: number) => void
  onSaveSlot: (slot: ScheduleSlot, editIndex: number | null) => void
}

export const StudentScheduleEditor = ({
  schedule,
  isEditing,
  onToggleEdit,
  onDeleteSlot,
  onSaveSlot,
}: StudentScheduleEditorProps) => {
  const [tempSlot, setTempSlot] = useState({ day: 'الأحد', hour: '', period: 'pm' })
  const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2 border-t border-border pt-2">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center gap-1.5 text-micro font-normal uppercase text-muted">
          <Clock size={10} className="text-primary" /> الجدول الإسبوعي
        </h5>
        <button
          onClick={() => {
            onToggleEdit()
            setEditSlotIndex(null)
          }}
          className={`rounded-lg px-2 py-0.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${isEditing ? 'bg-error-soft text-error' : 'bg-primary-soft text-primary'}`}
        >
          {isEditing ? 'إلغاء' : 'تعديل'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {schedule?.length > 0 ? (
          schedule.map((slot, i) => (
            <div
              key={`slot-${i}`}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1 text-micro font-bold text-muted"
            >
              <span>
                {slot.day} {slot.hour} {periodLabel(slot.period)}
              </span>
              {isEditing && (
                <div className="ms-1.5 flex gap-1.5 border-s border-border ps-1.5">
                  <button
                    onClick={() => {
                      setEditSlotIndex(i)
                      setTempSlot(slot)
                    }}
                    aria-label="تعديل الموعد"
                    className="text-primary"
                  >
                    <Edit size={10} />
                  </button>
                  <button
                    onClick={() => onDeleteSlot(i)}
                    aria-label="حذف الموعد"
                    className="text-error"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-micro italic text-muted">لا يوجد جدول محدد</p>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 space-y-3 rounded-xl bg-primary p-3 text-on-primary">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-micro font-bold uppercase text-white/60">اليوم</p>
              <select
                value={tempSlot.day}
                onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })}
                aria-label="اختر اليوم"
                className="w-full rounded-xl border-none bg-white/10 p-1.5 text-micro font-bold outline-none focus-visible:ring-0"
              >
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <p className="mb-1 text-micro font-bold uppercase text-white/60">الساعة</p>
              <input
                type="text"
                aria-label="الساعة"
                value={tempSlot.hour}
                onChange={(e) =>
                  setTempSlot({ ...tempSlot, hour: e.target.value.replace(/^0+/, '') })
                }
                placeholder="مثال: 4"
                className="w-full rounded-xl border-none bg-white/10 p-1.5 text-micro font-bold outline-none focus-visible:ring-0"
              />
            </div>
            <div>
              <p className="mb-1 text-micro font-bold uppercase text-white/60">الفترة</p>
              <select
                value={normalizePeriod(tempSlot.period)}
                onChange={(e) => setTempSlot({ ...tempSlot, period: e.target.value })}
                aria-label="اختر الفترة"
                className="w-full rounded-xl border-none bg-white/10 p-1.5 text-micro font-bold outline-none focus-visible:ring-0"
              >
                <option value="am" className="text-main">
                  صباحاً
                </option>
                <option value="pm" className="text-main">
                  مساءً
                </option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              onSaveSlot({ ...tempSlot, period: normalizePeriod(tempSlot.period) }, editSlotIndex)
              setTempSlot({ day: 'الأحد', hour: '', period: 'pm' })
              setEditSlotIndex(null)
            }}
            className="w-full rounded-xl bg-white py-2 text-micro font-bold text-primary shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            {editSlotIndex !== null ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      )}
    </div>
  )
}
