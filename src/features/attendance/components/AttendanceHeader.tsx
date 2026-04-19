import React from 'react';
import { Calendar } from 'lucide-react';

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
        <div className="mb-6 flex flex-col items-center justify-center text-center">
             <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-1 tracking-tight">تحضير الطلاب والمتابعة</h1>
             <p className="text-[11px] md:text-sm font-bold text-slate-500 mb-4">إدارة جدول الحضور والغياب المباشر</p>

             {/* Minimal Date Selection */}
             {!isTeacher && (
                <div className="bg-slate-100 rounded-lg flex items-center shadow-inner overflow-hidden max-w-xs mx-auto">
                    <div className="px-3 py-2 bg-slate-200/50 text-slate-500 flex items-center justify-center">
                        <Calendar size={16} />
                    </div>
                    <div className="flex-1 px-2 py-1">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full bg-transparent border-none text-slate-700 font-bold text-xs md:text-sm focus:outline-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
