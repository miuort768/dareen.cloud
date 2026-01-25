import { useState, useMemo } from 'react';
import { CalendarCheck, BookOpen, User, Search, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { PageHeader } from '../shared/components/ui/PageHeader';
import type { Student, Session, Enrollment } from '../types';

export const Appointments = () => {
    const queryClient = useQueryClient();
    const { currentUser, showNotification } = useApp();
    const isTeacher = currentUser?.role === 'teacher';
    const teacherName = currentUser?.teacherName || currentUser?.name;

    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('ar-EG', { weekday: 'long' }));
    const [searchTerm, setSearchTerm] = useState('');

    const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const data = await api.get<Student[]>('/students');
            return Array.isArray(data) ? data : (data as any).data || [];
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
        mutationFn: async (sessionData: any) => {
            return api.post('/sessions', sessionData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إنجاز الحصة بنجاح', 'success');
        },
        onError: () => {
            showNotification('فشل في إنجاز الحصة', 'error');
        }
    });

    // Extract scheduled slots
    const scheduledCards = useMemo(() => {
        const list: any[] = [];
        students.forEach(student => {
            student.enrollments?.forEach((enrollment: Enrollment) => {
                if (isTeacher && enrollment.teacher !== teacherName) return;

                enrollment.schedule?.forEach(slot => {
                    if (slot.day === activeDay) {
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
                            time: `${slot.hour} ${slot.period === 'am' ? 'ص' : 'م'}`,
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
            item.subject.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => {
            // Simple time sort
            const aH = parseInt(a.hour) + (a.period === 'pm' ? 12 : 0);
            const bH = parseInt(b.hour) + (b.period === 'pm' ? 12 : 0);
            return aH - bH;
        });
    }, [students, sessions, activeDay, isTeacher, teacherName, searchTerm]);

    const handleMarkDone = (appointment: any) => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric',
            minute: '2-digit',
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
        return <div className="p-12 text-center">جاري تحميل المواعيد...</div>;
    }

    return (
        <div className="space-y-6 pb-32">
            <PageHeader
                title="جدول المواعيد اليومي"
                subtitle="تنفيذ الحصص المجدولة حسب اليوم"
                icon={CalendarCheck}
                color="primary"
                stats={[
                    { label: 'إجمالي المواعيد', value: scheduledCards.length },
                    { label: 'المتبقي', value: scheduledCards.filter(a => !a.isDone).length }
                ]}
            />

            {/* Day Selector Tabs */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 shadow-sm overflow-hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar justify-between items-center">
                    <div className="flex gap-2">
                        {DAYS.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "px-5 py-2.5 text-xs font-black transition-all rounded-lg border",
                                    activeDay === day
                                        ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20"
                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none pr-10 py-2.5 text-xs font-bold focus:ring-2 ring-primary-500 rounded-lg dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scheduledCards.length > 0 ? (
                    scheduledCards.map((app) => (
                        <div key={app.id} className={cn(
                            "relative bg-white dark:bg-gray-900 border-b-4 transition-all overflow-hidden shadow-sm hover:shadow-xl p-5",
                            app.isDone ? "border-emerald-500 bg-emerald-50/5" : "border-primary-500"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-black rounded-lg">
                                    {app.time}
                                </div>
                                {app.isDone && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded uppercase">مكتمل</span>
                                )}
                            </div>

                            <div className="space-y-1 mb-6">
                                <h4 className="font-black text-gray-900 dark:text-white text-lg">{app.studentName}</h4>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <BookOpen size={12} className="text-primary-500" />
                                    {app.subject} • {app.studentGrade}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                                    <User size={12} />
                                    أ. {app.teacherName}
                                </div>
                                {!app.isDone ? (
                                    <button
                                        onClick={() => handleMarkDone(app)}
                                        disabled={logAttendanceMutation.isPending}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-black text-[10px] flex items-center gap-1.5 transition-all shadow-lg shadow-primary-600/10"
                                    >
                                        <CheckCircle2 size={14} />
                                        تم الإنجاز
                                    </button>
                                ) : (
                                    <div className="text-emerald-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
                        <CalendarCheck size={48} className="mx-auto mb-4 text-gray-200" />
                        <h3 className="text-lg font-black text-gray-400">لا توجد مواعيد في هذا اليوم</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
