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
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 shadow-lg shadow-indigo-500/20 px-4 md:px-6 py-8 md:py-10 border-y md:border-none border-indigo-400/30 print:hidden mb-2">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-none border border-white/20 shadow-inner">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black text-white tracking-tight leading-none">تحضير الطلاب والمتابعة اليومية</h1>
                        <p className="text-[10px] md:text-[11px] font-bold text-white/60 mt-1.5 uppercase tracking-widest">إدارة الجداول الأكاديمية والتحضير المباشر</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                    {!isTeacher && (
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 border border-white/20 shadow-sm transition-all hover:bg-white/25">
                            <Calendar size={15} className="text-white/80" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => onDateChange(e.target.value)}
                                className="bg-transparent border-none p-0 text-[11px] font-black text-white outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-black text-white bg-emerald-500/20 px-4 py-2 border border-emerald-500/30 uppercase tracking-widest">
                        <Sparkles size={12} className="text-emerald-300 animate-pulse" />
                        Live System
                    </div>
                </div>
            </div>
        </div>
    );
};
