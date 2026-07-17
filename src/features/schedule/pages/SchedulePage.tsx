import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Search,
    Video,
    X,
    CalendarDays,
    Printer,
    Loader2
} from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileSchedule } from '../components/MobileSchedule';

interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    enrollments: Enrollment[];
    totalPoints?: number;
}

interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
    schedule: ScheduleSlot[];
}

interface ScheduleSlot {
    day: string;
    hour: string;
    period: string;
}

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
    { hour: 8,  period: 'am', label: '8 ص'  },
    { hour: 9,  period: 'am', label: '9 ص'  },
    { hour: 10, period: 'am', label: '10 ص' },
    { hour: 11, period: 'am', label: '11 ص' },
    { hour: 12, period: 'pm', label: '12 م' },
    { hour: 1,  period: 'pm', label: '1 م'  },
    { hour: 2,  period: 'pm', label: '2 م'  },
    { hour: 3,  period: 'pm', label: '3 م'  },
    { hour: 4,  period: 'pm', label: '4 م'  },
    { hour: 5,  period: 'pm', label: '5 م'  },
    { hour: 6,  period: 'pm', label: '6 م'  },
    { hour: 7,  period: 'pm', label: '7 م'  },
    { hour: 8,  period: 'pm', label: '8 م'  },
    { hour: 9,  period: 'pm', label: '9 م'  },
    { hour: 10, period: 'pm', label: '10 م' },
];

const ACCENT_COLORS = [
    { color: 'var(--bg-primary)', label: 'بنفسجي' },
    { color: 'var(--bg-success)', label: 'أخضر' },
    { color: 'var(--bg-warning)', label: 'عنبر' },
    { color: 'var(--bg-error)', label: 'وردي' },
    { color: 'var(--bg-success)', label: 'زيتي' },
    { color: 'var(--bg-primary)', label: 'بنفسجي فاتح' },
    { color: 'var(--bg-warning)', label: 'برتقالي' },
];

