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

interface ToastStyle {
  icon: typeof CheckCircle2
  iconCls: string
  text: string
  progressBar: string
  glow: string
  label: string
}

const TOAST_STYLES: Record<ToastProps['type'], ToastStyle> = {
  success: {
    icon: CheckCircle2,
    iconCls: 'bg-success-soft text-success ring-success-soft',
    text: 'text-success',
    progressBar: 'bg-success',
    glow: 'shadow-[0_12px_40px_rgb(5_150_105/0.16)]',
    label: 'تم بنجاح',
  },
  error: {
    icon: XCircle,
    iconCls: 'bg-error-soft text-error ring-error-soft',
    text: 'text-error',
    progressBar: 'bg-error',
    glow: 'shadow-[0_12px_40px_rgb(225_29_72/0.16)]',
    label: 'خطأ',
  },
  warning: {
    icon: AlertCircle,
    iconCls: 'bg-warning-soft text-warning-strong ring-warning-soft',
    text: 'text-warning-strong',
    progressBar: 'bg-warning',
    glow: 'shadow-[0_12px_40px_rgb(180_83_9/0.16)]',
    label: 'تنبيه',
  },
  info: {
    icon: Info,
    iconCls: 'bg-info-soft text-info-strong ring-info-soft',
    text: 'text-info-strong',
    progressBar: 'bg-info',
    glow: 'shadow-[0_12px_40px_rgb(3_105_161/0.16)]',
    label: 'ملاحظة',
  },
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

  const { icon: Icon, iconCls, text, progressBar, glow, label } = TOAST_STYLES[type]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3.5 pe-2.5 transition-all duration-300',
        glow,
        isExiting ? '-translate-x-4 scale-95 opacity-0' : 'animate-in fade-in slide-in-from-left-8',
        'hover:-translate-y-0.5',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
          iconCls,
        )}
      >
        <Icon size={19} strokeWidth={2} />
      </div>
      <div className="z-10 min-w-0 flex-1 text-start">
        <p className={cn('mb-0.5 text-[10px] font-black tracking-wide', text)}>{label}</p>
        <p className="line-clamp-2 text-xs font-bold leading-snug text-main">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 rounded-lg p-1.5 text-muted outline-none transition-colors hover:bg-surface hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
        aria-label="إغلاق"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-0 end-0 start-0 h-0.5 overflow-hidden">
        <div
          className={cn('h-full opacity-60', progressBar)}
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
    <div className="pointer-events-none fixed inset-x-3 bottom-4 z-[900] flex flex-col items-stretch md:inset-x-auto md:bottom-6 md:start-6 md:items-start">
      <div className="pointer-events-auto flex w-full max-w-[400px] flex-col gap-2.5">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}
