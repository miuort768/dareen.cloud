import { BookOpen, History } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SectionCard } from './StyledComponents';
import type { Student, Enrollment, Session } from '../../features/attendance/types';
import { ProgressBar } from '../../shared/components/ui';

interface AdminTeacherGroupListProps {
    uniqueTeachers: string[];
    filterTeacher: string;
    students: Student[];
    searchTerm: string;
    filteredSessions: Session[];
    date: string;
    isLogging: boolean;
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onViewHistory: (studentId: string, studentName: string, grade?: string, subject?: string) => void;
    onUpdateStatus: (id: string, status: Session['status']) => void;
}

const getGradeDisplay = (studentName: string, grade?: string) => {
    if (!grade) return studentName.charAt(0);
    const mapping: Record<string, string> = {
        'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
        'السابع': '7', 'الثامن': '8', 'التاسع': '9', 'العاشر': '10'
    };
    const numMatch = grade.match(/\d+/);
    if (numMatch) return numMatch[0];
    for (const [key, val] of Object.entries(mapping)) {
        if (grade.includes(key)) return val;
    }
    return studentName.charAt(0);
};

export const AdminTeacherGroupList = ({ uniqueTeachers, filterTeacher, students, searchTerm, filteredSessions, isLogging, onLogAttendance, onViewHistory }: AdminTeacherGroupListProps) => {
    const visibleTeachers = uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher);
    if (visibleTeachers.length === 0) return null;

    return (
        <div className="space-y-6">
            {visibleTeachers.map(teacher => {
                const teacherStudentsList = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                const filtered = teacherStudentsList.filter(s =>
                    (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                    s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                );
                if (filtered.length === 0) return null;

                return (
                    <SectionCard key={teacher} className="p-0 overflow-hidden">
                        <div className="bg-primary px-5 py-3 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm bg-white/15 text-on-primary">
                                    {teacher.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-on-primary">قائمة الطلاب: {teacher}</h3>
                                    <p className="text-micro font-bold text-on-primary/70 tracking-wider">إدارة الحصص والتحضير</p>
                                </div>
                            </div>
                            <div className="text-micro font-bold px-3 py-1 rounded-lg bg-white/15 text-on-primary">
                                {filtered.length} طالب
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(student => {
                                const enrollment = student.enrollments.find(e => e.teacher === teacher)!;
                                const session = filteredSessions.find(s =>
                                    s.studentId === student.id && s.teacherName === teacher && s.subject === enrollment.subject
                                );

                                if (session) {
                                    return (
                                        <div key={session.id} className="bg-card border border-border shadow-sm rounded-2xl p-5 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-sm font-black">
                                                        {getGradeDisplay(student.name, student.grade)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-main text-xs mb-1">{student.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-micro font-bold text-muted bg-card px-1.5 py-0.5 rounded-lg border border-border">{student.grade}</span>
                                                            <p className="text-micro font-bold text-muted flex items-center gap-1">
                                                                <BookOpen size={10} className="text-primary" /> {enrollment.subject}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={cn("text-micro font-bold px-2 py-0.5 rounded-lg",
                                                    session.status === 'completed' ? 'bg-success-soft text-success' :
                                                    session.status === 'cancelled' ? 'bg-error-soft text-error' : 'bg-warning-soft text-warning')}>
                                                    {session.status === 'completed' ? 'تم' : session.status === 'cancelled' ? 'غائب' : 'مجدول'}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-micro font-bold uppercase text-muted">
                                                    <span>تغطية الحصص</span>
                                                    <span className="text-main tabular-nums">{enrollment.sessionsUsed} / {enrollment.sessionsTotal}</span>
                                                </div>
                                                <ProgressBar value={Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)} variant="attendance" />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-micro font-bold text-muted">{session.time}</span>
                                                <div className={cn("w-2 h-2 rounded-full",
                                                    session.status === 'completed' ? 'bg-success' : session.status === 'cancelled' ? 'bg-error' : 'bg-warning')} />
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={`${student.id}-${enrollment.subject}`} className="bg-card border border-border shadow-sm rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-sm font-black">
                                                    {getGradeDisplay(student.name, student.grade)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-main text-xs mb-1">{student.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-micro font-bold text-muted bg-card px-1.5 py-0.5 rounded-lg border border-border">{student.grade}</span>
                                                        <p className="text-micro font-bold text-muted flex items-center gap-1">
                                                            <BookOpen size={10} className="text-primary" /> {enrollment.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-micro font-bold px-2 py-0.5 rounded-lg uppercase animate-pulse bg-warning-soft text-warning-dark">انتظار</div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-micro font-bold uppercase text-muted">
                                                <span>تغطية الحصص</span>
                                                <span className="text-main tabular-nums">{enrollment.sessionsUsed} / {enrollment.sessionsTotal}</span>
                                            </div>
                                            <ProgressBar value={Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)} variant="attendance" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => onLogAttendance(student, enrollment)}
                                                disabled={isLogging}
                                                className="py-2.5 bg-success hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-success font-bold text-micro rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95">
                                                حضور
                                            </button>
                                            <button onClick={() => onLogAttendance(student, enrollment)}
                                                disabled={isLogging}
                                                className="py-2.5 bg-error hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-error font-bold text-micro rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95">
                                                غياب
                                            </button>
                                        </div>
                                        <button onClick={() => onViewHistory(student.id, student.name, student.grade, enrollment.subject)}
                                            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-micro rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                                            <History size={14} /> سجل الطالب
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                );
            })}
        </div>
    );
};
