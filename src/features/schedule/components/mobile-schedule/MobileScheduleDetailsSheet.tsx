import { User, BookOpen, Clock } from 'lucide-react'
import { triggerHaptic } from '../../../../lib/haptics'
import { BottomSheet } from '../../../../shared/components/mobile'

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
  isPM: boolean
}

interface MobileScheduleDetailsSheetProps {
  showDetails: boolean
  event: ScheduleEvent | null
  onClose: () => void
  onViewStudent: () => void
}

export const MobileScheduleDetailsSheet = ({
  showDetails,
  event,
  onClose,
  onViewStudent,
}: MobileScheduleDetailsSheetProps) => (
  <BottomSheet
    open={showDetails && !!event}
    onOpenChange={(v) => {
      if (!v) {
        triggerHaptic('light')
        onClose()
      }
    }}
    title="تفاصيل الحصة"
    subtitle={event?.day}
    footer={
      event && (
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              triggerHaptic('light')
              onViewStudent()
            }}
            className="flex-1 rounded-2xl border border-border bg-surface py-3 text-micro font-bold text-muted"
          >
            عرض الطالب
          </button>
        </div>
      )
    }
  >
    {event && (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-primary bg-primary-soft p-3.5">
          <div>
            <span className="text-micro font-bold text-muted">الطالب</span>
            <p className="text-sm font-bold text-main">{event.studentName}</p>
            <span className="text-micro font-bold text-primary">
              {event.studentGrade} · {event.subject}
            </span>
          </div>
          <User size={18} className="text-muted" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-success bg-success-soft p-3.5">
          <div>
            <span className="text-micro font-bold text-muted">المعلمة</span>
            <p className="text-sm font-bold text-main">{event.teacherName}</p>
          </div>
          <BookOpen size={18} className="text-muted" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-warning bg-warning-soft p-3.5">
          <div>
            <span className="text-micro font-bold text-muted">الوقت</span>
            <p className="text-sm font-bold text-main">{event.time}</p>
          </div>
          <Clock size={18} className="text-muted" strokeWidth={1.5} />
        </div>
      </div>
    )}
  </BottomSheet>
)
