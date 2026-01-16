import React from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="الحصص المتوقعة" value={teacherStats.expected} icon={Calendar} color="blue" trend="حصة" />
                <StatsCard title="المنفذة" value={teacherStats.used} icon={CheckCircle2} color="emerald" trend="حصة" />
                <StatsCard title="المتبقية" value={teacherStats.remaining} icon={Clock} color="rose" trend="حصة" />
                <StatsCard title="نسبة الحضور" value={teacherStats.rate + '%'} icon={TrendingUp} color="amber" trend="المعدل" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard title="مجدولة (اليوم)" value={stats.todayScheduled} icon={Calendar} color="blue" trend="حصة" />
            <StatsCard title="حضور (اليوم)" value={stats.todayCompleted} icon={CheckCircle2} color="emerald" trend={stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) + '%' : '0%'} />
            <StatsCard title="غياب (اليوم)" value={stats.todayCancelled} icon={XCircle} color="rose" trend={stats.todayTotal > 0 ? Math.round((stats.todayCancelled / stats.todayTotal) * 100) + '%' : '0%'} />
            <StatsCard title="إجمالي المنفذة" value={stats.totalCompleted} icon={TrendingUp} color="amber" trend="الكل" />
        </div>
    );
};
