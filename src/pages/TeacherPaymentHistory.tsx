import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertTriangle, FileText, Wallet, BarChart3, Filter, Calendar, DollarSign } from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification, useLogout } from '../context/AppContext';
import { type TeacherInvoice, INVOICE_STATUS } from '../types/invoice';
import { Skeleton } from '../shared/components/ui';
import { TeacherDashboardHeader } from './TeacherDashboardHeader';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CURRENCY_SYMBOL } from '../config/constants';
import { cn } from '../lib/utils';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

const statusConfig = (status: string) => {
    switch (status) {
        case INVOICE_STATUS.PAID: return { label: 'مدفوعة', icon: CheckCircle, cls: 'bg-success/10 text-success border-success/20' };
        case INVOICE_STATUS.PROCESSING: return { label: 'قيد المعالجة', icon: Clock, cls: 'bg-warning/10 text-warning border-warning/20' };
        case INVOICE_STATUS.OVERDUE: return { label: 'متأخرة', icon: AlertTriangle, cls: 'bg-error/10 text-error border-error/20' };
        default: return { label: 'غير مدفوعة', icon: AlertTriangle, cls: 'bg-error/10 text-error border-error/20' };
    }
};

export const TeacherPaymentHistory = () => {
    useEffect(() => { document.title = 'سجل الدفعات | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const showNotification = useShowNotification();
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await api.get<TeacherInvoice[]>('/invoices/me/teacher');
                if (cancelled) return;
                const all = Array.isArray(data) ? data : ((data as { data?: TeacherInvoice[] }).data || []);
                const teacherName = currentUser?.teacherName || currentUser?.name || '';
                const mine = all.filter(inv =>
                    (inv.teacherId && inv.teacherId === currentUser?.id) ||
                    (inv.teacher && inv.teacher.trim().toLowerCase() === teacherName.trim().toLowerCase())
                );
                setInvoices(mine.map(inv => ({ ...inv, id: String(inv.id) })));
            } catch (error) {
                console.error('Error fetching invoices:', error);
                if (!cancelled) showNotification('فشل تحميل سجل الدفعات', 'error');
            } finally { if (!cancelled) setLoading(false); }
        };
        fetch();
        return () => { cancelled = true; };
    }, [currentUser?.id, currentUser?.teacherName, currentUser?.name, showNotification]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch = inv.teacher.toLowerCase().includes(searchTerm.toLowerCase()) || inv.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const result = { total: 0, paid: 0, processing: 0, overdue: 0, unpaid: 0 };
        invoices.forEach(inv => {
            result.total += inv.amount;
            if (inv.status === INVOICE_STATUS.PAID) result.paid += inv.amount;
            else if (inv.status === INVOICE_STATUS.PROCESSING) result.processing += inv.amount;
            else if (inv.status === INVOICE_STATUS.OVERDUE) result.overdue += inv.amount;
            else result.unpaid += inv.amount;
        });
        return result;
    }, [invoices]);

    const paidCount = useMemo(() => invoices.filter(i => i.status === INVOICE_STATUS.PAID).length, [invoices]);
    const pendingCount = useMemo(() => invoices.filter(i => i.status === INVOICE_STATUS.PROCESSING).length, [invoices]);
    const overdueCount = useMemo(() => invoices.filter(i => i.status === INVOICE_STATUS.OVERDUE || i.status === INVOICE_STATUS.UNPAID).length, [invoices]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الفواتير', value: invoices.length, icon: DollarSign, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'مدفوعة', value: paidCount, icon: CheckCircle, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'قيد المعالجة', value: pendingCount, icon: Clock, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'متأخرة', value: overdueCount, icon: AlertTriangle, gradient: 'from-error/20 to-error/5', iconBg: 'bg-error/10 text-error', accent: 'bg-error' },
    ], [invoices.length, paidCount, pendingCount, overdueCount]);

    const fabActions = useMemo(() => [
        { icon: BarChart3, label: 'إحصائيات', onClick: () => document.querySelector('[data-kpi]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: Filter, label: 'تصفية', onClick: () => document.querySelector('[data-search]')?.scrollIntoView({ behavior: 'smooth' }) },
    ], []);

    if (loading) {
        return (
            <div className="min-h-full pb-24 overflow-x-hidden" dir="rtl">
                {currentUser?.role === 'teacher' && (
                    <div className="hidden md:block">
                        <TeacherDashboardHeader logout={logout} />
                    </div>
                )}
                <div className="max-w-page mx-auto px-2 pt-4 space-y-4">
                    <Skeleton className="h-36 rounded-2xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            {currentUser?.role === 'teacher' && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Wallet className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المالية</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">سجل الدفعات</h1>
                            <p className="text-white/70 text-sm">سجل المدفوعات والمستحقات المالية</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white tabular-nums">{stats.total.toFixed(3)}</p>
                                <p className="text-white/50 text-[10px]">{CURRENCY_SYMBOL}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الفاتورة</p>
                                <p className="text-lg font-bold text-white">{paidCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} data-kpi>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main tabular-nums">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-search>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input aria-label="بحث" placeholder="بحث بالتخصص..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                        </div>
                        <div className="relative">
                            <Filter className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                aria-label="تصفية"
                                className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                                <option value="all">جميع الحالات</option>
                                <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                                <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                                <option value={INVOICE_STATUS.OVERDUE}>متأخرة</option>
                                <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="hidden md:block bg-card border border-border/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="bg-surface/50 border-b border-border/30">
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted text-start">التخصص</th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted text-center">المبلغ</th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted text-center">طريقة الدفع</th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted text-center">التاريخ</th>
                                    <th className="px-5 py-3.5 text-[10px] font-bold text-muted text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                                    const status = statusConfig(inv.status);
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                                            <td className="px-5 py-3.5"><span className="text-xs font-bold text-main">{inv.specialization || '—'}</span></td>
                                            <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-main tabular-nums">{inv.amount.toFixed(3)} <span className="text-[9px] text-muted">{CURRENCY_SYMBOL}</span></td>
                                            <td className="px-5 py-3.5 text-center text-[10px] text-muted">{inv.paymentMethod || '—'}</td>
                                            <td className="px-5 py-3.5 text-center text-[10px] text-muted">{inv.date ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar }) : '—'}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${status.cls}`}>
                                                    <StatusIcon size={10} />{status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                                            <p className="text-xs font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                            const status = statusConfig(inv.status);
                            const StatusIcon = status.icon;
                            return (
                                <motion.div key={inv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                                <Wallet size={13} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-main">{inv.specialization || 'بدون تخصص'}</p>
                                                <p className="text-[10px] text-muted">{inv.date ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar }) : '—'}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${status.cls}`}>
                                            <StatusIcon size={10} />{status.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-border/20">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={12} className="text-muted" />
                                            <span className="font-mono text-sm font-bold text-main tabular-nums">{inv.amount.toFixed(3)} <span className="text-[9px] text-muted">{CURRENCY_SYMBOL}</span></span>
                                        </div>
                                        <span className="text-[10px] text-muted">{inv.paymentMethod || '—'}</span>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="bg-card border border-dashed border-border/30 rounded-2xl py-16 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                                <p className="text-xs font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Wallet size={22} />
                </motion.button>
            </div>
        </div>
    );
};

export default TeacherPaymentHistory;
