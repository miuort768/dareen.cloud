import { TrendingUp, Award, AlertCircle, Clock } from 'lucide-react';
import type { DashboardStats as Stats, LowBalanceStudent } from '../types';
import { getRankByPoints, TEACHER_RANKS } from '../../../shared/utils/ranks';
import { RankBadge } from '../../../shared/components/RankBadge';
interface TeacherAchievementsProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
    isTeacher: boolean;
}

export const TeacherAchievements = ({ stats, lowBalanceStudents, isTeacher }: TeacherAchievementsProps) => {
    const rank = getRankByPoints(stats.teacherPoints || 0, TEACHER_RANKS);
    const expiredCount = lowBalanceStudents.filter(s => s.remainingSessions === 0).length;
    const lowCount = lowBalanceStudents.filter(s => s.remainingSessions > 0).length;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none h-full flex flex-col overflow-hidden shadow-sm transition-all">
            <div className="p-6 md:p-7 flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-xs md:text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                إنجازاتك التعليمية
                            </h3>
                            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-tight">{isTeacher ? 'مؤشرات الأداء المهني' : 'ملخص الأداء والإنجاز'}</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none shadow-sm">
                             <RankBadge rank={rank} size="sm" />
                        </div>
                    )}
                </div>

                {/* Main Hero Metric */}
                <div className="flex-1 flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-none mb-6 relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي الإنجاز المالي'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tabular-nums">
                            {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()}
                        </h2>
                        <span className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase">ج.م</span>
                    </div>
                    
                    {isTeacher && (
                        <div className="mt-6 px-4 py-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-none border border-slate-900 dark:border-slate-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white">
                            <span className="text-[10px] font-medium">{stats.teacherPoints || 0} XP EXPERTISE</span>
                        </div>
                    )}
                </div>

                {/* Bottom Alert Counters */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-r-4 border-r-rose-600 rounded-none flex flex-col gap-2 relative shadow-sm hover:border-rose-600/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-none flex items-center justify-center border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20">
                                <AlertCircle size={14} />
                            </div>
                            <span className="text-[8px] font-medium text-rose-600 uppercase">منتهي</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-medium text-slate-900 dark:text-white tabular-nums">{expiredCount}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal uppercase">طلاب</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-r-4 border-r-amber-500 rounded-none flex flex-col gap-2 relative shadow-sm hover:border-amber-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-none flex items-center justify-center border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20">
                                <Clock size={14} />
                            </div>
                            <span className="text-[8px] font-medium text-amber-500 uppercase">مستحق قريب</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-medium text-slate-900 dark:text-white tabular-nums">{lowCount}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal uppercase">طلاب</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
