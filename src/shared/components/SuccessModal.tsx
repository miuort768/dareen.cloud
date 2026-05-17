import { useEffect, useState } from 'react';
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

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400); // Wait for exit animation
    };

    if (!isOpen && !isExiting) return null;

    return (
        <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[300] flex items-end justify-start p-0 pointer-events-none" dir="rtl">
            <div className={cn(
                "relative bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] p-6 max-w-sm w-full pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isExiting ? "opacity-0 scale-95 translate-y-8" : "animate-in slide-in-from-bottom-12 fade-in"
            )}>
                <button 
                    onClick={handleClose}
                    className="absolute top-3 left-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                        <div className="relative w-full h-full bg-emerald-500 text-white rounded-none flex items-center justify-center border-2 border-emerald-600 shadow-[2px_2px_0px_0px_rgba(4,120,87,1)]">
                            <CheckCircle2 size={24} className="animate-pulse" />
                        </div>
                    </div>
                    
                    <div className="flex-1 pt-1">
                        <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mb-1 tracking-tighter">
                            {title}
                        </h3>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            {message}
                        </p>
                        
                        <button 
                            onClick={handleClose}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(4,120,87,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                        >
                            إخفاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
