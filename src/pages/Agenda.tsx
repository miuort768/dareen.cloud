import { useState, useMemo } from 'react';
import { CalendarCheck, CheckCircle2, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { PageHeader } from '../shared/components/ui/PageHeader';
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
            showNotification('تم تسجيل الحصة بنجاح', 'success');
        },
        onError: () => {
            showNotification('فشل تسجيل الحصة', 'error');
        }
    });

    // Extract scheduled slots for the active day
    const scheduledAppointments = useMemo(() => {
        const list: { id: string; date: string; time: string; title: string; description?: string; type: string; studentName?: string; teacherName?: string }[] = [];
        students.forEach(student => {
            student.enrollments?.forEach((enrollment: Enrollment) => {
                // If teacher view, only show their students
                if (isTeacher && enrollment.teacher !== teacherName) return;

                enrollment.schedule?.forEach(slot => {
                    if (slot.day === activeDay) {
                        // Check if already completed today
                        const today = new Date().toLocaleDateString('en-CA');
                        const isDone = sessions.some(s =>
                            s.studentId === student.id &&
                            s.teacherName === enrollment.teacher &&
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

    const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    if (loadingStudents || loadingSessions) {
        return <div className="p-12 text-center">جاري تحميل الأجندة...</div>;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
    <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
    <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
            <PageHeader
                title="أجندة الحصص اليومية"
                subtitle="متابعة وتنفيذ الحصص المجدولة لليوم"
                icon={CalendarCheck}
                color="amber"
                stats={[
                    { label: 'حصص اليوم', value: scheduledAppointments.length },
                    { label: 'تم التنفيذ', value: scheduledAppointments.filter(a => a.isDone).length }
                ]}
            />

            {/* Quick Filters */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto custom-scrollbar">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "px-6 py-2.5 text-xs font-black transition-all whitespace-nowrap border-b-2",
                                activeDay === day
                                    ? "bg-amber-50 text-amber-700 border-amber-500 dark:bg-amber-900/20"
                                    : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث في الأجندة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none pr-10 py-3 text-sm font-bold focus:ring-2 ring-amber-500 rounded-xl dark:text-white"
                    />
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {scheduledAppointments.length > 0 ? (
                    scheduledAppointments.map((app) => (
                        <div key={app.id} className={cn(
                            "relative group bg-white dark:bg-gray-900 border-2 transition-all overflow-hidden rounded-2xl shadow-sm hover:shadow-xl",
                            app.isDone ? "border-emerald-100 dark:border-emerald-900/30" : "border-gray-100 dark:border-gray-800 hover:border-amber-500"
                        )}>
                            {/* Status Stripe */}
                            <div className={cn(
                                "absolute top-0 right-0 w-1.5 h-full transition-all",
                                app.isDone ? "bg-emerald-500" : "bg-amber-500 scale-y-50 group-hover:scale-y-100"
                            )}></div>

                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center font-black text-lg rounded-xl transition-colors",
                                            app.isDone ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                                        )}>
                                            {app.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight">{app.studentName}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                                                {app.studentGrade}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 rounded font-mono">
                                        {app.time}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                        <BookOpen size={14} className="text-amber-500" />
                                        <span>{app.subject}</span>
                                    </div>
                                    {!isTeacher && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <User size={14} className="text-blue-500" />
                                            <span>أ. {app.teacherName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress for that enrollment */}
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                        <span>تقدم الطالب</span>
                                        <span>{app.enrollment.sessionsUsed} / {app.enrollment.sessionsTotal}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                app.isDone ? "bg-emerald-500" : "bg-amber-500"
                                            )}
                                            style={{ width: `${(app.enrollment.sessionsUsed / app.enrollment.sessionsTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {app.isDone ? (
                                        <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 py-3 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                                            <CheckCircle2 size={16} />
                                            تم الإنجاز
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkDone(app)}
                                            disabled={logAttendanceMutation.isPending}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                                        >
                                            {logAttendanceMutation.isPending ? 'جاري التسجيل...' : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    تأكيد الإنجاز
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                        <Calendar size={48} className="mx-auto mb-4 text-gray-200" />
                        <h3 className="text-lg font-black text-gray-400">لا توجد حصص مجدولة لهذا اليوم</h3>
                        <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">يرجى التأكد من الجداول الدراسية</p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};
