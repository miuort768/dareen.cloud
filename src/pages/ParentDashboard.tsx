import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Sparkles,
    Bell,
    TrendingUp,
    CheckCircle,
    Play,
    ChevronLeft,
    MoreHorizontal,
    Home
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout } from '../context/AppContext';
import { cn } from '../lib/utils';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';

export const ParentDashboard = () => {
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const logout = useLogout();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Record<string, unknown>[]>([]);
    const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
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
                const students = await api.get<Record<string, unknown>[]>('/parents/my-children');
                setChildren(students);
                
                const sessionsPromises = students.map(async s => {
                    try {
                        return await api.get<Record<string, unknown>[]>(`/parents/child-sessions/${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch sessions for child ${s.id}:`, e);
                        return [];
                    }
                });
                const logsPromises = students.map(async s => {
                    try {
                        return await api.get<Record<string, unknown>[]>(`/student-portal/me/points-log?studentId=${s.id}`) || [];
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
                    (Array.isArray(logs) ? logs : []).map((l: { id: string; date: string; status: string }) => ({ ...l, studentName: students[idx].name }))
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
    const [activeTimers, setActiveTimers] = useState<Record<string, unknown>[]>([]);
    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [, setTimerTick] = useState(0);

    useEffect(() => {
        const poll = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('/api/active-sessions/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data: Record<string, unknown>[] = await res.json();
                setActiveTimers(data);

                const students = await api.get<Record<string, unknown>[]>('/parents/my-children');
                setChildren(students);

                if (data.length > 0 && !timerTickRef.current) {
                    timerTickRef.current = setInterval(() => setTimerTick(t => t + 1), 1000);
                } else if (data.length === 0 && timerTickRef.current) {
                    clearInterval(timerTickRef.current);
                    timerTickRef.current = null;
                }
            } catch { /* silent */ }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => {
            clearInterval(interval);
            if (timerTickRef.current) clearInterval(timerTickRef.current);
        };
    }, []);

    const formatTime = (startedAt: string) => {
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
            <div className="hidden md:block min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-amber-950/20 font-sans" dir="rtl">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-300/20 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-[1600px] mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
                
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 md:p-5 shadow-lg shadow-amber-100/50 dark:shadow-amber-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200 dark:shadow-amber-950">
                            <User size={22} />
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-black text-slate-800 dark:text-white">
                                مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                            </h1>
                            <p className="text-[11px] md:text-xs font-medium text-slate-400">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-10 h-10 bg-white/70 dark:bg-slate-800/70 text-slate-500 hover:text-rose-500 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* ══════════ HERO SECTION (desktop) ══════════ */}
                <div className="bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC] p-6 md:p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-[-40px] left-[-40px] w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-30px] right-[30%] w-32 h-32 bg-white/15 rounded-full blur-2xl" />
                    <div className="z-10 space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black leading-tight text-[#0C4A6E]">
                            تعلّم بلا حدود{' '}
                            <span className="inline-block border-r-4 border-current pr-1 animate-pulse">|</span>
                        </h2>
                        <p className="text-base font-bold text-[#0C4A6E] opacity-80">من أي مكان في العالم</p>
                        <p className="text-sm leading-relaxed text-[#0C4A6E] opacity-70 max-w-md">
                            حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
                        </p>
                        <div className="flex gap-3 pt-3">
                            <button
                                onClick={() => navigate('/chat')}
                                className="flex items-center gap-2 bg-[#3D1F8F] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                <Play size={14} fill="white" />
                                ابدأ الآن
                            </button>
                            <button
                                onClick={() => navigate('/courses')}
                                className="flex items-center gap-2 bg-white/80 text-[#3D1F8F] text-sm font-bold px-5 py-2.5 rounded-full border border-[#3D1F8F]/20 active:scale-95 transition-transform"
                            >
                                استكشف الدورات
                                <ChevronLeft size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <QuickStatCard icon={Users} label="الأبناء" value={stats.childCount} color="amber" />
                    <QuickStatCard icon={CalendarDays} label="قادمة" value={stats.upcomingSessions} color="blue" />
                    <QuickStatCard icon={Star} label="الانضباط" value={`${stats.attendanceRate}%`} color="rose" />
                </div>

                <div className="flex flex-row gap-2 md:gap-4">
                    {[
                        { icon: Star, label: 'النقاط', value: points, color: '#F59E0B', bg: '#FFFBEB' },
                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, color: '#10B981', bg: '#ECFDF5' },
                        { icon: TrendingUp, label: 'اللقب', value: rank.name, color: '#7C3AED', bg: '#FAF5FF' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1"
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <Icon size={18} style={{ color: item.color }} />
                                </div>
                                <span className="text-sm font-black text-gray-800">{item.value}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
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
                                <div key={session.id} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg shadow-amber-200 dark:shadow-amber-950 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">حصة جارية الآن!</h3>
                                            <p className="text-[10px] font-medium opacity-90">
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
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 md:p-5 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="text-amber-500" size={16} />
                            <h3 className="text-sm md:text-lg font-medium text-slate-900 dark:text-white">الواجبات والملاحظات</h3>
                        </div>
                        <div className="space-y-3">
                            {children.filter(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)).map((child) => (
                                <div key={child.id} className="space-y-1">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{child.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {child.enrollments.filter((en: { nextSessionNotes?: string }) => en.nextSessionNotes).map((en: { nextSessionNotes?: string; teacherName: string }, idx: number) => (
                                            <div key={idx} className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest">{en.subject}</span>
                                                    <span className="text-[11px] font-normal text-slate-400">{en.teacher}</span>
                                                </div>
                                                <p className="text-[10px] font-normal text-slate-700 dark:text-slate-300 leading-relaxed">{en.nextSessionNotes}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 md:p-6 text-white shadow-lg shadow-amber-200 dark:shadow-amber-950 relative overflow-hidden">
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
                            <div className="flex justify-between items-center text-[10px] font-medium opacity-90">
                                <span>الهدف: 100</span>
                                <span>{stats.academicProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(stats.academicProgress, 100)}%` }}
                                    className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <Calendar className="text-amber-600 dark:text-amber-400" size={16} />
                        <h3 className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-widest italic">جدول حصص اليوم</h3>
                    </div>

                    <div className="space-y-2">
                        {todayTasks.map((task, idx) => (
                            <div key={idx} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-white">{task.subject}</h4>
                                        <p className="text-[10px] font-medium text-slate-400">{task.studentName}</p>
                                    </div>
                                </div>
                                <div className="text-left font-bold text-[10px] text-slate-500">
                                    {task.time}
                                </div>
                            </div>
                        ))}
                        {todayTasks.length === 0 && (
                            <div className="py-6 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <p className="text-slate-400 font-medium text-[10px]">لا توجد مهام اليوم</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <Star className="text-amber-500" size={16} />
                        <h3 className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-widest italic">آخر النشاطات</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allPointLogs.slice(0, 4).map((log, i) => (
                            <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-xl p-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-0.5 truncate">{log.studentName}</p>
                                    <h4 className="text-[10px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                        تلقى {log.amount} نقطة: {log.action}
                                    </h4>
                                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
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
                            <div className="col-span-full py-8 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <p className="text-slate-400 font-medium text-[10px]">لا توجد نشاطات حديثة للأبناء</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-200 dark:shadow-amber-950 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] pointer-events-none" />
                    <div className="text-center md:text-right relative z-10">
                        <h4 className="text-sm md:text-lg font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                        <p className="text-[11px] font-medium opacity-80">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                    </div>
                    <a 
                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-white text-amber-600 px-5 py-3 rounded-xl font-bold text-[10px] flex items-center gap-2.5 transition-all active:scale-95 shadow-lg w-full md:w-auto justify-center"
                    >
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg flex items-center justify-center">
                            <MessageSquare size={12} />
                        </div>
                        تواصل معنا
                    </a>
                </div>
                </div>
            </div>

            {/* ─── Mobile version (app-style with tabs) ─── */}
            <div className="block md:hidden min-h-screen pb-28 overflow-y-auto relative bg-[#F7F8FC] font-sans" dir="rtl">
                {/* Sticky app bar */}
                <div className="sticky top-0 z-30 bg-gradient-to-br from-[#6C4BFF] via-[#5A3BFF] to-[#1B1464] shadow-lg shadow-purple-200/30">
                    <div className="absolute inset-0 bg-purple-400/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10 px-4 pt-2 pb-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                                    <User size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-white font-black text-base leading-tight">
                                        {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                                    </h1>
                                    <p className="text-white/60 text-[11px] font-bold">طالب</p>
                                </div>
                            </div>
                            <button onClick={logout} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/70">
                                <LogOut size={16} />
                            </button>
                        </div>
                        {/* Stats pills */}
                        <div className="flex items-center gap-2.5 mt-2">
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-2.5 px-3 flex items-center gap-2.5 border border-white/10">
                                <TrendingUp size={14} className="text-emerald-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-base">{stats.academicProgress}%</span>
                                    <span className="text-white/70 text-[10px] font-bold">الالتزام</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-2.5 px-3 flex items-center gap-2.5 border border-white/10">
                                <BookOpen size={14} className="text-blue-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-base">{children.reduce((sum, c) => sum + ((c as any).enrollments?.length || 0), 0)}</span>
                                    <span className="text-white/70 text-[10px] font-bold">المادة</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-2.5 px-3 flex items-center gap-2.5 border border-white/10">
                                <Users size={14} className="text-purple-200 shrink-0" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white font-black text-base">{stats.childCount}</span>
                                    <span className="text-white/70 text-[10px] font-bold">الأبناء</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tab bar */}
                    <div className="relative z-10 px-4 pb-4 pt-1">
                        <div className="flex gap-1.5 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white text-[#6C4BFF] shadow-sm'
                                            : 'text-white/70'
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
                            <div className="bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC] p-5 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-[-30px] left-[-30px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 bg-white/15 rounded-full blur-xl" />
                                <div className="z-10 space-y-2">
                                    <h2 className="text-2xl font-black leading-tight text-[#0C4A6E]">
                                        تعلّم بلا حدود{' '}
                                        <span className="inline-block border-r-4 border-current pr-0.5 animate-pulse">|</span>
                                    </h2>
                                    <p className="text-sm font-bold text-[#0C4A6E] opacity-80">من أي مكان في العالم</p>
                                    <p className="text-xs leading-relaxed text-[#0C4A6E] opacity-70 max-w-none">
                                        حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
                                    </p>
                                    <div className="flex flex-row gap-2 pt-2">
                                        <button
                                            onClick={() => navigate('/chat')}
                                            className="flex items-center gap-1.5 bg-[#3D1F8F] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
                                        >
                                            <Play size={12} fill="white" />
                                            ابدأ الآن
                                        </button>
                                        <button
                                            onClick={() => navigate('/courses')}
                                            className="flex items-center gap-1.5 bg-white/80 text-[#3D1F8F] text-xs font-bold px-4 py-2 rounded-full border border-[#3D1F8F]/20 active:scale-95 transition-transform"
                                        >
                                            استكشف الدورات
                                            <ChevronLeft size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ══════════ STATS STRIP (like student dashboard) ══════════ */}
                            <div className="px-1 py-2">
                                <div className="flex flex-row gap-3">
                                    {[
                                        { icon: TrendingUp, label: 'اللقب', value: rank.name, color: '#7C3AED', bg: '#FAF5FF' },
                                        { icon: CheckCircle, label: 'الحضور', value: `${stats.attendanceRate}%`, color: '#10B981', bg: '#ECFDF5' },
                                        { icon: Star, label: 'النقاط', value: points, color: '#F59E0B', bg: '#FFFBEB' },
                                    ].map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-1"
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: item.bg }}
                                                >
                                                    <Icon size={18} style={{ color: item.color }} />
                                                </div>
                                                <span className="text-sm font-black text-gray-800">{item.value}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
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
                                            <div key={session.id} className="bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] text-white p-3.5 rounded-2xl shadow-lg shadow-purple-200/40 flex items-center justify-between active:scale-[0.99] transition-transform">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                                                        <Clock size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs">حصة جارية الآن!</h3>
                                                        <p className="text-[9px] font-medium text-white/80">{child?.name || session.studentId} — {session.subject}</p>
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
                                    <div className="w-1 h-4 bg-[#6C4BFF] rounded-full" />
                                    <h2 className="text-[#1E1E2F] text-[13px] font-black">البث المباشر</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                                    <div className="p-3.5"><LiveClasses /></div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-[#3478F6] rounded-full" />
                                    <h2 className="text-[#1E1E2F] text-[13px] font-black">التنقل السريع</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => navigate('/parent-students')} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform">
                                        <div className="w-11 h-11 bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white shadow-sm">
                                            <Users size={20} />
                                        </div>
                                        <span className="text-[#1E1E2F] text-[11px] font-bold">ملفات الأبناء</span>
                                    </button>
                                    <button onClick={() => navigate('/forum')} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform">
                                        <div className="w-11 h-11 bg-gradient-to-br from-[#3478F6] to-[#5B9DFF] rounded-2xl flex items-center justify-center text-white shadow-sm">
                                            <LayoutDashboard size={20} />
                                        </div>
                                        <span className="text-[#1E1E2F] text-[11px] font-bold">المنتدى</span>
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'children' && (
                        <>
                            {children.some(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)) && (
                                <section>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <div className="w-1 h-4 bg-[#F5A623] rounded-full" />
                                        <h2 className="text-[#1E1E2F] text-[13px] font-black">الواجبات والملاحظات</h2>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 space-y-3">
                                        {children.filter(child => child.enrollments?.some((en: { nextSessionNotes?: string }) => en.nextSessionNotes)).map((child) => (
                                            <div key={child.id}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C4BFF]" />
                                                    <span className="text-[11px] font-bold text-slate-500">{child.name}</span>
                                                </div>
                                                <div className="space-y-2 mr-4">
                                                    {child.enrollments.filter((en: { nextSessionNotes?: string }) => en.nextSessionNotes).map((en: { nextSessionNotes?: string; teacherName: string }, idx: number) => (
                                                        <div key={idx} className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[11px] font-bold text-[#6C4BFF]">{en.subject}</span>
                                                                <span className="text-[9px] text-slate-400">{en.teacher}</span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-700 leading-relaxed">{en.nextSessionNotes}</p>
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
                                    <div className="w-1 h-4 bg-[#18C76F] rounded-full" />
                                    <h2 className="text-[#1E1E2F] text-[13px] font-black">التقدم الأكاديمي</h2>
                                </div>
                                <div className="bg-gradient-to-br from-[#6C4BFF] to-[#1B1464] rounded-2xl p-4 text-white shadow-lg shadow-purple-200/30 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-black">التقدم الأكاديمي العام</h3>
                                            <Award size={18} className="text-purple-200" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[9px] text-white/70">
                                                <span>الهدف: 100</span>
                                                <span>{stats.academicProgress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.academicProgress, 100)}%` }} className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
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
                                <div className="w-1 h-4 bg-[#3478F6] rounded-full" />
                                <h2 className="text-[#1E1E2F] text-[13px] font-black">جدول حصص اليوم</h2>
                            </div>
                            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5">
                                <div className="space-y-2">
                                    {todayTasks.map((task, idx) => (
                                        <div key={idx} className="bg-[#F7F8FC] rounded-xl p-3 flex items-center justify-between active:scale-[0.99] transition-transform">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] rounded-xl flex items-center justify-center text-white shadow-sm">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-[#1E1E2F]">{task.subject}</h4>
                                                    <p className="text-[9px] text-slate-400">{task.studentName}</p>
                                                </div>
                                            </div>
                                            <div className="text-left font-bold text-[10px] text-slate-500">{task.time}</div>
                                        </div>
                                    ))}
                                    {todayTasks.length === 0 && (
                                        <div className="py-8 text-center">
                                            <Calendar size={36} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-slate-400 font-bold text-[13px]">لا توجد حصص اليوم</p>
                                            <p className="text-slate-300 text-[10px] mt-1">يوم هادئ بلا حصص!</p>
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
                                    <div className="w-1 h-4 bg-amber-400 rounded-full" />
                                    <h2 className="text-[#1E1E2F] text-[13px] font-black">آخر النشاطات</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5">
                                    <div className="space-y-2">
                                        {allPointLogs.slice(0, 4).map((log, i) => (
                                            <div key={i} className="bg-[#F7F8FC] rounded-xl p-3 flex items-start gap-2.5 active:scale-[0.99] transition-transform">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                                                    <Star size={13} fill="currentColor" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold text-amber-600 mb-0.5 truncate">{log.studentName}</p>
                                                    <p className="text-[10px] text-slate-700 leading-snug">تلقى {log.amount} نقطة: {log.action}</p>
                                                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
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
                                            <div className="py-5 text-center bg-[#F7F8FC] border-2 border-dashed border-slate-200 rounded-xl">
                                                <p className="text-slate-400 font-medium text-[10px]">لا توجد نشاطات حديثة</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="w-1 h-4 bg-rose-400 rounded-full" />
                                    <h2 className="text-[#1E1E2F] text-[13px] font-black">الدعم الفني</h2>
                                </div>
                                <div className="bg-gradient-to-br from-[#6C4BFF] to-[#1B1464] rounded-2xl p-4 text-white shadow-lg shadow-purple-200/30 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                                            <p className="text-[9px] text-white/70 font-medium">فريق الدعم متاح 24 ساعة</p>
                                        </div>
                                        <a href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`} target="_blank" rel="noopener noreferrer"
                                            className="bg-white text-[#6C4BFF] px-3.5 py-2.5 rounded-xl font-bold text-[10px] flex items-center gap-2 active:scale-95 transition-transform shadow-lg shrink-0">
                                            <MessageSquare size={13} />
                                            تواصل
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    <div className="h-4" />
                </div>
            </div>

            {/* ══════════════════ BOTTOM NAVIGATION ══════════════════ */}
            <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-gray-300/40">
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
                                    else if (item.id === 'profile') { navigate('/profile') }
                                    else if (item.id === 'favorites') { navigate('/schedule') }
                                    else if (item.id === 'files') { navigate('/parent-students') }
                                    else if (item.id === 'more') { navigate('/forum') }
                                }}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}
                            >
                                {isCenter ? (
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-xl shadow-purple-300/50">
                                        <Icon size={26} className="text-white" />
                                    </div>
                                ) : (
                                    <>
                                        <Icon
                                            size={22}
                                            className={`transition-all duration-200 ${isActive ? 'text-[#6C4BFF]' : 'text-gray-400'}`}
                                            strokeWidth={isActive ? 2.5 : 1.5}
                                        />
                                        <span className={`text-[9px] font-semibold transition-all duration-200 ${isActive ? 'text-[#6C4BFF]' : 'text-gray-400'}`}>
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

const QuickStatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; color: string }) => {
    const gradient: Record<string, string> = {
        amber: 'from-amber-400 to-orange-500',
        blue: 'from-blue-400 to-cyan-500',
        rose: 'from-rose-400 to-pink-500',
    };
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl py-3 px-2 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 flex flex-col items-center justify-center text-center">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 bg-gradient-to-br shadow-sm", gradient[color] || 'from-amber-400 to-orange-500')}>
                <Icon size={13} className="text-white" />
            </div>
            <span className="text-sm md:text-lg font-black text-slate-800 dark:text-white leading-none">{value}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">{label}</span>
        </div>
    );
};

const NavButton = ({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<{ size?: number }>; onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 group"
    >
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{label}</span>
    </button>
);
