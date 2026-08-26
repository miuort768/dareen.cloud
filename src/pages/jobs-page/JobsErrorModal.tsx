import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

interface JobsErrorModalProps {
  errorMsg: string
  onClose: () => void
}

export const JobsErrorModal = ({ errorMsg, onClose }: JobsErrorModalProps) => (
  <AnimatePresence>
    {errorMsg && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm rounded-card border border-error bg-card p-6 text-center shadow-soft"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-card text-muted transition-colors hover:text-error"
          >
            <X size={16} />
          </button>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-card bg-error-soft">
            <AlertTriangle size={32} className="text-error" />
          </div>
          <h3 className="mb-2 font-heading text-lg font-bold text-main">عذراً</h3>
          <p className="text-sm leading-relaxed text-muted">{errorMsg}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-card bg-error py-3 text-xs font-bold text-on-error transition-all hover:bg-error-hover"
          >
            حسناً
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
