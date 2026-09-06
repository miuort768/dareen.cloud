import type { ReactNode } from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  subtitle?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  /** Prevent closing on backdrop tap. Default false. */
  dismissible?: boolean
}

/**
 * Native-app style bottom sheet (iOS/Android).
 * Rounded top, grab handle, dimmed blurred backdrop, scrollable body,
 * and an optional sticky footer with safe-area bottom padding.
 */
export const BottomSheet = ({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  className,
  contentClassName,
  dismissible = true,
}: BottomSheetProps) => (
  <SheetPrimitive.Root open={open} onOpenChange={(v) => dismissible && onOpenChange(v)}>
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        onClick={() => dismissible && onOpenChange(false)}
        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-[130] flex flex-col',
          'max-h-[92dvh] rounded-t-3xl border-x border-t border-border bg-card',
          'shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'data-[state=closed]:duration-slow data-[state=open]:duration-500',
          className,
        )}
      >
        {/* Grab handle */}
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 pb-3 pt-2">
            <div className="min-w-0">
              <SheetPrimitive.Title className="truncate text-base font-bold text-main">
                {title}
              </SheetPrimitive.Title>
              {subtitle && (
                <SheetPrimitive.Description className="truncate text-[11px] font-medium text-muted">
                  {subtitle}
                </SheetPrimitive.Description>
              )}
            </div>
            {dismissible && (
              <button
                onClick={() => onOpenChange(false)}
                aria-label="إغلاق"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div
          className={cn('min-h-0 overflow-y-auto overscroll-contain px-4 py-4', contentClassName)}
        >
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="shrink-0 rounded-b-3xl border-t border-border bg-card px-4 pb-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  </SheetPrimitive.Root>
)
