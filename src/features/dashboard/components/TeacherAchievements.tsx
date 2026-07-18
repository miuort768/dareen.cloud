import { Award, AlertCircle, Clock, Star } from 'lucide-react';
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
        <div className="bg-card rounded-card p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-muted flex items-center gap-2">
                    <Star size={12} className="text-warning" />
                    {isTeacher ? 'إنجازاتك التعليمية' : 'التحصيل المالي'}
                </h3>
                {isTeacher && (
                    <RankBadge rank={rank} size="sm" />
                )}
            </div>

            <div className="bg-primary rounded-card p-4 mb-3 text-on-primary">
                <div className="flex items-center gap-1.5 mb-2">
                    <Award size={12} className="text-primary" />
                    <span className="text-micro font-bold text-primary">
                        {isTeacher ? 'صافي أرباح الشهر (تقديري)' : 'إجمالي التحصيل المستهدف'}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tabular-nums">
                        {isTeacher ? (stats.monthNetProfit || 0).toLocaleString('ar-EG') : stats.expectedCollection.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-micro font-bold text-primary">ج.م</span>
                </div>
                {isTeacher && (
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-micro font-bold text-on-primary">
                        <Award size={10} />
                        {stats.teacherPoints || 0} XP
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-error-soft border border-error">
                    <div className="w-8 h-8 rounded-lg bg-error-soft flex items-center justify-center">
                        <AlertCircle size={13} className="text-error" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-error tabular-nums">{expiredCount}</span>
                        <p className="text-micro font-bold text-error">منتهي</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-warning-soft border border-warning">
                    <div className="w-8 h-8 rounded-lg bg-warning-soft flex items-center justify-center">
                        <Clock size={13} className="text-warning" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-warning tabular-nums">{lowCount}</span>
                        <p className="text-micro font-bold text-warning">مستحق</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
