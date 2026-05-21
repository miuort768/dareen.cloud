import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast = ({ id, type, message, duration = 4000, onClose }: ToastProps) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 500);
    }, [onClose, id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, handleClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            gradient: 'from-emerald-500/20 to-emerald-600/5',
            border: 'border-emerald-500/40',
            iconBg: 'bg-emerald-500',
            text: 'text-emerald-900 dark:text-emerald-100',
            progressBar: 'bg-emerald-500'
        },
        error: {
            icon: XCircle,
            gradient: 'from-rose-500/20 to-rose-600/5',
            border: 'border-rose-500/40',
            iconBg: 'bg-rose-500',
            text: 'text-rose-900 dark:text-rose-100',
            progressBar: 'bg-rose-500'
        },
        warning: {
            icon: AlertCircle,
            gradient: 'from-amber-500/20 to-amber-600/5',
            border: 'border-amber-500/40',
            iconBg: 'bg-amber-500',
            text: 'text-amber-900 dark:text-amber-100',
            progressBar: 'bg-amber-500'
        },
        info: {
            icon: Info,
            gradient: 'from-sky-500/20 to-sky-600/5',
            border: 'border-sky-500/40',
            iconBg: 'bg-sky-500',
            text: 'text-sky-900 dark:text-sky-100',
            progressBar: 'bg-sky-500'
        }
    };

    const { icon: Icon, gradient, border, iconBg, text, progressBar } = config[type];

    return (
        <div className={cn(
            "group relative flex items-center gap-4 p-4 min-w-[320px] max-w-[420px] rounded-none shadow-[4px_4px_0px_0px_black] border-2 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "bg-white dark:bg-slate-900",
            border,
            isExiting ? "opacity-0 scale-95 translate-x-10" : "animate-in slide-in-from-right-12 fade-in",
            "hover:shadow-[6px_6px_0px_0px_black] hover:-translate-y-0.5"
        )}>
            {/* Background Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", gradient)} />

            {/* Icon Section */}
            <div className={cn(
                "relative z-10 p-2.5 rounded-none text-white border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] flex-shrink-0 animate-bounce-slow",
                iconBg
            )}>
                <Icon size={20} className="drop-shadow-sm" />
            </div>

            {/* Content Section */}
            <div className="flex-1 z-10 text-right">
                <p className={cn("font-black text-xs sm:text-sm tracking-tight leading-relaxed", text)}>
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="relative z-10 p-1.5 rounded-none text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all border border-transparent hover:border-gray-950"
            >
                <X size={16} />
            </button>

            {/* Premium Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden opacity-40">
                <div
                    className={cn("h-full", progressBar)}
                    style={{ 
                        animation: `toast-progress ${duration}ms linear forwards` 
                    }}
                />
            </div>

            <style>{`
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[200] flex flex-col items-center md:items-end gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3 w-full max-w-[420px]">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
