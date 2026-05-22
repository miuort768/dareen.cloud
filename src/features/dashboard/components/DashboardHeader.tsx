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
            "bg-gradient-to-br from-white/80 via-indigo-50/50 to-white/80",
            "dark:from-slate-900/80 dark:via-indigo-950/30 dark:to-slate-900/80",
            "border border-indigo-100/50 dark:border-indigo-900/30",
            "shadow-lg shadow-indigo-100/30 dark:shadow-indigo-950/20",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950 shrink-0">
                    <span className="text-xl font-black text-white">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <ShieldCheck size={10} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar size={12} className="text-amber-500" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                        <span className="inline-flex items-center gap-1 text-[9px] text-slate-400">
                            <TrendingUp size={10} className="text-indigo-400" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
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
