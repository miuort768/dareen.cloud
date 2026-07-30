import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, CheckCircle, Clock, AlertCircle, FileText, TrendingUp, ArrowDownRight, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser } from '../context/AppContext';
import { Skeleton } from '../shared/components/ui';
import { CURRENCY_SYMBOL } from '../config/constants';

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
    paid: { label: 'مدفوعة', icon: CheckCircle, cls: 'bg-success/[10%] text-success border-success/30' },
    pending: { label: 'معلقة', icon: Clock, cls: 'bg-warning/[10%] text-warning border-warning/30' },
    overdue: { label: 'متأخرة', icon: AlertCircle, cls: 'bg-error/[10%] text-error border-error/30' },
} as const;

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 16, delay: Math.random() * 4, duration: 5 + Math.random() * 6,
}));

const KpiStat = ({ title, value, count, icon: Icon, accent }: {
    title: string; value: number; count: number; icon: React.ComponentType<{ size?: number }>;
    accent: 'success' | 'warning' | 'error';
}) => {
    const gradientMap = { success: 'from-success to-emerald-400', warning: 'from-warning to-amber-400', error: 'from-error to-rose-400' };
    const bgMap = { success: 'bg-success/[8%] text-success', warning: 'bg-warning/[8%] text-warning', error: 'bg-error/[8%] text-error' };
    return (
        <motion.div whileHover={{ scale: 1.01, y: -1 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all p-3.5">
            <div className={`absolute inset-0 opacity-[0.02] bg-gradient-to-br ${gradientMap[accent]}`} />
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientMap[accent]}`} />
            <div className="relative flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgMap[accent]}`}>
                    <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-muted">{title}</p>
                    <p className="text-lg font-bold text-main tabular-nums leading-none mt-0.5">{value.toLocaleString()} <span className="text-[9px] text-muted font-bold">{CURRENCY_SYMBOL}</span></p>
                    <p className="text-[8px] font-bold text-muted mt-1">{count} فاتورة</p>
                </div>
            </div>
        </motion.div>
    );
};

export const StudentInvoices = () => {
    useEffect(() => { document.title = 'فواتيري | دارين'; }, []);
    const currentUser = useCurrentUser();
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    useEffect(() => {
        let cancelled = false;
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const data = await api.get<StudentInvoice[]>('/studentInvoices');
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
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-success/10 via-success/[6%] to-background border-b border-border/60">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div key={p.id}
                            className="absolute rounded-full bg-success/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-success text-on-success flex items-center justify-center shadow-sm">
                                <Receipt size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main">فواتيري</h1>
                                <p className="text-[8px] text-muted">متابعة الرسوم والمدفوعات</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[8px] font-bold">
                            <FileText size={10} className="text-primary" />
                            {invoices.length} فاتورة
                        </div>
                    </div>
                    {/* Hero total */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-center py-4">
                        <p className="text-[9px] font-bold text-muted mb-1">إجمالي الفواتير</p>
                        <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main tabular-nums tracking-tight"
                        >
                            {stats.total.toLocaleString()}
                            <span className="text-sm text-muted font-bold me-1">{CURRENCY_SYMBOL}</span>
                        </motion.p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                                <CheckCircle size={10} className="text-success" />
                                <span className="text-[8px] font-bold text-muted">مدفوعة: <span className="text-main">{stats.paidCount}</span></span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <Clock size={10} className="text-warning" />
                                <span className="text-[8px] font-bold text-muted">معلقة: <span className="text-main">{stats.pendingCount}</span></span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <AlertCircle size={10} className="text-error" />
                                <span className="text-[8px] font-bold text-muted">متأخرة: <span className="text-main">{stats.overdueCount}</span></span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 max-w-page mx-auto px-2 -mt-2 space-y-3 pb-16">
                {/* KPI Stats */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="grid grid-cols-3 gap-2.5">
                    <KpiStat title="مدفوعة" value={stats.paid} count={stats.paidCount} icon={CheckCircle} accent="success" />
                    <KpiStat title="معلقة" value={stats.pending} count={stats.pendingCount} icon={Clock} accent="warning" />
                    <KpiStat title="متأخرة" value={stats.overdue} count={stats.overdueCount} icon={AlertCircle} accent="error" />
                </motion.div>

                {/* Search & Filter */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                        <input aria-label="بحث في الفواتير" placeholder="بحث بالبيان..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl ps-8 pe-3 py-2.5 text-[10px] font-bold outline-none bg-card border border-border/60 text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                        aria-label="تصفية حسب الحالة"
                        className="rounded-xl px-3 py-2.5 text-[10px] font-bold outline-none bg-card border border-border/60 text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                        <option value="all">الكل</option>
                        <option value="paid">مدفوعة</option>
                        <option value="pending">معلقة</option>
                        <option value="overdue">متأخرة</option>
                    </select>
                </motion.div>

                {/* Desktop Table */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="hidden md:block bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border/40">
                                {['البيان', 'المبلغ', 'التاريخ', 'الاستحقاق', 'الحالة'].map(h => (
                                    <th key={h} className={`px-4 py-3 text-[8px] font-bold text-muted ${h === 'البيان' ? 'text-start' : 'text-center'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                                const status = statusConfig[inv.status];
                                return (
                                    <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-surface/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-bold text-main">{inv.description}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono text-[10px] font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-[8px] text-muted">{CURRENCY_SYMBOL}</span></span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-[8px] text-muted">{inv.date}</td>
                                        <td className="px-4 py-3 text-center text-[8px] text-muted">{inv.dueDate}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border ${status.cls}`}>
                                                <status.icon size={10} />
                                                {status.label}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                            <FileText size={18} />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted">
                                            {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2.5">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                        const status = statusConfig[inv.status];
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-card border border-border/60 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center justify-between mb-2.5">
                                    <p className="text-[10px] font-bold text-main">{inv.description}</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border ${status.cls}`}>
                                        <status.icon size={9} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-[7px] font-bold text-muted mb-0.5">المبلغ</p>
                                            <span className="font-mono text-xs font-bold text-main tabular-nums">{inv.amount.toLocaleString()} <span className="text-[8px] text-muted">{CURRENCY_SYMBOL}</span></span>
                                        </div>
                                        <div className="w-px h-5 bg-border/40" />
                                        <div>
                                            <p className="text-[7px] font-bold text-muted mb-0.5">الاستحقاق</p>
                                            <span className="text-[8px] text-muted">{inv.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="bg-card border border-border/60 border-dashed rounded-2xl py-16 text-center">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                <FileText size={18} />
                            </div>
                            <p className="text-[10px] font-bold text-muted">
                                {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentInvoices;