import { memo } from 'react';
import { UpcomingSession } from '../../services/executiveService';
import { Clock, GraduationCap, User } from 'lucide-react';

const URGENCY_COLORS: Record<string, string> = {
    now: '#ef4444',
    very_soon: '#f59e0b',
    soon: '#3b82f6',
    within_hour: '#22c55e',
    later: '#6b7280',
};

const URGENCY_LABELS: Record<string, string> = {
    now: 'الآن',
    very_soon: 'قريباً جداً',
    soon: 'قريباً',
    within_hour: 'خلال ساعة',
    later: 'لاحقاً',
};

const TIME_COLORS: Record<string, string> = {
    now: '#fef2f2',
    very_soon: '#fffbeb',
    soon: '#eff6ff',
    within_hour: '#f0fdf4',
    later: '#f9fafb',
};

export const UpcomingTimeline = memo(function UpcomingTimeline({ sessions }: { sessions: UpcomingSession[] }) {
    if (!sessions) return null;
    const sorted = [...sessions].sort((a, b) => a.minutesUntil - b.minutesUntil);

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">الجلسات القادمة</h3>
                <Clock size={18} className="text-gray-500" />
            </div>

            <div className="space-y-2">
                {sorted.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">لا توجد جلسات قادمة</p>
                )}
                {sorted.map((session) => {
                    const urgencyColor = URGENCY_COLORS[session.urgency] || '#6b7280';
                    const timeBg = TIME_COLORS[session.urgency] || '#f9fafb';
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
                                <span className="text-[10px] text-gray-400">{URGENCY_LABELS[session.urgency]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{session.subject}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><User size={13} />{session.studentName}</span>
                                    <span className="flex items-center gap-1"><GraduationCap size={13} />{session.teacherName}</span>
                                </div>
                            </div>
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">{session.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
