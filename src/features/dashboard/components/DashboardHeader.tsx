import { useState, useEffect } from 'react';
import { Clock, Headphones, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
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
            "hidden md:flex relative overflow-hidden bg-indigo-900 dark:bg-slate-950 px-6 md:px-8 py-6 flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 rounded-none mb-6 shadow-2xl shadow-indigo-500/10"
        )} dir="rtl">
            
            {/* Glows from Finance style */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rotate-45 translate-y-[-50%] translate-x-[30%] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-500/10 rotate-12 translate-y-[40%] blur-3xl pointer-events-none" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 border border-white/20 rounded-none transition-all hover:bg-white/20">
                    <ShieldCheck size={24} className="text-white" />
                </div>
                
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="bg-white/20 text-white border border-white/10 text-[9px] font-black px-2 py-0.5 uppercase tracking-widest leading-none flex items-center gap-1.5 rounded-none">
                            <ShieldCheck size={10} className="text-amber-400" />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </div>
                        <Sparkles className="text-amber-400 animate-pulse" size={14} />
                    </div>
                    <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tighter text-white uppercase">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'مركز القيادة والتحكم'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-white/60">
                            <Calendar size={12} className="text-amber-400" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                        </p>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">مركز العمليات المباشر</p>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                {/* Time Widget */}
                <div className="flex items-center gap-2.5 px-4 h-10 border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white rounded-none">
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-xs font-black tabular-nums uppercase tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>

                {/* Support Button */}
                <button
                    onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="h-10 px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-[0.98] bg-amber-500 hover:bg-amber-600 text-white border border-amber-400/50 rounded-none shadow-lg shadow-amber-500/20"
                >
                    <Headphones size={14} />
                    <span>الدعم الفني</span>
                </button>
            </div>
        </div>
    );
};
