import { useState, useEffect } from 'react';
import { Activity, Clock, CalendarCheck, Wallet } from 'lucide-react';
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
        <div className="relative -mx-4 -mt-4 lg:mx-0 lg:mt-0 bg-primary-600 p-6 lg:p-10 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none">
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative group">
                        <Activity size={24} className="text-white lg:hidden" />
                        <Activity size={36} className="text-white hidden lg:block" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-1 text-right">
                        {isTeacher ? (
                            <>
                                <span className="text-primary-200 text-xs lg:text-sm font-black uppercase tracking-[0.2em] block mb-1">مرحباً بك مجدداً</span>
                                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                                    أ. {currentUser?.name}
                                </h1>
                            </>
                        ) : (
                            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">
                                نظرة عامة
                            </h1>
                        )}

                        <div className="mt-6">
                            <span className="text-white/80 text-xs lg:text-base font-black tracking-widest uppercase">معهد دارين للتعليم والتدريب</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:items-center gap-4">
                    {isTeacher && (
                        <div className="group relative flex items-center gap-4 bg-white/5 backdrop-blur-xl px-5 py-3 border border-white/10 rounded-none shadow-2xl overflow-hidden min-w-[160px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent"></div>
                            <div className="relative p-2 bg-white/10 text-white rounded-none">
                                <Wallet size={20} />
                            </div>
                            <div className="relative text-right">
                                <p className="text-white/90 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 line-clamp-1">أرباح الشهر</p>
                                <p className="text-white text-xl font-black leading-none whitespace-nowrap">
                                    {stats.monthNetProfit.toLocaleString()}
                                    <span className="text-[10px] opacity-80 mr-1">ج.م</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <button className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl px-5 py-3 border border-white/10 rounded-none transition-all active:scale-95 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative p-2 bg-white/10 text-white rounded-none group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <CalendarCheck size={20} />
                        </div>
                        <div className="relative text-right">
                            <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 group-hover:text-white/80">حصص اليوم</p>
                            <p className="text-white text-xl font-black leading-none">{stats.todaySessions}</p>
                        </div>
                    </button>

                    <div className="group relative flex items-center gap-4 bg-black/40 backdrop-blur-xl px-5 py-3 border border-white/10 rounded-none shadow-2xl min-w-[170px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent"></div>
                        <div className="relative p-2 bg-white/5 text-amber-400 rounded-none border border-white/5">
                            <Clock size={20} />
                        </div>
                        <div className="relative text-right font-mono">
                            <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 text-center font-sans">الوقت الفعلي</p>
                            <p className="text-white text-lg lg:text-xl font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
