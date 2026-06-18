import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Search, User, ShieldCheck,
    BookOpen, X, CheckCircle2, Filter, Loader2, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

interface Student {
    id: string;
    name: string;
    grade: string;
    enrollments: Enrollment[];
}

interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
    schedule: ScheduleSlot[];
}

interface ScheduleSlot {
    day: string;
    hour: string;
    period: string;
}

interface AppointmentEvent {
    id: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    isPM: boolean;
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut' }
};

export const MobileAppointments = () => {
    const currentUser = useCurrentUser();
    const mountedRef = useRef(true);

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    useEffect(() => {
        mountedRef.current = true;
        const checkAndReset = async () => {
            try {
                if (currentUser?.role === 'admin') {
                    const settings = await api.get<Record<string, unknown>>('/system/settings');
                    if (!mountedRef.current) return;
                    const lastResetDate = settings?.last_appointment_reset;
                    const todayStr = new Date().toDateString();
                    if (lastResetDate !== todayStr) {
                        await api.delete('/appointments/completed-sessions/reset');
                        if (!mountedRef.current) return;
                        setCompletedSessionIds([]);
                        await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                    } else {
                        const sessions = await api.get<string[]>('/appointments/completed-sessions');
                        if (!mountedRef.current) return;
                        setCompletedSessionIds(sessions || []);
                    }
                } else {
                    const sessions = await api.get<string[]>('/appointments/completed-sessions');
                    if (!mountedRef.current) return;
                    setCompletedSessionIds(sessions || []);
                }
            } catch (error) {
                console.error("Error managing appointment reset:", error);
            }
        };
        checkAndReset();
        return () => { mountedRef.current = false; };
    }, [currentUser]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const sessions = await api.get<string[]>('/appointments/completed-sessions');
                if (mountedRef.current) setCompletedSessionIds(sessions || []);
            } catch { /* silent */ }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        try {
            const data = await api.get<Record<string, unknown>[]>('/students');
            if (!mountedRef.current) return;
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => { mountedRef.current = false; };
    }, []);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allAppointments: AppointmentEvent[] = useMemo(() =>
        (students || []).flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const normalizedPeriod = (slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص') ? 'ص' : 'م';
                        const isPM = !(slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص');
                        const normHour = String(parseInt(String(slot.hour).trim(), 10) || '');
                        return {
                            id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(),
                            subject: enrollment.subject,
                            curriculum: enrollment.curr,
                            day: (slot.day || '').trim(),
                            hour: normHour,
                            period: slot.period,
                            time: `${normHour} ${normalizedPeriod}`,
                            isPM
                        };
                    })
                )
        ), [students, currentUser, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allAppointments.map(a => a.teacherName))), [allAppointments]);

    const upcomingAppointments = useMemo(() =>
        allAppointments.filter(a => !completedSessionIds.includes(a.id)), [allAppointments, completedSessionIds]);

    const completedAppointments = useMemo(() =>
        allAppointments.filter(a => completedSessionIds.includes(a.id)), [allAppointments, completedSessionIds]);

    const filteredAppointments = useMemo(() => {
        const source = activeTab === 'upcoming' ? upcomingAppointments : completedAppointments;
        return source.filter(a => {
            const matchesSearch = !searchTerm ||
                a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDay = filterDay === 'all' || a.day === filterDay;
            const matchesTeacher = filterTeacher === 'all' || a.teacherName === filterTeacher;
            return matchesSearch && matchesDay && matchesTeacher;
        });
    }, [activeTab, upcomingAppointments, completedAppointments, searchTerm, filterDay, filterTeacher]);

    const appointmentsByDay = useMemo(() =>
        DAYS_OF_WEEK.map(day => ({
            day,
            appointments: filteredAppointments
                .filter(a => a.day === day)
                .sort((a, b) => {
                    const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0);
                    const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0);
                    return timeA - timeB;
                })
        })).filter(dayObj => filterDay === 'all' || dayObj.day === filterDay), [filteredAppointments, filterDay]);

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic('medium');
        try {
            await api.post('/appointments/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };
    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true); setPullDistance(50); triggerHaptic('medium');
            try { await fetchData(); } catch (e) { console.error(e); }
            setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 800);
        } else { setPullDistance(0); setStartY(0); }
    };

    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const todayCount = upcomingAppointments.filter(a => a.day === todayName).length;
    const totalCount = allAppointments.length;
    const completedCount = completedAppointments.length;

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            dir="rtl"
            className="min-h-full pb-4 overflow-x-hidden relative bg-[#F8F8FC] dark:bg-slate-950"
        >
            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-[#8B5CF6] font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-[#94A3B8]">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp} className="px-4 pt-3 pb-2">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-[#8B5CF6]/20">
                        <p className="text-[18px] font-black text-[#8B5CF6] tabular-nums leading-none">{todayCount}</p>
                        <p className="text-[8px] font-bold text-[#8B5CF6]/70 mt-1">اليوم</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-emerald-100/50 dark:border-emerald-900/30">
                        <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{totalCount - completedCount}</p>
                        <p className="text-[8px] font-bold text-emerald-500/70 mt-1">المتبقي</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                        <p className="text-[18px] font-black text-[#2563EB] dark:text-blue-400 tabular-nums leading-none">{totalCount}</p>
                        <p className="text-[8px] font-bold text-blue-500/70 mt-1">الإجمالي</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="px-4 pb-2">
                <div className="flex bg-gradient-to-b from-[#F1F5F9] to-[#F1F5F9] dark:from-slate-800/60 dark:to-slate-800/60 rounded-2xl p-1 gap-1 shadow-sm">
                    {[
                        { id: 'upcoming' as const, label: 'المواعيد', badge: totalCount - completedCount },
                        { id: 'completed' as const, label: 'المكتملة', badge: completedCount },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            onClick={() => { triggerHaptic('light'); setActiveTab(tab.id); setSearchTerm(''); }}
                            whileTap={{ scale: 0.96 }}
                            className={cn(
                                "flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-slate-900 shadow-sm text-[#8B5CF6] dark:text-[#A78BFA] font-bold"
                                    : "text-[#94A3B8] dark:text-slate-500 font-medium"
                            )}
                        >
                            {tab.id === 'upcoming' ? (
                                <Calendar size={14} strokeWidth={1.5} />
                            ) : (
                                <CheckCircle2 size={14} strokeWidth={1.5} />
                            )}
                            <span className="text-[9px]">{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className={cn(
                                    "text-[7px] font-bold px-1.5 py-0.5 rounded-full",
                                    activeTab === tab.id
                                        ? "bg-[#8B5CF6] text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                )}>{tab.badge}</span>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 pb-2 space-y-2">
                <div className="relative">
                    <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث باسم الطالب أو المادة..."
                        className="w-full pr-8 pl-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-[#8B5CF6] rounded-2xl transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-white shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterDay}
                        onChange={(e) => setFilterDay(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] font-bold rounded-2xl outline-none text-slate-600 dark:text-slate-300 shadow-sm"
                    >
                        <option value="all">كل الأيام</option>
                        {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                    <select
                        value={filterTeacher}
                        onChange={(e) => setFilterTeacher(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] font-bold rounded-2xl outline-none text-slate-600 dark:text-slate-300 shadow-sm"
                    >
                        <option value="all">كل المعلمات</option>
                        {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 space-y-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-3"
                    >
                        {appointmentsByDay.length > 0 ? (
                            appointmentsByDay.map(({ day, appointments }) => (
                                <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 overflow-hidden">
                                    <div className="px-4 py-2.5 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between">
                                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">{day}</h3>
                                        <span className={cn(
                                            "text-[8px] font-bold px-2 py-0.5 rounded-lg",
                                            appointments.length > 0 ? "bg-[#8B5CF6] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        )}>{appointments.length} موعد</span>
                                    </div>
                                    <div className="p-2 space-y-1.5">
                                        {appointments.map(app => (
                                            <motion.div
                                                key={app.id}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => { triggerHaptic('light'); setSelectedAppointment(app); setShowDetails(true); }}
                                                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.97] transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={11} className="text-[#8B5CF6]" strokeWidth={1.5} />
                                                        <span className="font-bold text-xs text-[#7C3AED] tabular-nums">{app.time}</span>
                                                    </div>
                                                    {activeTab === 'upcoming' && (
                                                        <motion.button
                                                            whileTap={{ scale: 0.93 }}
                                                            onClick={(e) => handleCompleteSession(app.id, e)}
                                                            className="px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-bold rounded-xl flex items-center gap-1 shadow-sm"
                                                        >
                                                            <CheckCircle2 size={10} strokeWidth={1.5} /> إتمام
                                                        </motion.button>
                                                    )}
                                                    {activeTab === 'completed' && (
                                                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                            تم
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-black shrink-0" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                        {app.studentName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight truncate">{app.studentName}</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[7px] font-bold text-slate-400">{app.subject}</span>
                                                            <span className="text-[7px] font-bold text-slate-300">·</span>
                                                            <span className="text-[7px] font-bold text-slate-400 truncate">{app.teacherName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Calendar size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                    {activeTab === 'upcoming' ? 'لا توجد مواعيد متبقية' : 'لا توجد مواعيد مكتملة'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide-up Details Modal */}
            <AnimatePresence>
                {showDetails && selectedAppointment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end"
                        onClick={() => { triggerHaptic('light'); setShowDetails(false); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh]"
                        >
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            </div>

                            <div className="px-5 pb-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400">تفاصيل الموعد</p>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedAppointment.day}</h3>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#8B5CF612' }}>
                                        <p className="font-black text-lg tabular-nums text-[#8B5CF6] leading-none">{selectedAppointment.time}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: '#8B5CF608', borderRight: '3px solid #8B5CF6' }}>
                                        <div>
                                            <span className="text-[8px] font-bold text-slate-400">الطالب</span>
                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{selectedAppointment.studentName}</p>
                                            <span className="text-[9px] font-bold text-[#7C3AED]">{selectedAppointment.studentGrade}</span>
                                        </div>
                                        <User size={18} className="text-slate-300" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: '#10B98108', borderRight: '3px solid #10B981' }}>
                                        <div>
                                            <span className="text-[8px] font-bold text-slate-400">المعلمة</span>
                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{selectedAppointment.teacherName}</p>
                                        </div>
                                        <ShieldCheck size={18} className="text-slate-300" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: '#F59E0B08', borderRight: '3px solid #F59E0B' }}>
                                        <div>
                                            <span className="text-[8px] font-bold text-slate-400">المادة</span>
                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{selectedAppointment.subject}</p>
                                            <span className="text-[7px] font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg" style={{ backgroundColor: '#F59E0B12', color: '#D97706' }}>{selectedAppointment.curriculum}</span>
                                        </div>
                                        <BookOpen size={18} className="text-slate-300" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {activeTab === 'upcoming' && (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            handleCompleteSession(selectedAppointment.id, e);
                                            setShowDetails(false);
                                        }}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200/30"
                                    >
                                        <CheckCircle2 size={14} strokeWidth={1.5} />
                                        إتمام الحصة
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
