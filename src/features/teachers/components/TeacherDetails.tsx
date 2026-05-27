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
            "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col h-fit rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-left-4 duration-300",
            "fixed inset-0 z-[100] m-4 lg:m-0 lg:static lg:h-fit lg:sticky lg:top-4"
        )} dir="rtl">
            {/* Header Section */}
            <div className="relative p-6 bg-slate-950 border-b border-white/5">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 text-slate-500 hover:text-rose-500 p-2 hover:bg-white/5 rounded-lg transition-all"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary-color,#2563EB)] text-white rounded-xl flex items-center justify-center font-medium text-xl shadow-sm shrink-0">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg text-white truncate uppercase tracking-tighter">{teacher.name}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg uppercase tracking-widest">{teacher.subject}</span>
                            {!isTeacherView && (
                                <div className="flex items-center gap-1 mr-auto">
                                    <button onClick={() => onSendNotification(teacher)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"><Bell size={16} strokeWidth={2.5} /></button>
                                    <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><MessageCircle size={16} strokeWidth={2.5} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                {/* Performance Gauge */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">الإنتاجية (الحالية)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-medium text-slate-800 dark:text-white italic tracking-tighter">{monthlySessions}</span>
                                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">جلسة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-tighter",
                            performanceChange >= 0 ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20" : "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                        )}>
                            <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
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
                        <div className="bg-white dark:bg-slate-800 px-4 flex items-center justify-center border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl min-w-[44px] transition-colors group-hover:border-slate-300 dark:group-hover:border-slate-600">
                            <span className="text-xs font-medium text-[var(--primary-color,#2563EB)]">{enrolledStudents.length}</span>
                        </div>
                        <div className="bg-slate-900 text-white px-4 flex items-center justify-center rounded-l-xl relative overflow-hidden transition-all group-hover:bg-slate-800">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 right-0 w-1 h-full bg-[var(--primary-color,#2563EB)]"></div>
                            <h4 className="text-[10px] text-white font-medium uppercase tracking-[0.15em] z-10">الطلاب المسجلون</h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) => e.teacher === teacher.name)!;
                            const actualUsed = enrollment.sessionsUsed || 0;
                            const remaining = (enrollment.sessionsTotal || 0) - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = enrollment.sessionsTotal ? Math.round((actualUsed / enrollment.sessionsTotal) * 100) : 0;

                            return (
                                <div key={student.id} className={cn(
                                    "p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm relative transition-all group",
                                    (enrollment as { isFrozen?: boolean }).isFrozen && "opacity-50 grayscale",
                                    isLow ? "border-rose-200 dark:border-rose-900/50" : "hover:border-[var(--primary-color,#2563EB)]"
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-medium text-xs text-slate-800 dark:text-white uppercase">{student.name}</h5>
                                                {isLow && <span className="text-[8px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-1.5 py-0.5 rounded-lg animate-pulse uppercase">رصيد منخفض</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-medium text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">{student.grade}</span>
                                                <span className="text-[9px] font-medium text-slate-500 uppercase">{enrollment.subject}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onLogAttendance(student, enrollment)}
                                                className="w-7 h-7 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-transparent hover:border-emerald-600 shadow-sm"
                                                title="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                            </button>
                                            {!isTeacherView && (
                                                <button
                                                    onClick={() => onUnenroll(student, teacher.name)}
                                                    className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-transparent hover:border-rose-600 shadow-sm"
                                                    title="إلغاء التسجيل"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...Array(enrollment.sessionsTotal || 0)].map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={cn(
                                                        "w-4 h-4 border flex items-center justify-center rounded text-[7px] font-medium font-mono transition-all",
                                                        idx < actualUsed 
                                                            ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" 
                                                            : idx === actualUsed 
                                                                ? "bg-white dark:bg-slate-800 border-[var(--primary-color,#2563EB)] text-[var(--primary-color,#2563EB)] shadow-sm" 
                                                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} strokeWidth={3} /> : idx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex-1 max-w-[120px]">
                                                <div className="flex justify-between text-[8px] font-medium text-slate-400 uppercase mb-1">
                                                    <span>الإنجاز</span>
                                                    <span className="tabular-nums">{progressPercent}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                    <div className={cn("h-full", isLow ? "bg-rose-500" : "bg-blue-500")} style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-center px-2">
                                                <p className="text-[8px] font-medium text-slate-400 uppercase leading-none mb-0.5">الرصيد</p>
                                                <p className={cn("text-xs font-medium font-mono", isLow ? "text-rose-500" : "text-emerald-500")}>{remaining}</p>
                                            </div>
                                        </div>
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
                        className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 hover:border-[var(--primary-color,#2563EB)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[var(--primary-color,#2563EB)] group-hover:text-white transition-colors">
                                <Clock size={18} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-medium text-slate-800 dark:text-white uppercase tracking-widest">سجل النشاطات المفصل</p>
                                <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">عرض آخر {teacherSessions.length} عملية</p>
                            </div>
                        </div>
                        <CheckCircle2 size={16} className="text-slate-300 group-hover:text-[var(--primary-color,#2563EB)]" />
                    </button>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}

            {/* Detailed Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12" dir="rtl">
                    <div className="fixed inset-0 bg-slate-950/60 " onClick={() => setShowActivityModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm w-full max-w-4xl h-full max-h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--primary-color,#2563EB)] flex items-center justify-center rounded-xl shadow-sm">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium uppercase tracking-tighter text-white">سجل نشاطات المعلمة</h3>
                                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{teacher.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivityModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-rose-500 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {teacherSessions.map(session => (
                                    <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm hover:shadow-sm transition-all group relative overflow-hidden">
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
                                                    <p className="text-[10px] font-medium text-slate-800 dark:text-white uppercase tracking-tight truncate">{session.studentName}</p>
                                                    <p className="text-[7px] font-medium text-slate-400 uppercase tracking-widest">{session.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-[8px] font-medium text-slate-400 uppercase tracking-widest">
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
                                    <p className="text-xs font-medium uppercase tracking-[0.3em]">لا توجد نشاطات مسجلة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

