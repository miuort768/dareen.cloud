import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    CalendarDays,
    Clock,
    Headset,
    Activity,
    GraduationCap,
    BookOpen,
    Trophy,
    MessageSquare,
    Zap,
    Star,
    Award,
    Target,
    ChevronLeft,
    ShieldCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [pointLogs, setPointLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllDays, setShowAllDays] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes, logsRes] = await Promise.all([
                    api.get<any>('/student-portal/me'),
                    api.get<any[]>('/student-portal/me/sessions'),
                    api.get<any[]>('/student-portal/me/points-log')
                ]);

                setStudentData(meRes);
                setSessions(sessionsRes);
                setPointLogs(logsRes);
            } catch (error) {
                console.error('Error fetching student dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.role === 'student') {
            fetchStudentData();
        }
    }, [currentUser]);

    const stats = useMemo(() => {
        if (!studentData) return {
            sessionsUsed: 0, sessionsTotal: 0, targetReached: false,
            totalAttendance: 0, totalAbsence: 0, attendanceRate: 0,
            upcomingSessions: 0, sessionCount: 0
        };

        let sessionsUsed = 0;
        let sessionsTotal = 0;

        (studentData.enrollments || []).forEach((en: any) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });

        const totalAttendance = sessions.filter(s => s.status === 'completed').length;
        const totalAbsence = sessions.filter(s => s.status === 'cancelled').length;

        const totalRecorded = totalAttendance + totalAbsence;
        const attendanceRate = totalRecorded > 0
            ? Math.round((totalAttendance / totalRecorded) * 100)
            : 0;

        return {
            sessionsUsed,
            sessionsTotal,
            targetReached: (sessionsTotal - sessionsUsed) <= 2,
            totalAttendance,
            totalAbsence,
            attendanceRate,
            sessionCount: sessions.length,
            upcomingSessions: sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length,
        };
    }, [studentData, sessions]);

    const weeklySchedule = useMemo(() => {
        if (!studentData) return [];

        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const scheduleMap: Record<string, any[]> = {};

        (studentData.enrollments || []).forEach((en: any) => {
            (en.schedule || []).forEach((slot: any) => {
                if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
                scheduleMap[slot.day].push({
                    subject: en.subject,
                    time: slot.hour,
                    period: slot.period,
                    teacher: en.teacher
                });
            });
        });

        return days.map(day => ({
            day,
            slots: (scheduleMap[day] || []).sort((a, b) => a.time.localeCompare(b.time))
        })).filter(d => d.slots.length > 0);
    }, [studentData]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse border-8 border-gray-950" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse border-4 border-gray-950" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32" dir="rtl">

            {/* Student Tactical Header */}
            <div className="relative bg-gray-950 p-6 lg:p-10 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#3b82f6] overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-20 h-20 bg-primary-600 text-white border-[4px] border-gray-950 shadow-[4px_4px_0px_0px_white] flex items-center justify-center transform -rotate-2"
                            >
                                <GraduationCap size={44} strokeWidth={2.5} />
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-gray-950 flex items-center justify-center text-white font-bold text-[10px]">Lvl 5</div>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest italic border-b border-white">مركز عمليات الطالب</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 animate-ping" />
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">أهلاً يا بطل، {studentData?.name}</h1>
                            <p className="text-gray-400 text-xs font-black flex items-center gap-2 uppercase tracking-wider">
                                <Zap size={16} className="text-yellow-400" />
                                استعد لمهام اليوم • {todayArabic}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border-4 border-white/10 p-6 backdrop-blur-md shadow-[8px_8px_0px_0px_rgba(59,130,246,0.3)] min-w-[200px]">
                        <div className="text-right flex-1">
                             <span className="block text-[10px] font-black text-gray-500 uppercase tracking-[4px] mb-1 italic">رصيدك الحالي</span>
                             <div className="text-4xl font-black text-white tracking-tighter italic leading-none">{studentData?.totalPoints || 0} <span className="text-xs text-primary-400 tracking-normal">نقطة</span></div>
                        </div>
                        <div className="w-12 h-12 bg-white text-gray-950 flex items-center justify-center border-2 border-gray-950 transform rotate-3">
                             <Trophy size={24} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickLink 
                    icon={MessageSquare} 
                    label="مركز الدردشة" 
                    sub="تواصل مع معلمينك" 
                    color="blue" 
                    onClick={() => navigate('/parent-messages')} 
                />
                <QuickLink 
                    icon={BookOpen} 
                    label="حقيبة الدروس" 
                    sub="المواد والاشتراكات" 
                    color="amber" 
                    onClick={() => navigate('/parent-students')} 
                />
                <QuickLink 
                    icon={CalendarDays} 
                    label="سجل الحصص" 
                    sub="متابعة الحضور" 
                    color="emerald" 
                    onClick={() => navigate('/parent-attendance')} 
                />
                <QuickLink 
                    icon={Award} 
                    label="لوحة التميز" 
                    sub="أوسمتك الحالية" 
                    color="rose" 
                    onClick={() => navigate('/evaluations')} 
                />
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual Progress & Performance (Left) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_black] overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                             {/* Stats Radar Side */}
                            <div className="p-8 bg-gray-950 text-white relative border-b-[6px] md:border-b-0 md:border-l-[6px] border-gray-950">
                                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" 
                                     style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="p-2 bg-white text-gray-950 transform -rotate-3 border-2 border-gray-950">
                                            <TrendingUp size={20} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter">مؤشر الأداء الرقمي</h3>
                                    </div>

                                    <div className="space-y-10">
                                        <div>
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">معدل الانضباط</span>
                                                <span className="text-3xl font-black text-primary-400 italic leading-none">{stats.attendanceRate}%</span>
                                            </div>
                                            <div className="w-full h-4 bg-white/10 border-2 border-gray-950 relative overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stats.attendanceRate}%` }}
                                                    className="absolute top-0 right-0 h-full bg-primary-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">قوة الرصيد</span>
                                                <span className="text-3xl font-black text-emerald-400 italic leading-none">{stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0}%</span>
                                            </div>
                                            <div className="w-full h-4 bg-white/10 border-2 border-gray-950 relative overflow-hidden">
                                                <div 
                                                    className="absolute top-0 right-0 h-full bg-emerald-500" 
                                                    style={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 flex items-center justify-between p-4 bg-white/5 border-2 border-white/10">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-gray-400">الحالة الاستراتيجية</span>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase italic">مثالي (OPTIMAL)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements Section */}
                            <div className="p-8 bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="p-2 bg-gray-950 text-white transform rotate-3">
                                            <Star size={20} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-950 uppercase italic tracking-tighter">سجل الأبطال</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {(studentData?.enrollments || []).slice(0, 3).map((en: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border-2 border-gray-950 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-tighter text-gray-950">{en.subject}</h4>
                                                        <p className="text-[9px] font-bold text-gray-400 italic">{en.teacher}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left font-black italic tracking-tighter leading-none">
                                                    <span className="text-primary-600">{en.sessionsUsed}</span>
                                                    <span className="text-[10px] text-gray-300 mx-1">/</span>
                                                    <span className="text-gray-400">{en.sessionsTotal}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => navigate('/parent-students')}
                                    className="mt-10 py-3 bg-gray-950 text-white text-[10px] font-black uppercase tracking-[3px] italic border-b-4 border-primary-600 flex items-center justify-center gap-2"
                                >
                                    عرض التفاصيل العسكرية <ChevronLeft size={14} strokeWidth={3} />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#10b981] overflow-hidden">
                        <div className="p-6 border-b-[6px] border-gray-950 flex items-center justify-between bg-emerald-50">
                            <h4 className="font-black text-xl uppercase tracking-tighter text-gray-950 flex items-center gap-3 italic leading-none">
                                <CalendarDays className="text-emerald-600" size={28} />
                                {showAllDays ? 'خريطة المهام الشاملة' : `مهمات اليوم (${todayArabic})`}
                            </h4>
                            <button
                                onClick={() => setShowAllDays(!showAllDays)}
                                className="px-4 py-2 bg-gray-950 text-white border-2 border-gray-950 font-black text-[9px] uppercase italic shadow-[3px_3px_0px_0px_#10b981]"
                            >
                                {showAllDays ? 'اليوم' : 'الكل'}
                            </button>
                        </div>
                        <div className="p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                    <div key={idx} className="bg-white border-4 border-gray-950 p-5 shadow-[6px_6px_0px_0px_#3b82f6]">
                                        <div className="flex items-center gap-3 mb-6 font-black text-gray-950 italic border-b-4 border-gray-100 pb-3">
                                            <div className="w-9 h-9 bg-gray-950 text-white flex items-center justify-center transform -rotate-3">{dayData.day.substring(0, 1)}</div>
                                            <h5 className="text-lg">{dayData.day}</h5>
                                        </div>
                                        <div className="space-y-3">
                                            {dayData.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="bg-gray-50 p-4 border-2 border-gray-950 flex items-center justify-between gap-4 group hover:bg-white transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white border-[2px] border-gray-950 flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
                                                            <Target size={18} className="text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-black text-gray-950 block italic">{slot.subject}</span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{slot.teacher}</span>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1 bg-gray-950 text-white text-[10px] font-black italic">
                                                        {slot.time} {slot.period === 'am' ? 'صباحاً' : 'مساءً'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {((showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0) && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center grayscale">
                                        <Clock size={48} className="mb-4" />
                                        <p className="text-xs font-black uppercase tracking-[5px]">No active missions found</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Side Panels (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Activity Feed / Notifications */}
                    <div className="bg-white border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#ef4444] p-8 overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-rose-600 text-white transform -rotate-3 border-2 border-gray-950 flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
                                <Activity size={20} strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">تنبيهات الاستعداد</h3>
                        </div>
                        
                        <div className="space-y-5">
                            {pointLogs.slice(0, 4).map((log, i) => (
                                <div key={i} className="p-4 bg-gray-50 border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] group hover:translate-x-1 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-gray-950 uppercase italic tracking-tighter">تحديث النقاط</p>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold">{format(new Date(log.createdAt), 'HH:mm')}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-600 leading-tight mb-2">{log.description}</p>
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                        <span className="text-[9px] font-black uppercase text-emerald-600">القيمة المضافة</span>
                                        <span className="text-lg font-black text-emerald-600 italic">+{log.points}</span>
                                    </div>
                                </div>
                            ))}
                            {pointLogs.length === 0 && (
                                <div className="py-10 text-center border-4 border-dashed border-gray-100 grayscale opacity-40">
                                    <Clock size={32} className="mx-auto mb-2" />
                                    <p className="text-[9px] font-black uppercase italic tracking-widest">انتظار البيانات...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support & Training */}
                    <div className="bg-gray-950 p-8 border-[6px] border-gray-950 shadow-[10px_10px_0px_0px_#3b82f6] text-white">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white text-gray-950 flex items-center justify-center border-4 border-white transform rotate-6">
                                <Headset size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase italic tracking-tighter leading-none mb-1">الدعم الفوري</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">فريق العمل جاهز</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed mb-8 opacity-80">
                            هل تواجه صعوبة في استخدام المنصة أو لديك استفسار عن دروسك؟ تواصل مع مشرفك المباشر الآن.
                        </p>
                        <a
                            href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-gray-950 w-full py-4 text-xs font-black uppercase tracking-[5px] flex items-center justify-center gap-3 border-b-4 border-primary-600 hover:bg-primary-50 transition-colors"
                        >
                            تواصل تكتيكي <MessageSquare size={16} strokeWidth={3} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink = ({ icon: Icon, label, sub, color, onClick }: any) => {
    const colors: any = {
        blue: "text-blue-600 border-blue-600 shadow-[6px_6px_0px_0px_#2563eb] hover:bg-blue-50",
        amber: "text-amber-600 border-amber-600 shadow-[6px_6px_0px_0px_#d97706] hover:bg-amber-50",
        emerald: "text-emerald-600 border-emerald-600 shadow-[6px_6px_0px_0px_#059669] hover:bg-emerald-50",
        rose: "text-rose-600 border-rose-600 shadow-[6px_6px_0px_0px_#e11d48] hover:bg-rose-50",
    };

    return (
        <motion.button
            whileHover={{ y: -5, x: -2 }}
            onClick={onClick}
            className={cn(
                "p-5 bg-white border-[4px] flex flex-col items-center gap-3 text-center transition-all",
                colors[color]
            )}
        >
            <div className="w-12 h-12 flex items-center justify-center border-2 border-current transform -rotate-3 group-hover:rotate-0 transition-transform">
                <Icon size={24} strokeWidth={3} />
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-tighter leading-none mb-1">{label}</p>
                <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{sub}</p>
            </div>
        </motion.button>
    );
};
