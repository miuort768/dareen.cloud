import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, CalendarDays, Compass } from 'lucide-react';
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
                "relative overflow-hidden rounded-2xl p-6 md:p-8",
                "bg-primary",
                "font-dash"
            )}
            dir="rtl"
        >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Compass size={22} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-6 px-2.5 rounded-lg border-white/20 text-white bg-white/10 text-[10px] gap-1 font-semibold">
                                <ShieldCheck size={10} />
                                {isTeacher ? 'معلم معتمد' : 'مدير النظام'}
                            </Badge>
                            <Badge variant="success" className="h-6 px-2.5 rounded-lg text-[10px] gap-1.5 font-semibold bg-white/15 border-white/20 text-white">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                النظام نشط
                            </Badge>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                            {greeting()}، {currentUser?.name || 'المستخدم'}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <CalendarDays size={13} />
                            {dateStr}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/10 text-white text-sm font-semibold tabular-nums">
                    <Clock size={13} />
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
