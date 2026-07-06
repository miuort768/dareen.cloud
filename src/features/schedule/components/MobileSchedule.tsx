import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CalendarDays, Video, User, BookOpen,
    X, Search, Loader2, Sparkles, MapPin
} from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { triggerHaptic } from '../../../lib/haptics';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';

interface Student {
    id: string;
    name: string;
    grade: string;
    enrollments: Enrollment[];
}

interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
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
    isPM: boolean;
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const TIME_SLOTS = [
    { hour: 8, period: 'am', label: '8:00 ص' },
    { hour: 9, period: 'am', label: '9:00 ص' },
    { hour: 10, period: 'am', label: '10:00 ص' },
    { hour: 11, period: 'am', label: '11:00 ص' },
    { hour: 12, period: 'pm', label: '12:00 م' },
    { hour: 1, period: 'pm', label: '1:00 م' },
    { hour: 2, period: 'pm', label: '2:00 م' },
    { hour: 3, period: 'pm', label: '3:00 م' },
    { hour: 4, period: 'pm', label: '4:00 م' },
    { hour: 5, period: 'pm', label: '5:00 م' },
    { hour: 6, period: 'pm', label: '6:00 م' },
    { hour: 7, period: 'pm', label: '7:00 م' },
    { hour: 8, period: 'pm', label: '8:00 م' },
    { hour: 9, period: 'pm', label: '9:00 م' },
    { hour: 10, period: 'pm', label: '10:00 م' },
];

const TEACHER_COLORS = [
    'var(--bg-primary)', 'var(--bg-success)', 'var(--bg-warning)', 'var(--bg-error)', 'var(--bg-success)', 'var(--bg-primary)', 'var(--bg-warning)'
];

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut' }
};

