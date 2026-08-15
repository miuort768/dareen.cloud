import { TrendingUp, User, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TopAttendanceStudentsProps {
    sessions: { id?: string; status?: string; date?: string; studentId?: string; studentName?: string }[];
    onStudentClick?: (student: { id?: string; name?: string }) => void;
}

export const TopAttendanceStudents = ({ sessions, onStudentClick }: TopAttendanceStudentsProps) => {
    const topPresentStudents = useMemo(() => {
        const studentStats: Record<string, { id: string; name: string; count: number }> = {};
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);

        sessions.forEach(s => {
            const isCompleted = ['completed', 'مكتملة', 'تمت'].includes(s.status?.toLowerCase());
            const isThisMonth = s.date?.startsWith(currentMonth);

            if (isCompleted && isThisMonth) {
                const id = s.studentId || s.studentName;
                if (!studentStats[id]) {
                    studentStats[id] = { id, name: s.studentName, count: 0 };
                }
                studentStats[id].count += 1;
            }
        });

        return Object.values(studentStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    }, [sessions]);

    const totalMonthSessions = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return sessions.filter(s =>
            ['completed', 'مكتملة', 'تمت'].includes(s.status?.toLowerCase()) &&
            s.date?.startsWith(currentMonth)
        ).length;
    }, [sessions]);

    return (
        <div>
            <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-muted dark:text-muted flex items-center gap-1.5">
                    <Medal size={11} className="text-warning dark:text-primary" />
                    الأكثر حضوراً
                </h3>
                <div className="w-6 h-6 rounded-lg bg-warning-soft dark:bg-primary/10 flex items-center justify-center">
                    <TrendingUp size={11} className="text-warning dark:text-primary" />
                </div>
            </div>

            <div className="space-y-1.5">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div
                            key={`att-${i}`}
                            onClick={() => onStudentClick?.({ id: stu.id, name: stu.name })}
                            className="flex items-center justify-between p-2 rounded-xl bg-background dark:bg-card border border-border dark:border-border hover:border-warning dark:hover:border-border transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-micro font-semibold",
                                    i === 0 ? "bg-warning-soft dark:bg-primary/10 text-warning dark:text-primary" :
                                    i === 1 ? "bg-surface dark:bg-surface text-main dark:text-main" :
                                    i === 2 ? "bg-warning-soft dark:bg-primary/10 text-warning dark:text-primary" :
                                    "bg-surface dark:bg-surface text-muted dark:text-muted"
                                )}>
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-micro font-bold text-main dark:text-main truncate">{stu.name}</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-bold text-main dark:text-main tabular-nums">{stu.count}</span>
                                <span className="text-micro font-bold text-warning dark:text-primary">حصة</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 opacity-50">
                        <div className="w-8 h-8 rounded-xl bg-surface dark:bg-surface flex items-center justify-center mb-1.5">
                            <User size={14} className="text-dim dark:text-dim" />
                        </div>
                        <p className="text-micro font-bold text-muted dark:text-muted">لا توجد سجلات حالياً</p>
                    </div>
                )}
            </div>

            <div className="mt-2.5 bg-warning dark:bg-primary p-2.5 text-on-warning rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-micro font-bold text-on-warning">إجمالي حصص الشهر</p>
                    <p className="text-base font-bold tabular-nums">{totalMonthSessions}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/15 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp size={12} className="text-on-warning dark:text-on-primary" />
                </div>
            </div>
        </div>
    );
};
