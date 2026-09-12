import { X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppointmentDetailBody } from '../../features/appointments/components/AppointmentDetailBody'
import type { AppointmentEvent } from '../../features/appointments/types'

interface AppointmentDetailPanelProps {
  appointment: AppointmentEvent | null
  showDetails: boolean
  onClose: () => void
}

export const AppointmentDetailPanel = ({
  appointment,
  showDetails,
  onClose,
}: AppointmentDetailPanelProps) => (
  <AnimatePresence>
    {showDetails && appointment && (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        className="sticky top-4 h-fit overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex items-center justify-between rounded-2xl bg-error px-4 py-3 text-on-error">
          <div>
            <p className="text-micro font-bold text-white/80">تفاصيل الموعد</p>
            <h3 className="text-base font-bold">{appointment.day}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-error text-on-error outline-none ring-1 ring-white/30 transition-all hover:bg-error-hover hover:ring-white/50 focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <AppointmentDetailBody appointment={appointment} />
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            عودة <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
