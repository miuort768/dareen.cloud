import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sparkles, CalendarDays, Compass } from 'lucide-react';
import type { User } from '../../../types/auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl p-8",
                "bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5",
                "border border-white/20 dark:border-white/10",
                "backdrop-blur-xl",
                "shadow-[0_8px_32px_-4px_rgba(99,102,241,0.1)]",
                "font-dash"
            )}
            dir="rtl"
        >
            {/* Gradient Orbs */}
            <div className="absolute -top-24 -end-24 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -start-16 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
                        <Compass size={24} className="text-white" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-6 px-3 rounded-xl border-primary/20 text-primary bg-white/40 dark:bg-white/5 backdrop-blur-sm text-[10px] gap-1 font-semibold">
                                <ShieldCheck size={10} />
                                {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                            </Badge>
                            <Badge variant="success" className="h-6 px-3 rounded-xl text-[10px] gap-1.5 font-semibold bg-gradient-to-r from-success to-emerald-500 border-0">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                النظام نشط
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-main leading-tight tracking-tight">
                            {greeting()}، {currentUser?.name || 'المستخدم'}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-muted">
                            <CalendarDays size={14} className="text-primary/60" />
                            {dateStr}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-muted text-sm font-semibold tabular-nums shadow-sm">
                        <Clock size={14} className="text-primary" />
                        {currentTime.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
