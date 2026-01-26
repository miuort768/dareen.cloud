import { Users, BookOpen, CalendarCheck, GraduationCap } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';
import type { DashboardStats as Stats } from '../types';

interface DashboardStatsProps {
    stats: Stats;
    isTeacher: boolean;
}

export const DashboardStats = ({ stats, isTeacher }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatsCard title="إجمالي الطلاب" value={stats.studentsCount} icon={Users} color="blue" trendUp={true} />
            <StatsCard title="الاشتراكات النشطة" value={stats.totalEnrollments} icon={BookOpen} color="blue"
                trendUp={true} />
            <StatsCard title="حصص اليوم" value={stats.todaySessions} icon={CalendarCheck} color="amber"
                trendUp={true} />

            {!isTeacher && (
                <StatsCard title="إجمالي المعلمين" value={stats.teachersCount} icon={GraduationCap} color="indigo" trendUp={true} />
            )}
        </div>
    );
};
