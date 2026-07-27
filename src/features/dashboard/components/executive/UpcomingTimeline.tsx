import { memo } from 'react';
import type { UpcomingSession } from '../../services/executiveService';
import { Clock, GraduationCap, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const URGENCY_DOT: Record<string, string> = {
    now: 'bg-error',
    very_soon: 'bg-warning',
    soon: 'bg-info',
    within_hour: 'bg-success',
    later: 'bg-muted',
};

const URGENCY_ROW: Record<string, string> = {
    now: 'bg-error/10 border-error/20',
    very_soon: 'bg-warning/10 border-warning/20',
    soon: 'bg-info/10 border-info/20',
    within_hour: 'bg-success/10 border-success/20',
    later: 'bg-surface border-border',
};

const URGENCY_BADGE: Record<string, string> = {
    now: 'bg-error-soft text-error',
    very_soon: 'bg-warning-soft text-warning',
    soon: 'bg-info-soft text-info',
    within_hour: 'bg-success-soft text-success',
    later: 'bg-surface text-muted',
};

export const UpcomingTimeline = memo(function UpcomingTimeline({ sessions }: { sessions: UpcomingSession[] }) {
    if (!sessions) return null;
    const sorted = [...sessions].sort((a, b) => a.minutesUntil - b.minutesUntil);

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                    <Calendar size={16} className="text-info" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main">الجلسات القادمة</h3>
                    <p className="text-[10px] text-muted">الجدول الزمني</p>
                </div>
            </div>

            <div className="space-y-1">
                {sorted.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                            <Calendar size={16} className="text-success/50" />
                        </div>
                        <p className="text-xs font-bold text-muted">لا توجد جلسات قادمة</p>
                    </div>
                )}
                {sorted.map((session, idx) => {
                    const isLast = idx === sorted.length - 1;
                    return (
                        <div key={session.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-border shrink-0 mt-2", URGENCY_DOT[session.urgency] || 'bg-muted')} />
                                {!isLast && <div className="w-px flex-1 min-h-[6px] bg-border/30" />}
                            </div>
                            <div className={cn("flex-1 min-w-0 p-3 rounded-xl border transition-colors mb-1.5", URGENCY_ROW[session.urgency] || 'bg-surface border-border')}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-[11px] font-bold text-main truncate">{session.subject}</p>
                                    <span className={cn("shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold", URGENCY_BADGE[session.urgency] || 'bg-surface text-muted')}>
                                        {session.minutesUntil < 60 ? `${session.minutesUntil}د` : `${Math.round(session.minutesUntil / 60)}س`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted">
                                    <span className="flex items-center gap-1"><User size={9} />{session.studentName}</span>
                                    <span className="flex items-center gap-1"><GraduationCap size={9} />{session.teacherName}</span>
                                    <span className="flex items-center gap-1 ms-auto"><Clock size={9} />{session.time}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
