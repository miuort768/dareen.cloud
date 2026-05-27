import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

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
        <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm px-5 md:px-7 py-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#F59E0B12', color: '#F59E0B' }}>
                    <Sparkles size={22} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">تحضير الطلاب والمتابعة اليومية</h1>
                    <p className="text-[10px] font-bold text-[#64748B] mt-0.5">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isTeacher && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                        <Calendar size={14} style={{ color: '#2563EB' }} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-[10px] font-bold text-[#0F172A] dark:text-white outline-none focus:ring-0 cursor-pointer w-28"
                        />
                    </div>
                )}
                <div className="flex items-center gap-2 text-[10px] font-bold rounded-xl px-3 py-1.5 border shadow-sm" style={{ backgroundColor: '#F59E0B12', color: '#D97706', borderColor: '#F59E0B30' }}>
                    <Sparkles size={12} />
                    Live System
                </div>
            </div>
        </div>
    );
};