export const Schedule = () => {
    const currentUser = useCurrentUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    const isToday = (day: string) => new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
    const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

    const getDayEvents = (events: ScheduleEvent[], day: string) => events.filter(e => e.day === day);

    const getColorIndex = (event: ScheduleEvent) => Math.max(0, uniqueTeachers.indexOf(event.teacherName));

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<Record<string, unknown>[]>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allEvents: ScheduleEvent[] = useMemo(() => {
        return students.flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const normalizedPeriod = (slot.period || '').trim().toLowerCase();
                        const isAM = ['am', 'صباحاً', 'صباحا', 'ص'].includes(normalizedPeriod);
                        const sId = student.id;
                        return {
                            id: `${sId}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentId: sId,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(),
                            subject: enrollment.subject,
                            curriculum: enrollment.curr,
                            day: (slot.day || '').trim(),
                            hour: String(parseInt(String(slot.hour).trim(), 10) || ''),
                            period: isAM ? 'am' : 'pm',
                            time: `${String(parseInt(String(slot.hour).trim(), 10) || '')}:00 ${isAM ? 'ص' : 'م'}`,
                            studentPoints: student.totalPoints || 0
                        };
                    })
                )
        );
    }, [students, currentUser, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allEvents.map(e => e.teacherName))), [allEvents]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesSearch =
                event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDay = filterDay === 'all' || event.day === filterDay;
            return matchesSearch && matchesDay;
        });
    }, [allEvents, searchTerm, filterDay]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-full gap-3">
            <div className="w-8 h-8 border-2 border-border border-t-[var(--bg-primary)] rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            <div className="hidden md:block max-w-page mx-auto px-2">

                {/* Header */}
                <div className="shadow-sm px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 rounded-2xl bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)]">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                            <CalendarDays size={22} className="text-on-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-on-primary leading-tight">الجداول الدراسية</h1>
                            <p className="text-xs font-bold text-on-primary/70 mt-0.5">جدول الحصص الأسبوعي</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary/50" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-28 sm:w-36 h-9 bg-white/15 border border-white/20 text-on-primary placeholder:text-on-primary/50 text-micro font-bold rounded-xl px-8 outline-none focus:border-white/50 transition-all"
                            />
                        </div>

                        {/* Today Filter */}
                        <button
                            onClick={() => setFilterDay(prev => prev === todayDayName ? 'all' : todayDayName)}
                            className={cn(
                                "h-9 px-2.5 text-micro font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 border",
                                filterDay === todayDayName
                                    ? "bg-white/25 border-white/30 text-on-primary"
                                    : "bg-white/15 border-white/20 text-on-primary/70 hover:bg-white/25 hover:text-on-primary"
                            )}
                        >
                            <Clock size={12} />
                            <span className="hidden sm:inline">اليوم</span>
                        </button>

                        {/* Day Filter */}
                        <select
                            value={filterDay}
                            onChange={e => setFilterDay(e.target.value)}
                            className="h-9 px-2.5 bg-white/15 border border-white/20 text-on-primary text-micro font-bold rounded-xl outline-none focus:border-white/50 transition-all"
                        >
                            <option value="all" className="text-main">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day} value={day} className="text-main">{day}</option>
                            ))}
                        </select>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="h-9 px-4 bg-white/15 border border-white/20 text-on-primary text-micro font-bold rounded-xl shadow-sm hover:bg-white/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Printer size={13} />
                            طباعة
                        </button>
                    </div>
                </div>

                {/* Live Classes — only for system admin */}
                {currentUser?.role === 'admin' && <LiveClasses />}

                {/* Schedule Grid */}
                <div ref={printRef} id="printable-schedule" className="bg-white dark:bg-primary-active border border-border/50 dark:border-border/50 shadow-sm overflow-hidden rounded-2xl mt-4">
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[900px]">
                            {/* Grid Header: Days */}
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border">
                                <div className="sticky start-0 z-10 p-3 text-micro font-bold text-inverse border-e border-border bg-primary-active dark:bg-background">
                                    الوقت
                                </div>
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day} className={cn(
                                        "p-3 text-micro font-bold text-center border-e border-border last:border-e-0 bg-primary-active dark:bg-background",
                                        isToday(day) ? "text-on-primary" : "text-inverse"
                                    )}>
                                        <span>{day}</span>
                                        {isToday(day) && (
                                            <span className="ms-1.5 w-1.5 h-1.5 rounded-full inline-block animate-pulse bg-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body: Time Slots */}
                            {TIME_SLOTS.map((slot, slotIdx) => {
                                const currentTimeSlots = filteredEvents.filter(e => e.hour === String(slot.hour) && e.period === slot.period);
                                const isEmpty = currentTimeSlots.length === 0;

                                return (
                                    <div key={`${slot.hour}-${slot.period}`} className={cn(
                                        "grid grid-cols-[80px_repeat(7,1fr)]",
                                        slotIdx % 2 === 0 ? "bg-white dark:bg-primary-active" : "bg-background/30 dark:bg-background/20"
                                    )}>
                                        <div className="sticky start-0 z-10 p-2 text-micro font-bold text-muted border-e border-b border-border/50 dark:border-border/50 flex items-center justify-center h-full bg-inherit">
                                            <Clock size={10} className="me-1 inline" />
                                            {slot.label}
                                        </div>

                                        {DAYS_OF_WEEK.map((day) => {
                                            const dayEvents = getDayEvents(currentTimeSlots, day);
                                            const event = dayEvents[0];

                                            if (event) {
                                                const colorIdx = getColorIndex(event);
                                                const accent = ACCENT_COLORS[colorIdx % ACCENT_COLORS.length];
                                                const { color } = accent;

                                                return (
                                                    <div
                                                        key={`${day}-${slot.hour}`}
                                                        onClick={() => { setSelectedEvent(event); setShowDetails(true); }}
                                                        className="p-1.5 border-e last:border-e-0 border-b border-border/50 dark:border-border/50 cursor-pointer transition-all hover:z-10 hover:shadow-sm hover:-translate-y-0.5 relative group min-h-[72px]"
                                                        style={{ backgroundColor: `${color}08` }}
                                                    >
                                                        <div className="absolute top-0 start-0 w-full h-0.5" style={{ backgroundColor: color }} />

                                                        <div className="flex items-start gap-1.5 h-full">
                                                            <div className="w-1 h-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-micro font-bold leading-tight mb-0.5 truncate" style={{ color }}>
                                                                    {event.studentName}
                                                                </p>
                                                                <p className="text-micro font-bold text-muted truncate">{event.subject}</p>
                                                                <p className="text-micro font-bold text-muted truncate">{event.teacherName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={`${day}-${slot.hour}`}
                                                    className="p-2 border-e last:border-e-0 border-b border-border/50 dark:border-border/50 min-h-[72px]"
                                                >
                                                    {!isEmpty && (
                                                        <div className="text-micro font-bold text-dim text-center">—</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="border-t border-border/50 dark:border-border/50 p-4 flex flex-wrap items-center gap-4 bg-background/50 dark:bg-background/20 no-print">
                        <span className="text-micro font-bold text-muted">دليل الألوان:</span>
                        {uniqueTeachers.map((teacher, idx) => {
                            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                            return (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2" style={{ backgroundColor: accent.color }} />
                                    <span className="text-micro font-bold text-muted">{teacher}</span>
                                </div>
                            );
                        })}
                        <span className="text-micro font-bold text-muted ms-auto">
                            {filteredEvents.length} حصة
                        </span>
                    </div>
                </div>

                {/* Loading or Empty State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-info" size={24} />
                    </div>
                )}
            </div>

            <div className="block md:hidden">
                <MobileSchedule />
            </div>

            {/* Event Details Modal */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
                    <div className="bg-white dark:bg-primary-active w-full max-w-sm shadow-sm border border-border dark:border-border overflow-hidden rounded-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 text-on-primary flex items-center justify-between bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)]">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <CalendarDays size={16} />
                                تفاصيل الحصة
                            </h3>
                            <button onClick={() => setShowDetails(false)} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-colors rounded-xl">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <span className="text-micro font-bold text-muted block mb-1">الطالب</span>
                                <p className="font-bold text-sm text-main dark:text-on-primary">{selectedEvent.studentName}</p>
                            </div>
                            <div>
                                <span className="text-micro font-bold text-muted block mb-1">المعلمة</span>
                                <p className="font-bold text-sm text-main dark:text-on-primary">{selectedEvent.teacherName}</p>
                            </div>
                            <div>
                                <span className="text-micro font-bold text-muted block mb-1">المادة</span>
                                <p className="font-bold text-sm text-main dark:text-on-primary">{selectedEvent.subject}</p>
                            </div>
                            <div>
                                <span className="text-micro font-bold text-muted block mb-1">الموعد</span>
                                <p className="font-bold text-sm text-main dark:text-on-primary">{selectedEvent.day} - {selectedEvent.time}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 p-5 pt-0">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await startLiveSession({
                                            title: `حصة مباشرة: ${selectedEvent.studentName}`,
                                            subject: selectedEvent.subject,
                                            meetingProvider: 'google_meet',
                                            meetingUrl: 'https://meet.google.com/new',
                                            targetStudentId: selectedEvent.studentId,
                                        });
                                        if (res?.meetingUrl) window.open(res.meetingUrl, '_blank');
                                    } catch (e) { console.error(e); setShowDetails(false); }
                                }}
                                className="flex-1 h-10 text-on-primary text-micro font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] hover:from-[var(--bg-primary-hover)] hover:to-[var(--bg-primary)]"
                            >
                                <Video size={14} />
                                بدء بث مباشر
                            </button>
                            <button
                                onClick={() => navigate(`/students`)}
                                className="flex-1 h-10 bg-white dark:bg-primary-active text-main dark:text-on-primary text-micro font-bold border border-border dark:border-border shadow-sm hover:bg-surface transition-all active:scale-95 rounded-xl"
                            >
                                عرض الطالب
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print styles injected inline */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-schedule,
                    #printable-schedule * {
                        visibility: visible;
                    }
                    #printable-schedule {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        border: none !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                    }
                    #printable-schedule .no-print {
                        display: none !important;
                    }
                    #printable-schedule [class*="grid"] {
                        transform: scale(0.65);
                        transform-origin: top center;
                        width: 153%;
                    }
                    #printable-schedule [class*="grid"] > div {
                        font-size: 9px !important;
                    }
                    #printable-schedule [class*="min-h-["] {
                        min-height: 40px !important;
                    }
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
};
export default Schedule;
