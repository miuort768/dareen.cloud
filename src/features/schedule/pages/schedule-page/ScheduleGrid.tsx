import { Clock } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ScheduleEvent {
    id: string;
    studentId: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    studentPoints?: number;
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const TIME_SLOTS = [
    { hour: 8, period: 'am', label: '8 ص' }, { hour: 9, period: 'am', label: '9 ص' },
    { hour: 10, period: 'am', label: '10 ص' }, { hour: 11, period: 'am', label: '11 ص' },
    { hour: 12, period: 'pm', label: '12 م' }, { hour: 1, period: 'pm', label: '1 م' },
    { hour: 2, period: 'pm', label: '2 م' }, { hour: 3, period: 'pm', label: '3 م' },
    { hour: 4, period: 'pm', label: '4 م' }, { hour: 5, period: 'pm', label: '5 م' },
    { hour: 6, period: 'pm', label: '6 م' }, { hour: 7, period: 'pm', label: '7 م' },
    { hour: 8, period: 'pm', label: '8 م' }, { hour: 9, period: 'pm', label: '9 م' },
    { hour: 10, period: 'pm', label: '10 م' },
];

const ACCENT_COLORS = [
    { text: 'text-primary', bg: 'bg-primary', bgLight: 'bg-primary/5', label: 'بنفسجي' },
    { text: 'text-success', bg: 'bg-success', bgLight: 'bg-success/5', label: 'أخضر' },
    { text: 'text-warning', bg: 'bg-warning', bgLight: 'bg-warning/5', label: 'عنبر' },
    { text: 'text-error', bg: 'bg-error', bgLight: 'bg-error/5', label: 'وردي' },
    { text: 'text-success', bg: 'bg-success', bgLight: 'bg-success/5', label: 'زيتي' },
    { text: 'text-primary', bg: 'bg-primary', bgLight: 'bg-primary/5', label: 'بنفسجي فاتح' },
    { text: 'text-warning', bg: 'bg-warning', bgLight: 'bg-warning/5', label: 'برتقالي' },
];

interface ScheduleGridProps {
    filteredEvents: ScheduleEvent[];
    uniqueTeachers: string[];
    onSelectEvent: (event: ScheduleEvent) => void;
}

export const ScheduleGrid = ({ filteredEvents, uniqueTeachers, onSelectEvent }: ScheduleGridProps) => {
    const isToday = (day: string) => new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
    const getDayEvents = (events: ScheduleEvent[], day: string) => events.filter(e => e.day === day);
    const getColorIndex = (event: ScheduleEvent) => Math.max(0, uniqueTeachers.indexOf(event.teacherName));

    return (
        <div className="bg-white dark:bg-primary-active border border-border/50 dark:border-border/50 shadow-sm overflow-hidden rounded-2xl mt-4">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[900px]">
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border">
                        <div className="sticky start-0 z-10 p-3 text-micro font-bold text-inverse border-e border-border bg-primary-active dark:bg-background">الوقت</div>
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className={cn("p-3 text-micro font-bold text-center border-e border-border last:border-e-0 bg-primary-active dark:bg-background", isToday(day) ? "text-on-primary" : "text-inverse")}>
                                <span>{day}</span>
                                {isToday(day) && <span className="ms-1.5 w-1.5 h-1.5 rounded-full inline-block animate-pulse bg-primary" />}
                            </div>
                        ))}
                    </div>
                    {TIME_SLOTS.map((slot, slotIdx) => {
                        const currentTimeSlots = filteredEvents.filter(e => e.hour === String(slot.hour) && e.period === slot.period);
                        const isEmpty = currentTimeSlots.length === 0;
                        return (
                            <div key={`${slot.hour}-${slot.period}`} className={cn("grid grid-cols-[80px_repeat(7,1fr)]", slotIdx % 2 === 0 ? "bg-white dark:bg-primary-active" : "bg-background/30 dark:bg-background/20")}>
                                <div className="sticky start-0 z-10 p-2 text-micro font-bold text-muted border-e border-b border-border/50 dark:border-border/50 flex items-center justify-center h-full bg-inherit">
                                    <Clock size={10} className="me-1 inline" />{slot.label}
                                </div>
                                {DAYS_OF_WEEK.map((day) => {
                                    const dayEvents = getDayEvents(currentTimeSlots, day);
                                    const event = dayEvents[0];
                                    if (event) {
                                        const colorIdx = getColorIndex(event);
                                        const accent = ACCENT_COLORS[colorIdx % ACCENT_COLORS.length];
                                        return (
                                            <div key={`${day}-${slot.hour}`}
                                                onClick={() => onSelectEvent(event)}
                                                className={`p-1.5 border-e last:border-e-0 border-b border-border/50 dark:border-border/50 cursor-pointer transition-all hover:z-10 hover:shadow-sm hover:-translate-y-0.5 relative group min-h-[72px] ${accent.bgLight}`}>
                                                <div className={`absolute top-0 start-0 w-full h-0.5 ${accent.bg}`} />
                                                <div className="flex items-start gap-1.5 h-full">
                                                    <div className={`w-1 h-full shrink-0 mt-0.5 ${accent.bg}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-micro font-bold leading-tight mb-0.5 truncate ${accent.text}`}>{event.studentName}</p>
                                                        <p className="text-micro font-bold text-muted truncate">{event.subject}</p>
                                                        <p className="text-micro font-bold text-muted truncate">{event.teacherName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={`${day}-${slot.hour}`}
                                            className="p-2 border-e last:border-e-0 border-b border-border/50 dark:border-border/50 min-h-[72px]">
                                            {!isEmpty && <div className="text-micro font-bold text-dim text-center">—</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="border-t border-border/50 dark:border-border/50 p-4 flex flex-wrap items-center gap-4 bg-background/50 dark:bg-background/20 no-print">
                <span className="text-micro font-bold text-muted">دليل الألوان:</span>
                {uniqueTeachers.map((teacher, idx) => {
                    const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                    return (
                            <div key={idx} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 ${accent.bg}`} />
                            <span className="text-micro font-bold text-muted">{teacher}</span>
                        </div>
                    );
                })}
                <span className="text-micro font-bold text-muted ms-auto">{filteredEvents.length} حصة</span>
            </div>
        </div>
    );
};
