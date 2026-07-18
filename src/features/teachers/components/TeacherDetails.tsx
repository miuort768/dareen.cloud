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
        s.enrollments?.some((e: Enrollment) =>
            (e.teacherId && e.teacherId === teacher.id) || e.teacher === teacher.name
        )
    );

    // Filter sessions for this teacher
    const teacherSessions = sessions
        .filter(s => (s.teacherId && s.teacherId === teacher.id) || s.teacherName === teacher.name)
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
            "bg-card border border-border/50 shadow-soft rounded-card flex flex-col h-fit overflow-hidden",
            "lg:static lg:sticky lg:top-4"
        )} dir="rtl">
            {/* Header Section */}
            <div className="bg-primary px-5 py-5 md:px-7 md:py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-card flex items-center justify-center bg-primary-soft">
                            <span className="font-bold text-xl text-primary">{teacher.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-card-title font-bold font-heading text-on-primary truncate">{teacher.name}</h3>
                            <span className="text-xs text-on-primary/70 px-2 py-0.5 bg-error text-on-primary rounded-xl">{teacher.subject}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isTeacherView && (
                            <>
                                <button onClick={() => onSendNotification(teacher)} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-warning text-on-primary rounded-card transition-all" title="إرسال إشعار" aria-label="إرسال إشعار"><Bell size={16} /></button>
                                <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-success text-on-primary rounded-card transition-all" title="مراسلة" aria-label="مراسلة"><MessageCircle size={16} /></button>
                            </>
                        )}
                        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-error text-on-primary rounded-card transition-all" title="إغلاق" aria-label="إغلاق"><X size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                {/* Performance Gauge */}
                <div className="p-5 bg-card border border-border/50 shadow-soft rounded-card">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-muted mb-1">الإنتاجية (الحالية)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold font-heading text-main">{monthlySessions}</span>
                                <span className="text-xs text-muted">جلسة منجزة</span>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 text-xs rounded-card",
                            performanceChange >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
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
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="bg-card border border-border/50 px-3 py-1 rounded-card">
                            <span className="text-xs text-primary">{enrolledStudents.length}</span>
                        </div>
                        <h4 className="text-xs text-muted">الطلاب المسجلون</h4>
                    </div>
                    <div className="space-y-2">
                        {enrolledStudents.map(student => {
                            const enrollment = student.enrollments.find((e: Enrollment) =>
                                (e.teacherId && e.teacherId === teacher.id) || e.teacher === teacher.name
                            )!;
                            const actualUsed = enrollment.sessionsUsed || 0;
                            const remaining = (enrollment.sessionsTotal || 0) - actualUsed;
                            const isLow = remaining <= 2;
                            const progressPercent = enrollment.sessionsTotal ? Math.round((actualUsed / enrollment.sessionsTotal) * 100) : 0;

                            return (
                                <div key={student.id} className={cn(
                                    "p-3 bg-card border border-border/50 rounded-card transition-all group",
                                    (enrollment as Enrollment).isFrozen && "opacity-50 grayscale",
                                    isLow ? "border-error" : "hover:border-primary/30"
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-medium text-sm text-main">{student.name}</h5>
                                                {isLow && <span className="text-xs text-error bg-error/10 px-1.5 py-0.5 animate-pulse rounded-card">رصيد منخفض</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted bg-card border border-border/50 px-1.5 py-0.5 rounded-card">{student.grade}</span>
                                                <span className="text-xs text-muted">{enrollment.subject}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onLogAttendance(student, enrollment)}
                                                className="w-7 h-7 flex items-center justify-center text-success hover:bg-success hover:text-on-primary rounded-card transition-all"
                                                title="تسجيل حضور"
                                                aria-label="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            {!isTeacherView && (
                                                <button
                                                    onClick={() => onUnenroll(student, teacher.name)}
                                                    className="w-7 h-7 flex items-center justify-center text-error hover:bg-error hover:text-on-primary rounded-card transition-all"
                                                    title="إلغاء التسجيل"
                                                    aria-label="إلغاء التسجيل"
                                                >
                                                    <Trash2 size={14} />
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
                                                        "w-4 h-4 border flex items-center justify-center text-xs font-mono rounded-card transition-all",
                                                        idx < actualUsed 
                                                            ? "bg-success border-success text-on-primary shadow-soft" 
                                                            : idx === actualUsed 
                                                                ? "bg-card border-primary text-primary" 
                                                                : "bg-card border-border/50 text-muted"
                                                    )}
                                                >
                                                    {idx < actualUsed ? <CheckCircle2 size={10} /> : idx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                            <div className="flex-1 max-w-[120px]">
                                                <div className="flex justify-between text-xs text-muted mb-1">
                                                    <span>الإنجاز</span>
                                                    <span className="tabular-nums">{progressPercent}%</span>
                                                </div>
                                                <div className="h-1 bg-hover rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", isLow ? "bg-error" : "bg-info")} style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-center px-2">
                                                <p className="text-xs text-muted leading-none mb-0.5">الرصيد</p>
                                                <p className={cn("text-xs font-mono", isLow ? "text-error" : "text-success")}>{remaining}</p>
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
                        className="w-full py-4 bg-primary-soft border-2 border-primary rounded-card flex items-center justify-between px-6 hover:border-primary-hover transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center group-hover:bg-primary-hover transition-all">
                                <Clock size={18} className="text-on-primary" />
                            </div>
                            <div className="text-start">
                                <p className="text-sm text-main group-hover:text-primary transition-all">سجل النشاطات المفصل</p>
                                <p className="text-xs text-primary mt-0.5">عرض آخر {teacherSessions.length} عملية</p>
                            </div>
                        </div>
                        <CheckCircle2 size={16} className="text-primary" />
                    </button>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}

            {/* Detailed Activity Modal */}
            {showActivityModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12" dir="rtl" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') setShowActivityModal(false); }}>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActivityModal(false)}></div>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-card border border-border/50 shadow-soft w-full max-w-4xl h-full max-h-[85vh] flex flex-col overflow-hidden rounded-card">
                        <div className="bg-primary px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-card flex items-center justify-center bg-primary-soft">
                                    <Clock size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-card-title font-bold font-heading text-on-primary">سجل نشاطات المعلمة</h3>
                                    <p className="text-xs text-on-primary/70">{teacher.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivityModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-error rounded-card transition-all" aria-label="إغلاق">
                                <X size={18} className="text-on-primary" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-card">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {teacherSessions.map(session => (
                                    <div key={session.id} className="bg-card border border-border/50 shadow-soft p-3 rounded-card hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                        <div className={cn(
                                            "absolute top-0 start-0 w-1 h-full rounded-s-full",
                                            session.status === 'completed' ? "bg-success" : "bg-error"
                                        )} />
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-card flex items-center justify-center bg-primary-soft text-primary">
                                                    <Calendar size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-main truncate">{session.studentName}</p>
                                                    <p className="text-xs text-muted">{session.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                            <div className="flex items-center gap-1.5 text-xs text-muted">
                                                <Clock size={8} /> {session.time}
                                            </div>
                                            {!isTeacherView && (
                                                <button onClick={() => onDeleteSession(session.id)} className="w-6 h-6 flex items-center justify-center text-muted hover:text-error rounded transition-colors" aria-label="حذف">
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
                                    <p className="text-xs">لا توجد نشاطات مسجلة</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};
