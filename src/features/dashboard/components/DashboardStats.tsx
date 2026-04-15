
import { Users, BookOpen, CalendarCheck, CheckCircle2, GraduationCap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <>
            <StatsCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="blue" trendUp={true} />
            <StatsCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="indigo"
                trendUp={true} />
            <StatsCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="amber"
                trendUp={true} />
            <StatsCard title="الحصص المنفذة" value={stats.completedSessions} icon={CheckCircle2} color="green" trendUp={true} />

            {!isTeacher && (
                <>
                    <StatsCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="purple" trendUp={true} />
                    <StatsCard title="إجمالي الإيرادات" value={stats.totalRevenue.toLocaleString() + ' ج.م'} icon={TrendingUp} color="green"
                        trend={`هذا الشهر: ${stats.monthRevenue}`} trendUp={true} />
                    <StatsCard title="إجمالي المصروفات" value={stats.totalExpenses.toLocaleString() + ' ج.م'} icon={TrendingDown} color="rose"
                        trend={`هذا الشهر: ${stats.monthExpenses}`} trendUp={false} />
                    <StatsCard title="إجمالي الأرباح" value={stats.totalNetProfit.toLocaleString() + ' ج.م'} icon={DollarSign} color="green"
                        trend={`هذا الشهر: ${stats.monthNetProfit}`} trendUp={true} />
                </>
            )}
        </>
    );
};
