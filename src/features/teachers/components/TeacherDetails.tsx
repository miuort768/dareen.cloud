import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle2, Trash2, MessageCircle, UserCircle2, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher, Session } from '../types';
import type { Student, Enrollment } from '../../../types';
import { TeacherCard } from './TeacherCard';

interface TeacherDetailsProps {
    teacher: Teacher;
    onClose: () => void;
    students: Student[];
    sessions: Session[];
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onUnenroll: (student: Student, teacherName: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onSendNotification: (teacher: Teacher) => void;
    isTeacherView: boolean;
}

export const TeacherDetails = ({
    teacher,
    onClose,
    students,
    sessions,
    onLogAttendance,
    onUnenroll,
    onDeleteSession,
    onSendNotification,
    isTeacherView
}: TeacherDetailsProps) => {
    const navigate = useNavigate();
    const [showCard, setShowCard] = useState(false);

    // Filter students enrolled with this teacher
    const enrolledStudents = students.filter(s =>
        s.enrollments?.some((e: Enrollment) => e.teacher === teacher.name)
    );

    // Filter sessions for this teacher
    const teacherSessions = sessions
        .filter(s => s.teacherName === teacher.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const recentSessions = teacherSessions.slice(0, 20);

    // Performance Calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlySessions = teacherSessions.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.status === 'completed';
    }).length;

    const prevMonthSessions = teacherSessions.filter(s => {
        const d = new Date(s.date);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === prevMonth && d.getFullYear() === year && s.status === 'completed';
    }).length;

    const performanceChange = prevMonthSessions === 0 ? 100 : Math.round(((monthlySessions - prevMonthSessions) / prevMonthSessions) * 100);

    return (
        <div className={cn(
            "bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:h-fit lg:sticky lg:top-6 lg:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]"
        )}>
            <div className="p-5 border-b-4 border-gray-900 flex justify-between items-start dark:bg-gray-950/50 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center rounded-none text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] border-2 border-gray-950">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="text-right" dir="rtl">
                        <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tighter uppercase">{teacher.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-1.5 py-0.5 bg-gray-950 text-white text-[9px] font-black uppercase tracking-widest rounded-none">
                                {teacher.subject}
                            </span>
                            <button 
                                onClick={() => setShowCard(true)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                                <UserCircle2 size={10} />
                                بطاقة الهوية
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isTeacherView && (
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 border border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })}
                                className="p-2 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all rounded-none"
                                title="مراسلة المعلمة"
                            >
                                <MessageCircle size={18} />
                            </button>
                            <button
                                onClick={() => onSendNotification(teacher)}
                                className="p-2 text-primary-600 hover:bg-primary-600 hover:text-white transition-all rounded-none"
                                title="إرسال تنبيه"
                            >
                                <Bell size={18} />
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all rounded-none">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-gray-950/30">
                {/* Performance Gauge */}
                <div className="p-4 bg-white dark:bg-gray-900 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]" dir="rtl">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">حصص الشهر الحالي</p>
                            <h4 className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter">{monthlySessions} <span className="text-sm opacity-40">حصة</span></h4>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 text-[10px] font-black border-2",
                            performanceChange >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            <TrendingUp size={12} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                        />
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4" dir="rtl">
                    <div className="bg-white p-4 border-2 border-gray-950 dark:bg-gray-900 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">عدد الطلاب</p>
                        <p className="text-2xl font-black text-primary-600 tracking-tighter">{enrolledStudents.length}</p>
                    </div>
                    <div className="bg-white p-4 border-2 border-gray-950 dark:bg-gray-900 shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">سعر الحصة</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">{teacher.price} <span className="text-[10px] text-gray-400">ج.م</span></p>
                    </div>
                </div>

                {/* Enrollment Section */}
                <div className="space-y-3" dir="rtl">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        الطلاب المسجلون ({enrolledStudents.length})
                    </h4>
                    <div className="space-y-3">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            return (
                                <div key={student.id} className="group bg-white border-2 border-gray-100 p-4 hover:border-gray-900 dark:bg-gray-900 dark:border-gray-800 transition-all shadow-[4px_4px_0px_0px_transparent] hover:shadow-[4px_4px_0px_0px_black] dark:hover:shadow-[4px_4px_0px_0px_white]">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-base font-black text-gray-950 dark:text-white tracking-tighter">{student.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                    <BookOpen size={10} /> {enrollment?.subject}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">•</span>
                                                <span className="text-[10px] font-bold text-gray-500">{student.grade}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onLogAttendance(student, enrollment)}
                                                className="p-2 border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                                                title="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            {!isTeacherView && (
                                                <button
                                                    onClick={() => onUnenroll(student, teacher.name)}
                                                    className="p-2 border-2 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                                                    title="إزالة الطالب"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="space-y-3 pt-4 border-t-2 border-gray-100 dark:border-gray-800" dir="rtl">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">آخر الجلسات المنفذة</h4>
                    <div className="space-y-2">
                        {recentSessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group hover:border-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-8",
                                        session.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                    )}></div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 dark:text-white tracking-tighter">{session.studentName}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                            <Calendar size={10} /> {session.date}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                                        session.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {session.status === 'completed' ? 'تمت' : 'ملغاة'}
                                    </span>
                                    {!isTeacherView && (
                                        <button 
                                            onClick={() => onDeleteSession(session.id)} 
                                            className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showCard && (
                <TeacherCard
                    teacher={teacher}
                    onClose={() => setShowCard(false)}
                />
            )}
        </div>
    );
};
