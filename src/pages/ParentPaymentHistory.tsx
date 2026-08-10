import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertCircle, FileText, ArrowLeft, Wallet, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification, useLogout, useIsLoading } from '../context/AppContext';
import { Skeleton } from '../shared/components/ui';
import { ParentDashboardHeader } from './parent-dashboard/ParentDashboardHeader';
import { CURRENCY_SYMBOL } from '../config/constants';
import type { Student } from '../types';

interface StudentInvoiceData {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    currency?: string;
    notes?: string;
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 18,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
}));

const statusConfig = {
    paid: { label: 'مدفوعة', icon: CheckCircle, textCls: 'text-success', bgCls: 'bg-success/10 dark:bg-success/15', borderCls: 'border-success/30 dark:border-success/20' },
    pending: { label: 'معلقة', icon: Clock, textCls: 'text-warning', bgCls: 'bg-warning/10 dark:bg-warning/15', borderCls: 'border-warning/30 dark:border-warning/20' },
    overdue: { label: 'متأخرة', icon: AlertCircle, textCls: 'text-error', bgCls: 'bg-error/10 dark:bg-error/15', borderCls: 'border-error/30 dark:border-error/20' },
} as const;

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue';

const STATUS_PILLS: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'paid', label: 'مدفوعة' },
    { key: 'pending', label: 'معلقة' },
    { key: 'overdue', label: 'متأخرة' },
];

const HeroSkeleton = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-success/10 via-success/[6%] to-background dark:from-surface dark:via-hover dark:to-surface border-b border-border/60 dark:border-white/[0.06]">
        <div className="max-w-page mx-auto px-2.5 sm:px-4 pt-4 pb-8">
            <div className="flex items-center gap-2.5 mb-6">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24 rounded-lg" />
                    <Skeleton className="h-2 w-32 rounded-lg" />
                </div>
            </div>
            <div className="text-center space-y-2 py-4">
                <Skeleton className="h-2.5 w-20 mx-auto rounded-lg" />
                <Skeleton className="h-9 w-40 mx-auto rounded-xl" />
                <div className="flex justify-center gap-4 mt-3">
                    <Skeleton className="h-3 w-16 rounded-lg" />
                    <Skeleton className="h-3 w-16 rounded-lg" />
                    <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

const KpiSkeleton = () => (
    <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl shadow-sm p-3.5">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-2 w-10 rounded-lg" />
                        <Skeleton className="h-3.5 w-16 rounded-lg" />
                        <Skeleton className="h-2 w-12 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ListSkeleton = () => (
    <div className="space-y-2.5">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-3 w-28 rounded-lg" />
                    <Skeleton className="h-5 w-14 rounded-lg" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="h-2.5 w-20 rounded-lg" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <Skeleton className="h-2.5 w-16 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
);

