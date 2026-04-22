import React from 'react';
import { Calendar, Activity, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AttendanceHeaderProps {
    date: string;
    onDateChange: (date: string) => void;
    stats: {
        todayTotal: number;
        totalCompleted: number;
    };
    isTeacher: boolean;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ date, onDateChange, isTeacher }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                    <Activity size={18} className="text-[#5c59f2]" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-white">تحضير الطلاب والمتابعة اليومية</h1>
                    <p className="text-[10px] text-slate-400 italic">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                </div>
            </div>

            <div className="flex items-center gap-2 no-print">
                {!isTeacher && (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-0 cursor-pointer"
                        />
                    </div>
                )}
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Sparkles size={12} className="text-amber-400" />
                    Live System Ready
                </div>
            </div>
        </div>
    );
};
