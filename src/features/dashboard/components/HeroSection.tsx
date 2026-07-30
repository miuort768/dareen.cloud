import { useState, useEffect } from 'react';
import { Bell, CalendarDays, Clock, Users, Presentation, BookOpen, DollarSign } from 'lucide-react';
import type { User } from '../../../types/auth';
import type { DashboardStats } from '../types';

interface HeroSectionProps {
    currentUser: User | null;
    isTeacher?: boolean;
    stats?: DashboardStats;
}

export const HeroSection = ({ currentUser, stats }: HeroSectionProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء الخير';

    const dateStr = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long', day: 'numeric', month: 'long',
    }).format(new Date());

    const firstName = (currentUser?.name || 'المستخدم').split(' ')[0];

    const summaryItems = [
        { icon: Users, value: stats?.studentsCount || 0, label: 'طلاب' },
        { icon: Presentation, value: stats?.teachersCount || 0, label: 'معلمات' },
        { icon: BookOpen, value: stats?.totalEnrollments || 0, label: 'اشتراكات' },
        { icon: DollarSign, value: stats?.monthRevenue ? `${(stats.monthRevenue / 1000).toFixed(1)}k` : '0', label: 'الإيرادات' },
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-active p-6 md:p-8" dir="rtl">
            <div className="absolute inset-0 opacity-[0.06]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-dots)" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg shadow-black/10 ring-2 ring-white/30">
                            <span className="text-lg font-bold text-white">{firstName.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-white leading-tight">
                                {greeting}، {firstName}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-white/70 mt-0.5">
                                <CalendarDays size={12} />
                                <span>{dateStr}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 h-7 rounded-lg bg-white/15 text-white/80 text-[10px] font-semibold tabular-nums">
                            <Clock size={10} />
                            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                        <button className="relative w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-colors" aria-label="الإشعارات">
                            <Bell size={15} />
                            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 bg-error rounded-full border-2 border-primary" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {summaryItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <Icon size={14} className="text-white/70" />
                                    <span className="text-sm font-bold text-white tabular-nums">{item.value}</span>
                                </div>
                                <p className="text-[10px] text-white/60 mt-0.5">{item.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
