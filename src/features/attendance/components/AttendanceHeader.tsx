import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface AttendanceHeaderProps {
    date: string;
    onDateChange: (date: string) => void;
    stats: {
        todayTotal: number;
        totalCompleted: number;
    };
    isTeacher: boolean;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ date, onDateChange, stats, isTeacher }) => {
    return (
        <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
            <div className="relative flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                        <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight drop-shadow-sm">تحضير الطلاب اليومي</h1>
                        <p className="text-white/90 text-sm font-bold flex items-center gap-2 drop-shadow-md">
                            <div className="p-1 bg-amber-400 shadow-sm">
                                <Clock size={12} className="text-primary-900" />
                            </div>
                            <span className="text-white">سجل وتابع حضور الطلاب لليوم</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isTeacher && (
                        <div className="hidden md:flex gap-4">
                            <div className="bg-white/20 px-5 py-2 border border-white/20 shadow-lg min-w-[120px]">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-90">حصص اليوم</p>
                                <p className="text-white text-2xl font-black">{stats.todayTotal}</p>
                            </div>
                            <div className="bg-white/20 px-5 py-2 border border-white/20 shadow-lg min-w-[120px]">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-90">إجمالي المنفذ</p>
                                <p className="text-white text-2xl font-black">{stats.totalCompleted}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 bg-white p-1 rounded-none shadow-xl border border-primary-200">
                        <div className="p-2 bg-primary-50">
                            <Calendar className="text-primary-600" size={24} />
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none text-gray-900 font-black focus:outline-none pr-4 py-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
