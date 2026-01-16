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
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    isDestructive = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
            <div
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className={cn(
                    "h-1.5 w-full",
                    isDestructive ? "bg-red-600" : "bg-primary-600"
                )}></div>

                <div className="p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-none flex items-center justify-center mb-6 shadow-inner border",
                            isDestructive
                                ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
                                : "bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/20 dark:border-primary-900/30"
                        )}>
                            {isDestructive ? <Trash2 size={32} /> : <AlertCircle size={32} />}
                        </div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">
                            {title}
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 h-12 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-gray-800 transition-all rounded-none"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={cn(
                                    "flex-1 px-6 h-12 text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 rounded-none",
                                    isDestructive
                                        ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
