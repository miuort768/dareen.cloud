import { memo } from 'react';
import { UpcomingSession } from '../../services/executiveService';
import { Clock, GraduationCap, User } from 'lucide-react';

const URGENCY_COLORS: Record<string, string> = {
    now: 'var(--bg-error)',
    very_soon: 'var(--bg-warning)',
    soon: 'var(--bg-info)',
    within_hour: 'var(--bg-success)',
    later: 'var(--text-muted)',
};

const URGENCY_LABELS: Record<string, string> = {
    now: 'الآن',
    very_soon: 'قريباً جداً',
    soon: 'قريباً',
    within_hour: 'خلال ساعة',
    later: 'لاحقاً',
};

const TIME_COLORS: Record<string, string> = {
    now: 'rgba(244,63,94,0.05)',
    very_soon: 'rgba(245,158,11,0.05)',
    soon: 'rgba(59,130,246,0.05)',
    within_hour: 'rgba(34,197,94,0.05)',
    later: 'var(--bg-surface)',
};

export const UpcomingTimeline = memo(function UpcomingTimeline({ sessions }: { sessions: UpcomingSession[] }) {
    if (!sessions) return null;
    const sorted = [...sessions].sort((a, b) => a.minutesUntil - b.minutesUntil);

    return (
        <div className="rounded-3xl p-5 bg-white shadow-soft dark:bg-card border border-border dark:border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted dark:text-muted">الجلسات القادمة</h3>
                <Clock size={18} className="text-muted" />
            </div>

            <div className="space-y-2">
                {sorted.length === 0 && (
                    <p className="text-xs text-muted dark:text-muted text-center py-4">لا توجد جلسات قادمة</p>
                )}
                {sorted.map((session) => {
                    const urgencyColor = URGENCY_COLORS[session.urgency] || 'var(--text-muted)';
                    const timeBg = TIME_COLORS[session.urgency] || 'var(--bg-surface)';
                    return (
                        <div
                            key={session.id}
                            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                            style={{
                                backgroundColor: timeBg + '99',
                                borderRight: `4px solid ${urgencyColor}`,
                            }}
                        >
                            <div className="flex flex-col items-center min-w-[44px]">
                                <span className="text-lg font-bold" style={{ color: urgencyColor }}>
                                    {session.minutesUntil < 60 ? `${session.minutesUntil}د` : `${Math.round(session.minutesUntil / 60)}س`}
                                </span>
                                <span className="text-micro text-muted">{URGENCY_LABELS[session.urgency]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-main dark:text-on-primary truncate">{session.subject}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                    <span className="flex items-center gap-1"><User size={13} />{session.studentName}</span>
                                    <span className="flex items-center gap-1"><GraduationCap size={13} />{session.teacherName}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap">{session.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
