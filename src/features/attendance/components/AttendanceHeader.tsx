import React from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';
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

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ date, onDateChange, stats, isTeacher }) => {
    return (
        <div className="relative bg-white border-4 border-gray-950 p-6 md:p-8 shadow-[12px_12px_0px_0px_black] overflow-hidden mb-10 rounded-none">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/5 -skew-x-12 transform translate-x-16 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-600 text-white flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] transform rotate-3">
                        <CheckCircle2 size={32} strokeWidth={3} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono italic">DAILY MONITORING LOG</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-gray-950 mb-1 tracking-tighter uppercase leading-none">تحضير الطلاب والمتابعة</h1>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Clock size={14} className="text-primary-600" />
                            إدارة جدول الحضور والغياب المباشر
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                    {!isTeacher && (
                        <div className="hidden md:flex gap-4">
                            <div className="bg-emerald-50 border-2 border-gray-950 p-4 min-w-[140px] shadow-[4px_4px_0px_0px_black] flex flex-col items-center">
                                <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest leading-none mb-2">حصص اليوم</p>
                                <p className="text-gray-950 text-3xl font-black leading-none">{stats.todayTotal}</p>
                            </div>
                            <div className="bg-amber-50 border-2 border-gray-950 p-4 min-w-[140px] shadow-[4px_4px_0px_0px_black] flex flex-col items-center">
                                <p className="text-amber-700 text-[10px] font-black uppercase tracking-widest leading-none mb-2">المنجز حالياً</p>
                                <p className="text-gray-950 text-3xl font-black leading-none">{stats.totalCompleted}</p>
                            </div>
                        </div>
                    )}
                    
                    {!isTeacher && (
                        <div className="bg-white border-4 border-gray-950 flex items-center shadow-[6px_6px_0px_0px_black] group">
                            <div className="px-4 py-4 bg-gray-950 text-white border-l-2 border-gray-950 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                <Calendar size={24} />
                            </div>
                            <div className="p-2">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => onDateChange(e.target.value)}
                                    className="bg-transparent border-none text-gray-950 font-black text-lg focus:outline-none pr-4 py-2 cursor-pointer uppercase tracking-tight"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Design elements */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-primary-600"></div>
        </div>
    );
};
