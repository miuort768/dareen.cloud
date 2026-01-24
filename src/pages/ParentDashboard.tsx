import { useState, useEffect } from 'react';
import {
    Calendar,
    Wallet,
    Clock,
    GraduationCap,
    BadgeCheck,
    AlertCircle,
    MessageCircle,
    FileText,
    ArrowLeftRight,
    Receipt
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * لوحة تحكم ولي الأمر - Parent Portal v1.0
 * تصميم فاخر لمتابعة الأبناء والمدفوعات والحصص
 */
export const ParentDashboard = () => {
    const { currentUser } = useApp();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchParentData = async () => {
            try {
                setIsLoading(true);
                // 1. Get Children
                const students = await api.get<any[]>('/parents/my-children');
                setChildren(students);
                if (students.length > 0) {
                    setSelectedChild(students[0]);
                }
            } catch (error) {
                console.error('Error fetching parent data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchParentData();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            const fetchChildDetails = async () => {
                try {
                    const [sessData, invData] = await Promise.all([
                        api.get<any[]>(`/parents/child-sessions/${selectedChild.id}`),
                        api.get<any[]>(`/parents/child-invoices/${selectedChild.id}`)
                    ]);
                    setSessions(sessData);
                    setInvoices(invData);
                } catch (error) {
                    console.error('Error fetching child details:', error);
                }
            };
            fetchChildDetails();
        }
    }, [selectedChild]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        مرحباً، أ/ {currentUser?.name} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">تابع رحلة أبنائك التعليمية في منصة دارين</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">
                        <MessageCircle size={20} />
                        تحدث مع الإدارة
                    </button>
                    <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                        <Clock size={18} className="text-primary-600" />
                        {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                    </div>
                </div>
            </div>

            {/* Children Selection Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {children.map(child => (
                    <button
                        key={child.id}
                        onClick={() => setSelectedChild(child)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-3xl transition-all shrink-0 border-2",
                            selectedChild?.id === child.id
                                ? "bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/30 scale-105"
                                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-200"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg",
                            selectedChild?.id === child.id ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                        )}>
                            {child.name.charAt(0)}
                        </div>
                        <div className="text-right">
                            <p className="font-black text-sm">{child.name}</p>
                            <p className={cn("text-[10px] font-bold opacity-80", selectedChild?.id === child.id ? "text-white" : "text-gray-400")}>
                                {child.grade}
                            </p>
                        </div>
                    </button>
                ))}
                {children.length === 0 && (
                    <div className="p-8 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 w-full text-center font-bold">
                        لم يتم ربط أي طلاب بحسابك بعد. يرجى مراجعة إدارة المعهد.
                    </div>
                )}
            </div>

            {selectedChild && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Main View */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-xl transition-all duration-500">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">رصيد الحصص</p>
                                <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white">
                                    {selectedChild.sessionPrice != null ? 'نشط' : '0'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-2 text-emerald-500 font-bold text-xs">
                                    <BadgeCheck size={14} />
                                    حالة الطالب ممتازة
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-xl transition-all duration-500">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Calendar size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">حصص هذا الشهر</p>
                                <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white">{sessions.length}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 w-[70%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-xl transition-all duration-500">
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Wallet size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">إجمالي المدفوعات</p>
                                <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white">
                                    {invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                    <span className="text-sm font-bold mr-1">ج.م</span>
                                </h3>
                                <div className="flex items-center gap-1.5 mt-2 text-rose-500 font-bold text-xs">
                                    <AlertCircle size={14} />
                                    لديك {invoices.filter(i => i.status === 'unpaid').length} فواتير معلقة
                                </div>
                            </div>
                        </div>

                        {/* Recent Sessions Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <h4 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="text-primary-600" size={20} />
                                    سجل الحصص الأخيرة
                                </h4>
                                <button className="text-primary-600 font-bold text-sm hover:underline">عرض الكل</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-right text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-50 dark:border-gray-700">
                                            <th className="px-6 py-4">المادة / المعلم</th>
                                            <th className="px-6 py-4">التاريخ والوقت</th>
                                            <th className="px-6 py-4">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {sessions.slice(0, 5).map((session) => (
                                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{session.subject}</div>
                                                    <div className="text-[11px] text-gray-400 font-medium">أ/ {session.teacherName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {format(new Date(session.date), 'd MMM yyyy', { locale: ar })}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 font-medium">{session.time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                                                        session.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    )}>
                                                        {session.status === 'completed' ? 'حضر' : 'مجدولة'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {sessions.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold">لا يوجد حصص مسجلة بعد</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Invoices & Quick Actions */}
                    <div className="space-y-8">

                        {/* Financial Status Card */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-black text-xl uppercase tracking-tighter">الفواتير المستحقة</h4>
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                        <Receipt size={20} />
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">الإجمالي المطلوب</p>
                                    <h2 className="text-5xl font-black tracking-tighter">
                                        {invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                        <span className="text-lg mr-2 opacity-60">ج.م</span>
                                    </h2>
                                </div>
                                <button className="w-full py-4 bg-white text-primary-700 rounded-2xl font-black text-sm shadow-xl hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <ArrowLeftRight size={18} />
                                    طلب تفاصيل الفاتورة
                                </button>
                            </div>
                        </div>

                        {/* Recent Invoices List */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                                <h4 className="font-black text-lg text-gray-900 dark:text-white">الفواتير الأخيرة</h4>
                            </div>
                            <div className="p-4 space-y-4">
                                {invoices.slice(0, 4).map((invoice) => (
                                    <div key={invoice.id} className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                            invoice.status === 'paid' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
                                        )}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-sm text-gray-900 dark:text-white truncate">{invoice.description || 'مصاريف دراسية'}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {format(new Date(invoice.date), 'd MMMM yyyy', { locale: ar })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-sm text-gray-900 dark:text-white">{invoice.amount.toLocaleString()} ج.م</div>
                                            <div className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                                                invoice.status === 'paid' ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-rose-500 bg-rose-50 dark:bg-rose-900/20"
                                            )}>
                                                {invoice.status === 'paid' ? 'تم الدفع' : 'معلق'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {invoices.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 font-bold text-sm">لا توجد فواتير حالية</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
