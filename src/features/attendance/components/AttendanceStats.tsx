import React from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, ArrowUpRight, Activity } from 'lucide-react';
import type { AttendanceStats as IStats, TeacherStats as ITeacherStats } from '../types';
import { cn } from '../../../lib/utils';

interface AttendanceStatsProps {
    stats: IStats;
    teacherStats?: ITeacherStats;
    isTeacher: boolean;
}

const StatItem = ({ title, value, icon: Icon, color, subValue, subLabel }: { title: string, value: number, icon: any, color: string, subValue?: string | number, subLabel?: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-none relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
        <div className={cn("absolute top-0 right-0 w-24 h-full opacity-5 -skew-x-12 transform translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8", color)}></div>
        <div className="flex items-center justify-between mb-4">
            <div className={cn("w-10 h-10 flex items-center justify-center shadow-sm", color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'text-'))}>
                <Icon size={20} />
            </div>
            {subValue && (
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 italic">
                    <ArrowUpRight size={12} className="text-emerald-500" />
                    <span>{subValue}</span>
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{title}</p>
            <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter italic">{value}</h3>
                 {subLabel && <span className="text-[10px] font-black text-slate-400 uppercase italic">{subLabel}</span>}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight italic">بيانات معالجة حالياً</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
        </div>
    </div>
);

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats, teacherStats, isTeacher }) => {
    if (isTeacher && teacherStats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-4 lg:px-0" dir="rtl">
                <StatItem 
                    title="الحصص المتوقعة" 
                    value={teacherStats.expected} 
                    icon={Calendar} 
                    color="bg-indigo-600" 
                    subValue="اليوم"
                    subLabel="قيد التنفيذ"
                />
                <StatItem 
                    title="الحصص المنعقدة" 
                    value={teacherStats.used} 
                    icon={CheckCircle2} 
                    color="bg-emerald-600" 
                    subValue={`${teacherStats.rate}%`}
                    subLabel="تم التوثيق"
                />
                <StatItem 
                    title="نسبة الإنجاز" 
                    value={teacherStats.rate} 
                    icon={TrendingUp} 
                    color="bg-amber-600" 
                    subLabel="%"
                />
                <StatItem 
                    title="الحصص المتبقية" 
                    value={teacherStats.remaining} 
                    icon={Clock} 
                    color="bg-rose-600" 
                    subLabel="حصة"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-4 lg:px-0" dir="rtl">
            <StatItem 
                title="مجدولة (اليوم)" 
                value={stats.todayScheduled} 
                icon={Calendar} 
                color="bg-indigo-600" 
                subValue={stats.todayTotal}
                subLabel="جلسة"
            />
            <StatItem 
                title="حضور (اليوم)" 
                value={stats.todayCompleted} 
                icon={CheckCircle2} 
                color="bg-emerald-600" 
                subValue={stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) + '%' : '0%'}
                subLabel="تم التحضير"
            />
            <StatItem 
                title="غياب (اليوم)" 
                value={stats.todayCancelled} 
                icon={XCircle} 
                color="bg-rose-600" 
                subValue={stats.todayTotal > 0 ? Math.round((stats.todayCancelled / stats.todayTotal) * 100) + '%' : '0%'}
                subLabel="إلغاءات"
            />
            <StatItem 
                title="إجمالي المنفذة" 
                value={stats.totalCompleted} 
                icon={Activity} 
                color="bg-slate-900" 
                subValue="100%"
                subLabel="حصة مؤرشفة"
            />
        </div>
    );
};
