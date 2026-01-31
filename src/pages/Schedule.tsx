import { useState, useEffect } from 'react';
import { Calendar, Clock, X, User, Users, Download, GraduationCap, BookOpen, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';

interface Teacher {
    id: string;
    name: string;
    subject?: string;
}

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

interface ScheduleEvent {
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

const TIME_SLOTS = [
    { hour: 8, period: 'am', label: '8 ص' },
    { hour: 9, period: 'am', label: '9 ص' },
    { hour: 10, period: 'am', label: '10 ص' },
    { hour: 11, period: 'am', label: '11 ص' },
    { hour: 12, period: 'pm', label: '12 م' },
    { hour: 1, period: 'pm', label: '1 م' },
    { hour: 2, period: 'pm', label: '2 م' },
    { hour: 3, period: 'pm', label: '3 م' },
    { hour: 4, period: 'pm', label: '4 م' },
    { hour: 5, period: 'pm', label: '5 م' },
    { hour: 6, period: 'pm', label: '6 م' },
    { hour: 7, period: 'pm', label: '7 م' },
    { hour: 8, period: 'pm', label: '8 م' },
    { hour: 9, period: 'pm', label: '9 م' },
    { hour: 10, period: 'pm', label: '10 م' },
];

const COLORS = [
    'from-blue-50 to-blue-100/50 text-blue-700 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/10 dark:text-blue-300 dark:border-blue-800',
    'from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/10 dark:text-emerald-300 dark:border-emerald-800',
    'from-purple-50 to-purple-100/50 text-purple-700 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/10 dark:text-purple-300 dark:border-purple-800',
    'from-orange-50 to-orange-100/50 text-orange-700 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/10 dark:text-orange-300 dark:border-orange-800',
    'from-pink-50 to-pink-100/50 text-pink-700 border-pink-200 dark:from-pink-900/20 dark:to-pink-800/10 dark:text-pink-300 dark:border-pink-800',
    'from-teal-50 to-teal-100/50 text-teal-700 border-teal-200 dark:from-teal-900/20 dark:to-teal-800/10 dark:text-teal-300 dark:border-teal-800',
    'from-indigo-50 to-indigo-100/50 text-indigo-700 border-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/10 dark:text-indigo-300 dark:border-indigo-800',
    'from-rose-50 to-rose-100/50 text-rose-700 border-rose-200 dark:from-rose-900/20 dark:to-rose-800/10 dark:text-rose-300 dark:border-rose-800',
];

const ACCENT_COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'
];

export const Schedule = () => {
    const { currentUser } = useApp();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [selectedSlotEvents, setSelectedSlotEvents] = useState<ScheduleEvent[]>([]);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [enrollData, setEnrollData] = useState({
        studentId: '',
        day: '',
        hour: '',
        period: '',
        teacherName: currentUser?.teacherName || '',
        subject: ''
    });
    const [mobileActiveDay, setMobileActiveDay] = useState<string>('السبت');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        if (DAYS_OF_WEEK.includes(today)) {
            setMobileActiveDay(today);
        }
    }, []);

    // Fetch Students Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<any>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching data", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleQuickEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollData.studentId) return;

        try {
            const student = students.find(s => s.id === enrollData.studentId);
            if (!student) return;

            const updatedStudent = { ...student };
            const teacher = enrollData.teacherName;

            // Find if student already has an enrollment with this teacher
            const enrollmentIndex = updatedStudent.enrollments.findIndex(en => en.teacher === teacher);

            if (enrollmentIndex >= 0) {
                updatedStudent.enrollments[enrollmentIndex].schedule.push({
                    day: enrollData.day,
                    hour: enrollData.hour,
                    period: enrollData.period
                });
            } else {
                // If not, we might need more info (subject, etc.)
                const teachers = await api.get<Teacher[]>('/teachers');
                const teacherObj = (Array.isArray(teachers) ? teachers : (teachers as any).data || []).find((t: Teacher) => t.name === teacher);

                updatedStudent.enrollments.push({
                    teacher: teacher,
                    subject: teacherObj?.subject || 'مادة عامة',
                    curr: 'عام',
                    sessionsTotal: 8,
                    sessionsUsed: 0,
                    schedule: [{
                        day: enrollData.day,
                        hour: enrollData.hour,
                        period: enrollData.period
                    }]
                });
            }

            await api.put(`/students/${student.id}`, updatedStudent);

            setShowAddModal(false);
            fetchData();
        } catch (error) {
            console.error("Error enrolling student", error);
        }
    };

    const handleCancelSession = async (studentId: string, teacherName: string, day: string, hour: string, period: string) => {
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            const updatedStudent = { ...student };
            const enrollmentIndex = updatedStudent.enrollments.findIndex(en => en.teacher === teacherName);

            if (enrollmentIndex >= 0) {
                updatedStudent.enrollments[enrollmentIndex].schedule = updatedStudent.enrollments[enrollmentIndex].schedule.filter(
                    slot => !(slot.day === day && slot.hour === hour && slot.period === period)
                );

                await api.put(`/students/${student.id}`, updatedStudent);

                setShowDetails(false);
                setShowSlotModal(false);
                fetchData();
            }
        } catch (error) {
            console.error("Error cancelling session", error);
        }
    };

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const allEvents: ScheduleEvent[] = students.flatMap(student =>
        (student.enrollments || [])
            .filter(enrollment => currentUser?.role !== 'teacher' || enrollment.teacher === teacherToMatch)
            .flatMap(enrollment =>
                (enrollment.schedule || []).map(slot => {
                    const normalizedPeriod = (slot.period || '').trim().toLowerCase();
                    const isAM = normalizedPeriod === 'am' || normalizedPeriod === 'صباحاً' || normalizedPeriod === 'صباحا' || normalizedPeriod === 'ص';

                    return {
                        id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                        studentName: student.name,
                        studentGrade: student.grade,
                        teacherName: (enrollment.teacher || '').trim(),
                        subject: enrollment.subject,
                        curriculum: enrollment.curr,
                        day: (slot.day || '').trim(),
                        hour: String(slot.hour).trim(),
                        period: isAM ? 'am' : 'pm',
                        time: `${slot.hour} ${isAM ? 'ص' : 'م'}`
                    };
                })
            )
    );

    const uniqueTeachers = Array.from(new Set(allEvents.map(e => e.teacherName)));

    const filteredEvents = allEvents.filter(event => {
        const matchesSearch =
            (event.studentName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            (event.teacherName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            (event.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesDay = filterDay === 'all' || event.day === filterDay;
        const matchesTeacher = filterTeacher === 'all' || event.teacherName === filterTeacher;
        return matchesSearch && matchesDay && matchesTeacher;
    });

    const totalSessions = allEvents.length;
    const uniqueStudents = new Set(allEvents.map(e => e.studentName)).size;
    const activeSubjects = new Set(allEvents.map(e => e.subject)).size;

    const getTeacherColors = (teacherName: string) => {
        const index = uniqueTeachers.indexOf(teacherName);
        return {
            gradient: COLORS[index % COLORS.length],
            accent: ACCENT_COLORS[index % ACCENT_COLORS.length]
        };
    };

    const getEventsForSlot = (day: string, hour: number, period: string) => {
        const targetDay = day.trim();
        const targetPeriod = period.toLowerCase();

        return filteredEvents.filter(
            e => {
                const eventDay = e.day.trim();
                const eventHour = Number(e.hour); // Convert to number for safe comparison
                const eventPeriod = e.period.toLowerCase();

                return eventDay === targetDay && eventHour === hour && eventPeriod === targetPeriod;
            }
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-none" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            {/* Page Header */}
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
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

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <Calendar size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">الجدول الأسبوعي العام</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <Clock size={14} className="text-white" />
                                متابعة مواعيد الحصص لجميع الطلاب والمعلمات
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap no-print">
                        <button
                            onClick={() => window.print()}
                            className="hidden md:flex bg-white text-primary-700 px-6 py-3 rounded-none items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0 h-14"
                        >
                            <Download size={20} />
                            <span>طباعة الجدول</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="إجمالي الجلسات" value={totalSessions} icon={Calendar} color="blue" />
                <StatsCard title="الطلاب المجدولين" value={uniqueStudents} icon={GraduationCap} color="emerald" />
                <StatsCard title="المواد النشطة" value={activeSubjects} icon={BookOpen} color="purple" />
                <StatsCard title="يوم العمل الحالي" value={new Date().toLocaleDateString('ar-EG', { weekday: 'long' })} icon={Clock} color="indigo" />
            </div>

            {/* Filters */}
            <div className="bg-white p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex flex-wrap gap-6 items-end no-print">
                <div className="flex-1 min-w-[250px] space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">بحث سريع</label>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ابحث باسم الطالب، المعلمة أو المادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none px-10 py-3 text-sm font-bold focus:ring-2 ring-primary-500 transition-all dark:text-white"
                        />
                    </div>
                </div>

                <div className="w-48 space-y-2 hidden md:block">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">تصفية باليوم</label>
                    <select
                        value={filterDay}
                        onChange={(e) => setFilterDay(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold focus:ring-2 ring-primary-500 dark:text-white"
                    >
                        <option value="all">كل الأيام</option>
                        {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                </div>

                {currentUser?.role !== 'teacher' && (
                    <div className="w-48 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">تصفية بالمعلمة</label>
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 text-sm font-bold focus:ring-2 ring-primary-500 dark:text-white"
                        >
                            <option value="all">كل المعلمات</option>
                            {uniqueTeachers.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-6">
                {/* Mobile Day Tabs */}
                <div className="flex flex-wrap gap-2 justify-center pb-2">
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day}
                            onClick={() => setMobileActiveDay(day)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black transition-all shadow-sm border flex-grow basis-[30%] sm:basis-auto text-center shrink-0",
                                mobileActiveDay === day
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30 shadow-md ring-2 ring-indigo-200 ring-offset-1 dark:ring-indigo-900 dark:ring-offset-gray-900"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Mobile Schedule List */}
                <div className="space-y-4">
                    {TIME_SLOTS.map(slot => {
                        const events = getEventsForSlot(mobileActiveDay, slot.hour, slot.period);
                        return (
                            <div key={`${slot.hour}-${slot.period}`} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-black text-xs">
                                        {slot.label}
                                    </div>
                                    <div className="h-px bg-gray-100 flex-1 dark:bg-gray-800"></div>
                                </div>

                                {events.length > 0 ? (
                                    <div className="grid gap-3">
                                        {events.map(event => {
                                            const colors = getTeacherColors(event.teacherName);
                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={() => {
                                                        setSelectedEvent(event);
                                                        setShowDetails(true);
                                                    }}
                                                    className={cn(
                                                        "relative overflow-hidden p-4 rounded-xl border transition-all active:scale-[0.98]",
                                                        "bg-gradient-to-br",
                                                        colors.gradient
                                                    )}
                                                >
                                                    <div className={cn("absolute top-0 right-0 w-1.5 h-full", colors.accent)}></div>
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div>
                                                            <h4 className="font-black text-gray-900 dark:text-white mb-1">{event.studentName}</h4>
                                                            <p className="text-xs font-bold opacity-80 mb-2">{event.subject} • {event.studentGrade}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-black opacity-60 bg-white/50 w-fit px-2 py-1 rounded-full">
                                                                <User size={12} />
                                                                {event.teacherName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEnrollData({
                                                ...enrollData,
                                                day: mobileActiveDay,
                                                hour: String(slot.hour),
                                                period: slot.period
                                            });
                                            setShowAddModal(true);
                                        }}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/50 transition-all dark:border-gray-800 dark:hover:border-gray-700"
                                    >
                                        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                            <span className="text-xl leading-none font-light mb-0.5">+</span>
                                        </div>
                                        <span className="text-sm font-bold">إضافة حصة</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Schedule Table */}
            <div id="printable-schedule" className="hidden md:block bg-white border border-gray-200 overflow-x-auto dark:bg-gray-900 dark:border-gray-800 shadow-xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-slate-50 border border-gray-100 p-2 md:p-4 w-16 md:w-28 text-[10px] md:text-sm font-black text-slate-500 uppercase dark:bg-slate-900 dark:border-gray-800">
                                الوقت
                            </th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className={cn(
                                    "bg-slate-50 border border-gray-100 p-2 md:p-4 text-[10px] md:text-sm font-black uppercase dark:bg-slate-900 dark:border-gray-800",
                                    new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day ? "text-primary-600 bg-primary-50/50" : "text-slate-700 dark:text-gray-300"
                                )}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map((slot) => (
                            <tr key={`${slot.hour}-${slot.period}`}>
                                <td className="border border-gray-50 p-2 md:p-4 text-center font-black text-[9px] md:text-xs text-slate-400 dark:border-gray-800">
                                    {slot.label}
                                </td>
                                {DAYS_OF_WEEK.map(day => {
                                    const eventsInSlot = getEventsForSlot(day, slot.hour, slot.period);
                                    return (
                                        <td key={day}
                                            onClick={() => {
                                                if (eventsInSlot.length === 0) {
                                                    setEnrollData({
                                                        ...enrollData,
                                                        day,
                                                        hour: String(slot.hour),
                                                        period: slot.period
                                                    });
                                                    setShowAddModal(true);
                                                }
                                            }}
                                            className={cn(
                                                "border border-gray-50 p-1 h-24 min-w-[140px] vertical-top dark:border-gray-800 transition-colors cursor-pointer group/cell relative",
                                                new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day && "bg-primary-50/10",
                                                eventsInSlot.length === 0 && "hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                                            )}>
                                            {eventsInSlot.length === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-10 transition-opacity">
                                                    <Calendar size={40} className="text-primary-600" />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1">
                                                {eventsInSlot.length > 1 ? (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedSlotEvents(eventsInSlot);
                                                            setShowSlotModal(true);
                                                        }}
                                                        className="bg-gradient-to-br from-primary-600 to-indigo-700 p-2 text-center border-l-4 border-white transition-all hover:scale-[1.02] cursor-pointer shadow-md relative group overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <p className="font-black text-white text-[12px] uppercase tracking-tighter">
                                                            {eventsInSlot.length} حصص مشغولة
                                                        </p>
                                                        <p className="text-[9px] text-primary-100 font-medium mt-1">اضغط للتفاصيل</p>
                                                        <div className="absolute -bottom-1 -left-1 opacity-20">
                                                            <Users size={24} className="text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    eventsInSlot.map(event => {
                                                        const colors = getTeacherColors(event.teacherName);
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedEvent(event);
                                                                    setShowDetails(true);
                                                                }}
                                                                className={cn(
                                                                    "bg-gradient-to-br p-2 text-right border-l-4 transition-all hover:scale-[1.02] cursor-pointer shadow-sm relative group overflow-hidden",
                                                                    colors.gradient
                                                                )}
                                                            >
                                                                <div className={cn("absolute top-0 right-0 w-1 h-full", colors.accent)}></div>
                                                                <p className="font-black text-[10px] truncate mb-0.5">{event.studentName}</p>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[9px] font-bold opacity-80">{event.subject}</p>
                                                                    <p className="text-[8px] font-black opacity-60 text-left truncate flex-1 ml-1">{event.teacherName}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Event Details Modal */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in no-print">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl border-t-8 border-primary-600 animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase">تفاصيل الموعد</h3>
                            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary-50 rounded-none flex items-center justify-center text-primary-600">
                                    <User size={32} />
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white">{selectedEvent.studentName}</h4>
                                    <p className="text-sm font-bold text-gray-500">{selectedEvent.studentGrade}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المادة</label>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <BookOpen size={16} className="text-primary-500" /> {selectedEvent.subject}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المعلمة</label>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Users size={16} className="text-primary-500" /> {selectedEvent.teacherName}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الوقت</label>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Clock size={16} className="text-primary-500" /> {selectedEvent.time}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اليوم</label>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar size={16} className="text-primary-500" /> {selectedEvent.day}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => handleCancelSession(selectedEvent.id.split('-')[0], selectedEvent.teacherName, selectedEvent.day, selectedEvent.hour, selectedEvent.period)}
                                    className="bg-rose-50 text-rose-600 font-black py-4 uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    إلغاء الحصة
                                </button>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="bg-slate-900 text-white font-black py-4 uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Multiple Events for Slot Modal */}
            {showSlotModal && selectedSlotEvents.length > 0 && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in no-print">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl shadow-2xl border-t-8 border-indigo-600 animate-in zoom-in-95 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase">حصص متزامنة</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                    {selectedSlotEvents[0].day} | {selectedSlotEvents[0].time}
                                </p>
                            </div>
                            <button onClick={() => setShowSlotModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedSlotEvents.map((event) => {
                                    const colors = getTeacherColors(event.teacherName);
                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setShowDetails(true);
                                            }}
                                            className={cn(
                                                "p-4 border-r-4 transition-all hover:translate-x-1 cursor-pointer shadow-sm relative overflow-hidden group",
                                                colors.gradient.replace('from-', 'bg-').split(' ')[0]
                                            )}
                                        >
                                            <div className={cn("absolute top-0 right-0 w-1.5 h-full", colors.accent)}></div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-white/50 backdrop-blur-sm flex items-center justify-center font-black text-gray-700">
                                                    {event.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-900 dark:text-white">{event.studentName}</p>
                                                    <p className="text-[10px] font-bold text-gray-500">{event.studentGrade}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={14} className="text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{event.subject}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap size={14} className="text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{event.teacherName}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-center text-[10px] font-black uppercase text-primary-600">
                                                <span>عرض التفاصيل</span>
                                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setShowSlotModal(false)}
                                className="w-full bg-slate-900 text-white font-black py-4 uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all"
                            >
                                إغلاق القائمة
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Quick Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in no-print">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl border-t-8 border-primary-600 animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase">تسجيل موعد سريع</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleQuickEnroll} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الموعد المحدد</label>
                                    <div className="bg-primary-50 p-4 border-r-4 border-primary-500 text-primary-900 font-black text-sm">
                                        {enrollData.day} - {enrollData.hour} {enrollData.period === 'am' ? 'صباحاً' : 'مساءً'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اختر الطالب</label>
                                    <select
                                        required
                                        value={enrollData.studentId}
                                        onChange={(e) => setEnrollData({ ...enrollData, studentId: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-4 text-sm font-bold focus:ring-2 ring-primary-500 dark:text-white"
                                    >
                                        <option value="">اختر طالباً...</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.grade}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المعلمة</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={enrollData.teacherName}
                                        className="w-full bg-gray-100 dark:bg-gray-800 border-none px-4 py-4 text-sm font-bold opacity-60 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-gray-100 text-gray-600 font-black py-4 uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 text-white font-black py-4 uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all"
                                >
                                    تأكيد الحجز
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
