import React from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden rounded-none animate-in zoom-in-95 duration-200">
                {/* Visual Header Accent */}
                <div className={cn(
                    "h-1.5 w-full",
                    isDestructive ? "bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "bg-[var(--primary-color,#5c59f2)] shadow-[0_0_15px_rgba(92,89,242,0.4)]"
                )}></div>

                {/* Decorative Geometric Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="p-10 relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={cn(
                            "w-20 h-20 rounded-none flex items-center justify-center mb-8 border-2 rotate-3 shadow-xl",
                            isDestructive
                                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30"
                                : "bg-indigo-50 text-[var(--primary-color,#5c59f2)] border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30"
                        )}>
                            <div className="-rotate-3">
                                {isDestructive ? <Trash2 size={36} strokeWidth={1.5} /> : <AlertCircle size={36} strokeWidth={1.5} />}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">
                            {title}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed mb-10 text-center max-w-[280px]">
                            {message}
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={cn(
                                    "px-6 h-14 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 rounded-none",
                                    isDestructive
                                        ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                        : "bg-[var(--primary-color,#5c59f2)] hover:opacity-90 shadow-indigo-600/20"
                                )}
                            >
                                {confirmText}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 h-12 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-none"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
