import { Award, AlertCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../../config/constants';
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
        <div>
            <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-bold text-main flex items-center gap-2">
                        <Star size={13} className="text-warning" />
                        {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
                    </h3>
                    {isTeacher && (
                        <RankBadge rank={rank} size="sm" />
                    )}
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-soft p-5 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                            <TrendingUp size={12} className="text-white/70" />
                            <span className="text-[11px] font-bold text-white/70">
                                {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold tabular-nums text-white">
                                {isTeacher ? (stats.monthNetProfit || 0).toLocaleString('ar-EG') : stats.expectedCollection.toLocaleString('ar-EG')}
                            </span>
                            <span className="text-[11px] font-bold text-white/70">{CURRENCY_SYMBOL}</span>
                        </div>
                        {isTeacher && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl text-[11px] font-bold text-white">
                                <Award size={10} />
                                {stats.teacherPoints || 0} XP
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-error/10 border border-error/20">
                        <div className="w-9 h-9 rounded-lg bg-error/15 flex items-center justify-center">
                            <AlertCircle size={14} className="text-error" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-error tabular-nums">{expiredCount}</span>
                            <p className="text-[11px] font-bold text-error/70">منتهي</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                        <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
                            <Clock size={14} className="text-warning" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-warning tabular-nums">{lowCount}</span>
                            <p className="text-[11px] font-bold text-warning/70">مستحق</p>
                        </div>
                    </div>
                </div>
            </div>
    );
};