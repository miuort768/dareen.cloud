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
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';

export const ParentDashboard = () => {
    const { currentUser, adminPhone, logout } = useApp();
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [allPointLogs, setAllPointLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);
                
                const sessionsPromises = students.map(async s => {
                    try {
                        return await api.get<any[]>(`/parents/child-sessions/${s.id}`) || [];
                    } catch (e) {
                        console.error(`Failed to fetch sessions for child ${s.id}:`, e);
                        return [];
                    }
                });
                const logsPromises = students.map(async s => {
                    try {
                        return await api.get<any[]>(`/student-portal/me/points-log?studentId=${s.id}`) || [];
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
                    (Array.isArray(logs) ? logs : []).map((l: any) => ({ ...l, studentName: students[idx].name }))
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
    const [activeTimers, setActiveTimers] = useState<any[]>([]);
    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [_timerTick, setTimerTick] = useState(0);

    useEffect(() => {
        const poll = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('/api/active-sessions/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data: any[] = await res.json();
                setActiveTimers(data);

                // Update children data to get new homework/notes automatically
                const students = await api.get<any[]>('/parents/my-children');
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
            (c.enrollments || []).forEach((en: any) => {
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
        const tasks: any[] = [];
        children.forEach(child => {
            (child.enrollments || []).forEach((en: any) => {
                (en.schedule || []).forEach((slot: any) => {
                    if (slot.day === todayArabic) {
                        tasks.push({
                            studentName: child.name,
                            subject: en.subject,
                            teacher: en.teacher,
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
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-32 space-y-4 md:space-y-6 animate-in fade-in duration-700">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="flex justify-between items-center bg-emerald-500 dark:bg-rose-500 p-4 rounded-3xl shadow-lg border-b-4 border-emerald-600 dark:border-rose-600 transition-colors duration-500">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-sm">
                        <User size={24} />
                    </div>
                    <div>
                        <h1 className="text-base md:text-xl font-black text-white leading-tight">
                            مرحباً... {(currentUser?.name || currentUser?.username || 'ولي الأمر').split(' ')[0]}
                        </h1>
                        <p className="text-[9px] md:text-xs font-bold text-white/80">لوحة تحكم ولي الأمر • {format(new Date(), 'eeee, d MMMM', { locale: ar })}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* ═══════════════ ACTIVE SESSION TIMERS ═══════════════ */}
            {activeTimers.length > 0 && (
                <div className="space-y-3">
                    {activeTimers.map((session: any) => {
                        const child = children.find(c => c.id === session.studentId);
                        return (
                            <div key={session.id} className="bg-rose-500 dark:bg-blue-600 text-white p-4 rounded-3xl flex items-center justify-between shadow-lg shadow-rose-500/20 dark:shadow-blue-500/20 animate-in slide-in-from-top duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm">حصة جارية الآن!</h3>
                                        <p className="text-[10px] font-bold opacity-90">
                                            {child?.name || session.studentId} — {session.subject}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-2xl font-black font-mono tracking-widest">
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
            {children.some(child => child.enrollments?.some((en: any) => en.nextSessionNotes)) && (
                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="text-amber-500" size={16} />
                        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white">الواجبات والملاحظات</h3>
                    </div>
                    <div className="space-y-3">
                        {children.filter(child => child.enrollments?.some((en: any) => en.nextSessionNotes)).map((child) => (
                            <div key={child.id} className="space-y-1">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{child.name}</span>
                                </div>
                                <div className="space-y-2">
                                    {child.enrollments.filter((en: any) => en.nextSessionNotes).map((en: any, idx: number) => (
                                        <div key={idx} className="bg-amber-50/30 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100/30 dark:border-amber-900/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{en.subject}</span>
                                                <span className="text-[8px] font-bold text-slate-400">{en.teacher}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{en.nextSessionNotes}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ ACADEMIC PROGRESS ═══════════════ */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm md:text-xl font-black mb-1">التقدم الأكاديمي العام</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            <Award size={20} />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black opacity-90">
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
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">جدول حصص اليوم</h3>
                </div>

                <div className="space-y-2">
                    {todayTasks.map((task, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/10 text-amber-500 rounded-xl flex items-center justify-center">
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white">{task.subject}</h4>
                                    <p className="text-[8px] font-bold text-slate-400">{task.studentName}</p>
                                </div>
                            </div>
                            <div className="text-left font-black text-[10px]">
                                {task.time}
                            </div>
                        </div>
                    ))}
                    {todayTasks.length === 0 && (
                        <div className="py-6 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 opacity-60">
                            <p className="text-slate-400 font-bold text-[10px]">لا توجد مهام اليوم</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════ RECENT ACTIVITY ═══════════════ */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <Star className="text-amber-500" size={16} />
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">آخر النشاطات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allPointLogs.slice(0, 4).map((log, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                <Star size={14} fill="currentColor" />
                            </div>
                            <div className="min-w-0 flex-1">
                                    <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5 truncate">{log.studentName}</p>
                                <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
                                    تلقى {log.amount} نقطة: {log.action}
                                </h4>
                                <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
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
                        <div className="col-span-full py-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 opacity-60">
                            <p className="text-slate-400 dark:text-slate-600 font-bold text-[10px]">لا توجد نشاطات حديثة للأبناء</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════ SUPPORT FOOTER ═══════════════ */}
            <div className="bg-gradient-to-l from-amber-600 to-amber-500 p-5 rounded-3xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h4 className="text-sm md:text-lg font-black mb-0.5">هل تحتاج لمساعدة؟</h4>
                    <p className="text-[9px] md:text-xs font-bold opacity-80 leading-tight">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                </div>
                <a 
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-white text-amber-600 px-5 py-2 rounded-2xl font-black text-[10px] flex items-center gap-2.5 transition-transform active:scale-95 shadow-xl w-full md:w-auto justify-center"
                >
                    <div className="w-6 h-6 bg-amber-600 text-white rounded-md flex items-center justify-center">
                        <MessageSquare size={12} fill="currentColor" />
                    </div>
                    تواصل معنا
                </a>
            </div>
            </div>

        </div>
    );
};

const QuickStatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        amber: "bg-amber-50 dark:bg-amber-900/10 text-amber-500 shadow-amber-100 dark:shadow-none",
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-500 shadow-blue-100 dark:shadow-none",
        rose: "bg-rose-50 dark:bg-rose-900/10 text-rose-500 shadow-rose-100 dark:shadow-none"
    };
    return (
        <div className="bg-white dark:bg-slate-900 py-2.5 px-1.5 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mb-1", colors[color])}>
                <Icon size={12} />
            </div>
            <span className="text-sm md:text-lg font-black text-slate-900 dark:text-white leading-none">{value}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">{label}</span>
        </div>
    );
};

const NavButton = ({ label, icon: Icon, onClick }: any) => (
    <button 
        onClick={onClick}
        className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-100/30 dark:border-amber-900/20 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md group"
    >
        <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 tracking-tight">{label}</span>
    </button>
);
