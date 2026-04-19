import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    User, 
    Users, 
    BookOpen, 
    Search,
    Zap,
    LayoutGrid,
    Plus,
    Printer,
    Video,
    X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// Interfaces
interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    enrollments: Enrollment[];
    totalPoints?: number;
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
    studentId: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    studentPoints?: number;
}

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const TIME_SLOTS = [
    { hour: 8,  period: 'am', label: '8 ص'  },
    { hour: 9,  period: 'am', label: '9 ص'  },
    { hour: 10, period: 'am', label: '10 ص' },
    { hour: 11, period: 'am', label: '11 ص' },
    { hour: 12, period: 'pm', label: '12 م' },
    { hour: 1,  period: 'pm', label: '1 م'  },
    { hour: 2,  period: 'pm', label: '2 م'  },
    { hour: 3,  period: 'pm', label: '3 م'  },
    { hour: 4,  period: 'pm', label: '4 م'  },
    { hour: 5,  period: 'pm', label: '5 م'  },
    { hour: 6,  period: 'pm', label: '6 م'  },
    { hour: 7,  period: 'pm', label: '7 م'  },
    { hour: 8,  period: 'pm', label: '8 م'  },
    { hour: 9,  period: 'pm', label: '9 م'  },
    { hour: 10, period: 'pm', label: '10 م' },
];

