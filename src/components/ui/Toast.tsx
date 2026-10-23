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
  borderCls: string
  glowCls: string
  badgeCls: string
  badgeText: string
  progressBar: string
  ambientBg: string
}

const TOAST_STYLES: Record<ToastProps['type'], ToastStyle> = {
  success: {
    icon: CheckCircle2,
    iconCls: 'bg-success/15 text-success ring-success/25',
    borderCls: 'border-success/30 hover:border-success/50',
    glowCls: 'shadow-[0_16px_40px_-10px_rgba(22,163,74,0.25)]',
    badgeCls: 'bg-success/15 text-success border-success/30',
    badgeText: 'تم بنجاح',
    progressBar: 'bg-success',
    ambientBg: 'from-success/[0.08] via-card to-card',
  },
  error: {
    icon: XCircle,
    iconCls: 'bg-error/15 text-error ring-error/25',
    borderCls: 'border-error/30 hover:border-error/50',
    glowCls: 'shadow-[0_16px_40px_-10px_rgba(220,38,38,0.25)]',
    badgeCls: 'bg-error/15 text-error border-error/30',
    badgeText: 'خطأ',
    progressBar: 'bg-error',
    ambientBg: 'from-error/[0.08] via-card to-card',
  },
  warning: {
    icon: AlertCircle,
    iconCls: 'bg-warning/15 text-warning-strong ring-warning/25',
    borderCls: 'border-warning/30 hover:border-warning/50',
    glowCls: 'shadow-[0_16px_40px_-10px_rgba(217,119,6,0.25)]',
    badgeCls: 'bg-warning/15 text-warning-strong border-warning/30',
    badgeText: 'تنبيه',
    progressBar: 'bg-warning',
    ambientBg: 'from-warning/[0.08] via-card to-card',
  },
  info: {
    icon: Info,
    iconCls: 'bg-primary/15 text-primary ring-primary/25',
    borderCls: 'border-primary/30 hover:border-primary/50',
    glowCls: 'shadow-[0_16px_40px_-10px_rgba(99,102,241,0.25)]',
    badgeCls: 'bg-primary/15 text-primary border-primary/30',
    badgeText: 'إشعار',
    progressBar: 'bg-primary',
    ambientBg: 'from-primary/[0.08] via-card to-card',
  },
}

const Toast = ({ id, type, message, duration = 4500, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }, [onClose, id])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, handleClose])

  const {
    icon: Icon,
    iconCls,
    borderCls,
    glowCls,
    badgeCls,
    badgeText,
    progressBar,
    ambientBg,
  } = TOAST_STYLES[type]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'group relative flex w-full items-start gap-3.5 overflow-hidden rounded-[22px] border bg-gradient-to-br p-4 backdrop-blur-xl transition-all duration-300',
        ambientBg,
        borderCls,
        glowCls,
        isExiting
          ? 'translate-y-2 scale-95 opacity-0'
          : 'duration-300 animate-in fade-in slide-in-from-bottom-4',
        'hover:-translate-y-0.5',
      )}
      dir="rtl"
    >
      {/* Decorative ambient blurred orb */}
      <div
        className="pointer-events-none absolute -start-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-xl dark:bg-white/5"
        aria-hidden="true"
      />

      {/* Icon with glowing squircle */}
      <div
        className={cn(
          'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-elevation-1 ring-1 transition-transform duration-normal group-hover:scale-105',
          iconCls,
        )}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div className="z-10 min-w-0 flex-1 pt-0.5 text-start">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black leading-none',
              badgeCls,
            )}
          >
            {badgeText}
          </span>
        </div>
        <p className="line-clamp-3 text-xs font-bold leading-relaxed text-main">{message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="text-muted/70 -me-1 -mt-1 shrink-0 rounded-xl p-1.5 outline-none transition-all duration-fast hover:bg-surface hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        aria-label="إغلاق"
      >
        <X size={15} strokeWidth={2.2} />
      </button>

      {/* Animated sleek progress indicator */}
      <div className="absolute bottom-0 end-0 start-0 h-1 overflow-hidden bg-black/5 dark:bg-white/5">
        <div
          className={cn('h-full opacity-80', progressBar)}
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
    <div
      className="pointer-events-none fixed inset-x-3 bottom-5 z-[999] flex flex-col items-center sm:inset-x-auto sm:bottom-6 sm:start-6 sm:items-start"
      dir="rtl"
    >
      <div className="pointer-events-auto flex w-full max-w-[420px] flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}
