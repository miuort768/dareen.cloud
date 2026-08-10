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
        <div>
            <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-muted dark:text-zinc-400 flex items-center gap-1.5">
                    <Medal size={11} className="text-warning dark:text-[#D4AF37]" />
                    الأكثر حضوراً
                </h3>
                <div className="w-6 h-6 rounded-lg bg-warning-soft dark:bg-[#D4AF37]/10 flex items-center justify-center">
                    <TrendingUp size={11} className="text-warning dark:text-[#D4AF37]" />
                </div>
            </div>

            <div className="space-y-1.5">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div
                            key={`att-${i}`}
                            onClick={() => onStudentClick?.({ id: stu.id, name: stu.name })}
                            className="flex items-center justify-between p-2 rounded-xl bg-background dark:bg-[#0a0a0c] border border-border dark:border-[#D4AF37]/20 hover:border-warning dark:hover:border-[#D4AF37]/40 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-micro font-semibold",
                                    i === 0 ? "bg-warning-soft dark:bg-[#D4AF37]/10 text-warning dark:text-[#D4AF37]" :
                                    i === 1 ? "bg-surface dark:bg-[#1a1a1e] text-main dark:text-white" :
                                    i === 2 ? "bg-warning-soft dark:bg-[#D4AF37]/10 text-warning dark:text-[#D4AF37]" :
                                    "bg-surface dark:bg-[#1a1a1e] text-muted dark:text-zinc-400"
                                )}>
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-micro font-bold text-main dark:text-white truncate">{stu.name}</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-bold text-main dark:text-white tabular-nums">{stu.count}</span>
                                <span className="text-micro font-bold text-warning dark:text-[#D4AF37]">حصة</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 opacity-50">
                        <div className="w-8 h-8 rounded-xl bg-surface dark:bg-[#1a1a1e] flex items-center justify-center mb-1.5">
                            <User size={14} className="text-dim dark:text-zinc-500" />
                        </div>
                        <p className="text-micro font-bold text-muted dark:text-zinc-400">لا توجد سجلات حالياً</p>
                    </div>
                )}
            </div>

            <div className="mt-2.5 bg-warning dark:bg-[#D4AF37] p-2.5 text-on-warning rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-micro font-bold text-on-warning">إجمالي حصص الشهر</p>
                    <p className="text-base font-bold tabular-nums">{totalMonthSessions}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/15 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp size={12} className="text-on-warning dark:text-black" />
                </div>
            </div>
        </div>
    );
};
