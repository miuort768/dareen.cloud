import { useState, useEffect, useMemo } from 'react';
import {
    AlertCircle,
    Bell,
    TrendingUp,
    CalendarDays,
    Clock,
    Headset,
    Activity,
    GraduationCap,
    BookOpen,
    Users
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const StudentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const [studentData, setStudentData] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllDays, setShowAllDays] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setIsLoading(true);
                const [meRes, sessionsRes] = await Promise.all([
                    api.get<any>('/student-portal/me'),
                    api.get<any[]>('/student-portal/me/sessions')
                ]);

                setStudentData(meRes);
                setSessions(sessionsRes);
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
            <div className="space-y-6">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    const totalUsagePercent = stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0;

    return (
        <div className="space-y-6 pb-32 animate-in fade-in duration-500" dir="rtl">

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-12 pb-6 px-6 -mx-4 lg:-mx-8 -mt-8 mb-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 dark:bg-primary-900/20 pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center text-white shadow-xl shadow-primary-600/20 ring-4 ring-primary-50 dark:ring-primary-900/10">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">بوابة الطالب</h1>
                            <p className="text-[12px] md:text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">
                                أهلاً بك، <span className="text-primary-600 dark:text-primary-400 font-black">{studentData?.name}</span> ✨
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attention Alerts Section */}
            {stats.targetReached && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 shadow-sm p-4 overflow-hidden mt-4">
                    <h4 className="font-black text-xs text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Bell size={16} className="text-rose-500 animate-bounce" />
                        تنبيه اقتراب انتهاء الاشتراك
                    </h4>
                    <div className="flex items-start gap-4">
                        <AlertCircle size={24} className="text-rose-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
                                رصيد الحصص الخاص بك يقترب من الانتهاء، تبقى أقل من حصتين في اشتراكك الحالي. يرجى التواصل مع الإدارة لتجديد الاشتراك.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-2 p-4 bg-gray-900 text-white dark:bg-black border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">إجمالي رصيد حصصك</p>
                            <h3 className="text-2xl font-black tracking-tighter">
                                <span className="text-primary-400">{stats.sessionsUsed}</span> / {stats.sessionsTotal}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 italic">حصة مستخدمة من إجمالي رصيدك</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-none transform group-hover:scale-110 transition-transform duration-300">
                            <BookOpen size={24} className="text-white" />
                        </div>
                    </div>
                    
                    <div className="w-full h-1.5 bg-gray-800 mt-4 overflow-hidden relative z-10">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000",
                                totalUsagePercent > 80 ? "bg-rose-500" : totalUsagePercent > 50 ? "bg-amber-500" : "bg-primary-500"
                            )}
                            style={{ width: `${Math.min(100, totalUsagePercent)}%` }}
                        ></div>
                    </div>
                </div>

                <StatCard
                    icon={Activity}
                    label="إجمالي الحضور"
                    value={stats.totalAttendance}
                    color="emerald"
                    subValue="حصة مكتملة"
                />
                
                <StatCard
                    icon={TrendingUp}
                    label="نسبة الالتزام"
                    value={`${stats.attendanceRate}%`}
                    color="blue"
                    subValue="معدل الحضور لحصصك"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Schedule Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarDays className="text-primary-600" size={18} />
                                {showAllDays ? 'الجدول الأسبوعي الشامل' : `حُدد لليوم (${todayArabic})`}
                            </h4>
                            <button
                                onClick={() => setShowAllDays(!showAllDays)}
                                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95 text-gray-700 dark:text-gray-300"
                            >
                                <CalendarDays size={14} />
                                {showAllDays ? 'إظهار جدول اليوم فقط' : 'عرض الجدول الكامل'}
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 border-r-4 border-r-primary-500">
                                        <h5 className="font-black text-primary-700 dark:text-primary-400 mb-3 text-sm">{dayData.day}</h5>
                                        <div className="space-y-3">
                                            {dayData.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="bg-white dark:bg-gray-900 p-2 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-primary-300">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-[120px]">{slot.subject}</span>
                                                        <span className="text-[9px] font-bold bg-primary-50 text-primary-700 px-1.5 py-0.5 dark:bg-primary-900/40 dark:text-primary-300">
                                                            {slot.time} {slot.period === 'am' ? 'صباحاً' : 'مساءً'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-2">
                                                        <Users size={12} className="text-gray-400" />
                                                        مع المعلم: {slot.teacher}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {((showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0) && (
                                    <div className="col-span-full py-12 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center animate-in fade-in duration-500">
                                        <div className="w-12 h-12 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4 border border-gray-100 dark:border-gray-800">
                                            <Clock size={24} />
                                        </div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">لا توجد حصص مجدولة</h3>
                                        <p className="text-[10px] text-gray-400/80 font-bold mt-2 italic text-center px-4">
                                            {showAllDays ? 'لم يتم إدراج حصص أسبوعية في النظام لك بعد.' : `اليوم (${todayArabic}) هو وقت استراحة، استمتع بوقتك!`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    
                    {/* Enrollments Overview */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="p-4 border-b border-gray-50 dark:border-gray-800">
                            <h4 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white">تفاصيل الاشتراكات والمواد</h4>
                        </div>
                        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                            {(studentData?.enrollments || []).length > 0 ? studentData.enrollments.map((en: any, i: number) => {
                                const usage = en.sessionsTotal > 0 ? (en.sessionsUsed / en.sessionsTotal) * 100 : 0;
                                return (
                                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-black text-[11px]">{en.subject}</h5>
                                            <span className="text-[9px] font-bold text-gray-500">{en.teacher}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
                                            <span className="text-primary-600 dark:text-primary-400">مُستخدم: {en.sessionsUsed}</span>
                                            <span className="text-gray-500">من أصل {en.sessionsTotal}</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <div 
                                                className={cn("h-full", usage > 80 ? "bg-rose-500" : "bg-primary-500")}
                                                style={{ width: `${Math.min(100, usage)}%`}}
                                            />
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-xs text-gray-400 text-center py-4 font-bold border border-dashed border-gray-200 dark:border-gray-800">لا توجد مواد مسجلة</p>
                            )}
                        </div>
                    </div>

                    {/* Support Block */}
                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 border-b-4 border-blue-500 text-white relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-black text-sm mb-2 flex items-center gap-2 relative z-10">
                            <Headset size={20} className="text-blue-300" />
                            تحتاج لمساعدة؟
                        </h4>
                        <p className="text-[11px] text-blue-100 leading-relaxed mb-4 relative z-10 opacity-90">
                            فريق الدعم الفني ومشرفي التسجيل متواجدون على مدار الساعة لمساعدتك.
                        </p>
                        <a
                            href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-blue-900 w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg active:scale-95 relative z-10"
                        >
                            تواصل فوراً
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subValue }: any) => {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 border shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
                    {subValue && <p className="text-[9px] font-bold text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={cn("p-2 rounded-none", colors[color])}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};
