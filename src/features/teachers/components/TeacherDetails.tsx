import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle2, Trash2, MessageCircle, TrendingUp } from 'lucide-react';
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

    const recentSessions = teacherSessions.slice(0, 15);

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
            "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col rounded-none",
            "fixed inset-0 z-[100] lg:h-fit lg:sticky lg:top-6 lg:shadow-indigo-100/20 dark:lg:shadow-none"
        )} dir="rtl">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5c59f2] text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {teacher.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-sm leading-none">{teacher.name}</h3>
                        <p className="text-[10px] font-bold text-[#5c59f2] mt-1 uppercase italic">{teacher.subject}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!isTeacherView && (
                        <div className="flex items-center gap-1 ml-2">
                             <button
                                onClick={() => onSendNotification(teacher)}
                                className="p-2 text-slate-400 hover:text-[#5c59f2] transition-colors"
                            >
                                <Bell size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })}
                                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {/* Performance Gauge */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الأداء في الشهر الحالي</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{monthlySessions}</span>
                                <span className="text-[10px] font-bold text-slate-400">حصة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black border",
                            performanceChange >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                        />
                    </div>
                </div>

                {/* Enrollment Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الطلاب المسجلون ({enrolledStudents.length})</h4>
                        <button className="text-[9px] font-bold text-[#5c59f2] hover:underline" onClick={() => setShowCard(true)}>عرض بطاقة التعريف</button>
                    </div>
                    <div className="space-y-2">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            return (
                                <div key={student.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{student.grade} - {enrollment?.subject}</p>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLogAttendance(student, enrollment)}
                                            className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <CheckCircle2 size={12} />
                                        </button>
                                        {!isTeacherView && (
                                            <button
                                                onClick={() => onUnenroll(student, teacher.name)}
                                                className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="space-y-3 border-t border-slate-50 dark:border-slate-800 pt-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر 15 جلسة مفعّلة</h4>
                    <div className="space-y-1.5 mb-8">
                        {recentSessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-1.5 h-1.5 shrink-0",
                                        session.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                    )}></div>
                                    <div className="min-w-0">
                                        <p className="font-black text-[11px] text-slate-600 dark:text-slate-300 truncate leading-none">{session.studentName}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                                            {session.date} • {session.time}
                                        </div>
                                    </div>
                                </div>
                                {!isTeacherView && (
                                    <button 
                                        onClick={() => onDeleteSession(session.id)} 
                                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
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
