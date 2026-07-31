import type { ReactNode } from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: ReactNode;
    subtitle?: string;
    children?: ReactNode;
    footer?: ReactNode;
    className?: string;
    contentClassName?: string;
    /** Prevent closing on backdrop tap. Default false. */
    dismissible?: boolean;
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
                    'fixed bottom-0 inset-x-0 z-[130] flex flex-col',
                    'max-h-[92dvh] rounded-t-3xl bg-card border-t border-x border-border',
                    'shadow-2xl',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                    'data-[state=closed]:duration-300 data-[state=open]:duration-500',
                    className
                )}
            >
                {/* Grab handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1.5 rounded-full bg-border" />
                </div>

                {/* Header */}
                {(title || subtitle) && (
                    <div className="flex items-center justify-between gap-3 px-4 pt-2 pb-3 shrink-0 border-b border-border">
                        <div className="min-w-0">
                            <SheetPrimitive.Title className="text-base font-bold text-main truncate">
                                {title}
                            </SheetPrimitive.Title>
                            {subtitle && (
                                <SheetPrimitive.Description className="text-[11px] font-medium text-muted truncate">
                                    {subtitle}
                                </SheetPrimitive.Description>
                            )}
                        </div>
                        {dismissible && (
                            <button
                                onClick={() => onOpenChange(false)}
                                aria-label="إغلاق"
                                className="shrink-0 w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted transition-colors active:scale-95 hover:bg-hover"
                            >
                                <X size={16} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                )}

                {/* Scrollable body */}
                <div className={cn('overflow-y-auto overscroll-contain px-4 py-4 min-h-0', contentClassName)}>
                    {children}
                </div>

                {/* Sticky footer */}
                {footer && (
                    <div className="shrink-0 px-4 pt-3 pb-4 border-t border-border bg-card rounded-b-3xl pb-[max(1rem,env(safe-area-inset-bottom))]">
                        {footer}
                    </div>
                )}
            </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
);
