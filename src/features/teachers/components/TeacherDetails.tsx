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
            "bg-card border border-border rounded-2xl flex flex-col h-fit shadow-sm overflow-hidden",
            "lg:static lg:sticky lg:top-4"
        )} dir="rtl">
            {/* Header Section */}
            <div className="relative p-4 md:p-6 bg-gradient-to-br from-primary to-primary-light">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 text-on-primary flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                            {teacher.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base md:text-lg text-on-primary truncate">{teacher.name}</h3>
                            <span className="text-micro font-bold text-on-primary opacity-60 bg-white/10 border border-white/10 px-2 py-0.5 uppercase tracking-widest rounded-xl">{teacher.subject}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        {!isTeacherView && (
                            <>
                                <button onClick={() => onSendNotification(teacher)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/10 hover:bg-warning text-on-primary rounded-xl transition-all" title="إرسال إشعار"><Bell size={16} strokeWidth={2.5} /></button>
                                <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/10 hover:bg-success text-on-primary rounded-xl transition-all" title="مراسلة"><MessageCircle size={16} strokeWidth={2.5} /></button>
                            </>
                        )}
                        <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/10 hover:bg-error text-on-primary rounded-xl transition-all" title="إغلاق"><X size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                {/* Performance Gauge */}
                <div className="p-5 bg-gradient-to-br from-primary-soft to-surface dark:from-primary-soft dark:to-surface border border-border rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-micro font-medium text-muted uppercase tracking-[0.2em] mb-1">الإنتاجية (الحالية)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-medium text-main italic tracking-tighter">{monthlySessions}</span>
                                <span className="text-micro font-medium text-muted uppercase tracking-widest">جلسة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 text-micro font-medium uppercase tracking-tighter rounded-xl",
                            performanceChange >= 0 ? "bg-success text-on-success shadow-sm" : "bg-error text-on-error shadow-sm"
                        )}>
                            <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                            {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
                        </div>
                    </div>
                    <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                            className="h-full bg-success rounded-full"
                        />
                    </div>
                </div>

                {/* Enrollment Section */}
                <div className="space-y-4">
                    <div className="flex items-stretch h-9 w-fit group cursor-default">
                        <div className="bg-card px-4 flex items-center justify-center border-y border-e border-border min-w-[44px] rounded-e-xl transition-colors">
                            <span className="text-xs font-medium text-primary">{enrolledStudents.length}</span>
                        </div>
                        <div className="bg-gradient-to-l from-primary to-primary-light text-on-primary px-4 flex items-center justify-center rounded-s-xl relative overflow-hidden transition-all">
                            <h4 className="text-micro text-on-primary font-medium uppercase tracking-[0.15em] z-10">الطلاب المسجلون</h4>
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
                                    "p-3 bg-card border border-border rounded-xl shadow-sm relative transition-all group",
                                    (enrollment as { isFrozen?: boolean }).isFrozen && "opacity-50 grayscale",
                                    isLow ? "border-error" : "hover:border-primary/30"
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-medium text-xs text-main uppercase">{student.name}</h5>
                                                {isLow && <span className="text-micro font-medium text-error bg-error-soft border border-border px-1.5 py-0.5 animate-pulse uppercase rounded-xl">رصيد منخفض</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-micro font-medium text-muted uppercase bg-surface px-1.5 py-0.5 border border-border rounded-xl">{student.grade}</span>
                                                <span className="text-micro font-medium text-muted uppercase">{enrollment.subject}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onLogAttendance(student, enrollment)}
                                                className="w-7 h-7 flex items-center justify-center text-success hover:bg-success hover:text-on-success rounded-xl transition-all border border-transparent hover:border-success shadow-sm"
                                                title="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={14} strokeWidth={2.5} />
                                            </button>
                                            {!isTeacherView && (
                                                <button
                                                    onClick={() => onUnenroll(student, teacher.name)}
                                                    className="w-7 h-7 flex items-center justify-center text-error hover:bg-error hover:text-on-error rounded-xl transition-all border border-transparent hover:border-error shadow-sm"
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
                                                        "w-4 h-4 border flex items-center justify-center text-micro font-medium font-mono rounded transition-all",
                                                        idx < actualUsed 
                                                            ? "bg-success border-success text-on-success shadow-sm" 
                                                            : idx === actualUsed 
                                                                ? "bg-card border-primary text-primary shadow-sm" 
                                                                : "bg-surface border-border text-dim"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} strokeWidth={3} /> : idx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-border flex items-center justify-between">
                                            <div className="flex-1 max-w-[120px]">
                                                <div className="flex justify-between text-micro font-medium text-muted uppercase mb-1">
                                                    <span>الإنجاز</span>
                                                    <span className="tabular-nums">{progressPercent}%</span>
                                                </div>
                                                <div className="h-1 bg-hover rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", isLow ? "bg-error" : "bg-info")} style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-center px-2">
                                                <p className="text-micro font-medium text-muted uppercase leading-none mb-0.5">الرصيد</p>
                                                <p className={cn("text-xs font-medium font-mono", isLow ? "text-error" : "text-success")}>{remaining}</p>
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
                        className="w-full h-14 bg-primary-soft border-2 border-primary rounded-2xl flex items-center justify-between px-6 hover:bg-primary-light hover:border-primary transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-l from-primary to-primary-light flex items-center justify-center text-on-primary shadow-sm">
                                <Clock size={18} />
                            </div>
                            <div className="text-right">
                                <p className="text-micro font-bold text-main uppercase tracking-widest">سجل النشاطات المفصل</p>
                                <p className="text-micro font-medium text-primary uppercase tracking-widest mt-0.5">عرض آخر {teacherSessions.length} عملية</p>
                            </div>
                        </div>
                        <CheckCircle2 size={16} className="text-primary" />
                    </button>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}

            {/* Detailed Activity Modal */}
            {showActivityModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12" dir="rtl">
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowActivityModal(false)}></div>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-card border border-border shadow-xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
                        <div className="p-4 bg-gradient-to-br from-primary to-primary-light text-on-primary flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-sm">
                                    <Clock size={20} className="text-on-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-tighter text-on-primary">سجل نشاطات المعلمة</h3>
                                    <p className="text-micro text-on-primary opacity-60 font-medium uppercase tracking-widest">{teacher.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivityModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-error rounded-xl transition-all">
                                <X size={18} className="text-on-primary" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-surface">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {teacherSessions.map(session => (
                                    <div key={session.id} className="bg-card border border-border p-3 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className={cn(
                                            "absolute top-0 right-0 w-1 h-full rounded-e-full",
                                            session.status === 'completed' ? "bg-success" : "bg-error"
                                        )} />
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-surface rounded-xl flex items-center justify-center text-dim group-hover:bg-primary group-hover:text-on-primary transition-all">
                                                    <Calendar size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-micro font-medium text-main uppercase tracking-tight truncate">{session.studentName}</p>
                                                    <p className="text-micro font-medium text-muted uppercase tracking-widest">{session.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <div className="flex items-center gap-1.5 text-micro font-medium text-muted uppercase tracking-widest">
                                                <Clock size={8} /> {session.time}
                                            </div>
                                            {!isTeacherView && (
                                                <button onClick={() => onDeleteSession(session.id)} className="w-6 h-6 flex items-center justify-center text-dim hover:text-error rounded-lg transition-colors">
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
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};
