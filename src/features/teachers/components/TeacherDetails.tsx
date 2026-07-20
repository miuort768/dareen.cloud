import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, MessageCircle, Clock } from 'lucide-react';
import type { Teacher, Session } from '../types';
import type { Student, Enrollment } from '../../../types';
import { TeacherCard } from './TeacherCard';
import { TeacherPerformanceGauge } from './TeacherPerformanceGauge';
import { TeacherEnrollmentList } from './TeacherEnrollmentList';
import { TeacherActivityModal } from './TeacherActivityModal';

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
                            <h3 className="text-card-title font-bold font-heading text-main truncate">{teacher.name}</h3>
                            <span className="text-xs text-on-primary/70 px-2 py-0.5 bg-error text-on-error rounded-xl">{teacher.subject}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isTeacherView && (
                            <>
                                <button onClick={() => onSendNotification(teacher)} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-warning hover:text-on-warning text-main rounded-card transition-all" title="إرسال إشعار" aria-label="إرسال إشعار"><Bell size={16} /></button>
                                <button onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-success hover:text-on-success text-main rounded-card transition-all" title="مراسلة" aria-label="مراسلة"><MessageCircle size={16} /></button>
                            </>
                        )}
                        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-error hover:text-on-error text-main rounded-card transition-all" title="إغلاق" aria-label="إغلاق"><X size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                <TeacherPerformanceGauge monthlySessions={monthlySessions} prevMonthSessions={prevMonthSessions} performanceChange={performanceChange} />

                <TeacherEnrollmentList enrolledStudents={enrolledStudents} teacherId={teacher.id} teacherName={teacher.name} onLogAttendance={onLogAttendance} onUnenroll={onUnenroll} isTeacherView={isTeacherView} />

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
                        <Clock size={16} className="text-primary" />
                    </button>
                </div>
            </div>

            {showCard && <TeacherCard teacher={teacher} onClose={() => setShowCard(false)} />}

            <TeacherActivityModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} teacherName={teacher.name} sessions={teacherSessions} isTeacherView={isTeacherView} onDeleteSession={onDeleteSession} />
        </div>
    );
};
