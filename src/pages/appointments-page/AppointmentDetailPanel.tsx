import { X, ArrowRight, CalendarDays } from 'lucide-react'
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
        {/* Colored gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-l from-primary via-primary-deep to-primary-hover px-4 py-3">
          <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <CalendarDays size={16} className="text-white" />
              </div>
              <div>
                <p className="text-micro font-bold text-white/80">تفاصيل الموعد</p>
                <h3 className="text-sm font-black text-on-primary">{appointment.day}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="flex h-8 items-center gap-1.5 rounded-xl bg-error px-2.5 text-micro font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              <X size={13} />
              <span>إغلاق</span>
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
