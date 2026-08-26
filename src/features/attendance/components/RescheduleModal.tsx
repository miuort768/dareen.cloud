import { Calendar, Clock, AlertCircle, Save, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { date: string; time: string; reason: string }) => void
  studentName: string
  subject: string
}

export const RescheduleModal = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  subject,
}: RescheduleModalProps) => {
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    const first = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="طلب تغيير موعد"
      onKeyDown={handleKeyDown}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2">
        <div className="flex items-center justify-between rounded-t-2xl bg-primary p-4 text-on-primary">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <h3 className="text-sm font-bold">طلب تغيير موعد حصة</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/15 hover:text-on-primary"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-micro font-bold text-muted">{subject}</p>
              <h4 className="text-xs font-bold text-main">{studentName}</h4>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-micro font-bold text-muted">
                الموعد الجديد المقترح
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface p-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                />
                <input
                  type="text"
                  placeholder="الساعة (مثلا 4 عصراً)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface p-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-micro font-bold text-muted">سبب التغيير</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثلاً: الطالب لديه امتحان في المدرسة..."
                className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft p-3">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-primary" />
              <p className="text-micro font-bold leading-relaxed text-primary">
                سيصل طلبك للإدارة فوراً للموافقة عليه، وسيتم إبلاغ ولي الأمر تلقائياً.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-surface py-3 text-xs font-bold text-main transition-all hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirm({ date, time, reason })}
            disabled={!time || !reason}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            إرسال الطلب الآن
          </button>
        </div>
      </div>
    </div>
  )
}
