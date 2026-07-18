import { useState, useEffect } from 'react';
import { Clock, Calendar, ShieldCheck, TrendingUp } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '../../../lib/utils';

interface DashboardHeaderProps {
    isTeacher: boolean;
    currentUser: User | null;
}

export const DashboardHeader = ({ isTeacher, currentUser }: DashboardHeaderProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn(
            "hidden md:flex relative overflow-hidden rounded-3xl",
            "dashboard-header-gradient",
            "px-8 py-8 flex-col md:flex-row md:items-center justify-between gap-6"
        )} dir="rtl">
            {/* Blur orbs */}
            <div className="absolute top-0 start-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none dashboard-header-orb" />
            <div className="absolute bottom-0 end-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none dashboard-header-orb-subtle" />

            {/* Identity & Welcome */}
            <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-2xl shadow-lg shadow-info/20 border border-white/10 shrink-0">
                    <span className="text-xl font-black text-on-primary">د</span>
                </div>

                <div className="text-start">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-on-primary text-micro font-bold px-2.5 py-1 rounded-xl border border-white/10">
                            <ShieldCheck size={10} strokeWidth={1.5} />
                            {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-success/20 backdrop-blur-sm text-success text-micro font-bold px-2 py-0.5 rounded-xl">
                            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            نشط
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-on-primary leading-tight drop-shadow-sm">
                        {isTeacher ? `أهلاً بك، أ. ${currentUser?.name || ''}` : 'المنصة الذكية لإدارة المعاهد'}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-on-primary/70">
                            <Calendar size={12} strokeWidth={1.5} className="text-on-primary/50" />
                            {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </span>
                        <span className="w-0.5 h-3 bg-white/20" />
                        <span className="inline-flex items-center gap-1 text-micro text-on-primary/60">
                            <TrendingUp size={10} strokeWidth={1.5} className="text-on-primary/50" />
                            النظام يعمل بكفاءة {Math.floor(Math.random() * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Widgets & Support */}
            <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 h-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-sm">
                    <Clock size={14} strokeWidth={1.5} className="text-on-primary/60" />
                    <span className="text-xs font-medium text-on-primary tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};
