import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast = ({ id, type, message, duration = 3000, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            containerClass: 'bg-white/90 dark:bg-gray-900/90 border-l-4 border-l-emerald-500',
            iconClass: 'text-emerald-500'
        },
        error: {
            icon: XCircle,
            containerClass: 'bg-white/90 dark:bg-gray-900/90 border-l-4 border-l-rose-500',
            iconClass: 'text-rose-500'
        },
        warning: {
            icon: AlertCircle,
            containerClass: 'bg-white/90 dark:bg-gray-900/90 border-l-4 border-l-amber-500',
            iconClass: 'text-amber-500'
        },
        info: {
            icon: Info,
            containerClass: 'bg-white/90 dark:bg-gray-900/90 border-l-4 border-l-blue-500',
            iconClass: 'text-blue-500'
        }
    };

    const { icon: Icon, containerClass, iconClass } = config[type];

    return (
        <div className={`relative flex items-center gap-4 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${containerClass} min-w-[320px] max-w-sm group border-y border-r border-gray-100 dark:border-gray-800`}>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/40 to-transparent dark:from-white/5 pointer-events-none rounded-xl"></div>
            <div className={`p-2 rounded-full bg-gray-50 dark:bg-gray-800 ${iconClass}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1 z-10">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2 scale-100 hover:scale-[1.02] transition-transform origin-bottom-left">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
