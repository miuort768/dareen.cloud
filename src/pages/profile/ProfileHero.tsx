import { useState, useEffect } from 'react';
import { ArrowRight, Settings, Share2, Edit3, Clock, ShieldCheck, CalendarDays, Users, BookOpen, Play, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button } from '../../shared/components/ui';
import { useCurrentUser, useShowNotification } from '../../context/AppContext';
import type { DashboardStats } from '../../features/dashboard/types';

interface ProfileHeroProps {
    name: string;
    role: 'student' | 'teacher' | 'parent';
    subtitle?: string;
    points?: number;
    rank?: { name: string; icon: string };
    attendanceRate?: number;
    stats?: DashboardStats;
}

const ROLE_CONFIG = {
    student: { label: 'طالب', color: 'bg-primary-soft text-primary', dashboard: '/student-dashboard', gradient: 'from-primary via-primary-deep to-primary-soft' },
    teacher: { label: 'معلم', color: 'bg-info-soft text-info', dashboard: '/teacher-dashboard', gradient: 'from-primary via-primary-deep to-primary-soft' },
    parent: { label: 'ولي أمر', color: 'bg-warning-soft text-warning', dashboard: '/parent-dashboard', gradient: 'from-primary via-primary-deep to-primary-soft' },
};

export const ProfileHero = ({ name, role, subtitle, points, rank, attendanceRate, stats }: ProfileHeroProps) => {
    const navigate = useNavigate();
    const config = ROLE_CONFIG[role];
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const canAccessSettings = !!currentUser && (currentUser.permissions?.includes('*') || currentUser.permissions?.includes('settings'));

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: document.title, url });
                return;
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            showNotification('تم نسخ رابط الملف الشخصي', 'success');
        } catch {
            showNotification('تعذر نسخ الرابط', 'error');
        }
    };

    const dateStr = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    const quickStats = [
        { icon: Star, value: points ?? stats?.teacherPoints ?? 0, label: 'نقاط', color: 'text-warning' },
        { icon: Users, value: stats?.studentsCount ?? 0, label: 'طالب', color: 'text-white/80' },
        { icon: BookOpen, value: stats?.totalEnrollments ?? 0, label: 'اشتراك', color: 'text-white/80' },
        { icon: Play, value: stats?.todaySessions ?? 0, label: 'حصص اليوم', color: 'text-white/80' },
        { icon: DollarSign, value: stats?.teacherSessionPrice ?? 0, label: 'سعر الحصة', color: 'text-white/80', prefix: 'د.ك' },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft" dir="rtl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-12 -start-12 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={() => navigate(config.dashboard)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold hover:bg-white/25 transition-colors"
                    >
                        <ArrowRight size={12} />
                        العودة للوحة التحكم
                    </button>
                    <div className="flex items-center gap-2">
                        {canAccessSettings && (
                            <>
                                <button onClick={() => navigate('/settings')} className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors" title="تعديل الملف الشخصي" aria-label="تعديل الملف الشخصي">
                                    <Edit3 size={13} className="text-white" />
                                </button>
                                <button onClick={() => navigate('/settings')} className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors" title="الإعدادات" aria-label="الإعدادات">
                                    <Settings size={13} className="text-white" />
                                </button>
                            </>
                        )}
                        <button onClick={handleShare} className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors" title="مشاركة الملف" aria-label="مشاركة الملف">
                            <Share2 size={13} className="text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <Avatar name={name} size="xl" />
                            <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full bg-success border-2 border-primary-deep">
                                <div className="w-full h-full rounded-full bg-success animate-ping opacity-50" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${config.color}`}>
                                    {config.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success/20 text-white text-[10px] font-semibold">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    متصل الآن
                                </span>
                            </div>
                            <h1 className="text-xl md:text-[28px] font-bold text-white leading-tight mb-0.5">{name}</h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                {subtitle && <span className="text-sm text-white/80 font-medium">{subtitle}</span>}
                                {rank && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-white text-[10px] font-semibold">
                                        {rank.icon} {rank.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-bold tabular-nums shrink-0 self-start md:self-center">
                        <Clock size={14} />
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 mt-5 pt-5 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-white/60 text-[11px] font-medium">
                        <CalendarDays size={12} />
                        {dateStr}
                    </span>
                    <div className="flex items-center gap-3">
                        {quickStats.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/8 backdrop-blur-sm">
                                <s.icon size={11} className={s.color} />
                                <span className="text-xs font-bold text-white tabular-nums">{s.value}{s.prefix ? ` ${s.prefix}` : ''}</span>
                                <span className="text-[10px] text-white/60">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
