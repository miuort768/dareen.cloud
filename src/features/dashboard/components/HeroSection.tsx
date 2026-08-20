import { useMemo } from 'react';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';
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

const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 5) return 'تصبح على خير';
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء الخير';
};

const getFormattedDate = (): string => {
    return new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long', day: 'numeric', month: 'long',
    }).format(new Date());
};

export const HeroSection = ({ currentUser, stats }: HeroSectionProps) => {
    const firstName = (currentUser?.name || 'المستخدم').split(' ')[0];
    const roleLabel = roleLabels[currentUser?.role || ''] || 'مستخدم';
    
    const performanceScore = stats?.attendanceRate
        ? Math.round((stats.attendanceRate * 0.4) + ((stats.totalNetProfit || 0) > 0 ? 30 : 10) + (stats.studentsCount > 0 ? 20 : 0) + (stats.monthCompletedSessions > 0 ? 10 : 0))
        : 0;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((performanceScore || 0) / 100) * circumference;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-elevation-1 transition-all duration-300 md:p-8" dir="rtl">
            <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <Target size={12} />
                            {roleLabel}
                        </span>
                        <span className="text-xs font-medium text-muted">
                            <Calendar size={12} className="inline me-1" />
                            {getFormattedDate()}
                        </span>
                    </div>

                    <h1 className="mb-2 text-2xl font-black leading-tight text-main md:text-3xl">
                        {getGreeting()}، {firstName}
                    </h1>

                    <p className="text-sm font-bold text-muted">
                        مرحباً بك في لوحة تحكم الإدارة. أداء المنصة مستقر.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-end">
                    <div className="relative shrink-0">
                        <svg className="h-[110px] w-[110px] -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none" stroke="currentColor"
                                className="text-border/50" strokeWidth="8"
                            />
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none" stroke="currentColor"
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={offset}
                                className="text-primary transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-main tabular-nums">{performanceScore}%</span>
                            <span className="text-[10px] font-bold text-muted">مؤشر الأداء</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row">
                        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted">نمو هذا الأسبوع</p>
                                <p className="text-base font-black text-main tabular-nums" dir="ltr">
                                    +{Math.max(0, stats?.monthCompletedSessions || 0)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted">إجمالي الطلاب</p>
                                <p className="text-base font-black text-main tabular-nums">
                                    {stats?.studentsCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

