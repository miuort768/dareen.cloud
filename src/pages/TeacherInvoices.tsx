import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, RefreshCw, FileText } from 'lucide-react';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { type TeacherInvoice, type Teacher, type TeacherInvoiceFormData, INVOICE_STATUS } from '../types/invoice';
import { PageLoader } from '../components/ui/PageLoader';
import { InvoiceStats } from './teacher-invoices/components/InvoiceStats';
import { InvoiceForm } from './teacher-invoices/components/InvoiceForm';
import { InvoiceTable } from './teacher-invoices/components/InvoiceTable';
import { TeacherInvoicesHeader } from './teacher-invoices/teacher-invoices-page';

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 16, delay: Math.random() * 4, duration: 5 + Math.random() * 6,
}));

const FAB_ACTIONS = [
    { icon: Plus, label: 'إضافة فاتورة', action: 'add' as const, gradient: 'from-primary to-purple-400' },
    { icon: RefreshCw, label: 'استيراد معلمات', action: 'import' as const, gradient: 'from-info to-blue-400' },
    { icon: FileText, label: 'طباعة', action: 'print' as const, gradient: 'from-success to-emerald-400' },
];

export const TeacherInvoices = () => {
    useEffect(() => { document.title = 'فواتير المعلمات | دارين'; }, []);
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<TeacherInvoiceFormData>({
        teacherId: '', teacher: '', specialization: '', amount: '',
        paymentMethod: '', status: INVOICE_STATUS.PROCESSING,
        personalExpenses: '', currency: 'EGP'
    });
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [fabOpen, setFabOpen] = useState(false);
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const isTeacher = currentUser?.role === 'teacher';
    const teacherName = currentUser?.teacherName || currentUser?.name;
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean }>({
        isOpen: false, title: '', message: '', onConfirm: () => {}, isDestructive: true
    });

    const handleFabAction = (action: string) => {
        setFabOpen(false);
        switch (action) {
            case 'add': if (!isTeacher) setShowForm(!showForm); break;
            case 'import': if (!isTeacher) handleImportTeachers(); break;
            case 'print': window.print(); break;
        }
    };

    const fetchInvoices = useCallback(async () => {
        try { setLoading(true);
            const [invData, teaData] = await Promise.all([
                api.get<TeacherInvoice[]>('/invoices/teacher'),
                api.get<Teacher[]>('/teachers')
            ]);
            const formattedData = (Array.isArray(invData) ? invData : ((invData as { data?: TeacherInvoice[] }).data || [])).map((item) => ({ ...item, id: String(item.id) }));
            setInvoices(formattedData);
            setTeachers(Array.isArray(teaData) ? teaData : (teaData as { data?: Teacher[] }).data || []);
        } catch (error) { console.error('Error fetching data:', error); showNotification('خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.', 'error'); }
        finally { setLoading(false); }
    }, [showNotification]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const filteredInvoices = useMemo(() => {
        let list = invoices;
        if (isTeacher) list = list.filter(inv => (inv.teacherId && inv.teacherId === currentUser?.id) || (inv.teacher && inv.teacher.trim().toLowerCase() === teacherName?.trim().toLowerCase()));
        return list.filter(invoice => {
            const matchesSearch = invoice.teacher.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
            const matchesDate = !invoice.date || (invoice.date >= startDate && invoice.date <= endDate);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, searchTerm, filterStatus, startDate, endDate, isTeacher, teacherName, currentUser]);

    const stats = useMemo(() => {
        const result = filteredInvoices.reduce((acc, inv) => {
            acc.totalAmount += inv.amount;
            acc.personalExpenses += inv.personalExpenses || 0;
            if (inv.status === INVOICE_STATUS.PAID) acc.paidAmount += inv.amount;
            else acc.unpaidAmount += inv.amount;
            return acc;
        }, { totalAmount: 0, paidAmount: 0, unpaidAmount: 0, personalExpenses: 0 });
        const unpaidPercentage = result.totalAmount > 0 ? Math.round((result.unpaidAmount / result.totalAmount) * 100) : 0;
        return { totalTeachers: filteredInvoices.length, ...result, unpaidPercentage };
    }, [filteredInvoices]);

    const handleEdit = useCallback((invoice: TeacherInvoice) => {
        setEditingId(invoice.id);
        const teacherObj = teachers.find(t => t.name === invoice.teacher);
        setFormData({
            teacherId: teacherObj?.id || '', teacher: invoice.teacher, specialization: invoice.specialization,
            amount: invoice.amount.toString(), paymentMethod: invoice.paymentMethod, status: invoice.status,
            personalExpenses: invoice.personalExpenses ? invoice.personalExpenses.toString() : '', currency: invoice.currency || 'EGP'
        });
        setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [teachers]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setFormData({ teacherId: '', teacher: '', specialization: '', amount: '', paymentMethod: '', status: INVOICE_STATUS.PROCESSING, personalExpenses: '', currency: 'EGP' });
        setShowForm(false);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const amountValue = parseFloat(formData.amount) || 0;
        const personalExpValue = parseFloat(formData.personalExpenses) || 0;
        const invoiceData = {
            teacherId: formData.teacherId || null, teacher: formData.teacher, specialization: formData.specialization,
            amount: amountValue, paymentMethod: formData.paymentMethod, status: formData.status,
            personalExpenses: personalExpValue, currency: formData.currency || 'EGP',
            date: new Date().toISOString().split('T')[0]
        };
        try {
            if (editingId) await api.put(`/invoices/teacher/${editingId}`, { ...invoiceData, id: editingId });
            else await api.post('/invoices/teacher', invoiceData);
            await fetchInvoices(); handleCancel();
            showNotification(editingId ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح', 'success');
        } catch (error) { console.error('Error saving invoice:', error); showNotification('فشل حفظ الفاتورة', 'error'); }
        finally { setIsSaving(false); }
    }, [formData, editingId, handleCancel, fetchInvoices, showNotification]);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true, title: 'حذف الفاتورة', message: 'هل أنت متأكد من أنك تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.', isDestructive: true,
            onConfirm: async () => {
                try { await api.delete(`/invoices/teacher/${id}`); fetchInvoices(); showNotification('تم حذف الفاتورة بنجاح', 'success'); }
                catch (error) { console.error('Error deleting invoice:', error); showNotification('فشل حذف الفاتورة', 'error'); }
            }
        });
    }, [fetchInvoices, showNotification]);

    const handleDeleteAll = useCallback(() => {
        if (invoices.length === 0) return;
        setConfirmModal({
            isOpen: true, title: 'حذف جميع الفواتير', message: `هل أنت متأكد من حذف جميع الفواتير (${invoices.length})؟ لا يمكن التراجع عن هذا الإجراء.`, isDestructive: true,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await Promise.all(invoices.map(inv => api.delete(`/invoices/teacher/${inv.id}`)));
                    await fetchInvoices(); showNotification('تم حذف جميع الفواتير بنجاح', 'success');
                } catch (error) { console.error('Error deleting all invoices:', error); showNotification('فشل حذف جميع الفواتير', 'error'); }
                finally { setLoading(false); }
            }
        });
    }, [invoices, fetchInvoices, showNotification]);

    const handleImportTeachers = useCallback(async () => {
        try {
            setLoading(true);
            const [teachersList, allSessions] = await Promise.all([
                api.get<Teacher[]>('/teachers'),
                api.get<{ id?: string; teacherId?: string; teacherName?: string; teacherPrice?: number; status?: string }[]>('/sessions')
            ]);
            const currentTeacherNames = new Set(invoices.map(inv => inv.teacher));
            const teachersToImport = teachersList.filter((t) => !currentTeacherNames.has(t.name));
            if (teachersToImport.length === 0) {
                setConfirmModal({ isOpen: true, title: 'لا يوجد معلمون جدد', message: 'جميع المعلمين المسجلين موجودون بالفعل في الفواتير.', isDestructive: false, onConfirm: () => {} });
                setLoading(false); return;
            }
            setLoading(false);
            setConfirmModal({
                isOpen: true, title: 'استيراد المعلمات', message: `سيتم استيراد ${teachersToImport.length} معلمة جديد إلى الفواتير. هل تريد المتابعة؟`, isDestructive: false,
                onConfirm: async () => {
                    try {
                        setLoading(true);
                        await Promise.all(teachersToImport.map((t) => {
                            const teacherSessions = allSessions.filter((sess) => (sess.teacherId === t.id || sess.teacherName === t.name) && sess.status === 'completed');
                            const totalAmount = teacherSessions.reduce((sum, sess) => sum + (sess.teacherPrice || t.price || 0), 0);
                            return api.post('/invoices/teacher', {
                                teacherId: t.id || null, teacher: t.name, specialization: t.subject || '', amount: totalAmount,
                                paymentMethod: 'نقدي', status: INVOICE_STATUS.PROCESSING, personalExpenses: 0, currency: 'EGP',
                                date: new Date().toISOString().split('T')[0]
                            });
                        }));
                        await fetchInvoices();
                        showNotification(`تم استيراد ${teachersToImport.length} معلمة بنجاح`, 'success');
                    } catch (error) { console.error('Error importing teachers:', error); showNotification('فشل استيراد المعلمات', 'error'); }
                    finally { setLoading(false); }
                }
            });
        } catch (error) { console.error('Error during import process:', error); showNotification('فشل تحميل بيانات المعلمات', 'error'); setLoading(false); }
    }, [invoices, fetchInvoices, showNotification]);

    if (loading && invoices.length === 0) return <PageLoader />;

    return (
        <div className="min-h-full pb-28 overflow-x-hidden relative font-sans bg-surface" dir="rtl">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/[6%] to-background border-b border-border/60">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    {PARTICLES.map(p => (
                        <motion.div key={p.id}
                            className="absolute rounded-full bg-primary/30"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                            animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15] }}
                            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-page mx-auto px-2 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                                <GraduationCap size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main">فواتير المعلمات</h1>
                                <p className="text-[8px] text-muted">إدارة مستحقات المعلمات المالية</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl px-2.5 py-1.5">
                                <input type="date"
                                    className="w-[95px] bg-transparent text-[8px] font-bold text-main outline-none border-none [color-scheme:var(--color-scheme)]"
                                    value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <span className="text-[7px] text-muted">–</span>
                                <input type="date"
                                    className="w-[95px] bg-transparent text-[8px] font-bold text-main outline-none border-none [color-scheme:var(--color-scheme)]"
                                    value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    {/* Hero total */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-center py-4">
                        <p className="text-[9px] font-bold text-muted mb-1">إجمالي المستحقات</p>
                        <motion.p
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                            className="text-3xl font-bold text-main tabular-nums tracking-tight"
                        >
                            {stats.totalAmount.toLocaleString()}
                            <span className="text-sm text-muted font-bold me-1">ج.م</span>
                        </motion.p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                                <GraduationCap size={10} className="text-primary" />
                                <span className="text-[8px] font-bold text-muted">{stats.totalTeachers} معلمة</span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-success">مدفوع: {stats.paidAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-3 bg-border/60" />
                            <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-error">معلق: {stats.unpaidAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            <GraduationCap size={9} className="text-primary" /> الفواتير: <span className="text-main">{filteredInvoices.length}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-lg border border-border/40 text-[7px] font-bold">
                            النسبة المعلقة: <span className="text-error">{stats.unpaidPercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 max-w-page mx-auto px-2 -mt-2 space-y-3 pb-16">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <TeacherInvoicesHeader stats={stats} searchTerm={searchTerm} onSearchChange={setSearchTerm}
                        filterStatus={filterStatus} onFilterChange={setFilterStatus}
                        startDate={startDate} onStartDateChange={setStartDate} endDate={endDate} onEndDateChange={setEndDate}
                        showForm={showForm} onToggleForm={() => setShowForm(!showForm)}
                        onImport={handleImportTeachers} onDeleteAll={handleDeleteAll} onPrint={() => window.print()} isTeacher={isTeacher} />
                </motion.div>

                {/* Stats */}
                <InvoiceStats stats={stats} />

                {/* Form */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <InvoiceForm showForm={showForm} editingId={editingId} formData={formData} setFormData={setFormData}
                        handleSubmit={handleSubmit} handleCancel={handleCancel} teachers={teachers} isSaving={isSaving} INVOICE_STATUS={INVOICE_STATUS} />
                </motion.div>

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <InvoiceTable filteredInvoices={filteredInvoices} handleEdit={handleEdit} handleDelete={handleDelete} isTeacher={isTeacher} />
                </motion.div>

                <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDestructive={confirmModal.isDestructive} />
            </div>

            {/* ── FAB ── */}
            <div className="fixed bottom-6 start-6 z-50 flex flex-col items-center gap-2">
                <AnimatePresence>
                    {fabOpen && FAB_ACTIONS.map((item, i) => (
                        <motion.button key={item.label}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleFabAction(item.action)}
                            className="flex items-center gap-2 px-3 py-2 bg-card border border-border/60 shadow-elevation-2 rounded-xl hover:shadow-elevation-3 transition-all active:scale-95 group"
                        >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-[10px]`}>
                                <item.icon size={12} />
                            </div>
                            <span className="text-[8px] font-bold text-main whitespace-nowrap">{item.label}</span>
                        </motion.button>
                    ))}
                </AnimatePresence>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setFabOpen(!fabOpen)}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-400 text-white shadow-elevation-2 hover:shadow-elevation-3 flex items-center justify-center transition-all">
                    <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={18} />
                    </motion.div>
                </motion.button>
            </div>
        </div>
    );
};

export default TeacherInvoices;