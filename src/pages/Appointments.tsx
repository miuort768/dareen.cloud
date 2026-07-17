import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '../context/AppContext';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';
import { MobileAppointments } from '../features/appointments/components/MobileAppointments';
import { AppointmentsHeader, AppointmentsFilters, DAYS_OF_WEEK, AppointmentScheduleGrid, AppointmentDetailPanel } from './appointments-page';

interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    enrollments: Enrollment[];
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

interface AppointmentEvent {
    id: string;
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

export const Appointments = () => {
    const currentUser = useCurrentUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const checkAndReset = async () => {
            try {
                if (currentUser?.role === 'admin') {
                    const settings = await api.get<Record<string, unknown>>('/system/settings');
                    if (!mountedRef.current) return;
                    const lastResetDate = settings?.last_appointment_reset;
                    const todayStr = new Date().toDateString();
                    if (lastResetDate !== todayStr) {
                        await api.delete('/appointments/completed-sessions/reset');
                        if (!mountedRef.current) return;
                        setCompletedSessionIds([]);
                        await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                    } else {
                        const sessions = await api.get<string[]>('/appointments/completed-sessions');
                        if (!mountedRef.current) return;
                        setCompletedSessionIds(sessions || []);
                    }
                } else {
                    const sessions = await api.get<string[]>('/appointments/completed-sessions');
                    if (!mountedRef.current) return;
                    setCompletedSessionIds(sessions || []);
                }
            } catch (error) {
                console.error("Error managing appointment reset:", error);
            }
        };
        checkAndReset();
        return () => { mountedRef.current = false; };
    }, [currentUser]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const sessions = await api.get<string[]>('/appointments/completed-sessions');
                if (mountedRef.current) setCompletedSessionIds(sessions || []);
            } catch (e) {
                console.warn(e);
            }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/appointments/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
            alert('عذراً، حدث خطأ في تسجيل إتمام الحصة. يرجى المحاولة مرة أخرى.');
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        const fetchData = async () => {
            if (!mountedRef.current) return;
            setLoading(true);
            try {
                const data = await api.get<Record<string, unknown>[]>('/students');
                if (!mountedRef.current) return;
                setStudents(Array.isArray(data) ? data : (data.data || []));
            } catch (error) {
                console.error("Error fetching data", error);
                if (mountedRef.current) setError('حدث خطأ في تحميل البيانات');
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };
        fetchData();
        return () => { mountedRef.current = false; };
    }, []);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const allAppointments: AppointmentEvent[] = (students || []).flatMap(student =>
        (student.enrollments || [])
            .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch || enrollment.teacherId === currentUser.id)
            .flatMap(enrollment =>
                (enrollment.schedule || []).map(slot => {
                    const normalizedPeriod = (slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص') ? 'ص' : 'م';
                    const isPM = !(slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص');
                    const normHour = String(parseInt(String(slot.hour).trim(), 10) || '');
                    return {
                        id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                        studentName: student.name,
                        studentGrade: student.grade,
                        teacherName: (enrollment.teacher || '').trim(),
                        subject: enrollment.subject,
                        curriculum: enrollment.curr,
                        day: (slot.day || '').trim(),
                        hour: normHour,
                        period: slot.period,
                        time: `${normHour} ${normalizedPeriod}`,
                        isPM
                    };
                })
            )
    );

    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    const filteredAppointments = allAppointments.filter(appointment => {
        const isCompleted = completedSessionIds.includes(appointment.id);
        if (isCompleted) return false;
        const matchesSearch =
            appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDay = filterDay === 'all' || appointment.day === filterDay;
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher;
        return matchesSearch && matchesDay && matchesTeacher;
    });

    const appointmentsByDay = DAYS_OF_WEEK.map(day => ({
        day,
        appointments: filteredAppointments
            .filter(a => a.day === day)
            .sort((a, b) => {
                const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0);
                const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0);
                return timeA - timeB;
            })
    })).filter(dayObj => filterDay === 'all' || dayObj.day === filterDay);

    const totalAppointments = allAppointments.length;
    const todayAppointments = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today;
    }).length;

    const remainingToday = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today && !completedSessionIds.includes(a.id);
    }).length;

    const hasActiveFilters = searchTerm || filterDay !== 'all' || filterTeacher !== 'all';

    const handleSelectAppointment = (appointment: AppointmentEvent) => {
        setSelectedAppointment(appointment);
        setShowDetails(true);
    };

    const handleCloseDetails = () => setShowDetails(false);

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterDay('all');
        setFilterTeacher('all');
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="min-h-full pb-24 relative" dir="rtl">
                <div className="hidden md:block max-w-page mx-auto px-2">
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-card text-sm font-medium mt-6 md:mt-10">
                        عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            <div className="hidden md:block max-w-page mx-auto px-2">
                <AppointmentsHeader todayAppointments={todayAppointments} remainingToday={remainingToday} totalAppointments={totalAppointments} />
                <AppointmentsFilters
                    searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterDay={filterDay} onDayChange={setFilterDay}
                    filterTeacher={filterTeacher} onTeacherChange={setFilterTeacher}
                    uniqueTeachers={uniqueTeachers}
                    hasActiveFilters={hasActiveFilters} onReset={handleResetFilters} />
                <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    <div className={showDetails ? 'lg:col-span-2' : ''}>
                        <AppointmentScheduleGrid appointmentsByDay={appointmentsByDay} onSelectAppointment={handleSelectAppointment} onCompleteSession={handleCompleteSession} />
                    </div>
                    <AppointmentDetailPanel appointment={selectedAppointment} showDetails={showDetails} onClose={handleCloseDetails} />
                </div>
            </div>
            <div className="block md:hidden">
                <MobileAppointments />
            </div>
        </div>
    );
};
