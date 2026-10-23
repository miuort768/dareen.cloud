import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { AlertCircle, X, Trash2 } from 'lucide-react'
import { cn } from './utils'

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface ConfirmProps {
  message?: string
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  icon?: React.ReactNode
}

function createDialogRoot() {
  const container = document.createElement('div')
  container.id = 'confirm-dialog-root'
  document.body.appendChild(container)
  const root = ReactDOM.createRoot(container)
  return { container, root }
}

function destroyDialogRoot(dialogRoot: { container: HTMLDivElement; root: ReactDOM.Root }) {
  try {
    dialogRoot.root.unmount()
  } catch {
    /* already unmounted */
  }
  try {
    if (dialogRoot.container.parentNode)
      dialogRoot.container.parentNode.removeChild(dialogRoot.container)
  } catch {
    /* already removed */
  }
}

export function confirm(opts: ConfirmProps | string): Promise<boolean> {
  const options: ConfirmProps = typeof opts === 'string' ? { message: opts } : opts

  return new Promise((resolve) => {
    const { container, root } = createDialogRoot()

    const Dialog = () => {
      const [isOpen, setIsOpen] = useState(false)
      const containerRef = useRef<HTMLDivElement>(null)
      const previousFocus = useRef<HTMLElement | null>(null)
      const isClosing = useRef(false)

      useEffect(() => {
        previousFocus.current = document.activeElement as HTMLElement
        requestAnimationFrame(() => {
          setIsOpen(true)
          setTimeout(() => {
            const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
            first?.focus()
          }, 50)
        })
      }, [])

      useEffect(() => {
        if (!isOpen) previousFocus.current?.focus()
      }, [isOpen])

      const handleClose = useCallback(() => {
        if (isClosing.current) return
        isClosing.current = true
        setIsOpen(false)
        setTimeout(() => {
          destroyDialogRoot({ container, root })
          resolve(false)
        }, 200)
      }, [])

      const handleConfirm = useCallback(() => {
        if (isClosing.current) return
        isClosing.current = true
        setIsOpen(false)
        setTimeout(() => {
          destroyDialogRoot({ container, root })
          resolve(true)
        }, 200)
      }, [])

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            handleClose()
            return
          }
          if (e.key === 'Tab' && containerRef.current) {
            const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            if (focusable.length === 0) return
            const first = focusable[0]!
            const last = focusable[focusable.length - 1]!
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault()
              last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
        },
        [handleClose],
      )

      const isDestructive = options.isDestructive ?? true
      const title = options.title || 'تأكيد العملية'

      return (
        <div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-[1000] flex items-end justify-center p-3 transition-all duration-300 sm:items-center sm:p-6',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          dir="rtl"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop with modern deep blur */}
          <div
            className={cn(
              'fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div
            className={cn(
              'border-border/80 relative w-full max-w-sm overflow-hidden rounded-t-[28px] border bg-gradient-to-b from-card via-card to-surface p-6 shadow-elevation-4 transition-all duration-300 sm:rounded-[28px]',
              isOpen
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-4 scale-95 opacity-0 sm:translate-y-0',
            )}
          >
            {/* Ambient subtle glow blob */}
            <div
              className={cn(
                'pointer-events-none absolute -start-10 -top-10 h-32 w-32 rounded-full blur-2xl',
                isDestructive ? 'bg-error/15' : 'bg-primary/15',
              )}
              aria-hidden="true"
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              aria-label="إغلاق"
            >
              <X size={16} strokeWidth={2.2} />
            </button>

            <div className="relative z-10 flex flex-col items-center pt-2 text-center">
              {/* Icon Container with multi-layered squircle */}
              <div
                className={cn(
                  'h-18 w-18 mb-4 flex items-center justify-center rounded-[22px] border shadow-elevation-1 transition-transform',
                  isDestructive
                    ? 'border-error/30 bg-error/10 text-error'
                    : 'border-primary/30 bg-primary/10 text-primary',
                )}
              >
                {options.icon ||
                  (isDestructive ? (
                    <Trash2 size={32} strokeWidth={2} />
                  ) : (
                    <AlertCircle size={32} strokeWidth={2} />
                  ))}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-black tracking-tight text-main">{title}</h3>

              {/* Message */}
              <p className="mb-6 max-w-[280px] text-xs font-medium leading-relaxed text-muted">
                {options.message}
              </p>

              {/* Actions Button Group */}
              <div className="flex w-full flex-col gap-2.5">
                <button
                  onClick={handleConfirm}
                  className={cn(
                    'h-12 w-full rounded-2xl text-xs font-black shadow-elevation-2 outline-none transition-all duration-fast focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]',
                    isDestructive
                      ? 'bg-error text-on-error hover:brightness-105'
                      : 'bg-primary text-on-primary hover:brightness-105',
                  )}
                >
                  {options.confirmText || 'تأكيد'}
                </button>
                <button
                  onClick={handleClose}
                  className="h-11 w-full rounded-2xl border border-border bg-surface text-xs font-bold text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
                >
                  {options.cancelText || 'إلغاء'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    root.render(<Dialog />)
  })
}
