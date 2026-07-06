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
            gradient: 'from-[var(--bg-success)]/20 to-[var(--bg-success)]/5',
            border: 'border-success/40',
            iconBg: 'bg-success',
            text: 'text-success dark:text-success',
            progressBar: 'bg-success'
        },
        error: {
            icon: XCircle,
            gradient: 'from-[var(--bg-error)]/20 to-[var(--bg-error)]/5',
            border: 'border-error/40',
            iconBg: 'bg-error',
            text: 'text-error dark:text-error',
            progressBar: 'bg-error'
        },
        warning: {
            icon: AlertCircle,
            gradient: 'from-[var(--bg-warning)]/20 to-[var(--bg-warning)]/5',
            border: 'border-warning/40',
            iconBg: 'bg-warning',
            text: 'text-warning dark:text-warning',
            progressBar: 'bg-warning'
        },
        info: {
            icon: Info,
            gradient: 'from-[var(--bg-info)]/20 to-[var(--bg-info)]/5',
            border: 'border-info/40',
            iconBg: 'bg-info',
            text: 'text-info dark:text-info',
            progressBar: 'bg-info'
        }
    };

    const { icon: Icon, gradient, border, iconBg, text, progressBar } = config[type];

    return (
        <div className={cn(
            "group relative flex items-center gap-4 p-4 min-w-[320px] max-w-[420px] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2  transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "bg-white dark:bg-primary-active",
            border,
            isExiting ? "opacity-0 scale-95 translate-x-10" : "animate-in slide-in-from-start-12 fade-in",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
        )}>
            {/* Background Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", gradient)} />

            {/* Icon Section */}
            <div className={cn(
                "relative z-10 p-2.5 rounded-none text-on-primary border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 animate-bounce-slow",
                iconBg
            )}>
                <Icon size={20} className="drop-shadow-sm" />
            </div>

            {/* Content Section */}
            <div className="flex-1 z-10 text-start">
                <p className={cn("font-medium text-xs sm:text-sm tracking-tight leading-relaxed", text)}>
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="relative z-10 p-1.5 rounded-none text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-main dark:hover:text-on-primary transition-all border border-transparent hover:border-border"
            >
                <X size={16} />
            </button>

            {/* Premium Progress Bar */}
            <div className="absolute bottom-0 end-0 start-0 h-1 overflow-hidden opacity-40">
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
        <div className="fixed bottom-4 end-4 start-4 md:end-auto md:start-8 md:bottom-8 z-[200] flex flex-col items-center md:items-end gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3 w-full max-w-[420px]">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
