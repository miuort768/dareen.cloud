import { CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment } from '../../../types';

interface TeacherEnrollmentListProps {
    enrolledStudents: Student[];
    teacherId: string;
    teacherName: string;
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onUnenroll: (student: Student, teacherName: string) => void;
    isTeacherView: boolean;
}

export const TeacherEnrollmentList = ({ enrolledStudents, teacherId, teacherName, onLogAttendance, onUnenroll, isTeacherView }: TeacherEnrollmentListProps) => (
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
                    (e.teacherId && e.teacherId === teacherId) || e.teacher === teacherName
                ) ?? { sessionsUsed: 0, sessionsTotal: 0, subject: '', isFrozen: false };
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
                                    onClick={() => onLogAttendance(student, enrollment as Enrollment)}
                                    className="w-7 h-7 flex items-center justify-center text-success hover:bg-success hover:text-on-success rounded-card transition-all"
                                    title="تسجيل حضور"
                                    aria-label="تسجيل حضور"
                                >
                                    <CheckCircle2 size={14} />
                                </button>
                                {!isTeacherView && (
                                    <button
                                        onClick={() => onUnenroll(student, teacherName)}
                                        className="w-7 h-7 flex items-center justify-center text-error hover:bg-error hover:text-on-error rounded-card transition-all"
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
                                                ? "bg-success border-success text-on-success shadow-soft"
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
);
