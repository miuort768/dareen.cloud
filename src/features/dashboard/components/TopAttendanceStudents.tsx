import { Trophy, TrendingUp, User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useMemo } from 'react';

interface TopAttendanceStudentsProps {
    sessions: any[];
}

export const TopAttendanceStudents = ({ sessions }: TopAttendanceStudentsProps) => {
    const topPresentStudents = useMemo(() => {
        const studentStats: Record<string, { name: string; count: number }> = {};
        
        sessions.forEach(s => {
            if (['completed', 'مكتملة', 'تمت'].includes(s.status?.toLowerCase())) {
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

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in duration-700" dir="rtl">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none text-white">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">الأكثر حضوراً</h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest italic">Hall of Commitment</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <TrendingUp size={18} />
                </div>
            </div>

            {/* Students List */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {topPresentStudents.length > 0 ? (
                    topPresentStudents.map((stu, i) => (
                        <div 
                            key={i} 
                            className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div className={cn(
                                        "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-sm",
                                        i === 0 ? "bg-amber-400 text-amber-900" :
                                        i === 1 ? "bg-slate-300 text-slate-800" :
                                        i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                    )}>
                                        {i + 1}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{stu.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">طالب متميز</p>
                                </div>
                            </div>
                            
                            <div className="text-left">
                                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">{stu.count}</div>
                                <div className="text-[9px] font-black text-amber-500 uppercase mt-1">حصة مكتملة</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                            <User size={32} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لا توجد بيانات حضور حالياً</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="bg-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">إجمالي الحصص</h4>
                        <p className="text-lg font-black leading-none">{sessions.filter(s => s.status === 'completed').length}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};
