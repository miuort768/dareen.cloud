import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle2, Trash2, MessageCircle, TrendingUp, Clock, Calendar, Shield } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Teacher, Session } from '../types';
import type { Student, Enrollment } from '../../../types';
import { TeacherCard } from './TeacherCard';
import { motion } from 'framer-motion';

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
            "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col h-fit rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-left-4 duration-300",
            "fixed inset-0 z-[100] m-4 lg:m-0 lg:static lg:h-fit lg:sticky lg:top-4"
        )} dir="rtl">
            {/* Header Section */}
            <div className="relative p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{teacher.name}</h3>
                            <button onClick={() => setShowCard(true)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                                <Shield size={14} />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{teacher.subject}</span>
                            {!isTeacherView && (
                                <div className="flex items-center gap-1 mr-auto">
                                    <button onClick={() => onSendNotification(teacher)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"><Bell size={14} /></button>
                                    <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><MessageCircle size={14} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                {/* Performance Gauge */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">الأداء (الشهر الحالي)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-800 dark:text-white">{monthlySessions}</span>
                                <span className="text-[10px] font-bold text-slate-400">حصة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                            performanceChange >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>

                {/* Enrollment Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">الطلاب المسجلون ({enrolledStudents.length})</h4>
                    </div>
                    <div className="space-y-2">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            return (
                                <div key={student.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent flex justify-between items-center group hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400">{student.grade} • {enrollment?.subject}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLogAttendance(student, enrollment)}
                                            className="w-7 h-7 flex items-center justify-center text-emerald-500 hover:bg-emerald-100 rounded-lg transition-all"
                                            title="تسجيل حضور"
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        {!isTeacherView && (
                                            <button
                                                onClick={() => onUnenroll(student, teacher.name)}
                                                className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                                                title="إلغاء التسجيل"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="space-y-4 border-t border-slate-50 dark:border-slate-800 pt-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">آخر النشاطات</h4>
                        <span className="text-[8px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded">15 جلسة</span>
                    </div>
                    <div className="space-y-2">
                        {recentSessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        session.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                    )} />
                                    <div className="min-w-0">
                                        <p className="font-bold text-[10px] text-slate-600 dark:text-slate-300 truncate">{session.studentName}</p>
                                        <div className="flex items-center gap-2 text-[8px] text-slate-400 mt-0.5 font-bold">
                                            <Calendar size={8} /> {session.date}
                                            <Clock size={8} /> {session.time}
                                        </div>
                                    </div>
                                </div>
                                {!isTeacherView && (
                                    <button 
                                        onClick={() => onDeleteSession(session.id)} 
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}
        </div>
    );
};
