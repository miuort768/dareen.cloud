import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Search,
    Video,
    X,
    CalendarDays,
    Share2,
    Loader2
} from 'lucide-react';
import { useCurrentUser } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { LiveClasses } from '../../../components/dashboard/LiveClasses';

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
    const currentUser = useCurrentUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [sharedLink] = useState(() => window.location.href);
    const [showSharedModal, setShowSharedModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const isToday = (day: string) => new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;

    const getDayEvents = (events: ScheduleEvent[], day: string) => events.filter(e => e.day === day);

    const getColorIndex = (event: ScheduleEvent) => Math.max(0, uniqueTeachers.indexOf(event.teacherName));

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await api.get<Record<string, unknown>[]>('/students');
            setStudents(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
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
                        const sId = student.id || (student as Record<string, unknown>)._id as string;
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-full gap-3 md:animate-in md:fade-in">
            <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-teal-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 rounded-none shadow-sm shadow-teal-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none overflow-hidden border-2 border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 bg-white/10  flex items-center justify-center">
                            <CalendarDays size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-medium text-white leading-tight tracking-tighter">الجداول الدراسية</h1>
                            <p className="text-xs md:text-sm text-slate-300/80 mt-0.5">جدول الحصص الأسبوعي</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 no-print">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-40 h-9 bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-[10px] font-normal rounded-none px-8 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Day Filter */}
                        <select
                            value={filterDay}
                            onChange={e => setFilterDay(e.target.value)}
                            className="h-9 px-3 bg-white/10 border border-white/10 text-white text-[10px] font-medium rounded-none focus:outline-none focus:border-indigo-500 transition-all uppercase tracking-widest"
                        >
                            <option value="all" className="text-slate-900">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day} value={day} className="text-slate-900">{day}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowSharedModal(true)}
                            className="h-9 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-medium rounded-none hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm shadow-amber-500/20 border border-amber-400/30 flex items-center gap-2 uppercase tracking-widest"
                        >
                            <Share2 size={13} />
                            مشاركة
                        </button>
                    </div>
                </div>

                {/* Live Classes */}
                <LiveClasses />

                {/* Schedule Grid */}
                <div className="bg-white/80 dark:bg-slate-900/80  border border-slate-200/50 dark:border-slate-800/50 rounded-none shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden mt-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[900px]">
                            {/* Grid Header: Days */}
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800">
                                <div className="p-3 text-[9px] font-medium text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    الوقت
                                </div>
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day} className={cn(
                                        "p-3 text-[10px] font-medium text-center border-l border-slate-100 dark:border-slate-800 last:border-l-0 bg-slate-50/50 dark:bg-slate-900/50 uppercase tracking-tight",
                                        isToday(day) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        <span>{day}</span>
                                        {isToday(day) && (
                                            <span className="mr-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body: Time Slots */}
                            {TIME_SLOTS.map((slot, slotIdx) => {
                                const currentTimeSlots = filteredEvents.filter(e => e.hour === slot.hour && e.period === slot.period);
                                const isEmpty = currentTimeSlots.length === 0;

                                return (
                                    <div key={`${slot.hour}-${slot.period}`} className={cn(
                                        "grid grid-cols-[80px_repeat(7,1fr)]",
                                        slotIdx % 2 === 0 ? "bg-white dark:bg-slate-900/40" : "bg-slate-50/50 dark:bg-slate-950/30"
                                    )}>
                                        <div className="p-2 text-[9px] font-medium text-slate-400 border-l border-b border-slate-100 dark:border-slate-800 flex items-center justify-center h-full">
                                            <Clock size={10} className="ml-1 inline" />
                                            {slot.label}
                                        </div>

                                        {DAYS_OF_WEEK.map((day) => {
                                            const dayEvents = getDayEvents(currentTimeSlots, day);
                                            const event = dayEvents[0];

                                            if (event) {
                                                const colorIdx = getColorIndex(event);
                                                const { bg, text, bar } = ACCENT_COLORS[colorIdx % ACCENT_COLORS.length];

                                                return (
                                                    <div
                                                        key={`${day}-${slot.hour}`}
                                                        onClick={() => { setSelectedEvent(event); setShowDetails(true); }}
                                                        className={cn(
                                                            "p-1.5 border-l last:border-l-0 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:z-10 hover:shadow-sm hover:-translate-y-0.5 relative group min-h-[65px]",
                                                            bg
                                                        )}
                                                    >
                                                        {/* Color bar */}
                                                        <div className={cn("absolute top-0 right-0 w-full h-0.5 rounded-full", bar)} />

                                                        <div className="flex items-start gap-1.5 h-full">
                                                            <div className={cn("w-1 h-full rounded-full shrink-0 mt-0.5", bar)} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className={cn("text-[9px] font-medium leading-tight mb-0.5 truncate", text)}>
                                                                    {event.studentName}
                                                                </p>
                                                                <p className="text-[7px] font-normal text-slate-400 truncate">{event.subject}</p>
                                                                <p className="text-[7px] font-normal text-slate-400 truncate">{event.teacherName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={`${day}-${slot.hour}`}
                                                    className={cn(
                                                        "p-2 border-l last:border-l-0 border-b border-slate-100 dark:border-slate-800 min-h-[65px]",
                                                        isEmpty && "bg-transparent"
                                                    )}
                                                >
                                                    {!isEmpty && (
                                                        <div className="text-[7px] font-normal text-slate-300 text-center">
                                                            —
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-4">
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">دليل الألوان:</span>
                        {ACCENT_COLORS.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full", color.bar)} />
                                <span className="text-[8px] font-medium text-slate-400 uppercase">مادة {idx + 1}</span>
                            </div>
                        ))}
                        <span className="text-[9px] font-medium text-slate-400 uppercase mr-auto">
                            {filteredEvents.length} حصة
                        </span>
                    </div>
                </div>

                {/* Loading or Empty State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                    </div>
                )}
            </div>

            {/* Event Details Modal */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4  bg-slate-950/40" onClick={() => setShowDetails(false)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-6 max-w-sm w-full shadow-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm uppercase tracking-tight">تفاصيل الحصة</h3>
                            <button onClick={() => setShowDetails(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-none hover:bg-slate-200 transition-all">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[9px] font-medium text-slate-400 uppercase block mb-1">الطالب</span>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.studentName}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-medium text-slate-400 uppercase block mb-1">المعلمة</span>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.teacherName}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-medium text-slate-400 uppercase block mb-1">المادة</span>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.subject}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-medium text-slate-400 uppercase block mb-1">الموعد</span>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedEvent.day} - {selectedEvent.time}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await startLiveSession({
                                            title: `حصة مباشرة: ${selectedEvent.studentName}`,
                                            subject: selectedEvent.subject,
                                            targetStudentId: selectedEvent.studentId,
                                        });
                                        if (res?.id) navigate(`/classroom/${res.id}`);
                                    } catch { setShowDetails(false); }
                                }}
                                className="flex-1 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[10px] font-medium rounded-none hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Video size={14} />
                                بدء بث مباشر
                            </button>
                            <button
                                onClick={() => navigate(`/students`)}
                                className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-[10px] font-medium rounded-none hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                عرض الطالب
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Link Modal */}
            {showSharedModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4  bg-slate-950/40" onClick={() => setShowSharedModal(false)}>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-6 max-w-md w-full shadow-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm uppercase tracking-tight">مشاركة الجدول</h3>
                            <button onClick={() => setShowSharedModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-none hover:bg-slate-200 transition-all">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-xs font-normal text-slate-500 mb-4">يمكنك نسخ الرابط ومشاركته مع أولياء الأمور</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={sharedLink}
                                className="flex-1 h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-normal text-slate-900 dark:text-white"
                            />
                            <button
                                onClick={() => { navigator.clipboard.writeText(sharedLink); setShowSharedModal(false); }}
                                className="h-10 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[10px] font-medium rounded-none hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm"
                            >
                                نسخ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Schedule;
