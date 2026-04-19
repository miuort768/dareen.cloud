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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
                {/* 1. Expected */}
                <div className="bg-white rounded-none p-4 md:shadow-sm border border-slate-50 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[8px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">اليوم</span>
                        <div className="flex items-center justify-center">
                            <Calendar size={14} className="text-slate-500" />
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{teacherStats.expected}</h3>
                        <p className="text-[8px] font-bold text-slate-400 mt-1">الحصص المتوقعة</p>
                    </div>
                </div>

                {/* 2. Completed */}
                <div className="bg-white rounded-none p-4 md:shadow-sm border border-slate-50 flex flex-col justify-between h-28">
                    <div className="flex justify-end pointer-events-none">
                        <div className="flex items-center justify-center w-5 h-5 border border-rose-200 rounded-full">
                            <CheckCircle2 size={10} className="text-rose-600" />
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{teacherStats.used}</h3>
                        <p className="text-[8px] font-bold text-slate-400 mt-1">المنعقدة</p>
                    </div>
                </div>

                {/* 3. Percentage */}
                <div className="bg-[#5c4fb1] rounded-none p-4 md:shadow-md flex flex-col justify-between h-28 text-white">
                    <div className="flex justify-end pointer-events-none">
                        <TrendingUp size={16} className="text-white/80" />
                    </div>
                    <div className="text-center mt-auto">
                        <h3 className="text-2xl font-black leading-none">{teacherStats.rate}%</h3>
                        <p className="text-[8px] font-bold text-white/70 mt-1">نسبة الحضور</p>
                    </div>
                </div>

                {/* 4. Remaining */}
                <div className="bg-white rounded-none p-4 md:shadow-sm border border-slate-50 flex flex-col justify-between h-28">
                    <div className="flex justify-end pointer-events-none">
                        <Clock size={14} className="text-slate-500" />
                    </div>
                    <div className="text-center mt-2">
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{teacherStats.remaining}</h3>
                        <p className="text-[8px] font-bold text-slate-400 mt-1">المتبقية</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-6">
            <StatsCard title="مجدولة (اليوم)" value={stats.todayScheduled} icon={Calendar} color="blue" trend="حصة" />
            <StatsCard title="حضور (اليوم)" value={stats.todayCompleted} icon={CheckCircle2} color="emerald" trend={stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) + '%' : '0%'} />
            <StatsCard title="غياب (اليوم)" value={stats.todayCancelled} icon={XCircle} color="rose" trend={stats.todayTotal > 0 ? Math.round((stats.todayCancelled / stats.todayTotal) * 100) + '%' : '0%'} />
            <StatsCard title="إجمالي المنفذة" value={stats.totalCompleted} icon={TrendingUp} color="amber" trend="الكل" />
        </div>
    );
};
