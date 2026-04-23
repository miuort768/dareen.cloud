import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle2, Trash2, MessageCircle, TrendingUp, Clock, Calendar } from 'lucide-react';
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
    const [showActivityModal, setShowActivityModal] = useState(false);

    // Filter students enrolled with this teacher
    const enrolledStudents = students.filter(s =>
        s.enrollments?.some((e: Enrollment) => e.teacher === teacher.name)
    );

    // Filter sessions for this teacher
    const teacherSessions = sessions
        .filter(s => s.teacherName === teacher.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col h-fit rounded-none overflow-hidden shadow-2xl animate-in slide-in-from-left-4 duration-300",
            "fixed inset-0 z-[100] m-4 lg:m-0 lg:static lg:h-fit lg:sticky lg:top-4"
        )} dir="rtl">
            {/* Header Section */}
            <div className="relative p-6 bg-slate-950 border-b border-white/5">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-500 hover:text-rose-500 p-2 hover:bg-white/5 rounded-none transition-all"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary-color,#5c59f2)] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-lg text-white truncate uppercase tracking-tighter">{teacher.name}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-none uppercase tracking-widest">{teacher.subject}</span>
                            {!isTeacherView && (
                                <div className="flex items-center gap-1 mr-auto">
                                    <button onClick={() => onSendNotification(teacher)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-none transition-all"><Bell size={16} strokeWidth={2.5} /></button>
                                    <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-none transition-all"><MessageCircle size={16} strokeWidth={2.5} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                {/* Performance Gauge */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 rounded-none shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">الإنتاجية (الحالية)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 dark:text-white italic tracking-tighter">{monthlySessions}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">جلسة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-tighter",
                            performanceChange >= 0 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                        )}>
                            <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-none overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>

                {/* Enrollment Section */}
                <div className="space-y-4">
                    <div className="flex items-stretch h-9 shadow-sm w-fit group cursor-default">
                        <div className="bg-white dark:bg-slate-800 px-4 flex items-center justify-center border-y border-r border-slate-200 dark:border-slate-700 rounded-none min-w-[44px] transition-colors group-hover:border-slate-300 dark:group-hover:border-slate-600">
                            <span className="text-xs font-black text-[var(--primary-color,#5c59f2)]">{enrolledStudents.length}</span>
                        </div>
                        <div className="bg-slate-900 text-white px-4 flex items-center justify-center rounded-none relative overflow-hidden transition-all group-hover:bg-slate-800">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 right-0 w-1 h-full bg-[var(--primary-color,#5c59f2)]"></div>
                            <h4 className="text-[10px] text-white font-black uppercase tracking-[0.15em] z-10">الطلاب المسجلون</h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            return (
                                <div key={student.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none flex justify-between items-center group hover:border-[var(--primary-color,#5c59f2)] transition-all">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate uppercase tracking-tight">{student.name}</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{student.grade} • {enrollment?.subject}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLogAttendance(student, enrollment)}
                                            className="w-8 h-8 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-none transition-all"
                                            title="تسجيل حضور"
                                        >
                                            <CheckCircle2 size={16} strokeWidth={2.5} />
                                        </button>
                                        {!isTeacherView && (
                                            <button
                                                onClick={() => onUnenroll(student, teacher.name)}
                                                className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white rounded-none transition-all"
                                                title="إلغاء التسجيل"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Activity Button */}
                <div className="pt-4">
                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 hover:border-[var(--primary-color,#5c59f2)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[var(--primary-color,#5c59f2)] group-hover:text-white transition-colors">
                                <Clock size={18} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">سجل النشاطات المفصل</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">عرض آخر {teacherSessions.length} عملية</p>
                            </div>
                        </div>
                        <CheckCircle2 size={16} className="text-slate-300 group-hover:text-[var(--primary-color,#5c59f2)]" />
                    </button>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}

            {/* Detailed Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12" dir="rtl">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowActivityModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col rounded-none overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--primary-color,#5c59f2)] flex items-center justify-center rounded-none shadow-xl">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">سجل نشاطات المعلمة</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{teacher.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivityModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-rose-500 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {teacherSessions.map(session => (
                                    <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className={cn(
                                            "absolute top-0 right-0 w-1 h-full",
                                            session.status === 'completed' ? "bg-emerald-500" : "bg-rose-500"
                                        )} />
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all">
                                                    <Calendar size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{session.studentName}</p>
                                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{session.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                <Clock size={8} /> {session.time}
                                            </div>
                                            {!isTeacherView && (
                                                <button onClick={() => onDeleteSession(session.id)} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {teacherSessions.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <Clock size={48} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">لا توجد نشاطات مسجلة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
