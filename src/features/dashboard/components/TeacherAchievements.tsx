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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-none h-full flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 md:p-7 flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-none text-white flex items-center justify-center border-2 border-slate-950 shadow-md">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-xs md:text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-tight">Performance Indicators</p>
                        </div>
                    </div>
                    {isTeacher && (
                        <div className="p-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 rounded-none">
                             <RankBadge rank={rank} size="sm" />
                        </div>
                    )}
                </div>

                {/* Main Hero Metric - Sharp Brutalist Style */}
                <div className="flex-1 flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-950 rounded-none mb-6 relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-indigo-600" />
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                            {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                            {isTeacher ? (stats.monthNetProfit || 0).toLocaleString() : stats.expectedCollection.toLocaleString()}
                        </h2>
                        <span className="text-sm font-black text-slate-400 uppercase">EGP</span>
                    </div>
                    
                    {isTeacher && (
                        <div className="mt-6 px-4 py-1.5 bg-slate-950 text-white rounded-none border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-transform hover:scale-105 active:scale-95">
                            <span className="text-[10px] font-black">{stats.teacherPoints || 0} XP EXPERTISE</span>
                        </div>
                    )}
                </div>

                {/* Bottom Alert Counters - High Density */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900 border-2 border-rose-600 rounded-none flex flex-col gap-2 relative">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-rose-600 text-white rounded-none flex items-center justify-center border-2 border-slate-950">
                                <AlertCircle size={14} />
                            </div>
                            <span className="text-[8px] font-black text-rose-600 uppercase">Expired</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{expiredCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Users</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-none flex flex-col gap-2 relative">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-amber-500 text-white rounded-none flex items-center justify-center border-2 border-slate-950">
                                <Clock size={14} />
                            </div>
                            <span className="text-[8px] font-black text-amber-500 uppercase">Pending</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{lowCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Users</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};
