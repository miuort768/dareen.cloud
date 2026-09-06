import { useState, useEffect } from 'react'
import { useDialogFocus } from '../../../shared/hooks/useDialogFocus'
import { X, Plus, Trash2, CalendarDays, Loader2 } from 'lucide-react'
import type { ScheduleSlot } from '../types'
import { normalizePeriod, periodLabel } from '../utils/slotUtils'

interface ScheduleEditorModalProps {
  isOpen: boolean
  schedule: ScheduleSlot[]
  onClose: () => void
  onDeleteSlot: (index: number) => void
  onSaveSlot: (slot: ScheduleSlot, editIndex: number | null) => void
  /** يُستدعى بعد حفظ/حذف — لإغلاق النافذة عند نجاح الحفظ الجماعي */
  busy?: boolean
}

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

/** نافذة إدارة الجدول الأسبوعي — إضافة/تعديل/حذف مواعيد الحصة */
export const ScheduleEditorModal = ({
  isOpen,
  schedule,
  onClose,
  onDeleteSlot,
  onSaveSlot,
  busy = false,
}: ScheduleEditorModalProps) => {
  const [tempSlot, setTempSlot] = useState<ScheduleSlot>({
    day: 'الأحد',
    hour: '',
    period: 'pm',
  })
  const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null)
  const [localBusy, setLocalBusy] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTempSlot({ day: 'الأحد', hour: '', period: 'pm' })
      setEditSlotIndex(null)
      setLocalBusy(false)
    }
  }, [isOpen])

  const { containerRef, handleKeyDown } = useDialogFocus(isOpen, onClose)
  if (!isOpen) return null

  const isBusy = busy || localBusy

  const handleSave = () => {
    if (!tempSlot.hour.trim() || isBusy) return
    setLocalBusy(true)
    onSaveSlot(
      {
        ...tempSlot,
        hour: tempSlot.hour.replace(/^0+/, ''),
        period: normalizePeriod(tempSlot.period),
      },
      editSlotIndex,
    )
    setTempSlot({ day: 'الأحد', hour: '', period: 'pm' })
    setEditSlotIndex(null)
    setTimeout(() => setLocalBusy(false), 400)
  }

  const handleDelete = (index: number) => {
    if (isBusy) return
    onDeleteSlot(index)
    if (editSlotIndex === index) {
      setEditSlotIndex(null)
      setTempSlot({ day: 'الأحد', hour: '', period: 'pm' })
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="إدارة الجدول الأسبوعي"
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary-hover bg-primary p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
              <CalendarDays size={16} className="text-on-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-primary">إدارة الجدول الأسبوعي</h3>
              <p className="text-micro font-bold text-white/90">
                {schedule.length} {schedule.length === 1 ? 'موعد' : 'مواعيد'} مسجلة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="rounded-2xl bg-white/15 p-2.5 text-on-primary transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* قائمة المواعيد */}
          {schedule.length > 0 ? (
            <ul className="space-y-2">
              {schedule.map((slot, i) => {
                const isEditingThis = editSlotIndex === i
                return (
                  <li
                    key={`modal-slot-${i}`}
                    className={`flex items-center justify-between gap-2 rounded-2xl border p-2.5 transition-colors ${
                      isEditingThis ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-card text-micro font-black tabular-nums text-primary shadow-elevation-1">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-main">{slot.day}</p>
                        <p className="text-micro font-bold tabular-nums text-muted">
                          الساعة {slot.hour} {periodLabel(slot.period)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (isEditingThis) {
                            setEditSlotIndex(null)
                            setTempSlot({ day: 'الأحد', hour: '', period: 'pm' })
                          } else {
                            setEditSlotIndex(i)
                            setTempSlot(slot)
                          }
                        }}
                        disabled={isBusy}
                        aria-label={isEditingThis ? 'إلغاء التعديل' : `تعديل الموعد ${i + 1}`}
                        className={`rounded-2xl px-2.5 py-1.5 text-micro font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${
                          isEditingThis
                            ? 'bg-error-soft text-error'
                            : 'bg-primary-soft text-primary hover:bg-primary hover:text-on-primary'
                        }`}
                      >
                        {isEditingThis ? 'إلغاء' : 'تعديل'}
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        disabled={isBusy}
                        aria-label={`حذف الموعد ${i + 1}`}
                        className="flex h-8 w-8 items-center justify-center rounded-2xl bg-error-soft text-error transition-colors hover:bg-error hover:text-on-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-8 text-center">
              <CalendarDays size={24} className="mx-auto mb-2 text-muted" strokeWidth={1.5} />
              <p className="text-xs font-bold text-muted">لا يوجد جدول محدد — أضف أول موعد</p>
            </div>
          )}

          {/* نموذج الإضافة/التعديل */}
          <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
            <p className="mb-2.5 flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-primary">
              <Plus size={12} />
              {editSlotIndex !== null ? `تعديل الموعد رقم ${editSlotIndex + 1}` : 'إضافة موعد جديد'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="block text-micro font-bold text-muted">اليوم</span>
                <select
                  value={tempSlot.day}
                  onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })}
                  aria-label="اختر اليوم"
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-card px-2 py-2 text-micro font-bold text-main outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-micro font-bold text-muted">الساعة</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={tempSlot.hour}
                  onChange={(e) =>
                    setTempSlot({ ...tempSlot, hour: e.target.value.replace(/^0+/, '') })
                  }
                  placeholder="مثال: 4"
                  aria-label="الساعة"
                  className="w-full rounded-2xl border border-border bg-card px-2 py-2 text-micro font-bold text-main outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-focus"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-micro font-bold text-muted">الفترة</span>
                <select
                  value={normalizePeriod(tempSlot.period)}
                  onChange={(e) => setTempSlot({ ...tempSlot, period: e.target.value })}
                  aria-label="اختر الفترة"
                  className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-card px-2 py-2 text-micro font-bold text-main outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <option value="am">صباحاً</option>
                  <option value="pm">مساءً</option>
                </select>
              </label>
            </div>
            <button
              onClick={handleSave}
              disabled={!tempSlot.hour.trim() || isBusy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> جاري الحفظ...
                </>
              ) : editSlotIndex !== null ? (
                'تحديث الموعد'
              ) : (
                <>
                  <Plus size={14} /> إضافة الموعد
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
