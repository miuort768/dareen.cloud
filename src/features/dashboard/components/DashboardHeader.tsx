import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Clock, CalendarCheck, Wallet, Bell, Search, Settings } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* User Greeting Section */}
            <div className="flex items-center gap-5">
                <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 transform transition-transform duration-500 group-hover:rotate-6">
                        <GraduationCap size={32} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#f8fafc] dark:border-[#020617] rounded-full"></div>
                </div>
                
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name}` : 'لوحة التحكم الاستراتيجية'}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <CalendarCheck size={12} className="text-indigo-500" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-xs font-medium text-slate-400">أكاديمية دارين التعليمية</span>
                    </div>
                </div>
            </div>

            {/* Top Dashboard Actions */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Search Bar (Modern) */}
                <div className="hidden lg:flex items-center px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all group min-w-[240px]">
                    <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="بحث سريع عن طالب أو حصة..." 
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 flex-1 mr-3 text-right"
                    />
                </div>

                {/* Notifications & Settings Buttons */}
                <div className="flex items-center gap-2">
                    <button className="w-11 h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                        <Bell size={20} />
                    </button>
                    <button className="w-11 h-11 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Quick Info Box */}
                <div className="flex items-center px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 gap-4 group">
                    <div className="text-right">
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest leading-none mb-1 text-left">توقيت دارين</p>
                        <p className="text-lg font-black tracking-tight leading-none tabular-nums font-mono">
                           {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-white/10 dark:bg-slate-900/10"></div>
                    <div className="w-10 h-10 bg-white/10 dark:bg-slate-900/5 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};
