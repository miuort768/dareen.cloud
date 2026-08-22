import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Receipt, CheckCircle, Clock, AlertCircle, FileText, Printer, X } from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useAcademyName } from '../context/AppContext';
import { Skeleton } from '../shared/components/ui';
import { CURRENCY_SYMBOL } from '../config/constants';
import { cn } from '../lib/utils';

interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    currency?: string;
    items?: { description: string; date?: string; amount: number }[];
}

const statusConfig = {
    paid: { label: 'مدفوعة', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    pending: { label: 'معلقة', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    overdue: { label: 'متأخرة', icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
} as const;

export const StudentInvoices = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `فواتيري | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    const { data: invoices = [], isLoading: loading } = useQuery<StudentInvoice[]>({
        queryKey: ['student-invoices'],
        queryFn: async () => {
            const data = await api.get<StudentInvoice[]>('/invoices/me/student');
            const all = Array.isArray(data) ? data : [];
            return all.filter(inv => inv.studentId === currentUser?.id);
        },
        enabled: !!currentUser?.id,
    });

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch = inv.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, filterStatus]);

    const studentCurrency = invoices.length > 0 && invoices[0].currency ? invoices[0].currency : CURRENCY_SYMBOL;

    const stats = useMemo(() => ({
        total: invoices.reduce((sum, i) => sum + i.amount, 0),
        paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
        pending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
        overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        pendingCount: invoices.filter(i => i.status === 'pending').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }), [invoices]);

    const kpiCards = useMemo(() => [
        { label: 'مدفوعة', value: stats.paid, count: stats.paidCount, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
        { label: 'معلقة', value: stats.pending, count: stats.pendingCount, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'متأخرة', value: stats.overdue, count: stats.overdueCount, icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
    ], [stats]);

    if (loading) {
        return (
            <div className="min-h-full pb-8" dir="rtl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-4">
                    <div className="flex items-center gap-3"><Skeleton className="w-11 h-11 rounded-xl" /><div className="space-y-2"><Skeleton className="h-5 w-32 rounded-lg" /><Skeleton className="h-3 w-48 rounded-lg" /></div></div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                    </div>
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-8" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Receipt size={20} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-main">فواتيري</h1>
                                <p className="text-xs text-muted mt-0.5">متابعة الرسوم والمدفوعات الدراسية</p>
                            </div>
                        </div>
                        <button onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-muted hover:bg-hover hover:border-primary/20 transition-all duration-200 active:scale-[0.98]">
                            <Printer size={14} />
                            <span className="hidden sm:inline">طباعة</span>
                        </button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}
                                    whileHover={{ y: -2 }} className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                                            <Icon size={16} className={kpi.color} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-main tabular-nums">{kpi.value.toLocaleString()} <span className="text-xs text-muted">{studentCurrency}</span></p>
                                    <p className="text-[11px] text-muted mt-1">{kpi.label} · {kpi.count} فاتورة</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
                            <input aria-label="بحث في الفواتير" placeholder="بحث بالبيان..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl ps-10 pe-4 py-3 text-xs font-bold outline-none bg-card border border-border text-main placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200" />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors" aria-label="مسح البحث">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            aria-label="تصفية حسب الحالة"
                            className="rounded-xl px-4 py-3 text-xs font-bold outline-none bg-card border border-border text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer">
                            <option value="all">الكل</option>
                            <option value="paid">مدفوعة</option>
                            <option value="pending">معلقة</option>
                            <option value="overdue">متأخرة</option>
                        </select>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                {['البيان', 'المبلغ', 'التاريخ', 'الاستحقاق', 'الحالة'].map(h => (
                                    <th key={h} className={`px-4 py-3 text-[11px] font-bold text-muted ${h === 'البيان' ? 'text-start' : 'text-center'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                                const status = statusConfig[inv.status];
                                const Icon = status.icon;
                                return (
                                    <motion.tr key={inv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-surface/50 transition-colors">
                                        <td className="px-4 py-3"><span className="text-sm font-bold text-main">{inv.description}</span></td>
                                        <td className="px-4 py-3 text-center"><span className="font-mono text-sm font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-xs text-muted">{inv.currency || CURRENCY_SYMBOL}</span></span></td>
                                        <td className="px-4 py-3 text-center text-xs text-muted">{inv.date}</td>
                                        <td className="px-4 py-3 text-center text-xs text-muted">{inv.dueDate}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold", status.bg, status.color)}>
                                                <Icon size={12} />
                                                {status.label}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                                        <p className="text-sm font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <div className="md:hidden space-y-3">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                        const status = statusConfig[inv.status];
                        const Icon = status.icon;
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-bold text-main truncate">{inv.description}</p>
                                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0", status.bg, status.color)}>
                                        <Icon size={11} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] text-muted mb-0.5">المبلغ</p>
                                        <span className="font-mono text-sm font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-xs text-muted">{inv.currency || CURRENCY_SYMBOL}</span></span>
                                    </div>
                                    <div className="w-px h-8 bg-border" />
                                    <div>
                                        <p className="text-[10px] text-muted mb-0.5">الاستحقاق</p>
                                        <span className="text-xs text-muted">{inv.dueDate}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="bg-card border border-dashed border-border rounded-xl py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                            <p className="text-sm font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentInvoices;
