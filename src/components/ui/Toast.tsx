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

const Toast = ({ id, type, message, duration = 4000, onClose }: ToastProps) => {
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
        success: { icon: CheckCircle2, iconBg: 'bg-success', text: 'text-success', progressBar: 'bg-success' },
        error: { icon: XCircle, iconBg: 'bg-error', text: 'text-error', progressBar: 'bg-error' },
        warning: { icon: AlertCircle, iconBg: 'bg-warning', text: 'text-warning', progressBar: 'bg-warning' },
        info: { icon: Info, iconBg: 'bg-info', text: 'text-info', progressBar: 'bg-info' }
    };

    const { icon: Icon, iconBg, text, progressBar } = config[type];

    return (
        <div className={cn(
            "group relative flex items-center gap-4 p-4 w-full sm:min-w-[320px] sm:max-w-[420px] shadow-elevation-2 border-2 transition-all duration-500",
            "bg-card border-border/50",
            isExiting ? "opacity-0 scale-95 translate-x-10" : "animate-in slide-in-from-start-12 fade-in",
            "hover:shadow-elevation-3 hover:-translate-y-0.5"
        )}>
            <div className={cn("p-2.5 text-on-primary border border-border/30 shadow-elevation-1 flex-shrink-0", iconBg)}>
                <Icon size={20} />
            </div>
            <div className="flex-1 z-10 text-start">
                <p className={cn("font-medium text-xs sm:text-sm tracking-tight leading-relaxed", text)}>
                    {message}
                </p>
            </div>
            <button
                onClick={handleClose}
                className="p-1.5 text-muted hover:bg-surface hover:text-main transition-colors"
            >
                <X size={16} />
            </button>
            <div className="absolute bottom-0 end-0 start-0 h-1 overflow-hidden opacity-40">
                <div
                    className={cn("h-full", progressBar)}
                    style={{ animation: `toast-progress ${duration}ms linear forwards` }}
                />
            </div>
            <style>{`
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
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
