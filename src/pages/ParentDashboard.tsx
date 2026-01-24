import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Calendar,
    Wallet,
    AlertCircle,
    MessageCircle,
    Receipt,
    Bell,
    TrendingUp,
    CheckCircle2,
    CalendarCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const ParentDashboard = () => {
    const { currentUser } = useApp();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
    const [sessions, setSessions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        if (selectedChildId === 'all') {
            return { sessions, invoices, students: children };
        }
        return {
            sessions: sessions.filter(s => s.studentId === selectedChildId),
            invoices: invoices.filter(i => i.studentId === selectedChildId),
            students: children.filter(s => s.id === selectedChildId)
        };
    }, [selectedChildId, sessions, invoices, children]);

    const stats = useMemo(() => {
        const pendingInvoices = displayData.invoices.filter(i => i.status === 'unpaid');
        const totalPaid = displayData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

        // Calculate sessions from enrollments
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

    // Group schedule by day
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
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-8 -mx-4 lg:-mx-8 -mt-8 mb-8 shadow-sm">
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

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setSelectedChildId('all')}
                            className={cn(
                                "px-6 py-2.5 font-black text-sm transition-all border-b-4",
                                selectedChildId === 'all'
                                    ? "bg-primary-50 text-primary-700 border-primary-600 dark:bg-primary-900/20"
                                    : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            نظرة عامة
                        </button>
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={cn(
                                    "px-6 py-2.5 font-black text-sm transition-all border-b-4",
                                    selectedChildId === child.id
                                        ? "bg-primary-50 text-primary-700 border-primary-600 dark:bg-primary-900/20"
                                        : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                                )}
                            >
                                {child.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رصيد الحصص الكلي</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {stats.sessionsUsed} / {stats.sessionsTotal}
                            </h3>
                            <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 mt-2 rounded-none overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-1000"
                                    style={{ width: `${stats.sessionsTotal > 0 ? (stats.sessionsUsed / stats.sessionsTotal) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                <StatCard
                    icon={Calendar}
                    label="حصص الشهر"
                    value={stats.sessionCount}
                    color="amber"
                    subValue={`${stats.upcomingSessions} حصة متبقية`}
                />
                <StatCard
                    icon={Wallet}
                    label="إجمالي المدفوعات"
                    value={stats.totalPaid.toLocaleString() + ' ج.م'}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* Weekly Schedule Section - NEW */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className="text-primary-600" size={18} />
                                جدول المواعيد الأسبوعي الثابت
                            </h4>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {weeklySchedule.map((dayData, idx) => (
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
                                {weeklySchedule.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                        لم يتم تحديد مواعيد ثابتة في الجدول بعد
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="text-primary-600" size={18} />
                                سجل المتابعة الدراسية
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-6 py-4">الابن / المادة</th>
                                        <th className="px-6 py-4">التوقيت</th>
                                        <th className="px-6 py-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {displayData.sessions.slice(0, 5).map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{session.studentName}</div>
                                                <div className="text-[10px] text-gray-400 font-black">{session.subject}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-700 dark:text-gray-300">
                                                    {format(new Date(session.date), 'eeee, d MMM', { locale: ar })}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{session.time}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 text-[10px] font-black uppercase tracking-tighter border",
                                                    session.status === 'completed'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                        : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                                )}>
                                                    {session.status === 'completed' ? 'تم الحضور' : 'مجدولة'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 -translate-y-16 translate-x-16 rotate-45 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h4 className="font-black text-lg mb-2">تواصل مع الإدارة</h4>
                            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">لديك استفسار أو طلب خاص لأبنائك؟ سكرتارية المعهد جاهزة للرد عليك فوراً.</p>
                            <button className="flex items-center gap-3 px-6 py-3 bg-primary-600 hover:bg-primary-700 transition-all font-black text-xs uppercase tracking-widest">
                                <MessageCircle size={18} />
                                إرسال رسالة واتساب
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 overflow-hidden">
                        <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                            تنبيهات الانتباه
                            <Bell size={16} className="text-rose-500 animate-bounce" />
                        </h4>
                        <div className="space-y-4">
                            {displayData.students.map(student => {
                                const lowBalanceEnrollments = (student.enrollments || []).filter((en: any) => (en.sessionsTotal - en.sessionsUsed) <= 2);
                                return lowBalanceEnrollments.map((en: any, idx: number) => (
                                    <div key={`${student.id}-${idx}`} className="p-3 bg-rose-50 dark:bg-rose-900/20 border-r-4 border-r-rose-500 flex items-start gap-3">
                                        <AlertCircle size={16} className="text-rose-600 mt-0.5 italic" />
                                        <div>
                                            <p className="text-[11px] font-black text-rose-900 dark:text-rose-200">تجديد الاشتراك: {student.name}</p>
                                            <p className="text-[9px] text-rose-700 dark:text-rose-300 font-bold">تبقى حصتين فقط في مادة {en.subject}</p>
                                        </div>
                                    </div>
                                ));
                            })}
                            {stats.pendingInvoiceCount > 0 && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-r-4 border-r-amber-500 flex items-start gap-3">
                                    <AlertCircle size={16} className="text-amber-600 mt-0.5 italic" />
                                    <div>
                                        <p className="text-[11px] font-black text-amber-900 dark:text-amber-200">سداد الفواتير</p>
                                        <p className="text-[9px] text-amber-700 dark:text-amber-300 font-bold">لديك {stats.pendingInvoiceCount} فواتير معلقة بانتظار السداد</p>
                                    </div>
                                </div>
                            )}
                        </div>
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
        <div className={cn("p-6 bg-white dark:bg-gray-900 border shadow-sm group hover:border-primary-500 transition-all duration-300 relative overflow-hidden")}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
                    {subValue && <p className="text-[10px] font-black text-gray-400 mt-1 italic">{subValue}</p>}
                </div>
                <div className={cn("p-3 rounded-none transition-transform group-hover:scale-110 duration-500", colors[color])}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};
