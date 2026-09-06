import { useCallback, useEffect, useRef } from 'react'
import { triggerHaptic } from '../../lib/haptics'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Shared dialog focus-management contract: Escape-to-close, Tab focus trap,
 * initial focus, and focus restoration on close.
 *
 * Usage: attach containerRef + handleKeyDown to the fixed overlay root that
 * carries role="dialog", with open as the isOpen flag.
 */
export const useDialogFocus = (
  open: boolean,
  onClose: () => void,
  { autoFocus = true }: { autoFocus?: boolean } = {},
) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    if (!autoFocus) return
    const timer = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const target =
        container.querySelector<HTMLElement>('[data-autofocus]') ??
        container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      target?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [open, autoFocus])

  useEffect(() => {
    if (open) return
    const prev = previousFocus.current
    if (prev && document.contains(prev)) prev.focus()
    previousFocus.current = null
  }, [open])

  useEffect(() => {
    if (!open) return
    return () => {
      const prev = previousFocus.current
      if (prev && document.contains(prev)) prev.focus()
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        triggerHaptic('light')
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (focusable.length === 0) {
        e.preventDefault()
        container.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = container.contains(document.activeElement) ? document.activeElement : null
      if (e.shiftKey && (active === first || !active)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !active)) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  return { containerRef, handleKeyDown }
}
