import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Clock, BookOpen, Plus, CalendarDays, GraduationCap, Users, Filter, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentUser, useLogout } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveSessions } from '../../dashboard/components/LiveSessions';
import { MobileSchedule } from '../components/MobileSchedule';
import { ScheduleHeader, ScheduleGrid, SchedulePopover } from './schedule-page';
import { TeacherDashboardHeader } from '../../../pages/TeacherDashboardHeader';
import { StudentDashboardHeader } from '../../../pages/student-dashboard/StudentDashboardHeader';
import { cn } from '../../../lib/utils';

interface Student { id: string; name: string; grade: string; parentPhone: string; enrollments: Enrollment[]; totalPoints?: number; }
interface Enrollment { teacher: string; subject: string; curr: string; sessionsTotal: number; sessionsUsed: number; schedule: ScheduleSlot[]; }
interface ScheduleSlot { day: string; hour: string; period: string; }
interface ScheduleEvent {
    id: string; studentId: string; studentName: string; studentGrade: string;
    teacherName: string; subject: string; curriculum: string; day: string;
    hour: string; period: string; time: string; studentPoints?: number;
}

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Schedule = () => {
    useEffect(() => { document.title = 'الجدول الدراسي | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState('all');
    const [filterSubject, setFilterSubject] = useState('all');
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fabOpen, setFabOpen] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const isTeacher = currentUser?.role === 'teacher';
    const isStudent = currentUser?.role === 'student';
    const logout = useLogout();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            if (isStudent) {
                const me = await api.get<Record<string, unknown>>('/student-portal/me');
                setStudents([me] as unknown as Student[]);
            } else {
                const data = await api.get<Record<string, unknown>[]>('/students');
                setStudents(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (error) { console.error('Error fetching data', error); }
        finally { setLoading(false); }
    }, [isStudent]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const weekLabel = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        const dayOfWeek = now.getDay();
        const diffToSat = dayOfWeek === 6 ? 0 : -(dayOfWeek + 1);
        start.setDate(now.getDate() + diffToSat + currentWeekOffset * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const options = { weekday: 'long', day: 'numeric', month: 'short' } as const;
        return `${start.toLocaleDateString('ar-EG', options)} — ${end.toLocaleDateString('ar-EG', options)}`;
    }, [currentWeekOffset]);

    const allEvents: ScheduleEvent[] = useMemo(() => {
        return students.flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => !isTeacher || (enrollment.teacher || '').trim() === teacherToMatch)
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
    }, [students, isTeacher, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allEvents.map(e => e.teacherName))).sort(), [allEvents]);
    const uniqueSubjects = useMemo(() => Array.from(new Set(allEvents.map(e => e.subject))).sort(), [allEvents]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesSearch = !searchTerm ||
                event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDay = filterDay === 'all' || event.day === filterDay;
            const matchesTeacher = filterTeacher === 'all' || event.teacherName === filterTeacher;
            const matchesSubject = filterSubject === 'all' || event.subject === filterSubject;
            return matchesSearch && matchesDay && matchesTeacher && matchesSubject;
        });
    }, [allEvents, searchTerm, filterDay, filterTeacher, filterSubject]);

    const weekStats = useMemo(() => ({
        sessions: filteredEvents.length,
        teachers: new Set(filteredEvents.map(e => e.teacherName)).size,
        students: new Set(filteredEvents.map(e => e.studentId)).size,
    }), [filteredEvents]);

    const nextSession = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        const todayEvents = filteredEvents.filter(e => e.day === today)
            .filter(e => parseInt(e.hour) >= currentHour)
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        if (todayEvents.length > 0) return todayEvents[0];
        const todayIdx = DAYS.indexOf(today);
        for (let i = 1; i <= 7; i++) {
            const nextDay = DAYS[(todayIdx + i) % 7];
            const nextEvents = filteredEvents.filter(e => e.day === nextDay).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
            if (nextEvents.length > 0) return nextEvents[0];
        }
        return null;
    }, [filteredEvents]);

    const handlePrint = () => window.print();
    const handleSelectEvent = (event: ScheduleEvent) => { setSelectedEvent(event); setShowDetails(true); };

    const handleStartLiveSession = async () => {
        if (!selectedEvent) return;
        const meetingUrl = prompt('أدخل رابط Google Meet أو Zoom:', 'https://meet.google.com/');
        if (!meetingUrl?.trim()) return;
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

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الحصص', value: weekStats.sessions, icon: BookOpen, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'المعلمات', value: weekStats.teachers, icon: GraduationCap, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'الطلاب', value: weekStats.students, icon: Users, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'الأيام', value: DAYS.length, icon: CalendarDays, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [weekStats]);

    const fabActions = useMemo(() => [
        { icon: CalendarDays, label: 'اليوم', onClick: () => setFilterDay(todayDayName) },
        { icon: Filter, label: 'كل الأيام', onClick: () => setFilterDay('all') },
        { icon: Printer, label: 'طباعة', onClick: handlePrint },
    ], [todayDayName]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-full gap-3">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            {isTeacher && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
            {isStudent && (
                <div className="hidden md:block">
                    <StudentDashboardHeader logout={logout} />
                </div>
            )}
            <div className="hidden md:block max-w-page mx-auto px-2">
                <div className="relative overflow-hidden rounded-2xl">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none z-10"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <ScheduleHeader searchTerm={searchTerm} onSearchChange={setSearchTerm}
                        filterDay={filterDay} onDayChange={setFilterDay} filterTeacher={filterTeacher}
                        onTeacherChange={setFilterTeacher} filterSubject={filterSubject} onSubjectChange={setFilterSubject}
                        uniqueTeachers={uniqueTeachers} uniqueSubjects={uniqueSubjects}
                        todayDayName={todayDayName} weekLabel={weekLabel}
                        onWeekChange={(d) => setCurrentWeekOffset(v => v + d)} onPrint={handlePrint} stats={weekStats} />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {currentUser?.role === 'admin' && <LiveSessions />}

                {nextSession && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
                        <div className="bg-card border border-border/60 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted">الحصة القادمة</p>
                                    <p className="text-xs font-bold text-main mt-0.5">{nextSession.subject} — {nextSession.studentName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Clock size={10} />
                                    <span className="text-[10px] font-bold">{nextSession.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted">
                                    <BookOpen size={10} />
                                    <span className="text-[10px] font-bold">{nextSession.teacherName}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={printRef} id="printable-schedule">
                    <ScheduleGrid filteredEvents={filteredEvents} uniqueTeachers={uniqueTeachers} onSelectEvent={handleSelectEvent} />
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-info" size={24} />
                    </div>
                )}
            </div>

            <div className="block md:hidden">
                <MobileSchedule />
            </div>

            <SchedulePopover event={selectedEvent} onClose={() => { setShowDetails(false); setSelectedEvent(null); }}
                onStartLiveSession={handleStartLiveSession} onViewStudent={() => navigate('/students')} />

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-white flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-schedule, #printable-schedule * { visibility: visible; }
                    #printable-schedule { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none !important; box-shadow: none !important; overflow: visible !important; }
                    #printable-schedule .no-print { display: none !important; }
                    #printable-schedule [class*="grid"] { transform: scale(0.65); transform-origin: top center; width: 153%; }
                    #printable-schedule [class*="grid"] > div { font-size: 9px !important; }
                    #printable-schedule [class*="min-h-["] { min-height: 40px !important; }
                    @page { size: landscape; margin: 1cm; }
                }
            `}</style>
        </div>
    );
};

export default Schedule;
