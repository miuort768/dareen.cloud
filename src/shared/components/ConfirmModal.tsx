import React, { useEffect, useRef, useCallback, useState } from 'react'
import { AlertCircle, X, Trash2, KeyRound } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../components/ui/Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password?: string) => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  requirePassword?: boolean
  expectedPassword?: string
  passwordPlaceholder?: string
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد العملية',
  cancelText = 'تراجع',
  isDestructive = true,
  requirePassword = false,
  expectedPassword = '',
  passwordPlaceholder = 'أدخل كلمة المرور التحذيرية',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement
      setPassword('')
      setPasswordError('')
      setTimeout(() => {
        const input = containerRef.current?.querySelector<HTMLElement>('input')
        if (input) {
          input.focus()
          return
        }
        containerRef.current?.querySelector<HTMLElement>('button')?.focus()
      }, 50)
    } else {
      previousFocus.current?.focus()
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && containerRef.current) {
        const f = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        if (f.length < 2) return
        const first = f[0]
        const last = f[f.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose],
  )

  const handleConfirm = () => {
    if (requirePassword) {
      if (password !== expectedPassword) {
        setPasswordError('كلمة المرور التحذيرية غير صحيحة')
        return
      }
      setPasswordError('')
    }
    onConfirm(password || undefined)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      dir="rtl"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-none border-2 border-error bg-card shadow-elevation-3 duration-200 animate-in zoom-in-95 dark:bg-card">
        {/* Accent bar */}
        <div className={cn('h-1 w-full', isDestructive ? 'bg-error' : 'bg-primary')}></div>

        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute start-4 top-4 flex h-8 w-8 items-center justify-center rounded-none bg-error text-on-error transition-all hover:scale-110 hover:bg-error-hover active:scale-95"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center pt-2 text-center">
            {/* Icon */}
            <div
              className={cn(
                'mb-5 flex h-16 w-16 items-center justify-center rounded-none',
                isDestructive
                  ? 'bg-error-soft text-error dark:bg-error-soft'
                  : 'bg-primary/10 text-primary dark:bg-primary/15',
              )}
            >
              {isDestructive ? (
                <Trash2 size={28} strokeWidth={1.5} />
              ) : (
                <AlertCircle size={28} strokeWidth={1.5} />
              )}
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-bold text-main">{title}</h3>

            {/* Message */}
            <p className="mb-6 max-w-[280px] text-sm leading-relaxed text-muted">{message}</p>

            {/* Password gate */}
            {requirePassword && (
              <div className="mb-6 w-full">
                <div className="relative">
                  <KeyRound
                    size={14}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm()
                    }}
                    placeholder={passwordPlaceholder}
                    aria-label="كلمة المرور التحذيرية"
                    className={cn(
                      'w-full rounded-none border bg-surface py-2.5 pe-3 ps-9 text-xs font-bold text-main outline-none transition-all focus:ring-2',
                      passwordError
                        ? 'border-error focus:border-error focus:ring-error-soft'
                        : 'border-border focus:border-primary focus:ring-focus',
                    )}
                  />
                </div>
                {passwordError && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-error">
                    <AlertCircle size={11} />
                    {passwordError}
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex w-full flex-col gap-2.5">
              <Button
                onClick={handleConfirm}
                variant={isDestructive ? 'destructive' : 'primary'}
                size="lg"
                className="w-full"
              >
                {confirmText}
              </Button>
              <Button onClick={onClose} variant="secondary" size="lg" className="w-full">
                {cancelText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
