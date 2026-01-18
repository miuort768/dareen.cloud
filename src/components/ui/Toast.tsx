import { useEffect } from 'react';
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
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            accent: 'bg-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        },
        error: {
            icon: XCircle,
            accent: 'bg-rose-600',
            bg: 'bg-rose-50 dark:bg-rose-950/30',
            iconColor: 'text-rose-600 dark:text-rose-400'
        },
        warning: {
            icon: AlertCircle,
            accent: 'bg-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            iconColor: 'text-amber-600 dark:text-amber-400'
        },
        info: {
            icon: Info,
            accent: 'bg-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
        }
    };

    const { icon: Icon, accent, iconColor } = config[type];
    const { bg } = config[type]; // Get bg separately

    return (
        <div className={cn(
            "relative flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden min-w-[340px] max-w-md animate-in slide-in-from-right-10 fade-in duration-300",
            "rounded-none border-r-[6px]",
            bg,
            type === 'success' ? 'border-r-emerald-500' :
                type === 'error' ? 'border-r-rose-500' :
                    type === 'warning' ? 'border-r-amber-500' : 'border-r-blue-500'
        )}>
            {/* Geometric Accents */}
            <div className={cn("absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-10", accent)}></div>
            <div className={cn("absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-5", accent)}></div>

            <div className={cn("relative z-10 p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm", iconColor)}>
                <Icon size={24} />
            </div>

            <div className="flex-1 z-10 text-right">
                <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight leading-relaxed">{message}</p>
            </div>

            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-10 p-1"
            >
                <X size={18} />
            </button>

            {/* Progress Bar Animation */}
            <div className="absolute bottom-0 left-0 h-1 bg-gray-100 dark:bg-gray-800 w-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-[4000ms] ease-linear", accent)}
                    style={{ width: '100%', animation: `shrink ${duration}ms linear forwards` }}
                ></div>
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
