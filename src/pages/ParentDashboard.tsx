import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Calendar,
    Wallet,
    AlertCircle,
    MessageCircle,
    FileText,
    ArrowLeftRight,
    Receipt,
    Activity,
    Bell,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * لوحة تحكم ولي الأمر المتطورة - v2.0
 * تصميم متطابق مع لوحة المعلمات بأسلوب "نظرة عامة" فاخرة
 */
export const ParentDashboard = () => {
    const { currentUser, academyName } = useApp();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
    const [sessions, setSessions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                // Fetch basic data
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);

                // Fetch data for all children to create the "Overview"
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

    // Filtered data based on selection
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

    // Aggregate Stats
    const stats = useMemo(() => {
        const pendingInvoices = displayData.invoices.filter(i => i.status === 'unpaid');
        const totalPaid = displayData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
        const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

        return {
            childCount: displayData.students.length,
            sessionCount: displayData.sessions.length,
            pendingInvoiceCount: pendingInvoices.length,
            totalPaid,
            totalPending,
            upcomingSessions: displayData.sessions.filter(s => s.status !== 'completed').length
        };
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

            {/* Header: Similar to Teacher Dashboard */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-8 -mx-4 lg:-mx-8 -mt-8 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center text-white shadow-xl shadow-primary-600/20">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">بوابة ولي الأمر</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-bold">أهلاً بك، أ/ {currentUser?.name} في {academyName}</p>
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

            {/* Stats Grid: Matched with Teacher Dashboard Aesthetic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={LayoutDashboard}
                    label="رصيد الحصص"
                    value={selectedChildId === 'all' ? 'متابعة' : (displayData.students[0]?.sessionPrice ? 'نشط' : '0')}
                    color="blue"
                />
                <StatCard
                    icon={Calendar}
                    label="حصص الشهر"
                    value={stats.sessionCount}
                    color="amber"
                    subValue={`${stats.upcomingSessions} قادمة`}
                />
                <StatCard
                    icon={Wallet}
                    label="مدفوعاتك (ج.م)"
                    value={stats.totalPaid.toLocaleString()}
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

            {/* General System Notes / Alerts */}
            <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-6 border border-blue-200 dark:from-blue-900/20 dark:to-primary-900/20 dark:border-blue-900/30">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-none dark:bg-blue-900/40">
                        <Bell className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-blue-900 dark:text-blue-200 mb-2 font-black uppercase text-sm tracking-widest">تنبيهات المتابعة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.pendingInvoiceCount > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="text-rose-600" size={18} />
                                    <span className="text-blue-800 dark:text-blue-300 font-bold italic">يوجد فواتير مستحقة الدفع</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="text-primary-600" size={18} />
                                <span className="text-blue-800 dark:text-blue-300 font-bold uppercase tracking-tighter">مستوى الأبناء: مستقر وناجح</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1 & 2: Main Activity */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Sessions Table - Structured exactly like teacher reports */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="text-primary-600" size={18} />
                                سجل المتابعة الدراسية
                            </h4>
                            <MessageCircle size={18} className="text-gray-300" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-6 py-4">الابن / المادة</th>
                                        <th className="px-6 py-4">التوقيت</th>
                                        <th className="px-6 py-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {displayData.sessions.slice(0, 8).map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{session.studentName}</div>
                                                <div className="text-[10px] text-gray-400 font-black">{session.subject}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {format(new Date(session.date), 'eeee, d MMM', { locale: ar })}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{session.time}</div>
                                            </td>
                                            <td className="px-6 py-4">
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
                                    {displayData.sessions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">لا توجد بيانات متاحة حالياً</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart Substitute: Progress Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-[250px]">
                            <div>
                                <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">كشف الحساب</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-dashed border-gray-200 dark:border-gray-800 pb-2">
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">إجمالي الرصيد</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats.totalPaid.toLocaleString()} ج.م</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-dashed border-gray-200 dark:border-gray-800 pb-2">
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">فواتير معلقة</span>
                                        <span className="text-xl font-black text-rose-600">{stats.totalPending.toLocaleString()} ج.م</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                                طلب ملف مالي شامل
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-[250px]">
                            <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4 italic">تحليل النشاط</h4>
                            <div className="flex items-center justify-center h-32">
                                <Activity size={64} className="text-primary-100 dark:text-primary-900/20" />
                            </div>
                            <p className="text-center text-xs text-gray-400 font-bold px-4 mt-2 leading-relaxed">
                                يتم حالياً معالجة بيانات الأبناء لتقديم رسم بياني تفصيلي لمستوى الحضور الشهري
                            </p>
                        </div>
                    </div>
                </div>

                {/* Column 3: Requests & Tasks */}
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
                            المصروفات الأخيرة
                            <FileText size={16} />
                        </h4>
                        <div className="space-y-4">
                            {displayData.invoices.slice(0, 4).map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-none",
                                            inv.status === 'paid' ? "bg-emerald-500" : "bg-rose-500"
                                        )}></div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{inv.amount.toLocaleString()} ج.م</p>
                                            <p className="text-[10px] text-gray-400 font-bold italic">{format(new Date(inv.date), 'd MMM', { locale: ar })}</p>
                                        </div>
                                    </div>
                                    <ArrowLeftRight size={14} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            ))}
                            {displayData.invoices.length === 0 && (
                                <p className="text-center py-4 text-xs text-gray-400 font-black italic">لا يوجد فواتير مسجلة</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Internal Stat Card Component
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
