import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { StatCard } from '../../../shared/components/ui/StatCard';

interface ReportsStatsGridProps {
    totalStudents: number;
    totalEnrollments: number;
    totalSessions: number;
    completedSessions: number;
    attendanceRate: number;
    cancelledSessions: number;
    totalRevenue: number;
    monthRevenue: number;
    reportCurrency?: string;
}

export const ReportsStatsGrid = ({
    totalStudents,
    totalEnrollments,
    totalSessions,
    completedSessions,
    attendanceRate,
    cancelledSessions,
    totalRevenue,
    monthRevenue,
    reportCurrency = 'KWD'
}: ReportsStatsGridProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                title="إجمالي الطلاب"
                value={totalStudents}
                icon={Users}
                variant="info"
                subtitle={`${totalEnrollments} اشتراك`}
            />
            <StatCard
                title="الحصص المتوقعة"
                value={totalSessions}
                icon={Calendar}
                variant="primary"
                subtitle={`${completedSessions} مكتملة`}
            />
            <StatCard
                title="نسبة الحضور"
                value={attendanceRate + '%'}
                icon={TrendingUp}
                variant="success"
                subtitle={`${cancelledSessions} غياب`}
            />
            <StatCard
                title="الإيرادات الكلية"
                value={totalRevenue.toLocaleString()}
                icon={DollarSign}
                variant="warning"
                unit={reportCurrency}
                subtitle={`${monthRevenue.toLocaleString()} ${reportCurrency}/شهر`}
            />
        </div>
    );
};
