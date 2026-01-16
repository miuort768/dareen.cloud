import { useState, useEffect } from 'react';
import {
    Search, DollarSign, Users, AlertCircle, CreditCard, Percent,
    Plus, Edit, Trash2, Check, X, GraduationCap,
    CheckCircle2, Printer, UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { API_BASE_URL } from '../config/api';

interface InvoiceItem {
    id: number;
    teacher?: string;
    specialization?: string;
    amount?: number;
    paymentMethod?: string;
    status?: string;
    date?: string;
    personalExpenses?: number;
}

interface Invoice {
    id: string;
    teacher: string;
    specialization: string;
    amount: number;
    paymentMethod: string;
    status: 'مدفوعة' | 'قيد المعالجة' | 'متأخرة' | 'غير مدفوعة';
    date: string;
    personalExpenses?: number;
}

export const TeacherInvoices = () => {
    // State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        teacher: '',
        specialization: '',
        amount: '',
        paymentMethod: '',
        status: 'قيد المعالجة' as 'مدفوعة' | 'قيد المعالجة' | 'متأخرة' | 'غير مدفوعة',
        personalExpenses: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Confirm Modal State
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

    // Fetch Data
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/invoices`);
            if (!res.ok) throw new Error('Failed to fetch from server');
            const data = await res.json();
            const formattedData = data.map((item: InvoiceItem) => ({
                ...item,
                id: String(item.id)
            }));
            setInvoices(formattedData);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Filters
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.teacher.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculations
    const totalTeachers = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
        .filter(inv => inv.status === 'مدفوعة')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const unpaidAmount = invoices
        .filter(inv => inv.status !== 'مدفوعة')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const personalExpenses = invoices.reduce((sum, inv) => sum + (inv.personalExpenses || 0), 0);
    const unpaidPercentage = totalAmount > 0 ? Math.round((unpaidAmount / totalAmount) * 100) : 0;

    // Handlers
    const handleEdit = (invoice: Invoice) => {
        setEditingId(invoice.id);
        setFormData({
            teacher: invoice.teacher,
            specialization: invoice.specialization,
            amount: invoice.amount.toString(),
            paymentMethod: invoice.paymentMethod,
            status: invoice.status,
            personalExpenses: invoice.personalExpenses ? invoice.personalExpenses.toString() : ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            teacher: '',
            specialization: '',
            amount: '',
            paymentMethod: '',
            status: 'قيد المعالجة',
            personalExpenses: ''
        });
        setShowForm(false);
    };

    const toggleForm = () => {
        if (showForm) {
            handleCancel();
        } else {
            setShowForm(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountValue = parseFloat(formData.amount) || 0;
        const personalExpValue = parseFloat(formData.personalExpenses) || 0;
        const invoiceData = {
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
                await fetch(`${API_BASE_URL}/invoices/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...invoiceData, id: editingId })
                });
            } else {
                await fetch(`${API_BASE_URL}/invoices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invoiceData)
                });
            }
            await fetchInvoices();
            handleCancel();
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'حذف الفاتورة',
            message: 'هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.',
            onConfirm: async () => {
                try {
                    await fetch(`${API_BASE_URL}/invoices/${id}`, { method: 'DELETE' });
                    fetchInvoices();
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                }
            }
        });
    };

    const handleDeleteAll = () => {
        if (invoices.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'حذف جميع الفواتير',
            message: `هل أنت متأكد من حذف جميع الفواتير (${invoices.length})؟ لا يمكن التراجع عن هذا الإجراء.`,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const deletePromises = invoices.map(inv =>
                        fetch(`${API_BASE_URL}/invoices/${inv.id}`, { method: 'DELETE' })
                    );
                    await Promise.all(deletePromises);
                    await fetchInvoices();
                    // showNotification logic would go here if available
                } catch (error) {
                    console.error('Error deleting all invoices:', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleImportTeachers = async () => {
        try {
            setLoading(true);
            // 1. Fetch all teachers
            const teachersRes = await fetch(`${API_BASE_URL}/teachers`);
            const teachers = await teachersRes.json();

            // 2. Identify missing teachers (those not currently in invoices)
            const currentTeacherNames = new Set(invoices.map(inv => inv.teacher));
            const teachersToImport = teachers.filter((t: any) => !currentTeacherNames.has(t.name));

            if (teachersToImport.length === 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'لا توجد بيانات جديدة',
                    message: 'جميع المعلمات المسجلين مضافون بالفعل في قائمة الفواتير.',
                    onConfirm: () => { }
                });
                setLoading(false);
                return;
            }

            setConfirmModal({
                isOpen: true,
                title: 'استيراد المعلمات',
                message: `سيتم استيراد ${teachersToImport.length} معلمة جديدة من قاعدة البيانات. هل تريد الاستمرار؟`,
                onConfirm: async () => {
                    try {
                        setLoading(true);
                        const importPromises = teachersToImport.map((t: any) =>
                            fetch(`${API_BASE_URL}/invoices`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    teacher: t.name,
                                    specialization: t.subject || '',
                                    amount: 0,
                                    paymentMethod: '',
                                    status: 'غير مدفوعة',
                                    personalExpenses: 0,
                                    date: new Date().toISOString().split('T')[0]
                                })
                            })
                        );

                        await Promise.all(importPromises);
                        await fetchInvoices();
                    } catch (error) {
                        console.error('Error importing teachers:', error);
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

    const handlePrint = () => {
        window.print();
    };

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
        <div className="space-y-6">
            {/* Premium Geometric Header */}
            <div className="relative bg-indigo-600 p-8 shadow-xl overflow-hidden border-b-4 border-indigo-400">


                <div className="relative flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner relative group">
                            <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                            <GraduationCap size={36} className="text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1 tracking-tight uppercase">فواتير المعلمات</h1>
                            <p className="text-indigo-100/80 text-sm font-bold flex items-center gap-2">
                                <DollarSign size={14} className="text-indigo-300" />
                                إدارة رواتب ومستحقات الكادر التعليمي
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap no-print">
                        <div className="bg-white/10 backdrop-blur-sm px-6 py-2 border-r-4 border-white/30">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Total Payroll</p>
                            <p className="text-white text-2xl font-black">{totalAmount.toLocaleString()} ج.م</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="bg-white text-indigo-700 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white/95 active:bg-indigo-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0"
                        >
                            <Printer size={20} />
                            <span>طباعة التقارير</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard
                    title="عدد المعلمات"
                    value={totalTeachers}
                    icon={Users}
                    color="blue"
                    trend="معلمة"
                />
                <StatsCard
                    title="المبلغ الإجمالي"
                    value={totalAmount.toLocaleString() + ' ج.م'}
                    icon={DollarSign}
                    color="emerald"
                    trend="مستحق"
                />
                <StatsCard
                    title="المبلغ المدفوع"
                    value={paidAmount.toLocaleString() + ' ج.م'}
                    icon={CheckCircle2}
                    color="blue"
                    trend="تم السداد"
                />
                <StatsCard
                    title="المبلغ المعلق"
                    value={unpaidAmount.toLocaleString() + ' ج.م'}
                    icon={AlertCircle}
                    color="indigo"
                    trend="قيد الانتظار"
                />
                <StatsCard
                    title="مصاريف شخصية"
                    value={personalExpenses.toLocaleString() + ' ج.م'}
                    icon={CreditCard}
                    color="purple"
                    trend="مصروف"
                />
                <StatsCard
                    title="نسبة المعلق"
                    value={unpaidPercentage + '%'}
                    icon={Percent}
                    color="amber"
                    trend="من الإجمالي"
                />
            </div>

            {/* Action Bar */}
            <div className="bg-white p-6 border border-slate-200 shadow-2xl dark:bg-gray-900 dark:border-gray-800 flex flex-wrap gap-5 items-center">
                <button
                    onClick={toggleForm}
                    className={cn(
                        "flex items-center gap-3 px-8 h-12 rounded-none transition-all font-black text-sm uppercase tracking-widest relative overflow-hidden group",
                        showForm
                            ? "bg-slate-800 text-white hover:bg-black"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                    )}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    <span>{showForm ? 'إلغاء' : 'إضافة فاتورة'}</span>
                </button>

                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث باسم المعلمة..."
                        className="w-full pl-6 pr-12 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-bold rounded-none focus:bg-white transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 flex-wrap no-print">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-6 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-black rounded-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white min-w-[160px]"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="مدفوعة">مدفوعة</option>
                        <option value="قيد المعالجة">قيد المعالجة</option>
                        <option value="متأخرة">متأخرة</option>
                        <option value="غير مدفوعة">غير مدفوعة</option>
                    </select>

                    <button
                        onClick={handleImportTeachers}
                        className="h-12 w-12 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm dark:bg-indigo-900/20 dark:border-indigo-900/30"
                        title="استيراد المعلمات"
                    >
                        <UserPlus size={18} />
                    </button>

                    <button
                        onClick={handleDeleteAll}
                        className="h-12 w-12 bg-red-50 border border-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm dark:bg-red-900/20 dark:border-red-900/30"
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
                            <label className="block text-xs font-bold text-gray-600 mb-1 dark:text-gray-400">اسم المعلمة *</label>
                            <input
                                required
                                type="text"
                                value={formData.teacher}
                                onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                placeholder="اسم المعلمة"
                            />
                        </div>
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
                                onChange={e => setFormData({ ...formData, status: e.target.value as 'مدفوعة' | 'قيد المعالجة' | 'متأخرة' | 'غير مدفوعة' })}
                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                            >
                                <option value="مدفوعة">مدفوعة</option>
                                <option value="قيد المعالجة">قيد المعالجة</option>
                                <option value="متأخرة">متأخرة</option>
                                <option value="غير مدفوعة">غير مدفوعة</option>
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

            {/* Search & Filter Bar */}
            <div className="bg-primary-50/50 p-4 border border-primary-100 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث باسم المعلمة..."
                        className="w-full pl-4 pr-10 h-11 border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 h-11 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm min-w-[160px]"
                >
                    <option value="all">جميع الحالات</option>
                    <option value="مدفوعة">مدفوعة</option>
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="متأخرة">متأخرة</option>
                    <option value="غير مدفوعة">غير مدفوعة</option>
                </select>

                <div className="flex gap-2 mr-auto no-print">
                    <button
                        onClick={handlePrint}
                        className="h-11 px-4 bg-white border border-gray-200 text-gray-700 rounded-none hover:bg-gray-50 flex items-center gap-2 font-bold text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    >
                        <Printer size={18} />
                        <span>طباعة</span>
                    </button>
                    <button
                        onClick={handleImportTeachers}
                        className="h-11 px-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-none hover:bg-indigo-100 flex items-center gap-2 font-bold text-sm transition-colors dark:bg-indigo-900/20 dark:border-indigo-900/30"
                    >
                        <UserPlus size={18} />
                        <span>استيراد</span>
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="h-11 px-4 bg-red-50 border border-red-100 text-red-600 rounded-none hover:bg-red-100 flex items-center gap-2 font-bold text-sm transition-colors dark:bg-red-900/20 dark:border-red-900/30"
                    >
                        <Trash2 size={18} />
                        <span>حذف الكل</span>
                    </button>
                </div>
            </div>

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
                                        <td className="text-center">
                                            <span className="font-bold text-gray-900 dark:text-white">{invoice.teacher}</span>
                                        </td>
                                        <td className="text-center text-xs font-bold text-gray-500">
                                            {invoice.specialization}
                                        </td>
                                        <td className="text-center font-mono text-xs font-black">
                                            {invoice.amount.toLocaleString()} ج.م
                                        </td>
                                        <td className="text-center text-xs font-bold text-red-500">
                                            {(invoice.personalExpenses || 0).toLocaleString()} ج.م
                                        </td>
                                        <td className="text-center">
                                            <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-full border border-emerald-500/20">
                                                {(invoice.amount - (invoice.personalExpenses || 0)).toLocaleString()} ج.م
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                                                    <CreditCard size={12} className="text-gray-400" />
                                                    {invoice.paymentMethod || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center">
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
                                        <td>
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    className="table-action-btn text-indigo-600 hover:bg-indigo-50"
                                                    title="تعديل"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="table-action-btn text-red-600 hover:bg-red-50"
                                                    title="حذف"
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
            />
        </div>
    );
};
