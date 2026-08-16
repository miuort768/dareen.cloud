import { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, CheckCircle2, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { PageHeader, ProgressBar } from '../shared/components/ui';
import type { Student, Session, Enrollment } from '../types';

export const Agenda = () => {
    useEffect(() => { document.title = 'الأجندة | دارين السابعة للتعليم والتدريب'; }, []);
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
            showNotification('تم تسجيل الحضور بنجاح', 'success');
        },
        onError: () => {
            showNotification('فشل تسجيل الحضور', 'error');
        }
    });

    // Extract scheduled slots for the active day
    const scheduledAppointments = useMemo(() => {
        const list: { id: string; date: string; time: string; title: string; description?: string; type: string; studentName: string; studentId: string; studentGrade: string; teacherName: string; subject: string; hour: string; period: string; isDone: boolean; enrollment: Enrollment }[] = [];
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
                            date: today,
                            type: 'session',
                            title: `${student.name} - ${enrollment.subject}`,
                            studentId: student.id,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: enrollment.teacher,
                            subject: enrollment.subject,
                            time: `${slot.hour} ${slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
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
        );
    }, [students, sessions, activeDay, isTeacher, teacherName, searchTerm, currentUser?.id]);

    type ScheduledAppointment = {
        id: string; date: string; time: string; title: string; description?: string; type: string;
        studentName: string; studentId: string; studentGrade: string; teacherName: string;
        subject: string; hour: string; period: string; isDone: boolean; enrollment: Enrollment;
    };

    const handleMarkDone = (appointment: ScheduledAppointment) => {
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

    const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    if (loadingStudents || loadingSessions) {
        return <div className="p-6 lg:p-12 text-center">جاري تحميل البيانات...</div>;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans" dir="rtl">
    <div className="relative z-10 max-w-page mx-auto px-2">
            <PageHeader
                title="جدول المواعيد"
                subtitle="متابعة جميع حصص الطلاب المسجلين"
                icon={<CalendarCheck />}
                stats={
                    <>
                        <div className="flex items-center gap-2 text-xs font-bold text-dim">
                            <span>كل المواعيد:</span>
                            <span className="text-main">{scheduledAppointments.length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-dim">
                            <span>تم الإنجاز:</span>
                            <span className="text-success">{scheduledAppointments.filter(a => a.isDone).length}</span>
                        </div>
                    </>
                }
            />

            {/* Quick Filters */}
            <div className="bg-surface border border-border/50 rounded-2xl p-2 mx-2 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "px-3 py-2 text-[10px] font-bold transition-all whitespace-nowrap rounded-xl shrink-0",
                                activeDay === day
                                    ? "bg-primary text-on-primary shadow-sm"
                                    : "bg-background border border-border text-dim hover:text-main"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-3 mb-4">
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                    <input
                        type="text"
                        aria-label="بحث عن طالب"
                        placeholder="بحث عن طالب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border/50 text-xs font-bold text-main placeholder:text-muted ps-8 pe-3 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-2">
                {scheduledAppointments.length > 0 ? (
                    scheduledAppointments.map((app) => (
                        <div key={app.id} className={cn(
                            "relative group bg-surface border transition-all overflow-hidden rounded-2xl shadow-sm",
                            app.isDone ? "border-success/30" : "border-border hover:border-warning/50"
                        )}>
                            {/* Status Stripe */}
                            <div className={cn(
                                "absolute top-0 start-0 w-1 h-full transition-all",
                                app.isDone ? "bg-success" : "bg-warning"
                            )}></div>

                            <div className="p-3 ps-4 space-y-2.5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            "w-9 h-9 flex items-center justify-center font-bold text-xs rounded-xl transition-colors",
                                            app.isDone ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                                        )}>
                                            {app.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-main leading-tight">{app.studentName}</h4>
                                            <p className="text-[10px] font-bold text-dim">{app.studentGrade}</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-background text-[10px] font-bold text-dim rounded-lg font-mono">
                                        {app.time}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-dim">
                                        <BookOpen size={12} className="text-warning" />
                                        <span>{app.subject}</span>
                                    </div>
                                    {!isTeacher && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-dim">
                                            <User size={12} className="text-info" />
                                            <span>{app.teacherName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress for that enrollment */}
                                <div className="pt-1">
                                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-dim">
                                        <span>التقدم</span>
                                        <span>{app.enrollment.sessionsUsed}/{app.enrollment.sessionsTotal}</span>
                                    </div>
                                    <ProgressBar value={(app.enrollment.sessionsUsed / app.enrollment.sessionsTotal) * 100} variant={app.isDone ? 'success' : 'warning'} />
                                </div>

                                <div className="pt-1">
                                    {app.isDone ? (
                                        <div className="w-full bg-success-soft text-success py-2 flex items-center justify-center gap-1.5 font-bold text-[10px] rounded-xl">
                                            <CheckCircle2 size={13} />
                                            تم الإنجاز
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkDone(app)}
                                            disabled={logAttendanceMutation.isPending}
                                            className="w-full bg-warning text-on-warning py-2 flex items-center justify-center gap-1.5 font-bold text-[10px] rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {logAttendanceMutation.isPending ? 'جاري...' : (
                                                <>
                                                    <CheckCircle2 size={13} />
                                                    تسجيل الإنجاز
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center border border-dashed border-border bg-surface rounded-2xl mx-2">
                        <Calendar size={32} className="mx-auto mb-2 text-dim" />
                        <h3 className="text-xs font-bold text-muted">لا توجد مواعيد لهذا اليوم</h3>
                        <p className="text-[10px] text-dim mt-1">اختر يوماً آخر</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};
