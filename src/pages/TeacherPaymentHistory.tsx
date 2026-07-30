import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertTriangle, FileText, ArrowLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { type TeacherInvoice, INVOICE_STATUS } from '../types/invoice';
import { Skeleton } from '../shared/components/ui';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CURRENCY_SYMBOL } from '../config/constants';

const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 16, delay: Math.random() * 4, duration: 5 + Math.random() * 6,
}));

const statusConfig = (status: string) => {
    switch (status) {
        case INVOICE_STATUS.PAID: return { label: 'مدفوعة', icon: CheckCircle, cls: 'bg-success/[10%] text-success border-success/30' };
        case INVOICE_STATUS.PROCESSING: return { label: 'قيد المعالجة', icon: Clock, cls: 'bg-warning/[10%] text-warning border-warning/30' };
        case INVOICE_STATUS.OVERDUE: return { label: 'متأخرة', icon: AlertTriangle, cls: 'bg-error/[10%] text-error border-error/30' };
        default: return { label: 'غير مدفوعة', icon: AlertTriangle, cls: 'bg-error/[10%] text-error border-error/30' };
    }
};

const KpiStat = ({ title, value, icon: Icon, accent, unit }: {
    title: string; value: number; icon: React.ComponentType<{ size?: number }>;
    accent: 'success' | 'warning' | 'error'; unit?: string;
}) => {
    const gm = { success: 'from-success to-emerald-400', warning: 'from-warning to-amber-400', error: 'from-error to-rose-400' };
    const bm = { success: 'bg-success/[8%] text-success', warning: 'bg-warning/[8%] text-warning', error: 'bg-error/[8%] text-error' };
    return (
        <motion.div whileHover={{ scale: 1.01, y: -1 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all p-3.5">
            <div className={`absolute inset-0 opacity-[0.02] bg-gradient-to-br ${gm[accent]}`} />
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gm[accent]}`} />
            <div className="relative flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bm[accent]}`}><Icon size={14} /></div>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-muted">{title}</p>
                    <p className="text-sm font-bold text-main tabular-nums leading-none mt-0.5">{value.toFixed(3)} {unit && <span className="text-[8px] text-muted font-bold">{unit}</span>}</p>
                </div>
            </div>
        </motion.div>
    );
};

export const TeacherPaymentHistory = () => {
    useEffect(() => { document.title = 'سجل الدفعات | دارين'; }, []);
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        let cancelled = false;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await api.get<TeacherInvoice[]>('/invoices/teacher');
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

    if (loading) {
        return (
            <div className="min-h-full pb-24 overflow-x-hidden" dir="rtl">
                <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-3"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
                    <Skeleton className="h-10 rounded-xl" /><Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/[6%] to-background border-b border-border/60">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-primary/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 pb-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <button onClick={() => navigate(-1)}
                            className="w-8 h-8 rounded-xl bg-card border border-border/60 flex items-center justify-center text-muted hover:text-main hover:bg-surface transition-all" aria-label="رجوع">
                            <ArrowLeft size={14} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                            <Wallet size={16} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-main">سجل الدفعات</h1>
                            <p className="text-[8px] text-muted">سجل المدفوعات والمستحقات المالية</p>
                        </div>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center py-4">
                        <p className="text-[9px] font-bold text-muted mb-1">إجمالي المستحقات</p>
                        <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main tabular-nums tracking-tight">
                            {stats.total.toFixed(3)} <span className="text-sm text-muted font-bold me-1">{CURRENCY_SYMBOL}</span>
                        </motion.p>
                    </motion.div>
                </div>
            </div>
            {/* Main */}
            <div className="relative z-10 max-w-page mx-auto px-2 -mt-2 space-y-3 pb-16">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-2.5">
                    <KpiStat title="مدفوع" value={stats.paid} icon={CheckCircle} accent="success" unit={CURRENCY_SYMBOL} />
                    <KpiStat title="قيد المعالجة" value={stats.processing} icon={Clock} accent="warning" unit={CURRENCY_SYMBOL} />
                    <KpiStat title="غير مدفوع" value={stats.overdue + stats.unpaid} icon={AlertTriangle} accent="error" unit={CURRENCY_SYMBOL} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                        <input aria-label="بحث" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl ps-8 pe-3 py-2 text-[10px] font-bold outline-none bg-card border border-border/60 text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="تصفية"
                        className="rounded-xl px-3 py-2 text-[10px] font-bold outline-none bg-card border border-border/60 text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                        <option value="all">الكل</option>
                        <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                        <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                        <option value={INVOICE_STATUS.OVERDUE}>متأخرة</option>
                        <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
                    </select>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="hidden md:block bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-start border-collapse">
                        <thead><tr className="bg-surface border-b border-border/40">
                            <th className="px-4 py-3 text-[8px] font-bold text-muted text-start">التخصص</th>
                            <th className="px-4 py-3 text-[8px] font-bold text-muted text-center">المبلغ</th>
                            <th className="px-4 py-3 text-[8px] font-bold text-muted text-center">طريقة الدفع</th>
                            <th className="px-4 py-3 text-[8px] font-bold text-muted text-center">التاريخ</th>
                            <th className="px-4 py-3 text-[8px] font-bold text-muted text-center">الحالة</th>
                        </tr></thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                                const status = statusConfig(inv.status);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={inv.id} className="hover:bg-surface/50 transition-colors">
                                        <td className="px-4 py-3"><span className="text-[10px] font-bold text-main">{inv.specialization || '—'}</span></td>
                                        <td className="px-4 py-3 text-center font-mono text-[10px] font-bold text-main tabular-nums">{inv.amount.toFixed(3)} <span className="text-[8px] text-muted">{CURRENCY_SYMBOL}</span></td>
                                        <td className="px-4 py-3 text-center text-[8px] text-muted">{inv.paymentMethod || '—'}</td>
                                        <td className="px-4 py-3 text-center text-[8px] text-muted">{inv.date ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar }) : '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border ${status.cls}`}>
                                                <StatusIcon size={9} />{status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={5} className="py-16 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2"><FileText size={18} /></div>
                                    <p className="text-[10px] font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
                <div className="md:hidden space-y-2.5">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                        const status = statusConfig(inv.status);
                        const StatusIcon = status.icon;
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-card border border-border/60 rounded-2xl p-3.5 shadow-sm">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-primary-soft flex items-center justify-center"><Wallet size={11} className="text-primary" /></div>
                                        <div><p className="text-[10px] font-bold text-main">{inv.specialization || 'بدون تخصص'}</p></div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border ${status.cls}`}>
                                        <StatusIcon size={8} />{status.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div><p className="text-[7px] font-bold text-muted mb-0.5">المبلغ</p><span className="font-mono text-xs font-bold text-main tabular-nums">{inv.amount.toFixed(3)} <span className="text-[8px] text-muted">{CURRENCY_SYMBOL}</span></span></div>
                                        <div className="w-px h-5 bg-border/40" />
                                        <div><p className="text-[7px] font-bold text-muted mb-0.5">التاريخ</p><span className="text-[8px] text-muted">{inv.date ? format(new Date(inv.date), 'dd MMM', { locale: ar }) : '—'}</span></div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="bg-card border border-border/60 border-dashed rounded-2xl py-16 text-center">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2"><FileText size={18} /></div>
                            <p className="text-[10px] font-bold text-muted">{searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherPaymentHistory;