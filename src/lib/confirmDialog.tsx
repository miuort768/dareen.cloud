import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { AlertCircle, X, Trash2, Info } from 'lucide-react';
import { cn } from './utils';

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ConfirmProps {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    icon?: React.ReactNode;
}

function createDialogRoot() {
    const container = document.createElement('div');
    container.id = 'confirm-dialog-root';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    return { container, root };
}

function destroyDialogRoot(dialogRoot: { container: HTMLDivElement; root: ReactDOM.Root }) {
    try { dialogRoot.root.unmount(); } catch { /* already unmounted */ }
    try { if (dialogRoot.container.parentNode) dialogRoot.container.parentNode.removeChild(dialogRoot.container); } catch { /* already removed */ }
}

export function alert(opts: ConfirmProps | string): Promise<void> {
    const options: ConfirmProps = typeof opts === 'string' ? { message: opts } : opts;

    return new Promise(resolve => {
        const { container, root } = createDialogRoot();

        const Dialog = () => {
            const [isOpen, setIsOpen] = useState(false);
            const containerRef = useRef<HTMLDivElement>(null);
            const previousFocus = useRef<HTMLElement | null>(null);
            const isClosing = useRef(false);

            useEffect(() => {
                previousFocus.current = document.activeElement as HTMLElement;
                requestAnimationFrame(() => {
                    setIsOpen(true);
                    setTimeout(() => {
                        const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
                        first?.focus();
                    }, 50);
                });
            }, []);

            useEffect(() => {
                if (!isOpen) previousFocus.current?.focus();
            }, [isOpen]);

            const handleClose = useCallback(() => {
                if (isClosing.current) return;
                isClosing.current = true;
                setIsOpen(false);
                setTimeout(() => { destroyDialogRoot({ container, root }); resolve(); }, 200);
            }, []);

            const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
                if (e.key === 'Escape') { e.stopPropagation(); handleClose(); return; }
                if (e.key === 'Tab' && containerRef.current) {
                    const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
                    if (focusable.length === 0) return;
                    const first = focusable[0]!;
                    const last = focusable[focusable.length - 1]!;
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }, [handleClose]);

            const title = options.title || 'إرشادات المنتدى';

            return (
                <div ref={containerRef} className={cn("fixed inset-0 z-[100] flex items-center justify-center p-6", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} dir="rtl" onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label={title}>
                    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={handleClose} />
                    <div className={cn(
                        "relative bg-card w-full max-w-sm rounded-card shadow-2xl transition-all duration-200",
                        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}>
                        <button onClick={handleClose} className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-main transition-colors" aria-label="إغلاق">
                                    <X size={15} />
                                </button>

                        <div className="p-6 pt-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary-soft dark:bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Info size={28} />
                            </div>

                            <h3 className="text-lg font-bold text-main mb-2">
                                {title}
                            </h3>

                            <p className="text-sm text-muted leading-relaxed mb-6 text-start max-w-[280px]">
                                {options.message}
                            </p>

                            <button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary text-on-primary font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                            >
                                {options.confirmText || 'حسناً'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        root.render(<Dialog />);
    });
}

export function confirm(opts: ConfirmProps | string): Promise<boolean> {
    const options: ConfirmProps = typeof opts === 'string' ? { message: opts } : opts;

    return new Promise(resolve => {
        const { container, root } = createDialogRoot();

        const Dialog = () => {
            const [isOpen, setIsOpen] = useState(false);
            const containerRef = useRef<HTMLDivElement>(null);
            const previousFocus = useRef<HTMLElement | null>(null);
            const isClosing = useRef(false);

            useEffect(() => {
                previousFocus.current = document.activeElement as HTMLElement;
                requestAnimationFrame(() => {
                    setIsOpen(true);
                    setTimeout(() => {
                        const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
                        first?.focus();
                    }, 50);
                });
            }, []);

            useEffect(() => {
                if (!isOpen) previousFocus.current?.focus();
            }, [isOpen]);

            const handleClose = useCallback(() => {
                if (isClosing.current) return;
                isClosing.current = true;
                setIsOpen(false);
                setTimeout(() => { destroyDialogRoot({ container, root }); resolve(false); }, 200);
            }, []);

            const handleConfirm = useCallback(() => {
                if (isClosing.current) return;
                isClosing.current = true;
                setIsOpen(false);
                setTimeout(() => { destroyDialogRoot({ container, root }); resolve(true); }, 200);
            }, []);

            const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
                if (e.key === 'Escape') { e.stopPropagation(); handleClose(); return; }
                if (e.key === 'Tab' && containerRef.current) {
                    const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
                    if (focusable.length === 0) return;
                    const first = focusable[0]!;
                    const last = focusable[focusable.length - 1]!;
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }, [handleClose]);

            const isDestructive = options.isDestructive ?? true;
            const title = options.title || 'تأكيد العملية';

            return (
                <div ref={containerRef} className={cn("fixed inset-0 z-[100] flex items-center justify-center p-6", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} dir="rtl" onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label={title}>
                    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={handleClose} />
                    <div className={cn(
                        "relative bg-card w-full max-w-sm rounded-card shadow-2xl transition-all duration-200",
                        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}>
                        <button onClick={handleClose} className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted transition-colors" aria-label="إغلاق">
                                    <X size={15} />
                                </button>

                        <div className="p-6 pt-8 flex flex-col items-center text-center">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                                isDestructive
                                    ? "bg-error-light dark:bg-error/10 text-error"
                                    : "bg-primary-soft dark:bg-primary/10 text-primary"
                            )}>
                                {options.icon || (isDestructive ? <Trash2 size={28} /> : <AlertCircle size={28} />)}
                            </div>

                            <h3 className="text-lg font-bold text-main mb-2">
                                {title}
                            </h3>

                            <p className="text-sm text-muted leading-relaxed mb-6 max-w-[260px]">
                                {options.message}
                            </p>

                            <div className="flex flex-col gap-2.5 w-full">
                                <button
                                    onClick={handleConfirm}
                                    className={cn(
                                        "w-full h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
                                        isDestructive
                                            ? "bg-error hover:bg-error text-on-error shadow-lg shadow-error/20"
                                            : "bg-primary hover:bg-primary text-on-primary shadow-lg shadow-primary/20"
                                    )}
                                >
                                    {options.confirmText || 'تأكيد'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full h-11 rounded-xl bg-surface text-muted font-bold text-sm hover:bg-surface transition-all"
                                >
                                    {options.cancelText || 'إلغاء'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        root.render(<Dialog />);
    });
}
