import { useState, useMemo } from 'react';
import { CalendarCheck, CheckCircle2, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { PageHeader, ProgressBar } from '../shared/components/ui';
import type { Student, Session, Enrollment } from '../types';

export const Agenda = () => {
    const queryClient = useQueryClient();
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const isTeacher = currentUser?.role === 'teacher';
    const teacherName = currentUser?.teacherName || currentUser?.name;

    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('ar-EG', { weekday: 'long' }));
    const [searchTerm, setSearchTerm] = useState('');

    const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const data = await api.get<Student[]>('/students');
            return Array.isArray(data) ? data : (data as Record<string, unknown>).data as Student[] || [];
        }
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery<Session[]>({
        queryKey: ['sessions'],
        queryFn: async () => {
            const data = await api.get<Session[]>('/sessions');
            return Array.isArray(data) ? data : [];
        }
    });

    const logAttendanceMutation = useMutation({
        mutationFn: async (sessionData: Record<string, unknown>) => {
            return api.post('/sessions', sessionData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('�� ����� ����� �����', 'success');
        },
        onError: () => {
            showNotification('��� ����� �����', 'error');
        }
    });

    // Extract scheduled slots for the active day
    const scheduledAppointments = useMemo(() => {
        const list: { id: string; date: string; time: string; title: string; description?: string; type: string; studentName?: string; teacherName?: string }[] = [];
        students.forEach(student => {
            student.enrollments?.forEach((enrollment: Enrollment) => {
                // If teacher view, only show their students
                if (isTeacher && enrollment.teacher !== teacherName && enrollment.teacherId !== currentUser?.id) return;

                enrollment.schedule?.forEach(slot => {
                    if (slot.day === activeDay) {
                        // Check if already completed today
                        const today = new Date().toLocaleDateString('en-CA');
                        const isDone = sessions.some(s =>
                            s.studentId === student.id &&
                            ((s.teacherId && enrollment.teacherId && s.teacherId === enrollment.teacherId) || s.teacherName === enrollment.teacher) &&
                            s.subject === enrollment.subject &&
                            s.date === today &&
                            s.status === 'completed'
                        );

                        list.push({
                            id: `${student.id}-${enrollment.teacher}-${enrollment.subject}-${slot.hour}-${slot.period}`,
                            studentId: student.id,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: enrollment.teacher,
                            subject: enrollment.subject,
                            time: `${slot.hour} ${slot.period === 'am' ? '������' : '�����'}`,
                            hour: slot.hour,
                            period: slot.period,
                            isDone,
                            enrollment
                        });
                    }
                });
            });
        });

        return list.filter(item =>
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort(() => {
            // Sort by time?
            return 0;
        });
    }, [students, sessions, activeDay, isTeacher, teacherName, searchTerm]);

    const handleMarkDone = (appointment: { id: string }) => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        logAttendanceMutation.mutate({
            studentId: appointment.studentId,
            studentName: appointment.studentName,
            teacherName: appointment.teacherName,
            subject: appointment.subject,
            date: new Date().toLocaleDateString('en-CA'),
            time: currentTime,
            status: 'completed',
            day: activeDay
        });
    };

    const DAYS = ['�����', '�����', '�������', '��������', '��������', '������', '������'];

    if (loadingStudents || loadingSessions) {
        return <div className="p-6 lg:p-12 text-center">جاري تحميل البيانات...</div>;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans" dir="rtl">
    <div className="relative z-10 max-w-page mx-auto px-2">
            <PageHeader
                title="����� ����� �������"
                subtitle="������ ������ ����� �������� �����"
                icon={CalendarCheck}
                color="amber"
                stats={[
                    { label: '��� �����', value: scheduledAppointments.length },
                    { label: '�� �������', value: scheduledAppointments.filter(a => a.isDone).length }
                ]}
            />

            {/* Quick Filters */}
            <div className="shadow-sm p-3 flex flex-col md:flex-row gap-4 items-center justify-between rounded-none mb-6 bg-warning">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "px-4 py-2 text-micro font-bold transition-all whitespace-nowrap rounded-none",
                                activeDay === day
                                    ? "bg-white text-warning"
                                    : "bg-white/15 text-on-primary/70 hover:bg-white/30"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary/50" size={14} />
                    <input
                        type="text"
                        aria-label="بحث عن طالب"
                        placeholder="بحث عن طالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/15 border border-white/20 text-on-primary placeholder:text-on-primary/50 ps-10 py-2 text-xs font-bold outline-none rounded-none"
                    />
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {scheduledAppointments.length > 0 ? (
                    scheduledAppointments.map((app) => (
                        <div key={app.id} className={cn(
                            "relative group bg-white dark:bg-card border-2 transition-all overflow-hidden rounded-none shadow-sm hover:shadow-sm",
                            app.isDone ? "border-success dark:border-success/30" : "border-border dark:border-border hover:border-warning"
                        )}>
                            {/* Status Stripe */}
                            <div className={cn(
                                "absolute top-0 start-0 w-1.5 h-full transition-all",
                                app.isDone ? "bg-success" : "bg-warning scale-y-50 group-hover:scale-y-100"
                            )}></div>

                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center font-medium text-lg rounded-none transition-colors",
                                            app.isDone ? "bg-success-light text-success" : "bg-warning-light text-warning dark:bg-warning/20"
                                        )}>
                                            {app.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-main dark:text-on-primary text-base leading-tight">{app.studentName}</h4>
                                            <p className="text-micro font-normal text-muted flex items-center gap-1 uppercase">
                                                {app.studentGrade}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-surface dark:bg-card text-micro font-medium text-muted rounded-none font-mono">
                                        {app.time}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-normal text-muted dark:text-muted">
                                        <BookOpen size={14} className="text-warning" />
                                        <span>{app.subject}</span>
                                    </div>
                                    {!isTeacher && (
                                        <div className="flex items-center gap-2 text-xs font-normal text-muted">
                                            <User size={14} className="text-info" />
                                            <span>�. {app.teacherName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress for that enrollment */}
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-1 text-micro font-medium uppercase tracking-widest text-muted">
                                        <span>���� ������</span>
                                        <span>{app.enrollment.sessionsUsed} / {app.enrollment.sessionsTotal}</span>
                                    </div>
                                    <ProgressBar value={(app.enrollment.sessionsUsed / app.enrollment.sessionsTotal) * 100} variant={app.isDone ? 'success' : 'warning'} />
                                </div>

                                <div className="pt-2">
                                    {app.isDone ? (
                                        <div className="w-full bg-success-light dark:bg-success/20 text-success py-3 flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-widest">
                                            <CheckCircle2 size={16} />
                                            �� �������
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkDone(app)}
                                            disabled={logAttendanceMutation.isPending}
                                            className="w-full bg-warning hover:bg-warning text-on-primary py-3 flex items-center justify-center gap-2 font-medium text-xs uppercase tracking-widest transition-all shadow-sm shadow-warning/10 active:scale-95 disabled:opacity-50"
                                        >
                                            {logAttendanceMutation.isPending ? '���� �������...' : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    ����� �������
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-border dark:border-border bg-white/50 dark:bg-card/50 rounded-none">
                        <Calendar size={48} className="mx-auto mb-4 text-dim" />
                        <h3 className="text-lg font-medium text-muted">�� ���� ��� ������ ���� �����</h3>
                        <p className="text-sm text-muted font-normal mt-1 uppercase tracking-widest">���� ������ �� ������� ��������</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};
