import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, CalendarDays, BookOpen, MessageSquare, Star, Award, Clock, X, Trophy, Sparkles, Rocket
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAdminPhone } from '../context/AppContext';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getRankByPoints, STUDENT_RANKS } from '../shared/utils/ranks';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PageLoader } from '../components/ui/PageLoader';
import { LiveClasses } from '../components/dashboard/LiveClasses';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const StudentDashboard = () => {
    const currentUser = useCurrentUser();
    const adminPhone = useAdminPhone();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<Record<string, unknown> | null>(null);
    const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
    const [pointLogs, setPointLogs] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBadges, setShowBadges] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    const [activeTimer, setActiveTimer] = useState<{ seconds: number; subject: string; teacherName: string } | null>(null);
    const activeStartRef = useRef<number | null>(null);
    const timerTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll backend every 5s for live session status & fresh data
    useEffect(() => {
        if (!currentUser?.id) return;
        const poll = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('/api/student-portal/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                setStudentData(data);

                if (data.isLive && data.activeSession && data.activeSession.startedAt) {
                    const startedAt = new Date(data.activeSession.startedAt).getTime();
                    if (!isNaN(startedAt)) {
                        activeStartRef.current = startedAt;
                        if (!timerTickRef.current) {
                            timerTickRef.current = setInterval(() => {
                                if (activeStartRef.current) {
                                    setActiveTimer({
                                        seconds: Math.round((Date.now() - activeStartRef.current) / 1000),
                                        subject: data.activeSession.subject,
                                        teacherName: data.activeSession.teacherName || ''
                                    });
                                }
                            }, 1000);
                        }
                    }
                } else {
                    if (timerTickRef.current) {
                        clearInterval(timerTickRef.current);
                        timerTickRef.current = null;
                    }
                    activeStartRef.current = null;
                    setActiveTimer(null);
                }
            } catch { /* silent */ }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => {
            clearInterval(interval);
            if (timerTickRef.current) clearInterval(timerTickRef.current);
        };
    }, [currentUser?.id]);

    const formatTime = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes, logsRes] = await Promise.all([
                    api.get<Record<string, unknown>>('/student-portal/me'),
                    api.get<Record<string, unknown>[]>('/student-portal/me/sessions'),
                    api.get<Record<string, unknown>[]>('/student-portal/me/points-log')
                ]);
                setStudentData(meRes);
                setSessions(sessionsRes);
                setPointLogs(logsRes);
            } catch (error) {
                console.error('Error fetching student dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser?.role === 'student') fetchStudentData();
    }, [currentUser]);

    const stats = useMemo(() => {
        if (!studentData) return { sessionsUsed: 0, sessionsTotal: 0, totalAttendance: 0, totalAbsence: 0, attendanceRate: 0, upcomingSessions: 0 };
        let sessionsUsed = 0, sessionsTotal = 0;
        (studentData.enrollments || []).forEach((en: { sessionsUsed?: number; sessionsTotal?: number }) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
        const totalAttendance = sessions.filter(s => s.status === 'completed').length;
        const totalAbsence = sessions.filter(s => s.status === 'cancelled').length;
        const totalRecorded = totalAttendance + totalAbsence;
        return {
            sessionsUsed, sessionsTotal,
            totalAttendance, totalAbsence,
            attendanceRate: totalRecorded > 0 ? Math.round((totalAttendance / totalRecorded) * 100) : 0,
            upcomingSessions: sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length,
        };
    }, [studentData, sessions]);

    const points = studentData?.totalPoints || 0;
    const rank = getRankByPoints(points, STUDENT_RANKS);

    const weeklySchedule = useMemo(() => {
        if (!studentData) return [];
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const scheduleMap: Record<string, { subject: string; time: string; period: string; teacher: string }[]> = {};
        (studentData.enrollments || []).forEach((en: { subject: string; teacher: string; schedule?: { day: string; hour: string; period: string }[] }) => {
            (en.schedule || []).forEach((slot: { day: string; hour: string; period: string }) => {
                if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
                scheduleMap[slot.day].push({ subject: en.subject, time: slot.hour, period: slot.period, teacher: en.teacher });
            });
        });
        return days.map(day => ({ day, slots: (scheduleMap[day] || []).sort((a, b) => a.time.localeCompare(b.time)) })).filter(d => d.slots.length > 0);
    }, [studentData]);

    const todaySchedule = weeklySchedule.filter(d => d.day === todayArabic);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-sky-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-sky-950/20 font-sans" dir="rtl">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-300/20 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-24 space-y-6 md:space-y-8">

            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-5 md:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-lg mb-2 shadow-lg shadow-sky-200 dark:shadow-sky-950">
                        <Sparkles size={10} className="text-white" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white">نظام التفوق</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                        مرحباً، <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600">{studentData?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-sky-500" />
                        {todayArabic}، {format(new Date(), 'd MMMM', { locale: ar })}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-2.5 rounded-xl shadow-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">اللقب</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{rank.name}</span>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-sky-200 dark:shadow-sky-950">
                            <Trophy size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ ACTIVE TIMER ═══════════════ */}
            {activeTimer && (
                <div className="relative z-10 bg-sky-600 dark:bg-sky-500 text-white p-4 md:p-6 border-b-2 md:border-b-4 border-sky-900 dark:border-sky-700 flex flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 border border-white/30 flex items-center justify-center animate-pulse">
                            <Clock size={20} className="md:hidden" />
                            <Clock size={28} className="hidden md:block" />
                        </div>
                        <div>
                            <h3 className="font-heading font-medium text-sm md:text-xl leading-none mb-1">الحصة مبدوءة!</h3>
                            <p className="text-[10px] md:text-xs font-normal opacity-80 truncate max-w-[120px] md:max-w-none">
                                {activeTimer.subject}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-2xl md:text-5xl font-heading font-medium tracking-tighter tabular-nums">
                            {formatTime(activeTimer.seconds)}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ MAIN GRID ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 relative z-10">
                
                {/* Left Column: Schedule & Tasks */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    
                    <LiveClasses />

                    {/* Next Class */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-sky-50/80 dark:from-slate-900/80 dark:to-sky-950/30 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-5 md:p-8 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-purple-600 rounded-full"></div>
                                    <h2 className="text-sm md:text-xl font-bold text-slate-800 dark:text-white">الحصة القادمة</h2>
                                </div>
                                
                                {todaySchedule.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white">
                                                {todaySchedule[0].slots[0].subject}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm font-medium">
                                                <Rocket size={14} className="text-sky-500" />
                                                <span>مع المعلمة {todaySchedule[0].slots[0].teacher}</span>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-purple-600 text-white font-bold text-[10px] md:text-xs uppercase rounded-xl shadow-lg shadow-sky-200 dark:shadow-sky-950">
                                            <Clock size={12} />
                                            اليوم • {todaySchedule[0].slots[0].time}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-slate-400">لا توجد حصص مجدولة لليوم</p>
                                )}
                            </div>

                            <button 
                                onClick={() => navigate('/chat')}
                                className="h-11 w-full md:h-28 md:w-28 bg-gradient-to-br from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white flex flex-row md:flex-col items-center justify-center gap-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-200 dark:shadow-sky-950"
                            >
                                <MessageSquare size={18} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">المحادثات</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats & Points Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={Star} label="النقاط" value={points} color="sky" />
                        <StatCard icon={CalendarDays} label="الحضور" value={`${stats.attendanceRate}%`} color="purple" />
                        <StatCard icon={BookOpen} label="المواد" value={(studentData?.enrollments || []).length} color="slate" />
                        <StatCard icon={Activity} label="المستوى" value={Math.floor(points / 100) + 1} color="emerald" />
                    </div>

                    {/* Progress & Ranking */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-5 md:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30">
                        <div className="flex flex-row items-end justify-between gap-4 mb-4">
                            <div className="space-y-1">
                                <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white">مسار التميز</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">تبقى لك <span className="text-sky-600 dark:text-sky-400 font-bold">{(Math.floor(points / 100) + 1) * 100 - points} نقطة</span></p>
                            </div>
                            <div className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-purple-600 text-white font-bold text-[10px] rounded-xl shadow-lg shadow-sky-200 dark:shadow-sky-950">
                                {rank.name}
                            </div>
                        </div>
                        <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((points % 100), 100)}%` }}
                                className="h-full bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Tasks & Homework Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-purple-600"></div>
                            <h3 className="text-sm md:text-2xl font-heading font-medium text-slate-900 dark:text-white uppercase tracking-tight">الواجبات والملاحظات</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(studentData?.enrollments || []).filter((en: { nextSessionNotes?: string }) => en.nextSessionNotes).map((en: { nextSessionNotes?: string; teacherName: string }, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 border-r-4 border-sky-500 p-4 md:p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium uppercase tracking-widest">{en.subject}</span>
                                        <span className="text-[11px] font-normal text-slate-400">المعلمة: {en.teacher}</span>
                                    </div>
                                    <p className="text-xs font-normal text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{en.nextSessionNotes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Achievements & Sidebar */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    
                    {/* Quick Access Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowBadges(!showBadges)}
                            className="h-24 md:h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 shadow-sm"
                        >
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-sky-50 dark:bg-sky-900/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                <Award size={18} className="md:size-24" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-widest">الأوسمة</span>
                        </button>
                        <button 
                            onClick={() => navigate('/forum')}
                            className="h-24 md:h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 shadow-sm"
                        >
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <MessageSquare size={18} className="md:size-24" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-widest">المنتدى</span>
                        </button>
                    </div>

                    {/* Achievements Summary */}
                    <div className="bg-gradient-to-br from-white/80 to-sky-50/80 dark:from-slate-900/80 dark:to-sky-950/20 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-5 md:p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/30 relative overflow-hidden">
                        <h3 className="text-sm md:text-lg font-black text-slate-800 dark:text-white mb-6">إنجازاتك</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {allBadges.slice(0, 6).map((badge, idx) => {
                                const isEarned = studentData?.badges && (typeof studentData.badges === 'string' || Array.isArray(studentData.badges)) ? studentData.badges.includes(badge.id) : false;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all",
                                            isEarned 
                                                ? `bg-gradient-to-br ${badge.color} scale-105` 
                                                : "bg-slate-800"
                                        )}>
                                            <badge.icon size={20} className={isEarned ? "text-white" : "text-slate-500"} />
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-medium text-center uppercase tracking-tighter",
                                            isEarned ? "text-white" : "text-slate-600"
                                        )}>
                                            {badge.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="space-y-4">
                        <h3 className="text-sm md:text-xl font-heading font-medium text-slate-900 dark:text-white uppercase tracking-tight">النشاطات</h3>
                        <div className="space-y-3">
                            {pointLogs.slice(0, 3).map((log, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-3 md:p-5 border-l-4 border-emerald-500 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <Star size={14} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] md:text-xs font-medium text-slate-900 dark:text-slate-100 leading-tight">+{log.amount} نقطة</h4>
                                            <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{log.action}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Block */}
                    <div className="bg-gradient-to-br from-sky-500 to-purple-600 rounded-2xl p-6 md:p-8 shadow-lg shadow-sky-200 dark:shadow-sky-950 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-lg md:text-xl font-black text-white leading-tight">تحتاج مساعدة؟</h4>
                            <a 
                                href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-white text-sky-700 py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
                            >
                                <MessageSquare size={14} />
                                تواصل الآن
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Overlay */}
            <AnimatePresence>
                {showBadges && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBadges(false)}
                            className="absolute inset-0 bg-slate-950/80"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="bg-slate-900 p-5 md:p-8 text-white flex justify-between items-center">
                                <h2 className="text-xl md:text-3xl font-heading font-medium italic tracking-tighter">قاعة المشاهير</h2>
                                <button onClick={() => setShowBadges(false)} className="w-10 h-10 bg-slate-800 flex items-center justify-center">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 md:p-10 grid grid-cols-3 gap-4 md:gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {allBadges.map((badge, idx) => {
                                    const isEarned = studentData?.badges && (typeof studentData.badges === 'string' || Array.isArray(studentData.badges)) ? studentData.badges.includes(badge.id) : false;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 md:gap-4 text-center">
                                            <div className={cn(
                                                "w-16 h-16 md:w-24 md:h-24 flex items-center justify-center transition-all",
                                                isEarned ? `bg-gradient-to-br ${badge.color} scale-105` : "bg-slate-100 dark:bg-slate-800"
                                            )}>
                                                <badge.icon size={28} className={isEarned ? "text-white" : "text-slate-400"} />
                                            </div>
                                            <span className={cn(
                                                "text-[11px] md:text-xs font-medium uppercase tracking-widest block",
                                                isEarned ? "text-slate-900 dark:text-white" : "text-slate-400"
                                            )}>
                                                {badge.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>

        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; color: string }) => {
    const colors: Record<string, string> = {
        sky: "border-sky-500 text-sky-600 bg-sky-50 dark:bg-sky-900/10",
        purple: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/10",
        slate: "border-slate-500 text-slate-600 bg-slate-50 dark:bg-slate-900/10",
        emerald: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10",
    };
    return (
        <div className={cn("bg-white dark:bg-slate-900 border-b-2 md:border-b-4 p-3 md:p-5 flex flex-col items-center justify-center text-center shadow-sm", colors[color] || colors.sky)}>
            <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center mb-1.5 md:mb-3">
                <Icon size={18} className="md:size-24" />
            </div>
            <span className="text-lg md:text-2xl font-heading font-medium text-slate-900 dark:text-white leading-none">{value}</span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest leading-none">{label}</span>
        </div>
    );
};

const allBadges = [
    { id: 'diligent', name: 'المجتهد الصغير', icon: Star, color: 'from-amber-400 to-orange-500' },
    { id: 'attendance', name: 'بطل الحضور', icon: CalendarDays, color: 'from-blue-400 to-sky-600' },
    { id: 'reader', name: 'القارئ المتميز', icon: BookOpen, color: 'from-emerald-400 to-teal-600' },
    { id: 'star', name: 'نجم الأسبوع', icon: Award, color: 'from-rose-400 to-pink-600' },
    { id: 'golden', name: 'المستوى الذهبي', icon: Trophy, color: 'from-yellow-400 to-amber-600' },
    { id: 'first', name: 'المركز الأول', icon: Award, color: 'from-violet-400 to-purple-600' },
];

export default StudentDashboard;
