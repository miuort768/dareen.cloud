import { X, ArrowRight, User, ShieldCheck, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
        <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-on-primary">
          <div>
            <p className="text-micro font-bold text-white/60">تفاصيل الموعد</p>
            <h3 className="text-base font-bold">{appointment.day}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-white/15 px-3 py-1 text-center">
              <p className="text-lg font-bold tabular-nums leading-none text-on-primary">
                {appointment.time}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-all hover:bg-white/15 hover:text-on-primary"
              aria-label="إغلاق"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between rounded-xl border-e-[3px] border-e-primary bg-primary-soft p-3">
            <div>
              <label className="mb-0.5 block text-micro font-bold text-muted">الطالب</label>
              <h4 className="text-sm font-bold text-main">{appointment.studentName}</h4>
              <span className="text-micro font-bold text-primary">{appointment.studentGrade}</span>
            </div>
            <User size={18} className="text-muted" />
          </div>
          <div className="flex items-center justify-between rounded-xl border-e-[3px] border-e-success bg-success-soft p-3">
            <div>
              <label className="mb-0.5 block text-micro font-bold text-muted">المعلمة</label>
              <h4 className="text-sm font-bold text-main">{appointment.teacherName}</h4>
            </div>
            <ShieldCheck size={18} className="text-muted" />
          </div>
          <div className="flex items-center justify-between rounded-xl border-e-[3px] border-e-warning bg-warning-soft p-3">
            <div>
              <label className="mb-0.5 block text-micro font-bold text-muted">المادة</label>
              <h4 className="text-sm font-bold text-main">{appointment.subject}</h4>
              <span className="mt-1 inline-block rounded-lg bg-warning-soft px-1.5 py-0.5 text-micro font-bold text-warning">
                {appointment.curriculum}
              </span>
            </div>
            <BookOpen size={18} className="text-muted" />
          </div>
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
          >
            عودة <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
