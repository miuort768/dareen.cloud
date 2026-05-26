import { useState, useEffect } from 'react';
import { 
    Calendar, Clock, Search, User, GraduationCap, 
    BookOpen, Filter, X, CheckCircle2,
    ShieldCheck, Activity, ArrowRight, SlidersHorizontal
} from 'lucide-react';
import { useCurrentUser } from '../context/AppContext';
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
    isPM: boolean;
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export const Appointments = () => {
    const currentUser = useCurrentUser();
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
                    const settings = await api.get<Record<string, unknown>>('/system/settings');
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
            const data = await api.get<Record<string, unknown>[]>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const allAppointments: AppointmentEvent[] = (students || []).flatMap(student =>
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
    );

    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    const filteredAppointments = allAppointments.filter(appointment => {
        const isCompleted = completedSessionIds.includes(appointment.id);
        if (isCompleted) return false;

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
                const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0);
                const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0);
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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-violet-950/20 font-sans" dir="rtl">
    <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
    <div className="relative z-10 max-w-[1600px] mx-auto px-2">

            {/* ??? Modern Header Banner ??? */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-800 via-violet-700 to-slate-900 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950 rounded-none shadow-sm shadow-violet-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="bg-white/20 text-white text-[8px] font-medium px-2 py-0.5 uppercase tracking-widest">جدول المواعيد</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />)}
                                </div>
                            </div>
                            <h1 className="text-lg md:text-2xl font-medium tracking-tight leading-none">قائمة المواعيد الدراسية</h1>
                            <p className="text-white/60 text-[9px] md:text-[11px] font-normal flex items-center gap-1.5 mt-1">
                                <Activity size={10} className="shrink-0" />
                                جدولة ومتابعة الحصص الأكاديمية للطلاب
                            </p>
                        </div>
                    </div>
                    {/* Quick stats inline */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-medium uppercase">اليوم</p>
                            <p className="text-xl font-medium tabular-nums leading-none">{todayAppointments}</p>
                        </div>
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-medium uppercase">المتبقي</p>
                            <p className="text-xl font-medium tabular-nums leading-none text-emerald-300">{remainingToday}</p>
                        </div>
                        <div className="bg-white/15 border border-white/20 px-3 py-1.5 text-center">
                            <p className="text-[8px] opacity-60 font-medium uppercase">الإجمالي</p>
                            <p className="text-xl font-medium tabular-nums leading-none">{totalAppointments}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ??? Compact Filters Strip ??? */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 flex items-center justify-center">
                            <SlidersHorizontal size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-widest">تصفية النتائج</span>
                        {hasActiveFilters && (
                            <span className="bg-indigo-100 text-indigo-700 text-[7px] font-medium px-1.5 py-0.5 uppercase">نشط</span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterDay('all'); setFilterTeacher('all'); }}
                            className="flex items-center gap-1 border border-rose-200 dark:border-rose-900/50 px-2 py-1 bg-white dark:bg-slate-900 text-[10px] font-medium text-rose-500 hover:text-rose-700 transition-colors"
                        >
                            <X size={12} /> إعادة تعيين
                        </button>
                    )}
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="ابحث باسم الطالب أو المادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-8 pl-8 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 transition-all placeholder:text-slate-300 text-slate-700 dark:text-white"
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
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-[10px] font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
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
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-[10px] font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all"
                        >
                            <option value="all">كل المعلمات</option>
                            {uniqueTeachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ??? Main Schedule Grid + Details Panel ??? */}
            <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={`${showDetails ? 'lg:col-span-2' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {appointmentsByDay.map(({ day, appointments }) => (
                        <motion.div
                            layout
                            key={day}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-sm transition-all duration-200 flex flex-col"
                        >
                            {/* Day header */}
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                                <h3 className="font-medium text-sm text-slate-900 dark:text-white">{day}</h3>
                                <span className={cn(
                                    "text-[9px] font-medium px-2 py-0.5 tabular-nums",
                                    appointments.length > 0
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                    {appointments.length} موعد
                                </span>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-start min-h-[140px]">
                                {appointments.length > 0 ? (() => {
                                    const nextSession = appointments[0];
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
                                                    <span className="font-medium text-indigo-600 text-sm tabular-nums">{nextSession.time}</span>
                                                </div>
                                                <span className="bg-indigo-50 text-indigo-600 text-[8px] font-medium px-1.5 py-0.5">التالي</span>
                                            </div>

                                            {/* Student */}
                                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 group-hover:border-indigo-200 transition-colors">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <User size={11} className="text-slate-400 shrink-0" />
                                                    <span className="text-xs font-medium text-slate-800 dark:text-white truncate">{nextSession.studentName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={10} className="text-emerald-500 shrink-0" />
                                                    <span className="text-[9px] font-normal text-slate-400 truncate">{nextSession.teacherName}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-medium text-xs transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> إتمام الحصة
                                            </button>
                                        </div>
                                    );
                                })() : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 opacity-30">
                                        <Calendar size={24} className="mb-2" />
                                        <p className="text-[9px] font-medium uppercase tracking-widest">لا توجد مواعيد</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {appointmentsByDay.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                            <Calendar size={36} className="text-slate-200 mb-3" />
                            <h3 className="font-medium text-slate-600 dark:text-white text-base mb-1">لا توجد مواعيد</h3>
                            <p className="text-slate-400 text-xs max-w-xs">لا توجد مواعيد متطابقة مع معايير البحث</p>
                        </div>
                    )}
                </div>

                {/* ??? Details Panel ??? */}
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
                                    <p className="text-[8px] font-medium opacity-60 uppercase tracking-widest">تفاصيل الموعد</p>
                                    <h3 className="font-medium text-base">{selectedAppointment.day}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 border border-white/20 px-3 py-1 text-center">
                                        <p className="font-medium text-lg tabular-nums leading-none">{selectedAppointment.time}</p>
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
                                            <label className="block text-[8px] font-medium text-slate-400 uppercase mb-0.5">الطالب</label>
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.studentName}</h4>
                                            <span className="text-[9px] font-normal text-indigo-600">{selectedAppointment.studentGrade}</span>
                                        </div>
                                        <User size={20} className="text-slate-200" />
                                    </div>

                                    {/* Teacher */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-r-2 border-emerald-500">
                                        <div>
                                            <label className="block text-[8px] font-medium text-slate-400 uppercase mb-0.5">المعلمة</label>
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.teacherName}</h4>
                                    </div>
                                    <ShieldCheck size={20} className="text-slate-200" />
                                </div>

                                {/* Subject */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-r-2 border-amber-500">
                                    <div>
                                        <label className="block text-[8px] font-medium text-slate-400 uppercase mb-0.5">المادة</label>
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">{selectedAppointment.subject}</h4>
                                        <span className="text-[8px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 mt-1 inline-block">{selectedAppointment.curriculum}</span>
                                    </div>
                                    <BookOpen size={20} className="text-slate-200" />
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-xs transition-all hover:opacity-90"
                                >
                                    عودة <ArrowRight size={13} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        </div>
    );
};
