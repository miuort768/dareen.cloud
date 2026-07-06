import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
    periodLabel?: string;
}

const StatItem = ({ title, value, icon: Icon, subLabel, color = 'var(--bg-primary)' }: { title: string, value: number, icon: LucideIcon, subLabel?: string, color?: string }) => (
    <div className="rounded-2xl p-4 dark:brightness-[0.65]" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                <Icon size={20} className="text-on-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-micro font-bold text-on-primary/70">{title}</p>
                <p className="text-lg font-black leading-none mt-0.5 text-on-primary">
                    {value}
                    {subLabel && <span className="text-micro font-bold text-on-primary/60 mr-1">{subLabel}</span>}
                </p>
            </div>
        </div>
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher, periodLabel }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
                <StatItem title="الحصص المتوقعة" value={teacherStats.expected} icon={Calendar} color="var(--bg-primary)" />
                <StatItem title="الحصص المنعقدة" value={teacherStats.used} icon={CheckCircle2} color="var(--bg-success)" />
                <StatItem title="نسبة الإنجاز" value={teacherStats.rate} icon={TrendingUp} subLabel="%" color="var(--bg-primary)" />
                <StatItem title="الحصص المتبقية" value={teacherStats.remaining} icon={Clock} subLabel="حصة" color="var(--bg-warning)" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
            <StatItem title={`حضور (${periodLabel || 'اليوم'})`} value={stats.todayCompleted} icon={CheckCircle2} color="var(--bg-success)" />
            <StatItem title={`غياب (${periodLabel || 'اليوم'})`} value={stats.todayCancelled} icon={XCircle} color="var(--bg-error)" />
            <StatItem title={`مجدولة (${periodLabel || 'اليوم'})`} value={stats.todayScheduled} icon={Calendar} color="var(--bg-primary)" />
            <StatItem title="إجمالي الكل" value={stats.totalCompleted} icon={Activity} color="var(--bg-warning)" />
        </div>
    );
};
