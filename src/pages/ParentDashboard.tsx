import { useState, useEffect, useMemo } from 'react';
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
    Headset
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const ParentDashboard = () => {
    const { currentUser, adminPhone } = useApp();
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

        return {
            childCount: displayData.students.length,
            sessionCount: displayData.sessions.length,
            pendingInvoiceCount: pendingInvoices.length,
            totalPaid,
            totalPending: pendingInvoices.reduce((sum, i) => sum + i.amount, 0),
            upcomingSessions: displayData.sessions.filter(s => s.status !== 'completed').length,
            sessionsUsed,
            sessionsTotal
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">رصيد الحصص الكلي</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                                {stats.sessionsUsed} / {stats.sessionsTotal}
                            </h3>
                            <div className="w-20 h-1 bg-gray-100 dark:bg-gray-800 mt-2 rounded-none overflow-hidden">
                                <div
                                    className="h-full bg-primary-600"
                                    style={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }}
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
                />
                <StatCard
                    icon={Users}
                    label="إجمالي عدد الطلاب"
                    value={stats.childCount}
                    color="emerald"
                />
                <StatCard
                    icon={Receipt}
                    label="فواتير معلقة"
                    value={stats.pendingInvoiceCount}
                    color="rose"
                    subValue={stats.totalPending > 0 ? `${stats.totalPending} ج.م` : 'لا يوجد'}
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
                        href={`https://wa.me/2${adminPhone}`}
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

const StatCard = ({ icon: Icon, label, value, color, subValue }: any) => {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    };

    return (
        <div className={cn("p-3 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden")}>
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
