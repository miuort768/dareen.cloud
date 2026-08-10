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
        color: 'success',
        bg: 'bg-success/10',
        ring: 'ring-success/20',
        text: 'text-success',
        grow: true,
    },
    {
        key: 'absent',
        icon: XCircle,
        label: 'غائب',
        color: 'error',
        bg: 'bg-error/10',
        ring: 'ring-error/20',
        text: 'text-error',
        grow: true,
    },
    {
        key: 'lessons',
        icon: BookOpen,
        label: 'الدروس',
        color: 'info',
        bg: 'bg-info/10',
        ring: 'ring-info/20',
        text: 'text-info',
        grow: false,
    },
    {
        key: 'day',
        icon: CalendarDays,
        label: 'اليوم',
        color: 'warning',
        bg: 'bg-warning/10',
        ring: 'ring-warning/20',
        text: 'text-warning',
        grow: false,
    },
];

export const TodaySummary = ({ sessions, children: kids, todayTasks }: TodaySummaryProps) => {
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
                        className="group relative overflow-hidden rounded-2xl bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 p-4 md:p-5 transition-all duration-300 hover:shadow-elevation-2 hover:-translate-y-0.5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} dark:bg-[#D4AF37]/10 ${card.ring} ring-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                <Icon size={18} className={card.text} />
                            </div>
                        </div>
                        <p className="text-2xl md:text-[28px] font-bold text-main dark:text-white leading-none tracking-tight mb-1">
                            {val.value}
                        </p>
                        <p className="text-[13px] font-medium text-muted dark:text-zinc-400">{card.label}</p>
                        {val.subtitle && (
                            <p className={`text-[11px] font-semibold mt-1.5 ${card.text}`}>{val.subtitle}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};