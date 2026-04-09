import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Clock, CalendarCheck, Wallet } from 'lucide-react';
import type { DashboardStats as Stats } from '../types';
import type { User } from '../../../types/auth';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
    stats: Stats;
}

export const DashboardHeader = ({ isTeacher, currentUser, stats }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative -mx-3 -mt-3 lg:mx-0 lg:mt-0 bg-white dark:bg-gray-900 p-6 lg:p-8 shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] border-4 border-gray-950 dark:border-gray-800 rounded-none mb-8 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gray-950 dark:bg-primary-900/40 flex items-center justify-center border-4 border-gray-950 dark:border-primary-500 shadow-[4px_4px_0px_0px_#444] shrink-0 transform -rotate-1">
                        <GraduationCap size={24} className="text-white lg:hidden" />
                        <GraduationCap size={40} className="text-white hidden lg:block" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-6 bg-rose-600 border border-gray-950"></div>
                            <span className="text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest">أكاديمية دارين التعليمية</span>
                        </div>
                        {isTeacher ? (
                            <h1 className="text-2xl lg:text-4xl font-black text-gray-950 dark:text-white tracking-tighter">
                                أهلاً بك، أ. {currentUser?.name}
                            </h1>
                        ) : (
                            <h1 className="text-2xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tighter">
                                لوحة التحكم الرئيسية
                            </h1>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-1 flex items-center gap-2">
                           <CalendarCheck size={14} className="text-primary-600" />
                           {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                    {isTeacher && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 border-2 border-gray-950 dark:border-emerald-500/30 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="p-2 bg-emerald-600 text-white border-2 border-gray-950">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-0.5">صافي الأرباح</p>
                                <p className="text-xl font-black text-emerald-950 dark:text-emerald-400 leading-none tabular-nums">
                                    {stats.monthNetProfit.toLocaleString()}
                                    <span className="text-xs mr-1 opacity-60">ج.م</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <Link to="/appointments" className="bg-primary-50 dark:bg-primary-950/30 px-5 py-3 border-2 border-gray-950 dark:border-primary-500/30 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform group">
                        <div className="p-2 bg-primary-600 text-white border-2 border-gray-950 group-hover:bg-gray-950 transition-colors">
                            <CalendarCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary-600 uppercase mb-0.5">حصص اليوم</p>
                            <p className="text-xl font-black text-primary-950 dark:text-primary-400 leading-none tabular-nums">{stats.todaySessions}</p>
                        </div>
                    </Link>

                    <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 border-2 border-gray-950 dark:border-gray-700 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
                        <div className="p-2 bg-gray-950 text-white border-2 border-gray-800">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5 font-sans">التوقيت الحالي</p>
                            <p className="text-base font-black text-gray-950 dark:text-white leading-none tracking-tight">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
