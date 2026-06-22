import { TrendingUp, Award, AlertCircle, Clock, Star } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Star size={12} className="text-amber-500" />
                    {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
                </h3>
                {isTeacher && (
                    <RankBadge rank={rank} size="sm" />
                )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 mb-3 text-white">
                <div className="flex items-center gap-1.5 mb-2">
                    <Award size={12} className="text-indigo-200" />
                    <span className="text-[9px] font-bold text-indigo-100">
                        {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tabular-nums">
                        {isTeacher ? (stats.monthNetProfit || 0).toLocaleString('ar-EG') : stats.expectedCollection.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-200">ج.م</span>
                </div>
                {isTeacher && (
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-[9px] font-bold text-white">
                        <Award size={10} />
                        {stats.teacherPoints || 0} XP
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                        <AlertCircle size={13} className="text-rose-500" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-rose-700 dark:text-rose-300 tabular-nums">{expiredCount}</span>
                        <p className="text-[8px] font-bold text-rose-500">منتهي</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                        <Clock size={13} className="text-amber-500" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-amber-700 dark:text-amber-300 tabular-nums">{lowCount}</span>
                        <p className="text-[8px] font-bold text-amber-500">مستحق</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
