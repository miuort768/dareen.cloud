import { useState, useEffect } from 'react';
import { Clock, Play, GraduationCap, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimelineSession {
    id: string;
    studentId?: string;
    studentName: string;
    time: string;
    subject: string;
    status: string;
}

interface NextSessionHeroProps {
    timeline?: TimelineSession[];
    onStart: (id?: string, subject?: string) => void;
    onSkip?: () => void;
}

const parseTime = (t?: string) => {
    const raw = String(t || '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).trim();
    const match = raw.match(/(\d{1,2})\s*[:.]?\s*(\d{0,2})/);
    if (!match) return { h: 0, m: 0 };
    let h = parseInt(match[1], 10) || 0;
    const m = match[2] ? (parseInt(match[2], 10) || 0) : 0;
    const lower = raw.toLowerCase();
    if (lower.includes('pm') && h < 12) h += 12;
    if (lower.includes('am') && h === 12) h = 0;
    return { h: h % 24, m: m % 60 };
};

export const NextSessionHero = ({ timeline, onStart, onSkip }: NextSessionHeroProps) => {
    const nextSession = timeline?.find(s => s.status === 'scheduled' || s.status === 'in-progress');
    const allSessions = timeline || [];
    const remainingSessions = allSessions.filter(s => s.status === 'scheduled' || s.status === 'in-progress');
    const [timeLeft, setTimeLeft] = useState('');
    const [isNow, setIsNow] = useState(false);

    useEffect(() => {
        if (!nextSession) return;

        const updateTimer = () => {
            const { h: hours, m: minutes } = parseTime(nextSession.time);
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
        <div className="relative overflow-hidden rounded-2xl bg-primary dark:bg-primary p-5">
            <div className="absolute top-0 start-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 end-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-white/70 dark:text-on-primary/70 text-micro font-bold">الحصة القادمة</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-on-primary/15 dark:bg-on-primary/15 flex items-center justify-center shrink-0">
                        <GraduationCap size={24} className="text-white dark:text-on-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-on-primary leading-tight mb-0.5">
                            {nextSession?.subject || ''}
                        </h2>
                        <p className="text-sm text-white/70 dark:text-on-primary/70 font-medium">
                            {nextSession?.studentName || ''}
                        </p>
                        {nextSession?.studentGrade && (
                            <p className="text-[10px] text-white/60 dark:text-on-primary/60 font-medium">
                                Grade: {nextSession.studentGrade}
                            </p>
                        )}
                        {nextSession?.curriculum && (
                            <p className="text-[10px] text-white/60 dark:text-on-primary/60 font-medium">
                                {nextSession.curriculum}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-on-primary/15 dark:bg-on-primary/15">
                            <Clock size={15} className="text-white/80 dark:text-on-primary/70" />
                            <span className={cn(
                                "text-xl font-bold tabular-nums tracking-wider text-white",
                            )}>
                                {isNow ? "الآن" : timeLeft}
                            </span>
                        </div>
                        {onSkip && (
                            <Button
                                onClick={onSkip}
                                className="ml-2 bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white dark:text-on-primary border-0 gap-2 text-sm"
                                size="sm"
                            >
                                <SkipForward size={14} fill="currentColor" />
                                تخطي
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-white/60 dark:text-on-primary/60 font-medium">{nextSession?.time || ''}</span>
                    <Button
                        onClick={() => onStart(nextSession?.id)}
                        className="bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 text-white dark:text-on-primary border-0 gap-2"
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