import { useState, useEffect } from 'react';
import { ArrowRight, Settings, Share2, Download, Edit3, Clock, CalendarDays, Users, BookOpen, Play, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../shared/components/ui';
import { useCurrentUser, useShowNotification } from '../../context/AppContext';
import { CURRENCY_SYMBOL } from '../../config/constants';
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
    student: { label: 'طالب', color: 'bg-primary-soft text-primary', dashboard: '/student-dashboard' },
    teacher: { label: 'معلم معتمد', color: 'bg-primary-soft text-primary', dashboard: '/teacher-dashboard' },
    parent: { label: 'ولي أمر', color: 'bg-warning-soft text-warning', dashboard: '/parent-dashboard' },
};

export const ProfileHero = ({ name, role, subtitle, points, rank, stats }: ProfileHeroProps) => {
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

    const handleDownload = async () => {
        try {
            const name = currentUser?.name || name;
            const username = currentUser?.username || '';
            const text = `${name}\n${username}`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'teacher-data.txt';
            a.click();
            URL.revokeObjectURL(url);
            showNotification('تم تحميل بيانات المعلمة', 'success');
        } catch (error) {
            showNotification('تعذر تحميل البيانات', 'error');
        }
    };

    const dateStr = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    const quickStats = [
        { icon: Star, value: points ?? stats?.teacherPoints ?? 0, label: 'نقاط', color: 'text-warning' },
        { icon: Users, value: stats?.studentsCount ?? 0, label: 'طالب', color: 'text-primary' },
        { icon: BookOpen, value: stats?.totalEnrollments ?? 0, label: 'اشتراك', color: 'text-info' },
        { icon: Play, value: stats?.todaySessions ?? 0, label: 'حصص اليوم', color: 'text-success' },
        { icon: DollarSign, value: stats?.teacherSessionPrice ?? 0, label: 'سعر الحصة', color: 'text-primary', prefix: CURRENCY_SYMBOL },
    ];

    return (
        <div className="rounded-2xl bg-surface dark:bg-card border border-border dark:border-border overflow-hidden" dir="rtl">
            <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={() => navigate(config.dashboard)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/15 transition-colors"
                    >
                        <ArrowRight size={12} />
                        العودة للوحة التحكم
                    </button>
                    <div className="flex items-center gap-2">
                        {canAccessSettings && (
                            <>
                                <button onClick={() => navigate('/settings')} className="w-8 h-8 rounded-xl bg-surface dark:bg-hover flex items-center justify-center hover:bg-border/50 dark:hover:bg-primary/10 transition-colors" title="تعديل الملف الشخصي" aria-label="تعديل الملف الشخصي">
                                    <Edit3 size={13} className="text-muted dark:text-muted" />
                                </button>
                                <button onClick={() => navigate('/settings')} className="w-8 h-8 rounded-xl bg-surface dark:bg-hover flex items-center justify-center hover:bg-border/50 dark:hover:bg-primary/10 transition-colors" title="الإعدادات" aria-label="الإعدادات">
                                    <Settings size={13} className="text-muted dark:text-muted" />
                                </button>
                            </>
                        )}
<button onClick={handleDownload} className="w-8 h-8 rounded-xl bg-surface dark:bg-hover flex items-center justify-center hover:bg-border/50 dark:hover:bg-primary/10 transition-colors" title="تحميل البيانات">
                                    <Download size={13} className="text-primary" />
                                </button>
                                <button onClick={handleShare} className="w-8 h-8 rounded-xl bg-surface dark:bg-hover flex items-center justify-center hover:bg-border/50 dark:hover:bg-primary/10 transition-colors" title="مشاركة الملف">
                                    <Share2 size={13} className="text-muted dark:text-muted" />
                                </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <Avatar name={name} size="xl" />
                            <div className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full bg-success border-2 border-surface dark:border-card">
                                <div className="w-full h-full rounded-full bg-success animate-ping opacity-50" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${config.color}`}>
                                    {config.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success/10 text-success text-[10px] font-semibold">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                    متصل الآن
                                </span>
                            </div>
                            <h1 className="text-xl md:text-[26px] font-bold text-main dark:text-main leading-tight mb-0.5">{name}</h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                {subtitle && <span className="text-sm text-muted dark:text-muted font-medium">{subtitle}</span>}
                                {rank && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                                        {rank.icon} {rank.name}
                                    </span>
                                )}
                            </div>
</div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 mt-5 pt-5 border-t border-border dark:border-border">
                    <span className="inline-flex items-center gap-1.5 text-muted dark:text-muted text-[11px] font-medium">
                        <CalendarDays size={12} />
                        {dateStr}
                    </span>
                    <div className="flex items-center gap-3">
                        {quickStats.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface dark:bg-hover">
                                <s.icon size={11} className={s.color} />
                                <span className="text-xs font-bold text-main dark:text-main tabular-nums">{s.value}{s.prefix ? ` ${s.prefix}` : ''}</span>
                                <span className="text-[10px] text-muted dark:text-muted">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
