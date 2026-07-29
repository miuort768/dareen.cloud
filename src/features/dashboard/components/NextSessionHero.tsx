import { useState, useEffect } from 'react';
import { Clock, Play, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-soft p-5">
            <div className="absolute top-0 start-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 end-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-white/70 text-micro font-bold">الحصة القادمة</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                        <GraduationCap size={24} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-white leading-tight mb-0.5">
                            {nextSession.subject}
                        </h2>
                        <p className="text-sm text-white/70 font-medium">
                            {nextSession.studentName}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15">
                            <Clock size={15} className="text-white/80" />
                            <span className={cn(
                                "text-xl font-bold tabular-nums tracking-wider text-white",
                            )}>
                                {isNow ? "الآن" : timeLeft}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-white/60 font-medium">{nextSession.time}</span>
                    <Button
                        onClick={() => onStart(nextSession.id)}
                        className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
                        size="sm"
                    >
                        <Play size={14} fill="currentColor" />
                        بدء الحصة
                    </Button>
                </div>
            </div>
        </div>
    );
};