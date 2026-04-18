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
        <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 pb-20 px-4 pt-6 space-y-6 animate-in fade-in duration-700" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">
                    مرحباً، {studentData?.name?.split(' ')[0]} {studentData?.name?.split(' ')[1] || ''}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">جاهز لمواصلة رحلتك التعليمية اليوم؟</p>
            </div>

            {/* ═══════════════ NEXT CLASS CARD ═══════════════ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] p-6 rounded-[24px] shadow-lg shadow-purple-500/20 text-white"
            >
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-10 -translate-y-10" />
                <BookOpen className="absolute bottom-4 left-4 text-white/10" size={100} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-2">الفصل القادم</span>
                    {todaySchedule.length > 0 ? (
                        <>
                            <h2 className="text-xl md:text-2xl font-black mb-1">{todaySchedule[0].slots[0].subject}</h2>
                            <p className="text-sm font-bold opacity-90">اليوم الساعة {todaySchedule[0].slots[0].time} مساءً</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl md:text-2xl font-black mb-1">لا توجد حصص مجدولة</h2>
                            <p className="text-sm font-bold opacity-90">استغل اليوم لمراجعة ما درسته!</p>
                        </>
                    )}
                </div>
            </motion.div>

            {/* ═══════════════ STATS ROW ═══════════════ */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-full flex items-center justify-center mb-3">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{points}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">مجموع النقاط</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-full flex items-center justify-center mb-3">
                        <CalendarDays size={20} />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.attendanceRate}%</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">معدل الحضور</span>
                </div>
            </div>

            {/* ═══════════════ CURRENT LEVEL CARD ═══════════════ */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-[20px] border border-indigo-100/50 dark:border-indigo-900/20">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">المستوى الحالي</span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{rank.name}</h3>
                    </div>
                    <div className="px-3 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full text-[10px] font-black border border-slate-100 dark:border-slate-800 shadow-sm">
                        المستوى {Math.floor(points / 100) + 1}
                    </div>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((points % 100), 100)}%` }}
                        className="h-full bg-[#8b5cf6]"
                    />
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">
                    تبقي {(Math.floor(points / 100) + 1) * 100 - points} نقطة للمستوى التالي
                </p>
            </div>

            {/* ═══════════════ ACHIEVEMENT ADVISOR ═══════════════ */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800">
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
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">مهام اليوم (السبت)</h3>
                    <button className="text-[10px] font-black text-[#5c67f6] uppercase tracking-wider">عرض الكل</button>
                </div>
                <div className="space-y-3">
                    {todaySchedule.length > 0 ? todaySchedule[0].slots.map((slot, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 rounded-[15px] flex items-center justify-center">
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
                        <p className="text-center py-6 text-slate-400 text-xs font-bold bg-white dark:bg-slate-900 rounded-[20px] border border-dashed border-slate-200 dark:border-slate-800">لا توجد مهام اليوم</p>
                    )}
                </div>
            </div>

            {/* ═══════════════ QUICK CHANNELS ═══════════════ */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => navigate('/chat')}
                    className="bg-[#f2f0ff] dark:bg-indigo-950/20 p-4 rounded-[20px] border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <MessageSquare className="text-[#8b5cf6]" size={18} />
                    <span className="text-sm font-black text-slate-800 dark:text-indigo-300">المحادثات</span>
                </button>
                <button 
                    className="bg-[#f2f0ff] dark:bg-indigo-950/20 p-4 rounded-[20px] border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
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
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border border-slate-50 dark:border-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-[15px] flex items-center justify-center shrink-0">
                                    <Star size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 leading-normal">
                                        تلقيت {log.amount} نقطة جديدة: {log.action}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={10} className={star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
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
            <div className="bg-[#5c4fb1] dark:bg-[#433b82] p-6 rounded-[30px] shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                
                <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h4 className="text-lg font-black mb-1">هل تحتاج لمساعدة؟</h4>
                    <p className="text-xs font-bold opacity-80 leading-normal">فريق الدعم متاح دائماً لخدمتك</p>
                </div>

                <a 
                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-white text-[#5c4fb1] px-6 py-3 rounded-[20px] font-black text-sm flex items-center gap-3 transition-transform active:scale-95 shadow-xl w-full md:w-auto justify-center"
                >
                    <div className="w-8 h-8 bg-[#5c4fb1] text-white rounded-[10px] flex items-center justify-center">
                        <MessageSquare size={16} fill="currentColor" />
                    </div>
                    واتساب
                </a>
            </div>

        </div>
    );
};

// ═══════════ Simple Sub Components ═══════════

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
