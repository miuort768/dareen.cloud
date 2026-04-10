import { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, 
    Clock, 
    X, 
    User, 
    Users, 
    Download, 
    GraduationCap, 
    BookOpen, 
    Search,
    Zap,
    LayoutGrid,
    CheckCircle2,
    Plus,
    Printer,
    Sparkles
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
        teacherName: currentUser?.teacherName || currentUser?.name || '',
        subject: ''
    });
    const [mobileActiveDay, setMobileActiveDay] = useState<string>('');
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400">جاري تحميل الجدول الإبداعي...</div>;

    return (
        <div className="space-y-10 pb-32 animate-in fade-in duration-700" dir="rtl">
            {/* Master Header - Ultra Brutalist */}
            <div className="relative bg-white border-8 border-gray-950 p-10 shadow-[20px_20px_0px_0px_#2563eb] overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-full bg-primary-600/5 -skew-x-12 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8 text-right">
                        <div className="w-24 h-24 bg-gray-950 text-white border-4 border-primary-500 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center transform hover:rotate-6 transition-transform group">
                            <Calendar size={48} className="group-hover:scale-110 transition-all" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest border-2 border-gray-950">LIVE SCHEDULE</span>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase italic">الجدول الأسبوعي</h1>
                            </div>
                            <p className="text-gray-500 font-black text-sm md:text-base flex items-center gap-3">
                                <Sparkles size={18} className="text-yellow-500 fill-yellow-500" />
                                إدارة المواعيد بذكاء وتصميم يفوق الخيال
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 no-print">
                        <button onClick={() => window.print()} className="bg-gray-950 text-white px-8 py-4 border-4 border-gray-950 shadow-[6px_6px_0px_0px_#444] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 font-black text-sm uppercase">
                            <Printer size={20} />
                            طباعة الجدول
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats - Grid of Brutalist Boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {[
                    { label: 'إجمالي الحصص', val: allEvents.length, icon: LayoutGrid, color: 'bg-blue-400' },
                    { label: 'طلاب مفعّلون', val: new Set(allEvents.map(e => e.studentName)).size, icon: User, color: 'bg-emerald-400' },
                    { label: 'مواد دراسية', val: new Set(allEvents.map(e => e.subject)).size, icon: BookOpen, color: 'bg-purple-400' },
                    { label: 'يوم العمل', val: mobileActiveDay, icon: Clock, color: 'bg-amber-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border-4 border-gray-950 p-6 shadow-[8px_8px_0px_0px_black] hover:rotate-1 transition-transform">
                        <div className={cn("w-12 h-12 border-2 border-gray-950 flex items-center justify-center text-gray-950 mb-4 shadow-[4px_4px_0px_0px_black]", stat.color)}>
                            <stat.icon size={24} strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-950">{stat.val}</h3>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="mx-4 bg-gray-50 border-4 border-gray-950 p-8 flex flex-wrap items-end gap-8 no-print shadow-[10px_10px_0px_0px_black]">
                <div className="flex-1 min-w-[300px]">
                    <label className="text-xs font-black text-gray-950 uppercase mb-3 block">البحث الذكي</label>
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-950" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن طالب، معلمة، أو مادة..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-4 border-gray-950 p-4 pr-12 font-black text-gray-950 focus:bg-yellow-50 outline-none transition-colors"
                        />
                    </div>
                </div>
                <div className="w-56">
                    <label className="text-xs font-black text-gray-950 uppercase mb-3 block">تصفية اليوم</label>
                    <select 
                        value={filterDay} 
                        onChange={e => setFilterDay(e.target.value)}
                        className="w-full bg-white border-4 border-gray-950 p-4 font-black outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">كل الأيام</option>
                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Timetable - Desktop */}
            <div className="hidden md:block mx-4 overflow-x-auto custom-scrollbar shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)] border-4 border-gray-950 bg-white">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-950 text-white">
                            <th className="p-6 border-l-4 border-gray-800 text-xs font-black uppercase tracking-widest w-24">الوقت</th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className="p-6 border-l-4 border-gray-800 text-sm font-black uppercase tracking-[0.2em]">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(slot => (
                            <tr key={`${slot.hour}-${slot.period}`} className="group/row">
                                <td className="bg-gray-50 border-b-4 border-l-4 border-gray-950 p-4 text-center">
                                    <span className="text-[11px] font-black text-gray-600 block">{slot.label}</span>
                                </td>
                                {DAYS_OF_WEEK.map(day => {
                                    const events = getEventsForSlot(day, slot.hour, slot.period);
                                    const isToday = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }) === day;
                                    
                                    return (
                                        <td key={day} 
                                            className={cn(
                                                "border-b-4 border-l-4 border-gray-100 dark:border-gray-800 p-2 h-32 min-w-[160px] relative transition-colors cursor-pointer group/cell",
                                                isToday && "bg-primary-50/20 border-l-primary-500",
                                                events.length === 0 && "hover:bg-gray-50"
                                            )}
                                            onClick={() => {
                                                if(events.length === 0) {
                                                    setEnrollData({...enrollData, day, hour: String(slot.hour), period: slot.period});
                                                    setShowAddModal(true);
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col gap-2 h-full">
                                                {events.length > 0 ? (
                                                    events.map(ev => {
                                                        const style = getTeacherStyle(ev.teacherName);
                                                        return (
                                                            <div 
                                                                key={ev.id} 
                                                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setShowDetails(true); }}
                                                                className={cn("p-3 border-2 border-gray-950 relative overflow-hidden transition-all hover:-rotate-1 hover:scale-[1.03] group/item", style.bg, style.shadow)}
                                                            >
                                                                <div className={cn("absolute right-0 top-0 w-1 h-full", style.accent)}></div>
                                                                <h4 className="text-[11px] font-black leading-tight mb-1 truncate">{ev.studentName}</h4>
                                                                <div className="flex items-center justify-between mt-auto">
                                                                    <span className="text-[9px] font-bold opacity-70">{ev.subject}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Zap size={8} className="text-yellow-500 fill-current" />
                                                                        <span className="text-[8px] font-black">{ev.studentPoints}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="mt-auto opacity-0 group-hover/cell:opacity-100 transition-opacity flex justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center">
                                                            <Plus size={16} />
                                                        </div>
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

            {/* Mobile View - Interactive Timeline */}
            <div className="md:hidden space-y-6 px-4">
                <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
                    {DAYS_OF_WEEK.map(day => (
                        <button 
                            key={day}
                            onClick={() => setMobileActiveDay(day)}
                            className={cn(
                                "shrink-0 px-6 py-3 border-4 font-black text-xs uppercase transition-all shadow-[4px_4px_0px_0px_black]",
                                mobileActiveDay === day 
                                    ? "bg-primary-600 text-white border-gray-950 translate-x-1 translate-y-1 shadow-none" 
                                    : "bg-white text-gray-400 border-gray-950"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>
                
                <div className="space-y-6 relative before:absolute before:right-6 before:top-0 before:bottom-0 before:w-1 before:bg-gray-200">
                    {TIME_SLOTS.map(slot => {
                        const events = getEventsForSlot(mobileActiveDay, slot.hour, slot.period);
                        return (
                            <div key={`${slot.hour}-${slot.period}`} className="flex gap-6 pr-2 relative">
                                <div className="absolute right-4 w-5 h-5 bg-gray-950 border-4 border-white shrink-0 z-10 translate-x-[2px]"></div>
                                <div className="w-16 pt-0.5">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{slot.label}</span>
                                </div>
                                <div className="flex-1 space-y-3 pb-8">
                                    {events.length > 0 ? (
                                        events.map(ev => {
                                            const style = getTeacherStyle(ev.teacherName);
                                            return (
                                                <div 
                                                    key={ev.id} 
                                                    onClick={() => { setSelectedEvent(ev); setShowDetails(true); }}
                                                    className={cn("p-5 border-4 border-gray-950 shadow-[6px_6px_0px_0px_black] relative overflow-hidden", style.bg)}
                                                >
                                                    <div className={cn("absolute right-0 top-0 w-2 h-full", style.accent)}></div>
                                                    <h3 className="text-base font-black text-gray-950 mb-1">{ev.studentName}</h3>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs font-bold text-gray-500">{ev.subject}</span>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-gray-950 text-[10px] font-black">
                                                            <User size={12} />
                                                            {ev.teacherName}
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
                                            className="p-4 border-4 border-dashed border-gray-300 text-center hover:bg-gray-50 transition-all cursor-pointer group"
                                        >
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-primary-600 transition-colors">متاح للحجز</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border-8 border-gray-950 w-full max-w-lg shadow-[20px_20px_0px_0px_black] overflow-hidden transform animate-in zoom-in-95">
                        <div className="p-8 border-b-8 border-gray-950 bg-primary-600 text-white flex justify-between items-center">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">تفاصيل الحصة</h3>
                            <button onClick={() => setShowDetails(false)} className="bg-white text-gray-950 w-12 h-12 flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:bg-gray-100 transition-colors font-black text-2xl">
                                &times;
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 bg-gray-50 border-4 border-gray-950 flex items-center justify-center text-gray-900 shadow-[6px_6px_0px_0px_black]">
                                    <User size={48} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-gray-950 mb-1">{selectedEvent.studentName}</h4>
                                    <p className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">{selectedEvent.studentGrade}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 bg-gray-50 border-4 border-gray-950 p-6 shadow-inner">
                                {[
                                    { label: 'المادة', val: selectedEvent.subject, icon: BookOpen },
                                    { label: 'المعلمة', val: selectedEvent.teacherName, icon: Users },
                                    { label: 'اليوم', val: selectedEvent.day, icon: Calendar },
                                    { label: 'الوقت', val: selectedEvent.time, icon: Clock }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{item.label}</label>
                                        <p className="font-black text-gray-950 flex items-center gap-2">
                                            <item.icon size={16} className="text-primary-600" />
                                            {item.val}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-gray-950 text-white py-5 border-4 border-gray-950 shadow-[6px_6px_0px_0px_#444] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">تحليل التقدم للطالب</button>
                                <button onClick={() => setShowDetails(false)} className="flex-1 bg-white border-4 border-gray-950 py-5 font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">إغلاق</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white border-8 border-gray-950 w-full max-w-lg shadow-[20px_20px_0px_0px_black] overflow-hidden transform animate-in zoom-in-95">
                        <div className="p-8 border-b-8 border-gray-950 bg-emerald-600 text-white flex justify-between items-center">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">حجز موعد جديد</h3>
                            <button onClick={() => setShowAddModal(false)} className="bg-white text-gray-950 w-12 h-12 flex items-center justify-center border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:bg-gray-100 transition-colors font-black text-2xl">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleQuickEnroll} className="p-10 space-y-8">
                            <div className="bg-yellow-100 border-4 border-gray-950 p-6 shadow-inner">
                                <p className="text-xs font-black text-gray-950 uppercase mb-2">الموعد المحدد</p>
                                <div className="flex items-center gap-3">
                                    <Clock size={24} className="text-gray-950" />
                                    <span className="text-xl font-black text-gray-950">{enrollData.day} — {enrollData.hour}:00 {enrollData.period === 'am' ? 'صباحاً' : 'مساءً'}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black text-gray-950 uppercase mb-3 block">اختر الطالب</label>
                                    <select 
                                        required
                                        value={enrollData.studentId}
                                        onChange={e => setEnrollData({...enrollData, studentId: e.target.value})}
                                        className="w-full bg-white border-4 border-gray-950 p-4 font-black outline-none appearance-none cursor-pointer focus:bg-emerald-50"
                                    >
                                        <option value="">-- اضغط للاختيار من القائمة --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-950 uppercase mb-3 block">المادة</label>
                                        <input 
                                            type="text" 
                                            placeholder="اسم المادة..."
                                            value={enrollData.subject}
                                            onChange={e => setEnrollData({...enrollData, subject: e.target.value})}
                                            className="w-full bg-white border-4 border-gray-950 p-4 font-black outline-none focus:bg-emerald-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-950 uppercase mb-3 block">المعلمة</label>
                                        <input 
                                            readOnly
                                            value={enrollData.teacherName}
                                            className="w-full bg-gray-100 border-4 border-gray-950 p-4 font-black opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 text-white py-6 border-4 border-gray-950 shadow-[8px_8px_0px_0px_black] font-black uppercase tracking-widest text-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3">
                                <CheckCircle2 size={24} />
                                تأكيد حجز الحصة فوراً
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
