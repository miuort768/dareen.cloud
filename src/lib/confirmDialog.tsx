import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { AlertCircle, X, LogOut, Info } from 'lucide-react';
import { cn } from './utils';

interface ConfirmProps {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

let container: HTMLDivElement | null = null;
let root: ReactDOM.Root | null = null;

function getRoot() {
    if (!container) {
        container = document.createElement('div');
        container.id = 'confirm-dialog-root';
        document.body.appendChild(container);
    }
    if (!root) {
        root = ReactDOM.createRoot(container);
    }
    return root;
}

function cleanup() {
    if (root) {
        root.unmount();
        root = null;
    }
    if (container) {
        document.body.removeChild(container);
        container = null;
    }
}

export function alert(opts: ConfirmProps | string): Promise<void> {
    const options: ConfirmProps = typeof opts === 'string' ? { message: opts } : opts;

    return new Promise(resolve => {
        const r = getRoot();

        const Dialog = () => {
            const [isOpen, setIsOpen] = useState(false);

            useEffect(() => {
                requestAnimationFrame(() => setIsOpen(true));
            }, []);

            const handleClose = useCallback(() => {
                setIsOpen(false);
                setTimeout(() => { cleanup(); resolve(); }, 200);
            }, []);

            const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            }, [handleClose]);

            const title = options.title || 'إرشادات المنتدى';

            return (
                <div className={cn("fixed inset-0 z-[100] flex items-center justify-center p-6", isOpen ? "opacity-100" : "opacity-0")} dir="rtl" onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label={title}>
                    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200", isOpen ? "opacity-100" : "opacity-0")} onClick={handleClose} />
                    <div className={cn(
                        "relative bg-white dark:bg-primary-active w-full max-w-sm rounded-2xl shadow-2xl transition-all duration-200",
                        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}>
                        <button onClick={handleClose} className="absolute top-3 start-3 z-10 w-8 h-8 rounded-full bg-surface dark:bg-primary-active flex items-center justify-center text-muted hover:text-muted dark:hover:text-dim transition-colors" aria-label="إغلاق">
                            <X size={15} />
                        </button>

                        <div className="p-6 pt-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary-soft dark:bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <Info size={28} />
                            </div>

                            <h3 className="text-lg font-black text-main dark:text-on-primary mb-2">
                                {title}
                            </h3>

                            <p className="text-sm text-muted dark:text-muted leading-relaxed mb-6 text-end max-w-[280px]">
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

        r.render(<Dialog />);
    });
}

export function confirm(opts: ConfirmProps | string): Promise<boolean> {
    const options: ConfirmProps = typeof opts === 'string' ? { message: opts } : opts;

    return new Promise(resolve => {
        const r = getRoot();

        const Dialog = () => {
            const [isOpen, setIsOpen] = useState(false);

            useEffect(() => {
                requestAnimationFrame(() => setIsOpen(true));
            }, []);

            const handleClose = useCallback(() => {
                setIsOpen(false);
                setTimeout(() => { cleanup(); resolve(false); }, 200);
            }, []);

            const handleConfirm = useCallback(() => {
                setIsOpen(false);
                setTimeout(() => { cleanup(); resolve(true); }, 200);
            }, []);

            const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            }, [handleClose]);

            const isDestructive = options.isDestructive ?? true;
            const title = options.title || 'تأكيد العملية';

            return (
                <div className={cn("fixed inset-0 z-[100] flex items-center justify-center p-6", isOpen ? "opacity-100" : "opacity-0")} dir="rtl" onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label={title}>
                    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-200", isOpen ? "opacity-100" : "opacity-0")} onClick={handleClose} />
                    <div className={cn(
                        "relative bg-white dark:bg-primary-active w-full max-w-sm rounded-2xl shadow-2xl transition-all duration-200",
                        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}>
                        <button onClick={handleClose} className="absolute top-3 start-3 z-10 w-8 h-8 rounded-full bg-surface dark:bg-primary-active flex items-center justify-center text-muted hover:text-muted dark:hover:text-dim transition-colors" aria-label="إغلاق">
                            <X size={15} />
                        </button>

                        <div className="p-6 pt-8 flex flex-col items-center text-center">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                                isDestructive
                                    ? "bg-error-light dark:bg-error/10 text-error"
                                    : "bg-primary-soft dark:bg-primary/10 text-primary"
                            )}>
                                {isDestructive ? <LogOut size={28} /> : <AlertCircle size={28} />}
                            </div>

                            <h3 className="text-lg font-black text-main dark:text-on-primary mb-2">
                                {title}
                            </h3>

                            <p className="text-sm text-muted dark:text-muted leading-relaxed mb-6 max-w-[260px]">
                                {options.message}
                            </p>

                            <div className="flex flex-col gap-2.5 w-full">
                                <button
                                    onClick={handleConfirm}
                                    className={cn(
                                        "w-full h-12 rounded-xl text-on-primary font-bold text-sm transition-all active:scale-[0.98]",
                                        isDestructive
                                            ? "bg-error hover:bg-error shadow-lg shadow-error/20"
                                            : "bg-primary hover:bg-primary shadow-lg shadow-primary/20"
                                    )}
                                >
                                    {options.confirmText || 'تأكيد'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full h-11 rounded-xl bg-surface dark:bg-primary-active text-muted dark:text-muted font-bold text-sm hover:bg-surface dark:hover:bg-primary-active transition-all"
                                >
                                    {options.cancelText || 'إلغاء'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        r.render(<Dialog />);
    });
}
