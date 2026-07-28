import { useState, useEffect, useMemo } from 'react';
import { FileText, Receipt, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useCurrentUser } from '../context/AppContext';
import { Skeleton } from '../shared/components/ui';

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
    paid: { label: 'مدفوعة', icon: CheckCircle, bg: 'bg-success-soft', text: 'text-success' },
    pending: { label: 'معلقة', icon: Clock, bg: 'bg-warning-soft', text: 'text-warning' },
    overdue: { label: 'متأخرة', icon: AlertCircle, bg: 'bg-error-soft', text: 'text-error' },
} as const;

export const StudentInvoices = () => {
    useEffect(() => { document.title = 'فواتيري | دارين السابعة للتعليم والتدريب'; }, []);
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
                    <Skeleton className="h-20 rounded-2xl" />
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
        <div className="min-h-full pb-24 overflow-x-hidden" dir="rtl">
            <div className="max-w-page mx-auto px-4 pt-4 space-y-4">
                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                            <Receipt size={18} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-main">فواتيري</h1>
                            <p className="text-micro text-muted">عرض فواتيرك ومستحقاتك المالية</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center">
                                <CheckCircle size={14} className="text-success" />
                            </div>
                            <span className="text-micro text-muted font-bold">مدفوعة</span>
                        </div>
                        <p className="text-sm font-bold text-main">{stats.paidCount} فاتورة</p>
                        <p className="text-micro text-success font-bold">{stats.paid.toFixed(3)} د.ك</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center">
                                <Clock size={14} className="text-warning" />
                            </div>
                            <span className="text-micro text-muted font-bold">معلقة</span>
                        </div>
                        <p className="text-sm font-bold text-main">{stats.pendingCount} فاتورة</p>
                        <p className="text-micro text-warning font-bold">{stats.pending.toFixed(3)} د.ك</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-error-soft flex items-center justify-center">
                                <AlertCircle size={14} className="text-error" />
                            </div>
                            <span className="text-micro text-muted font-bold">متأخرة</span>
                        </div>
                        <p className="text-sm font-bold text-main">{stats.overdueCount} فاتورة</p>
                        <p className="text-micro text-error font-bold">{stats.overdue.toFixed(3)} د.ك</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                            aria-label="بحث في الفواتير"
                            placeholder="بحث بالبيان..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl ps-9 pe-3 py-2.5 text-xs font-bold outline-none bg-surface border border-border text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                        aria-label="تصفية حسب الحالة"
                        className="rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-surface border border-border text-main focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="paid">مدفوعة</option>
                        <option value="pending">معلقة</option>
                        <option value="overdue">متأخرة</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
                    <table className="w-full text-start text-sm border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-4 py-3 text-micro font-bold text-muted text-start">البيان</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">المبلغ</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">التاريخ</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">الاستحقاق</th>
                                <th className="px-4 py-3 text-micro font-bold text-muted text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                                const status = statusConfig[inv.status];
                                return (
                                    <tr key={inv.id} className="hover:bg-hover transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-main">{inv.description}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono text-xs font-bold text-main">{inv.amount.toFixed(3)} د.ك</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-micro text-muted">{inv.date}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-micro text-muted">{inv.dueDate}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-micro font-bold ${status.bg} ${status.text}`}>
                                                <status.icon size={11} />
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
                                            {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد فواتير بعد'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                        const status = statusConfig[inv.status];
                        return (
                            <div key={inv.id} className="bg-card border border-border rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-main">{inv.description}</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-micro font-bold ${status.bg} ${status.text}`}>
                                        <status.icon size={10} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-micro text-muted mb-0.5">المبلغ</p>
                                            <span className="font-mono text-sm font-bold text-main">{inv.amount.toFixed(3)} د.ك</span>
                                        </div>
                                        <div className="w-px h-6 bg-border" />
                                        <div>
                                            <p className="text-micro text-muted mb-0.5">الاستحقاق</p>
                                            <span className="text-micro text-muted">{inv.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-card border border-border border-dashed rounded-2xl py-16 text-center">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                                <FileText size={18} />
                            </div>
                            <p className="text-xs font-bold text-muted">
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
