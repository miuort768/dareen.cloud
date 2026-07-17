import { useState, useEffect, useMemo, useRef } from 'react';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { triggerHaptic } from '../../../lib/haptics';
import type { Student, AppointmentEvent } from './mobile-appointments/types';
import { DAYS_OF_WEEK } from './mobile-appointments/types';
import { AppointmentPullToRefresh, AppointmentStats, AppointmentTabs, AppointmentFilters, AppointmentListView, AppointmentDetailsModal } from './mobile-appointments';

export const MobileAppointments = () => {
    const currentUser = useCurrentUser();
    const mountedRef = useRef(true);

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    useEffect(() => {
        mountedRef.current = true;
        const checkAndReset = async () => {
            try {
                if (currentUser?.role === 'admin') {
                    const settings = await api.get<Record<string, unknown>>('/system/settings');
                    if (!mountedRef.current) return;
                    const lastResetDate = settings?.last_appointment_reset as string;
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
            } catch (e) { console.warn(e); }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        try {
            const data = await api.get<Record<string, unknown>[]>('/students');
            if (!mountedRef.current) return;
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => { mountedRef.current = false; };
    }, []);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allAppointments: AppointmentEvent[] = useMemo(() =>
        (students || []).flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const isPM = !(slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص');
                        const normalizedPeriod = isPM ? 'م' : 'ص';
                        const normHour = String(parseInt(String(slot.hour).trim(), 10) || '');
                        return {
                            id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentName: student.name, studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(), subject: enrollment.subject,
                            curriculum: enrollment.curr, day: (slot.day || '').trim(),
                            hour: normHour, period: slot.period,
                            time: `${normHour} ${normalizedPeriod}`, isPM
                        };
                    })
                )
        ), [students, currentUser, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allAppointments.map(a => a.teacherName))), [allAppointments]);
    const upcomingAppointments = useMemo(() => allAppointments.filter(a => !completedSessionIds.includes(a.id)), [allAppointments, completedSessionIds]);
    const completedAppointments = useMemo(() => allAppointments.filter(a => completedSessionIds.includes(a.id)), [allAppointments, completedSessionIds]);

    const filteredAppointments = useMemo(() => {
        const source = activeTab === 'upcoming' ? upcomingAppointments : completedAppointments;
        return source.filter(a => {
            const matchesSearch = !searchTerm ||
                a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDay = filterDay === 'all' || a.day === filterDay;
            const matchesTeacher = filterTeacher === 'all' || a.teacherName === filterTeacher;
            return matchesSearch && matchesDay && matchesTeacher;
        });
    }, [activeTab, upcomingAppointments, completedAppointments, searchTerm, filterDay, filterTeacher]);

    const appointmentsByDay = useMemo(() =>
        DAYS_OF_WEEK.map(day => ({
            day,
            appointments: filteredAppointments.filter(a => a.day === day)
                .sort((a, b) => (Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0)) - (Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0)))
        })).filter(dayObj => filterDay === 'all' || dayObj.day === filterDay), [filteredAppointments, filterDay]);

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic('medium');
        try {
            await api.post('/appointments/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
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

    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const todayCount = upcomingAppointments.filter(a => a.day === todayName).length;
    const totalCount = allAppointments.length;
    const completedCount = completedAppointments.length;

    return (
        <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            dir="rtl" className="min-h-full pb-4 overflow-x-hidden relative bg-background">

            <AppointmentPullToRefresh pullDistance={pullDistance} isRefreshing={isRefreshing} />
            <AppointmentStats todayCount={todayCount} totalCount={totalCount} completedCount={completedCount} />
            <AppointmentTabs activeTab={activeTab} onTabChange={setActiveTab} totalCount={totalCount}
                completedCount={completedCount} setSearchTerm={setSearchTerm} />
            <AppointmentFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} filterDay={filterDay}
                onDayChange={setFilterDay} filterTeacher={filterTeacher} onTeacherChange={setFilterTeacher}
                uniqueTeachers={uniqueTeachers} />
            <AppointmentListView activeTab={activeTab} appointmentsByDay={appointmentsByDay}
                onComplete={handleCompleteSession}
                onSelect={(app) => { triggerHaptic('light'); setSelectedAppointment(app); setShowDetails(true); }} />
            <AppointmentDetailsModal show={showDetails} appointment={selectedAppointment} activeTab={activeTab}
                onClose={() => { triggerHaptic('light'); setShowDetails(false); }}
                onComplete={handleCompleteSession} />
        </div>
    );
};
