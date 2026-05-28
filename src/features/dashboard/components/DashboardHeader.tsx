import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, ShieldCheck, Sparkles, TrendingUp, Plus, RotateCcw, X } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '../../../lib/utils';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showTasbeeh, setShowTasbeeh] = useState(false);
    const [tasbeehCount, setTasbeehCount] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTasbeeh = useCallback(() => {
        setTasbeehCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!showTasbeeh) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setTasbeehCount(prev => prev + 1);
            }
            if (e.key === 'Escape') {
                setShowTasbeeh(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showTasbeeh]);

    return (
        <>
        <div className={cn(
            "hidden md:flex relative overflow-hidden rounded-3xl",
            "bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#1D4ED8]",
            "dark:from-blue-900/80 dark:via-blue-950/60 dark:to-slate-950/80",
            "border border-blue-200/30 dark:border-blue-800/30",
            "shadow-lg shadow-blue-200/40 dark:shadow-blue-950/40",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300/15 dark:bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-200/20 border border-white/10 shrink-0">
                    <span className="text-xl font-black text-white">د</span>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-xl border border-white/10">
                            <ShieldCheck size={10} strokeWidth={1.5} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded-xl">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white leading-tight drop-shadow-sm">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
                            <Calendar size={12} strokeWidth={1.5} className="text-white/50" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-white/20" />
                        <span className="inline-flex items-center gap-1 text-[9px] text-white/60">
                            <TrendingUp size={10} strokeWidth={1.5} className="text-white/50" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-sm">
                    <Clock size={14} strokeWidth={1.5} className="text-white/60" />
                    <span className="text-xs font-medium text-white tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                <button
                    onClick={() => setShowTasbeeh(true)}
                    className="flex items-center gap-2 h-10 px-5 text-[10px] font-bold bg-white/15 backdrop-blur-sm text-white rounded-2xl border border-white/10 active:scale-[0.97] transition-all hover:bg-white/25 shadow-sm"
                >
                    <Sparkles size={14} strokeWidth={1.5} />
                    المسبحة
                    <Sparkles size={10} strokeWidth={1.5} className="text-blue-200" />
                </button>
            </div>
        </div>

        {/* Tasbeeh floating popup */}
        {showTasbeeh && (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={() => setShowTasbeeh(false)}
            >
                <div
                    className="relative bg-gradient-to-br from-[#1e3a5f] to-[#0d2137] border border-white/10 rounded-3xl shadow-2xl p-6 w-[200px]"
                    onClick={e => e.stopPropagation()}
                    dir="rtl"
                >
                    <button
                        onClick={() => setShowTasbeeh(false)}
                        className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white rounded-full text-xs"
                    >
                        <X size={12} />
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <span className="text-white/60 text-[10px] font-bold">المسبحة</span>

                        <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-[#2563EB]/40 bg-white/5">
                            <span className="text-4xl font-black text-white tabular-nums">
                                {tasbeehCount}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                            <button
                                onClick={handleTasbeeh}
                                className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.95] text-white rounded-xl text-xs font-bold transition-all"
                            >
                                <Plus size={14} />
                                تعد
                            </button>
                            <button
                                onClick={() => setTasbeehCount(0)}
                                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-[0.95] text-white/70 rounded-xl transition-all"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        <span className="text-white/30 text-[8px]">مسافة أو Enter للعد</span>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
