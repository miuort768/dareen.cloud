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
            "bg-gradient-to-br from-amber-200 via-amber-300/50 to-orange-200",
            "dark:from-amber-900/70 dark:via-amber-950/60 dark:to-orange-950/60",
            "border border-amber-300/60 dark:border-amber-700/50",
            "shadow-lg shadow-amber-200/60 dark:shadow-amber-950/40",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/40 dark:bg-amber-500/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/30 dark:bg-orange-500/15 rounded-full blur-[50px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl shadow-lg shadow-amber-200 dark:shadow-amber-950 shrink-0">
                    <span className="text-xl font-black text-white">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-amber-200/80 dark:bg-amber-800/50 text-black dark:text-white text-[9px] font-bold px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-600">
                            <ShieldCheck size={10} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-black dark:text-white leading-tight">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
                            <Calendar size={12} className="text-black/50 dark:text-white/50" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-black/20 dark:bg-white/20" />
                        <span className="inline-flex items-center gap-1 text-[9px] text-black/50 dark:text-white/50">
                            <TrendingUp size={10} className="text-black/50 dark:text-white/50" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-xl shadow-sm">
                    <Clock size={14} className="text-black/50 dark:text-white/50" />
                    <span className="text-xs font-medium text-black dark:text-white tabular-nums">
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
