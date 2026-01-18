import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';

interface ReportsStatsGridProps {
    totalStudents: number;
    totalEnrollments: number;
    totalSessions: number;
    completedSessions: number;
    attendanceRate: number;
    cancelledSessions: number;
    totalRevenue: number;
    monthRevenue: number;
}

export const ReportsStatsGrid = ({
    totalStudents,
    totalEnrollments,
    totalSessions,
    completedSessions,
    attendanceRate,
    cancelledSessions,
    totalRevenue,
    monthRevenue
}: ReportsStatsGridProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="إجمالي الطلاب"
                value={totalStudents}
                icon={Users}
                color="blue"
                trend={'اشتراكات: ' + totalEnrollments}
            />
            <StatsCard
                title="الحصص المتوقعة"
                value={totalSessions}
                icon={Calendar}
                color="emerald"
                trend={'مكتملة: ' + completedSessions}
            />
            <StatsCard
                title="نسبة الحضور"
                value={attendanceRate + '%'}
                icon={TrendingUp}
                color="purple"
                trend={'غياب: ' + cancelledSessions}
            />
            <StatsCard
                title="الإيرادات"
                value={totalRevenue.toLocaleString() + ' ج.م'}
                icon={DollarSign}
                color="amber"
                trend={monthRevenue.toLocaleString() + ' ج.م (هذا الشهر)'}
            />
        </div>
    );
};
