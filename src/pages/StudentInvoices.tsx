import { useState, useEffect, useMemo } from 'react';
import {
    Plus, Wallet, TrendingUp, Trash2, CheckCircle, XCircle,
    Search, Edit, X,
    AlertCircle, FileText, Printer, UserPlus, RefreshCw,
    Sparkles, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { InvoicePreviewModal } from '../features/finance/components/InvoicePreviewModal';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';

interface StudentInvoice {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod?: string;
    notes?: string;
    items?: { description: string; date?: string; amount: number }[];
}

interface Student {
    id: string;
    name: string;
    grade: string;
    parentPhone: string;
    sessionPrice?: number;
    enrollments: {
        teacher: string;
        subject: string;
        sessionsTotal: number;
        sessionsUsed: number;
        price?: number;
    }[];
}

// ── Reusable Styled Components (Matching Settings.tsx) ────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {children}
    </label>
);

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const Component = (props as any).type === 'select' ? 'select' : (props as any).type === 'textarea' ? 'textarea' : 'input';
    return (
        <Component
            {...props as any}
            className={cn(
                'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-white',
                'focus:outline-none focus:border-[#5c59f2] focus:ring-2 focus:ring-[#5c59f2]/10 transition-all',
                props.className
            )}
        />
    );
};

const PrimaryBtn = ({ onClick, loading, children, className = '', disabled, type }: {
    onClick?: () => void; loading?: boolean; children: React.ReactNode; className?: string; disabled?: boolean; type?: "button" | "submit" | "reset"
}) => (
    <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
    </button>
);

const SecondaryBtn = ({ onClick, children, className = '', title }: {
    onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
    <button
        title={title}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800',
            'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs',
            className
        )}
    >
        {children}
    </button>
);

