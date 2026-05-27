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
    { color: '#2563EB', label: 'أزرق' },
    { color: '#10B981', label: 'أخضر' },
    { color: '#F59E0B', label: 'عنبر' },
    { color: '#F43F5E', label: 'وردي' },
    { color: '#2563EB', label: 'أزرق' },
    { color: '#14B8A6', label: 'زيتي' },
    { color: '#8B5CF6', label: 'بنفسجي' },
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
                .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch)
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
                            hour: String(parseInt(String(slot.hour).trim(), 10) || ''),
                            period: isAM ? 'am' : 'pm',
                            time: `${String(parseInt(String(slot.hour).trim(), 10) || '')}:00 ${isAM ? 'ص' : 'م'}`,
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
        <div className="flex flex-col items-center justify-center min-h-full gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#2563EB] rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-slate-400">جاري تحميل الجدول...</p>
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-2">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2563EB12' }}>
                            <CalendarDays size={22} style={{ color: '#2563EB' }} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">الجداول الدراسية</h1>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">جدول الحصص الأسبوعي</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-36 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-[10px] font-bold rounded-xl px-8 outline-none focus:border-[#2563EB] transition-all"
                            />
                        </div>

                        {/* Day Filter */}
                        <select
                            value={filterDay}
                            onChange={e => setFilterDay(e.target.value)}
                            className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-bold rounded-xl outline-none focus:border-[#2563EB] transition-all"
                        >
                            <option value="all">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowSharedModal(true)}
                            className="h-9 px-4 bg-[#F59E0B] text-white text-[10px] font-bold rounded-xl shadow-sm hover:bg-amber-600 transition-all active:scale-95 flex items-center gap-2 border-0"
                        >
                            <Share2 size={13} />
                            مشاركة
                        </button>
                    </div>
                </div>

                {/* Live Classes */}
                <LiveClasses />

                {/* Schedule Grid */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden mt-4">
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[900px]">
                            {/* Grid Header: Days */}
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100/50 dark:border-slate-800/50">
                                <div className="p-3 text-[9px] font-bold text-slate-400 border-l border-slate-100/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                                    الوقت
                                </div>
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day} className={cn(
                                        "p-3 text-[10px] font-bold text-center border-l border-slate-100/50 dark:border-slate-800/50 last:border-l-0 bg-slate-50/50 dark:bg-slate-900/50",
                                        isToday(day) ? "text-[#2563EB]" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        <span>{day}</span>
                                        {isToday(day) && (
                                            <span className="mr-1.5 w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: '#2563EB' }} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body: Time Slots */}
                            {TIME_SLOTS.map((slot, slotIdx) => {
                                const currentTimeSlots = filteredEvents.filter(e => e.hour === String(slot.hour) && e.period === slot.period);
                                const isEmpty = currentTimeSlots.length === 0;

                                return (
                                    <div key={`${slot.hour}-${slot.period}`} className={cn(
                                        "grid grid-cols-[80px_repeat(7,1fr)]",
                                        slotIdx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-950/20"
                                    )}>
                                        <div className="p-2 text-[9px] font-bold text-slate-400 border-l border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-center h-full">
                                            <Clock size={10} className="ml-1 inline" />
                                            {slot.label}
                                        </div>

                                        {DAYS_OF_WEEK.map((day) => {
                                            const dayEvents = getDayEvents(currentTimeSlots, day);
                                            const event = dayEvents[0];

                                            if (event) {
                                                const colorIdx = getColorIndex(event);
                                                const accent = ACCENT_COLORS[colorIdx % ACCENT_COLORS.length];
                                                const { color } = accent;

                                                return (
                                                    <div
                                                        key={`${day}-${slot.hour}`}
                                                        onClick={() => { setSelectedEvent(event); setShowDetails(true); }}
                                                        className="p-1.5 border-l last:border-l-0 border-b border-slate-100/50 dark:border-slate-800/50 cursor-pointer transition-all hover:z-10 hover:shadow-sm hover:-translate-y-0.5 relative group min-h-[65px]"
                                                        style={{ backgroundColor: `${color}08` }}
                                                    >
                                                        <div className="absolute top-0 right-0 w-full h-0.5" style={{ backgroundColor: color, borderRadius: '0 0 999px 999px' }} />

                                                        <div className="flex items-start gap-1.5 h-full">
                                                            <div className="w-1 h-full rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[9px] font-bold leading-tight mb-0.5 truncate" style={{ color }}>
                                                                    {event.studentName}
                                                                </p>
                                                                <p className="text-[7px] font-bold text-slate-400 truncate">{event.subject}</p>
                                                                <p className="text-[7px] font-bold text-slate-400 truncate">{event.teacherName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={`${day}-${slot.hour}`}
                                                    className="p-2 border-l last:border-l-0 border-b border-slate-100/50 dark:border-slate-800/50 min-h-[65px]"
                                                >
                                                    {!isEmpty && (
                                                        <div className="text-[7px] font-bold text-slate-300 text-center">—</div>
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
                    <div className="border-t border-slate-100/50 dark:border-slate-800/50 p-4 flex flex-wrap items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-400">دليل الألوان:</span>
                        {uniqueTeachers.map((teacher, idx) => {
                            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                            return (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent.color }} />
                                    <span className="text-[8px] font-bold text-slate-400">{teacher}</span>
                                </div>
                            );
                        })}
                        <span className="text-[9px] font-bold text-slate-400 mr-auto">
                            {filteredEvents.length} حصة
                        </span>
                    </div>
                </div>

                {/* Loading or Empty State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                )}
            </div>

            {/* Event Details Modal */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 bg-[#172554] text-white flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <CalendarDays size={16} />
                                تفاصيل الحصة
                            </h3>
                            <button onClick={() => setShowDetails(false)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-xl">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block mb-1">الطالب</span>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedEvent.studentName}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block mb-1">المعلمة</span>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedEvent.teacherName}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block mb-1">المادة</span>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedEvent.subject}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 block mb-1">الموعد</span>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedEvent.day} - {selectedEvent.time}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 p-5 pt-0">
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
                                className="flex-1 h-10 bg-[#2563EB] text-white text-[10px] font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Video size={14} />
                                بدء بث مباشر
                            </button>
                            <button
                                onClick={() => navigate(`/students`)}
                                className="flex-1 h-10 bg-white dark:bg-slate-900 text-slate-700 dark:text-white text-[10px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                            >
                                عرض الطالب
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Link Modal */}
            {showSharedModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSharedModal(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 bg-[#172554] text-white flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Share2 size={16} />
                                مشاركة الجدول
                            </h3>
                            <button onClick={() => setShowSharedModal(false)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-xl">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5">
                            <p className="text-xs font-bold text-slate-500 mb-4">يمكنك نسخ الرابط ومشاركته مع أولياء الأمور</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={sharedLink}
                                    className="flex-1 h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(sharedLink); setShowSharedModal(false); }}
                                    className="h-10 px-4 bg-[#2563EB] text-white text-[10px] font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    نسخ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Schedule;
