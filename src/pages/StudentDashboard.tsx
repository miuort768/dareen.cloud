import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, CalendarDays, BookOpen, MessageSquare, Star, Award, Clock, X, Trophy
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../shared/utils/ranks';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const StudentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [pointLogs, setPointLogs] = useState<any[]>([]);
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
                
                // Update full student data during poll to get new homework/notes automatically
                setStudentData(data);

                if (data.isLive && data.activeSession) {
                    const startedAt = new Date(data.activeSession.startedAt).getTime();
                    activeStartRef.current = startedAt;
                    if (!timerTickRef.current) {
                        timerTickRef.current = setInterval(() => {
                            if (activeStartRef.current) {
                                setActiveTimer({
                                    seconds: Math.floor((Date.now() - activeStartRef.current) / 1000),
                                    subject: data.activeSession.subject,
                                    teacherName: data.activeSession.teacherName || ''
                                });
                            }
                        }, 1000);
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

    const latestCompletedSession = useMemo(() => {
        const completed = [...sessions].filter(s => s.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return completed[0];
    }, [sessions]);

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

    if (isLoading) {
        return (
            <div className="space-y-4 p-4 text-center py-20">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل بياناتك يا بطل...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 pb-20 px-2 lg:px-8 pt-6 space-y-6 animate-in fade-in duration-700" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="mb-6 pr-2 lg:pr-0">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">
                    مرحباً، <span className="text-indigo-600 dark:text-white">{studentData?.name?.split(' ')[0]} {studentData?.name?.split(' ')[1] || ''}</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">جاهز لمواصلة رحلتك التعليمية اليوم؟</p>
            </div>

            {/* ═══════════════ ACTIVE TIMER ═══════════════ */}
            {activeTimer && (
                <div className="bg-rose-500 dark:bg-blue-600 text-white p-4 rounded-3xl shadow-lg shadow-rose-500/20 dark:shadow-blue-500/20 flex items-center justify-between animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm">الحصة مبدوءة الآن!</h3>
                            <p className="text-[10px] font-bold opacity-90">
                                {activeTimer.subject}
                                {activeTimer.teacherName && <span className="opacity-70"> · {activeTimer.teacherName}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono tracking-widest">
                        {formatTime(activeTimer.seconds)}
                    </div>
                </div>
            )}

            {/* ═══════════════ NEXT CLASS CARD ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] dark:from-rose-600 dark:to-rose-500 p-6 rounded-none shadow-lg shadow-purple-500/20 dark:shadow-rose-500/20 text-white"
            >
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-10 -translate-y-10" />
                <Award className="absolute bottom-4 left-4 text-white/10" size={100} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-3">الحصة القادمة</span>
                    {todaySchedule.length > 0 ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5 grayscale opacity-60">
                                    <div className="w-2 h-2 rounded-full border border-white" />
                                    <div className="w-2 h-2 rounded-full border border-white" />
                                </div>
                                <div className="px-8 py-2.5 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center">
                                    <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-md">
                                        {todaySchedule[0].slots[0].subject}
                                    </h2>
                                </div>
                                <div className="flex gap-1.5 grayscale opacity-60">
                                    <div className="w-2 h-2 rounded-full border border-white" />
                                    <div className="w-2 h-2 rounded-full border border-white" />
                                </div>
                            </div>
                            <p className="text-sm font-bold bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                اليوم الساعة {todaySchedule[0].slots[0].time} مساءً
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-xl md:text-2xl font-black mb-1">لا توجد حصص مجدولة</h2>
                            <p className="text-sm font-bold opacity-90">استغل اليوم لمراجعة ما درسته!</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ═══════════════ LATEST SESSION LOGS ═══════════════ */}
            {latestCompletedSession && (latestCompletedSession.topics || latestCompletedSession.homework) && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-emerald-500" size={20} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">ملخص آخر حصة ({latestCompletedSession.subject})</h3>
                    </div>
                    <div className="space-y-3">
                        {latestCompletedSession.topics && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ما تم إنجازه</span>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{latestCompletedSession.topics}</p>
                            </div>
                        )}
                        {latestCompletedSession.homework && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-800/20">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">الواجب المطلوب</span>
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">{latestCompletedSession.homework}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════ STATS ROW ═══════════════ */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-full flex items-center justify-center mb-2">
                        <Star size={16} fill="currentColor" />
                    </div>
                    <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-none">{points}</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-tighter">مجموع النقاط</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-full flex items-center justify-center mb-2">
                        <CalendarDays size={16} />
                    </div>
                    <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-none">{stats.attendanceRate}%</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-tighter">معدل الحضور</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 md:p-5 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                        <BookOpen size={16} />
                    </div>
                    <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-none">{(studentData?.enrollments || []).length}</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-tighter">عدد المواد</span>
                </div>
            </div>

            {/* ═══════════════ CURRENT LEVEL CARD ═══════════════ */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/20">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">المستوى الحالي</span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{rank.name}</h3>
                    </div>
                    <div className="text-left">
                        <div className="px-3 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full text-[10px] font-black border border-slate-100 dark:border-slate-800 shadow-sm">
                            المستوى {Math.floor(points / 100) + 1}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 text-center">
                            تبقي {(Math.floor(points / 100) + 1) * 100 - points} نقطة للمستوى التالي
                        </p>
                    </div>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((points % 100), 100)}%` }}
                        className="h-full bg-[#8b5cf6]"
                    />
                </div>
            </div>

            {/* ═══════════════ ENROLLMENT NOTES & HOMEWORK ═══════════════ */}
            {(studentData?.enrollments || []).some((en: any) => en.nextSessionNotes) && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="text-indigo-500" size={20} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">الواجبات والملاحظات الحالية</h3>
                    </div>
                    <div className="space-y-3">
                        {(studentData.enrollments || []).filter((en: any) => en.nextSessionNotes).map((en: any, idx: number) => (
                            <div key={idx} className="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/20">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{en.subject}</span>
                                    <span className="text-[9px] font-bold text-slate-400">المعلمة: {en.teacher}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{en.nextSessionNotes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ ACHIEVEMENT ADVISOR ═══════════════ */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-[#8b5cf6]" size={20} />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">مستشار الإنجاز</h3>
                </div>
                <div className="space-y-6">
                    <ProgressBarSimple label="معدل الحضور" value={stats.attendanceRate} />
                    <ProgressBarSimple label="التقدم الأكاديمي" value={stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0} />
                    {next && <ProgressBarSimple label={`نحو لقب "${next.name}"`} value={Math.min(Math.round((points / next.minPoints) * 100), 100)} subLabel={`${points} / ${next.minPoints}`} />}
                </div>
            </div>

            {/* ═══════════════ DAILY TASKS ═══════════════ */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">مهام اليوم</h3>
                </div>
                <div className="space-y-3">
                    {todaySchedule.length > 0 ? todaySchedule[0].slots.map((slot: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{slot.subject}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">المعلمة: {slot.teacher}</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="text-[12px] font-black text-slate-900 dark:text-white block">{slot.time} م</span>
                                <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[8px] font-bold rounded-lg mt-1 tracking-tighter uppercase">قادم</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center py-6 text-slate-400 text-xs font-bold bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">لا توجد مهام اليوم</p>
                    )}
                </div>
            </div>

            {/* ═══════════════ QUICK CHANNELS ═══════════════ */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => navigate('/chat')}
                    className="bg-[#f2f0ff] dark:bg-indigo-950/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <MessageSquare className="text-[#8b5cf6]" size={18} />
                    <span className="text-sm font-black text-slate-800 dark:text-indigo-300">المحادثات</span>
                </button>
                <button 
                    onClick={() => setShowBadges(true)}
                    className="bg-[#f2f0ff] dark:bg-indigo-950/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <Award className="text-[#8b5cf6]" size={18} />
                    <span className="text-sm font-black text-slate-800 dark:text-indigo-300">الأوسمة</span>
                </button>
            </div>

            {/* ═══════════════ RECENT ACTIVITY ═══════════════ */}
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">آخر النشاطات</h3>
                <div className="space-y-3">
                    {pointLogs.slice(0, 3).map((log, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <Star size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-normal">
                                        تلقيت {log.amount} نقطة جديدة: {log.action}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1.5">
                                        {[1, 2, 3, 4, 5].map(starIdx => (
                                            <Star key={starIdx} size={10} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2">منذ ساعتين</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pointLogs.length === 0 && (
                        <p className="text-center py-6 text-slate-400 text-xs font-bold">لا توجد نشاطات حديثة</p>
                    )}
                </div>
            </div>

            {/* ═══════════════ SUPPORT BANNER ═══════════════ */}
            <div className="bg-[#5c4fb1] dark:bg-rose-600 p-6 rounded-xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h4 className="text-lg font-black mb-1">هل تحتاج لمساعدة؟</h4>
                    <p className="text-xs font-bold opacity-80 leading-normal">فريق الدعم متاح دائماً لخدمتك</p>
                </div>
                <a 
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-white text-[#5c4fb1] dark:text-rose-600 px-6 py-3 rounded-[20px] font-black text-sm flex items-center gap-3 transition-transform active:scale-95 shadow-xl w-full md:w-auto justify-center"
                >
                    <div className="w-8 h-8 bg-[#5c4fb1] dark:bg-rose-600 text-white rounded-[10px] flex items-center justify-center">
                        <MessageSquare size={16} fill="currentColor" />
                    </div>
                    واتساب
                </a>
            </div>

            {/* ═══════════════ BADGES MODAL ═══════════════ */}
            <AnimatePresence>
                {showBadges && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBadges(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <button 
                                    onClick={() => setShowBadges(false)}
                                    className="absolute top-6 left-6 text-white/60 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-xl">
                                        <Trophy size={32} className="text-yellow-300 drop-shadow-lg" />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1 italic">أوسمة التميز</h2>
                                    <p className="text-xs font-bold text-indigo-100 opacity-80 uppercase tracking-widest">إنجازاتك المسجلة في دارين</p>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid grid-cols-3 gap-4">
                                    {allBadges.map((badge, idx) => {
                                        const isEarned = (studentData?.badges || '').includes(badge.id);
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative group",
                                                    isEarned 
                                                        ? `bg-gradient-to-br ${badge.color} shadow-lg scale-110` 
                                                        : "bg-slate-50 dark:bg-slate-800/50 grayscale opacity-40"
                                                )}>
                                                    <badge.icon size={28} className={isEarned ? "text-white" : "text-slate-400"} />
                                                    {isEarned && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black text-center leading-tight",
                                                    isEarned ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                )}>
                                                    {badge.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                                        استمر في حضور حصصك والحصول على النقاط لفتح المزيد من الأوسمة الرائعة!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

const ProgressBarSimple = ({ label, value, subLabel }: { label: string; value: number; subLabel?: string }) => (
    <div>
        <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{label}</span>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">{subLabel || `${value}%`}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className="h-full bg-[#8b5cf6]"
            />
        </div>
    </div>
);

const allBadges = [
    { id: 'diligent', name: 'المجتهد الصغير', icon: Star, color: 'from-amber-400 to-orange-500' },
    { id: 'attendance', name: 'بطل الحضور', icon: CalendarDays, color: 'from-blue-400 to-indigo-600' },
    { id: 'reader', name: 'القارئ المتميز', icon: BookOpen, color: 'from-emerald-400 to-teal-600' },
    { id: 'star', name: 'نجم الأسبوع', icon: Award, color: 'from-rose-400 to-pink-600' },
    { id: 'golden', name: 'المستوى الذهبي', icon: Trophy, color: 'from-yellow-400 to-amber-600' },
    { id: 'first', name: 'المركز الأول', icon: Award, color: 'from-violet-400 to-purple-600' },
];

export default StudentDashboard;
