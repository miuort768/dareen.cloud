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
        <div className="rounded-none px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: '#F59E0B' }}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <Sparkles size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white leading-tight">تحضير الطلاب والمتابعة اليومية</h1>
                    <p className="text-[10px] font-bold text-white/70 mt-0.5">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isTeacher && (
                    <div className="flex items-center gap-2 rounded-none px-3 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <Calendar size={14} className="text-white/70" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-[10px] font-bold text-white outline-none focus:ring-0 cursor-pointer w-28"
                        />
                    </div>
                )}
                <div className="flex items-center gap-2 text-[10px] font-bold rounded-none px-3 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                    <Sparkles size={12} />
                    Live System
                </div>
            </div>
        </div>
    );
};
