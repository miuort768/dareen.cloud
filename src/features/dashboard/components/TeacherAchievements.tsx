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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-xl h-full flex flex-col overflow-hidden animate-in fade-in duration-700">
            <div className="p-5 md:p-8 flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-xs md:text-base text-slate-900 dark:text-white leading-tight">
                                {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي المتوقع'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">مؤشرات الأداء السنوية</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                             <RankBadge rank={rank} size="md" />
                        </div>
                    )}
                </div>

                {/* Main Hero Metric */}
                <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-8 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-900 rounded-3xl mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                    
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()}
                        </h2>
                        <span className="text-lg font-black text-slate-300 dark:text-slate-600 uppercase">EGP</span>
                    </div>
                    
                    {isTeacher && (
                        <div className="mt-6 px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-indigo-500/10 hover:scale-105 transition-transform active:scale-95">
                            <span className="text-[11px] font-black tracking-widest">{stats.teacherPoints || 0} XP EXPERTISE</span>
                        </div>
                    )}
                </div>

                {/* Bottom Alert Counters */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="w-7 h-7 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg flex items-center justify-center">
                                <AlertCircle size={14} />
                            </div>
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">تنبيه انتهاء</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{expiredCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold">طالب</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg flex items-center justify-center">
                                <Clock size={14} />
                            </div>
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">على وشك</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{lowCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold">طالب</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
