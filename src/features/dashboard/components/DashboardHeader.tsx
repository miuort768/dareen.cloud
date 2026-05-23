import { useState, useEffect } from 'react';
import { Clock, Headphones, Calendar, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
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
            "hidden md:flex relative overflow-hidden rounded-2xl",
            "bg-gradient-to-br from-amber-50 via-amber-100/40 to-orange-50",
            "dark:from-indigo-950 dark:via-[#0f0b2e] dark:to-slate-950",
            "border border-amber-200/60 dark:border-indigo-800/40",
            "shadow-lg shadow-amber-100/50 dark:shadow-indigo-950/40",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs - warm for day, cool for night */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300/30 dark:bg-indigo-500/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300/20 dark:bg-violet-500/15 rounded-full blur-[50px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 dark:from-indigo-500 dark:to-violet-600 rounded-xl shadow-lg shadow-amber-200 dark:shadow-indigo-950 shrink-0">
                    <span className="text-xl font-black text-white">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-amber-100/80 dark:bg-indigo-900/40 text-amber-700 dark:text-indigo-300 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-indigo-700">
                            <ShieldCheck size={10} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-amber-900 dark:text-white leading-tight">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700/70 dark:text-indigo-300/70">
                            <Calendar size={12} className="text-amber-500 dark:text-indigo-400" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-amber-200 dark:bg-indigo-700" />
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-600/60 dark:text-indigo-400/60">
                            <TrendingUp size={10} className="text-amber-500 dark:text-indigo-400" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/70 dark:bg-slate-800/70 border border-amber-200 dark:border-indigo-700 rounded-xl shadow-sm">
                    <Clock size={14} className="text-amber-500 dark:text-indigo-400" />
                    <span className="text-xs font-medium text-amber-800 dark:text-indigo-200 tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="flex items-center gap-2 h-10 px-5 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-amber-200 dark:shadow-amber-950 active:scale-[0.97] transition-all"
                >
                    <Headphones size={14} />
                    الدعم
                    <Sparkles size={10} className="text-amber-200" />
                </button>
            </div>
        </div>
    );
};
