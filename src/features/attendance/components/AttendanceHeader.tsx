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
        <div className="rounded-2xl px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/15">
                    <Sparkles size={22} className="text-on-primary" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-on-primary leading-tight">تحضير الطلاب والمتابعة اليومية</h1>
                    <p className="text-[10px] font-bold text-on-primary/70 mt-0.5">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isTeacher && (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/15">
                        <Calendar size={14} className="text-white/70" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-[10px] font-bold text-on-primary outline-none focus:ring-0 cursor-pointer w-28"
                        />
                    </div>
                )}
                <div className="flex items-center gap-2 text-[10px] font-bold rounded-xl px-3 py-1.5 bg-white/15 text-on-primary">
                    <Sparkles size={12} />
                    Live System
                </div>
            </div>
        </div>
    );
};
