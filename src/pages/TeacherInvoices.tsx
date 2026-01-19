import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, DollarSign, Users, AlertCircle, CreditCard, Percent,
    Plus, Edit, Trash2, Check, X, GraduationCap,
    CheckCircle2, Printer, UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { api } from '../lib/api';
import { useApp } from '../context/useApp';
import {
    type TeacherInvoice,
    type Teacher,
    type TeacherInvoiceFormData,
    type InvoiceStats,
    type InvoiceStatus,
    INVOICE_STATUS
} from '../types/invoice';

interface TeacherInvoicesHeaderProps {
    stats: InvoiceStats;
}

// Sub-component for the header section
const TeacherInvoicesHeader = ({ stats }: TeacherInvoicesHeaderProps) => {
    return (
        <div className="relative bg-indigo-600 p-8 shadow-xl overflow-hidden border-b-4 border-indigo-400 rounded-none mb-6">
            {/* Background Geometric Enhancement - Richer & Larger Shapes */}
            {/* Major Glows & Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-20 -mt-40 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-40 -mb-60 blur-[150px] pointer-events-none"></div>

            {/* Central Geometric elements */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"></div>

            {/* Large Structural Shapes */}
            <div className="absolute top-[-20%] left-[-5%] w-[35%] h-[140%] bg-gradient-to-br from-white/5 to-transparent rotate-12 pointer-events-none hidden lg:block"></div>
            <div className="absolute top-[-30%] right-[15%] w-[120px] h-[160%] bg-white/5 -rotate-12 pointer-events-none hidden lg:block"></div>

            {/* Large Geometric Outlines */}
            <div className="absolute top-1/2 right-10 w-80 h-80 border-[30px] border-white/5 rounded-full -translate-y-1/2 pointer-events-none"></div>

            {/* Pattern Layer */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                        <GraduationCap size={36} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">فواتير المعلمات</h1>
                        <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                            <DollarSign size={14} className="text-white" />
                            إدارة رواتب ومستحقات الكادر التعليمي
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap no-print">
                    <div className="bg-indigo-900/40 backdrop-blur-md border border-white/20 px-6 py-2 rounded-none min-w-[140px] text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60 mb-1">Total Payroll</p>
                        <p className="text-2xl font-black">{stats.totalAmount.toLocaleString()} ج.م</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TeacherInvoicesStatsProps {
    stats: InvoiceStats;
}

// Sub-component for the stats cards section
const TeacherInvoicesStats = ({ stats }: TeacherInvoicesStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <StatsCard
                title="عدد المعلمات"
                value={stats.totalTeachers}
                icon={Users}
                color="blue"
                trend="معلمة"
            />
            <StatsCard
                title="المبلغ الإجمالي"
                value={stats.totalAmount.toLocaleString() + ' ج.م'}
                icon={DollarSign}
                color="emerald"
                trend="مستحق"
            />
            <StatsCard
                title="المبلغ المدفوع"
                value={stats.paidAmount.toLocaleString() + ' ج.م'}
                icon={CheckCircle2}
                color="blue"
                trend="تم السداد"
            />
            <StatsCard
                title="المبلغ المعلق"
                value={stats.unpaidAmount.toLocaleString() + ' ج.م'}
                icon={AlertCircle}
                color="indigo"
                trend="قيد الانتظار"
            />
            <StatsCard
                title="مصاريف شخصية"
                value={stats.personalExpenses.toLocaleString() + ' ج.م'}
                icon={CreditCard}
                color="purple"
                trend="مصروف"
            />
            <StatsCard
                title="نسبة غير المدفوع"
                value={stats.unpaidPercentage + '%'}
                icon={Percent}
                color="amber"
                trend="من الإجمالي"
            />
        </div>
    );
};


export const TeacherInvoices = () => {
    // State
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
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
    const { showNotification } = useApp();

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

    // Optimized Filters with useMemo
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = invoice.teacher.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, filterStatus]);

    // Optimized Calculations with useMemo (single pass)
    const stats = useMemo(() => {
        const result = invoices.reduce((acc, invoice) => {
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
            totalTeachers: invoices.length,
            ...result,
            unpaidPercentage
        };
    }, [invoices]);

    // Handlers with useCallback
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

    const toggleForm = useCallback(() => {
        if (showForm) {
            handleCancel();
        } else {
            setShowForm(true);
        }
    }, [showForm, handleCancel]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
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
            console.log('Starting import process...');
            setLoading(true);

            // 1. Fetch all teachers
            const teachers = await api.get<any[]>('/teachers');
            console.log('Fetched teachers:', teachers);

            // 2. Identify missing teachers (those not currently in invoices)
            const currentTeacherNames = new Set(invoices.map(inv => inv.teacher));
            console.log('Current teacher names in invoices:', Array.from(currentTeacherNames));

            const teachersToImport = teachers.filter((t: any) => !currentTeacherNames.has(t.name));
            console.log('Teachers to import:', teachersToImport);

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

            // Create a formatted list of teacher names
            const teachersList = teachersToImport
                .map((t: any) => `• ${t.name}${t.subject ? ` (${t.subject})` : ''}`)
                .join('\n');

            setConfirmModal({
                isOpen: true,
                title: 'استيراد المعلمات',
                message: `سيتم استيراد ${teachersToImport.length} معلمة جديدة:\n\n${teachersList}\n\nهل تريد الاستمرار؟`,
                isDestructive: false,
                onConfirm: async () => {
                    try {
                        console.log('Importing teachers...');

                        const importPromises = teachersToImport.map((t: any) => {
                            return api.post('/invoices/teacher', {
                                teacherId: t.id || null,
                                teacher: t.name,
                                specialization: t.subject || '',
                                amount: 0,
                                paymentMethod: 'نقدي',
                                status: INVOICE_STATUS.PROCESSING,
                                personalExpenses: 0,
                                date: new Date().toISOString().split('T')[0]
                            });
                        });

                        await Promise.all(importPromises);
                        console.log('Import completed successfully');
                        await fetchInvoices();
                        showNotification(`تم استيراد ${teachersToImport.length} معلمة بنجاح`, 'success');
                    } catch (error) {
                        console.error('Error importing teachers:', error);
                        showNotification('حدث خطأ أثناء استيراد المعلمات', 'error');
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
            showNotification('حدث خطأ أثناء جلب بيانات المعلمات', 'error');
            setLoading(false);
        }
    }, [invoices, fetchInvoices, showNotification]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <Skeleton className="h-96 rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            <TeacherInvoicesHeader stats={stats} />

            <TeacherInvoicesStats stats={stats} />

            {/* Action Bar */}
            <div className="bg-white p-6 border border-slate-200 shadow-2xl dark:bg-gray-900 dark:border-gray-800 flex flex-wrap gap-5 items-center justify-between">
                <div className="flex-1 flex gap-5 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث باسم المعلمة..."
                            className="w-full pl-6 pr-12 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-bold rounded-none focus:bg-white transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="البحث باسم المعلمة"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap no-print">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-6 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-black rounded-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white min-w-[160px]"
                            aria-label="تصفية حسب الحالة"
                        >
                            <option value="all">جميع الحالات</option>
                            {Object.values(INVOICE_STATUS).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 no-print">
                    <button
                        onClick={handlePrint}
                        className="bg-white text-indigo-700 px-4 py-3 rounded-none flex items-center gap-2 hover:bg-indigo-50 border border-indigo-100 transition-all font-bold shadow-sm"
                        title="طباعة"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={toggleForm}
                        className="bg-primary-600 text-white px-6 py-3 rounded-none flex items-center gap-2 hover:bg-primary-700 active:bg-primary-800 transition-all font-black shadow-lg hover:shadow-primary-500/30"
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        <span>{showForm ? 'إلغاء' : 'إضافة'}</span>
                    </button>
                    <button
                        onClick={handleImportTeachers}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-none flex items-center gap-2 hover:bg-indigo-700 active:bg-indigo-800 transition-all font-black shadow-lg hover:shadow-indigo-500/30"
                    >
                        <UserPlus size={18} />
                        <span>استيراد</span>
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="bg-rose-50 text-rose-600 px-4 py-3 rounded-none flex items-center gap-2 hover:bg-rose-100 border border-rose-100 transition-all font-bold"
                        title="حذف الكل"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>


            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-6 border border-primary-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-4 text-primary-700 font-bold border-b border-gray-200 pb-3 dark:border-gray-700 dark:text-primary-400">
                        {editingId ? <Edit size={20} /> : <Plus size={20} />}
                        <h3 className="text-lg">{editingId ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">اختر المعلمة *</label>
                            <select
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
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm font-bold"
                            >
                                <option value="">-- اختر المعلمة --</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                                <option value="other">أخرى (إدخال يدوي)</option>
                            </select>
                        </div>
                        {formData.teacherId === 'other' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">اسم المعلمة (يدوي) *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.teacher}
                                    onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                                    className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                    placeholder="اسم المعلمة"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">التخصص *</label>
                            <input
                                required
                                type="text"
                                value={formData.specialization}
                                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                placeholder="التخصص"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">المبلغ (ج.م) *</label>
                            <input
                                required
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">وسيلة الدفع</label>
                            <input
                                type="text"
                                value={formData.paymentMethod}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                placeholder="نقدي / تحويل"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">المصاريف الشخصية</label>
                            <input
                                type="number"
                                value={formData.personalExpenses}
                                onChange={e => setFormData({ ...formData, personalExpenses: e.target.value })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">الحالة *</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                aria-label="الحالة"
                            >
                                {Object.values(INVOICE_STATUS).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-end">
                            <label className="block text-xs font-bold text-transparent mb-1 select-none">حفظ</label>
                            <button type="submit" className="w-full bg-primary-600 text-white px-6 h-11 font-bold hover:bg-primary-700 active:bg-primary-800 transition-all rounded-none flex items-center justify-center gap-2 shadow-lg">
                                <Check size={18} />
                                {editingId ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
                            </button>
                        </div>
                    </form>
                </div>
            )}


            {/* Table */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="text-center">المعلمة</th>
                                <th className="text-center">التخصص</th>
                                <th className="text-center">المبلغ</th>
                                <th className="text-center">المصاريف</th>
                                <th className="text-center">الصافي</th>
                                <th className="text-center">وسيلة الدفع</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="text-center" data-label="المعلمة">
                                            <span className="font-bold text-gray-900 dark:text-white">{invoice.teacher}</span>
                                        </td>
                                        <td className="text-center text-xs font-bold text-gray-500" data-label="التخصص">
                                            {invoice.specialization}
                                        </td>
                                        <td className="text-center font-mono text-xs font-black" data-label="المبلغ">
                                            {invoice.amount.toLocaleString()} ج.م
                                        </td>
                                        <td className="text-center text-xs font-bold text-red-500" data-label="المصاريف">
                                            {(invoice.personalExpenses || 0).toLocaleString()} ج.م
                                        </td>
                                        <td className="text-center" data-label="الصافي">
                                            <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-full border border-emerald-500/20">
                                                {(invoice.amount - (invoice.personalExpenses || 0)).toLocaleString()} ج.م
                                            </span>
                                        </td>
                                        <td className="text-center" data-label="وسيلة الدفع">
                                            <div className="flex justify-center">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                                                    <CreditCard size={12} className="text-gray-400" />
                                                    {invoice.paymentMethod || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center" data-label="الحالة">
                                            <div className="flex justify-center">
                                                <span className={cn(
                                                    "inline-flex items-center px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full transition-all",
                                                    invoice.status === 'مدفوعة'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : invoice.status === 'قيد المعالجة'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : invoice.status === 'متأخرة'
                                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                                                : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            invoice.status === 'مدفوعة' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                                invoice.status === 'قيد المعالجة' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                                    invoice.status === 'متأخرة' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-slate-500"
                                                        )}></div>
                                                        {invoice.status}
                                                    </div>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    className="table-action-btn text-indigo-600 hover:bg-indigo-50"
                                                    title="تعديل"
                                                    aria-label="تعديل فاتورة المعلمة"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="table-action-btn text-red-600 hover:bg-red-50"
                                                    title="حذف"
                                                    aria-label="حذف فاتورة المعلمة"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج للبحث' : 'لا توجد فواتير مسجلة'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
