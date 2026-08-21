import { CalendarDays, X } from 'lucide-react'

interface ScheduleEvent {
  id: string
  studentId: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  studentPoints?: number
}

interface ScheduleDetailsModalProps {
  event: ScheduleEvent
  onClose: () => void
  onViewStudent: () => void
}

export const ScheduleDetailsModal = ({
  event,
  onClose,
  onViewStudent,
}: ScheduleDetailsModalProps) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    onKeyDown={(e) => {
      if (e.key === 'Escape') onClose()
    }}
  >
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between rounded-t-2xl bg-primary p-4 text-on-primary">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <CalendarDays size={16} />
          تفاصيل الحصة
        </h3>
        <button
          onClick={onClose}
          className="text-white/60 flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/15 hover:text-on-primary"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <span className="mb-1 block text-micro font-bold text-muted">الطالب</span>
          <p className="text-sm font-bold text-main">{event.studentName}</p>
        </div>
        <div>
          <span className="mb-1 block text-micro font-bold text-muted">المعلمة</span>
          <p className="text-sm font-bold text-main">{event.teacherName}</p>
        </div>
        <div>
          <span className="mb-1 block text-micro font-bold text-muted">المادة</span>
          <p className="text-sm font-bold text-main">{event.subject}</p>
        </div>
        <div>
          <span className="mb-1 block text-micro font-bold text-muted">الموعد</span>
          <p className="text-sm font-bold text-main">
            {event.day} - {event.time}
          </p>
        </div>
      </div>
      <div className="flex gap-2 p-5 pt-0">
        <button
          onClick={onViewStudent}
          className="h-10 flex-1 rounded-xl border border-border bg-surface text-micro font-bold text-main transition-all hover:bg-background active:scale-95"
        >
          عرض الطالب
        </button>
      </div>
    </div>
  </div>
)
