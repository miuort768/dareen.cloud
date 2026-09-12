import { CheckCircle2 } from 'lucide-react'
import { triggerHaptic } from '../../../../lib/haptics'
import { BottomSheet } from '../../../../shared/components/mobile'
import { AppointmentDetailBody } from '../AppointmentDetailBody'
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
    headerClassName="bg-error border-b-white/10 [&_[data-slot=bst-title]]:text-on-error [&_[data-slot=bst-desc]]:text-white/80"
    closeClassName="border-transparent bg-error text-on-error hover:bg-error-hover"
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
    {appointment && <AppointmentDetailBody appointment={appointment} />}
  </BottomSheet>
)
