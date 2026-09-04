import { useEffect, useState, useRef, useCallback } from 'react'
import { CheckCircle2, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SuccessModalProps {
  isOpen: boolean
  title?: string
  message: string
  onClose: () => void
  autoClose?: boolean
}

export const SuccessModal = ({
  isOpen,
  title = 'عملية ناجحة',
  message,
  onClose,
  autoClose = true,
}: SuccessModalProps) => {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const duration = 3000 // 3 seconds auto-close

  const handleClose = useCallback(() => {
    setIsExiting(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    timeoutRef.current = setTimeout(onClose, 350) // Wait for exit transition
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setIsExiting(false)
      setProgress(100)

      if (autoClose) {
        const startTime = Date.now()

        // Smooth progress bar update
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
          setProgress(remaining)
        }, 100)

        timeoutRef.current = setTimeout(() => {
          handleClose()
        }, duration)

        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      }
    }
  }, [isOpen, autoClose, handleClose])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!isOpen && !isExiting) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 end-6 z-[9999] w-full max-w-sm px-4 sm:px-0"
      dir="rtl"
    >
      <div
        className={cn(
          'p-4.5 relative overflow-hidden rounded-2xl border border-success-soft bg-card shadow-2xl dark:border-success-soft',
          'pointer-events-auto transition-all duration-300 ease-out',
          isExiting
            ? 'translate-y-6 scale-90 opacity-0 blur-sm'
            : 'duration-300 animate-in fade-in slide-in-from-bottom-6',
        )}
      >
        {/* â”€â”€ Glowing Ambient Background â”€â”€ */}
        <div className="pointer-events-none absolute -end-12 -top-12 h-24 w-24 rounded-2xl bg-success-soft blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -start-12 h-24 w-24 rounded-2xl bg-info-soft blur-2xl" />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* â”€â”€ Glowing Success Icon â”€â”€ */}
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success text-on-success">
              <CheckCircle2 size={20} className="stroke-[2.5]" />
            </div>
            <div className="absolute -start-1.5 -top-1.5 flex h-4 w-4 animate-bounce items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <Sparkles size={8} />
            </div>
          </div>

          {/* â”€â”€ Text Content â”€â”€ */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-sans text-xs font-semibold leading-none tracking-tight text-main dark:text-dim">
              {title}
            </h3>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted">{message}</p>
          </div>

          {/* â”€â”€ Close Button â”€â”€ */}
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 text-muted hover:text-main dark:hover:text-dim',
              'rounded-2xl bg-background p-1.5 hover:bg-surface dark:bg-surface dark:hover:bg-hover',
              'border border-border transition-all active:scale-95',
            )}
          >
            <X size={12} />
          </button>
        </div>

        {/* â”€â”€ Smooth Progress Count Down Bar â”€â”€ */}
        {autoClose && (
          <div className="absolute bottom-0 end-0 start-0 h-[3px] overflow-hidden bg-surface">
            <div
              className="h-full bg-success transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
export default SuccessModal
