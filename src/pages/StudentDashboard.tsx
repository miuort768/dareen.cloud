import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, CalendarDays, Clock, Headset, Activity,
    GraduationCap, BookOpen, Trophy, MessageSquare,
    Star, Award, Target, CheckCircle2, XCircle, AlertCircle, Play, Snowflake,
    ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../shared/utils/ranks';
import { RankBadge } from '../shared/components/RankBadge';

export const StudentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [pointLogs, setPointLogs] = useState<any[]>([]);
    const [liveSession, setLiveSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'sessions' | 'subjects'>('overview');

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        let socket = (window as any).socket;
        let retryCount = 0;
        let timeoutId: any;

        const setupListeners = () => {
            socket = (window as any).socket;
            if (!socket && retryCount < 10) {
                retryCount++;
                timeoutId = setTimeout(setupListeners, 1000); // Retry every second for 10 seconds
                return;
            }

            if (!socket || currentUser?.role !== 'student') return;

            const handleInvite = (data: any) => {
                console.log("🔥 [Socket] StudentDashboard: Session invite received", data);
                setLiveSession(data);
            };

            const handleEnd = () => {
                console.log("❄️ [Socket] StudentDashboard: Session ended");
                setLiveSession(null);
            };

            socket.on('session_invite', handleInvite);
            socket.on('session_ended', handleEnd);

            return () => {
                socket.off('session_invite', handleInvite);
                socket.off('session_ended', handleEnd);
            };
        };

        const cleanup = setupListeners();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (cleanup) cleanup();
        };
    }, [currentUser]);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes, logsRes] = await Promise.all([
                    api.get<any>('/student-portal/me'),
                    api.get<any[]>('/student-portal/me/sessions'),
                    api.get<any[]>('/student-portal/me/points-log')
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
        (studentData.enrollments || []).forEach((en: any) => {
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
    const { next } = getNextRank(points, STUDENT_RANKS);

    const weeklySchedule = useMemo(() => {
        if (!studentData) return [];
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const scheduleMap: Record<string, any[]> = {};
        (studentData.enrollments || []).forEach((en: any) => {
            (en.schedule || []).forEach((slot: any) => {
                if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
                scheduleMap[slot.day].push({ subject: en.subject, time: slot.hour, period: slot.period, teacher: en.teacher });
            });
        });
        return days.map(day => ({ day, slots: (scheduleMap[day] || []).sort((a, b) => a.time.localeCompare(b.time)) })).filter(d => d.slots.length > 0);
    }, [studentData]);

    const todaySchedule = weeklySchedule.filter(d => d.day === todayArabic);
    const recentSessions = sessions.slice(0, 8);

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse border-8 border-gray-950" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse border-4 border-gray-950" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-28 min-w-0 w-full" dir="rtl">

            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="-mx-3 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-3 py-2 lg:mx-0 lg:px-6 lg:py-6 shadow-xl">
                {/* Single row: icon + name + points all in one line */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[12px] md:text-sm font-black text-white leading-tight truncate">أهلاً يا بطل، {studentData?.name}</h1>
                            <p className="text-slate-400 text-[8px] font-medium truncate">{todayArabic}</p>
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 bg-white/10 border border-white/20 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                        <div className="text-right">
                            <span className="block text-[6px] font-bold text-slate-400 uppercase tracking-wider">النقاط</span>
                            <div className="text-[10px] md:text-sm font-black text-yellow-400 leading-none">{points}</div>
                        </div>
                        <RankBadge rank={rank} size="sm" />
                    </div>
                </div>
            </div>

            {/* ═══════════════ LIVE SESSION BANNER ═══════════════ */}
            <AnimatePresence>
                {liveSession && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-xl border-4 border-gray-950">
                            <div className="bg-white/10 backdrop-blur-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/30">
                                <div className="flex items-center gap-4 text-gray-950">
                                    <div className="w-12 h-12 bg-gray-950 text-yellow-400 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-base md:text-lg font-black leading-tight uppercase tracking-tighter">حصتك المباشرة بدأت الآن!</h3>
                                        <p className="text-[10px] md:text-xs font-bold opacity-80 italic">المعلمة {liveSession.teacherName} بانتظارك في الغرفة الدراسية</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/classroom/${currentUser?.id}`)}
                                    className="w-full md:w-auto bg-gray-950 text-white px-8 py-3 font-black uppercase text-xs border-2 border-gray-950 shadow-[4px_4px_0px_0px_white] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                >
                                    دخول الحصة الآن <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════ STAT CARDS ═══════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
                <StatCard icon={Trophy} label="معدل الحضور" value={`${stats.attendanceRate}%`} color="emerald" />
                <StatCard icon={Clock} label="حصص قادمة" value={stats.upcomingSessions} color="blue" />
                <StatCard icon={Star} label="إجمالي النقاط" value={points} color="amber" />
                <StatCard icon={TrendingUp} label="مستوى الإنجاز" value={rank.name} color="rose" />
            </div>

            {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide min-w-0">
                {[
                    { key: 'overview', label: 'الرئيسية', icon: Activity },
                    { key: 'schedule', label: 'الجدول', icon: CalendarDays },
                    { key: 'sessions', label: 'الحصص', icon: BookOpen },
                    { key: 'subjects', label: 'الاشتراكات', icon: GraduationCap },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1 px-2 py-2.5 font-bold text-[10px] md:text-sm transition-all min-w-0",
                            activeTab === tab.key
                                ? "bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-md"
                                : "text-slate-500 dark:text-slate-400"
                        )}
                    >
                        <tab.icon size={14} className="shrink-0" />
                        <span className="truncate hidden xs:inline sm:inline">{tab.label}</span>
                        <span className="sm:hidden text-[8px] leading-none mt-0.5 truncate">{tab.label}</span>
                    </button>
                ))}
            </div>


            {/* ═══════════════ TAB CONTENT ═══════════════ */}
            
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-8 space-y-4 md:space-y-8">
                        
                        {/* Performance Bars */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-4 md:p-5 shadow-2xl shadow-emerald-500/10 text-white">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <TrendingUp size={16} />
                                </div>
                                <h3 className="text-sm md:text-lg font-black tracking-tight">مستشار الإنجاز</h3>
                            </div>
                            <div className="space-y-4">
                                <ProgressBar label="معدل الحضور" value={stats.attendanceRate} color="bg-white" />
                                <ProgressBar label="التقدم الدراسي" value={stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0} color="bg-white/90" />
                                {next && <ProgressBar label={`التقدم نحو ${next.name}`} value={Math.min(Math.round((points / next.minPoints) * 100), 100)} color="bg-yellow-300" />}
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-3 md:p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h4 className="font-black text-sm md:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarDays className="text-primary-600" size={18} /> مهام اليوم ({todayArabic})
                                </h4>
                            </div>
                            <div className="p-3 md:p-6">
                                {todaySchedule.length > 0 ? todaySchedule.map((dayData, idx) => (
                                    <div key={idx} className="space-y-3">
                                        {dayData.slots.map((slot, sIdx) => (
                                            <div key={sIdx} className="group bg-slate-50 dark:bg-slate-800/30 p-3 md:p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                                                        <Target size={16} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">{slot.subject}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{slot.teacher}</span>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-primary-600/10 text-primary-600 text-xs font-black">
                                                    {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )) : (
                                    <div className="py-10 flex flex-col items-center justify-center text-center">
                                        <Clock size={32} className="text-slate-300 mb-3" />
                                        <p className="text-xs font-medium text-slate-400">لا توجد مهام اليوم</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity + Support */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <QuickLink icon={MessageSquare} label="الدردشة" color="blue" onClick={() => navigate('/chat')} />
                            <QuickLink icon={Award} label="الأوسمة" color="amber" onClick={() => {}} />
                        </div>

                        {/* Points Activity */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 md:p-6 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-rose-500/10 text-rose-600 flex items-center justify-center ring-2 ring-rose-500/20">
                                    <Activity size={18} strokeWidth={2} />
                                </div>
                                <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white">آخر النشاطات</h3>
                            </div>
                            <div className="space-y-2">
                                {pointLogs.slice(0, 4).map((log, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{log.action || 'مكافأة'}</span>
                                            <span className="text-sm font-black text-emerald-600 shrink-0">+{log.amount}</span>
                                        </div>
                                    </div>
                                ))}
                                {pointLogs.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-xs text-slate-400">ابدأ في حضور الحصص!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 shadow-2xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Headset size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black leading-none mb-0.5">الدعم التعليمي</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">متاح للرد</p>
                                </div>
                            </div>
                            <a href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full py-3 bg-white text-slate-950 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                واتساب <MessageSquare size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-3 md:p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h4 className="font-black text-base md:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <CalendarDays size={20} />
                            </div>
                            الجدول الأسبوعي
                        </h4>
                    </div>
                    <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {weeklySchedule.length > 0 ? weeklySchedule.map((dayData, idx) => (
                            <div key={idx} className={cn(
                                "p-3 md:p-5 border transition-all",
                                dayData.day === todayArabic 
                                    ? "bg-primary-50/30 dark:bg-primary-600/5 border-primary-500/30" 
                                    : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800"
                            )}>
                                <div className="flex items-center gap-3 mb-3 pb-2 border-b dark:border-slate-700/50">
                                    <div className="w-8 h-8 bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-black text-sm">{dayData.day.substring(0, 1)}</div>
                                    <h5 className="text-sm font-black text-slate-900 dark:text-white">{dayData.day}</h5>
                                    {dayData.day === todayArabic && <span className="mr-auto px-2 py-0.5 bg-primary-600 text-white text-[9px] font-bold">اليوم</span>}
                                </div>
                                <div className="space-y-2">
                                    {dayData.slots.map((slot, sIdx) => (
                                        <div key={sIdx} className="bg-white dark:bg-slate-900/50 p-2 md:p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">{slot.subject}</span>
                                                <span className="text-[9px] text-slate-400">{slot.teacher}</span>
                                            </div>
                                            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-[9px] font-black shrink-0">
                                                {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center">
                                <CalendarDays size={32} className="mx-auto mb-3 text-slate-300" />
                                <p className="text-xs text-slate-400">لا يوجد جدول</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-3 md:p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h4 className="font-black text-base md:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                <BookOpen size={20} />
                            </div>
                            سجل الحصص
                        </h4>
                    </div>
                    <div className="divide-y dark:divide-slate-800">
                        {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                            <div key={i} className="p-3 md:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-9 h-9 flex items-center justify-center",
                                        session.status === 'completed' ? "bg-emerald-500 text-white" : session.status === 'cancelled' ? "bg-rose-500 text-white" : "bg-primary-500 text-white"
                                    )}>
                                        {session.status === 'completed' ? <CheckCircle2 size={18} /> : session.status === 'cancelled' ? <XCircle size={18} /> : <Play size={18} />}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[150px]">{session.subject || session.teacherName}</span>
                                        <span className="text-[9px] text-slate-400">{session.date}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 text-[9px] font-black uppercase shrink-0",
                                    session.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" : session.status === 'cancelled' ? "bg-rose-500/10 text-rose-600" : "bg-primary-500/10 text-primary-600"
                                )}>
                                    {session.status === 'completed' ? 'حضور' : session.status === 'cancelled' ? 'غياب' : 'قادمة'}
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center">
                                <BookOpen size={32} className="mx-auto mb-3 text-slate-200" />
                                <p className="text-xs text-slate-400">لا يوجد سجل</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'subjects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(studentData?.enrollments || []).map((en: any, i: number) => {
                        const remaining = en.sessionsTotal - en.sessionsUsed;
                        const isLow = remaining <= 2;
                        const progress = en.sessionsTotal > 0 ? Math.round((en.sessionsUsed / en.sessionsTotal) * 100) : 0;

                        return (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "p-4 md:p-6 border relative shadow-lg transition-all overflow-hidden",
                                    en.isFrozen ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" : 
                                    isLow ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800" : 
                                    "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                )}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-none -translate-y-16 translate-x-16" />
                                
                                {en.isFrozen && (
                                    <div className="absolute top-5 left-5 flex items-center gap-1.5 text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-none shadow-lg">
                                        <Snowflake size={14} className="animate-spin-slow" /> مُجمّد مؤقتاً
                                    </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="text-right">
                                        <h5 className="font-black text-base md:text-xl text-slate-900 dark:text-white tracking-tight mb-1">{en.subject}</h5>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{en.teacher}</p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 font-black text-sm shadow",
                                        isLow ? "bg-rose-600 text-white" : "bg-emerald-500 text-white"
                                    )}>
                                        {remaining} حصة
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
                                    {[...Array(Math.min(en.sessionsTotal, 20))].map((_, idx) => (
                                        <div key={idx} className={cn(
                                            "w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-black border transition-all",
                                            idx < en.sessionsUsed 
                                                ? "bg-emerald-500 border-emerald-400 text-white shadow-sm" 
                                                : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                                        )}>
                                            {idx < en.sessionsUsed ? <CheckCircle2 size={16} /> : idx + 1}
                                        </div>
                                    ))}
                                    {en.sessionsTotal > 20 && <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-slate-400">...</div>}
                                </div>

                                {/* Progress level */}
                                <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden p-1 border dark:border-slate-700">
                                    <div className={cn("h-full rounded-none transition-all shadow-md", isLow ? "bg-rose-600" : "bg-primary-600")} style={{ width: `${progress}%` }} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-900 dark:text-white mix-blend-difference">{progress}%</span>
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>المُستخدم {en.sessionsUsed}</span>
                                    <span>الرصيد الكلي {en.sessionsTotal}</span>
                                </div>

                                {isLow && (
                                    <motion.div 
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="mt-6 flex items-center gap-2 text-[11px] font-black text-rose-600 bg-rose-500/10 p-3 rounded-none border border-rose-200/50"
                                    >
                                        <AlertCircle size={16} />
                                        تنبيه: الرصيد شارف على الانتهاء، يرجى التجديد قريباً.
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                    {(!studentData?.enrollments || studentData.enrollments.length === 0) && (
                        <div className="col-span-full py-24 text-center">
                            <GraduationCap size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                            <p className="text-sm font-medium text-slate-400">لا توجد مواد دراسية مسجلة في ملفك حالياً</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════ Sub Components ═══════════

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        emerald: "from-emerald-500/10 via-white to-white dark:from-emerald-500/5 dark:via-slate-900 dark:to-slate-900 shadow-emerald-500/5 border-emerald-500/20",
        blue: "from-blue-500/10 via-white to-white dark:from-blue-500/5 dark:via-slate-900 dark:to-slate-900 shadow-blue-500/5 border-blue-500/20",
        amber: "from-amber-500/10 via-white to-white dark:from-amber-500/5 dark:via-slate-900 dark:to-slate-900 shadow-amber-500/5 border-amber-500/20",
        rose: "from-rose-500/10 via-white to-white dark:from-rose-500/5 dark:via-slate-900 dark:to-slate-900 shadow-rose-500/5 border-rose-500/20",
    };
    const iconStyles: any = {
        emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
        amber: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
        rose: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
    };
    return (
        <motion.div whileHover={{ y: -5 }} className={cn("bg-gradient-to-br p-3 md:p-6 rounded-none border shadow-md transition-all min-w-0", colors[color])}>
            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                <div className={cn("w-7 h-7 md:w-12 md:h-12 rounded-none flex items-center justify-center ring-1 md:ring-4 shrink-0", iconStyles[color])}>
                    <Icon className="w-3.5 h-3.5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter leading-none truncate">{label}</span>
            </div>
            <div className="text-lg md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</div>
        </motion.div>
    );
};

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="min-w-0">
        <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest truncate ml-2">{label}</span>
            <span className="text-lg md:text-2xl font-black text-white shrink-0">{value}%</span>
        </div>
        <div className="w-full h-3 md:h-4 bg-black/20 rounded-none relative overflow-hidden p-0.5">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${value}%` }} 
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={cn("absolute top-0 right-0 h-full rounded-none shadow-lg", color)} 
                style={{ 
                    boxShadow: '0 0 15px rgba(255,255,255,0.3)',
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                }}
            />
        </div>
    </div>
);

const QuickLink = ({ icon: Icon, label, color, onClick }: any) => {
    const colors: any = {
        blue: "bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700",
        amber: "bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600",
    };
    return (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick}
            className={cn("p-3 md:p-5 flex flex-col items-center gap-2 text-center transition-all shadow-lg", colors[color])}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black uppercase">{label}</p>
        </motion.button>
    );
};
