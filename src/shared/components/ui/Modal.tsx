import React, { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Mobile (< md): bottom sheet — Desktop (>= md): centered dialog (unchanged) */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
    return window.matchMedia('(min-width: 768px)').matches
  })

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (isOpen) {
      const openModals = document.querySelectorAll('[role="dialog"]')
      if (openModals.length === 0) document.body.style.overflow = 'hidden'
      previousFocus.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        first?.focus()
      }, 50)
    } else {
      const remaining = document.querySelectorAll('[role="dialog"]')
      if (remaining.length <= 1) document.body.style.overflow = ''
      previousFocus.current?.focus()
    }
    return () => {
      if (!document.querySelector('[role="dialog"]')) document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerHaptic('light')
        onClose()
        return
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
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

  const handleClose = () => {
    triggerHaptic('light')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={containerRef}
          className={cn(
            'fixed inset-0 z-[300] flex',
            isDesktop ? 'items-center justify-center p-4' : 'items-end justify-center',
          )}
          dir="rtl"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'نافذة منبثقة'}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background backdrop-blur-sm dark:bg-background"
          />

          <motion.div
            initial={isDesktop ? { opacity: 0, scale: 0.95, y: 15 } : { opacity: 1, y: '100%' }}
            animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95, y: 15 } : { opacity: 1, y: '100%' }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'relative z-10 w-full max-w-lg overflow-hidden border border-border bg-card shadow-card backdrop-blur-xl',
              isDesktop
                ? 'rounded-card'
                : 'flex max-h-[92dvh] flex-col rounded-b-none rounded-t-3xl border-x-0 border-b-0',
              className,
            )}
          >
            {!isDesktop && (
              <div
                aria-hidden="true"
                className="bg-strong mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full"
              />
            )}

            <div
              className={cn(
                'flex items-center justify-between',
                isDesktop ? 'mb-5 px-6 pt-6' : 'shrink-0 px-4 pb-1 pt-2',
              )}
            >
              {title && <h3 className="text-base font-semibold text-main">{title}</h3>}
              <button
                onClick={handleClose}
                className={cn(
                  'ms-auto rounded-card text-muted transition-colors hover:bg-hover hover:text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  isDesktop ? 'p-1.5' : 'flex h-11 w-11 items-center justify-center',
                )}
                aria-label="إغلاق"
              >
                <X size={isDesktop ? 18 : 20} />
              </button>
            </div>

            <div
              className={cn(
                'overflow-y-auto text-start',
                isDesktop
                  ? 'max-h-[70vh] px-6 pb-6'
                  : 'min-h-0 flex-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
