import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { AlertCircle, X, Trash2, Info } from 'lucide-react'
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

export function alert(opts: ConfirmProps | string): Promise<void> {
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
          resolve()
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

      const title = options.title || 'إرشادات المنتدى'

      return (
        <div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-[100] flex items-center justify-center p-6',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          dir="rtl"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={handleClose}
          />
          <div
            className={cn(
              'relative w-full max-w-sm rounded-card bg-card shadow-2xl transition-all duration-200',
              isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            )}
          >
            <button
              onClick={handleClose}
              className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-main"
              aria-label="إغلاق"
            >
              <X size={15} />
            </button>

            <div className="flex flex-col items-center p-6 pt-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/10">
                <Info size={28} />
              </div>

              <h3 className="mb-2 text-lg font-bold text-main">{title}</h3>

              <p className="mb-6 max-w-[280px] text-start text-sm leading-relaxed text-muted">
                {options.message}
              </p>

              <button
                onClick={handleClose}
                className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary active:scale-[0.98]"
              >
                {options.confirmText || 'حسناً'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    root.render(<Dialog />)
  })
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
            'fixed inset-0 z-[100] flex items-center justify-center p-6',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          dir="rtl"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={handleClose}
          />
          <div
            className={cn(
              'relative w-full max-w-sm rounded-card bg-card shadow-2xl transition-all duration-200',
              isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            )}
          >
            <button
              onClick={handleClose}
              className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition-colors"
              aria-label="إغلاق"
            >
              <X size={15} />
            </button>

            <div className="flex flex-col items-center p-6 pt-8 text-center">
              <div
                className={cn(
                  'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                  isDestructive
                    ? 'dark:bg-error/10 bg-error-light text-error'
                    : 'bg-primary-soft text-primary dark:bg-primary/10',
                )}
              >
                {options.icon || (isDestructive ? <Trash2 size={28} /> : <AlertCircle size={28} />)}
              </div>

              <h3 className="mb-2 text-lg font-bold text-main">{title}</h3>

              <p className="mb-6 max-w-[260px] text-sm leading-relaxed text-muted">
                {options.message}
              </p>

              <div className="flex w-full flex-col gap-2.5">
                <button
                  onClick={handleConfirm}
                  className={cn(
                    'h-12 w-full rounded-xl text-sm font-bold transition-all active:scale-[0.98]',
                    isDestructive
                      ? 'shadow-error/20 bg-error text-on-error shadow-lg hover:bg-error'
                      : 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary',
                  )}
                >
                  {options.confirmText || 'تأكيد'}
                </button>
                <button
                  onClick={handleClose}
                  className="h-11 w-full rounded-xl bg-surface text-sm font-bold text-muted transition-all hover:bg-surface"
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
