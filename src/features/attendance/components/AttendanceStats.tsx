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

const StatItem = ({ title, value, icon: Icon, subLabel, color = '#6C4BFF' }: { title: string, value: number, icon: LucideIcon, subLabel?: string, color?: string }) => (
    <div className="rounded-2xl p-4 dark:brightness-[0.65]" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70">{title}</p>
                <p className="text-lg font-black leading-none mt-0.5 text-white">
                    {value}
                    {subLabel && <span className="text-[10px] font-bold text-white/60 mr-1">{subLabel}</span>}
                </p>
            </div>
        </div>
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher, periodLabel }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
                <StatItem title="الحصص المتوقعة" value={teacherStats.expected} icon={Calendar} color="#8B5CF6" />
                <StatItem title="الحصص المنعقدة" value={teacherStats.used} icon={CheckCircle2} color="#10B981" />
                <StatItem title="نسبة الإنجاز" value={teacherStats.rate} icon={TrendingUp} subLabel="%" color="#8B5CF6" />
                <StatItem title="الحصص المتبقية" value={teacherStats.remaining} icon={Clock} subLabel="حصة" color="#F59E0B" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
            <StatItem title={`حضور (${periodLabel || 'اليوم'})`} value={stats.todayCompleted} icon={CheckCircle2} color="#10B981" />
            <StatItem title={`غياب (${periodLabel || 'اليوم'})`} value={stats.todayCancelled} icon={XCircle} color="#F43F5E" />
            <StatItem title={`مجدولة (${periodLabel || 'اليوم'})`} value={stats.todayScheduled} icon={Calendar} color="#8B5CF6" />
            <StatItem title="إجمالي الكل" value={stats.totalCompleted} icon={Activity} color="#F59E0B" />
        </div>
    );
};
