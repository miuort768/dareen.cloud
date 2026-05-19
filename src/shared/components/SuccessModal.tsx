import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SuccessModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    autoClose?: boolean;
}

export const SuccessModal = ({ isOpen, title = 'عملية ناجحة', message, onClose, autoClose = true }: SuccessModalProps) => {
    const [isExiting, setIsExiting] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsExiting(false);
            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, autoClose]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(onClose, 300); // Wait for exit animation
    };

    if (!isOpen && !isExiting) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[300] w-full max-w-sm pointer-events-none" dir="rtl">
            <div className={cn(
                "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 pointer-events-auto transition-all duration-300 ease-out shadow-none",
                isExiting ? "opacity-0 translate-y-4 scale-95" : "animate-in slide-in-from-bottom-4 fade-in"
            )}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5">
                        <CheckCircle2 size={18} className="stroke-[2.5]" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                            {title}
                        </h3>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    <button 
                        onClick={handleClose}
                        className="flex-shrink-0 text-emerald-500/60 hover:text-emerald-950 dark:text-emerald-400/60 dark:hover:text-emerald-200 transition-colors p-0.5 rounded hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
