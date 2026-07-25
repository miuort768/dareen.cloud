import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';
import { MobileSchedule } from '../components/MobileSchedule';
import { ScheduleHeader, ScheduleGrid, ScheduleDetailsModal } from './schedule-page';

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

export const Schedule = () => {
    useEffect(() => { document.title = 'الجدول الدراسي | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const todayDayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

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

    const handlePrint = () => window.print();

    const handleSelectEvent = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setShowDetails(true);
    };

    const handleStartLiveSession = async () => {
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
        } catch (e) {
            console.error(e);
            setShowDetails(false);
        }
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
                <ScheduleHeader
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterDay={filterDay} onDayChange={setFilterDay}
                    todayDayName={todayDayName} onPrint={handlePrint} />
                {currentUser?.role === 'admin' && <LiveClasses />}
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
            {showDetails && selectedEvent && (
                <ScheduleDetailsModal
                    event={selectedEvent}
                    onClose={() => setShowDetails(false)}
                    onStartLiveSession={handleStartLiveSession}
                    onViewStudent={() => navigate('/students')} />
            )}
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
