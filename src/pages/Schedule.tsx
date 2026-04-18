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
    Video
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
    { hour: 8, period: 'am', label: '8:00 ص' },
    { hour: 9, period: 'am', label: '9:00 ص' },
    { hour: 10, period: 'am', label: '10:00 ص' },
    { hour: 11, period: 'am', label: '11:00 ص' },
    { hour: 12, period: 'pm', label: '12:00 م' },
    { hour: 1, period: 'pm', label: '1:00 م' },
    { hour: 2, period: 'pm', label: '2:00 م' },
    { hour: 3, period: 'pm', label: '3:00 م' },
    { hour: 4, period: 'pm', label: '4:00 م' },
    { hour: 5, period: 'pm', label: '5:00 م' },
    { hour: 6, period: 'pm', label: '6:00 م' },
    { hour: 7, period: 'pm', label: '7:00 م' },
    { hour: 8, period: 'pm', label: '8:00 م' },
    { hour: 9, period: 'pm', label: '9:00 م' },
    { hour: 10, period: 'pm', label: '10:00 م' },
];

const COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-950 dark:text-blue-200', border: 'border-blue-950', accent: 'bg-blue-600', shadow: 'shadow-[4px_4px_0px_0px_#1e3a8a]' },
    { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-950 dark:text-emerald-200', border: 'border-emerald-950', accent: 'bg-emerald-600', shadow: 'shadow-[4px_4px_0px_0px_#064e3b]' },
    { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-950 dark:text-amber-200', border: 'border-amber-950', accent: 'bg-amber-600', shadow: 'shadow-[4px_4px_0px_0px_#78350f]' },
    { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-950 dark:text-rose-200', border: 'border-rose-950', accent: 'bg-rose-600', shadow: 'shadow-[4px_4px_0px_0px_#881337]' },
    { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-950 dark:text-indigo-200', border: 'border-indigo-950', accent: 'bg-indigo-600', shadow: 'shadow-[4px_4px_0px_0px_#312e81]' },
    { bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-950 dark:text-teal-200', border: 'border-teal-950', accent: 'bg-teal-600', shadow: 'shadow-[4px_4px_0px_0px_#134e4a]' },
    { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-950 dark:text-purple-200', border: 'border-purple-950', accent: 'bg-purple-600', shadow: 'shadow-[4px_4px_0px_0px_#581c87]' },
];

export const Schedule = () => {
    const { currentUser } = useApp();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
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
            console.error("Error fetching data", error);
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
            console.error("Error enrolling", error);
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
            const matchesTeacher = filterTeacher === 'all' || event.teacherName === filterTeacher;
            return matchesSearch && matchesDay && matchesTeacher;
        });
    }, [allEvents, searchTerm, filterDay, filterTeacher]);

    const getTeacherStyle = (teacherName: string) => {
        const index = uniqueTeachers.indexOf(teacherName);
        return COLORS[index % COLORS.length];
    };

    const getEventsForSlot = (day: string, hour: number, period: string) => {
        const targetDay = day.trim();
        const targetPeriod = period.toLowerCase();
        return filteredEvents.filter(e => e.day === targetDay && Number(e.hour) === hour && e.period === targetPeriod);
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400">جاري تحميل الجدول...</div>;

    return (
        <div className="px-3 md:px-0 w-full max-w-full overflow-hidden block">
            <div className="space-y-5 pb-32 animate-in fade-in duration-500 overflow-x-hidden container mx-auto max-w-5xl" dir="rtl">
                {/* Master Header */}
                <div className="relative bg-white border-2 border-gray-950 p-2 md:p-6 shadow-[3px_3px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-full bg-primary-600/5 -skew-x-12 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3">
                        <div className="flex items-center gap-2 md:gap-3 text-right w-full">
                            <div className="w-8 h-8 md:w-16 md:h-16 bg-gray-950 text-white border-2 border-primary-500 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] md:shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center shrink-0">
                                <Calendar size={16} className="md:size-[28px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="bg-primary-600 text-white text-[6px] md:text-[7px] font-black px-1 md:px-1.5 py-0.5 border border-gray-950 uppercase italic shrink-0">LIVE</span>
                                    <h1 className="text-xs md:text-3xl font-black text-gray-950 tracking-tighter italic leading-none truncate">الجدول الأسبوعي</h1>
                                </div>
                                <p className="text-gray-500 font-black text-[7px] md:text-xs truncate">إدارة المواعيد بذكاء وتصميم عصري</p>
                            </div>
                        </div>
                    <button onClick={() => window.print()} className="hidden md:flex bg-gray-950 text-white px-5 py-2.5 border-2 border-gray-950 shadow-[4px_4px_0px_0px_#444] hover:shadow-none transition-all items-center gap-2 font-black text-[10px] uppercase">
                        <Printer size={16} /> طباعة
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 font-black">
                {[
                    { label: 'الحصص', val: allEvents.length, icon: LayoutGrid, color: 'bg-blue-400' },
                    { label: 'الطلاب', val: new Set(allEvents.map(e => e.studentName)).size, icon: User, color: 'bg-emerald-400' },
                    { label: 'المواد', val: new Set(allEvents.map(e => e.subject)).size, icon: BookOpen, color: 'bg-purple-400' },
                    { label: 'اليوم', val: mobileActiveDay, icon: Clock, color: 'bg-amber-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-gray-950 p-1 md:p-2 shadow-[2px_2px_0px_0px_black] flex items-center justify-between gap-1 overflow-hidden relative">
                        <div className="flex flex-col min-w-0 z-10 overflow-hidden px-1">
                            <p className="text-[7px] md:text-[9px] font-black text-gray-500 uppercase leading-none mb-0.5 truncate">{stat.label}</p>
                            <h3 className="text-[11px] md:text-lg font-black text-gray-950 truncate leading-none">{stat.val}</h3>
                        </div>
                        <div className={cn("shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-950 shadow-[1px_1px_0px_0px_black] z-10", stat.color)}>
                            <stat.icon size={8} strokeWidth={3} className="text-gray-950" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50 border-2 border-gray-950 p-1.5 md:p-3 flex items-end gap-1.5 md:gap-3 no-print shadow-[2px_2px_0px_0px_black]">
                <div className="flex-1 min-w-0">
                    <div className="relative">
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-950" size={12} />
                        <input 
                            type="text" 
                            placeholder="ابحث..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-2 border-gray-950 py-1.5 px-2 pr-7 font-black text-[9px] md:text-xs text-gray-950 focus:bg-yellow-50 outline-none"
                        />
                    </div>
                </div>
                <div className="w-[100px] shrink-0">
                    <select 
                        value={filterDay} 
                        onChange={e => setFilterDay(e.target.value)}
                        className="w-full bg-white border-2 border-gray-950 py-1.5 px-1 font-black text-[9px] md:text-xs outline-none appearance-none cursor-pointer h-[26px]"
                    >
                        <option value="all">كل الأيام</option>
                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block mx-4 overflow-x-auto custom-scrollbar border-2 border-gray-950 bg-white shadow-lg">
                <table className="w-full border-collapse table-fixed min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-950 text-white">
                            <th className="p-3 border-l border-gray-800 text-[10px] font-black uppercase tracking-widest w-20">الوقت</th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className="p-3 border-l border-gray-800 text-xs font-black uppercase">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(slot => (
                            <tr key={`${slot.hour}-${slot.period}`}>
                                <td className="bg-gray-50 border-b border-l border-gray-950 p-2 text-center">
                                    <span className="text-[10px] font-black text-gray-400 block">{slot.label}</span>
                                </td>
                                {DAYS_OF_WEEK.map(day => {
                                    const events = getEventsForSlot(day, slot.hour, slot.period);
                                    const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                                    
                                    return (
                                        <td key={day} 
                                            className={cn(
                                                "border-b border-l border-gray-100 dark:border-gray-800 p-1.5 h-20 relative transition-colors cursor-pointer group/cell",
                                                isToday && "bg-primary-50/10",
                                                events.length === 0 && "hover:bg-gray-50"
                                            )}
                                            onClick={() => {
                                                if(events.length === 0) {
                                                    setEnrollData({...enrollData, day, hour: String(slot.hour), period: slot.period});
                                                    setShowAddModal(true);
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col gap-1.5">
                                                {events.length > 0 ? (
                                                    events.map(ev => {
                                                        const style = getTeacherStyle(ev.teacherName);
                                                        return (
                                                            <div 
                                                                key={ev.id} 
                                                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowDetails(true); }}
                                                                className={cn("p-1.5 border border-gray-950 transition-all hover:scale-[1.02]", style.bg, style.shadow.replace('4px', '2px'))}
                                                            >
                                                                <h4 className="text-[9px] font-black leading-tight truncate">{ev.studentName}</h4>
                                                                <div className="flex items-center justify-between mt-0.5">
                                                                    <span className="text-[8px] font-bold opacity-60 truncate max-w-[50px]">{ev.subject}</span>
                                                                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                                                        <Zap size={6} className="text-yellow-500 fill-current" />
                                                                        <span className="text-[7px] font-black">{ev.studentPoints}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex justify-center py-2">
                                                        <Plus size={12} className="text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 font-black">
                {/* Day Picker */}
                <div className="flex overflow-x-auto gap-2 pb-2 sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md pt-2 px-1">
                    {DAYS_OF_WEEK.map(day => {
                        const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                        return (
                            <button 
                                key={day}
                                onClick={() => setMobileActiveDay(day)}
                                className={cn(
                                    "shrink-0 px-2 py-1.5 border-2 font-black text-[8px] uppercase transition-all relative",
                                    mobileActiveDay === day 
                                        ? "bg-gray-950 text-white border-gray-950 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]" 
                                        : "bg-white text-gray-400 border-gray-200"
                                )}
                            >
                                {day}
                                {isToday && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
                
                {/* Timeline */}
                <div className="space-y-3 pb-20">
                    {TIME_SLOTS.map(slot => {
                        const events = getEventsForSlot(mobileActiveDay, slot.hour, slot.period);
                        return (
                            <div key={`${slot.hour}-${slot.period}`} className="grid grid-cols-[40px_1fr] gap-2 items-start">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="bg-white border border-gray-950 px-1 py-0.5 shadow-[1px_1px_0px_0px_black] text-[7px] font-black whitespace-nowrap mb-1">
                                        {slot.label}
                                    </div>
                                    <div className="w-[1px] h-10 bg-gray-200 relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                                    </div>
                                </div>

                                <div className="space-y-2 pb-1 min-w-0">
                                    {events.length > 0 ? (
                                        events.map(ev => {
                                            const style = getTeacherStyle(ev.teacherName);
                                            return (
                                                <div 
                                                    key={ev.id} 
                                                    onClick={() => { setSelectedEvent(ev); setShowDetails(true); }}
                                                    className={cn(
                                                        "p-2 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] relative transition-all min-w-0 overflow-hidden",
                                                        style.bg
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <div className="w-5 h-5 bg-gray-950 flex items-center justify-center text-white shrink-0">
                                                                <User size={10} />
                                                            </div>
                                                            <h3 className="text-[10px] font-black text-gray-950 truncate leading-none">{ev.studentName}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 bg-white/40 px-1 py-0.5 shrink-0">
                                                            <Zap size={8} className="text-yellow-600 fill-yellow-500" />
                                                            <span className="text-[7px] font-black">{ev.studentPoints}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-1 pt-1 border-t border-gray-950/5">
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <BookOpen size={8} className="text-primary-600 shrink-0" />
                                                            <span className="text-[7px] font-bold truncate italic">{ev.subject}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <Users size={8} className="text-primary-600 shrink-0" />
                                                            <span className="text-[7px] font-black truncate">{ev.teacherName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div 
                                            onClick={() => { 
                                                setEnrollData({...enrollData, day: mobileActiveDay, hour: String(slot.hour), period: slot.period}); 
                                                setShowAddModal(true); 
                                            }}
                                            className="h-10 border border-dashed border-gray-200 flex items-center justify-center gap-1.5 text-gray-300"
                                        >
                                            <Plus size={10} />
                                            <span className="text-[8px] font-black uppercase italic">متاح</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
                    <div className="bg-white border-4 border-gray-950 w-full max-w-sm shadow-[10px_10px_0px_0px_black] overflow-hidden">
                        <div className="p-4 bg-primary-600 text-white flex justify-between items-center border-b-2 border-gray-950">
                            <h3 className="text-base font-black italic">تفاصيل الحصة</h3>
                            <button onClick={() => setShowDetails(false)} className="text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-5 space-y-4 font-black">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-900 border border-gray-950"><User size={20} /></div>
                                <div>
                                    <h4 className="text-base font-black">{selectedEvent.studentName}</h4>
                                    <p className="text-[10px] text-gray-400">{selectedEvent.studentGrade}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-950 p-3 text-[10px]">
                                <div><span className="text-gray-400 block mb-0.5">المادة</span><p>{selectedEvent.subject}</p></div>
                                <div><span className="text-gray-400 block mb-0.5">المعلمة</span><p>{selectedEvent.teacherName}</p></div>
                                <div><span className="text-gray-400 block mb-0.5">اليوم</span><p>{selectedEvent.day}</p></div>
                                <div><span className="text-gray-400 block mb-0.5">الوقت</span><p>{selectedEvent.time}</p></div>
                            </div>
                            {currentUser?.role === 'teacher' && (
                                <button 
                                    onClick={() => {
                                        const socket = (window as any).socket;
                                        if (socket?.connected) {
                                            socket.emit('call_student', { studentId: String(selectedEvent.studentId), subject: selectedEvent.subject, type: 'video' });
                                            navigate(`/classroom/${selectedEvent.studentId}`);
                                        } else {
                                            alert("⚠️ نظام الاتصال غير متصل.");
                                        }
                                    }}
                                    className="w-full bg-primary-600 text-white py-3 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] font-black text-xs flex items-center justify-center gap-2"
                                >
                                    <Video size={16} /> بدء الحصة المباشرة
                                </button>
                            )}
                            <button onClick={() => setShowDetails(false)} className="w-full bg-gray-950 text-white py-2.5 font-black text-[10px]">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
                    <div className="bg-white border-4 border-gray-950 w-full max-w-sm shadow-[10px_10px_0px_0px_black]">
                        <form onSubmit={handleQuickEnroll} className="p-5 space-y-4">
                            <h3 className="text-base font-black border-b-2 border-gray-950 pb-2">حجز موعد</h3>
                            <div className="space-y-3">
                                <select required value={enrollData.studentId} onChange={e => setEnrollData({...enrollData, studentId: e.target.value})} className="w-full border-2 border-gray-950 p-2 font-bold text-xs bg-white outline-none">
                                    <option value="">-- اختر الطالب --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <input type="text" placeholder="المادة..." value={enrollData.subject} onChange={e => setEnrollData({...enrollData, subject: e.target.value})} className="w-full border-2 border-gray-950 p-2 font-bold text-xs outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white py-3 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] font-black text-xs">تأكيد الحجز</button>
                            <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-center text-[10px] font-black">إلغاء</button>
                        </form>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};
