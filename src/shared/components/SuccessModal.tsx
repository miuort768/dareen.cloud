import { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
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
    const [progress, setProgress] = useState(100);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const duration = 3000; // 3 seconds auto-close

    useEffect(() => {
        if (isOpen) {
            setIsExiting(false);
            setProgress(100);
            
            if (autoClose) {
                const startTime = Date.now();
                
                // Smooth progress bar update
                intervalRef.current = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                    setProgress(remaining);
                }, 16); // ~60fps update for butter-smooth animation
                
                timeoutRef.current = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                };
            }
        }
    }, [isOpen, autoClose, handleClose]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeoutRef.current = setTimeout(onClose, 350); // Wait for exit transition
    }, [onClose]);

    if (!isOpen && !isExiting) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] w-full max-w-sm pointer-events-none px-4 sm:px-0" dir="rtl">
            <div className={cn(
                'relative overflow-hidden bg-white/70 dark:bg-slate-900/75 backdrop-blur-lg',
                'border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4.5',
                'pointer-events-auto transition-all duration-300 ease-out',
                'shadow-[0_10px_30px_rgba(16,185,129,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]',
                isExiting ? 'opacity-0 translate-y-6 scale-90 blur-sm' : 'animate-in slide-in-from-bottom-6 fade-in duration-300'
            )}>
                
                {/* ── Glowing Ambient Background ── */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-3.5 relative z-10">
                    
                    {/* ── Glowing Success Icon ── */}
                    <div className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] animate-pulse">
                            <CheckCircle2 size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400/20 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                            <Sparkles size={8} />
                        </div>
                    </div>
                    
                    {/* ── Text Content ── */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 font-sans tracking-tight leading-none">
                            {title}
                        </h3>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    {/* ── Close Button ── */}
                    <button 
                        onClick={handleClose}
                        className={cn(
                            'flex-shrink-0 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200',
                            'p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800',
                            'border border-slate-100 dark:border-slate-800 transition-all active:scale-95'
                        )}
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* ── Smooth Progress Count Down Bar ── */}
                {autoClose && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-75 ease-linear rounded-r-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
export default SuccessModal;
