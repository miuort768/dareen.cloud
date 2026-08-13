import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Search, Loader2, Sparkles } from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { triggerHaptic } from '../../../lib/haptics';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveSessions } from '../../dashboard/components/LiveSessions';
import { MobilePage, usePullToRefresh, MobileSkeleton } from '../../../shared/components/mobile';
import { MobileScheduleDayChips, MobileScheduleDetailsSheet } from './mobile-schedule';

interface Student { id: string; name: string; grade: string; enrollments: Enrollment[]; }
interface Enrollment { teacher: string; subject: string; curr: string; schedule: ScheduleSlot[]; teacherId?: string | number; }
interface ScheduleSlot { day: string; hour: string; period: string; }
interface ScheduleEvent {
    id: string; studentId: string; studentName: string; studentGrade: string;
    teacherName: string; subject: string; curriculum: string; day: string;
    hour: string; period: string; time: string; isPM: boolean;
}

const TIME_SLOTS = [
    { hour: 8, period: 'am', label: '8:00 ص' }, { hour: 9, period: 'am', label: '9:00 ص' },
    { hour: 10, period: 'am', label: '10:00 ص' }, { hour: 11, period: 'am', label: '11:00 ص' },
    { hour: 12, period: 'pm', label: '12:00 م' }, { hour: 1, period: 'pm', label: '1:00 م' },
    { hour: 2, period: 'pm', label: '2:00 م' }, { hour: 3, period: 'pm', label: '3:00 م' },
    { hour: 4, period: 'pm', label: '4:00 م' }, { hour: 5, period: 'pm', label: '5:00 م' },
    { hour: 6, period: 'pm', label: '6:00 م' }, { hour: 7, period: 'pm', label: '7:00 م' },
    { hour: 8, period: 'pm', label: '8:00 م' }, { hour: 9, period: 'pm', label: '9:00 م' },
    { hour: 10, period: 'pm', label: '10:00 م' },
];

