import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    CalendarDays,
    Star,
    Award,
    User,
    LogOut,
    MessageSquare,
    BookOpen,
    LayoutDashboard,
    Clock,
    TrendingUp,
    CheckCircle,
    Play,
    ChevronLeft,
    MoreHorizontal,
    Home
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout } from '../context/AppContext';
import { StatCard } from '../shared/components/ui/StatCard';
import { confirm } from '../lib/confirmDialog';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';
import type { Student } from '../types';

export const ParentDashboard = () => {
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const logout = useLogout();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Student[]>([]);
    const [allPointLogs, setAllPointLogs] = useState<{ id: string; date: string; status: string; points?: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    const tabs = [
        { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
        { id: 'children', label: 'الأبناء', icon: Users },
        { id: 'schedule', label: 'الجدول', icon: Calendar },
        { id: 'activity', label: 'النشاط', icon: Star },
    ];

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<Student[]>('/parents/my-children');
                setChildren(students);
                
                const sessionsPromises = students.map(async s => {
                    try {
                        return await api.get<unknown[]>(`/parents/child-sessions/${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch sessions for child ${s.id}:`, e);
                        return [];
                    }
                });
                const logsPromises = students.map(async s => {
                    try {
                        return await api.get<unknown[]>(`/student-portal/me/points-log?studentId=${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch logs for child ${s.id}:`, e);
                        return [];
                    }
                });
                
                const [allSessionsResults, allLogsResults] = await Promise.all([
                    Promise.all(sessionsPromises),
                    Promise.all(logsPromises)
                ]);
                
                setSessions(allSessionsResults.flat());
                
                const flattenedLogs = allLogsResults.map((logs, idx) => 
                    (Array.isArray(logs) ? logs : []).map((l: { id: string; date: string; status: string; timestamp?: string; points?: number }) => ({ ...l, studentName: students[idx].name }))
                ).flat();
                
                setAllPointLogs(flattenedLogs.sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                }));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // ── Active timer for parent ──
    const [activeTimers, setActiveTimers] = useState<Student[]>([]);
    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollIdRef = useRef(0);
    const [, setTimerTick] = useState(0);

    useEffect(() => {
        const poll = async () => {
            const id = ++pollIdRef.current;
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('/api/active-sessions/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                if (id !== pollIdRef.current) return;
                const data: Student[] = await res.json();
                setActiveTimers(data);

                const students = await api.get<Student[]>('/parents/my-children');
                if (id !== pollIdRef.current) return;
                setChildren(students);

                if (data.length > 0 && !timerTickRef.current) {
                    timerTickRef.current = setInterval(() => setTimerTick(t => t + 1), 1000);
                } else if (data.length === 0 && timerTickRef.current) {
                    clearInterval(timerTickRef.current);
                    timerTickRef.current = null;
                }
            } catch { console.warn('فشل التحقق من الجلسات النشطة'); }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => {
            clearInterval(interval);
            if (timerTickRef.current) clearInterval(timerTickRef.current);
        };
    }, []);

    const formatTime = (startedAt: string | null | undefined) => {
        if (!startedAt) return '--:--';
        const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const stats = useMemo(() => {
        const completed = sessions.filter(s => s.status === 'completed').length;
        const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
        const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;

        let sessionsUsed = 0;
        let sessionsTotal = 0;
        children.forEach(c => {
            (c.enrollments || []).forEach((en: { teacherName: string; sessionsTotal: number; sessionsUsed: number; nextSessionNotes?: string; schedule?: { day: string; time: string }[] }) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const academicProgress = sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0;
        const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

        return {
            childCount: children.length,
            upcomingSessions,
            attendanceRate,
            academicProgress
        };
    }, [sessions, children]);

    const todayTasks = useMemo(() => {
        const tasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[] = [];
        children.forEach(child => {
            (child.enrollments || []).forEach((en: { teacherName?: string; subject?: string; teacher?: string; schedule?: { day: string; hour: string; period: string }[] }) => {
                (en.schedule || []).forEach((slot: { day: string; hour: string; period: string }) => {
                    if (slot.day === todayArabic) {
                        tasks.push({
                            studentName: child.name,
                            subject: en.subject || en.teacherName || '',
                            teacher: en.teacher || '',
                            time: slot.hour,
                            period: slot.period
                        });
                    }
                });
            });
        });
        return tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }, [children, todayArabic]);

    const points = allPointLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <>
            {/* ─── Desktop version ─── */}
            <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-background via-card to-warning-soft dark:from-bg-surface dark:via-bg-surface dark:to-warning-soft/20 font-sans" dir="rtl">
                <div className="absolute top-0 start-1/4 w-96 h-96 bg-warning-soft opacity-60 dark:opacity-10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 end-1/4 w-80 h-80 bg-warning-soft opacity-60 dark:opacity-10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
                
                <div className="relative bg-card/80 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-card p-4 md:p-5 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning rounded-card flex items-center justify-center text-on-warning shadow-lg">
                            <User size={22} />
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-black text-main">
                                مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                            </h1>
                            <p className="text-xs md:text-xs font-medium text-dim">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                        </div>
                    </div>
                    <button 
                        onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        className="w-10 h-10 bg-card/70 text-dim hover:text-error flex items-center justify-center rounded-card border border-border transition-all hover:bg-error-soft dark:hover:bg-error-soft"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* ══════════ HERO SECTION (desktop) ══════════ */}
                <div className="bg-gradient-to-br from-info-light to-info rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-[-40px] left-[-40px] w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-30px] right-[30%] w-32 h-32 bg-white/15 rounded-full blur-2xl" />
                    <div className="z-10 space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black leading-tight text-info-dark">
                            تعلّم بلا حدود{' '}
                            <span className="inline-block border-s-4 border-current ps-1 animate-pulse">|</span>
                        </h2>
                        <p className="text-base font-bold text-info-dark opacity-80">من أي مكان في العالم</p>
                        <p className="text-sm leading-relaxed text-info-dark opacity-70 max-w-md">
                            حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
                        </p>
                        <div className="flex gap-3 pt-3">
                            <button
                                onClick={() => navigate('/chat')}
                                className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                <Play size={14} fill="currentColor" />
                                ابدأ الآن
                            </button>
                            <button
                                onClick={() => navigate('/courses')}
                                className="flex items-center gap-2 bg-card text-primary text-sm font-bold px-5 py-2.5 rounded-full border border-primary active:scale-95 transition-transform"
                            >
                                استكشف الدورات
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
                    <StatCard title="الأبناء" value={stats.childCount} icon={Users} variant="warning" />
                    <StatCard title="قادمة" value={stats.upcomingSessions} icon={CalendarDays} variant="info" />
                    <StatCard title="الانضباط" value={`${stats.attendanceRate}%`} icon={Star} variant="error" />
                </div>

                <div className="flex flex-row gap-2 md:gap-4">
                    {[
                        { icon: Star, label: 'النقاط', value: points, color: 'var(--text-warning)', bg: 'var(--bg-warning-soft)' },
                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, color: 'var(--text-success)', bg: 'var(--bg-success-soft)' },
                        { icon: TrendingUp, label: 'اللقب', value: rank.name, color: 'var(--text-primary)', bg: 'var(--bg-primary-soft)' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="flex-1 bg-card rounded-card p-3 shadow-soft border border-border flex flex-col items-center text-center gap-1"
                            >
                                <div
                                    className="w-9 h-9 rounded-card flex items-center justify-center"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <Icon size={18} style={{ color: item.color }} />
                                </div>
                                <span className="text-sm font-black text-main">{item.value}</span>
                                <span className="text-micro text-muted font-medium">{item.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                    <NavButton label="المنتدى" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
                </div>

                {activeTimers.length > 0 && (
                    <div className="space-y-3">
                        {activeTimers.map((session: { id: string; studentName: string; teacherName: string; startTime: string; subject: string; studentId?: string; startedAt?: string }) => {
                            const child = children.find(c => c.id === session.studentId);
                            return (
                                <div key={session.id} className="bg-gradient-to-r from-warning to-warning text-on-warning p-4 rounded-card shadow-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-card flex items-center justify-center animate-pulse">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">حصة جارية الآن!</h3>
                                            <p className="text-micro font-medium opacity-90">
                                                {child?.name || session.studentId} — {session.subject}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold font-mono tracking-widest">
                                        {formatTime(session.startedAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mb-6">
                    <LiveClasses />
                </div>

                {children.some(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)) && (
                    <div className="bg-card/80 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-card p-4 md:p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="text-warning" size={16} />
                            <h3 className="text-sm md:text-lg font-medium text-main">الواجبات والملاحظات</h3>
                        </div>
                        <div className="space-y-3">
                            {children.filter(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)).map((child) => (
                                <div key={child.id} className="space-y-1">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                                            <span className="text-xs font-medium text-muted uppercase tracking-widest">{child.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {child.enrollments.filter((en: { nextSessionNotes?: string }) => en.nextSessionNotes).map((en: { nextSessionNotes?: string; teacherName: string }, idx: number) => (
                                            <div key={idx} className="bg-warning-soft dark:bg-warning-soft p-3 rounded-card border border-warning dark:border-warning">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-warning-dark dark:text-warning uppercase tracking-widest">{en.subject}</span>
                                                    <span className="text-xs font-normal text-muted">{en.teacher}</span>
                                                </div>
                                                <p className="text-micro font-normal text-main dark:text-main leading-relaxed">{en.nextSessionNotes}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gradient-to-br from-warning to-warning rounded-card p-5 md:p-6 text-on-warning shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm md:text-xl font-medium mb-1">التقدم الأكاديمي العام</h3>
                            </div>
                            <div className="w-10 h-10 bg-white/20 flex items-center justify-center shrink-0 border border-white/10">
                                <Award size={20} />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-micro font-medium opacity-90">
                                <span>الهدف: 100</span>
                                <span>{stats.academicProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(stats.academicProgress, 100)}%` }}
                                    className="h-full bg-white rounded-full shadow-[0_0_10px_var(--bg-shadow)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <Calendar className="text-warning-dark dark:text-warning" size={16} />
                        <h3 className="text-xs font-medium text-main uppercase tracking-widest italic">جدول حصص اليوم</h3>
                    </div>

                    <div className="space-y-2">
                        {todayTasks.map((task, idx) => (
                            <div key={idx} className="bg-card/80 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-card p-3 shadow-lg flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-gradient-to-br from-warning to-warning rounded-lg flex items-center justify-center text-on-warning shadow-soft">
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-main">{task.subject}</h4>
                                        <p className="text-micro font-medium text-muted">{task.studentName}</p>
                                    </div>
                                </div>
                                <div className="text-end font-bold text-micro text-dim">
                                    {task.time}
                                </div>
                            </div>
                        ))}
                        {todayTasks.length === 0 && (
                            <div className="py-6 text-center bg-card/80 backdrop-blur-sm border-2 border-dashed border-border rounded-card">
                                <p className="text-muted font-medium text-micro">لا توجد مهام اليوم</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <Star className="text-warning" size={16} />
                        <h3 className="text-xs font-medium text-main uppercase tracking-widest italic">آخر النشاطات</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allPointLogs.slice(0, 4).map((log, i) => (
                            <div key={i} className="bg-card/80 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-card p-3 shadow-lg flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-warning to-warning rounded-lg flex items-center justify-center text-on-warning shadow-soft shrink-0">
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-micro font-bold text-warning-dark dark:text-warning mb-0.5 truncate">{log.studentName}</p>
                                    <h4 className="text-micro font-medium text-main dark:text-main leading-snug">
                                        تلقى {log.amount} نقطة: {log.action}
                                    </h4>
                                    <p className="text-micro font-medium text-muted mt-1 flex items-center gap-1">
                                        <Clock size={8} />
                                        {log.timestamp ? (() => {
                                            try {
                                                const d = new Date(log.timestamp);
                                                return isNaN(d.getTime()) ? '' : format(d, 'eeee, d MMMM HH:mm', { locale: ar });
                                            } catch {
                                                return '';
                                            }
                                        })() : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {allPointLogs.length === 0 && (
                            <div className="col-span-full py-8 text-center bg-card/80 backdrop-blur-sm border-2 border-dashed border-border rounded-card">
                                <p className="text-muted font-medium text-micro">لا توجد نشاطات حديثة للأبناء</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-warning to-warning rounded-card p-5 text-on-warning flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] pointer-events-none" />
                    <div className="text-center md:text-start relative z-10">
                        <h4 className="text-sm md:text-lg font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                        <p className="text-xs font-medium opacity-80">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                    </div>
                    <a 
                        href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-card text-warning-dark px-5 py-3 rounded-card font-bold text-micro flex items-center gap-2.5 transition-all active:scale-95 shadow-lg w-full md:w-auto justify-center"
                    >
                        <div className="w-6 h-6 bg-gradient-to-br from-warning to-warning text-on-warning rounded-lg flex items-center justify-center">
                            <MessageSquare size={12} />
                        </div>
                        تواصل معنا
                    </a>
                </div>
                </div>
            </div>

            {/* ─── Mobile version (app-style with tabs) ─── */}
            <div className="block md:hidden min-h-screen pb-28 overflow-y-auto relative bg-background dark:bg-background font-sans" dir="rtl">
                {/* Sticky app bar — Savings-app style (no background rectangle) */}
                <div className="sticky top-0 z-30 bg-background dark:bg-background">
                    <div className="px-4 pt-2 pb-1">
                        {/* Page title */}
                        <div className="flex items-center gap-2 mb-2 px-0.5">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                                <LayoutDashboard size={12} className="text-on-primary" />
                            </div>
                            <h2 className="text-dim text-xs font-bold tracking-wide">لوحة التحكم</h2>
                        </div>
                        {/* Profile row */}
                        <div className="bg-card/90 rounded-3xl p-3.5 shadow-[0_2px_16px_var(--bg-shadow)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
                                    <User size={18} className="text-on-primary" />
                                </div>
                                <div>
                                    <h1 className="text-main font-black text-base leading-tight">
                                        أهلاً {(currentUser?.name || currentUser?.username || 'ولي الأمر')}
                                    </h1>
                                    <p className="text-micro font-medium text-muted mt-0.5">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                        <p className="text-muted text-xs font-bold">
                                            {children.length > 0
                                                ? [...children].sort((a, b) => a.id.localeCompare(b.id))[0]?.name || 'طالب'
                                                : 'طالب'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }} className="w-10 h-10 bg-hover dark:bg-primary-active/60 rounded-card flex items-center justify-center text-muted active:scale-90 transition-transform hover:bg-hover dark:hover:bg-primary-active" aria-label="تسجيل الخروج">
                                <LogOut size={16} />
                            </button>
                        </div>
                        {/* Stats pills — premium card style */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                                <div className="w-7 h-7 rounded-lg bg-success-soft flex items-center justify-center">
                                    <TrendingUp size={13} className="text-success-dark" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-main font-black text-base">{stats.academicProgress}%</span>
                                    <span className="text-muted text-micro font-bold tracking-wide">الالتزام</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                                <div className="w-7 h-7 rounded-lg bg-info-soft flex items-center justify-center">
                                    <BookOpen size={13} className="text-info-dark" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-main font-black text-base">{children.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)}</span>
                                    <span className="text-muted text-micro font-bold tracking-wide">المادة</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-card rounded-card py-2.5 px-3 flex items-center gap-2.5 shadow-md border border-border">
                                <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center">
                                    <Users size={13} className="text-primary" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-main font-black text-base">{stats.childCount}</span>
                                    <span className="text-muted text-micro font-bold tracking-wide">الأبناء</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tab bar */}
                    <div className="px-4 pb-4">
                        <div className="flex gap-1 bg-card rounded-card p-1 shadow-md border border-border">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-card text-xs font-bold transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-br from-primary to-primary-light text-on-primary shadow-md'
                                            : 'text-dim hover:bg-hover dark:hover:bg-primary-active/50'
                                    }`}>
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-3 pt-3 space-y-3.5">
                    {activeTab === 'home' && (
                        <>
                            {/* ══════════ HERO SECTION ══════════ */}
                            <div className="bg-gradient-to-br from-info-light to-info rounded-3xl p-5 relative overflow-hidden">
                                <div className="absolute top-[-30px] left-[-30px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 bg-white/15 rounded-full blur-xl" />
                                <div className="z-10 space-y-2">
                                    <h2 className="text-2xl font-black leading-tight text-info-dark">
                                        تعلّم بلا حدود{' '}
                                        <span className="inline-block border-s-4 border-current ps-0.5 animate-pulse">|</span>
                                    </h2>
                                    <p className="text-sm font-bold text-info-dark opacity-80">من أي مكان في العالم</p>
                                    <p className="text-xs leading-relaxed text-info-dark opacity-70 max-w-none">
                                        حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
                                    </p>
                                    <div className="flex flex-row gap-2 pt-2">
                                        <button
                                            onClick={() => navigate('/chat')}
                                            className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
                                        >
                                            <Play size={12} fill="currentColor" />
                                            ابدأ الآن
                                        </button>
                                        <button
                                            onClick={() => navigate('/courses')}
                                            className="flex items-center gap-1.5 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary active:scale-95 transition-transform"
                                        >
                                            استكشف الدورات
                                            <ChevronLeft size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ══════════ QUICK NAV ══════════ */}
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <h2 className="text-main text-sm font-black">التنقل السريع</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <button onClick={() => navigate('/parent-students')} className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-card flex items-center justify-center text-on-primary shadow-soft">
                                            <Users size={18} />
                                        </div>
                                        <span className="text-main text-micro font-bold">ملفات الأبناء</span>
                                    </button>
                                    <button onClick={() => navigate('/forum')} className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                                        <div className="w-10 h-10 bg-gradient-to-br from-info to-info-light rounded-card flex items-center justify-center text-on-info shadow-soft">
                                            <LayoutDashboard size={18} />
                                        </div>
                                        <span className="text-main text-micro font-bold">المنتدى</span>
                                    </button>
                                    <button onClick={() => navigate('/chat')} className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                                        <div className="w-10 h-10 bg-gradient-to-br from-success to-success-light rounded-card flex items-center justify-center text-on-success shadow-soft">
                                            <MessageSquare size={18} />
                                        </div>
                                        <span className="text-main text-micro font-bold">الدردشة</span>
                                    </button>
                                </div>
                            </section>

                            {/* ══════════ STATS STRIP (like student dashboard) ══════════ */}
                            <div className="px-1 py-2">
                                <div className="flex flex-row gap-3">
                                    {[
                                        { icon: TrendingUp, label: 'اللقب', value: rank.name, color: 'var(--text-primary)', bg: 'var(--bg-primary-soft)' },
                                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, color: 'var(--text-success)', bg: 'var(--bg-success-soft)' },
                                        { icon: Star, label: 'النقاط', value: points, color: 'var(--text-warning)', bg: 'var(--bg-warning-soft)' },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={idx}
className="flex-1 bg-card dark:bg-card rounded-card p-3 shadow-soft border border-border flex flex-col items-center text-center gap-1"
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-card flex items-center justify-center"
                                                    style={{ backgroundColor: item.bg }}
                                                >
                                                    <Icon size={18} style={{ color: item.color }} />
                                                </div>
                                                <span className="text-sm font-black text-main">{item.value}</span>
                                                <span className="text-micro text-muted font-medium">{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active session timers */}
                            {activeTimers.length > 0 && (
                                <div className="space-y-2">
                                    {activeTimers.map((session: { id: string; studentName: string; teacherName: string; subject: string; studentId?: string; startedAt?: string }) => {
                                        const child = children.find(c => c.id === session.studentId);
                                        return (
                                            <div key={session.id} className="bg-gradient-to-l from-primary to-primary-light text-on-primary p-3.5 rounded-card shadow-lg flex items-center justify-between active:scale-[0.99] transition-transform">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 bg-white/20 rounded-card flex items-center justify-center animate-pulse">
                                                        <Clock size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs">حصة جارية الآن!</h3>
                                                        <p className="text-micro font-medium text-on-primary/80">{child?.name || session.studentId} — {session.subject}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold font-mono tracking-widest">{formatTime(session.startedAt)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <h2 className="text-main text-sm font-black">البث المباشر</h2>
                                </div>
                                <div className="bg-card rounded-card shadow-md overflow-hidden">
                                    <div className="p-3.5"><LiveClasses /></div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'children' && (
                        <>
                            {children.some(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)) && (
                                <section>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <div className="w-1 h-4 bg-warning rounded-full" />
                                        <h2 className="text-main text-sm font-black">الواجبات والملاحظات</h2>
                                    </div>
                                    <div className="bg-card rounded-card shadow-md p-3.5 space-y-3">
                                        {children.filter(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)).map((child) => (
                                            <div key={child.id}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    <span className="text-xs font-bold text-muted">{child.name}</span>
                                                </div>
                                                <div className="space-y-2 ms-4">
                                                    {child.enrollments.filter((en: { nextSessionNotes?: string }) => en.nextSessionNotes).map((en: { nextSessionNotes?: string; teacherName: string }, idx: number) => (
                                                        <div key={idx} className="bg-primary-soft dark:bg-primary-soft p-3 rounded-card border border-primary dark:border-primary">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-bold text-primary dark:text-primary">{en.subject}</span>
                                                                <span className="text-micro text-muted">{en.teacher}</span>
                                                            </div>
                                                            <p className="text-micro text-main dark:text-main leading-relaxed">{en.nextSessionNotes}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-success rounded-full" />
                                    <h2 className="text-main text-sm font-black">التقدم الأكاديمي</h2>
                                </div>
                                <div className="bg-gradient-to-br from-primary to-primary rounded-card p-4 text-on-primary shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 end-0 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-black">التقدم الأكاديمي العام</h3>
                                            <Award size={18} className="text-on-primary opacity-60" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-micro text-on-primary/70">
                                                <span>الهدف: 100</span>
                                                <span>{stats.academicProgress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.academicProgress, 100)}%` }} className="h-full bg-white rounded-full shadow-[0_0_8px_var(--bg-shadow)]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'schedule' && (
                        <section>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <h2 className="text-main text-sm font-black">جدول حصص اليوم</h2>
                            </div>
                            <div className="bg-card rounded-card shadow-md p-3.5">
                                <div className="space-y-2">
                                    {todayTasks.map((task, idx) => (
                                        <div key={idx} className="bg-background dark:bg-primary-active/50 rounded-card p-3 flex items-center justify-between active:scale-[0.99] transition-transform">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-card flex items-center justify-center text-on-primary shadow-soft">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-main">{task.subject}</h4>
                                                    <p className="text-micro text-muted">{task.studentName}</p>
                                                </div>
                                            </div>
                                            <div className="text-end font-bold text-micro text-dim dark:text-dim">{task.time}</div>
                                        </div>
                                    ))}
                                    {todayTasks.length === 0 && (
                                        <div className="py-8 text-center">
                                            <Calendar size={36} className="mx-auto text-muted mb-3" />
                                            <p className="text-muted font-bold text-sm">لا توجد حصص اليوم</p>
                                            <p className="text-dim dark:text-dim text-micro mt-1">يوم هادئ بلا حصص!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'activity' && (
                        <>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-warning rounded-full" />
                                    <h2 className="text-main text-sm font-black">آخر النشاطات</h2>
                                </div>
                                <div className="bg-card rounded-card shadow-md p-3.5">
                                    <div className="space-y-2">
                                        {allPointLogs.slice(0, 4).map((log, i) => (
                                            <div key={i} className="bg-background dark:bg-primary-active/50 rounded-card p-3 flex items-start gap-2.5 active:scale-[0.99] transition-transform">
                                                <div className="w-8 h-8 bg-gradient-to-br from-warning to-warning rounded-card flex items-center justify-center text-on-warning shadow-soft shrink-0">
                                                    <Star size={13} fill="currentColor" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-micro font-bold text-warning-dark dark:text-warning mb-0.5 truncate">{log.studentName}</p>
                                                    <p className="text-micro text-main dark:text-main leading-snug">تلقى {log.amount} نقطة: {log.action}</p>
                                                    <p className="text-micro text-muted mt-1 flex items-center gap-1">
                                                        <Clock size={7} />
                                                        {log.timestamp ? (() => {
                                                            try { const d = new Date(log.timestamp); return isNaN(d.getTime()) ? '' : format(d, 'eeee, d MMMM HH:mm', { locale: ar }); }
                                                            catch { return ''; }
                                                        })() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {allPointLogs.length === 0 && (
                                            <div className="py-5 text-center bg-background dark:bg-primary-active/50 border-2 border-dashed border-border rounded-card">
                                                <p className="text-muted font-medium text-micro">لا توجد نشاطات حديثة</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-error rounded-full" />
                                    <h2 className="text-main text-sm font-black">الدعم الفني</h2>
                                </div>
                                <div className="bg-gradient-to-br from-primary to-primary rounded-card p-4 text-on-primary shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 end-0 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                                            <p className="text-micro text-on-primary/70 font-medium">فريق الدعم متاح 24 ساعة</p>
                                        </div>
                                        <a href={`https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}`} target="_blank" rel="noopener noreferrer"
                                            className="bg-card text-primary px-3.5 py-2.5 rounded-card font-bold text-micro flex items-center gap-2 active:scale-95 transition-transform shadow-lg shrink-0">
                                            <MessageSquare size={13} />
                                            تواصل
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    <div className="h-8" />
                </div>
            </div>

            {/* ══════════════════ BOTTOM NAVIGATION ══════════════════ */}
            <div className="block md:hidden fixed bottom-0 end-0 start-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] shadow-2xl">
                <div className="flex items-center justify-around h-[68px] px-2">
                    {[
                        { id: 'profile', label: 'حسابي', icon: User },
                        { id: 'favorites', label: 'المفضلة', icon: Star },
                        { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, isCenter: true },
                        { id: 'files', label: 'ملفاتي', icon: BookOpen },
                        { id: 'more', label: 'المزيد', icon: MoreHorizontal },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === 'home';
                        const isCenter = item.isCenter;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'home') { setActiveTab('home') }
                                    else if (item.id === 'profile') { navigate('/parent-dashboard') }
                                    else if (item.id === 'favorites') { navigate('/schedule') }
                                    else if (item.id === 'files') { navigate('/parent-students') }
                                    else if (item.id === 'more') { navigate('/forum') }
                                }}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}
                            >
                                {isCenter ? (
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-xl">
                                        <Icon size={26} className="text-on-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <Icon
                                            size={22}
                                            className={`transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted'}`}
                                            strokeWidth={isActive ? 2.5 : 1.5}
                                        />
                                        <span className={`text-micro font-semibold transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted'}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

const NavButton = ({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<{ size?: number }>; onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="bg-card/80 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-card p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-card shadow-lg group"
    >
        <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning rounded-card flex items-center justify-center text-on-warning shadow-soft group-hover:scale-110 transition-transform">
            <Icon size={18} />
        </div>
        <span className="text-micro font-bold text-dim">{label}</span>
    </button>
);
