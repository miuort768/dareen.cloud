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
        <div className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm rounded-none h-full flex flex-col overflow-hidden animate-in fade-in duration-700">
            {/* Upper Header Decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600"></div>
            
            <div className="p-3 md:p-6 flex flex-col h-full uppercase tracking-tighter">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-slate-900 dark:text-white leading-none">
                                {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي المتوقع'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">KPI Performance</span>
                            </div>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
                             <RankBadge rank={rank} size="md" />
                        </div>
                    )}
                </div>

                {/* Main Hero Metric */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-6 border-y border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 mb-4 md:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">
                            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()}
                        </h2>
                        <span className="text-lg font-black text-slate-300 dark:text-slate-600 tracking-normal uppercase">EGP</span>
                    </div>
                    
                    {isTeacher && (
                        <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent shadow-lg shadow-indigo-500/10 transition-transform hover:scale-105 group">
                            <span className="text-[11px] font-black tracking-widest">مستوى الخبرة: {stats.teacherPoints || 0} XP</span>
                        </div>
                    )}
                    </div>

                {/* Bottom Alert Counters */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {/* Expired Slot */}
                    <div className="p-2.5 md:p-4 border border-slate-200 dark:border-slate-800 group hover:border-rose-500 transition-colors bg-white dark:bg-transparent">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 flex items-center justify-center">
                                <AlertCircle size={14} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 tracking-widest">تنبيه انتهاء</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{expiredCount}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">طلاب</span>
                        </div>
                    </div>

                    {/* Low Balance Slot */}
                    <div className="p-2.5 md:p-4 border border-slate-200 dark:border-slate-800 group hover:border-amber-500 transition-colors bg-white dark:bg-transparent">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-amber-50 dark:bg-amber-900/10 text-amber-600 flex items-center justify-center">
                                <Clock size={14} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 tracking-widest">على وشك</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{lowCount}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">طلاب</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
