import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileSchedule } from '../components/MobileSchedule';
import { ScheduleHeader, ScheduleGrid, SchedulePopover } from './schedule-page';

interface Student { id: string; name: string; grade: string; parentPhone: string; enrollments: Enrollment[]; totalPoints?: number; }
interface Enrollment { teacher: string; subject: string; curr: string; sessionsTotal: number; sessionsUsed: number; schedule: ScheduleSlot[]; }
interface ScheduleSlot { day: string; hour: string; period: string; }
interface ScheduleEvent {
    id: string; studentId: string; studentName: string; studentGrade: string;
    teacherName: string; subject: string; curriculum: string; day: string;
    hour: string; period: string; time: string; studentPoints?: number;
}

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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
    const printRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const isTeacher = currentUser?.role === 'teacher';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<Record<string, unknown>[]>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) { console.error('Error fetching data', error); }
        finally { setLoading(false); }
    };

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-full gap-3">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            <div className="hidden md:block max-w-page mx-auto px-2">
                <ScheduleHeader
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterDay={filterDay} onDayChange={setFilterDay}
                    filterTeacher={filterTeacher} onTeacherChange={setFilterTeacher}
                    filterSubject={filterSubject} onSubjectChange={setFilterSubject}
                    uniqueTeachers={uniqueTeachers} uniqueSubjects={uniqueSubjects}
                    todayDayName={todayDayName} weekLabel={weekLabel}
                    onWeekChange={(d) => setCurrentWeekOffset(v => v + d)}
                    onPrint={handlePrint}
                    stats={weekStats}
                />

                {currentUser?.role === 'admin' && <LiveClasses />}

                {/* Next session banner */}
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

            <SchedulePopover
                event={selectedEvent}
                onClose={() => { setShowDetails(false); setSelectedEvent(null); }}
                onStartLiveSession={handleStartLiveSession}
                onViewStudent={() => navigate('/students')}
            />

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