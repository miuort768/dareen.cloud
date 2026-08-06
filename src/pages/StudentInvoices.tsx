import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Receipt, CheckCircle, Clock, AlertCircle, FileText, TrendingUp, ArrowDownRight, Printer, DollarSign } from 'lucide-react';
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
    paid: { label: 'مدفوعة', icon: CheckCircle, cls: 'bg-success/10 text-success border-success/30' },
    pending: { label: 'معلقة', icon: Clock, cls: 'bg-warning/10 text-warning border-warning/30' },
    overdue: { label: 'متأخرة', icon: AlertCircle, cls: 'bg-error/10 text-error border-error/30' },
} as const;

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const StudentInvoices = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `فواتيري | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const data = await api.get<StudentInvoice[]>('/invoices/me/student');
                const all = Array.isArray(data) ? data : [];
                const mine = all.filter(inv => inv.studentId === currentUser?.id);
                if (!cancelled) setInvoices(mine);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (currentUser?.id) fetchInvoices();
        return () => { cancelled = true; };
    }, [currentUser?.id]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch = inv.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        total: invoices.reduce((sum, i) => sum + i.amount, 0),
        paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
        pending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
        overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        pendingCount: invoices.filter(i => i.status === 'pending').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }), [invoices]);

    if (loading) {
        return (
            <div className="min-h-full pb-24 overflow-x-hidden" dir="rtl">
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-28 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success to-success-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Receipt className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المالية</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">فواتيري</h1>
                            <p className="text-white/70 text-sm">متابعة الرسوم والمدفوعات الدراسية</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white tabular-nums">{stats.total.toLocaleString()} <span className="text-sm text-white/60">{CURRENCY_SYMBOL}</span></p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الفواتير</p>
                                <p className="text-lg font-bold text-white">{invoices.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {([
                            { label: 'مدفوعة', value: stats.paid, count: stats.paidCount, icon: CheckCircle, accent: 'success' as const },
                            { label: 'معلقة', value: stats.pending, count: stats.pendingCount, icon: Clock, accent: 'warning' as const },
                            { label: 'متأخرة', value: stats.overdue, count: stats.overdueCount, icon: AlertCircle, accent: 'error' as const },
                        ]).map((kpi, i) => {
                            const gradientMap = { success: 'from-success/20 to-success/5', warning: 'from-warning/20 to-warning/5', error: 'from-error/20 to-error/5' };
                            const iconBgMap = { success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning', error: 'bg-error/10 text-error' };
                            const barMap = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error' };
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", gradientMap[kpi.accent])}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", iconBgMap[kpi.accent])}><kpi.icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", barMap[kpi.accent])} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-lg font-bold text-main tabular-nums">{kpi.value.toLocaleString()} <span className="text-xs text-muted">{CURRENCY_SYMBOL}</span></p>
                                    <p className="text-[10px] text-muted mt-1">{kpi.count} فاتورة</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex gap-3 items-center mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input aria-label="بحث في الفواتير" placeholder="بحث بالبيان..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl ps-9 pe-3.5 py-2.5 text-xs font-bold outline-none bg-card border border-border/30 text-main placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-focus/30 transition-all" />
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            aria-label="تصفية حسب الحالة"
                            className="rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none bg-card border border-border/30 text-main focus:border-primary focus:ring-2 focus:ring-focus/30 transition-all appearance-none cursor-pointer">
                            <option value="all">الكل</option>
                            <option value="paid">مدفوعة</option>
                            <option value="pending">معلقة</option>
                            <option value="overdue">متأخرة</option>
                        </select>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="hidden md:block bg-card border border-border/30 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border/30">
                                {['البيان', 'المبلغ', 'التاريخ', 'الاستحقاق', 'الحالة'].map(h => (
                                    <th key={h} className={`px-4 py-3 text-xs font-bold text-muted ${h === 'البيان' ? 'text-start' : 'text-center'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                                const status = statusConfig[inv.status];
                                return (
                                    <motion.tr key={inv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-surface/50 transition-colors">
                                        <td className="px-4 py-3"><span className="text-sm font-bold text-main">{inv.description}</span></td>
                                        <td className="px-4 py-3 text-center"><span className="font-mono text-sm font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-xs text-muted">{CURRENCY_SYMBOL}</span></span></td>
                                        <td className="px-4 py-3 text-center text-xs text-muted">{inv.date}</td>
                                        <td className="px-4 py-3 text-center text-xs text-muted">{inv.dueDate}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${status.cls}`}>
                                                <status.icon size={12} />
                                                {status.label}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
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
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-bold text-main">{inv.description}</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${status.cls}`}>
                                        <status.icon size={11} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-muted mb-0.5">المبلغ</p>
                                            <span className="font-mono text-sm font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-xs text-muted">{CURRENCY_SYMBOL}</span></span>
                                        </div>
                                        <div className="w-px h-8 bg-border/30" />
                                        <div>
                                            <p className="text-xs text-muted mb-0.5">الاستحقاق</p>
                                            <span className="text-xs text-muted">{inv.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="bg-card border border-border/30 border-dashed rounded-2xl py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                            <p className="text-sm font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    <motion.div key="print" initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.3, y: 20 }} className="flex items-center gap-2">
                        <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">طباعة</span>
                        <button onClick={() => window.print()}
                            className="w-10 h-10 rounded-full bg-success text-on-primary shadow-lg hover:shadow-xl hover:bg-success-hover transition-all flex items-center justify-center">
                            <Printer size={18} />
                        </button>
                    </motion.div>
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-success")}>
                    <DollarSign size={22} />
                </motion.button>
            </div>
        </div>
    );
};

export default StudentInvoices;
