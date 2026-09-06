import { CheckCircle2, User, ShieldCheck, BookOpen } from 'lucide-react'
import { triggerHaptic } from '../../../../lib/haptics'
import { BottomSheet } from '../../../../shared/components/mobile'
import type { AppointmentEvent } from '../../types'

interface AppointmentDetailsSheetProps {
  show: boolean
  appointment: AppointmentEvent | null
  activeTab: 'upcoming' | 'completed'
  canComplete?: boolean
  onClose: () => void
  onComplete: (id: string, e: React.MouseEvent) => void
}

export const AppointmentDetailsSheet = ({
  show,
  appointment,
  activeTab,
  canComplete = false,
  onClose,
  onComplete,
}: AppointmentDetailsSheetProps) => (
  <BottomSheet
    open={show && !!appointment}
    onOpenChange={(v) => {
      if (!v) {
        triggerHaptic('light')
        onClose()
      }
    }}
    title="تفاصيل الموعد"
    subtitle={appointment?.day}
    footer={
      activeTab === 'upcoming' && canComplete && appointment ? (
        <button
          onClick={(e) => {
            onComplete(appointment.id, e)
            onClose()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-3 text-micro font-bold text-on-success outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
        >
          <CheckCircle2 size={14} strokeWidth={1.5} /> إتمام الحصة
        </button>
      ) : undefined
    }
  >
    {appointment && (
      <div className="space-y-3">
        <div className="flex justify-center pb-1">
          <div className="rounded-2xl bg-primary-soft px-4 py-2">
            <p className="text-lg font-bold tabular-nums leading-none text-primary">
              {appointment.time}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-primary bg-primary-soft p-3.5">
          <div>
            <span className="text-micro font-bold text-muted">الطالب</span>
            <p className="text-sm font-bold text-main">{appointment.studentName}</p>
            <span className="text-micro font-bold text-primary">{appointment.studentGrade}</span>
          </div>
          <User size={18} className="text-muted" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-success bg-success-soft p-3.5">
          <div>
            <span className="text-micro font-bold text-muted">المعلمة</span>
            <p className="text-sm font-bold text-main">{appointment.teacherName}</p>
          </div>
          <ShieldCheck size={18} className="text-muted" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-e-[3px] border-e-warning bg-warning-soft p-3.5 dark:border-e-primary dark:bg-primary-soft">
          <div>
            <span className="text-micro font-bold text-muted">المادة</span>
            <p className="text-sm font-bold text-main">{appointment.subject}</p>
            <span className="mt-1 inline-block rounded-2xl bg-surface px-1.5 py-0.5 text-micro font-bold text-warning dark:text-primary">
              {appointment.curriculum}
            </span>
          </div>
          <BookOpen size={18} className="text-muted" strokeWidth={1.5} />
        </div>
      </div>
    )}
  </BottomSheet>
)
