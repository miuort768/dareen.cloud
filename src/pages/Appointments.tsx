import { useState, useEffect } from 'react';
import { 
    Calendar, Clock, Search, User, GraduationCap, 
    BookOpen, Filter, X, CheckCircle2,
    ShieldCheck, Activity, ArrowRight, SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { PageLoader } from '../components/ui/PageLoader';

// Interfaces
interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    enrollments: Enrollment[];
}

interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
    sessionsTotal: number;
    sessionsUsed: number;
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
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export const Appointments = () => {
    const { currentUser } = useApp();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAndReset = async () => {
            try {
                if (currentUser?.role === 'admin') {
                    const settings = await api.get<any>('/system/settings');
                    const lastResetDate = settings?.last_appointment_reset;
                    const todayStr = new Date().toDateString();
                    if (lastResetDate !== todayStr) {
                        await api.delete('/appointments/completed-sessions/reset');
                        setCompletedSessionIds([]);
                        await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                    } else {
                        const sessions = await api.get<string[]>('/appointments/completed-sessions');
                        setCompletedSessionIds(sessions || []);
                    }
                } else {
                    const sessions = await api.get<string[]>('/appointments/completed-sessions');
                    setCompletedSessionIds(sessions || []);
                }
            } catch (error) {
                console.error("Error managing appointment reset:", error);
            }
        };
        checkAndReset();
    }, [currentUser]);

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/appointments/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.get<any>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const teacherToMatch = currentUser?.teacherName || currentUser?.name;
    const allAppointments: AppointmentEvent[] = (students || []).flatMap(student =>
        (student.enrollments || [])
            .filter(enrollment => currentUser?.role !== 'teacher' || enrollment.teacher === teacherToMatch)
            .flatMap(enrollment =>
                (enrollment.schedule || []).map(slot => {
                    const normalizedPeriod = (slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص') ? 'ص' : 'م';
                    return {
                        id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                        studentName: student.name,
                        studentGrade: student.grade,
                        teacherName: enrollment.teacher,
                        subject: enrollment.subject,
                        curriculum: enrollment.curr,
                        day: slot.day,
                        hour: slot.hour,
                        period: slot.period,
                        time: `${slot.hour} ${normalizedPeriod}`
                    };
                })
            )
    );

    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    const filteredAppointments = allAppointments.filter(appointment => {
        const matchesSearch =
            appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDay = filterDay === 'all' || appointment.day === filterDay;
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher;
        return matchesSearch && matchesDay && matchesTeacher;
    });

    const appointmentsByDay = DAYS_OF_WEEK.map(day => ({
        day,
        appointments: filteredAppointments
            .filter(a => a.day === day)
            .sort((a, b) => {
                const timeA = Number(a.hour) + (a.period === 'pm' && Number(a.hour) !== 12 ? 12 : 0);
                const timeB = Number(b.hour) + (b.period === 'pm' && Number(b.hour) !== 12 ? 12 : 0);
                return timeA - timeB;
            })
    })).filter(dayObj => filterDay === 'all' || dayObj.day === filterDay);

    const totalAppointments = allAppointments.length;
    const todayAppointments = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today;
    }).length;

    const remainingToday = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today && !completedSessionIds.includes(a.id);
    }).length;

    const hasActiveFilters = searchTerm || filterDay !== 'all' || filterTeacher !== 'all';

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-4 pb-20 min-h-full md:animate-in md:fade-in md:duration-700" dir="rtl">

            {/* ─── Modern Header Banner ─── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-7 text-white shadow-lg shadow-indigo-500/20">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="bg-white/20 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">جدول المواعيد</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />)}
                                </div>
                            </div>
                            <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none">إدارة المواعيد والجلسات</h1>
                            <p className="text-white/60 text-[9px] md:text-[11px] font-bold flex items-center gap-1.5 mt-1">
                                <Activity size={10} className="shrink-0" />
                                مراقبة وتوجيه الجلسات التعليمية لشركاء النجاح
                            </p>
                        </div>
                    </div>
                    {/* Quick stats inline */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-black uppercase">اليوم</p>
                            <p className="text-xl font-black tabular-nums leading-none">{todayAppointments}</p>
                        </div>
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-black uppercase">متبقي</p>
                            <p className="text-xl font-black tabular-nums leading-none text-emerald-300">{remainingToday}</p>
                        </div>
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-black uppercase">إجمالي</p>
                            <p className="text-xl font-black tabular-nums leading-none">{totalAppointments}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Compact Filters Strip ─── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 flex items-center justify-center">
                            <SlidersHorizontal size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">فلترة النتائج</span>
                        {hasActiveFilters && (
                            <span className="bg-indigo-100 text-indigo-700 text-[7px] font-black px-1.5 py-0.5 uppercase">فلتر نشط</span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterDay('all'); setFilterTeacher('all'); }}
                            className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-700 transition-colors"
                        >
                            <X size={10} /> إعادة ضبط
                        </button>
                    )}
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="بحث عن طالب أو مادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-8 pl-8 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 transition-all placeholder:text-slate-300 text-slate-700 dark:text-white"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                                <X size={11} />
                            </button>
                        )}
                    </div>
                    {/* Day Filter */}
                    <div className="relative">
                        <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
                        >
                            <option value="all">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    {/* Teacher Filter */}
                    <div className="relative">
                        <GraduationCap size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
                        >
                            <option value="all">جميع المعلمات</option>
                            {uniqueTeachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ─── Main Schedule Grid + Details Panel ─── */}
            <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={`${showDetails ? 'lg:col-span-2' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {appointmentsByDay.map(({ day, appointments }) => (
                        <motion.div
                            layout
                            key={day}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                        >
                            {/* Day header */}
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                                <h3 className="font-black text-sm text-slate-900 dark:text-white">{day}</h3>
                                <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 tabular-nums",
                                    appointments.length > 0
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                    {appointments.length} جلسة
                                </span>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-start min-h-[140px]">
                                {appointments.length > 0 ? (() => {
                                    const remainingSessions = appointments.filter(a => !completedSessionIds.includes(a.id));
                                    if (remainingSessions.length > 0) {
                                        const nextSession = remainingSessions[0];
                                        return (
                                            <div
                                                key={nextSession.id}
                                                onClick={() => { setSelectedAppointment(nextSession); setShowDetails(true); }}
                                                className="flex flex-col gap-2 cursor-pointer group"
                                            >
                                                {/* Time row */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-indigo-500" />
                                                        <span className="font-black text-indigo-600 text-sm tabular-nums">{nextSession.time}</span>
                                                    </div>
                                                    <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5">التالي</span>
                                                </div>

                                                {/* Student */}
                                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 group-hover:border-indigo-200 transition-colors">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <User size={11} className="text-slate-400 shrink-0" />
                                                        <span className="text-xs font-black text-slate-800 dark:text-white truncate">{nextSession.studentName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldCheck size={10} className="text-emerald-500 shrink-0" />
                                                        <span className="text-[9px] font-bold text-slate-400 truncate">{nextSession.teacherName}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 font-black text-[10px] transition-all flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle2 size={11} /> تأكيد الإنجاز
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
                                                <CheckCircle2 size={22} className="text-emerald-500 mb-2" />
                                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">مكتمل</p>
                                                <p className="text-[8px] text-emerald-500 font-bold uppercase mt-0.5">جميع الجلسات منجزة</p>
                                            </div>
                                        );
                                    }
                                })() : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 opacity-30">
                                        <Calendar size={24} className="mb-2" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">لا يوجد جلسات</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {appointmentsByDay.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                            <Calendar size={36} className="text-slate-200 mb-3" />
                            <h3 className="font-black text-slate-600 dark:text-white text-base mb-1">لا توجد مواعيد</h3>
                            <p className="text-slate-400 text-xs max-w-xs">لا توجد نتائج تطابق الفلاتر المحددة حالياً</p>
                        </div>
                    )}
                </div>

                {/* ─── Details Panel ─── */}
                <AnimatePresence>
                    {showDetails && selectedAppointment && (
                        <motion.div
                            initial={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 1, x: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 0, x: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-fit sticky top-4 overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] font-black opacity-60 uppercase tracking-widest">تفاصيل الموعد</p>
                                    <h3 className="font-black text-base">{selectedAppointment.day}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 border border-white/20 px-3 py-1 text-center">
                                        <p className="font-black text-lg tabular-nums leading-none">{selectedAppointment.time}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="w-7 h-7 bg-white/20 hover:bg-rose-500 flex items-center justify-center transition-colors"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-2.5">
                                {/* Student */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-r-2 border-indigo-500">
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">الطالب</label>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedAppointment.studentName}</h4>
                                        <span className="text-[9px] font-bold text-indigo-600">{selectedAppointment.studentGrade}</span>
                                    </div>
                                    <User size={20} className="text-slate-200" />
                                </div>

                                {/* Teacher */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-r-2 border-emerald-500">
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">المعلمة</label>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedAppointment.teacherName}</h4>
                                    </div>
                                    <ShieldCheck size={20} className="text-slate-200" />
                                </div>

                                {/* Subject */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-r-2 border-amber-500">
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">المادة</label>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedAppointment.subject}</h4>
                                        <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 mt-1 inline-block">{selectedAppointment.curriculum}</span>
                                    </div>
                                    <BookOpen size={20} className="text-slate-200" />
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs transition-all hover:opacity-90"
                                >
                                    إغلاق <ArrowRight size={13} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
