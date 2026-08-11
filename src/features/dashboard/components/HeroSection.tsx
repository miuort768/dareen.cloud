import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, CalendarDays, Clock, TrendingUp, Users, Target, Sparkles } from 'lucide-react';
import type { User } from '../../../types/auth';
import type { DashboardStats } from '../types';

interface HeroSectionProps {
    currentUser: User | null;
    stats?: DashboardStats;
}

const roleLabels: Record<string, string> = {
    admin: 'المدير التنفيذي',
    teacher: 'معلم',
    parent: 'ولي أمر',
    student: 'طالب',
};

export const HeroSection = ({ currentUser, stats }: HeroSectionProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';

    const dateStr = useMemo(() => new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long', day: 'numeric', month: 'long',
    }).format(new Date()), []);

    const firstName = (currentUser?.name || 'المستخدم').split(' ')[0];
    const roleLabel = roleLabels[currentUser?.role || ''] || 'مستخدم';

    const performanceScore = stats?.attendanceRate
        ? Math.round((stats.attendanceRate * 0.4) + ((stats.totalNetProfit || 0) > 0 ? 30 : 10) + (stats.studentsCount > 0 ? 20 : 0) + (stats.monthCompletedSessions > 0 ? 10 : 0))
        : 0;

    const heroStats = [
        {
            icon: TrendingUp,
            value: `+${Math.max(0, stats?.monthCompletedSessions || 0)}`,
            label: 'نمو هذا الأسبوع',
            trend: 'up' as const,
        },
        {
            icon: Users,
            value: stats?.studentsCount || 0,
            label: 'طالب نشط',
            trend: 'up' as const,
        },
        {
            icon: Target,
            value: `${Math.min(100, performanceScore)}%`,
            label: 'مؤشر الأداء',
            trend: (performanceScore > 60 ? 'up' : 'down') as const,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border overflow-hidden"
            dir="rtl"
        >
            <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-14 h-14 rounded-2xl bg-primary dark:bg-primary flex items-center justify-center shadow-elevation-1"
                        >
                            <span className="text-xl font-bold text-on-primary dark:text-on-primary">{firstName.charAt(0)}</span>
                        </motion.div>
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="text-lg md:text-2xl font-bold text-main dark:text-main leading-tight"
                            >
                                {greeting}، {firstName}
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="flex items-center gap-3 mt-1"
                            >
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                                    <Sparkles size={10} />
                                    {roleLabel}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm text-muted dark:text-muted">
                                    <CalendarDays size={12} />
                                    <span className="text-[11px]">{dateStr}</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="hidden sm:flex items-center gap-1.5 px-3 h-7 rounded-lg bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary text-[10px] font-semibold tabular-nums"
                        >
                            <Clock size={10} />
                            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.45, duration: 0.3 }}
                            className="relative w-10 h-10 rounded-xl bg-surface dark:bg-hover flex items-center justify-center text-muted dark:text-muted hover:bg-border/50 dark:hover:bg-primary/10 transition-colors"
                            aria-label="الإشعارات"
                        >
                            <Bell size={16} />
                            <span className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface dark:border-card" />
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {heroStats.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                className="relative group"
                            >
                                <div className="bg-surface dark:bg-hover rounded-xl p-4 border border-border dark:border-border hover:border-primary/30 dark:hover:border-border transition-all duration-300">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Icon size={16} className="text-primary dark:text-primary" />
                                            <span className="text-2xl font-bold text-main dark:text-main tabular-nums tracking-tight">
                                                {item.value}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-success text-[10px] font-bold">
                                            <TrendingUp size={10} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted dark:text-muted font-medium">{item.label}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
