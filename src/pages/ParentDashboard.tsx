import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Users,
    Calendar,
    AlertCircle,
    Receipt,
    Bell,
    TrendingUp,
    CheckCircle2,
    CalendarDays,
    Clock,
    Headset,
    Activity,
    XCircle,
    Star,
    Award,
    Trophy
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ParentExcellenceRadar } from '../features/dashboard/components/ParentExcellenceRadar';
import { ParentChildVisualProgress } from '../features/dashboard/components/ParentChildVisualProgress';

export const ParentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllDays, setShowAllDays] = useState(false);

    const todayArabic = format(new Date(), 'eeee', { locale: ar });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);

                const sessionsPromises = students.map(s => api.get<any[]>(`/parents/child-sessions/${s.id}`));
                const invoicesPromises = students.map(s => api.get<any[]>(`/parents/child-invoices/${s.id}`));

                const allSessionsResults = await Promise.all(sessionsPromises);
                const allInvoicesResults = await Promise.all(invoicesPromises);

                setSessions(allSessionsResults.flat());
                setInvoices(allInvoicesResults.flat());

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const displayData = useMemo(() => {
        return { sessions, invoices, students: children };
    }, [sessions, invoices, children]);

    const stats = useMemo(() => {
        const pendingInvoices = displayData.invoices.filter(i => i.status === 'unpaid');
        const totalPaid = displayData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

        let sessionsUsed = 0;
        let sessionsTotal = 0;

        displayData.students.forEach(s => {
            (s.enrollments || []).forEach((en: any) => {
                sessionsUsed += Number(en.sessionsUsed || 0);
                sessionsTotal += Number(en.sessionsTotal || 0);
            });
        });

        const totalAttendance = displayData.sessions.filter(s => s.status === 'completed').length;
        // In the context of parent dashboard, cancelled usually means absent if it was a past session
        const totalAbsence = displayData.sessions.filter(s => s.status === 'cancelled').length;

        const totalRecorded = totalAttendance + totalAbsence;
        const attendanceRate = totalRecorded > 0
            ? Math.round((totalAttendance / totalRecorded) * 100)
            : 0;

        return {
            childCount: displayData.students.length,
            sessionCount: displayData.sessions.length,
            pendingInvoiceCount: pendingInvoices.length,
            totalPaid,
            totalPending: pendingInvoices.reduce((sum, i) => sum + i.amount, 0),
            upcomingSessions: displayData.sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length,
            sessionsUsed,
            sessionsTotal,
            totalAttendance,
            totalAbsence,
            attendanceRate
        };
    }, [displayData]);

    const weeklySchedule = useMemo(() => {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const scheduleMap: Record<string, any[]> = {};

        displayData.students.forEach(student => {
            (student.enrollments || []).forEach((en: any) => {
                (en.schedule || []).forEach((slot: any) => {
                    if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
                    scheduleMap[slot.day].push({
                        studentName: student.name,
                        subject: en.subject,
                        time: slot.hour,
                        period: slot.period,
                        teacher: en.teacher
                    });
                });
            });
        });

        return days.map(day => ({
            day,
            slots: (scheduleMap[day] || []).sort((a, b) => a.time.localeCompare(b.time))
        })).filter(d => d.slots.length > 0);
    }, [displayData]);

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
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-12 pb-6 px-6 -mx-4 lg:-mx-8 -mt-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center text-white shadow-xl shadow-primary-600/20">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">بوابة المتابعة الذكية</h1>
                            <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-bold">أهلاً بك، أ/ {currentUser?.name}</p>
                            {children.some((c: any) => c.totalPoints > 0) && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {children.filter((c: any) => c.totalPoints > 0).map((child: any) => (
                                        <div key={child.id} className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-black px-2 py-1 border border-yellow-200 dark:border-yellow-700/50 shadow-sm text-[10px]">
                                            <Star size={12} className="fill-current" />
                                            {child.name}: {child.totalPoints} نقطة
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestion 1: Excellence Radar */}
            <ParentExcellenceRadar 
                achievements={children
                    .filter(c => c.totalPoints > 0)
                    .slice(0, 2)
                    .map(c => ({
                        id: c.id,
                        studentName: c.name,
                        achievement: 'إتمام حفظ سورة جديدة بتميز',
                        date: 'اليوم',
                        points: c.totalPoints > 50 ? 50 : c.totalPoints
                    }))
                }
            />

            {/* Suggestion 2 & 3: Visual Progress Profiles */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy size={20} className="text-primary-600" />
                    <h2 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic">مستويات الأبطال (Heroes Levels)</h2>
                </div>
                <ParentChildVisualProgress 
                    childrenProfiles={children.map(c => ({
                        id: c.id,
                        name: c.name,
                        totalPoints: c.totalPoints || 0,
                        badges: (() => {
                            if (!c.badges) return [];
                            try {
                                const parsed = JSON.parse(c.badges);
                                return Array.isArray(parsed) ? parsed.map((b: any) => b.name) : [];
                            } catch (e) {
                                return c.badges.split(',').filter((b: string) => b);
                            }
                        })(),
                        teacherName: (c.enrollments && c.enrollments[0]?.teacher) || 'المعلمة المشرفة',
                        lastEvaluation: 'امتياز',
                        adminPhone: adminPhone || ''
                    }))}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div
                    onClick={() => navigate('/parent-attendance')}
                    className="p-3 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">رصيد الحصص الكلي</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                                {stats.sessionsUsed} / {stats.sessionsTotal}
                            </h3>
                            <div className="w-20 h-1 bg-gray-100 dark:bg-gray-800 mt-2 rounded-none overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        totalUsagePercent > 80 ? "bg-rose-500" : totalUsagePercent > 50 ? "bg-amber-500" : "bg-primary-600"
                                    )}
                                    style={{ width: `${Math.min(100, totalUsagePercent)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                </div>

                <StatCard
                    icon={Calendar}
                    label="حصص الشهر"
                    value={stats.sessionCount}
                    color="amber"
                    subValue={`${stats.upcomingSessions} قادمة`}
                    onClick={() => navigate('/parent-attendance')}
                />
                <StatCard
                    icon={Users}
                    label="إجمالي عدد الطلاب"
                    value={stats.childCount}
                    color="emerald"
                    onClick={() => navigate('/parent-students')}
                />
                <StatCard
                    icon={Award}
                    label="التقارير الدراسية"
                    value="عرض الكل"
                    color="blue"
                    subValue="تقييمات المعلمين"
                    onClick={() => navigate('/evaluations')}
                />
                <StatCard
                    icon={Receipt}
                    label="فواتير معلقة"
                    value={stats.pendingInvoiceCount}
                    color="rose"
                    subValue={stats.totalPending > 0 ? `${stats.totalPending} ج.م` : 'لا يوجد'}
                    onClick={() => navigate('/student-invoices')}
                />
            </div>

            {/* Attention Alerts Section - Only show when there are alerts */}
            {((displayData.students.some(s => (s.enrollments || []).some((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2))) || stats.pendingInvoiceCount > 0) && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 overflow-hidden">
                    <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                        تنبيهات الانتباه
                        <Bell size={16} className="text-rose-500 animate-bounce" />
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayData.students.map(student => {
                            const lowBalanceEnrollments = (student.enrollments || []).filter((en: any) => (Number(en.sessionsTotal) - Number(en.sessionsUsed)) <= 2);
                            return lowBalanceEnrollments.map((en: any, idx: number) => (
                                <div key={`${student.id}-${idx}`} className="p-3 bg-rose-50 dark:bg-rose-900/20 border-r-4 border-r-rose-500 flex items-start gap-4">
                                    <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-rose-900 dark:text-rose-200">تجديد الاشتراك: {student.name}</p>
                                        <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold mt-1">تبقى {Number(en.sessionsTotal) - Number(en.sessionsUsed)} حصص فقط في مادة {en.subject}</p>
                                    </div>
                                </div>
                            ));
                        })}
                        {stats.pendingInvoiceCount > 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-r-4 border-r-amber-500 flex items-start gap-4">
                                <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-amber-900 dark:text-amber-200">سداد الفواتير المعلقة</p>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-1">يوجد {stats.pendingInvoiceCount} فواتير بانتظار السداد بقيمة {stats.totalPending.toLocaleString()} ج.م</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Attendance Analysis Grid - 4 side by side */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard
                            icon={Activity}
                            label="إجمالي الحضور"
                            value={stats.totalAttendance}
                            color="emerald"
                            subValue="حصة مكتملة"
                        />
                        <StatCard
                            icon={XCircle}
                            label="إجمالي الغياب"
                            value={stats.totalAbsence}
                            color="rose"
                            subValue="حصة فائتة"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="نسبة الالتزام"
                            value={`${stats.attendanceRate}%`}
                            color="blue"
                            subValue="معدل الحضور"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="الرصيد المتبقي"
                            value={stats.sessionsTotal - stats.sessionsUsed}
                            color="amber"
                            subValue="حصة متوفرة"
                        />
                    </div>

                    {/* Weekly Schedule Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarDays className="text-primary-600" size={18} />
                                {showAllDays ? 'جدول المواعيد الأسبوعي الكامل' : `مواعيد اليوم (${todayArabic})`}
                            </h4>
                            <button
                                onClick={() => setShowAllDays(!showAllDays)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-gray-900 border-b-2 border-primary-600 text-white hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                <CalendarDays size={14} className="text-primary-400" />
                                {showAllDays ? 'إظهار اليوم فقط' : 'عرض الجدول الأسبوعي الكامل'}
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).map((dayData, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 border-r-4 border-r-primary-500">
                                        <h5 className="font-black text-primary-700 dark:text-primary-400 mb-3 text-sm">{dayData.day}</h5>
                                        <div className="space-y-3">
                                            {dayData.slots.map((slot, sIdx) => (
                                                <div key={sIdx} className="bg-white dark:bg-gray-900 p-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-black text-gray-900 dark:text-white truncate max-w-[100px]">{slot.studentName}</span>
                                                        <span className="text-[9px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 dark:bg-primary-900/40 dark:text-primary-300">
                                                            {slot.time} {slot.period === 'am' ? 'صباحاً' : 'مساءً'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 font-bold">{slot.subject} - {slot.teacher}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {((showAllDays ? weeklySchedule : weeklySchedule.filter(d => d.day === todayArabic)).length === 0) && (
                                    <div className="col-span-full py-16 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                        <div className="w-12 h-12 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4 border border-gray-100 dark:border-gray-800">
                                            <Clock size={24} />
                                        </div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">لا توجد مواعيد حالياً</h3>
                                        <p className="text-[10px] text-gray-400/80 font-bold mt-2 italic">
                                            {showAllDays ? 'لم يتم تسجيل مواعيد أسبوعية للأبناء في النظام بعد.' : `يوم ${todayArabic} هو يوم راحة للأبناء من الحصص الدراسية.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pending Invoices */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <Receipt className="text-primary-600" size={18} />
                                الفواتير المنشورة بانتظار السداد
                            </h4>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                {displayData.invoices.filter(i => i.status === 'unpaid').map((invoice) => (
                                    <div key={invoice.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 border-r-4 border-r-rose-400 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white">فاتورة {invoice.month}/{invoice.year}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 italic">{invoice.studentName}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-black text-rose-600 tracking-tighter">{invoice.amount} ج.م</p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">مستحقة الآن</p>
                                        </div>
                                    </div>
                                ))}
                                {displayData.invoices.filter(i => i.status === 'unpaid').length === 0 && (
                                    <div className="py-6 text-center">
                                        <p className="text-xs text-gray-400 font-black italic">لا توجد فواتير معلقة بانتظار السداد حالياً. شكراً لالتزامكم ✨</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Full width premium contact button */}
                    <a
                        href={`https://wa.me/${adminPhone?.replace(/\D/g, '').replace(/^0/, '20')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-6 bg-gray-900 dark:bg-black border-r-4 border-primary-500 text-white group hover:bg-black transition-all shadow-xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 text-primary-400 group-hover:scale-110 transition-transform">
                                <Headset size={28} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-1 text-white">تواصل مع الإدارة فوراً</h4>
                                <p className="text-[10px] text-gray-400 font-bold">الدعم الفني وسكرتارية المعهد</p>
                            </div>
                        </div>
                        <div className="text-primary-500">
                            <TrendingUp size={24} />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subValue, onClick }: any) => {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-amber-900/30",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden",
                onClick && "cursor-pointer"
            )}
        >
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
                    {subValue && <p className="text-[9px] font-black text-gray-400 mt-0.5 italic">{subValue}</p>}
                </div>
                <div className={cn("p-1.5 rounded-none transition-transform group-hover:scale-110 duration-500", colors[color])}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
};
