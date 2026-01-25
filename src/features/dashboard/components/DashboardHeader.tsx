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
        <div className="relative -mx-4 -mt-4 lg:mx-0 lg:mt-0 bg-primary-600 p-6 lg:p-10 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none">
            {/* Background Geometric Enhancement - Richer & Larger Shapes */}
            {/* Major Glows & Blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-20 -mt-60 blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary-400/20 rounded-full -ml-40 -mb-80 blur-[180px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none"></div>

            {/* Large Structural Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[120%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
            <div className="absolute top-[-20%] right-[10%] w-[150px] h-[150%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

            {/* Large Geometric Outlines */}
            <div className="absolute top-1/2 right-10 w-96 h-96 border-[40px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-[-50px] left-1/4 w-64 h-64 border-[2px] border-white/10 rounded-[4rem] rotate-45 pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-1/4 w-80 h-80 border-[1px] border-white/20 rounded-full pointer-events-none"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            {/* Foreground Accents */}
            <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-white/5 rounded-3xl rotate-[35deg] backdrop-blur-md border border-white/10 pointer-events-none hidden lg:block"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-tr from-primary-400/20 to-transparent rounded-[3rem] -rotate-12 pointer-events-none"></div>

            {/* Central Geometric Decoration */}
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-[30deg] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] pointer-events-none"></div>

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative group">
                        <GraduationCap size={24} className="text-white lg:hidden" />
                        <GraduationCap size={36} className="text-white hidden lg:block" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-1 text-right">
                        <span className="text-white/80 text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase block mb-1">دارين لتعليم و التدريب</span>
                        {isTeacher ? (
                            <>

                                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                                    أ. {currentUser?.name}
                                </h1>
                            </>
                        ) : (
                            <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-white tracking-tight">
                                نظرة عامة
                            </h1>
                        )}
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

                    <Link to="/appointments" className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl px-5 py-3 border border-white/10 rounded-none transition-all active:scale-95 shadow-2xl overflow-hidden w-full sm:w-40">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative p-2 bg-white/10 text-white rounded-none group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <CalendarCheck size={20} />
                        </div>
                        <div className="relative text-right">
                            <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 group-hover:text-white/80">حصص اليوم</p>
                            <p className="text-white text-xl font-black leading-none">{stats.todaySessions}</p>
                        </div>
                    </Link>

                    <div className="group relative flex items-center gap-4 bg-black/40 backdrop-blur-xl px-5 py-3 border border-white/10 rounded-none shadow-2xl w-full sm:w-40 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent"></div>
                        <div className="relative p-1.5 bg-white/5 text-amber-400 rounded-none border border-white/5">
                            <Clock size={16} />
                        </div>
                        <div className="relative text-right font-mono">
                            <p className="text-white/50 text-[8px] font-black uppercase tracking-[0.1em] leading-none mb-1 text-center font-sans">الوقت الفعلي</p>
                            <p className="text-white text-[10px] lg:text-xs font-black leading-none tracking-tight tabular-nums">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
