import { useState, useEffect } from 'react';
import { GraduationCap, Clock, CalendarCheck } from 'lucide-react';
import type { User } from '../../../types/auth';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-10 xl:gap-40 relative z-10 w-full max-w-6xl mx-auto">
            {/* User Greeting Section */}
            <div className="flex items-center gap-5">
                <div className="relative group">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-none flex items-center justify-center border-2 border-indigo-500 shadow-none transform transition-transform duration-500 group-hover:rotate-6">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                </div>
                
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name}` : 'لوحة التحكم الاستراتيجية'}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-none border border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <CalendarCheck size={12} className="text-indigo-600" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </div>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">معهد دارين للتعليم والتدريب</span>
                    </div>
                </div>
            </div>

            {/* Top Dashboard Actions - Simplified */}
            <div className="flex items-center gap-4">
                
                {/* 🕒 Sharp Clock Widget */}
                <div className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none border-2 border-slate-950 gap-4 group">
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none mb-1 text-left">توقيت دارين</p>
                        <p className="text-base font-black tracking-tighter leading-none tabular-nums font-mono italic">
                           {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                    <div className="w-px h-6 bg-white/20 dark:bg-slate-900/20"></div>
                    <div className="w-8 h-8 bg-white/10 dark:bg-slate-900/5 rounded-none flex items-center justify-center">
                        <Clock size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};