const DangerBtn = ({ onClick, children, className = '', title }: {
    onClick?: () => void; children: React.ReactNode; className?: string; title?: string
}) => (
    <button
        title={title}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20',
            'hover:bg-rose-600 hover:text-white text-rose-600',
            'text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 transition-all',
            className
        )}
    >
        {children}
    </button>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const StudentInvoices = () => {
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [allSessions, setAllSessions] = useState<any[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showNotification } = useApp();
    const [previewInvoice, setPreviewInvoice] = useState<StudentInvoice | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        description: 'رسوم شهرية',
        date: new Date().toLocaleDateString('en-CA'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
        status: 'pending' as 'paid' | 'pending' | 'overdue',
        paymentMethod: 'نقدي',
        notes: '',
        items: [] as { description: string; date?: string; amount: number }[]
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesData, studentsData, sessionsData] = await Promise.all([
                api.get<StudentInvoice[]>('/studentInvoices'),
                api.get<Student[]>('/students'),
                api.get<any[]>('/sessions')
            ]);
            setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData as any).data || []);
            setStudents(Array.isArray(studentsData) ? studentsData : (studentsData as any).data || []);
            setAllSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData as any).data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const sName = inv.studentName || '';
            const desc = inv.description || '';
            const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                desc.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, filterStatus]);

    const handleEdit = (invoice: StudentInvoice) => {
        setEditingId(invoice.id);
        setFormData({
            studentId: invoice.studentId,
            amount: invoice.amount.toString(),
            description: invoice.description,
            date: invoice.date,
            dueDate: invoice.dueDate || invoice.date,
            status: invoice.status,
            paymentMethod: invoice.paymentMethod || '',
            notes: invoice.notes || '',
            items: invoice.items || []
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            studentId: '',
            amount: '',
            description: 'رسوم شهرية',
            date: new Date().toLocaleDateString('en-CA'),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
            status: 'pending',
            paymentMethod: 'نقدي',
            notes: '',
            items: []
        });
        setShowForm(false);
    };

    const handleStudentChange = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const subjects = student.enrollments?.map(e => e.subject).join(' + ') || '';
            const totalAmount = student.enrollments?.reduce((sum, e) => {
                if (e.price) return sum + e.price;
                if (student.sessionPrice) return sum + (e.sessionsTotal * student.sessionPrice);
                return sum;
            }, 0) || 0;

            const studentSessions = allSessions.filter((sess: any) =>
                sess.studentId === studentId &&
                (sess.status === 'completed' || sess.status === 'cancelled')
            );

            const items = studentSessions.map((sess: any) => ({
                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? 'حضور' : 'غياب'})`,
                amount: sess.price || student.sessionPrice || 0,
                date: sess.date
            }));

            setFormData({
                ...formData,
                studentId,
                description: subjects ? `رسوم: ${subjects}` : 'رسوم شهرية',
                amount: (items.length > 0 ? items.reduce((s, i) => s + i.amount, 0) : totalAmount).toString(),
                items: items
            });
        } else {
            setFormData({ ...formData, studentId, items: [] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const student = students.find(s => s.id === formData.studentId);
        if (!student) {
            showNotification('خطأ: يرجى اختيار طالب صحيح', 'error');
            setIsSaving(false);
            return;
        }

        const invoiceData = {
            studentId: student.id,
            studentName: student.name,
            amount: Number(formData.amount),
            description: formData.description,
            date: formData.date,
            dueDate: formData.dueDate,
            status: formData.status,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            items: formData.items
        };

        try {
            if (editingId) {
                await api.put(`/studentInvoices/${editingId}`, { ...invoiceData, id: editingId });
            } else {
                await api.post('/studentInvoices', invoiceData);
            }
            fetchData();
            handleCancel();
            showNotification(editingId ? 'تم تحديث الفاتورة بنجاح' : 'تم إصدار الفاتورة بنجاح', 'success');
        } catch (error: any) {
            console.error('Error saving invoice:', error);
            const errorMessage = error.response?.data?.error || error.message || 'حدث خطأ أثناء حفظ البيانات';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (invoice: StudentInvoice) => {
        const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';
        try {
            await api.patch(`/studentInvoices/${invoice.id}`, { status: newStatus });
            fetchData();
            showNotification('تم تحديث حالة الفاتورة', 'success');
        } catch (error) {
            console.error(error);
            showNotification('فشل تحديث الحالة', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/studentInvoices/${deletingId}`);
            fetchData();
            showNotification('تم حذف الفاتورة بنجاح', 'success');
        } catch (error: any) {
            console.error('Error deleting invoice:', error);
            showNotification(error.message || 'فشل في حذف الفاتورة', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteAll = async () => {
        if (invoices.length === 0) return;
        try {
            setLoading(true);
            const deletePromises = invoices.map(inv =>
                api.delete(`/studentInvoices/${inv.id}`)
            );
            await Promise.all(deletePromises);
            fetchData();
            showNotification('تم حذف جميع فواتير الطلاب بنجاح', 'success');
        } catch (error) {
            console.error('Error deleting all invoices:', error);
            showNotification('حدث خطأ أثناء محاولة حذف الكل', 'error');
        } finally {
            setLoading(false);
            setDeleteAllModalOpen(false);
        }
    };

    const handleImportStudents = async () => {
        try {
            setLoading(true);
            const [studentsList, allSessionsData, currentInvoices] = await Promise.all([
                api.get<any[]>('/students'),
                api.get<any[]>('/sessions'),
                api.get<StudentInvoice[]>('/studentInvoices')
            ]);

            const currentStudentIds = new Set(
                (Array.isArray(currentInvoices) ? currentInvoices : (currentInvoices as any).data || [])
                    .map((inv: any) => inv.studentId)
            );

            const studentsToImport = studentsList.filter((s: any) => {
                const hasNoInvoice = !currentStudentIds.has(s.id);
                const hasSessions = allSessionsData.some((sess: any) =>
                    sess.studentId === s.id &&
                    (sess.status === 'completed' || sess.status === 'cancelled')
                );
                return hasNoInvoice && hasSessions;
            });

            if (studentsToImport.length === 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'لا توجد بيانات جديدة',
                    message: 'جميع الطلاب المسجلين لديهم فواتير بالفعل في القائمة الحالية.',
                    onConfirm: () => { setConfirmModal(prev => ({ ...prev, isOpen: false })); }
                });
                setLoading(false);
                return;
            }

            setConfirmModal({
                isOpen: true,
                title: 'استيراد الطلاب',
                message: `سيتم استيراد ${studentsToImport.length} طالب جديد وإصدار كشوفات حضور لهم بناءً على الحصص المسجلة. هل تريد الاستمرار؟`,
                onConfirm: async () => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    try {
                        setLoading(true);
                        const importPromises = studentsToImport.map((s: any) => {
                            const studentSessions = allSessionsData.filter((sess: any) =>
                                sess.studentId === s.id &&
                                (sess.status === 'completed' || sess.status === 'cancelled')
                            );

                            const items = studentSessions.map((sess: any) => ({
                                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? 'حضور' : 'غياب'})`,
                                amount: sess.price || s.sessionPrice || 0,
                                date: sess.date
                            }));

                            const totalAmount = items.reduce((sum: number, i: any) => sum + i.amount, 0);
                            const subjects = Array.from(new Set(studentSessions.map((sess: any) => sess.subject))).join(' + ');

                            return api.post('/studentInvoices', {
                                studentId: s.id,
                                studentName: s.name,
                                amount: totalAmount,
                                description: subjects ? `رسوم حصص: ${subjects}` : 'رسوم شهرية',
                                date: new Date().toLocaleDateString('en-CA'),
                                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
                                status: 'pending',
                                paymentMethod: 'نقدي',
                                notes: 'استيراد تلقائي من سجل الحصص',
                                items: items
                            });
                        });

                        await Promise.all(importPromises);
                        fetchData();
                        showNotification(`تم استيراد ${studentsToImport.length} طالب بنجاح`, 'success');
                    } catch (error) {
                        console.error('Error importing students:', error);
                        showNotification('حدث خطأ أثناء الاستيراد', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const pendingRevenue = useMemo(() => invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const overdueRevenue = useMemo(() => invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const paidCount = useMemo(() => invoices.filter(i => i.status === 'paid').length, [invoices]);
    const pendingCount = useMemo(() => invoices.filter(i => i.status === 'pending').length, [invoices]);

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-4 pb-20 min-h-full bg-[#f1f5f9] dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">

            {/* ── Header ── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-0 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                        <FileText size={18} className="text-[#5c59f2]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">فواتير وتحصيل الطلاب</h1>
                        <p className="text-[10px] text-slate-400">إدارة التدفقات النقدية والمستحقات الدراسية</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Sparkles size={12} className="text-amber-400" />
                    {totalRevenue.toLocaleString()} ج.م إجمالي المحصل
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="px-0">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'المحصل', value: `${totalRevenue.toLocaleString()} ج.م`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'معلق', value: `${pendingRevenue.toLocaleString()} ج.م`, icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'متأخر', value: `${overdueRevenue.toLocaleString()} ج.م`, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                        { label: 'الفواتير', value: invoices.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'المدفوعة', value: paidCount, icon: CheckCircle, color: 'text-[#5c59f2]', bg: 'bg-[#eef2ff] dark:bg-indigo-900/30' },
                        { label: 'المعلقة', value: pendingCount, icon: XCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", stat.bg)}>
                                <stat.icon size={16} className={stat.color} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="px-0">
                <SectionCard className="p-3 md:p-3">
                    <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                        <div className="flex-1 flex gap-3 items-center w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <InputField
                                    placeholder="بحث باسم الطالب أو البيان..."
                                    className="pr-9 py-2 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <InputField
                                type="select"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as any)}
                                className="w-auto min-w-[140px] py-2 text-xs font-bold"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="paid">مدفوعة</option>
                                <option value="pending">معلقة</option>
                                <option value="overdue">متأخرة</option>
                            </InputField>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            <PrimaryBtn onClick={() => setShowForm(!showForm)} className="whitespace-nowrap">
                                {showForm ? <X size={14} /> : <Plus size={14} />}
                                {showForm ? 'إلغاء' : 'إصدار فاتورة'}
                            </PrimaryBtn>
                            <SecondaryBtn onClick={handleImportStudents} title="استيراد من سجل الحصص">
                                <UserPlus size={14} /> استيراد
                            </SecondaryBtn>
                            <SecondaryBtn onClick={() => window.print()} title="طباعة السجل">
                                <Printer size={14} />
                            </SecondaryBtn>
                            <DangerBtn onClick={() => setDeleteAllModalOpen(true)} title="حذف الكل">
                                <Trash2 size={14} />
                            </DangerBtn>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                {/* ── Form ── */}
                {showForm && (
                    <SectionCard className="mb-4 animate-in slide-in-from-top-2">
                        <SectionTitle
                            icon={editingId ? Edit : Plus}
                            label={editingId ? 'تعديل الفاتورة' : 'إصدار فاتورة جديدة'}
                            sub="Student Billing Management"
                        />
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                                <FieldLabel>الطالب *</FieldLabel>
                                <InputField
                                    type="select"
                                    required
                                    value={formData.studentId}
                                    onChange={e => handleStudentChange(e.target.value)}
                                >
                                    <option value="">-- اختر الطالب --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                    ))}
                                </InputField>
                            </div>
                            <div>
                                <FieldLabel>المبلغ (ج.م) *</FieldLabel>
                                <InputField
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: (e.target as HTMLInputElement).value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <FieldLabel>بيان الفاتورة *</FieldLabel>
                                <InputField
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: (e.target as HTMLInputElement).value })}
                                    placeholder="مثال: رسوم شهر أكتوبر"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <FieldLabel>حالة الدفع</FieldLabel>
                                <InputField
                                    type="select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: (e.target as HTMLSelectElement).value as any })}
                                >
                                    <option value="pending">معلقة</option>
                                    <option value="paid">مدفوعة</option>
                                    <option value="overdue">متأخرة</option>
                                </InputField>
                            </div>
                            <div className="grid grid-cols-2 gap-2 lg:col-span-1">
                                <div>
                                    <FieldLabel>تاريخ الإصدار</FieldLabel>
                                    <InputField
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>تاريخ الاستحقاق</FieldLabel>
                                    <InputField
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: (e.target as HTMLInputElement).value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <PrimaryBtn type="submit" loading={isSaving} className="w-full">
                                    <Check size={14} /> {editingId ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}
                                </PrimaryBtn>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {/* ── Table ── */}
                <SectionCard className="p-0 overflow-hidden">
                    <div className="overflow-x-auto rounded-2xl">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">اسم الطالب</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">البيان</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">المبلغ</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الاستحقاق</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الحالة</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                                    {(inv.studentName || '?')[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{inv.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px] inline-block">{inv.description}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono text-[11px] font-black text-slate-700 dark:text-slate-200">{inv.amount.toLocaleString()} ج.م</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[10px] font-medium text-slate-400 italic">{inv.dueDate}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleStatus(inv)}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg transition-all",
                                                        inv.status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                            : inv.status === 'pending'
                                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-1 h-1 rounded-full",
                                                        inv.status === 'paid' ? "bg-emerald-500" :
                                                            inv.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                                                    )}></div>
                                                    {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setPreviewInvoice(inv)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                    title="معاينة وطباعة"
                                                >
                                                    <Printer size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(inv)}
                                                    className="p-1.5 text-slate-400 hover:text-[#5c59f2] hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                    title="تعديل"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(inv.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <FileText className="mx-auto mb-2 text-slate-200" size={32} />
                                            <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="حذف الفاتورة"
                message="هل أنت متأكد من حذف هذه الفاتورة نهائياً؟"
                isDestructive={true}
            />

            <ConfirmModal
                isOpen={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                onConfirm={handleDeleteAll}
                title="حذف الكل"
                message="سيتم حذف جميع فواتير الطلاب تماماً. لا يمكن التراجع."
                isDestructive={true}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            {previewInvoice && (
                <InvoicePreviewModal
                    isOpen={!!previewInvoice}
                    onClose={() => setPreviewInvoice(null)}
                    invoice={previewInvoice}
                />
            )}
        </div>
    );
};
