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
        success: { icon: CheckCircle2, iconBg: 'bg-success', iconText: 'text-on-success', text: 'text-success', progressBar: 'bg-success', ring: 'ring-success/20', startBorder: 'border-s-success', label: 'تم بنجاح' },
        error: { icon: XCircle, iconBg: 'bg-error', iconText: 'text-on-error', text: 'text-error', progressBar: 'bg-error', ring: 'ring-error/20', startBorder: 'border-s-error', label: 'خطأ' },
        warning: { icon: AlertCircle, iconBg: 'bg-warning', iconText: 'text-on-warning', text: 'text-warning', progressBar: 'bg-warning', ring: 'ring-warning/20', startBorder: 'border-s-warning', label: 'تنبيه' },
        info: { icon: Info, iconBg: 'bg-info', iconText: 'text-on-info', text: 'text-info', progressBar: 'bg-info', ring: 'ring-info/20', startBorder: 'border-s-info', label: 'ملاحظة' }
    };

    const { icon: Icon, iconBg, iconText, text, progressBar, ring, startBorder, label } = config[type];

    return (
        <div className={cn(
            "group relative flex items-center gap-3 p-3 pe-2 w-full sm:min-w-[300px] sm:max-w-[380px] bg-card border border-border border-s-4 shadow-elevation-3 rounded-none transition-all duration-500 overflow-hidden",
            startBorder,
            isExiting ? "opacity-0 scale-95 -translate-x-4" : "animate-in slide-in-from-left-8 fade-in",
            "hover:shadow-elevation-4 hover:-translate-y-0.5"
        )}>
            <div className={cn("w-9 h-9 rounded-none flex items-center justify-center shrink-0 ring-1 shadow-sm", iconBg, iconText, ring)}>
                <Icon size={18} />
            </div>
            <div className="flex-1 z-10 text-start min-w-0">
                <p className={cn("text-[10px] font-bold mb-0.5", text)}>{label}</p>
                <p className="font-bold text-xs text-main leading-snug line-clamp-2">{message}</p>
            </div>
            <button
                onClick={handleClose}
                className="p-1.5 shrink-0 text-muted hover:bg-error-soft hover:text-error rounded-none transition-colors"
                aria-label="إغلاق"
            >
                <X size={14} />
            </button>
            <div className="absolute bottom-0 end-0 start-0 h-1 overflow-hidden">
                <div
                    className={cn("h-full opacity-50", progressBar)}
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
        <div className="fixed bottom-4 left-4 md:left-6 md:bottom-6 z-[900] flex flex-col items-start gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2.5 w-full max-w-[380px]">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
