import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, DollarSign, Users, AlertCircle, CreditCard, Percent,
    Plus, Edit, Trash2, Check, X, GraduationCap,
    CheckCircle2, Printer, UserPlus, RefreshCw,
    Sparkles, Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { api } from '../lib/api';
import { useApp } from '../context/useApp';
import {
    type TeacherInvoice,
    type Teacher,
    type TeacherInvoiceFormData,
    type InvoiceStatus,
    INVOICE_STATUS,
} from '../types/invoice';
import { PageLoader } from '../components/ui/PageLoader';

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

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>) => {
    const Component = props.type === 'select' ? 'select' : 'input';
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

export const TeacherInvoices = () => {
    // State
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<TeacherInvoiceFormData>({
        teacherId: '',
        teacher: '',
        specialization: '',
        amount: '',
        paymentMethod: '',
        status: INVOICE_STATUS.PROCESSING,
        personalExpenses: ''
    });
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const { currentUser, showNotification } = useApp();

    const isTeacher = currentUser?.role === 'teacher';
    const teacherName = currentUser?.teacherName || currentUser?.name;

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: true
    });

    // Fetch Data
    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const [invData, teaData] = await Promise.all([
                api.get<any>('/invoices/teacher'),
                api.get<any[]>('/teachers')
            ]);

            const formattedData = (Array.isArray(invData) ? invData : (invData.data || [])).map((item: any) => ({
                ...item,
                id: String(item.id)
            })) as TeacherInvoice[];

            setInvoices(formattedData);
            setTeachers(Array.isArray(teaData) ? teaData : (teaData as any).data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Optimized Filters
    const filteredInvoices = useMemo(() => {
        let list = invoices;
        if (isTeacher) {
            list = list.filter(inv =>
                (inv.teacherId && inv.teacherId === currentUser?.id) ||
                (inv.teacher && inv.teacher.trim().toLowerCase() === teacherName?.trim().toLowerCase())
            );
        }

        return list.filter(invoice => {
            const matchesSearch = invoice.teacher.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
            const matchesDate = !invoice.date || (invoice.date >= startDate && invoice.date <= endDate);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, searchTerm, filterStatus, startDate, endDate, isTeacher, teacherName, currentUser]);

    // Stats
    const stats = useMemo(() => {
        const result = filteredInvoices.reduce((acc, invoice) => {
            acc.totalAmount += invoice.amount;
            acc.personalExpenses += invoice.personalExpenses || 0;

            if (invoice.status === INVOICE_STATUS.PAID) {
                acc.paidAmount += invoice.amount;
            } else {
                acc.unpaidAmount += invoice.amount;
            }

            return acc;
        }, {
            totalAmount: 0,
            paidAmount: 0,
            unpaidAmount: 0,
            personalExpenses: 0
        });

        const unpaidPercentage = result.totalAmount > 0
            ? Math.round((result.unpaidAmount / result.totalAmount) * 100)
            : 0;

        return {
            totalTeachers: filteredInvoices.length,
            ...result,
            unpaidPercentage
        };
    }, [filteredInvoices]);

    // Handlers
    const handleEdit = useCallback((invoice: TeacherInvoice) => {
        setEditingId(invoice.id);
        const teacherObj = teachers.find(t => t.name === invoice.teacher);
        setFormData({
            teacherId: teacherObj?.id || '',
            teacher: invoice.teacher,
            specialization: invoice.specialization,
            amount: invoice.amount.toString(),
            paymentMethod: invoice.paymentMethod,
            status: invoice.status,
            personalExpenses: invoice.personalExpenses ? invoice.personalExpenses.toString() : ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [teachers]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setFormData({
            teacherId: '',
            teacher: '',
            specialization: '',
            amount: '',
            paymentMethod: '',
            status: INVOICE_STATUS.PROCESSING,
            personalExpenses: ''
        });
        setShowForm(false);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const amountValue = parseFloat(formData.amount) || 0;
        const personalExpValue = parseFloat(formData.personalExpenses) || 0;
        const invoiceData = {
            teacherId: formData.teacherId || null,
            teacher: formData.teacher,
            specialization: formData.specialization,
            amount: amountValue,
            paymentMethod: formData.paymentMethod,
            status: formData.status,
            personalExpenses: personalExpValue,
            date: new Date().toISOString().split('T')[0]
        };
        try {
            if (editingId) {
                await api.put(`/invoices/teacher/${editingId}`, { ...invoiceData, id: editingId });
            } else {
                await api.post('/invoices/teacher', invoiceData);
            }
            await fetchInvoices();
            handleCancel();
            showNotification(editingId ? 'تم تحديث الفاتورة بنجاح' : 'تم إضافة الفاتورة بنجاح', 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, editingId, handleCancel, fetchInvoices, showNotification]);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'حذف الفاتورة',
            message: 'هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/invoices/teacher/${id}`);
                    fetchInvoices();
                    showNotification('تم حذف الفاتورة بنجاح', 'success');
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                    showNotification('حدث خطأ أثناء حذف الفاتورة', 'error');
                }
            }
        });
    }, [fetchInvoices, showNotification]);

    const handleDeleteAll = useCallback(() => {
        if (invoices.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'حذف جميع الفواتير',
            message: `هل أنت متأكد من حذف جميع الفواتير (${invoices.length})؟ لا يمكن التراجع عن هذا الإجراء.`,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const deletePromises = invoices.map(inv =>
                        api.delete(`/invoices/teacher/${inv.id}`)
                    );
                    await Promise.all(deletePromises);
                    await fetchInvoices();
                    showNotification('تم حذف جميع الفواتير بنجاح', 'success');
                } catch (error) {
                    console.error('Error deleting all invoices:', error);
                    showNotification('حدث خطأ أثناء حذف الفواتير', 'error');
                } finally {
                    setLoading(false);
                }
            }
        });
    }, [invoices, fetchInvoices, showNotification]);

    const handleImportTeachers = useCallback(async () => {
        try {
            setLoading(true);
            const [teachersList, allSessions] = await Promise.all([
                api.get<any[]>('/teachers'),
                api.get<any[]>('/sessions')
            ]);

            const currentTeacherNames = new Set(invoices.map(inv => inv.teacher));
            const teachersToImport = teachersList.filter((t: any) => !currentTeacherNames.has(t.name));

            if (teachersToImport.length === 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'لا توجد بيانات جديدة',
                    message: 'جميع المعلمات المسجلين مضافون بالفعل في قائمة الفواتير.',
                    isDestructive: false,
                    onConfirm: () => { }
                });
                setLoading(false);
                return;
            }

            setLoading(false);
            setConfirmModal({
                isOpen: true,
                title: 'استيراد المعلمات',
                message: `سيتم استيراد ${teachersToImport.length} معلمة جديدة واحتساب مستحقاتهم من سجل الحصص. هل تريد الاستمرار؟`,
                isDestructive: false,
                onConfirm: async () => {
                    try {
                        setLoading(true);
                        const importPromises = teachersToImport.map((t: any) => {
                            const teacherSessions = allSessions.filter((sess: any) =>
                                (sess.teacherId === t.id || sess.teacherName === t.name) &&
                                sess.status === 'completed'
                            );
                            const totalAmount = teacherSessions.reduce((sum: number, sess: any) => sum + (sess.teacherPrice || t.price || 0), 0);

                            return api.post('/invoices/teacher', {
                                teacherId: t.id || null,
                                teacher: t.name,
                                specialization: t.subject || '',
                                amount: totalAmount,
                                paymentMethod: 'نقدي',
                                status: INVOICE_STATUS.PROCESSING,
                                personalExpenses: 0,
                                date: new Date().toISOString().split('T')[0]
                            });
                        });

                        await Promise.all(importPromises);
                        await fetchInvoices();
                        showNotification(`تم استيراد ${teachersToImport.length} معلمة بنجاح`, 'success');
                    } catch (error) {
                        console.error('Error importing teachers:', error);
                        showNotification('حدث خطأ أثناء استيراد المعلمات', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
            showNotification('حدث خطأ أثناء جلب بيانات المعلمات', 'error');
            setLoading(false);
        }
    }, [invoices, fetchInvoices, showNotification]);

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-4 pb-20 min-h-full bg-[#f1f5f9] dark:bg-[#020617] md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">

            {/* ── Header ── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-0 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">فواتير المعلمات</h1>
                        <p className="text-[10px] text-slate-400">إدارة رواتب ومستحقات الكادر التعليمي</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Sparkles size={12} className="text-amber-400" />
                    {stats.totalAmount.toLocaleString()} ج.م إجمالي الرواتب
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="px-0">
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'المعلمات', value: stats.totalTeachers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'الإجمالي', value: `${stats.totalAmount.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'المدفوع', value: `${stats.paidAmount.toLocaleString()} ج.م`, icon: CheckCircle2, color: 'text-[#5c59f2]', bg: 'bg-[#eef2ff] dark:bg-indigo-900/30' },
                        { label: 'المعلق', value: `${stats.unpaidAmount.toLocaleString()} ج.م`, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                        { label: 'مصاريف', value: `${stats.personalExpenses.toLocaleString()} ج.م`, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'النسبة', value: `${stats.unpaidPercentage}%`, icon: Percent, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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
                                    placeholder="بحث باسم المعلمة..."
                                    className="pr-9 py-2 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-[10px] text-slate-400">→</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <InputField
                                type="select"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-auto min-w-[140px] py-2 text-xs font-bold"
                            >
                                <option value="all">جميع الحالات</option>
                                {Object.values(INVOICE_STATUS).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </InputField>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            {!isTeacher && (
                                <>
                                    <PrimaryBtn onClick={() => setShowForm(!showForm)} className="whitespace-nowrap">
                                        {showForm ? <X size={14} /> : <Plus size={14} />}
                                        {showForm ? 'إلغاء' : 'إضافة فاتورة'}
                                    </PrimaryBtn>
                                    <SecondaryBtn onClick={handleImportTeachers} title="استيراد من المعلمات">
                                        <UserPlus size={14} /> استيراد
                                    </SecondaryBtn>
                                    <DangerBtn onClick={handleDeleteAll} title="حذف الكل">
                                        <Trash2 size={14} />
                                    </DangerBtn>
                                </>
                            )}
                            <SecondaryBtn onClick={() => window.print()} title="طباعة السجل">
                                <Printer size={14} />
                            </SecondaryBtn>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                {/* ── Add/Edit Form ── */}
                {showForm && (
                    <SectionCard className="mb-4 animate-in slide-in-from-top-2">
                        <SectionTitle
                            icon={editingId ? Edit : Plus}
                            label={editingId ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}
                            sub="Invoice Management"
                        />
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <FieldLabel>المعلمة *</FieldLabel>
                                <InputField
                                    type="select"
                                    required
                                    value={formData.teacherId}
                                    onChange={e => {
                                        const t = teachers.find(t => t.id === e.target.value);
                                        if (t) {
                                            setFormData({
                                                ...formData,
                                                teacherId: t.id,
                                                teacher: t.name,
                                                specialization: t.subject || formData.specialization
                                            });
                                        } else {
                                            setFormData({ ...formData, teacherId: e.target.value });
                                        }
                                    }}
                                >
                                    <option value="">-- اختر المعلمة --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                    <option value="other">أخرى (إدخال يدوي)</option>
                                </InputField>
                            </div>
                            {formData.teacherId === 'other' && (
                                <div>
                                    <FieldLabel>اسم المعلمة (يدوي) *</FieldLabel>
                                    <InputField
                                        required
                                        value={formData.teacher}
                                        onChange={e => setFormData({ ...formData, teacher: (e.target as HTMLInputElement).value })}
                                        placeholder="اسم المعلمة"
                                    />
                                </div>
                            )}
                            <div>
                                <FieldLabel>التخصص *</FieldLabel>
                                <InputField
                                    required
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: (e.target as HTMLInputElement).value })}
                                    placeholder="التخصص"
                                />
                            </div>
                            <div>
                                <FieldLabel>المبلغ (ج.م) *</FieldLabel>
                                <InputField
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: (e.target as HTMLInputElement).value })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <FieldLabel>وسيلة الدفع</FieldLabel>
                                <InputField
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: (e.target as HTMLInputElement).value })}
                                    placeholder="نقدي / تحويل"
                                />
                            </div>
                            <div>
                                <FieldLabel>المصاريف الشخصية</FieldLabel>
                                <InputField
                                    type="number"
                                    value={formData.personalExpenses}
                                    onChange={e => setFormData({ ...formData, personalExpenses: (e.target as HTMLInputElement).value })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <FieldLabel>الحالة *</FieldLabel>
                                <InputField
                                    type="select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: (e.target as HTMLSelectElement).value as InvoiceStatus })}
                                >
                                    {Object.values(INVOICE_STATUS).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </InputField>
                            </div>
                            <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-end">
                                <PrimaryBtn type="submit" loading={isSaving} className="w-full">
                                    <Check size={14} /> {editingId ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
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
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المعلمة</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">التخصص</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المبلغ</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الصافي</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الحالة</th>
                                    {!isTeacher && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">الإجراءات</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                                    {invoice.teacher[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{invoice.teacher}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-medium text-slate-400">{invoice.specialization}</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                                            {invoice.amount.toLocaleString()} ج.م
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                                {(invoice.amount - (invoice.personalExpenses || 0)).toLocaleString()} ج.م
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-1 font-bold text-[9px] rounded-lg transition-all",
                                                    invoice.status === 'مدفوعة'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : invoice.status === 'قيد المعالجة'
                                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                                )}>
                                                    <div className={cn(
                                                        "w-1 h-1 rounded-full",
                                                        invoice.status === 'مدفوعة' ? "bg-emerald-500" :
                                                            invoice.status === 'قيد المعالجة' ? "bg-amber-500" : "bg-rose-500"
                                                    )}></div>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </td>
                                        {!isTeacher && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(invoice)}
                                                        className="p-1.5 text-slate-400 hover:text-[#5c59f2] hover:bg-[#eef2ff] dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(invoice.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <GraduationCap className="mx-auto mb-2 text-slate-200" size={32} />
                                            <p className="text-xs font-bold text-slate-400">لا توجد فواتير</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
        </div>
    );
};
