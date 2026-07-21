import { memo } from 'react';
import type { UpcomingSession } from '../../services/executiveService';
import { Clock, GraduationCap, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const URGENCY_DOT: Record<string, string> = {
    now: 'bg-error',
    very_soon: 'bg-warning',
    soon: 'bg-info',
    within_hour: 'bg-success',
    later: 'bg-muted',
};

const URGENCY_ROW: Record<string, string> = {
    now: 'bg-error/5',
    very_soon: 'bg-warning/5',
    soon: 'bg-info/5',
    within_hour: 'bg-success/5',
    later: 'bg-surface',
};

const URGENCY_BADGE: Record<string, string> = {
    now: 'bg-error-soft text-error',
    very_soon: 'bg-warning-soft text-warning',
    soon: 'bg-info-soft text-info',
    within_hour: 'bg-success-soft text-success',
    later: 'bg-muted/20 text-muted',
};

export const UpcomingTimeline = memo(function UpcomingTimeline({ sessions }: { sessions: UpcomingSession[] }) {
    if (!sessions) return null;
    const sorted = [...sessions].sort((a, b) => a.minutesUntil - b.minutesUntil);

    return (
        <Card>
            <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-muted" />
                <h3 className="text-xs text-muted">الجلسات القادمة</h3>
            </div>

            <div className="space-y-1">
                {sorted.length === 0 && (
                    <p className="text-xs text-muted text-center py-8">لا توجد جلسات قادمة</p>
                )}
                {sorted.map((session, idx) => {
                    const isLast = idx === sorted.length - 1;

                    return (
                        <div key={session.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-3 h-3 rounded-full ring-2 ring-border flex-shrink-0 mt-1.5 ${URGENCY_DOT[session.urgency] || 'bg-muted'}`}
                                />
                                {!isLast && (
                                    <div className="w-px flex-1 min-h-[8px] bg-border/30" />
                                )}
                            </div>
                            <div
                                className={`flex-1 min-w-0 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-border/20 group mb-2 ${URGENCY_ROW[session.urgency] || 'bg-surface'}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <p className="text-sm font-semibold text-main truncate">{session.subject}</p>
                                    <span
                                        className={`shrink-0 px-2 py-0.5 rounded-md text-micro font-bold ${URGENCY_BADGE[session.urgency] || 'bg-muted/20 text-muted'}`}
                                    >
                                        {session.minutesUntil < 60
                                            ? `${session.minutesUntil}د`
                                            : `${Math.round(session.minutesUntil / 60)}س`
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted">
                                    <span className="flex items-center gap-1"><User size={12} />{session.studentName}</span>
                                    <span className="flex items-center gap-1"><GraduationCap size={12} />{session.teacherName}</span>
                                    <span className="flex items-center gap-1 ms-auto"><Clock size={12} />{session.time}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </CardContent></Card>
    );
});
