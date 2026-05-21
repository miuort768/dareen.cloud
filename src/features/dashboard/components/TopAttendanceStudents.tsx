import { Trophy, TrendingUp, User } from 'lucide-react';
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
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
        
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none shadow-sm flex flex-col h-full overflow-hidden transition-all" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">الأكثر حضوراً</h3>
                        <p className="text-[9px] font-black text-amber-500 mt-0.5 uppercase tracking-tight flex items-center gap-1.5">
                            قادة الحضور والالتزام
                        </p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-none border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <TrendingUp size={16} />
                </div>
            </div>

            {/* Students List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div 
                            key={i} 
                            onClick={() => onStudentClick?.({ id: stu.name, name: stu.name })}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-500/50 transition-all rounded-none group relative overflow-hidden cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-none flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <div className={cn(
                                        "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-none flex items-center justify-center text-[9px] font-black border border-slate-200 dark:border-slate-700 shadow-sm",
                                        i === 0 ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30" :
                                        i === 1 ? "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500" :
                                        i === 2 ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30" : "bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                        {i + 1}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase tracking-tight truncate">{stu.name}</h4>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">أداء متميز</p>
                                </div>
                            </div>
                            
                            <div className="text-left">
                                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stu.count}</div>
                                <div className="text-[8px] font-black text-amber-500 uppercase mt-1">حصة</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 opacity-40">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none flex items-center justify-center mb-4">
                            <User size={24} className="text-slate-300" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">لا توجد سجلات حالياً</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="mt-6">
                <div className="bg-indigo-600 dark:bg-indigo-750 border border-indigo-500 rounded-none p-4 text-white flex items-center justify-between shadow-sm transition-transform hover:translate-y-[-2px]">
                    <div>
                        <h4 className="text-[9px] font-black uppercase opacity-80 mb-0.5">إجمالي حصص الشهر</h4>
                        <p className="text-xl font-black tabular-nums leading-none">{totalMonthSessions}</p>
                    </div>
                    <div className="w-9 h-9 bg-white/10 rounded-none flex items-center justify-center border border-white/20">
                        <TrendingUp size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};
