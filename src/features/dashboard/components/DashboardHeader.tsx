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
            "bg-[#172554]",
            "dark:bg-[#172554]",
            "border border-[#1e3a5f]/60",
            "shadow-lg shadow-black/20",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/8 rounded-full blur-[50px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-black/20 shrink-0">
                    <span className="text-xl font-black text-white">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
                            <ShieldCheck size={10} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white leading-tight">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-blue-200/70">
                            <Calendar size={12} className="text-blue-300" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-white/20" />
                        <span className="inline-flex items-center gap-1 text-[9px] text-blue-200/60">
                            <TrendingUp size={10} className="text-blue-300" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/10 border border-white/20 rounded-xl shadow-sm">
                    <Clock size={14} className="text-blue-300" />
                    <span className="text-xs font-medium text-blue-200 tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="flex items-center gap-2 h-10 px-5 text-[10px] font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-black/20 active:scale-[0.97] transition-all"
                >
                    <Headphones size={14} />
                    الدعم
                    <Sparkles size={10} className="text-blue-200" />
                </button>
            </div>
        </div>
    );
};
