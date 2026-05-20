import { useState, useEffect } from 'react';
import { Clock, Headphones, Calendar, ShieldCheck, ChevronLeft } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '../../../lib/utils';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn(
            "hidden md:flex relative overflow-hidden",
            "bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900",
            "dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6",
            "rounded-2xl shadow-2xl shadow-indigo-500/15 border border-white/5",
            "before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] before:pointer-events-none"
        )} dir="rtl">

            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <span className="text-2xl font-black text-white/90">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="bg-white/15 text-white border border-white/10 text-[9px] font-black px-2.5 py-1 uppercase tracking-widest leading-none flex items-center gap-1.5 rounded-lg backdrop-blur-sm">
                            <ShieldCheck size={10} className="text-amber-400" />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-400/20">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            نشط
                        </div>
                    </div>
                    <h1 className="text-2xl font-black leading-tight tracking-tighter text-white">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'مركز القيادة والتحكم'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2.5">
                        <p className="text-[10px] font-bold flex items-center gap-1.5 text-white/50">
                            <Calendar size={11} className="text-amber-400/80" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </p>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                            <ChevronLeft size={10} className="text-indigo-400" />
                            مركز العمليات المباشر
                        </p>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                {/* Time Widget */}
                <div className="flex items-center gap-2.5 px-4 h-10 border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white rounded-xl backdrop-blur-sm">
                    <Clock size={15} className="text-amber-400/80" />
                    <span className="text-xs font-bold tabular-nums tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="h-10 px-5 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-[0.97] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border border-amber-400/30 rounded-xl shadow-lg shadow-amber-500/20"
                >
                    <Headphones size={14} />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};
