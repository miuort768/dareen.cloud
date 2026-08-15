import React, { useEffect, useRef, useCallback } from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../components/ui/Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد العملية',
    cancelText = 'تراجع',
    isDestructive = true
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement as HTMLElement;
            setTimeout(() => {
                containerRef.current?.querySelector<HTMLElement>('button')?.focus();
            }, 50);
        } else {
            previousFocus.current?.focus();
        }
    }, [isOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'Tab' && containerRef.current) {
            const f = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
            if (f.length < 2) return;
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl" onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label={title}>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            <div className="relative bg-card dark:bg-card border border-border shadow-elevation-3 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Accent bar */}
                <div className={cn(
                    "h-1 w-full",
                    isDestructive ? "bg-error" : "bg-primary"
                )}></div>

                <div className="p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 start-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-main transition-all"
                        aria-label="إغلاق"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex flex-col items-center text-center pt-2">
                        {/* Icon */}
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
                            isDestructive
                                ? "bg-error/10 text-error dark:bg-error/15"
                                : "bg-primary/10 text-primary dark:bg-primary/15"
                        )}>
                            {isDestructive ? <Trash2 size={28} strokeWidth={1.5} /> : <AlertCircle size={28} strokeWidth={1.5} />}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-main mb-2">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-muted text-sm leading-relaxed mb-6 max-w-[280px]">
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col gap-2.5 w-full">
                            <Button
                                onClick={() => { onConfirm(); onClose(); }}
                                variant={isDestructive ? 'destructive' : 'primary'}
                                size="lg"
                                className="w-full"
                            >
                                {confirmText}
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="secondary"
                                size="lg"
                                className="w-full"
                            >
                                {cancelText}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
