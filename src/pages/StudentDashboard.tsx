import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, CalendarDays, BookOpen, MessageSquare, Star, Award, Zap, Trophy
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../shared/utils/ranks';
import { PageLoader } from '../components/ui/PageLoader';

import { useChatContext } from '../context/ChatContext';
import { cn } from '../lib/utils';

export const StudentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const { liveSession } = useChatContext();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<any>(null);

    const [sessions, setSessions] = useState<any[]>([]);
    const [pointLogs, setPointLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllActivities] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

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
        if (currentUser?.role === 'student' || currentUser?.role === 'parent') fetchStudentData();
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
    // const { next } = getNextRank(points, STUDENT_RANKS);

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
        return <PageLoader />;
    }

    return (
        <div className="min-h-full bg-slate-50 dark:bg-[#020617] pb-32 px-4 lg:px-12 pt-8 space-y-10 animate-in fade-in duration-700 font-sans" dir="rtl">
            
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -skew-x-12 transform translate-x-32 -translate-y-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-[3px] italic">أكاديمية دارين</span>
                            <Star size={14} className="text-amber-400 fill-current" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter italic uppercase leading-none">
                            مرحباً، <span className="text-indigo-600 dark:text-indigo-400">{studentData?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[2px] italic mt-4 flex items-center gap-2">
                             <div className="w-10 h-1 bg-indigo-600"></div>
                             هل أنت مستعد لتحدي جديد اليوم؟
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 dark:bg-black border-4 border-indigo-600 flex items-center justify-center text-white italic font-black text-2xl shadow-xl">
                            {studentData?.name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ NEXT CLASS ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="relative bg-slate-900 dark:bg-black p-10 border-r-8 border-indigo-600 shadow-[20px_20px_60px_rgba(0,0,0,0.3)] overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent)]"></div>
                        <Zap className="absolute bottom-[-20px] left-[-20px] text-white/5" size={200} />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[5px] italic flex items-center gap-2 leading-none border-b border-white/10 pb-2 w-fit">
                                    <CalendarDays size={16} /> الحصة القادمة
                                </h3>
                                {todaySchedule.length > 0 ? (
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                            {todaySchedule[0].slots[0].subject}
                                        </h2>
                                        <p className="text-indigo-400 font-black italic uppercase tracking-widest text-sm">
                                            اليوم • الساعة {todaySchedule[0].slots[0].time} مساءً
                                        </p>
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-black text-white italic opacity-50">لا توجد حصص مجدولة اليوم</h2>
                                )}
                            </div>
                            
                            {(liveSession || studentData?.isLive) && (
                                <button 
                                    onClick={() => navigate(`/classroom/${liveSession?.teacherId || studentData?.activeSession?.teacherId}`)}
                                    className="bg-indigo-600 text-white px-10 py-5 font-black text-sm uppercase tracking-[5px] italic flex items-center gap-4 hover:bg-white hover:text-indigo-600 transition-all shadow-[10px_10px_0px_0px_#312e81] active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    <Activity className="animate-pulse" size={20} />
                                    انضم الآن
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════ STATS ═══════════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={Star} label="إجمالي النقاط" value={points} color="rose" sub="رصيد التميز" />
                        <StatCard icon={Activity} label="معدل الحضور" value={`${stats.attendanceRate}%`} color="indigo" sub="الالتزام الشهري" />
                        <StatCard icon={BookOpen} label="المواد الدراسية" value={(studentData?.enrollments || []).length} color="emerald" sub="نشط حالياً" />
                    </div>

                    {/* ═══════════════ RECENT ACTIVITY ═══════════════ */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-rose-600 flex items-center justify-center text-white italic font-black shadow-lg shadow-rose-600/20">L</div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">سجل النشاطات والأوسمة</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pointLogs.slice(0, showAllActivities ? undefined : 4).map((log, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 border-4 border-slate-900 dark:border-slate-800 flex items-center gap-6 group hover:border-rose-600 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.02)]">
                                    <div className="w-14 h-14 bg-slate-900 dark:bg-black border-2 border-rose-600/30 flex items-center justify-center text-rose-500 shadow-xl group-hover:scale-105 transition-transform">
                                        <Star size={24} fill="currentColor" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">+{log.amount} نقطة تميز</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">{log.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* ═══════════════ RANK CARD ═══════════════ */}
                    <div className="bg-slate-900 dark:bg-black p-8 border-l-[12px] border-indigo-600 shadow-[20px_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                        <Trophy className="absolute top-[-20px] right-[-20px] text-white/5" size={120} />
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[4px] mb-8 flex items-center gap-3 italic leading-none border-b border-white/10 pb-4">
                            <Award size={16} /> المستوى والترتيب
                        </h3>
                        
                        <div className="relative z-10 space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">اللقب الحالي</p>
                                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">{rank.name}</h4>
                                <div className="w-full h-3 bg-white/5 border border-white/10 p-[2px]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((points % 100), 100)}%` }}
                                        className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] font-black text-slate-500 italic uppercase">المستوى {Math.floor(points / 100) + 1}</span>
                                    <span className="text-[10px] font-black text-indigo-400 italic uppercase">باقي {100 - (points % 100)} نقطة للتطور</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <ProgressBarSimple label="معدل الحضور والالتزام" value={stats.attendanceRate} color="emerald" />
                                <ProgressBarSimple label="التقدم في المنهج" value={stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0} color="indigo" />
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════ CHANNELS ═══════════════ */}
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => navigate('/chat')} className="bg-white dark:bg-slate-900 p-6 border-4 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_white] flex items-center justify-between group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                             <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">مركز التواصل</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">محادثات الأكاديمية</span>
                             </div>
                             <MessageSquare className="text-indigo-600" size={24} />
                        </button>
                    </div>

                    {/* ═══════════════ SUPPORT FOOTER ═══════════════ */}
                    <div className="bg-indigo-600 p-10 border-4 border-slate-900 dark:border-white shadow-[12px_12px_0px_0px_black] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10"></div>
                        <div className="relative z-10 flex flex-col gap-8">
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">فريق الدعم الفني</h4>
                            <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest italic opacity-80 leading-relaxed">تواصل معنا مباشرة عبر واتساب لأي استفسار تقني أو إداري.</p>
                            <a 
                                href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full bg-slate-900 text-white py-4 font-black text-xs uppercase tracking-[5px] italic flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all shadow-2xl border-2 border-transparent hover:border-slate-900"
                            >
                                <MessageSquare size={18} fill="currentColor" />
                                <span>واتساب</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, sub }: any) => {
    const colors: any = {
        indigo: "border-indigo-600 text-indigo-600 bg-indigo-50/10 shadow-indigo-600/20",
        emerald: "border-emerald-500 text-emerald-500 bg-emerald-50/10 shadow-emerald-500/20",
        rose: "border-rose-500 text-rose-500 bg-rose-50/10 shadow-rose-500/20"
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-8 border-4 border-slate-900 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] group hover:border-indigo-600 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 border-2 flex items-center justify-center", colors[color])}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono italic leading-none block">{value}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1 block">{sub}</span>
                </div>
            </div>
            <div className="pt-4 border-t-2 border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[2px] italic">{label}</span>
            </div>
        </div>
    );
};

const ProgressBarSimple = ({ label, value, color }: { label: string; value: number, color: string }) => {
    const colors: any = {
        indigo: "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]",
        emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
    };
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{label}</span>
                <span className="text-xs font-black text-white italic font-mono leading-none">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 border border-white/10 p-[1px]">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={cn("h-full", colors[color])}
                />
            </div>
        </div>
    );
};
