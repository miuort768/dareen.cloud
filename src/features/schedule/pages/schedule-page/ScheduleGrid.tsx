import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';

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

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; lightBg: string; chip: string }> = {
    'رياضيات': { bg: 'bg-primary', border: 'border-primary', text: 'text-primary', lightBg: 'bg-primary/[7%]', chip: 'bg-primary/[12%]' },
    'علوم': { bg: 'bg-success', border: 'border-success', text: 'text-success', lightBg: 'bg-success/[7%]', chip: 'bg-success/[12%]' },
    'عربي': { bg: 'bg-warning', border: 'border-warning', text: 'text-warning', lightBg: 'bg-warning/[7%]', chip: 'bg-warning/[12%]' },
    'انجليزي': { bg: 'bg-info', border: 'border-info', text: 'text-info', lightBg: 'bg-info/[7%]', chip: 'bg-info/[12%]' },
    'دين': { bg: 'bg-accent', border: 'border-accent', text: 'text-accent', lightBg: 'bg-accent/[7%]', chip: 'bg-accent/[12%]' },
    'تاريخ': { bg: 'bg-error', border: 'border-error', text: 'text-error', lightBg: 'bg-error/[7%]', chip: 'bg-error/[12%]' },
    'قرآن': { bg: 'bg-accent', border: 'border-accent', text: 'text-accent', lightBg: 'bg-accent/[7%]', chip: 'bg-accent/[12%]' },
    'قواعد': { bg: 'bg-primary', border: 'border-primary', text: 'text-primary', lightBg: 'bg-primary/[7%]', chip: 'bg-primary/[12%]' },
    'بلاغة': { bg: 'bg-info', border: 'border-info', text: 'text-info', lightBg: 'bg-info/[7%]', chip: 'bg-info/[12%]' },
    'فقه': { bg: 'bg-success', border: 'border-success', text: 'text-success', lightBg: 'bg-success/[7%]', chip: 'bg-success/[12%]' },
    'توحيد': { bg: 'bg-accent', border: 'border-accent', text: 'text-accent', lightBg: 'bg-accent/[7%]', chip: 'bg-accent/[12%]' },
    'تفسير': { bg: 'bg-warning', border: 'border-warning', text: 'text-warning', lightBg: 'bg-warning/[7%]', chip: 'bg-warning/[12%]' },
    'نحو': { bg: 'bg-error', border: 'border-error', text: 'text-error', lightBg: 'bg-error/[7%]', chip: 'bg-error/[12%]' },
};

const FALLBACK_COLORS = [
    { bg: 'bg-primary', border: 'border-primary', text: 'text-primary', lightBg: 'bg-primary/[7%]', chip: 'bg-primary/[12%]' },
    { bg: 'bg-success', border: 'border-success', text: 'text-success', lightBg: 'bg-success/[7%]', chip: 'bg-success/[12%]' },
    { bg: 'bg-warning', border: 'border-warning', text: 'text-warning', lightBg: 'bg-warning/[7%]', chip: 'bg-warning/[12%]' },
    { bg: 'bg-info', border: 'border-info', text: 'text-info', lightBg: 'bg-info/[7%]', chip: 'bg-info/[12%]' },
    { bg: 'bg-accent', border: 'border-accent', text: 'text-accent', lightBg: 'bg-accent/[7%]', chip: 'bg-accent/[12%]' },
    { bg: 'bg-error', border: 'border-error', text: 'text-error', lightBg: 'bg-error/[7%]', chip: 'bg-error/[12%]' },
];

const getSubjectColor = (subject: string) => {
    const normalized = subject?.trim() || '';
    return SUBJECT_COLORS[normalized] || FALLBACK_COLORS[Math.abs(normalized.length) % FALLBACK_COLORS.length];
};

const EventCard = ({ event, onSelect }: { event: ScheduleEvent; onSelect: () => void }) => {
    const c = getSubjectColor(event.subject);
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelect}
            className={`relative rounded-lg cursor-pointer transition-all border ${c.border} ${c.lightBg} hover:shadow-md hover:z-10`}
        >
            <div className={`absolute top-0 start-0 w-full h-0.5 ${c.bg} rounded-t-lg`} />
            <div className="p-1.5 pt-2">
                <div className="flex items-center gap-1.5 mb-1">
                    <div className={`flex items-center gap-1 px-1 py-0.5 rounded ${c.chip}`}>
                        <div className={`w-1 h-1 rounded-full ${c.bg}`} />
                        <span className={`text-[7px] font-bold ${c.text} leading-none`}>{event.subject}</span>
                    </div>
                    <span className="text-[6px] text-muted me-auto">{event.time}</span>
                </div>
                <p className="text-[9px] font-bold text-main leading-tight truncate">{event.studentName}</p>
                <p className="text-[7px] text-muted truncate mt-0.5">{event.teacherName}</p>
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

const areEventsOverlapping = (events: ScheduleEvent[]) => events.length > 1;

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
                                className={`p-2.5 text-center border-e border-border/40 last:border-e-0 bg-surface ${isToday(day) ? 'bg-primary/[3%]' : ''}`}>
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
                                    const overlapping = areEventsOverlapping(dayEvents);
                                    const displayedEvents = overlapping ? dayEvents.slice(0, 2) : dayEvents;
                                    const extraCount = overlapping ? dayEvents.length - 2 : 0;

                                    return (
                                        <div key={`${day}-${slot.hour}`}
                                            className={`relative border-e border-border/40 last:border-e-0 border-b border-border/40 min-h-[80px] p-0.5 transition-colors
                                                ${isToday(day) ? 'bg-primary/[2%]' : ''}
                                                group`}>
                                            {/* Empty cell with + add button */}
                                            {dayEvents.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                                                        <Plus size={10} className="text-primary" />
                                                    </div>
                                                    <span className="text-[7px] text-muted mt-0.5">إضافة حصة</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-0.5 p-0.5 h-full">
                                                    {/* Cards */}
                                                    {displayedEvents.map(event => (
                                                        <EventCard key={event.id} event={event} onSelect={() => onSelectEvent(event)} />
                                                    ))}
                                                    {extraCount > 0 && (
                                                        <button onClick={() => onSelectEvent(dayEvents[0])}
                                                            className="w-full py-0.5 text-[7px] font-bold text-primary bg-primary/[6%] hover:bg-primary/[10%] rounded transition-colors">
                                                            +{extraCount} أخرى
                                                        </button>
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
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                        <span className="text-[7px] font-bold text-muted">{subject}</span>
                    </div>
                ))}
                {uniqueTeachers.length > 0 && (
                    <>
                        <span className="text-[9px] font-bold text-muted me-1 ms-2">|</span>
                        <span className="text-[7px] text-muted">{uniqueTeachers.length} معلمة</span>
                    </>
                )}
                <span className="text-[7px] text-muted me-auto">{filteredEvents.length} حصة</span>
            </div>
        </div>
    );
};