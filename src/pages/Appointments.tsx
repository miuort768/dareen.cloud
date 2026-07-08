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
import { MobileAppointments } from '../features/appointments/components/MobileAppointments';

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

    // Poll for completed sessions every 15s so teacher/admin stay in sync
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const sessions = await api.get<string[]>('/appointments/completed-sessions');
                if (mountedRef.current) setCompletedSessionIds(sessions || []);
            } catch {
                // silent — will retry next cycle
            }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

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
            .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch || enrollment.teacherId === currentUser.id)
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
        <div className="min-h-full pb-24 relative" dir="rtl">
    <div className="hidden md:block max-w-[1600px] mx-auto px-2">

            {/* Header */}
            <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-main leading-tight">قائمة المواعيد الدراسية</h1>
                        <p className="text-xs font-bold text-muted mt-0.5">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
                    </div>
                </div>
                {/* Quick stats inline */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 text-center rounded-xl bg-primary-soft">
                        <p className="text-micro font-bold text-primary">اليوم</p>
                        <p className="text-xl font-black tabular-nums leading-none text-primary">{todayAppointments}</p>
                    </div>
                    <div className="px-3 py-1.5 text-center rounded-xl bg-success-soft">
                        <p className="text-micro font-bold text-success-dark">المتبقي</p>
                        <p className="text-xl font-black tabular-nums leading-none text-success-dark">{remainingToday}</p>
                    </div>
                    <div className="px-3 py-1.5 text-center rounded-xl bg-info-soft">
                        <p className="text-micro font-bold text-info">الإجمالي</p>
                        <p className="text-xl font-black tabular-nums leading-none text-info">{totalAppointments}</p>
                    </div>
                </div>
            </div>

            {/* Filters Strip */}
            <div className="bg-card border border-border shadow-sm rounded-2xl mb-4">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-primary-soft">
                            <SlidersHorizontal size={12} className="text-primary" />
                        </div>
                        <span className="text-xs font-bold text-muted">تصفية النتائج</span>
                        {hasActiveFilters && (
                            <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg bg-primary-soft text-primary">نشط</span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterDay('all'); setFilterTeacher('all'); }}
                            className="flex items-center gap-1 px-2 py-1 text-micro font-bold rounded-xl shadow-sm active:scale-95 transition-all bg-error-soft text-error"
                        >
                            <X size={12} /> إعادة تعيين
                        </button>
                    )}
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" />
                        <input
                            type="text"
                            placeholder="ابحث باسم الطالب أو المادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-8 pe-8 py-2 border border-border text-xs font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface dark:bg-card transition-all placeholder:text-dim dark:placeholder:text-muted text-main rounded-xl"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-error transition-colors" aria-label="مسح البحث">
                                <X size={11} />
                            </button>
                        )}
                    </div>
                    {/* Day Filter */}
                    <div className="relative">
                        <Filter size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full ps-8 pe-3 py-2 border border-border text-micro font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface dark:bg-card appearance-none cursor-pointer text-main transition-all rounded-xl"
                        >
                            <option value="all">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    {/* Teacher Filter */}
                    <div className="relative">
                        <GraduationCap size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-dim" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full ps-8 pe-3 py-2 border border-border text-micro font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus bg-surface dark:bg-card appearance-none cursor-pointer text-main transition-all rounded-xl"
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
                            className="bg-card border border-border shadow-sm rounded-2xl flex flex-col"
                        >
                            {/* Day header */}
                            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background">
                                <h3 className="font-bold text-sm text-main">{day}</h3>
                                <span className={cn(
                                    "text-micro font-bold px-2 py-0.5 tabular-nums rounded-lg",
                                    appointments.length > 0
                                        ? "text-on-primary"
                                        : "text-dim"
                                )} style={appointments.length > 0 ? { backgroundColor: 'var(--bg-primary)' } : { backgroundColor: 'var(--bg-background)' }}>
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
                                                    <Clock size={12} className="text-primary" />
                                                    <span className="font-bold text-sm tabular-nums text-primary">{nextSession.time}</span>
                                                </div>
                                                <span className="text-micro font-bold px-1.5 py-0.5 rounded-lg bg-primary-soft text-primary">التالي</span>
                                            </div>

                                            {/* Student */}
                                            <div className="p-2 rounded-xl border border-primary-soft transition-all bg-primary-soft/50">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <User size={11} className="shrink-0 text-primary" />
                                                    <span className="text-xs font-bold text-main truncate">{nextSession.studentName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={10} className="shrink-0 text-success" />
                                                    <span className="text-micro font-bold text-muted truncate">{nextSession.teacherName}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                className="w-full bg-success hover:brightness-90 text-on-success py-2.5 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 size={14} /> إتمام الحصة
                                            </button>
                                        </div>
                                    );
                                })() : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-primary-soft">
                                            <Calendar size={18} className="text-primary" />
                                        </div>
                                        <p className="text-micro font-bold text-primary">لا توجد مواعيد</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {appointmentsByDay.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center bg-card border border-dashed border-border rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-primary-soft">
                                <Calendar size={28} className="text-primary" />
                            </div>
                            <h3 className="font-bold text-muted text-base mb-1">لا توجد مواعيد</h3>
                            <p className="text-dim text-xs font-bold max-w-xs">لا توجد مواعيد متطابقة مع معايير البحث</p>
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
                            className="bg-card border border-border shadow-sm h-fit sticky top-4 overflow-hidden rounded-2xl"
                        >
                            {/* Panel Header */}
                            <div className="px-4 py-3 bg-primary text-on-primary flex items-center justify-between">
                                <div>
                                    <p className="text-micro font-bold text-on-primary/60">تفاصيل الموعد</p>
                                    <h3 className="font-bold text-base">{selectedAppointment.day}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 text-center rounded-xl bg-white/15">
                                        <p className="font-black text-lg tabular-nums leading-none text-on-primary">{selectedAppointment.time}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-all rounded-xl"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Student */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-primary-soft" style={{ borderRight: '3px solid var(--border-primary)' }}>
                                    <div>
                                        <label className="block text-micro font-bold text-muted mb-0.5">الطالب</label>
                                        <h4 className="text-sm font-bold text-main">{selectedAppointment.studentName}</h4>
                                        <span className="text-micro font-bold text-primary">{selectedAppointment.studentGrade}</span>
                                    </div>
                                    <User size={18} className="text-dim" />
                                </div>

                                {/* Teacher */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-success-soft" style={{ borderRight: '3px solid var(--border-success)' }}>
                                    <div>
                                        <label className="block text-micro font-bold text-muted mb-0.5">المعلمة</label>
                                        <h4 className="text-sm font-bold text-main">{selectedAppointment.teacherName}</h4>
                                    </div>
                                    <ShieldCheck size={18} className="text-dim" />
                                </div>

                                {/* Subject */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-warning-soft" style={{ borderRight: '3px solid var(--border-warning)' }}>
                                    <div>
                                        <label className="block text-micro font-bold text-muted mb-0.5">المادة</label>
                                        <h4 className="text-sm font-bold text-main">{selectedAppointment.subject}</h4>
                                        <span className="text-micro font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg bg-warning-soft text-warning-dark">{selectedAppointment.curriculum}</span>
                                    </div>
                                    <BookOpen size={18} className="text-dim" />
                                </div>

                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm hover:bg-primary-hover transition-all active:scale-95"
                                >
                                    عودة <ArrowRight size={13} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        <div className="block md:hidden">
            <MobileAppointments />
        </div>
        </div>
    );
};
