import { useState, useEffect } from 'react';
import { 
    Calendar, Clock, Search, User, GraduationCap, 
    BookOpen, Filter, X, CheckCircle2, Zap, Target,
    ShieldCheck, Activity, ArrowRight
} from 'lucide-react';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

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

    // Simulated 24h reset logic
    useEffect(() => {
        const checkAndReset = async () => {
            try {
                if (currentUser?.role === 'admin') {
                    const settings = await api.get<any>('/system/settings');
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

    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    const filteredAppointments = allAppointments.filter(appointment => {
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
                const timeA = Number(a.hour) + (a.period === 'pm' && Number(a.hour) !== 12 ? 12 : 0);
                const timeB = Number(b.hour) + (b.period === 'pm' && Number(b.hour) !== 12 ? 12 : 0);
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

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-64 rounded-none" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40 rounded-none" />
                    <Skeleton className="h-40 rounded-none" />
                    <Skeleton className="h-40 rounded-none" />
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
        <div className="space-y-6 pb-20">
            {/* Ultra-Brutalist Command Header */}
            <div className="relative bg-gray-950 p-4 shadow-[3px_3px_0px_0px_#ef4444] border-2 border-gray-950 overflow-hidden rounded-none mb-6">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            whileHover={{ rotate: -5, scale: 1.05 }}
                            className="w-12 h-12 bg-primary-600 text-white border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] flex items-center justify-center transform -rotate-3"
                        >
                            <Calendar size={24} strokeWidth={3} />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-primary-600 text-white text-[8px] font-black uppercase tracking-widest italic">جدول المهام</span>
                                <div className="flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />)}
                                </div>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">إدارة المهمات والمواعيد</h1>
                            <p className="text-gray-400 text-[10px] font-bold mt-2 flex items-center gap-2 uppercase tracking-wider">
                                <Activity size={14} className="text-primary-500" />
                                مراقبة وتوجيه الجلسات التعليمية لشركاء النجاح
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Impact Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ y: -3 }}>
                    <StatsCard
                        title="الجلسات المجدولة"
                        value={totalAppointments}
                        icon={Calendar}
                        color="indigo"
                        trend="القوة الإجمالية"
                        className="border-2 border-gray-950 shadow-[3px_3px_0px_0px_#4f46e5] rounded-none p-3"
                    />
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                    <StatsCard
                        title="عمليات اليوم"
                        value={todayAppointments}
                        icon={Zap}
                        color="blue"
                        trend="الهدف اليومي"
                        className="border-2 border-gray-950 shadow-[3px_3px_0px_0px_#3b82f6] rounded-none p-3"
                    />
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                    <StatsCard
                        title="قيد التنفيذ المتبقي"
                        value={remainingToday}
                        icon={Target}
                        color="emerald"
                        trend="العمليات النشطة"
                        className="border-2 border-gray-950 shadow-[3px_3px_0px_0px_#10b981] rounded-none p-3"
                    />
                </motion.div>
            </div>

            {/* Operational Filters - Brutalist Panel */}
            <div className="bg-white border-2 border-gray-950 p-4 shadow-[4px_4px_0px_0px_black] relative">
                <div className="absolute top-0 right-0 w-16 h-full bg-gray-50 -skew-x-12 translate-x-8 pointer-events-none"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    <div className="relative group">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">البحث الرقمي</label>
                        <Search className="absolute right-3 top-[30px] text-gray-950" size={16} />
                        <input
                            type="text"
                            placeholder="بحث في السجلات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-6 pr-10 py-2.5 border-2 border-gray-950 font-black focus:bg-yellow-50 outline-none transition-all placeholder:text-gray-300 italic text-right text-xs"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">الفلترة الزمنية</label>
                        <Filter className="absolute right-3 top-[30px] text-gray-950" size={16} />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full pl-6 pr-10 py-2.5 border-2 border-gray-950 font-black focus:bg-primary-50 outline-none appearance-none cursor-pointer uppercase italic text-right text-xs"
                        >
                            <option value="all">كل الأيام</option>
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">قائد الفريق</label>
                        <GraduationCap className="absolute right-3 top-[30px] text-gray-950" size={16} />
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                            className="w-full pl-6 pr-10 py-2.5 border-2 border-gray-950 font-black focus:bg-emerald-50 outline-none appearance-none cursor-pointer uppercase italic text-right text-xs"
                        >
                            <option value="all">كل الكوادر</option>
                            {uniqueTeachers.map(teacher => (
                                <option key={teacher} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Schedule Grid - Strategic Layout */}
            <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={`${showDetails ? 'lg:col-span-2' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {appointmentsByDay.map(({ day, appointments }) => (
                        <motion.div 
                            layout
                            key={day} 
                            className="bg-white border-2 border-gray-950 shadow-[3px_3px_0px_0px_#ef4444] group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                        >
                            <div className="p-3 border-b-2 border-gray-950 flex items-center justify-between bg-gray-950">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-white uppercase tracking-tighter text-base italic">{day}</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-primary-600 px-2 py-0.5 border border-white">
                                    <span className="text-white text-sm font-black leading-none">{appointments.length}</span>
                                    <span className="text-white text-[8px] font-bold uppercase tracking-widest">مهمة</span>
                                </div>
                            </div>

                            <div className="p-3 min-h-[150px] flex flex-col justify-start">
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
                                                className="p-3 bg-white border-2 border-gray-200 hover:border-primary-600 transition-all cursor-pointer relative overflow-hidden shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                                            >
                                                {/* Status Badge */}
                                                <div className="absolute top-0 left-0 bg-primary-600 text-white px-2 py-0.5 text-[7px] font-black uppercase italic tracking-tighter">التالي</div>
                                                
                                                <div className="flex items-center justify-between mt-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-gray-950 text-white border border-gray-950 transform -rotate-3">
                                                            <Clock size={14} strokeWidth={3} />
                                                        </div>
                                                        <span className="text-lg font-black text-gray-950 italic tracking-tighter">{nextSession.time}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 border-r-2 border-gray-950">
                                                        <User size={14} className="text-gray-950" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-gray-950">{nextSession.studentName}</span>
                                                            <span className="text-[8px] text-primary-600 font-bold tracking-widest uppercase">{nextSession.curriculum}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-1">
                                                        <ShieldCheck size={14} className="text-emerald-500" />
                                                        <span className="text-[9px] font-black text-gray-400 uppercase italic">القائد: {nextSession.teacherName}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleCompleteSession(nextSession.id, e)}
                                                    className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-gray-950 py-1.5 font-black text-[10px] uppercase italic shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center"
                                                >
                                                    تأكيد الإنجاز
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="text-center py-6 bg-emerald-50 border-2 border-emerald-500 flex flex-col items-center">
                                                <div className="w-10 h-10 bg-white border-2 border-emerald-500 flex items-center justify-center mb-2 transform rotate-12">
                                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                                </div>
                                                <h4 className="text-emerald-950 font-black text-xs uppercase tracking-tighter mb-1 italic">مكتمل</h4>
                                                <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">جميع المهمات مكتملة</p>
                                            </div>
                                        );
                                    }
                                })() : (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 opacity-30 grayscale">
                                        <Calendar size={32} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">لا يوجد بيانات</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Integrated Empty Status / Filler Block */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "bg-white border-2 border-gray-950 flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_black] text-center p-4",
                            appointmentsByDay.length % 3 === 1 ? "lg:col-span-2" : 
                            appointmentsByDay.length % 3 === 2 ? "lg:col-span-1" :
                            appointmentsByDay.length === 0 ? "lg:col-span-3 min-h-[200px]" : "hidden lg:flex"
                        )}
                    >
                         <div className="flex flex-col items-center gap-4">
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }} 
                                transition={{ repeat: Infinity, duration: 5 }}
                                className="w-10 h-10 bg-gray-50 border-2 border-gray-950 flex items-center justify-center transform rotate-3"
                            >
                                <Calendar size={20} strokeWidth={1} className="text-gray-400" />
                            </motion.div>
                            <div className="text-center">
                                <h3 className="font-black text-xl text-gray-950 uppercase italic tracking-tighter mb-1">لا توجد إشارات</h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px] max-w-[200px] mx-auto leading-relaxed">
                                    نظام الجدولة يعمل بكفاءة قصوى.
                                </p>
                            </div>
                         </div>
                    </motion.div>
                </div>

                {/* Details Panel - The Control Bunker */}
                <AnimatePresence>
                    {showDetails && selectedAppointment && (
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="bg-white border-2 border-gray-950 h-fit shadow-[4px_4px_0px_0px_black] sticky top-4 overflow-hidden"
                        >
                            <div className="p-4 bg-gray-950 text-white relative">
                                <button 
                                    onClick={() => setShowDetails(false)} 
                                    className="absolute left-4 top-4 w-6 h-6 border border-white flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 transition-all"
                                >
                                    <X size={14} />
                                </button>
                                <div className="text-center pt-2">
                                    <div className="inline-block p-2 border-2 border-primary-500 mb-2 transform -rotate-6">
                                        <Zap className="text-primary-500" size={24} />
                                    </div>
                                    <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[2px] mb-1 leading-none">لوجستيات المهمة</h4>
                                    <h3 className="font-black text-xl uppercase italic tracking-tighter mb-1">{selectedAppointment.day}</h3>
                                    <div className="inline-block px-3 py-1 bg-primary-600 text-white border border-white text-lg font-black italic">
                                        {selectedAppointment.time}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="p-3 bg-gray-50 border-r-4 border-primary-600 flex items-center justify-between group">
                                    <div>
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-0.5">الطالب المستهدف</label>
                                        <h4 className="text-sm font-black text-gray-950 uppercase italic">{selectedAppointment.studentName}</h4>
                                        <span className="text-[8px] font-bold text-primary-600 uppercase tracking-widest">{selectedAppointment.studentGrade}</span>
                                    </div>
                                    <User size={24} className="text-gray-200 group-hover:text-primary-600 transition-colors" />
                                </div>

                                <div className="p-3 bg-gray-50 border-r-4 border-emerald-500 flex items-center justify-between group">
                                    <div>
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-0.5">قائد المجموعة</label>
                                        <h4 className="text-sm font-black text-gray-950 uppercase italic">{selectedAppointment.teacherName}</h4>
                                    </div>
                                    <ShieldCheck size={24} className="text-gray-200 group-hover:text-emerald-500 transition-colors" />
                                </div>

                                <div className="p-3 bg-gray-50 border-r-4 border-amber-500 flex items-center justify-between group">
                                    <div>
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-0.5">نطاق المادة</label>
                                        <h4 className="text-sm font-black text-gray-950 uppercase italic">{selectedAppointment.subject}</h4>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase italic">{selectedAppointment.curriculum}</span>
                                    </div>
                                    <BookOpen size={24} className="text-gray-200 group-hover:text-amber-500 transition-colors" />
                                </div>

                                <button 
                                    onClick={() => setShowDetails(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-950 text-white border-2 border-gray-950 font-black uppercase text-[10px] italic shadow-[4px_4px_0px_0px_#ef4444] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                                >
                                    إغلاق التقرير <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
