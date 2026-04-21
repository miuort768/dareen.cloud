import React from 'react';
import { Calendar, Activity, Star, AlertCircle } from 'lucide-react';

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
        <div className="relative group mb-10" dir="rtl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-none blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
            
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
                
                <div className="relative z-10 px-4 py-6 md:px-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="relative">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                                <Activity size={24} className="md:size-32" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                                <Star size={12} className="text-white" />
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 text-[8px] md:text-[10px] font-black px-2 py-0.5 uppercase tracking-widest leading-none italic">منظومة الحضور المباشر</span>
                                <AlertCircle size={10} className="text-indigo-500 md:size-[14px]" />
                            </div>
                            <h1 className="text-sm md:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter uppercase italic">تحضير الطلاب والمتابعة اليومية</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                    <span>إدارة الجداول الأكاديمية</span>
                                </div>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none italic">
                                    <span>تحديث حي • استجابة فورية</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isTeacher && (
                        <div className="flex items-center gap-3 no-print">
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3 group/input transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl">
                                <Calendar size={18} className="text-slate-400 group-hover/input:text-indigo-600 transition-colors" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">تاريخ التحضير</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => onDateChange(e.target.value)}
                                        className="bg-transparent border-none p-0 text-xs font-black text-slate-800 dark:text-white outline-none focus:ring-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
