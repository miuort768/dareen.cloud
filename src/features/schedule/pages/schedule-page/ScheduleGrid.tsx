import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, GraduationCap, UserRound } from 'lucide-react';

interface ScheduleEvent {
    id: string; studentId: string; studentName: string; studentGrade: string;
    teacherName: string; subject: string; curriculum: string; day: string;
    hour: string; period: string; time: string; studentPoints?: number;
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

interface SubjectColors { bar: string; soft: string; text: string; border: string; }

const SUBJECT_COLORS: Record<string, SubjectColors> = {
    'رياضيات': { bar: 'bg-primary', soft: 'bg-primary-soft', text: 'text-primary', border: 'border-primary' },
    'علوم': { bar: 'bg-success', soft: 'bg-success-soft', text: 'text-success', border: 'border-success' },
    'عربي': { bar: 'bg-warning', soft: 'bg-warning-soft', text: 'text-warning', border: 'border-warning' },
    'انجليزي': { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
    'دين': { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
    'تاريخ': { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
    'قرآن': { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
    'قواعد': { bar: 'bg-primary', soft: 'bg-primary-soft', text: 'text-primary', border: 'border-primary' },
    'بلاغة': { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
    'فقه': { bar: 'bg-success', soft: 'bg-success-soft', text: 'text-success', border: 'border-success' },
    'توحيد': { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
    'تفسير': { bar: 'bg-warning', soft: 'bg-warning-soft', text: 'text-warning', border: 'border-warning' },
    'نحو': { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
};

const FALLBACK_COLORS: SubjectColors[] = [
    { bar: 'bg-primary', soft: 'bg-primary-soft', text: 'text-primary', border: 'border-primary' },
    { bar: 'bg-success', soft: 'bg-success-soft', text: 'text-success', border: 'border-success' },
    { bar: 'bg-warning', soft: 'bg-warning-soft', text: 'text-warning', border: 'border-warning' },
    { bar: 'bg-info', soft: 'bg-info-soft', text: 'text-info', border: 'border-info' },
    { bar: 'bg-accent', soft: 'bg-accent-soft', text: 'text-accent', border: 'border-accent' },
    { bar: 'bg-error', soft: 'bg-error-soft', text: 'text-error', border: 'border-error' },
];

const getSubjectColor = (subject: string): SubjectColors => {
    const normalized = subject?.trim() || '';
    return SUBJECT_COLORS[normalized] || FALLBACK_COLORS[Math.abs(normalized.length) % FALLBACK_COLORS.length];
};

const EventCard = ({ event, onSelect, compact }: { event: ScheduleEvent; onSelect: () => void; compact?: boolean }) => {
    const c = getSubjectColor(event.subject);

    if (compact) {
        return (
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSelect}
                className={`relative rounded-lg cursor-pointer transition-all bg-card border border-border shadow-sm overflow-hidden hover:shadow-md hover:z-10`}
            >
                <div className="flex items-center gap-1.5 px-1.5 py-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.bar} shrink-0`} />
                    <span className="text-[8px] font-bold text-main truncate">{event.studentName}</span>
                    <span className={`text-[7px] font-bold ${c.text} shrink-0`}>{event.subject}</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelect}
            className={`relative rounded-lg cursor-pointer transition-all bg-card border border-border shadow-sm overflow-hidden hover:shadow-md hover:z-10 group`}
        >
            <div className={`absolute top-0 inset-x-0 h-1 ${c.bar} rounded-t-lg`} />
            <div className="p-1.5 pt-2">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${c.soft}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.bar}`} />
                        <span className={`text-[7px] font-bold ${c.text} leading-none`}>{event.subject}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted me-auto text-[7px] font-bold tabular-nums">
                        <Clock size={8} />
                        {event.time}
                    </span>
                </div>
                <p className="text-[10px] font-bold text-main leading-tight truncate">{event.studentName}</p>
                <p className="text-[8px] text-muted truncate mt-0.5 flex items-center gap-1">
                    <UserRound size={8} className="opacity-60" />
                    {event.teacherName || event.studentGrade}
                </p>
            </div>
        </motion.div>
    );
};

const CurrentTimeLine = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;
    const endMinutes = 22 * 60;
    const pct = Math.min(Math.max((totalMinutes - startMinutes) / (endMinutes - startMinutes), 0), 1);
    if (pct <= 0 || pct >= 1) return null;
    const nowLabel = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    return (
        <div className="absolute right-0 left-0 z-20 pointer-events-none" style={{ top: `${pct * 100}%` }}>
            <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-error shadow-[0_0_6px_rgba(239,68,68,0.6)] shrink-0" />
                <div className="h-px flex-1 bg-error" />
                <span className="text-[7px] font-bold text-error bg-card px-1 py-0.5 rounded-md shadow-sm ms-auto">{nowLabel}</span>
            </div>
        </div>
    );
};

interface ScheduleGridProps {
    filteredEvents: ScheduleEvent[];
    uniqueTeachers: string[];
    onSelectEvent: (event: ScheduleEvent) => void;
}

export const ScheduleGrid = ({ filteredEvents, uniqueTeachers, onSelectEvent }: ScheduleGridProps) => {
    const isToday = useCallback((day: string) => new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day, []);
    const getDayEvents = (events: ScheduleEvent[], day: string) => events.filter(e => e.day === day);

    return (
        <div className="bg-surface border border-border/40 overflow-hidden rounded-2xl mt-4 shadow-sm relative">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[1000px] relative">
                    {/* Sticky header row */}
                    <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-border/40 sticky top-0 z-30 bg-surface shadow-xs">
                        <div className="sticky start-0 z-10 p-3 text-[9px] font-bold text-muted border-e border-border/40 bg-surface" />
                        {DAYS_OF_WEEK.map((day, idx) => (
                            <div key={day}
                                className={`p-2.5 text-center border-e border-border/40 last:border-e-0 bg-surface ${isToday(day) ? 'bg-primary-soft' : ''}`}>
                                <div className="text-xs font-bold text-main">{day}</div>
                                <div className={`mt-1 flex items-center justify-center gap-1 ${isToday(day) ? 'text-primary' : ''}`}>
                                    {isToday(day) && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time slots */}
                    {TIME_SLOTS.map((slot, slotIdx) => {
                        const currentTimeSlots = filteredEvents.filter(e => e.hour === String(slot.hour) && e.period === slot.period);
                        return (
                            <div key={`${slot.hour}-${slot.period}`}
                                className={`grid grid-cols-[100px_repeat(7,1fr)] ${slotIdx % 2 === 0 ? 'bg-surface' : 'bg-background/20'}`}>
                                {/* Time label */}
                                <div className="sticky start-0 z-10 p-1.5 border-e border-border/40 border-b border-border/40 bg-surface flex flex-col items-center justify-center">
                                    <Clock size={10} className="text-muted" />
                                    <span className="text-[10px] font-bold text-muted tabular-nums mt-0.5">{slot.label}</span>
                                </div>

                                {/* Day cells */}
                                {DAYS_OF_WEEK.map((day) => {
                                    const dayEvents = getDayEvents(currentTimeSlots, day);
                                    const count = dayEvents.length;
                                    const showCompact = count > 2;

                                    return (
                                        <div key={`${day}-${slot.hour}`}
                                            className={`relative border-e border-border/40 last:border-e-0 border-b border-border/40 min-h-[80px] p-1 transition-colors
                                                ${isToday(day) ? 'bg-primary-soft' : ''}
                                                group`}>
                                            {count === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <div className="w-6 h-6 rounded-lg bg-primary-soft border border-dashed border-primary/30 flex items-center justify-center">
                                                        <Plus size={11} className="text-primary" />
                                                    </div>
                                                    <span className="text-[8px] text-muted mt-1">إضافة حصة</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 p-0.5 h-full">
                                                    {dayEvents.map((event, eIdx) => (
                                                        <EventCard
                                                            key={event.id}
                                                            event={event}
                                                            onSelect={() => onSelectEvent(event)}
                                                            compact={showCompact && eIdx >= 1}
                                                        />
                                                    ))}
                                                    {count > 3 && (
                                                        <div className="text-center">
                                                            <span className="text-[6px] font-bold text-primary bg-primary-soft px-1.5 py-0.5 rounded-full">
                                                                +{count - 1} أخرى
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Current time line */}
                    <CurrentTimeLine />
                </div>
            </div>

            {/* Legend */}
            <div className="border-t border-border/40 p-3 flex flex-wrap items-center gap-2 bg-background/30 no-print">
                <span className="text-[9px] font-bold text-muted ms-1">دليل المواد:</span>
                {Object.entries(SUBJECT_COLORS).slice(0, 8).map(([subject, colors]) => (
                    <div key={subject} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-card border border-border/30">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.bar}`} />
                        <span className="text-[7px] font-bold text-muted">{subject}</span>
                    </div>
                ))}
                {uniqueTeachers.length > 0 && (
                    <>
                        <span className="text-[9px] font-bold text-muted me-1 ms-2">|</span>
                        <span className="text-[7px] text-muted flex items-center gap-1">
                            <GraduationCap size={8} />
                            {uniqueTeachers.length} معلمة
                        </span>
                    </>
                )}
                <span className="text-[7px] text-muted me-auto">{filteredEvents.length} حصة</span>
            </div>
        </div>
    );
};
