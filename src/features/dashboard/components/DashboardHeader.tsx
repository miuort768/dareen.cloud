import { useState, useEffect } from 'react';
import { Clock, Headphones, Calendar, ShieldCheck, ChevronLeft, Sparkles, TrendingUp } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '../../../lib/utils';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn(
            "hidden md:flex relative overflow-hidden",
            "bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950",
            "dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950",
            "px-8 py-10 flex-col md:flex-row md:items-center justify-between gap-6",
            "rounded-3xl shadow-2xl shadow-indigo-600/20 border border-white/5",
            "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_70%)] before:pointer-events-none",
            "transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-700/25",
            isHovered ? "hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]" : ""
        )} dir="rtl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >

            {/* Animated background particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-[50px] animate-[orbit_20s_linear_infinite]"></div>
                <div className="absolute bottom-10 left-10 w-16 h-16 bg-emerald-500/10 rounded-full blur-[40px] animate-[orbit_15s_linear_infinite_reverse]"></div>
                <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-rose-500/10 rounded-full blur-[30px] animate-[orbit_12s_linear_infinite]"></div>
            </div>

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-20 blur-[8px]" />
                    <div className="relative w-16 h-16 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-lg flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.25)">
                        <div className="relative z-10">
                            <span className="text-2xl font-black text-white/90">د</span>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/15 text-white border border-white/10 text-[9px] font-black px-3 py-1.5 uppercase tracking-widest leading-none flex items-center gap-1.5 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all">
                                <ShieldCheck size={10} className="text-amber-400" />
                                {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-400/20 hover:bg-emerald-500/30 transition-all">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="animate-[pulse_2s_ease_in_out_infinite]">نشط</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black leading-tight tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 via-indigo-200 to-white/20">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-white/60">
                            <Calendar size={12} className="text-amber-400/80" />
                            <span className="text-xs font-bold tabular-nums tracking-widest">
                                {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                            </span>
                        </div>
                        <span className="w-0.5 h-0.5 bg-white/10 rounded-full" />
                        <div className="flex items-center gap-2 text-white/40 uppercase tracking-widest text-[9px]">
                            <TrendingUp size={10} className="text-indigo-400/60 animate-[rise_3s_ease_in_out_infinite]" />
                            <span>النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
                {/* Time Widget */}
                <div className="relative flex items-center gap-3 px-5 h-11 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-md">
                    <div className="absolute inset-0 rounded-2xl bg-white/3 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
                    <Clock size={16} className="text-amber-400/80" />
                    <span className="text-xs font-bold tabular-nums tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="relative flex h-11 px-6 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border border-amber-400/30 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-600/25"
                >
                    <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
                    <Headphones size={16} />
                    <span>الدعم الفني المتقدم</span>
                    <Sparkles size={12} className="ml-2 text-amber-300/70 animate-[sparkle_2s_ease_in_out_infinite]" />
                </button>
            </div>
        </div>
    );
};