const ACCENT_COLORS = [
    { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-900 dark:text-blue-200',   bar: 'bg-blue-500'   },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-900 dark:text-emerald-200', bar: 'bg-emerald-500' },
    { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-900 dark:text-amber-200', bar: 'bg-amber-500'   },
    { bg: 'bg-rose-50 dark:bg-rose-950/30',   text: 'text-rose-900 dark:text-rose-200',   bar: 'bg-rose-500'   },
    { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-900 dark:text-indigo-200', bar: 'bg-indigo-500' },
    { bg: 'bg-teal-50 dark:bg-teal-950/30',   text: 'text-teal-900 dark:text-teal-200',   bar: 'bg-teal-500'   },
    { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-900 dark:text-purple-200', bar: 'bg-purple-500' },
];

export const Schedule = () => {
    const { currentUser } = useApp();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showSharedModal, setShowSharedModal] = useState(false);
    const [sharedEvents, setSharedEvents] = useState<ScheduleEvent[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [enrollData, setEnrollData] = useState({
        studentId: '',
        day: '',
        hour: '',
        period: '',
        teacherName: currentUser?.teacherName || currentUser?.name || '',
        subject: ''
    });
    const [mobileActiveDay, setMobileActiveDay] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        setMobileActiveDay(DAYS_OF_WEEK.includes(today) ? today : 'السبت');
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<any>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollData.studentId) return;
        try {
            const student = students.find(s => s.id === enrollData.studentId);
            if (!student) return;
            const updatedStudent = { ...student };
            const teacher = enrollData.teacherName;
            const enrollmentIndex = updatedStudent.enrollments.findIndex(en => en.teacher === teacher);
            if (enrollmentIndex >= 0) {
                updatedStudent.enrollments[enrollmentIndex].schedule.push({
                    day: enrollData.day, hour: enrollData.hour, period: enrollData.period
                });
            } else {
                updatedStudent.enrollments.push({
                    teacher,
                    subject: enrollData.subject || 'مادة عامة',
                    curr: 'عام',
                    sessionsTotal: 8,
                    sessionsUsed: 0,
                    schedule: [{ day: enrollData.day, hour: enrollData.hour, period: enrollData.period }]
                });
            }
            await api.put(`/students/${student.id}`, updatedStudent);
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            console.error('Error enrolling', error);
        }
    };

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();

    const allEvents: ScheduleEvent[] = useMemo(() => {
        return students.flatMap(student =>
            (student.enrollments || [])
                .filter(enrollment => currentUser?.role !== 'teacher' || enrollment.teacher === teacherToMatch)
                .flatMap(enrollment =>
                    (enrollment.schedule || []).map(slot => {
                        const normalizedPeriod = (slot.period || '').trim().toLowerCase();
                        const isAM = ['am', 'صباحاً', 'صباحا', 'ص'].includes(normalizedPeriod);
                        const sId = student.id || (student as any)._id;
                        return {
                            id: `${sId}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                            studentId: sId,
                            studentName: student.name,
                            studentGrade: student.grade,
                            teacherName: (enrollment.teacher || '').trim(),
                            subject: enrollment.subject,
                            curriculum: enrollment.curr,
                            day: (slot.day || '').trim(),
                            hour: String(slot.hour).trim(),
                            period: isAM ? 'am' : 'pm',
                            time: `${slot.hour}:00 ${isAM ? 'ص' : 'م'}`,
                            studentPoints: student.totalPoints || 0
                        };
                    })
                )
        );
    }, [students, currentUser, teacherToMatch]);

    const uniqueTeachers = useMemo(() => Array.from(new Set(allEvents.map(e => e.teacherName))), [allEvents]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesSearch =
                event.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDay = filterDay === 'all' || event.day === filterDay;
            return matchesSearch && matchesDay;
        });
    }, [allEvents, searchTerm, filterDay]);

    const getTeacherStyle = (teacherName: string) => {
        const index = uniqueTeachers.indexOf(teacherName);
        return ACCENT_COLORS[index % ACCENT_COLORS.length];
    };

    const getEventsForSlot = (day: string, hour: number, period: string) => {
        return filteredEvents.filter(e => e.day === day.trim() && Number(e.hour) === hour && e.period === period.toLowerCase());
    };

    // Mobile: only show time slots that have events for the active day
    const mobileEvents = useMemo(() =>
        filteredEvents.filter(e => e.day === mobileActiveDay)
    , [filteredEvents, mobileActiveDay]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="w-full max-w-full overflow-hidden" dir="rtl">
            <div className="space-y-4 pb-6 animate-in fade-in duration-500">

                {/* ── Gradient Header ── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-lg shadow-indigo-500/20 px-4 md:px-6 py-6 md:py-8 border-y md:border-none border-indigo-400/30">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
                    <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-white/80 shrink-0" />
                            <div>
                                <h1 className="text-base md:text-2xl font-black text-white tracking-tight leading-none">
                                    {isTeacher ? `جدول أ. ${currentUser?.name.split(' ')[0]}` : 'الجدول الأسبوعي'}
                                </h1>
                                <p className="text-[9px] md:text-[11px] font-bold text-white/60 mt-1">إدارة المواعيد والحصص</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="hidden md:flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all border border-white/20"
                        >
                            <Printer size={14} /> طباعة
                        </button>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 px-0 md:px-0">
                    {[
                        { label: 'إجمالي الحصص', val: allEvents.length, icon: LayoutGrid, color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'الطلاب', val: new Set(allEvents.map(e => e.studentName)).size, icon: User, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'المواد', val: new Set(allEvents.map(e => e.subject)).size, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
                        { label: 'اليوم النشط', val: mobileActiveDay, icon: Clock, color: 'text-amber-600 bg-amber-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border-y md:border border-slate-200 dark:border-slate-800 p-2.5 md:p-4 shadow-sm flex items-center gap-2 md:gap-3">
                            <div className={cn('w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0', stat.color)}>
                                <stat.icon size={14} className="md:hidden" />
                                <stat.icon size={18} className="hidden md:block" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                                <h3 className="text-sm md:text-xl font-black text-slate-900 dark:text-white truncate leading-tight">{stat.val}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 md:p-3 flex items-center gap-2 shadow-sm">
                    <div className="flex-1 relative">
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو المادة..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 pr-8 font-bold text-[10px] md:text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        />
                    </div>
                    <select
                        value={filterDay}
                        onChange={e => setFilterDay(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-2 font-black text-[10px] md:text-xs outline-none cursor-pointer text-slate-800 dark:text-white min-w-[90px]"
                    >
                        <option value="all">كل الأيام</option>
                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {currentUser?.role !== 'parent' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all shrink-0"
                        >
                            <Plus size={13} strokeWidth={2.5} />
                            <span className="hidden sm:inline">إضافة</span>
                        </button>
                    )}
                </div>

                {/* ── Desktop Table ── */}
                <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full border-collapse table-fixed min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-900 dark:bg-slate-950 text-white">
                                <th className="p-2.5 border-l border-slate-700 text-[9px] font-black uppercase tracking-widest w-16 text-center">الوقت</th>
                                {DAYS_OF_WEEK.map(day => {
                                    const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                                    return (
                                        <th key={day} className={cn(
                                            "p-2.5 border-l border-slate-700 text-[10px] font-black",
                                            isToday && "text-indigo-300"
                                        )}>
                                            {day}
                                            {isToday && <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1 animate-pulse" />}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map(slot => (
                                <tr key={`${slot.hour}-${slot.period}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="bg-slate-50 dark:bg-slate-800/30 border-b border-l border-slate-100 dark:border-slate-700/50 p-1.5 text-center">
                                        <span className="text-[9px] font-black text-slate-400 block">{slot.label}</span>
                                    </td>
                                    {DAYS_OF_WEEK.map(day => {
                                        const events = getEventsForSlot(day, slot.hour, slot.period);
                                        const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                                        return (
                                            <td
                                                key={day}
                                                className={cn(
                                                    "border-b border-l border-slate-100 dark:border-slate-700/50 p-1 h-16 relative cursor-pointer group/cell",
                                                    isToday && "bg-indigo-50/30 dark:bg-indigo-900/10",
                                                    events.length === 0 && "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                                )}
                                                onClick={() => {
                                                    if (events.length === 0) {
                                                        setEnrollData({ ...enrollData, day, hour: String(slot.hour), period: slot.period });
                                                        setShowAddModal(true);
                                                    }
                                                }}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    {events.length === 1 ? (
                                                        events.map(ev => {
                                                            const style = getTeacherStyle(ev.teacherName);
                                                            return (
                                                                <div
                                                                    key={ev.id}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowDetails(true); }}
                                                                    className={cn("p-1 relative overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-[1.02] transition-transform", style.bg)}
                                                                >
                                                                    <div className={cn("absolute right-0 top-0 bottom-0 w-1", style.bar)} />
                                                                    <h4 className="text-[8px] font-black leading-tight truncate pr-2">{ev.studentName}</h4>
                                                                    <div className="flex items-center justify-between mt-0.5 pr-2">
                                                                        <span className="text-[7px] font-bold opacity-60 truncate">{ev.subject}</span>
                                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                                            <Zap size={6} className="text-amber-500 fill-current" />
                                                                            <span className="text-[7px] font-black">{ev.studentPoints}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : events.length > 1 ? (
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); setSharedEvents(events); setShowSharedModal(true); }}
                                                            className="p-1.5 bg-indigo-600 text-white flex flex-col items-center justify-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm"
                                                        >
                                                            <Users size={14} strokeWidth={2.5} />
                                                            <span className="text-[9px] font-black text-center leading-tight">يوجد حصص مشتركة</span>
                                                            <span className="text-[7px] font-bold opacity-80">({events.length} حصص)</span>
                                                        </div>
                                                    ) : (
                                                        <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex justify-center py-2">
                                                            <Plus size={11} className="text-slate-300" />
                                                        </div>
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

                {/* ── Mobile View ── */}
                <div className="md:hidden space-y-3">
                    {/* Day Picker */}
                    <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
                        {DAYS_OF_WEEK.map(day => {
                            const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                            const dayEventCount = filteredEvents.filter(e => e.day === day).length;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setMobileActiveDay(day)}
                                    className={cn(
                                        "shrink-0 px-2.5 py-1.5 font-black text-[9px] uppercase transition-all relative",
                                        mobileActiveDay === day
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500"
                                    )}
                                >
                                    {day}
                                    {isToday && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                                    {dayEventCount > 0 && (
                                        <span className={cn(
                                            "absolute -bottom-0.5 right-1/2 translate-x-1/2 w-1 h-1 rounded-full",
                                            mobileActiveDay === day ? "bg-white" : "bg-indigo-400"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Events for selected day - Grouped by time */}
                    <div className="space-y-2">
                        {TIME_SLOTS.map(slot => {
                            const events = getEventsForSlot(mobileActiveDay, slot.hour, slot.period);
                            if (events.length === 0) return null;

                            return (
                                <div key={`${slot.hour}-${slot.period}`}>
                                    {events.length === 1 ? (
                                        events.map(ev => {
                                            const style = getTeacherStyle(ev.teacherName);
                                            return (
                                                <div
                                                    key={ev.id}
                                                    onClick={() => { setSelectedEvent(ev); setShowDetails(true); }}
                                                    className={cn(
                                                        "flex items-stretch overflow-hidden border-y border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                                        style.bg
                                                    )}
                                                >
                                                    <div className={cn("w-12 shrink-0 flex flex-col items-center justify-center py-3 text-white", style.bar)}>
                                                        <span className="text-[8px] font-black leading-none">{ev.time}</span>
                                                    </div>
                                                    <div className="flex-1 p-2.5 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <h3 className="text-[11px] font-black text-slate-900 dark:text-white truncate">{ev.studentName}</h3>
                                                                <p className="text-[8px] font-bold text-slate-500 truncate">{ev.subject} — {ev.teacherName}</p>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 shrink-0">
                                                                <Zap size={9} className="text-amber-500 fill-current" />
                                                                <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">{ev.studentPoints}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div
                                            onClick={() => { setSharedEvents(events); setShowSharedModal(true); }}
                                            className="flex items-stretch overflow-hidden border border-indigo-200 bg-indigo-50 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                                        >
                                            <div className="w-12 shrink-0 bg-indigo-600 flex flex-col items-center justify-center py-3 text-white">
                                                <span className="text-[8px] font-black leading-none">{events[0].time}</span>
                                            </div>
                                            <div className="flex-1 p-2.5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-indigo-600" />
                                                    <span className="text-[10px] font-black text-indigo-900">يوجد حصص مشتركة</span>
                                                </div>
                                                <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                                    {events.length}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {mobileEvents.length === 0 && (
                            <div className="py-12 flex flex-col items-center gap-2 text-center">
                                <Calendar size={28} className="text-slate-200" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">لا توجد حصص في {mobileActiveDay}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Details Modal ── */}
                {showDetails && selectedEvent && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full sm:max-w-sm shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 flex items-center justify-between">
                                <h3 className="text-sm font-black">تفاصيل الحصة</h3>
                                <button onClick={() => setShowDetails(false)} className="text-white/70 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Student */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedEvent.studentName}</h4>
                                        <p className="text-[10px] text-slate-400">{selectedEvent.studentGrade}</p>
                                    </div>
                                </div>
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3">
                                    {[
                                        { label: 'المادة', val: selectedEvent.subject },
                                        { label: 'المعلمة', val: selectedEvent.teacherName },
                                        { label: 'اليوم', val: selectedEvent.day },
                                        { label: 'الوقت', val: selectedEvent.time },
                                    ].map(({ label, val }) => (
                                        <div key={label}>
                                            <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">{label}</span>
                                            <p className="text-[11px] font-black text-slate-900 dark:text-white">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Actions */}
                                {currentUser?.role === 'teacher' && (
                                    <button
                                        onClick={() => {
                                            const socket = (window as any).socket;
                                            if (socket?.connected) {
                                                socket.emit('call_student', { studentId: String(selectedEvent.studentId), subject: selectedEvent.subject, type: 'video' });
                                                navigate(`/classroom/${selectedEvent.studentId}`);
                                            } else {
                                                alert('⚠️ نظام الاتصال غير متصل.');
                                            }
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-black text-xs flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Video size={15} /> بدء الحصة المباشرة
                                    </button>
                                )}
                                <button onClick={() => setShowDetails(false)} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 font-black text-[10px] hover:bg-slate-200 transition-colors">
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Add Modal ── */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full sm:max-w-sm shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 flex items-center justify-between">
                                <h3 className="text-sm font-black">حجز موعد جديد</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-white/70 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleQuickEnroll} className="p-5 space-y-3">
                                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 text-[10px] font-black text-slate-500">
                                    <div><span className="block mb-0.5 text-[8px] uppercase">اليوم</span><p className="text-slate-900 dark:text-white">{enrollData.day}</p></div>
                                    <div><span className="block mb-0.5 text-[8px] uppercase">الساعة</span><p className="text-slate-900 dark:text-white">{enrollData.hour}:00</p></div>
                                    <div><span className="block mb-0.5 text-[8px] uppercase">الفترة</span><p className="text-slate-900 dark:text-white">{enrollData.period === 'am' ? 'ص' : 'م'}</p></div>
                                </div>
                                <select
                                    required
                                    value={enrollData.studentId}
                                    onChange={e => setEnrollData({ ...enrollData, studentId: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                                >
                                    <option value="">-- اختر الطالب --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="اسم المادة..."
                                    value={enrollData.subject}
                                    onChange={e => setEnrollData({ ...enrollData, subject: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 py-2.5 px-3 font-bold text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none"
                                />
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-black text-xs transition-colors">
                                    تأكيد الحجز
                                </button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-slate-600 py-1">
                                    إلغاء
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Shared Sessions Modal ── */}
                {showSharedModal && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowSharedModal(false)}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full sm:max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={18} />
                                    <h3 className="text-sm font-black">الحصص المشتركة — {sharedEvents[0]?.time}</h3>
                                </div>
                                <button onClick={() => setShowSharedModal(false)} className="text-white/70 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                                {sharedEvents.map(ev => {
                                    const style = getTeacherStyle(ev.teacherName);
                                    return (
                                        <div
                                            key={ev.id}
                                            onClick={() => { setSelectedEvent(ev); setShowDetails(true); setShowSharedModal(false); }}
                                            className={cn(
                                                "flex items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-400 transition-all group",
                                            )}
                                        >
                                            <div className={cn("w-1.5 shrink-0", style.bar)} />
                                            <div className="flex-1 p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{ev.studentName}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500">{ev.subject} — {ev.teacherName}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1">
                                                        <Zap size={10} className="text-amber-500 fill-current" />
                                                        <span className="text-[10px] font-black">{ev.studentPoints}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setShowSharedModal(false)} className="w-full bg-slate-900 text-white py-2.5 font-black text-[10px] uppercase tracking-widest">
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
