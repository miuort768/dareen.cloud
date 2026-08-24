import React, { useEffect, useRef, useCallback } from 'react'
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

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

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
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
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
            className="bg-background/40 dark:bg-background/60 absolute inset-0 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'relative z-10 w-full max-w-lg overflow-hidden rounded-card border border-border bg-card shadow-card backdrop-blur-xl',
              className,
            )}
          >
            <div className="mb-5 flex items-center justify-between px-6 pt-6">
              {title && <h3 className="text-base font-semibold text-main">{title}</h3>}
              <button
                onClick={handleClose}
                className="ms-auto rounded-card p-1.5 text-muted transition-colors hover:bg-hover hover:text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 text-start">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
