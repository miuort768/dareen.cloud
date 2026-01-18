import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, User, GraduationCap, BookOpen, Filter, X, CheckCircle2 } from 'lucide-react';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

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

    // Simulated 24h reset: Clear completed sessions if the day changes
    useEffect(() => {
        const checkAndReset = async () => {
            try {
                const settings = await api.get<any>('/system/settings');
                const lastResetDate = settings?.last_appointment_reset;
                const todayStr = new Date().toDateString();

                if (lastResetDate !== todayStr) {
                    await api.delete('/system/completed-sessions/reset');
                    setCompletedSessionIds([]);
                    await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                } else {
                    const sessions = await api.get<string[]>('/system/completed-sessions');
                    setCompletedSessionIds(sessions || []);
                }
            } catch (error) {
                console.error("Error managing appointment reset:", error);
            }
        };

        checkAndReset();
    }, []);

    const handleCompleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/system/completed-sessions', { id });
            setCompletedSessionIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Error completing session:", error);
        }
    };

    // Fetch Students Data
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

    useEffect(() => {
        fetchData();
    }, []);

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

    // Get unique teachers for filter
    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    // Apply Filters
    const filteredAppointments = allAppointments.filter(appointment => {
        const matchesSearch =
            appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.subject.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDay = filterDay === 'all' || appointment.day === filterDay;
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher;

        return matchesSearch && matchesDay && matchesTeacher;
    });

    // Group appointments by day
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

    // Statistics
    const totalAppointments = allAppointments.length;
    // Calculate today's appointments
    const todayAppointments = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today;
    }).length;

    // Remaining today
    const remainingToday = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today && !completedSessionIds.includes(a.id);
    }).length;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-96 rounded-none" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden border-b-4 border-primary-500 rounded-none mb-6">
                {/* Background Geometric Enhancement - Richer & Larger Shapes */}
                {/* Major Glows & Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

                {/* Central Geometric elements */}
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

                {/* Large Structural Shapes */}
                <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
                <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

                {/* Large Geometric Outlines */}
                <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

                {/* Pattern Layer */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <Calendar size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">المواعيد والجدول الأسبوعي</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <Clock size={14} className="text-white" />
                                عرض وإدارة جميع المواعيد المجدولة لشركاء النجاح
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="إجمالي المواعيد"
                    value={totalAppointments}
                    icon={Calendar}
                    color="indigo"
                    trend="أسبوعياً"
                />
                <StatsCard
                    title="مواعيد اليوم"
                    value={todayAppointments}
                    icon={Clock}
                    color="blue"
                    trend="اليوم"
                    trendUp={true}
                />
                <StatsCard
                    title="المتبقي اليوم"
                    value={remainingToday}
                    icon={CheckCircle2}
                    color="emerald"
                    trend="نشط"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب، معلمة أو مادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    {/* Day Filter */}
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الأيام</option>
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher Filter */}
                    <div className="relative">
                        <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-primary-500 text-sm rounded-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="all">جميع المعلمات</option>
                            {uniqueTeachers.map(teacher => (
                                <option key={teacher} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Weekly Schedule Grid - Unified Layout */}
            <div className={`grid gap-6 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={`${showDetails ? 'lg:col-span-2' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {appointmentsByDay.map(({ day, appointments }) => (
                        <div key={day} className="bg-white border-r-4 border-r-primary-600 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <Calendar size={18} />
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{day}</h3>
                                </div>
                                <div className="flex items-center gap-2 bg-primary-600 px-3 py-1 shadow-lg shadow-primary-600/20">
                                    <span className="text-white text-xs font-black">{appointments.length}</span>
                                    <span className="text-primary-100 text-[10px] font-bold">حصة</span>
                                </div>
                            </div>

                            <div className="p-4 min-h-[220px] flex flex-col justify-center">
                                {appointments.length > 0 ? (() => {
                                    const remainingSessions = appointments.filter(a => !completedSessionIds.includes(a.id));

                                    if (remainingSessions.length > 0) {
                                        const nextSession = remainingSessions[0];
                                        return (
                                            <div
                                                key={nextSession.id}
                                                onClick={() => {
                                                    setSelectedAppointment(nextSession);
                                                    setShowDetails(true);
                                                }}
                                                className="group p-5 bg-white dark:bg-gray-800 border-2 border-primary-100 dark:border-primary-900/30 hover:border-primary-500 transition-all cursor-pointer relative overflow-hidden shadow-md animate-in slide-in-from-top-4"
                                            >
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-primary-600"></div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-primary-50 dark:bg-primary-900/50">
                                                            <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                                                        </div>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{nextSession.time}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                                    >
                                                        تم الإنجاز
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <User size={16} className="text-slate-400" />
                                                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{nextSession.studentName}</span>
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 font-black dark:bg-gray-700 dark:text-gray-300">
                                                            {nextSession.curriculum}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <GraduationCap size={16} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{nextSession.teacherName}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">الحصة التالية قيد الانتظار</p>
                                                    <p className="text-xs text-primary-600 font-black">المتبقي: {remainingSessions.length}</p>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="text-center py-10 bg-emerald-50/50 dark:bg-emerald-900/10 border border-dashed border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <h4 className="text-emerald-900 dark:text-emerald-300 font-black text-sm mb-1 uppercase tracking-tight">تم الانتهاء من اليوم بنجاح</h4>
                                                <p className="text-[10px] text-emerald-600/70 font-bold">ستعود المواعيد للظهور غداً تلقائياً</p>
                                            </div>
                                        );
                                    }
                                })() : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center mx-auto mb-3 opacity-50">
                                            <Calendar size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">لا توجد حصص مجدولة</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details Panel */}
                {showDetails && selectedAppointment && (
                    <div className="bg-white border border-gray-200 h-fit dark:bg-gray-900 dark:border-gray-800 animate-in slide-in-from-left-4 sticky top-6">
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary-600"></div>
                            <button onClick={() => setShowDetails(false)} className="absolute left-4 top-4 text-gray-400 hover:text-red-600 transition-colors hover:bg-red-50 p-1 rounded-none dark:hover:bg-red-900/20">
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center pt-2">
                                <div className="p-3 bg-primary-100 rounded-none mb-3 dark:bg-primary-900/30">
                                    <Clock className="text-primary-600 dark:text-primary-400" size={32} />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{selectedAppointment.day}</h3>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{selectedAppointment.time}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Student Info */}
                            <div className="bg-blue-50 p-4 border border-blue-100 rounded-none dark:bg-blue-900/20 dark:border-blue-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                                    <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">معلومات الطالب</h4>
                                </div>
                                <p className="text-base font-bold text-gray-900 dark:text-white mb-1">{selectedAppointment.studentName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{selectedAppointment.studentGrade}</p>
                            </div>

                            {/* Teacher Info */}
                            <div className="bg-purple-50 p-4 border border-purple-100 rounded-none dark:bg-purple-900/20 dark:border-purple-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap size={16} className="text-purple-600 dark:text-purple-400" />
                                    <h4 className="font-bold text-sm text-purple-900 dark:text-purple-300">المعلمة</h4>
                                </div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">{selectedAppointment.teacherName}</p>
                            </div>

                            {/* Subject Info */}
                            <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-none dark:bg-emerald-900/20 dark:border-emerald-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">المادة والمنهج</h4>
                                </div>
                                <p className="text-base font-bold text-gray-900 dark:text-white mb-1">{selectedAppointment.subject}</p>
                                <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-none font-bold dark:bg-emerald-900/40 dark:text-emerald-400">
                                    {selectedAppointment.curriculum}
                                </span>
                            </div>

                            {/* Time Summary */}
                            <div className="bg-amber-50 p-4 border border-amber-100 rounded-none dark:bg-amber-900/20 dark:border-amber-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">موعد الحصة</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">{selectedAppointment.day}</span>
                                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{selectedAppointment.time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
                <div className="bg-white border border-gray-200 p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                    <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">لا توجد مواعيد</h3>
                    <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على مواعيد تطابق معايير البحث</p>
                </div>
            )}
        </div>
    );
};
