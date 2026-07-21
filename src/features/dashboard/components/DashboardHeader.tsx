import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sparkles, CalendarDays } from 'lucide-react';
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
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-6 md:p-8">
            {/* Subtle background decoration */}
            <div className="absolute -top-20 -end-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -start-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                        <Sparkles size={22} className="text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/20 text-primary bg-primary/5 gap-1">
                                <ShieldCheck size={10} />
                                {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                            </Badge>
                            <Badge variant="success" className="text-[10px] h-5 px-2 gap-1">
                                <span className="w-1.5 h-1.5 bg-on-success rounded-full animate-pulse" />
                                النظام نشط
                            </Badge>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-main leading-tight">
                            {greeting()}، {currentUser?.name || 'المستخدم'}
                        </h1>
                        <p className="text-sm text-muted mt-0.5 flex items-center gap-2">
                            <CalendarDays size={13} className="text-muted" />
                            {dateStr}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 h-9 bg-card border border-border/50 rounded-xl text-muted text-xs font-medium tabular-nums">
                        <Clock size={13} className="text-primary" />
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
