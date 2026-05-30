import { useState, useEffect, useRef } from 'react';
import { 
    Calendar, Clock, Search, User, GraduationCap, 
    BookOpen, Filter, X, CheckCircle2,
    ShieldCheck, ArrowRight, SlidersHorizontal
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
    const mountedRef = useRef(true);

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

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/appointments/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
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
        fetchData();
        return () => { mountedRef.current = false; };
    }, []);

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
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
    <div className="max-w-[1600px] mx-auto px-2">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B5CF612' }}>
                        <Calendar size={22} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">قائمة المواعيد الدراسية</h1>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
                    </div>
                </div>
                {/* Quick stats inline */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 text-center rounded-xl" style={{ backgroundColor: '#8B5CF612' }}>
                        <p className="text-[8px] font-bold" style={{ color: '#7C3AED' }}>اليوم</p>
                        <p className="text-xl font-black tabular-nums leading-none" style={{ color: '#7C3AED' }}>{todayAppointments}</p>
                    </div>
                    <div className="px-3 py-1.5 text-center rounded-xl" style={{ backgroundColor: '#10B98112' }}>
                        <p className="text-[8px] font-bold" style={{ color: '#059669' }}>المتبقي</p>
                        <p className="text-xl font-black tabular-nums leading-none" style={{ color: '#059669' }}>{remainingToday}</p>
                    </div>
                    <div className="px-3 py-1.5 text-center rounded-xl" style={{ backgroundColor: '#2563EB12' }}>
                        <p className="text-[8px] font-bold" style={{ color: '#2563EB' }}>الإجمالي</p>
                        <p className="text-xl font-black tabular-nums leading-none" style={{ color: '#2563EB' }}>{totalAppointments}</p>
                    </div>
                </div>
            </div>

            {/* Filters Strip */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}>
                            <SlidersHorizontal size={12} style={{ color: '#8B5CF6' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">تصفية النتائج</span>
                        {hasActiveFilters && (
                            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#7C3AED' }}>نشط</span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterDay('all'); setFilterTeacher('all'); }}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-xl shadow-sm active:scale-95 transition-all" style={{ backgroundColor: '#F43F5E12', color: '#F43F5E' }}
                        >
                            <X size={12} /> إعادة تعيين
                        </button>
                    )}
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="ابحث باسم الطالب أو المادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-8 pl-8 py-2 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-[#8B5CF6] bg-slate-50 dark:bg-slate-800 transition-all placeholder:text-slate-400 text-slate-700 dark:text-white rounded-xl"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors" aria-label="مسح البحث">
                                <X size={11} />
                            </button>
                        )}
                    </div>
                    {/* Day Filter */}
                    <div className="relative">
                        <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 text-[10px] font-bold outline-none focus:border-[#8B5CF6] bg-slate-50 dark:bg-slate-800 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all rounded-xl"
                        >
                            <option value="all">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    {/* Teacher Filter */}
                    <div className="relative">
                        <GraduationCap size={13} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full pr-8 pl-3 py-2 border border-slate-200 dark:border-slate-700 text-[10px] font-bold outline-none focus:border-[#8B5CF6] bg-slate-50 dark:bg-slate-800 appearance-none cursor-pointer text-slate-700 dark:text-white transition-all rounded-xl"
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
                            className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl flex flex-col"
                        >
                            {/* Day header */}
                            <div className="px-4 py-2.5 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{day}</h3>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 tabular-nums rounded-lg",
                                    appointments.length > 0
                                        ? "text-white"
                                        : "text-slate-400"
                                )} style={appointments.length > 0 ? { backgroundColor: '#8B5CF6' } : { backgroundColor: '#F1F5F9' }}>
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
                                                    <Clock size={12} style={{ color: '#8B5CF6' }} />
                                                    <span className="font-bold text-sm tabular-nums" style={{ color: '#7C3AED' }}>{nextSession.time}</span>
                                                </div>
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#7C3AED' }}>التالي</span>
                                            </div>

                                            {/* Student */}
                                            <div className="p-2 rounded-xl border transition-all" style={{ backgroundColor: '#8B5CF608', borderColor: '#8B5CF620' }}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <User size={11} className="shrink-0" style={{ color: '#8B5CF6' }} />
                                                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{nextSession.studentName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={10} className="shrink-0" style={{ color: '#10B981' }} />
                                                    <span className="text-[9px] font-bold text-slate-400 truncate">{nextSession.teacherName}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                className="w-full bg-[#10B981] hover:bg-emerald-700 text-white py-2.5 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> إتمام الحصة
                                            </button>
                                        </div>
                                    );
                                })() : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#8B5CF612' }}>
                                            <Calendar size={18} style={{ color: '#8B5CF6' }} />
                                        </div>
                                        <p className="text-[9px] font-bold" style={{ color: '#8B5CF6' }}>لا توجد مواعيد</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {appointmentsByDay.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#8B5CF612' }}>
                                <Calendar size={28} style={{ color: '#8B5CF6' }} />
                            </div>
                            <h3 className="font-bold text-slate-600 dark:text-white text-base mb-1">لا توجد مواعيد</h3>
                            <p className="text-slate-400 text-xs font-bold max-w-xs">لا توجد مواعيد متطابقة مع معايير البحث</p>
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <AnimatePresence>
                    {showDetails && selectedAppointment && (
                        <motion.div
                            initial={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 1, x: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={window.innerWidth >= 768 ? { opacity: 0, x: 30 } : { opacity: 0, x: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm h-fit sticky top-4 overflow-hidden rounded-2xl"
                        >
                            {/* Panel Header */}
                            <div className="px-4 py-3 bg-[#172554] text-white flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-bold text-white/60">تفاصيل الموعد</p>
                                    <h3 className="font-bold text-base">{selectedAppointment.day}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 text-center rounded-xl" style={{ backgroundColor: '#ffffff15' }}>
                                        <p className="font-black text-lg tabular-nums leading-none text-white">{selectedAppointment.time}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-xl"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Student */}
                                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#8B5CF608', borderRight: '3px solid #8B5CF6' }}>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">الطالب</label>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppointment.studentName}</h4>
                                        <span className="text-[9px] font-bold" style={{ color: '#7C3AED' }}>{selectedAppointment.studentGrade}</span>
                                    </div>
                                    <User size={18} className="text-slate-300" />
                                </div>

                                {/* Teacher */}
                                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#10B98108', borderRight: '3px solid #10B981' }}>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">المعلمة</label>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppointment.teacherName}</h4>
                                    </div>
                                    <ShieldCheck size={18} className="text-slate-300" />
                                </div>

                                {/* Subject */}
                                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F59E0B08', borderRight: '3px solid #F59E0B' }}>
                                    <div>
                                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">المادة</label>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppointment.subject}</h4>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg" style={{ backgroundColor: '#F59E0B12', color: '#D97706' }}>{selectedAppointment.curriculum}</span>
                                    </div>
                                    <BookOpen size={18} className="text-slate-300" />
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#172554] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-900 transition-all active:scale-95"
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
