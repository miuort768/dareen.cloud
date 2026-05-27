import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
}

const StatItem = ({ title, value, icon: Icon, subLabel, color = '#2563EB' }: { title: string, value: number, icon: LucideIcon, subLabel?: string, color?: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl p-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#64748B]">{title}</p>
                <p className="text-lg font-black leading-none mt-0.5" style={{ color }}>
                    {value}
                    {subLabel && <span className="text-[10px] font-bold text-[#64748B] mr-1">{subLabel}</span>}
                </p>
            </div>
        </div>
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
                <StatItem title="الحصص المتوقعة" value={teacherStats.expected} icon={Calendar} color="#8B5CF6" />
                <StatItem title="الحصص المنعقدة" value={teacherStats.used} icon={CheckCircle2} color="#10B981" />
                <StatItem title="نسبة الإنجاز" value={teacherStats.rate} icon={TrendingUp} subLabel="%" color="#2563EB" />
                <StatItem title="الحصص المتبقية" value={teacherStats.remaining} icon={Clock} subLabel="حصة" color="#F59E0B" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
            <StatItem title="مجدولة (اليوم)" value={stats.todayScheduled} icon={Calendar} color="#8B5CF6" />
            <StatItem title="حضور (اليوم)" value={stats.todayCompleted} icon={CheckCircle2} color="#10B981" />
            <StatItem title="غياب (اليوم)" value={stats.todayCancelled} icon={XCircle} color="#F43F5E" />
            <StatItem title="إجمالي المنفذة" value={stats.totalCompleted} icon={Activity} color="#2563EB" />
        </div>
    );
};
