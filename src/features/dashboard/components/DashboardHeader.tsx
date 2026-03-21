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
        <div className="relative -mx-4 -mt-4 lg:mx-0 lg:mt-0 bg-primary-600 p-8 lg:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden border-b-8 border-primary-800 rounded-none">
            {/* Background Geometric Enhancement - SHARP SHAPES ONLY */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 border-r-[20px] border-white/5 -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 border-l-[40px] border-black/5 -ml-20 -mb-20 pointer-events-none"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent 100%)', backgroundSize: '40px 40px' }}></div>

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-950 flex items-center justify-center border-4 border-white/20 shadow-2xl relative group">
                        <GraduationCap size={24} className="text-white lg:hidden" />
                        <GraduationCap size={48} className="text-white hidden lg:block" />
                    </div>
                    <div className="space-y-1 lg:space-y-2 text-right">
                        <span className="text-white font-black text-[10px] lg:text-xs tracking-[0.4em] uppercase block mb-1">إدارة أكاديمية دارين التعليمية</span>
                        {isTeacher ? (
                            <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase">
                                أ. {currentUser?.name}
                            </h1>
                        ) : (
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase">
                                لوحة التحكم
                            </h1>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:items-center gap-6">
                    {isTeacher && (
                        <div className="relative flex items-center gap-5 bg-gray-950 px-6 py-4 border-2 border-white/20 rounded-none shadow-xl min-w-[200px]">
                            <div className="p-2.5 bg-primary-600 text-white border-2 border-white/20">
                                <Wallet size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 line-clamp-1">الراتب الشهري</p>
                                <p className="text-white text-2xl font-black leading-none whitespace-nowrap tabular-nums">
                                    {stats.monthNetProfit.toLocaleString()}
                                    <span className="text-xs opacity-60 mr-1">ج.م</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <Link to="/appointments" className="relative flex items-center gap-5 bg-primary-800 hover:bg-primary-900 px-6 py-4 border-2 border-white/20 rounded-none shadow-xl w-full sm:w-48 group">
                        <div className="p-2.5 bg-white/10 text-white border-2 border-white/10 group-hover:bg-white group-hover:text-primary-900">
                            <CalendarCheck size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 group-hover:text-white">اليوم</p>
                            <p className="text-white text-2xl font-black leading-none tabular-nums">{stats.todaySessions}</p>
                        </div>
                    </Link>

                    <div className="relative flex items-center gap-5 bg-gray-950 px-6 py-4 border-2 border-white/20 rounded-none shadow-xl w-full sm:w-48">
                        <div className="p-2.5 bg-white/5 text-amber-500 border-2 border-white/10">
                            <Clock size={20} />
                        </div>
                        <div className="text-right font-mono">
                            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-center font-sans">الوقت الفعلي</p>
                            <p className="text-white text-sm lg:text-base font-black leading-none tracking-tighter tabular-nums">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
