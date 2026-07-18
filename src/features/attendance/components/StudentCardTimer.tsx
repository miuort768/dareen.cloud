import { Clock, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentCardTimerProps {
    timerRunning: boolean;
    timerSeconds: number;
    onToggle: () => void;
    onReschedule?: () => void;
    formatTime: (secs: number) => string;
}

export const StudentCardTimer = ({ timerRunning, timerSeconds, onToggle, onReschedule, formatTime }: StudentCardTimerProps) => (
    <div className="grid grid-cols-2 gap-2">
        <button onClick={onToggle}
            className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all shadow-soft active:scale-95", timerRunning ? "bg-error border-error text-on-primary" : "bg-primary border-primary text-on-primary hover:bg-primary-hover")}>
            <div className="flex items-center gap-2">
                <Clock size={14} className={cn(timerRunning && "animate-spin-slow")} />
                <span className="text-xs font-bold font-mono">{formatTime(timerSeconds)}</span>
            </div>
            <span className="text-micro font-bold uppercase">{timerRunning ? 'إنهاء' : 'بدء'}</span>
        </button>
        <button onClick={onReschedule}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-card border border-border text-muted hover:bg-surface rounded-xl font-bold text-micro uppercase transition-all shadow-soft active:scale-95">
            <Calendar size={14} /> إعادة جدولة
        </button>
    </div>
);
