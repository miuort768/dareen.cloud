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

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
});

const statusConfig = (status: string) => {
    switch (status) {
        case INVOICE_STATUS.PAID: return { label: 'مدفوعة', icon: CheckCircle, bg: 'bg-success-soft', text: 'text-success' };
        case INVOICE_STATUS.PROCESSING: return { label: 'قيد المعالجة', icon: Clock, bg: 'bg-warning-soft', text: 'text-warning' };
        case INVOICE_STATUS.OVERDUE: return { label: 'متأخرة', icon: AlertTriangle, bg: 'bg-error-soft', text: 'text-error' };
        default: return { label: 'غير مدفوعة', icon: AlertTriangle, bg: 'bg-error-soft', text: 'text-error' };
    }
};

export const TeacherPaymentHistory = () => {
    useEffect(() => { document.title = 'سجل الدفعات | دارين السابعة للتعليم والتدريب'; }, []);
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
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetch();
        return () => { cancelled = true; };
    }, [currentUser?.id, currentUser?.teacherName, currentUser?.name, showNotification]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch = inv.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.specialization.toLowerCase().includes(searchTerm.toLowerCase());
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
                    <Skeleton className="h-16 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                    </div>
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden bg-background" dir="rtl">
            <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                <motion.div {...fadeUp(0)}>
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate(-1)}
                                    className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:bg-hover transition-colors"
                                    aria-label="رجوع">
                                    <ArrowLeft size={16} strokeWidth={1.5} />
                                </button>
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center shadow-elevation-1">
                                    <Wallet size={18} className="text-on-primary" />
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-main">سجل الدفعات</h1>
                                    <p className="text-micro text-muted">سجل المدفوعات والمستحقات المالية</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-main font-mono">{stats.total.toFixed(3)} د.ك</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div {...fadeUp(0.06)} className="grid grid-cols-3 gap-3">
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center">
                                <CheckCircle size={14} className="text-success" />
                            </div>
                            <span className="text-micro text-muted font-bold">مدفوع</span>
                        </div>
                        <p className="text-sm font-bold text-main font-mono">{stats.paid.toFixed(3)}</p>
                        <p className="text-[10px] text-success font-bold">د.ك</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center">
                                <Clock size={14} className="text-warning" />
                            </div>
                            <span className="text-micro text-muted font-bold">قيد المعالجة</span>
                        </div>
                        <p className="text-sm font-bold text-main font-mono">{stats.processing.toFixed(3)}</p>
                        <p className="text-[10px] text-warning font-bold">د.ك</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-error-soft flex items-center justify-center">
                                <AlertTriangle size={14} className="text-error" />
                            </div>
                            <span className="text-micro text-muted font-bold">غير مدفوع</span>
                        </div>
                        <p className="text-sm font-bold text-main font-mono">{(stats.overdue + stats.unpaid).toFixed(3)}</p>
                        <p className="text-[10px] text-error font-bold">د.ك</p>
                    </div>
                </motion.div>

                <motion.div {...fadeUp(0.1)} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input aria-label="بحث في الدفعات" placeholder="بحث..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl ps-9 pe-3 py-2.5 text-xs font-bold outline-none bg-surface border border-border text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="تصفية حسب الحالة"
                        className="rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-surface border border-border text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                        <option value="all">الكل</option>
                        <option value={INVOICE_STATUS.PAID}>مدفوعة</option>
                        <option value={INVOICE_STATUS.PROCESSING}>قيد المعالجة</option>
                        <option value={INVOICE_STATUS.OVERDUE}>متأخرة</option>
                        <option value={INVOICE_STATUS.UNPAID}>غير مدفوعة</option>
                    </select>
                </motion.div>

                <motion.div {...fadeUp(0.14)} className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
                    <table className="w-full text-start text-sm border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-4 py-3 text-micro font-bold text-muted text-start">التخصص</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">المبلغ</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">طريقة الدفع</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">التاريخ</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                                const status = statusConfig(inv.status);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={inv.id} className="hover:bg-hover transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-main">{inv.specialization || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-xs font-bold text-main">{inv.amount.toFixed(3)} د.ك</td>
                                        <td className="px-4 py-3 text-center text-micro text-muted">{inv.paymentMethod || '—'}</td>
                                        <td className="px-4 py-3 text-center text-micro text-muted">
                                            {inv.date ? format(new Date(inv.date), 'dd MMM yyyy', { locale: ar }) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-micro font-bold ${status.bg} ${status.text}`}>
                                                <StatusIcon size={11} />
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                            <FileText size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-muted">
                                            {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div {...fadeUp(0.14)} className="md:hidden space-y-3">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => {
                        const status = statusConfig(inv.status);
                        const StatusIcon = status.icon;
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 * i, duration: 0.35 }}
                                className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center">
                                            <Wallet size={13} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-main">{inv.specialization || 'بدون تخصص'}</p>
                                            <p className="text-[10px] text-muted">{inv.paymentMethod || '—'}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${status.bg} ${status.text}`}>
                                        <StatusIcon size={9} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-[10px] text-muted mb-0.5">المبلغ</p>
                                            <span className="font-mono text-sm font-bold text-main">{inv.amount.toFixed(3)} د.ك</span>
                                        </div>
                                        <div className="w-px h-6 bg-border" />
                                        <div>
                                            <p className="text-[10px] text-muted mb-0.5">التاريخ</p>
                                            <span className="text-[10px] text-muted">{inv.date ? format(new Date(inv.date), 'dd MMM', { locale: ar }) : '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="bg-card border border-border border-dashed rounded-2xl py-16 text-center">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                <FileText size={18} />
                            </div>
                            <p className="text-xs font-bold text-muted">
                                {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد دفعات بعد'}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default TeacherPaymentHistory;
