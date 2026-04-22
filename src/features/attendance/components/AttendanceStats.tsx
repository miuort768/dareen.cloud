import React from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';
import { cn } from '../../../lib/utils';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
}

const StatItem = ({ title, value, icon: Icon, color, subValue, subLabel, bg }: { title: string, value: number, icon: any, color: string, subValue?: string | number, subLabel?: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value} {subLabel && <span className="text-[10px] font-bold text-slate-400">{subLabel}</span>}</p>
        {subValue && <p className="text-[9px] text-slate-400 mt-0.5">{subValue}</p>}
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 mb-4" dir="rtl">
                <StatItem 
                    title="الحصص المتوقعة" 
                    value={teacherStats.expected} 
                    icon={Calendar} 
                    color="text-[#5c59f2]" 
                    bg="bg-[#eef2ff] dark:bg-indigo-900/30"
                    subValue="اليوم"
                />
                <StatItem 
                    title="الحصص المنعقدة" 
                    value={teacherStats.used} 
                    icon={CheckCircle2} 
                    color="text-emerald-500" 
                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                    subValue={`${teacherStats.rate}% تم التوثيق`}
                />
                <StatItem 
                    title="نسبة الإنجاز" 
                    value={teacherStats.rate} 
                    icon={TrendingUp} 
                    color="text-amber-500" 
                    bg="bg-amber-50 dark:bg-amber-900/20"
                    subLabel="%"
                />
                <StatItem 
                    title="الحصص المتبقية" 
                    value={teacherStats.remaining} 
                    icon={Clock} 
                    color="text-rose-500" 
                    bg="bg-rose-50 dark:bg-rose-900/20"
                    subLabel="حصة"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 mb-4" dir="rtl">
            <StatItem 
                title="مجدولة (اليوم)" 
                value={stats.todayScheduled} 
                icon={Calendar} 
                color="text-[#5c59f2]" 
                bg="bg-[#eef2ff] dark:bg-indigo-900/30"
                subValue={`إجمالي: ${stats.todayTotal}`}
            />
            <StatItem 
                title="حضور (اليوم)" 
                value={stats.todayCompleted} 
                icon={CheckCircle2} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                subValue={stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) + '%' : '0%'}
            />
            <StatItem 
                title="غياب (اليوم)" 
                value={stats.todayCancelled} 
                icon={XCircle} 
                color="text-rose-500" 
                bg="bg-rose-50 dark:bg-rose-900/20"
                subValue={stats.todayTotal > 0 ? Math.round((stats.todayCancelled / stats.todayTotal) * 100) + '%' : '0%'}
            />
            <StatItem 
                title="إجمالي المنفذة" 
                value={stats.totalCompleted} 
                icon={Activity} 
                color="text-blue-500" 
                bg="bg-blue-50 dark:bg-blue-900/20"
                subValue="أرشيف الحصص"
            />
        </div>
    );
};
