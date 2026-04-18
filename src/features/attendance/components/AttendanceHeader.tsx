import React from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';

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
        <div className="relative bg-white border-2 border-gray-950 p-3 md:p-6 shadow-[2px_2px_0px_0px_black] overflow-hidden mb-4 md:mb-6 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/5 -skew-x-12 transform translate-x-16 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary-600 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] transform rotate-3">
                        <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic">DAILY MONITORING LOG</span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-black text-gray-950 mb-1 tracking-tighter uppercase leading-none">تحضير الطلاب والمتابعة</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Clock size={12} className="text-primary-600" />
                            إدارة جدول الحضور والغياب المباشر
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6 flex-wrap w-full md:w-auto">
                    {!isTeacher && (
                        <div className="flex md:flex gap-2 md:gap-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-none bg-emerald-50 border-2 border-gray-950 p-2 md:p-3 shadow-[2px_2px_0px_0px_black] flex flex-col items-center">
                                <p className="text-emerald-700 text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none mb-1 md:mb-2">اليوم</p>
                                <p className="text-gray-950 text-xl md:text-2xl font-black leading-none">{stats.todayTotal}</p>
                            </div>
                            <div className="flex-1 md:flex-none bg-amber-50 border-2 border-gray-950 p-2 md:p-3 shadow-[2px_2px_0px_0px_black] flex flex-col items-center">
                                <p className="text-amber-700 text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none mb-1 md:mb-2">المنجز</p>
                                <p className="text-gray-950 text-xl md:text-2xl font-black leading-none">{stats.totalCompleted}</p>
                            </div>
                        </div>
                    )}
                    
                    {!isTeacher && (
                        <div className="bg-white border-2 border-gray-950 flex items-center shadow-[2px_2px_0px_0px_black] group w-full md:w-auto">
                            <div className="px-2 py-2 md:px-3 md:py-3 bg-gray-950 text-white border-l-2 border-gray-950 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                <Calendar size={16} className="md:size-[20px]" />
                            </div>
                            <div className="p-1 flex-1 md:p-1.5">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => onDateChange(e.target.value)}
                                    className="w-full bg-transparent border-none text-gray-950 font-black text-xs md:text-sm focus:outline-none pr-2 md:pr-3 py-1 cursor-pointer uppercase tracking-tight"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Design elements */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600"></div>
        </div>
    );
};