export const ParentPaymentHistory = () => {
    useEffect(() => { document.title = 'سجل الدفعات | ولي الأمر'; }, []);
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const showNotification = useShowNotification();
    const authLoading = useIsLoading();
    const [invoices, setInvoices] = useState<StudentInvoiceData[]>([]);
    const [children, setChildren] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterChild, setFilterChild] = useState<string>('all');

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [studentsData, invData] = await Promise.all([
                    api.get<Student[]>('/parents/my-children'),
                    api.get<StudentInvoiceData[]>('/invoices/me/student'),
                ]);
                if (cancelled) return;
                const students = Array.isArray(studentsData) ? studentsData : [];
                const allInv = Array.isArray(invData) ? invData : [];
                setChildren(students);
                const childIds = new Set(students.map(s => s.id));
                setInvoices(allInv.filter(inv => childIds.has(inv.studentId)));
            } catch (error) {
                console.error('Error fetching payment data:', error);
                if (!cancelled) showNotification('فشل تحميل سجل الدفعات', 'error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [showNotification]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const matchesSearch =
            inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        const matchesChild = filterChild === 'all' || inv.studentId === filterChild;
        return matchesSearch && matchesStatus && matchesChild;
    }), [invoices, searchTerm, filterStatus, filterChild]);

    const stats = useMemo(() => ({
        total: invoices.reduce((sum, i) => sum + i.amount, 0),
        paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
        pending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
        overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        pendingCount: invoices.filter(i => i.status === 'pending').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }), [invoices]);

    const isEmpty = invoices.length === 0;
    const noResults = filteredInvoices.length === 0 && !isEmpty;

    if (authLoading || loading) {
        return (
            <div className="min-h-full pb-24 overflow-x-hidden" dir="rtl">
                <div className="hidden md:block">
                    <ParentDashboardHeader logout={logout} />
                </div>
                <HeroSkeleton />
                <div className="max-w-page mx-auto px-2.5 sm:px-4 pt-4 space-y-4">
                    <KpiSkeleton />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <ListSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-surface dark:bg-surface" dir="rtl">
            <div className="hidden md:block">
                <ParentDashboardHeader logout={logout} />
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-success/10 via-success/[6%] to-background dark:from-surface dark:via-hover dark:to-surface border-b border-border/60 dark:border-white/[0.06]">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div
                            key={p.id}
                            className="absolute rounded-full bg-success/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -30, 0], opacity: [0.1, 0.45, 0.1] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2.5 sm:px-4 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-success text-on-success flex items-center justify-center shadow-sm">
                                <Wallet size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main dark:text-main">سجل الدفعات</h1>
                                <p className="text-[8px] text-muted dark:text-main/40">فواتير أبنائك ومدفوعاتك</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-8 h-8 rounded-xl bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.06] flex items-center justify-center text-muted dark:text-main/40 hover:text-main dark:hover:text-white hover:bg-surface dark:hover:bg-white/[0.1] transition-all"
                            aria-label="رجوع"
                        >
                            <ArrowLeft size={14} />
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-4"
                    >
                        <p className="text-[9px] font-bold text-muted dark:text-main/40 mb-1">إجمالي الفواتير</p>
                        <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main dark:text-main tabular-nums tracking-tight"
                        >
                            {stats.total.toLocaleString()}{' '}
                            <span className="text-sm text-muted dark:text-main/40 font-bold me-1">{CURRENCY_SYMBOL}</span>
                        </motion.p>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <div className="flex items-center gap-1">
                                <CheckCircle size={10} className="text-success" />
                                <span className="text-[8px] font-bold text-muted dark:text-main/40">
                                    مدفوعة: <span className="text-main dark:text-main">{stats.paidCount}</span>
                                </span>
                            </div>
                            <div className="w-px h-3 bg-border/60 dark:bg-white/10" />
                            <div className="flex items-center gap-1">
                                <Clock size={10} className="text-warning" />
                                <span className="text-[8px] font-bold text-muted dark:text-main/40">
                                    معلقة: <span className="text-main dark:text-main">{stats.pendingCount}</span>
                                </span>
                            </div>
                            <div className="w-px h-3 bg-border/60 dark:bg-white/10" />
                            <div className="flex items-center gap-1">
                                <AlertCircle size={10} className="text-error" />
                                <span className="text-[8px] font-bold text-muted dark:text-main/40">
                                    متأخرة: <span className="text-main dark:text-main">{stats.overdueCount}</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-page mx-auto px-2.5 sm:px-4 -mt-2 space-y-3 pb-16">
                {/* KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-3 gap-2.5"
                >
                    {([
                        { title: 'مدفوعة', value: stats.paid, count: stats.paidCount, icon: CheckCircle, accent: 'success' as const },
                        { title: 'معلقة', value: stats.pending, count: stats.pendingCount, icon: Clock, accent: 'warning' as const },
                        { title: 'متأخرة', value: stats.overdue, count: stats.overdueCount, icon: AlertCircle, accent: 'error' as const },
                    ]).map(kpi => {
                        const gradients = {
                            success: 'from-success/20 to-success/5 dark:from-surface dark:to-transparent',
                            warning: 'from-warning/20 to-warning/5 dark:from-primary-soft dark:to-transparent',
                            error: 'from-error/20 to-error/5 dark:from-error-soft dark:to-transparent',
                        };
                        const iconBg = {
                            success: 'bg-success/10 text-success dark:bg-success/15 dark:text-success',
                            warning: 'bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning',
                            error: 'bg-error/10 text-error dark:bg-error/15 dark:text-error',
                        };
                        const Icon = kpi.icon;
                        return (
                            <motion.div
                                key={kpi.title}
                                whileHover={{ scale: 1.01, y: -1 }}
                                className="relative overflow-hidden bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl shadow-sm hover:shadow-md transition-all p-3.5"
                            >
                                <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${gradients[kpi.accent]}`} />
                                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradients[kpi.accent]}`} />
                                <div className="relative flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg[kpi.accent]}`}>
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-muted dark:text-main/40">{kpi.title}</p>
                                        <p className="text-sm font-bold text-main dark:text-main tabular-nums leading-none mt-0.5">
                                            {kpi.value.toLocaleString()}{' '}
                                            <span className="text-[8px] text-muted dark:text-main/40 font-bold">{CURRENCY_SYMBOL}</span>
                                        </p>
                                        <p className="text-[8px] font-bold text-muted dark:text-main/40 mt-1">{kpi.count} فاتورة</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2.5"
                >
                    {/* Status Pills */}
                    <div className="flex gap-1.5 flex-wrap">
                        {STATUS_PILLS.map(pill => {
                            const active = filterStatus === pill.key;
                            return (
                                <button
                                    key={pill.key}
                                    onClick={() => setFilterStatus(pill.key)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                        active
                                            ? 'bg-gradient-to-l from-primary to-primary-deep dark:from-primary dark:to-accent text-on-primary shadow-sm'
                                            : 'bg-card dark:bg-white/[0.06] text-muted dark:text-main/40 border border-border dark:border-white/[0.06] hover:bg-surface dark:hover:bg-white/[0.1]'
                                    }`}
                                >
                                    {pill.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Child + Search Row */}
                    <div className="flex gap-2 items-center">
                        {children.length > 1 && (
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                                <button
                                    onClick={() => setFilterChild('all')}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                                        filterChild === 'all'
                                            ? 'bg-gradient-to-l from-primary to-primary-deep dark:from-primary dark:to-accent text-on-primary shadow-sm'
                                            : 'bg-card dark:bg-white/[0.06] text-muted dark:text-main/40 border border-border dark:border-white/[0.06] hover:bg-surface dark:hover:bg-white/[0.1]'
                                    }`}
                                >
                                    الكل
                                </button>
                                {children.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFilterChild(c.id)}
                                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                                            filterChild === c.id
                                                ? 'bg-gradient-to-l from-primary to-primary-deep dark:from-primary dark:to-accent text-on-primary shadow-sm'
                                                : 'bg-card dark:bg-white/[0.06] text-muted dark:text-main/40 border border-border dark:border-white/[0.06] hover:bg-surface dark:hover:bg-white/[0.1]'
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted dark:text-main/40" size={12} />
                            <input
                                aria-label="بحث"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl ps-8 pe-3 py-2 text-[10px] font-bold outline-none bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.06] text-main dark:text-main placeholder:text-muted dark:placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Desktop Table */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="hidden md:block bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm"
                >
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-surface dark:bg-white/[0.04] border-b border-border/40 dark:border-white/[0.06]">
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-start">الابن</th>
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-start">البيان</th>
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-center">المبلغ</th>
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-center">التاريخ</th>
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-center">الاستحقاق</th>
                                <th className="px-4 py-3 text-[8px] font-bold text-muted dark:text-main/40 text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 dark:divide-white/[0.06]">
                            <AnimatePresence>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((inv, i) => {
                                        const status = statusConfig[inv.status];
                                        const StatusIcon = status.icon;
                                        return (
                                            <motion.tr
                                                key={inv.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-surface/50 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-main dark:text-main">{inv.studentName}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold text-main dark:text-main">{inv.description}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-[10px] font-bold text-main dark:text-main tabular-nums">
                                                    {inv.amount.toLocaleString()}{' '}
                                                    <span className="text-[8px] text-muted dark:text-main/40">{CURRENCY_SYMBOL}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-[8px] text-muted dark:text-main/40">{inv.date}</td>
                                                <td className="px-4 py-3 text-center text-[8px] text-muted dark:text-main/40">{inv.dueDate}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border ${status.bgCls} ${status.textCls} ${status.borderCls}`}>
                                                        <StatusIcon size={9} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                                <FileText size={18} />
                                            </div>
                                            <p className="text-[10px] font-bold text-muted dark:text-main/40">
                                                {noResults ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </motion.div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2.5">
                    <AnimatePresence>
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((inv, i) => {
                                const status = statusConfig[inv.status];
                                const StatusIcon = status.icon;
                                return (
                                    <motion.div
                                        key={inv.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl p-3.5 shadow-sm"
                                    >
                                        {/* Top Row */}
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-7 h-7 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Wallet size={11} className="text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold text-main dark:text-main truncate">{inv.description}</p>
                                                    <p className="text-[7px] text-muted dark:text-main/40 flex items-center gap-1">
                                                        <Users size={8} />
                                                        {inv.studentName}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-bold border shrink-0 ${status.bgCls} ${status.textCls} ${status.borderCls}`}>
                                                <StatusIcon size={8} />
                                                {status.label}
                                            </span>
                                        </div>
                                        {/* Bottom Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-[7px] font-bold text-muted dark:text-main/40 mb-0.5">المبلغ</p>
                                                    <span className="font-mono text-xs font-bold text-main dark:text-main tabular-nums">
                                                        {inv.amount.toLocaleString()}{' '}
                                                        <span className="text-[8px] text-muted dark:text-main/40">{CURRENCY_SYMBOL}</span>
                                                    </span>
                                                </div>
                                                <div className="w-px h-5 bg-border/40 dark:bg-white/10" />
                                                <div>
                                                    <p className="text-[7px] font-bold text-muted dark:text-main/40 mb-0.5">الاستحقاق</p>
                                                    <span className="text-[8px] text-muted dark:text-main/40">{inv.dueDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] border-dashed rounded-2xl py-16 text-center">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft dark:bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                                    <FileText size={18} />
                                </div>
                                <p className="text-[10px] font-bold text-muted dark:text-main/40">
                                    {noResults ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ParentPaymentHistory;
