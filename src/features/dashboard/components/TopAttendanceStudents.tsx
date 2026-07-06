import { TrendingUp, User, Medal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useMemo } from 'react';

interface TopAttendanceStudentsProps {
    sessions: { id?: string; status?: string; date?: string; studentId?: string; studentName?: string }[];
    onStudentClick?: (student: { id?: string; name?: string }) => void;
}

export const TopAttendanceStudents = ({ sessions, onStudentClick }: TopAttendanceStudentsProps) => {
    const topPresentStudents = useMemo(() => {
        const studentStats: Record<string, { name: string; count: number }> = {};
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);

        sessions.forEach(s => {
            const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(s.status?.toLowerCase());
            const isThisMonth = s.date?.startsWith(currentMonth);

            if (isCompleted && isThisMonth) {
                const id = s.studentId || s.studentName;
                if (!studentStats[id]) {
                    studentStats[id] = { name: s.studentName, count: 0 };
                }
                studentStats[id].count += 1;
            }
        });

        return Object.values(studentStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [sessions]);

    const totalMonthSessions = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return sessions.filter(s =>
            ['completed', 'مكتملة', 'تمت'].includes(s.status?.toLowerCase()) &&
            s.date?.startsWith(currentMonth)
        ).length;
    }, [sessions]);

    return (
        <div className="bg-white dark:bg-primary-active rounded-2xl p-3.5 shadow-sm border border-border dark:border-border">
            <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-bold text-muted dark:text-muted flex items-center gap-1.5">
                    <Medal size={11} className="text-warning" />
                    الأكثر حضوراً
                </h3>
                <div className="w-6 h-6 rounded-lg bg-warning-light dark:bg-warning/10 flex items-center justify-center">
                    <TrendingUp size={11} className="text-warning" />
                </div>
            </div>

            <div className="space-y-1.5">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div
                            key={i}
                            onClick={() => onStudentClick?.({ id: stu.name, name: stu.name })}
                            className="flex items-center justify-between p-2 rounded-xl bg-background dark:bg-primary-active/50 border border-border dark:border-border hover:border-warning dark:hover:border-warning/30 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-black",
                                    i === 0 ? "bg-warning-light text-warning dark:bg-warning/20 dark:text-warning" :
                                    i === 1 ? "bg-surface text-main dark:bg-card dark:text-dim" :
                                    i === 2 ? "bg-warning-light text-warning dark:bg-warning/20 dark:text-warning" :
                                    "bg-surface dark:bg-primary-active text-muted dark:text-muted"
                                )}>
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-main dark:text-dim truncate">{stu.name}</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-main dark:text-on-primary tabular-nums">{stu.count}</span>
                                <span className="text-[7px] font-bold text-warning">حصة</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 opacity-50">
                        <div className="w-8 h-8 rounded-xl bg-surface dark:bg-primary-active flex items-center justify-center mb-1.5">
                            <User size={14} className="text-dim dark:text-muted" />
                        </div>
                        <p className="text-[9px] font-bold text-muted">لا توجد سجلات حالياً</p>
                    </div>
                )}
            </div>

            <div className="mt-2.5 bg-gradient-to-br from-[var(--bg-warning)] to-[var(--bg-warning)] rounded-xl p-2.5 text-on-primary flex items-center justify-between">
                <div>
                    <p className="text-[7px] font-bold text-warning">إجمالي حصص الشهر</p>
                    <p className="text-base font-black tabular-nums">{totalMonthSessions}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp size={12} className="text-on-primary" />
                </div>
            </div>
        </div>
    );
};
