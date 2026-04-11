import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, CalendarDays, Clock, Headset, Activity,
    GraduationCap, BookOpen, Trophy, MessageSquare, Zap,
    Star, Award, Target, ChevronLeft, ShieldCheck,
    CheckCircle2, XCircle, AlertCircle, Play, Snowflake
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
    const [isLoading, setIsLoading] = useState(true);
    const [showAllDays, setShowAllDays] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'sessions' | 'subjects'>('overview');

    const todayArabic = format(new Date(), 'eeee', { locale: ar });
    const todayDate = format(new Date(), 'dd MMMM yyyy', { locale: ar });

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
    const { next, pointsNeeded } = getNextRank(points, STUDENT_RANKS);

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
        <div className="space-y-8 pb-32" dir="rtl">

            {/* ═══════════════ TACTICAL HEADER ═══════════════ */}
            <div className="relative bg-gray-950 p-6 lg:p-10 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#3b82f6] overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }}
                            className="w-20 h-20 bg-primary-600 text-white border-[4px] border-gray-950 shadow-[4px_4px_0px_0px_white] flex items-center justify-center transform -rotate-2">
                            <GraduationCap size={44} strokeWidth={2.5} />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-0.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest italic border-b border-white">مركز عمليات الطالب</span>
                                <RankBadge rank={rank} size="sm" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">أهلاً يا بطل، {studentData?.name}</h1>
                            <p className="text-gray-400 text-xs font-black flex items-center gap-2 uppercase tracking-wider">
                                <Zap size={14} className="text-yellow-400" /> {todayArabic} • {todayDate}
                            </p>
                        </div>
                    </div>

                    {/* Points & Rank Card */}
                    <div className="flex items-center gap-4 bg-white/5 border-4 border-white/10 p-5 min-w-[220px]">
                        <div className="flex-1 text-right">
                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[3px] mb-1">رصيد النقاط</span>
                            <div className="text-3xl font-black text-white italic leading-none">{points} <span className="text-xs text-primary-400">نقطة</span></div>
                            {next && <div className="text-[9px] text-gray-500 mt-1 font-bold">متبقي {pointsNeeded} للترقية لـ {next.name}</div>}
                        </div>
                        <div className="text-3xl">{rank.icon}</div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ STAT CARDS ═══════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={CheckCircle2} label="الحصص المكتملة" value={stats.totalAttendance} color="emerald" />
                <StatCard icon={Target} label="الحصص القادمة" value={stats.upcomingSessions} color="blue" />
                <StatCard icon={TrendingUp} label="معدل الانضباط" value={`${stats.attendanceRate}%`} color="amber" />
                <StatCard icon={Trophy} label="الرتبة الحالية" value={rank.name} color="rose" />
            </div>

            {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'overview', label: 'نظرة عامة', icon: Activity },
                    { key: 'schedule', label: 'الجدول الأسبوعي', icon: CalendarDays },
                    { key: 'sessions', label: 'سجل الحصص', icon: BookOpen },
                    { key: 'subjects', label: 'المواد والاشتراكات', icon: GraduationCap },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 font-black text-xs uppercase tracking-wider whitespace-nowrap border-4 border-gray-950 transition-all",
                            activeTab === tab.key
                                ? "bg-gray-950 text-white shadow-[4px_4px_0px_0px_#3b82f6]"
                                : "bg-white text-gray-600 hover:bg-gray-50 shadow-[4px_4px_0px_0px_black]"
                        )}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════════════ TAB CONTENT ═══════════════ */}
            
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Performance + Today Schedule */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Performance Bars */}
                        <div className="bg-gray-950 p-8 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#10b981] text-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white text-gray-950 transform -rotate-3 border-2 border-gray-950"><TrendingUp size={20} strokeWidth={3} /></div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">مؤشر الأداء</h3>
                            </div>
                            <div className="space-y-8">
                                <ProgressBar label="معدل الحضور" value={stats.attendanceRate} color="bg-emerald-500" />
                                <ProgressBar label="التقدم في الحصص" value={stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0} color="bg-primary-500" />
                                {next && <ProgressBar label={`التقدم نحو ${next.name}`} value={Math.min(Math.round((points / next.minPoints) * 100), 100)} color="bg-yellow-400" />}
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#3b82f6] overflow-hidden">
                            <div className="p-5 border-b-[6px] border-gray-950 bg-primary-50 flex items-center justify-between">
                                <h4 className="font-black text-lg uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic">
                                    <CalendarDays className="text-primary-600" size={24} /> مهام اليوم ({todayArabic})
                                </h4>
                            </div>
                            <div className="p-6">
                                {todaySchedule.length > 0 ? todaySchedule.map((dayData, idx) => (
                                    <div key={idx} className="space-y-3">
                                        {dayData.slots.map((slot, sIdx) => (
                                            <div key={sIdx} className="bg-gray-50 p-4 border-2 border-gray-950 flex items-center justify-between shadow-[3px_3px_0px_0px_black] hover:translate-x-1 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                                                        <Target size={18} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-gray-950 block">{slot.subject}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{slot.teacher}</span>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1.5 bg-gray-950 text-white text-[10px] font-black">
                                                    {slot.time} {slot.period === 'am' ? 'صباحاً' : 'مساءً'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )) : (
                                    <div className="py-16 flex flex-col items-center justify-center opacity-40 text-center">
                                        <Clock size={40} className="mb-3" />
                                        <p className="text-xs font-black uppercase tracking-[4px]">لا توجد مهام اليوم - استمتع بإجازتك!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity + Support */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <QuickLink icon={MessageSquare} label="الدردشة" color="blue" onClick={() => navigate('/chat')} />
                            <QuickLink icon={Award} label="الأوسمة" color="amber" onClick={() => {}} />
                        </div>

                        {/* Points Activity */}
                        <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#ef4444] p-6 overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-600 text-white transform -rotate-3 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                                    <Activity size={18} strokeWidth={3} />
                                </div>
                                <h3 className="text-lg font-black text-gray-950 uppercase italic tracking-tighter">آخر التحديثات</h3>
                            </div>
                            <div className="space-y-4">
                                {pointLogs.slice(0, 4).map((log, i) => (
                                    <div key={i} className="p-3 bg-gray-50 border-2 border-gray-950 shadow-[3px_3px_0px_0px_black]">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-gray-950 uppercase italic">{log.action || 'نقاط'}</span>
                                            <span className="text-lg font-black text-emerald-600 italic">+{log.amount}</span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold">{log.timestamp ? format(new Date(log.timestamp), 'dd/MM HH:mm') : ''}</span>
                                    </div>
                                ))}
                                {pointLogs.length === 0 && (
                                    <div className="py-10 text-center border-4 border-dashed border-gray-100 opacity-40">
                                        <Star size={28} className="mx-auto mb-2" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">لم تحصل على نقاط بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gray-950 p-6 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#3b82f6] text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white text-gray-950 flex items-center justify-center border-4 border-white transform rotate-6">
                                    <Headset size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase italic tracking-tighter leading-none mb-1">الدعم الفوري</h4>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">تواصل مع المشرف</p>
                                </div>
                            </div>
                            <a href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="bg-white text-gray-950 w-full py-3 text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-2 border-b-4 border-primary-600 hover:bg-primary-50 transition-colors">
                                تواصل الآن <MessageSquare size={14} strokeWidth={3} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#10b981] overflow-hidden">
                    <div className="p-5 border-b-[6px] border-gray-950 bg-emerald-50">
                        <h4 className="font-black text-xl uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic">
                            <CalendarDays className="text-emerald-600" size={28} /> الجدول الأسبوعي الكامل
                        </h4>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weeklySchedule.length > 0 ? weeklySchedule.map((dayData, idx) => (
                            <div key={idx} className={cn(
                                "border-4 border-gray-950 p-5 shadow-[6px_6px_0px_0px_black]",
                                dayData.day === todayArabic ? "bg-primary-50 border-primary-600 shadow-[6px_6px_0px_0px_#3b82f6]" : "bg-white"
                            )}>
                                <div className="flex items-center gap-3 mb-5 font-black text-gray-950 border-b-4 border-gray-100 pb-3">
                                    <div className="w-9 h-9 bg-gray-950 text-white flex items-center justify-center transform -rotate-3 text-sm">{dayData.day.substring(0, 1)}</div>
                                    <h5 className="text-lg">{dayData.day}</h5>
                                    {dayData.day === todayArabic && <span className="px-2 py-0.5 bg-primary-600 text-white text-[8px] font-black uppercase">اليوم</span>}
                                </div>
                                <div className="space-y-3">
                                    {dayData.slots.map((slot, sIdx) => (
                                        <div key={sIdx} className="bg-gray-50 p-3 border-2 border-gray-950 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-black text-gray-950 block">{slot.subject}</span>
                                                <span className="text-[9px] text-gray-400 font-bold">{slot.teacher}</span>
                                            </div>
                                            <div className="px-2 py-1 bg-gray-950 text-white text-[9px] font-black">
                                                {slot.time} {slot.period === 'am' ? 'ص' : 'م'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center opacity-30">
                                <CalendarDays size={48} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-[4px]">لا يوجد جدول مسجل حالياً</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#6366f1] overflow-hidden">
                    <div className="p-5 border-b-[6px] border-gray-950 bg-indigo-50">
                        <h4 className="font-black text-xl uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic">
                            <BookOpen className="text-indigo-600" size={28} /> سجل الحصص والحضور
                        </h4>
                    </div>
                    <div className="divide-y-2 divide-gray-950">
                        {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                            <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 border-2 border-gray-950 flex items-center justify-center shadow-[2px_2px_0px_0px_black]",
                                        session.status === 'completed' ? "bg-emerald-500 text-white" : session.status === 'cancelled' ? "bg-rose-500 text-white" : "bg-amber-400 text-gray-950"
                                    )}>
                                        {session.status === 'completed' ? <CheckCircle2 size={18} /> : session.status === 'cancelled' ? <XCircle size={18} /> : <Play size={18} />}
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-gray-950 block">{session.subject || session.teacherName}</span>
                                        <span className="text-[10px] text-gray-400 font-bold">{session.teacherName} • {session.date}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 border-2 border-gray-950 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_black]",
                                    session.status === 'completed' ? "bg-emerald-50 text-emerald-700" : session.status === 'cancelled' ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                                )}>
                                    {session.status === 'completed' ? 'حضور ✓' : session.status === 'cancelled' ? 'غياب ✗' : 'قادمة'}
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <BookOpen size={48} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-[4px]">لا يوجد سجل حصص بعد</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'subjects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(studentData?.enrollments || []).map((en: any, i: number) => {
                        const remaining = en.sessionsTotal - en.sessionsUsed;
                        const isLow = remaining <= 2;
                        const progress = en.sessionsTotal > 0 ? Math.round((en.sessionsUsed / en.sessionsTotal) * 100) : 0;

                        return (
                            <div key={i} className={cn(
                                "p-6 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_black] relative",
                                en.isFrozen ? "bg-blue-50" : isLow ? "bg-rose-50" : "bg-white"
                            )}>
                                {en.isFrozen && (
                                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[9px] font-black bg-blue-600 text-white px-2 py-1 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]">
                                        <Snowflake size={12} /> مُجمّد
                                    </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h5 className="font-black text-xl text-gray-950 tracking-tighter uppercase mb-1">{en.subject}</h5>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">المعلمة: {en.teacher}</p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 border-4 border-gray-950 font-black text-sm shadow-[4px_4px_0px_0px_black]",
                                        isLow ? "bg-rose-600 text-white" : "bg-emerald-500 text-white"
                                    )}>
                                        {remaining} حصة
                                    </div>
                                </div>

                                {/* Progress Grid */}
                                <div className="Grid grid-cols-5 md:grid-cols-8 gap-1.5 mb-6 flex flex-wrap">
                                    {[...Array(Math.min(en.sessionsTotal, 20))].map((_, idx) => (
                                        <div key={idx} className={cn(
                                            "w-7 h-7 border-2 flex items-center justify-center text-[8px] font-black",
                                            idx < en.sessionsUsed ? "bg-emerald-500 border-gray-950 text-white" : "bg-white border-gray-200"
                                        )}>
                                            {idx < en.sessionsUsed ? '✓' : idx + 1}
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div className="h-4 bg-white border-2 border-gray-950 p-0.5">
                                    <div className={cn("h-full transition-all", isLow ? "bg-rose-600" : "bg-primary-600")} style={{ width: `${progress}%` }} />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase">
                                    <span>المُستخدم: {en.sessionsUsed}</span>
                                    <span>الإجمالي: {en.sessionsTotal}</span>
                                </div>

                                {isLow && (
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-rose-600 bg-rose-100 p-2 border border-rose-300">
                                        <AlertCircle size={14} />
                                        تنبيه: الرصيد شارف على الانتهاء!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {(!studentData?.enrollments || studentData.enrollments.length === 0) && (
                        <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-200 opacity-40">
                            <GraduationCap size={48} className="mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-[4px]">لا توجد اشتراكات حالياً</p>
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
        emerald: "border-emerald-600 shadow-[6px_6px_0px_0px_#059669]",
        blue: "border-blue-600 shadow-[6px_6px_0px_0px_#2563eb]",
        amber: "border-amber-600 shadow-[6px_6px_0px_0px_#d97706]",
        rose: "border-rose-600 shadow-[6px_6px_0px_0px_#e11d48]",
    };
    const iconColors: any = {
        emerald: "bg-emerald-600", blue: "bg-blue-600", amber: "bg-amber-600", rose: "bg-rose-600",
    };
    return (
        <div className={cn("bg-white p-5 border-4 border-gray-950", colors[color])}>
            <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 text-white flex items-center justify-center transform -rotate-2 border-2 border-gray-950", iconColors[color])}>
                    <Icon size={18} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-gray-950 italic tracking-tighter">{value}</div>
        </div>
    );
};

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div>
        <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</span>
            <span className="text-2xl font-black text-white italic leading-none">{value}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 border-2 border-gray-950 relative overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className={cn("absolute top-0 right-0 h-full", color)} />
        </div>
    </div>
);

const QuickLink = ({ icon: Icon, label, color, onClick }: any) => {
    const colors: any = {
        blue: "text-blue-600 border-blue-600 shadow-[4px_4px_0px_0px_#2563eb] hover:bg-blue-50",
        amber: "text-amber-600 border-amber-600 shadow-[4px_4px_0px_0px_#d97706] hover:bg-amber-50",
    };
    return (
        <motion.button whileHover={{ y: -3 }} onClick={onClick}
            className={cn("p-4 bg-white border-4 flex flex-col items-center gap-2 text-center transition-all", colors[color])}>
            <Icon size={22} strokeWidth={3} />
            <p className="text-[10px] font-black uppercase tracking-tighter">{label}</p>
        </motion.button>
    );
};
