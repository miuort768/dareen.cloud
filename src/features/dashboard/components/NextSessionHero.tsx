import { useState, useEffect } from 'react';
import { Clock, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TimelineSession {
    id: string;
    studentName: string;
    time: string;
    subject: string;
    status: string;
}

interface NextSessionHeroProps {
    timeline?: TimelineSession[];
    onStart: (id: string) => void;
}

export const NextSessionHero = ({ timeline, onStart }: NextSessionHeroProps) => {
    const nextSession = timeline?.find(s => s.status === 'scheduled' || s.status === 'in-progress');
    const [timeLeft, setTimeLeft] = useState('');
    const [isNow, setIsNow] = useState(false);

    useEffect(() => {
        if (!nextSession) return;

        const updateTimer = () => {
            const [hours, minutes] = nextSession.time.split(':').map(Number);
            const now = new Date();
            const sessionTime = new Date();
            sessionTime.setHours(hours, minutes, 0);
            sessionTime.setSeconds(0);

            const diff = sessionTime.getTime() - now.getTime();

            if (diff <= 0) {
                setIsNow(true);
                setTimeLeft('00:00:00');
                return;
            }

            setIsNow(false);
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [nextSession]);

    if (!nextSession) return null;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-5 shadow-lg",
            "bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-primary-active)]",
            "dark:from-[var(--bg-primary)] dark:via-[var(--bg-primary)] dark:to-[var(--bg-primary)]"
        )}>
            <div className="absolute top-0 end-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-primary text-micro font-bold uppercase tracking-wider">الحصة القادمة</span>
                </div>
                <h2 className="text-lg font-black text-on-primary leading-tight mb-0.5">
                    {nextSession.subject}
                </h2>
                <p className="text-primary text-xs font-bold">
                    {nextSession.studentName}
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <Clock size={16} className="text-primary" />
                    <span className={cn(
                        "text-3xl font-black tabular-nums tracking-wider",
                        isNow ? "text-success" : "text-on-primary"
                    )}>
                        {isNow ? "الآن" : timeLeft}
                    </span>
                </div>
                <button
                    onClick={() => onStart(nextSession.id)}
                    className={cn(
                        "mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all",
                        "bg-white/20 backdrop-blur-sm border border-white/30 text-on-primary",
                        "hover:bg-white/30 active:scale-[0.98]"
                    )}
                >
                    <Play size={14} fill="white" />
                    بدء الحصة
                </button>
            </div>
        </div>
    );
};
