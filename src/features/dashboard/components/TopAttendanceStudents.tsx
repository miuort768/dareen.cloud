import { Trophy, TrendingUp, User, Medal } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Medal size={12} className="text-amber-500" />
                    الأكثر حضوراً
                </h3>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp size={13} className="text-amber-500" />
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div
                            key={i}
                            onClick={() => onStudentClick?.({ id: stu.name, name: stu.name })}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black",
                                    i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                                    i === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200" :
                                    i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                                    "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                                )}>
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{stu.name}</p>
                                    <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500">أداء متميز</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{stu.count}</span>
                                <span className="text-[8px] font-bold text-amber-500 mr-1">حصة</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                            <User size={18} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">لا توجد سجلات حالياً</p>
                    </div>
                )}
            </div>

            <div className="mt-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 text-white flex items-center justify-between">
                <div>
                    <p className="text-[8px] font-bold text-amber-100">إجمالي حصص الشهر</p>
                    <p className="text-lg font-black tabular-nums">{totalMonthSessions}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp size={15} className="text-white" />
                </div>
            </div>
        </div>
    );
};
