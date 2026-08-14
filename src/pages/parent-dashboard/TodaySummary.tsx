import { CheckCircle2, XCircle, BookOpen, CalendarDays } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Student } from '../../types';

interface TodaySummaryProps {
    sessions: Student[];
    children: Student[];
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const cards = [
    {
        key: 'present',
        icon: CheckCircle2,
        label: 'حاضر',
        color: 'text-success',
        bg: 'bg-success-soft dark:bg-success/10',
    },
    {
        key: 'absent',
        icon: XCircle,
        label: 'غائب',
        color: 'text-error',
        bg: 'bg-error-soft dark:bg-error/10',
    },
    {
        key: 'lessons',
        icon: BookOpen,
        label: 'الدروس',
        color: 'text-info',
        bg: 'bg-info-soft dark:bg-info/10',
    },
    {
        key: 'day',
        icon: CalendarDays,
        label: 'اليوم',
        color: 'text-primary',
        bg: 'bg-primary-soft dark:bg-primary/10',
    },
];

export const TodaySummary = ({ sessions, todayTasks }: TodaySummaryProps) => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weeklyCompleted = sessions.filter(s => {
        if (s.status !== 'completed') return false;
        const sessionDate = (s as Record<string, unknown>).date;
        if (!sessionDate || typeof sessionDate !== 'string') return false;
        try { return new Date(sessionDate) >= weekStart; } catch { return false; }
    }).length;

    const dayIndex = new Date().getDay();
    const todayName = ARABIC_DAYS[dayIndex];

    const values: Record<string, { value: string | number; subtitle?: string }> = {
        present: { value: completed, subtitle: weeklyCompleted > 0 ? `+${weeklyCompleted} هذا الأسبوع` : undefined },
        absent: { value: cancelled, subtitle: cancelled > 0 ? undefined : undefined },
        lessons: { value: todayTasks.length, subtitle: todayTasks.length > 0 ? 'حصص اليوم' : 'لا توجد حصص' },
        day: { value: todayName, subtitle: format(new Date(), 'd MMMM', { locale: ar }) },
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                const val = values[card.key];
                return (
                    <div
                        key={card.key}
                        className="bg-surface dark:bg-card border border-border dark:border-border rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-elevation-1"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <Icon size={18} className={card.color} />
                            </div>
                        </div>
                        <p className="text-2xl md:text-[28px] font-bold text-main dark:text-main leading-none tracking-tight mb-1">
                            {val.value}
                        </p>
                        <p className="text-[13px] font-medium text-muted dark:text-muted">{card.label}</p>
                        {val.subtitle && (
                            <p className={`text-[11px] font-semibold mt-1.5 ${card.color}`}>{val.subtitle}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
