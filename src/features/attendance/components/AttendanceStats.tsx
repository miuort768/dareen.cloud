import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
}

const StatItem = ({ title, value, icon: Icon, subLabel }: { title: string, value: number, icon: LucideIcon, subLabel?: string }) => (
    <div className="bg-blue-600 dark:bg-rose-600 p-4 rounded-none flex flex-col items-center text-center transition-colors duration-500">
        <div className="w-10 h-10 rounded-none flex items-center justify-center mb-2 bg-white/20 border border-white/20">
            <Icon size={18} className="text-white" />
        </div>
        <p className="text-[9px] font-medium text-white/70 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-medium text-white mt-1 leading-none">
            {value} 
            {subLabel && <span className="text-[10px] font-normal text-white/60 mr-1">{subLabel}</span>}
        </p>
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
                <StatItem 
                    title="الحصص المتوقعة" 
                    value={teacherStats.expected} 
                    icon={Calendar} 
                />
                <StatItem 
                    title="الحصص المنعقدة" 
                    value={teacherStats.used} 
                    icon={CheckCircle2} 
                />
                <StatItem 
                    title="نسبة الإنجاز" 
                    value={teacherStats.rate} 
                    icon={TrendingUp} 
                    subLabel="%"
                />
                <StatItem 
                    title="الحصص المتبقية" 
                    value={teacherStats.remaining} 
                    icon={Clock} 
                    subLabel="حصة"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-0 mb-4" dir="rtl">
            <StatItem 
                title="مجدولة (اليوم)" 
                value={stats.todayScheduled} 
                icon={Calendar} 
            />
            <StatItem 
                title="حضور (اليوم)" 
                value={stats.todayCompleted} 
                icon={CheckCircle2} 
            />
            <StatItem 
                title="غياب (اليوم)" 
                value={stats.todayCancelled} 
                icon={XCircle} 
            />
            <StatItem 
                title="إجمالي المنفذة" 
                value={stats.totalCompleted} 
                icon={Activity} 
            />
        </div>
    );
};
