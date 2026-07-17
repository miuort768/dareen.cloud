import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, History, Users } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { triggerHaptic } from '../../../../lib/haptics';
import type { Student, Enrollment, Session } from '../../types';

interface AdminAttendanceViewProps {
    uniqueTeachers: string[];
    filterTeacher: string;
    students: Student[];
    searchTerm: string;
    filteredSessions: Session[];
    date: string;
    onLog: (student: Student, enrollment: Enrollment) => void;
    onViewHistory: (studentId: string, studentName: string, grade?: string, subject?: string) => void;
}

const getGradeDisplay = (studentName: string, grade?: string) => {
    if (!grade) return studentName.charAt(0);
    const numMatch = grade.match(/\d+/);
    if (numMatch) return numMatch[0];
    const mapping: Record<string, string> = {
        'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
        'السابع': '7', 'الثامن': '8', 'التاسع': '9', 'العاشر': '10'
    };
    for (const [key, val] of Object.entries(mapping)) {
        if (grade.includes(key)) return val;
    }
    return studentName.charAt(0);
};

export const AdminAttendanceView = ({ uniqueTeachers, filterTeacher, students, searchTerm, filteredSessions, date, onLog, onViewHistory }: AdminAttendanceViewProps) => {
    const visibleTeachers = uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher);
    if (visibleTeachers.length === 0) {
        return (
            <div className="py-12 text-center bg-card rounded-card border border-dashed border-border/50">
                <Users className="mx-auto mb-2 text-dim" size={28} strokeWidth={1.5} />
                <p className="text-xs font-bold text-muted">لا يوجد طلاب متاحون</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {visibleTeachers.map(teacher => {
                const teacherStudents = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                const filtered = teacherStudents.filter(s =>
                    (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                    s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                );
                if (filtered.length === 0) return null;
                return (
                    <div key={teacher} className="bg-card rounded-card shadow-soft border border-border/50 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-micro font-black bg-primary-soft text-primary">{teacher.charAt(0)}</div>
                                <span className="text-xs font-bold text-main">{teacher}</span>
                            </div>
                            <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-primary-soft text-primary">{filtered.length} طالب</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {filtered.map(student => {
                                const enrollment = student.enrollments.find(e => e.teacher === teacher)!;
                                const session = filteredSessions.find(s =>
                                    s.studentId === student.id && s.teacherName === teacher && s.subject === enrollment.subject
                                );
                                const used = enrollment.sessionsUsed || 0;
                                const total = enrollment.sessionsTotal || 1;
                                const progressPct = Math.min(100, Math.round((used / total) * 100));
                                return (
                                    <motion.div key={`${student.id}-${enrollment.subject}`} whileTap={{ scale: 0.98 }}
                                        className="p-3 rounded-xl border border-border space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black bg-primary-soft text-primary">
                                                    {getGradeDisplay(student.name, student.grade)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-main">{student.name}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-micro font-bold text-muted px-1 py-0.5 rounded border border-border">{student.grade}</span>
                                                        <span className="text-micro font-bold text-primary flex items-center gap-0.5">
                                                            <BookOpen size={8} /> {enrollment.subject}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {session ? (
                                                <span className={cn("text-micro font-bold px-2 py-0.5 rounded-lg",
                                                    session.status === 'completed' ? 'bg-success-soft text-success' :
                                                    session.status === 'cancelled' ? 'bg-error-soft text-error' : 'bg-warning-soft text-warning')}>
                                                    {session.status === 'completed' ? 'تم' : session.status === 'cancelled' ? 'غائب' : 'مجدول'}
                                                </span>
                                            ) : (
                                                <span className="text-micro font-bold px-2 py-0.5 rounded-lg bg-warning-soft text-warning">انتظار</span>
                                            )}
                                        </div>
                                        <div className="h-1 bg-surface rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-700",
                                                progressPct > 85 ? 'bg-error' : progressPct > 60 ? 'bg-warning' : 'bg-success'
                                            )} style={{ width: `${progressPct}%` }} />
                                        </div>
                                        <div className="flex gap-1.5">
                                            <motion.button whileTap={{ scale: 0.93 }}
                                                onClick={() => { triggerHaptic('light'); onLog(student, enrollment); }}
                                                className="flex-1 py-2 bg-success text-on-primary text-micro font-bold rounded-xl flex items-center justify-center gap-1">
                                                <CheckCircle2 size={11} /> حضور
                                            </motion.button>
                                            <motion.button whileTap={{ scale: 0.93 }}
                                                onClick={() => onViewHistory(student.id, student.name, student.grade, enrollment.subject)}
                                                className="flex-1 py-2 bg-primary text-on-primary text-micro font-bold rounded-xl flex items-center justify-center gap-1">
                                                <History size={11} /> السجل
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