export const MobileSchedule = () => {
    const currentUser = useCurrentUser();
    const navigate = useNavigate();
    const mountedRef = useRef(true);

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const [selectedDay, setSelectedDay] = useState(todayName);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<Record<string, unknown>[]>('/students');
            if (mountedRef.current) {
                setStudents(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => { mountedRef.current = false; };
    }, []);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allEvents: ScheduleEvent[] = useMemo(() => {
        return students.flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const normalizedPeriod = (slot.period || '').trim().toLowerCase();
                        const isAM = ['am', 'صباحاً', 'صباحا', 'ص'].includes(normalizedPeriod);
                        return {
                            id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentId: student.id,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(),
                            subject: enrollment.subject,
                            curriculum: enrollment.curr,
                            day: (slot.day || '').trim(),
                            hour: String(parseInt(String(slot.hour).trim(), 10) || ''),
                            period: isAM ? 'am' : 'pm',
                            time: `${String(parseInt(String(slot.hour).trim(), 10) || '')}:00 ${isAM ? 'ص' : 'م'}`,
                            isPM: !isAM
                        };
                    })
                )
        );
    }, [students, currentUser, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allEvents.map(e => e.teacherName))), [allEvents]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesDay = event.day === selectedDay;
            const matchesSearch = !searchTerm ||
                event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.subject.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDay && matchesSearch;
        }).sort((a, b) => {
            const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0);
            const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0);
            return timeA - timeB;
        });
    }, [allEvents, selectedDay, searchTerm]);

    const getDayEventsAtTime = (events: ScheduleEvent[], hour: number, period: string) =>
        events.filter(e => Number(e.hour) === hour && e.period === period);

    const getTeacherColor = (teacherName: string) => {
        const idx = uniqueTeachers.indexOf(teacherName);
        return TEACHER_COLORS[Math.max(0, idx) % TEACHER_COLORS.length];
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };
    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true); setPullDistance(50); triggerHaptic('medium');
            try { await fetchData(); } catch (e) { console.error(e); }
            setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 800);
        } else { setPullDistance(0); setStartY(0); }
    };

    const totalToday = allEvents.filter(e => e.day === selectedDay).length;

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            dir="rtl"
            className="min-h-full pb-4 overflow-x-hidden relative bg-background dark:bg-background"
        >
            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-primary font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-dim">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Search */}
            <div className="px-4 pt-3 pb-1">
                <div className="relative">
                    <Search size={13} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن طالب أو معلمة أو مادة..."
                        className="w-full pe-8 ps-8 py-2.5 bg-white dark:bg-primary-active border border-border dark:border-border text-xs font-bold outline-none focus:border-primary rounded-2xl transition-all placeholder:text-muted dark:placeholder:text-muted text-main dark:text-on-primary shadow-sm"
                    />
                </div>
            </div>

            {/* Day Chips */}
            <div className="px-4 py-2 overflow-x-auto custom-scrollbar" dir="ltr">
                <div className="flex gap-1.5 min-w-max" dir="rtl">
                    {DAYS_OF_WEEK.map(day => {
                        const isActive = day === selectedDay;
                        const isToday = day === todayName;
                        return (
                            <motion.button
                                key={day}
                                whileTap={{ scale: 0.93 }}
                                onClick={() => { triggerHaptic('light'); setSelectedDay(day); setSearchTerm(''); }}
                                className={cn(
                                    "px-3.5 py-2 rounded-2xl text-micro font-bold whitespace-nowrap transition-all border",
                                    isActive
                                        ? "bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary border-primary shadow-sm shadow-primary/40"
                                        : "bg-white dark:bg-primary-active text-muted dark:text-muted border-border dark:border-border"
                                )}
                            >
                                {day}
                                {isToday && (
                                    <span className={cn(
                                        "ms-1.5 inline-block w-1.5 h-1.5 rounded-full",
                                        isActive ? "bg-white" : "bg-primary"
                                    )} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Stats row */}
            <motion.div {...fadeUp} className="px-4 pb-2">
                <div className="bg-white dark:bg-primary-active rounded-2xl p-3 shadow-sm border border-border/50 dark:border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-primary" strokeWidth={1.5} />
                        <span className="text-micro font-bold text-muted dark:text-muted">{selectedDay}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-primary tabular-nums">{totalToday}</span>
                        <span className="text-micro font-bold text-muted">حصة</span>
                    </div>
                </div>
            </motion.div>

            {/* Live Classes (admin only) */}
            {currentUser?.role === 'admin' && (
                <div className="px-4 pb-2">
                    <div className="bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 overflow-hidden">
                        <div className="p-3"><LiveClasses /></div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="px-4 space-y-1">
                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 size={24} className="animate-spin text-primary mx-auto" strokeWidth={1.5} />
                    </div>
                ) : filteredEvents.length > 0 ? (
                    TIME_SLOTS.map((slot, slotIdx) => {
                        const slotEvents = getDayEventsAtTime(filteredEvents, slot.hour, slot.period);
                        if (slotEvents.length === 0) return null;
                        return (
                            <motion.div
                                key={`${slot.hour}-${slot.period}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: slotIdx * 0.02, duration: 0.3 }}
                                className="flex gap-3"
                            >
                                {/* Time column */}
                                <div className="w-14 shrink-0 pt-1.5 text-center">
                                    <span className="text-micro font-bold text-muted dark:text-muted tabular-nums">{slot.label}</span>
                                </div>
                                {/* Events */}
                                <div className="flex-1 space-y-1.5 pb-2">
                                    {slotEvents.map(event => {
                                        const color = getTeacherColor(event.teacherName);
                                        return (
                                            <motion.div
                                                key={event.id}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => { triggerHaptic('light'); setSelectedEvent(event); setShowDetails(true); }}
                                                className="bg-white dark:bg-primary-active rounded-2xl p-3 shadow-sm border-r-[3px] cursor-pointer active:scale-[0.97] transition-all"
                                                style={{ borderRightColor: color }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-micro font-black text-on-primary"
                                                            style={{ backgroundColor: color }}>
                                                            {event.studentName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-main dark:text-on-primary leading-tight">{event.studentName}</p>
                                                            <p className="text-micro font-bold text-muted">{event.subject}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
                                                        {event.teacherName}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="py-16 text-center bg-white dark:bg-primary-active rounded-2xl border border-dashed border-border dark:border-border">
                        <CalendarDays size={28} className="mx-auto mb-2 text-dim dark:text-muted" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-muted dark:text-muted">لا توجد حصص في هذا اليوم</p>
                        <p className="text-micro font-medium text-dim dark:text-muted mt-1">اختر يوماً آخر من الأيام أعلاه</p>
                    </div>
                )}
            </div>

            {/* Slide-up Details Modal */}
            <AnimatePresence>
                {showDetails && selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end"
                        onClick={() => { triggerHaptic('light'); setShowDetails(false); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full bg-white dark:bg-primary-active rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh]"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-card dark:bg-primary-active rounded-full" />
                            </div>

                            <div className="px-5 pb-6 space-y-4">
                                <div className="text-center">
                                    <p className="text-micro font-bold text-muted">تفاصيل الحصة</p>
                                    <h3 className="text-sm font-black text-main dark:text-on-primary mt-0.5">{selectedEvent.day}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'rgba(108,75,255,0.03)', borderRight: '3px solid var(--bg-primary)' }}>
                                        <div>
                                            <span className="text-micro font-bold text-muted">الطالب</span>
                                            <p className="text-sm font-bold text-main dark:text-on-primary">{selectedEvent.studentName}</p>
                                            <span className="text-micro font-bold text-primary">{selectedEvent.studentGrade} · {selectedEvent.subject}</span>
                                        </div>
                                        <User size={18} className="text-dim" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'rgba(16,185,129,0.03)', borderRight: '3px solid var(--bg-success)' }}>
                                        <div>
                                            <span className="text-micro font-bold text-muted">المعلمة</span>
                                            <p className="text-sm font-bold text-main dark:text-on-primary">{selectedEvent.teacherName}</p>
                                        </div>
                                        <BookOpen size={18} className="text-dim" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'rgba(245,158,11,0.03)', borderRight: '3px solid var(--bg-warning)' }}>
                                        <div>
                                            <span className="text-micro font-bold text-muted">الوقت</span>
                                            <p className="text-sm font-bold text-main dark:text-on-primary">{selectedEvent.time}</p>
                                        </div>
                                        <Clock size={18} className="text-dim" strokeWidth={1.5} />
                                    </div>
                                </div>

                                <div className="flex gap-2.5">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={async () => {
                                            triggerHaptic('medium');
                                            try {
                                                const res = await startLiveSession({
                                                    title: `حصة مباشرة: ${selectedEvent.studentName}`,
                                                    subject: selectedEvent.subject,
                                                    meetingProvider: 'google_meet',
                                                    meetingUrl: 'https://meet.google.com/new',
                                                    targetStudentId: selectedEvent.studentId,
                                                });
                                                if (res?.meetingUrl) window.open(res.meetingUrl, '_blank');
                                            } catch { setShowDetails(false); }
                                        }}
                                        className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary text-micro font-bold flex items-center justify-center gap-2 shadow-sm shadow-primary/30"
                                    >
                                        <Video size={14} strokeWidth={1.5} />
                                        بدء بث مباشر
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { triggerHaptic('light'); navigate(`/students`); setShowDetails(false); }}
                                        className="flex-1 py-3 rounded-2xl bg-surface dark:bg-primary-active text-muted dark:text-dim text-micro font-bold border border-border dark:border-border"
                                    >
                                        عرض الطالب
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
