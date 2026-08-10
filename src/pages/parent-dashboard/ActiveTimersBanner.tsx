import { Clock } from 'lucide-react';
import type { ActiveTimerSession } from './types';

interface ActiveTimersBannerProps {
    activeTimers: ActiveTimerSession[];
    children: { id: string; name: string }[];
    formatTime: (startedAt: string | null | undefined) => string;
}

export const ActiveTimersBanner = ({ activeTimers, children: kids, formatTime }: ActiveTimersBannerProps) => {
    if (activeTimers.length === 0) return null;

    return (
        <div className="space-y-2">
            {activeTimers.map((session) => {
                const child = kids.find(c => c.id === session.studentId);
                return (
                    <div key={session.id} className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-warning-soft dark:bg-[#D4AF37]/15 flex items-center justify-center ring-1 ring-warning/20 dark:ring-[#D4AF37]/30 animate-pulse">
                                    <Clock size={18} className="text-warning dark:text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs text-main dark:text-white">حصة جارية الآن</h3>
                                    <p className="text-micro font-medium text-muted dark:text-zinc-400">
                                        {child?.name || 'ابن'} — {session.subject}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xl font-bold font-mono tracking-widest text-main dark:text-white">
                                {formatTime(session.startedAt)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
