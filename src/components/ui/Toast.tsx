import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast = ({ id, type, message, duration = 4000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 500)
  }, [onClose, id])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, handleClose])

  const config = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-success',
      iconText: 'text-on-success',
      text: 'text-success',
      progressBar: 'bg-success',
      ring: 'ring-success-soft',
      startBorder: 'border-s-success',
      label: 'تم بنجاح',
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-error',
      iconText: 'text-on-error',
      text: 'text-error',
      progressBar: 'bg-error',
      ring: 'ring-error-soft',
      startBorder: 'border-s-error',
      label: 'خطأ',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-warning',
      iconText: 'text-on-warning',
      text: 'text-warning',
      progressBar: 'bg-warning',
      ring: 'ring-warning-soft',
      startBorder: 'border-s-warning',
      label: 'تنبيه',
    },
    info: {
      icon: Info,
      iconBg: 'bg-info',
      iconText: 'text-on-info',
      text: 'text-info',
      progressBar: 'bg-info',
      ring: 'ring-info-soft',
      startBorder: 'border-s-info',
      label: 'ملاحظة',
    },
  }

  const { icon: Icon, iconBg, iconText, text, progressBar, ring, startBorder, label } = config[type]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-none border border-s-4 border-border bg-card p-3 pe-2 shadow-elevation-3 transition-all duration-500 sm:min-w-[300px] sm:max-w-[380px]',
        startBorder,
        isExiting ? '-translate-x-4 scale-95 opacity-0' : 'animate-in fade-in slide-in-from-left-8',
        'hover:-translate-y-0.5 hover:shadow-elevation-4',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-none shadow-elevation-1 ring-1',
          iconBg,
          iconText,
          ring,
        )}
      >
        <Icon size={18} />
      </div>
      <div className="z-10 min-w-0 flex-1 text-start">
        <p className={cn('mb-0.5 text-[10px] font-bold', text)}>{label}</p>
        <p className="line-clamp-2 text-xs font-bold leading-snug text-main">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 rounded-none p-1.5 text-muted outline-none transition-colors hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
        aria-label="إغلاق"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-0 end-0 start-0 h-1 overflow-hidden">
        <div
          className={cn('h-full opacity-50', progressBar)}
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      </div>
      <style>{`
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
    </div>
  )
}

export const ToastContainer = ({
  toasts,
  onClose,
}: {
  toasts: ToastProps[]
  onClose: (id: string) => void
}) => {
  return (
    <div className="pointer-events-none fixed bottom-4 start-4 z-[900] flex flex-col items-start gap-3 md:bottom-6 md:start-6">
      <div className="pointer-events-auto flex w-full max-w-[380px] flex-col gap-2.5">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}
