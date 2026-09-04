import { useState } from 'react'
import { Clock } from 'lucide-react'
import type { ScheduleSlot } from '../types'
import { periodLabel } from '../utils/slotUtils'
import { ScheduleEditorModal } from './ScheduleEditorModal'

interface StudentScheduleEditorProps {
  schedule: ScheduleSlot[]
  isEditing: boolean
  onToggleEdit: () => void
  onDeleteSlot: (index: number) => void
  onSaveSlot: (slot: ScheduleSlot, editIndex: number | null) => void
  busy?: boolean
}

/** عرض مواعيد الطالب داخل الكارت + زر "تعديل" يفتح نافذة الإدارة (إضافة/تعديل/حذف) */
export const StudentScheduleEditor = ({
  schedule,
  isEditing,
  onToggleEdit,
  onDeleteSlot,
  onSaveSlot,
  busy = false,
}: StudentScheduleEditorProps) => {
  const [, setEditSlotIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2 border-t border-border pt-2">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center gap-1.5 text-micro font-normal uppercase text-muted">
          <Clock size={10} className="text-primary" /> الجدول الإسبوعي
        </h5>
        <button
          onClick={onToggleEdit}
          className={`rounded-2xl px-2 py-0.5 text-micro font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
            isEditing
              ? 'bg-error-soft text-error'
              : 'bg-primary-soft text-primary hover:bg-primary hover:text-on-primary'
          }`}
        >
          {isEditing ? 'إغلاق' : 'تعديل'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {schedule?.length > 0 ? (
          schedule.map((slot, i) => (
            <span
              key={`slot-${i}`}
              className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-1 text-micro font-bold text-muted"
            >
              {slot.day} {slot.hour} {periodLabel(slot.period)}
            </span>
          ))
        ) : (
          <p className="text-micro italic text-muted">لا يوجد جدول محدد</p>
        )}
      </div>

      <ScheduleEditorModal
        isOpen={isEditing}
        schedule={schedule || []}
        onClose={onToggleEdit}
        onDeleteSlot={onDeleteSlot}
        onSaveSlot={(slot, editIndex) => {
          setEditSlotIndex(editIndex)
          onSaveSlot(slot, editIndex)
        }}
        busy={busy}
      />
    </div>
  )
}