const TEACHER_STYLES = [
    { text: 'text-primary', bg: 'bg-primary', bgLight: 'bg-primary/10', border: 'border-e-primary' },
    { text: 'text-success', bg: 'bg-success', bgLight: 'bg-success/10', border: 'border-e-success' },
    { text: 'text-warning', bg: 'bg-warning', bgLight: 'bg-warning/10', border: 'border-e-warning' },
    { text: 'text-error', bg: 'bg-error', bgLight: 'bg-error/10', border: 'border-e-error' },
    { text: 'text-success', bg: 'bg-success', bgLight: 'bg-success/10', border: 'border-e-success' },
    { text: 'text-primary', bg: 'bg-primary', bgLight: 'bg-primary/10', border: 'border-e-primary' },
    { text: 'text-warning', bg: 'bg-warning', bgLight: 'bg-warning/10', border: 'border-e-warning' },
];

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut' as const } };

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

    const isStudent = currentUser?.role === 'student';

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            if (isStudent) {
                const me = await api.get<unknown>('/student-portal/me');
                if (mountedRef.current) setStudents([me] as unknown as Student[]);
            } else {
                const raw = await api.get<unknown>('/students');
                if (mountedRef.current) setStudents(Array.isArray(raw) ? (raw as Student[]) : ((raw as { data?: Student[] } | null)?.data || []));
            }
        } catch (error) { console.error('Error fetching data', error); }
        finally { if (mountedRef.current) setLoading(false); }
    }, [isStudent]);

    const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh: fetchData });

    useEffect(() => { fetchData(); return () => { mountedRef.current = false; }; }, [fetchData]);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const allEvents: ScheduleEvent[] = useMemo(() => {
        return students.flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch || enrollment.teacherId === currentUser.id)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const normalizedPeriod = (slot.period || '').trim().toLowerCase();
                        const isAM = ['am', 'صباحاً', 'صباحا', 'ص', 'am.', 'a.m', 'a.m.'].includes(normalizedPeriod) || normalizedPeriod.startsWith('صباح');
                        return {
                            id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentId: student.id, studentName: student.name, studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(), subject: enrollment.subject,
                            curriculum: enrollment.curr, day: (slot.day || '').trim(),
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
    const getTeacherStyle = (teacherName: string) => {
        const idx = uniqueTeachers.indexOf(teacherName);
        return TEACHER_STYLES[Math.max(0, idx) % TEACHER_STYLES.length]!;
    };

    const totalToday = allEvents.filter(e => e.day === selectedDay).length;

    const handleStartSession = async () => {
        if (!selectedEvent) return;
        const meetingUrl = prompt('أدخل رابط Google Meet أو Zoom:', 'https://meet.google.com/');
        if (!meetingUrl || !meetingUrl.trim()) return;
        try {
            const res = await startLiveSession({
                title: `حصة مباشرة: ${selectedEvent.studentName}`,
                subject: selectedEvent.subject,
                meetingProvider: meetingUrl.includes('zoom.us') ? 'zoom' : 'google_meet',
                meetingUrl: meetingUrl.trim(),
                targetStudentId: selectedEvent.studentId,
            });
            if (res?.meetingUrl) window.open(res.meetingUrl, '_blank');
        } catch (e) { console.error(e); setShowDetails(false); }
    };

    return (
        <MobilePage>
            <div {...handlers}>
            <motion.div initial={{ height: pullDistance }} animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full">
                <div className="flex items-center gap-2.5 text-primary font-medium text-xs">
                    {isRefreshing ? <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                        : pullDistance > 55 ? <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                            : <span className="text-muted">اسحب للتحديث</span>}
                </div>
            </motion.div>
            <div className="px-4 pt-3 pb-1">
                <div className="relative">
                    <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" aria-label="بحث" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن طالب أو معلمة أو مادة..."
                        className="w-full ps-8 pe-8 py-2.5 bg-card border border-border text-xs font-bold outline-none focus:border-primary rounded-2xl transition-all placeholder:text-muted text-main" />
                </div>
            </div>
            <MobileScheduleDayChips selectedDay={selectedDay} onDayChange={(day) => { triggerHaptic('light'); setSelectedDay(day); setSearchTerm(''); }} todayName={todayName} />
            <motion.div {...fadeUp} className="px-4 pb-2">
                <div className="bg-card rounded-2xl p-3 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-primary" strokeWidth={1.5} />
                        <span className="text-micro font-bold text-muted">{selectedDay}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-primary tabular-nums">{totalToday}</span>
                        <span className="text-micro font-bold text-muted">حصة</span>
                    </div>
                </div>
            </motion.div>
            {currentUser?.role === 'admin' && (
                <div className="px-4 pb-2">
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-3"><LiveSessions /></div>
                    </div>
                </div>
            )}
            <div className="px-4 space-y-1">
                {loading && students.length === 0 ? (
                    <MobileSkeleton rows={5} />
                ) : filteredEvents.length > 0 ? (
                    TIME_SLOTS.map((slot, slotIdx) => {
                        const slotEvents = getDayEventsAtTime(filteredEvents, slot.hour, slot.period);
                        if (slotEvents.length === 0) return null;
                        return (
                            <motion.div key={`${slot.hour}-${slot.period}`}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: slotIdx * 0.02, duration: 0.3 }}
                                className="flex gap-3">
                                <div className="w-14 shrink-0 pt-1.5 text-center">
                                    <span className="text-micro font-bold text-muted tabular-nums">{slot.label}</span>
                                </div>
                                <div className="flex-1 space-y-1.5 pb-2">
                                    {slotEvents.map(event => {
                                        const ts = getTeacherStyle(event.teacherName);
                                        return (
                                            <motion.div key={event.id} whileTap={{ scale: 0.97 }}
                                                onClick={() => { triggerHaptic('light'); setSelectedEvent(event); setShowDetails(true); }}
                                                className={`bg-card rounded-2xl p-3 border-e-[3px] cursor-pointer active:scale-[0.97] transition-all ${ts.border}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-micro font-semibold text-on-primary ${ts.bg}`}>
                                                            {event.studentName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-main leading-tight">{event.studentName}</p>
                                                            <p className="text-micro font-bold text-muted">{event.subject}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-micro font-bold px-1.5 py-0.5 rounded-lg ${ts.bgLight} ${ts.text}`}>{event.teacherName}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border">
                        <CalendarDays size={28} className="mx-auto mb-2 text-muted" strokeWidth={1.5} />
                        <p className="text-xs font-bold text-muted">لا توجد حصص في هذا اليوم</p>
                        <p className="text-micro font-medium text-muted mt-1">اختر يوماً آخر من الأيام أعلاه</p>
                    </div>
                )}
            </div>
            <MobileScheduleDetailsSheet showDetails={showDetails} event={selectedEvent}
                onClose={() => setShowDetails(false)} onStartSession={handleStartSession}
                onViewStudent={() => { triggerHaptic('light'); navigate('/students'); setShowDetails(false); }} />
            </div>
        </MobilePage>
    );
};
