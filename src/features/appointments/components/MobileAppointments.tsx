import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { triggerHaptic } from '../../../lib/haptics';
import { MobilePage, usePullToRefresh, MobileSkeleton } from '../../../shared/components/mobile';
import type { Student, AppointmentEvent } from './mobile-appointments/types';
import { DAYS_OF_WEEK } from './mobile-appointments/types';
import { normalizeDayName } from '../../attendance/utils/slotUtils';
import { AppointmentPullToRefresh, AppointmentStats, AppointmentTabs, AppointmentFilters, AppointmentListView, AppointmentDetailsSheet } from './mobile-appointments';

export const MobileAppointments = () => {
    const currentUser = useCurrentUser();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

    const { data: students = [], isLoading: loading } = useQuery<Student[]>({
        queryKey: ['appointments-students'],
        queryFn: async () => {
            if (currentUser?.role === 'student') {
                const me = await api.get<unknown>('/student-portal/me');
                return [me] as Student[];
            }
            const raw = await api.get<unknown>('/students');
            return Array.isArray(raw) ? (raw as Student[]) : ((raw as { data?: Student[] } | null)?.data || []);
        },
    });

    const { data: completedSessionIds = [] } = useQuery<string[]>({
        queryKey: ['completed-sessions'],
        queryFn: async () => {
            if (currentUser?.role === 'admin') {
                const settings = await api.get<Record<string, unknown>>('/system/settings');
                const lastResetDate = settings?.last_appointment_reset as string;
                const todayStr = new Date().toDateString();
                if (lastResetDate !== todayStr) {
                    await api.delete('/appointments/completed-sessions/reset');
                    await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                    return [];
                }
            }
            const sessions = await api.get<string[]>('/appointments/completed-sessions');
            return sessions || [];
        },
        refetchInterval: 15000,
        enabled: currentUser?.role === 'admin' || currentUser?.role === 'teacher',
    });

    const completeMutation = useMutation({
        mutationFn: (id: string) => api.post('/appointments/completed-sessions', { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
    });

    const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
        onRefresh: () => queryClient.invalidateQueries({ queryKey: ['appointments-students'] }),
    });

    const canComplete = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allAppointments: AppointmentEvent[] = useMemo(() =>
        (students || []).flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch || enrollment.teacherId === currentUser.id)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const isPM = !(slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص');
                        const normalizedPeriod = isPM ? 'م' : 'ص';
                        const normHour = String(parseInt(String(slot.hour).trim(), 10) || '');
                        return {
                            id: `${student.id}-${enrollment.teacher}-${normalizeDayName(slot.day)}-${slot.hour}-${slot.period}`,
                            studentName: student.name, studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(), subject: enrollment.subject,
                            curriculum: enrollment.curr, day: normalizeDayName(slot.day),
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

    const handleCompleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic('medium');
        completeMutation.mutate(id);
    };

    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const todayCount = upcomingAppointments.filter(a => a.day === todayName).length;
    const totalCount = allAppointments.length;
    const completedCount = completedAppointments.length;

    return (
        <MobilePage>
            <div {...handlers}>
                <AppointmentPullToRefresh pullDistance={pullDistance} isRefreshing={isRefreshing} />
                {loading && students.length === 0 ? (
                    <MobileSkeleton rows={6} />
                ) : (
                    <>
                        <AppointmentStats todayCount={todayCount} totalCount={totalCount} completedCount={completedCount} />
                        <AppointmentTabs activeTab={activeTab} onTabChange={setActiveTab} totalCount={totalCount}
                            completedCount={completedCount} setSearchTerm={setSearchTerm} />
                        <AppointmentFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} filterDay={filterDay}
                            onDayChange={setFilterDay} filterTeacher={filterTeacher} onTeacherChange={setFilterTeacher}
                            uniqueTeachers={uniqueTeachers} />
                        <AppointmentListView activeTab={activeTab} appointmentsByDay={appointmentsByDay}
                            onComplete={handleCompleteSession}
                            canComplete={canComplete}
                            onSelect={(app) => { triggerHaptic('light'); setSelectedAppointment(app); setShowDetails(true); }} />
                    </>
                )}
                <AppointmentDetailsSheet show={showDetails} appointment={selectedAppointment} activeTab={activeTab}
                    onClose={() => { triggerHaptic('light'); setShowDetails(false); }}
                    onComplete={handleCompleteSession} />
            </div>
        </MobilePage>
    );
};
