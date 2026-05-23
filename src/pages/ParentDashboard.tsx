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
    Clock
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone, useLogout } from '../context/AppContext';
import { cn } from '../lib/utils';
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
                
                // Add student name to each log for parent view
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

    // ── Active timer for parent (polls every 5s) ──
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

                // Update children data to get new homework/notes automatically
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

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-amber-950/20 font-sans" dir="rtl">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-300/20 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6">
            
            {/* ═══════════════ HEADER ═══════════════ */}
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

            {/* ═══════════════ ACTIVE SESSION TIMERS ═══════════════ */}
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

            {/* ═══════════════ LIVE CLASSES ═══════════════ */}
            <div className="mb-6">
                <LiveClasses />
            </div>

            {/* ═══════════════ QUICK STATS ═══════════════ */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <QuickStatCard icon={Users} label="الأبناء" value={stats.childCount} color="amber" />
                <QuickStatCard icon={CalendarDays} label="قادمة" value={stats.upcomingSessions} color="blue" />
                <QuickStatCard icon={Star} label="الانضباط" value={`${stats.attendanceRate}%`} color="rose" />
            </div>

            {/* ═══════════════ NAVIGATION GRID ═══════════════ */}
            <div className="grid grid-cols-2 gap-2">
                <NavButton label="ملفات الأبناء" icon={Users} onClick={() => navigate('/parent-students')} />
                <NavButton label="المنتدى" icon={LayoutDashboard} onClick={() => navigate('/forum')} />
            </div>

            {/* ═══════════════ ENROLLMENT NOTES & HOMEWORK ═══════════════ */}
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

            {/* ═══════════════ ACADEMIC PROGRESS ═══════════════ */}
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

            {/* ═══════════════ TODAY'S TASKS ═══════════════ */}
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

            {/* ═══════════════ RECENT ACTIVITY ═══════════════ */}
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

            {/* ═══════════════ SUPPORT FOOTER ═══════════════ */}
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
