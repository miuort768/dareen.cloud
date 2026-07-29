import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, CalendarDays, Sparkles } from 'lucide-react';
import type { User } from '../../../types/auth';

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

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'تصبح على خير';
        if (hour < 12) return 'صباح الخير';
        if (hour < 17) return 'مساء الخير';
        return 'مساء الخير';
    };

    const dateStr = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-deep to-primary-soft p-6 md:p-8" dir="rtl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-12 -start-12 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <Sparkles size={26} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-white text-[10px] font-semibold">
                                <ShieldCheck size={10} />
                                {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/20 text-white text-[10px] font-semibold">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                النظام نشط
                            </span>
                        </div>
                        <h1 className="text-xl md:text-[28px] font-bold text-white leading-tight">
                            {greeting()}، {currentUser?.name || 'المستخدم'}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {dateStr}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-bold tabular-nums">
                    <Clock size={14} />
                    {currentTime.toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    })}
                </div>
            </div>
        </div>
    );
};