import { useState, useEffect } from 'react';
import {
    Plus, Wallet, TrendingUp, Trash2, CheckCircle, XCircle,
    Search, Edit, Check, X,
    AlertCircle, FileText, Printer, UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsCard } from '../shared/components/StatsCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { InvoicePreviewModal } from '../features/finance/components/InvoicePreviewModal';
import { api } from '../lib/api';

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
    sessionPrice?: number; // Price per session specific to student
    enrollments: {
        teacher: string;
        subject: string;
        sessionsTotal: number;
        sessionsUsed: number;
        price?: number;
    }[];
}


export const StudentInvoices = () => {
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [allSessions, setAllSessions] = useState<any[]>([]);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showNotification } = useApp();
    const [previewInvoice, setPreviewInvoice] = useState<StudentInvoice | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
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

    // ... (rest of state / fetch)

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

    const fetchData = async () => {
        setLoading(true);
        try {
            // console.log('Fetching invoices...');
            const [invoicesData, studentsData, sessionsData] = await Promise.all([
                api.get<StudentInvoice[]>('/studentInvoices'),
                api.get<Student[]>('/students'),
                api.get<any[]>('/sessions')
            ]);

            // console.log('Invoices fetched:', invoicesData);
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

    // Filter invoices
    const filteredInvoices = invoices.filter(inv => {
        const sName = inv.studentName || '';
        const desc = inv.description || '';
        const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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

            // Fetch sessions for this student to include dates
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

    const toggleForm = () => {
        if (showForm) {
            handleCancel();
        } else {
            setShowForm(true);
            window.scrollTo({ top: 350, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const student = students.find(s => s.id === formData.studentId);
        if (!student) {
            showNotification('خطأ: يرجى اختيار طالب صحيح', 'error');
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

    const handlePrint = () => {
        window.print();
    };

    const handleImportStudents = async () => {
        try {
            setLoading(true);
            // 1. Fetch fresh data from server (including current invoices)
            const [studentsList, allSessions, currentInvoices] = await Promise.all([
                api.get<any[]>('/students'),
                api.get<any[]>('/sessions'),
                api.get<StudentInvoice[]>('/studentInvoices')
            ]);

            // 2. Identify students who don't have invoices yet AND have recorded sessions
            const currentStudentIds = new Set(
                (Array.isArray(currentInvoices) ? currentInvoices : (currentInvoices as any).data || [])
                    .map((inv: any) => inv.studentId)
            );

            const studentsToImport = studentsList.filter((s: any) => {
                const hasNoInvoice = !currentStudentIds.has(s.id);
                const hasSessions = allSessions.some((sess: any) =>
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
                            const studentSessions = allSessions.filter((sess: any) =>
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


    // Stats logic
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
    const totalInvoices = invoices.length;
    const paidCount = invoices.filter(i => i.status === 'paid').length;
    const pendingCount = invoices.filter(i => i.status === 'pending').length;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-none" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
            {/* ... Header Part omitted for brevity ... */}
            <div className="relative bg-primary-600 p-4 md:p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500 rounded-none">
                {/* ... Background stuff ... */}

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                            <FileText size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">فواتير الطلاب</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={14} className="text-white" />
                                إدارة الرسوم الدراسية والمدفوعات
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap no-print">
                        <button
                            onClick={handleImportStudents}
                            className="bg-primary-900/40 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-primary-900/50 font-black shadow-lg h-14"
                        >
                            <UserPlus size={20} />
                            <span>استيراد الكل</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-white text-primary-700 px-6 py-3 rounded-none flex items-center gap-3 hover:bg-white active:bg-white font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] h-14"
                        >
                            <Printer size={20} />
                            <span>تصدير التقرير</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
                <StatsCard
                    title="إجمالي التحصيلات"
                    value={totalRevenue.toLocaleString() + ' ج.م'}
                    icon={TrendingUp}
                    color="emerald"
                    trendUp={true}
                />
                <StatsCard
                    title="مبالغ معلقة"
                    value={pendingRevenue.toLocaleString() + ' ج.م'}
                    icon={Wallet}
                    color="amber"
                />
                <StatsCard
                    title="مبالغ متأخرة"
                    value={overdueRevenue.toLocaleString() + ' ج.م'}
                    icon={AlertCircle}
                    color="rose"
                    trendUp={false}
                />
                <StatsCard
                    title="عدد الفواتير"
                    value={totalInvoices}
                    icon={FileText}
                    color="blue"
                />
                <StatsCard
                    title="فواتير مدفوعة"
                    value={paidCount}
                    icon={CheckCircle}
                    color="emerald"
                />
                <StatsCard
                    title="فواتير معلقة"
                    value={pendingCount}
                    icon={XCircle}
                    color="purple"
                />
            </div>

            {/* Action Bar */}
            <div className="bg-white p-4 md:p-6 border border-slate-200 shadow-2xl dark:bg-gray-900 dark:border-gray-800 rounded-none">
                <div className="flex flex-wrap gap-5 items-center">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث باسم الطالب أو البيان..."
                            className="w-full pl-6 pr-12 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-bold rounded-none focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
                            className="px-6 h-12 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-black rounded-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="paid">مدفوعة</option>
                            <option value="pending">معلقة</option>
                            <option value="overdue">متأخرة</option>
                        </select>

                        <button
                            onClick={toggleForm}
                            className={cn(
                                "flex items-center gap-3 px-8 h-12 rounded-none font-black text-sm uppercase tracking-widest relative overflow-hidden group",
                                showForm
                                    ? "bg-slate-800 text-white hover:bg-black"
                                    : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20"
                            )}
                        >
                            {showForm ? <X size={18} /> : <Plus size={18} />}
                            <span>{showForm ? 'إلغاء' : 'إصدار فاتورة'}</span>
                        </button>

                        <button
                            onClick={() => setDeleteAllModalOpen(true)}
                            className="h-12 w-12 bg-red-50 border border-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white shadow-sm dark:bg-red-900/20 dark:border-red-900/30 no-print rounded-none"
                            title="حذف الكل"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="bg-white p-6 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Student Selection */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">الطالب</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={e => handleStudentChange(e.target.value)}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                >
                                    <option value="">اختر الطالب</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} - {s.grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">المبلغ</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                    placeholder="المبلغ (ج.م)"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">البيان</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                    placeholder="البيان"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">وسيلة الدفع</label>
                                <input
                                    type="text"
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                    placeholder="وسيلة الدفع"
                                />
                            </div>

                            {/* Issue Date */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">تاريخ الإصدار</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">تاريخ الاستحقاق</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full h-11 px-3 py-2 bg-white border-2 border-gray-100 focus:outline-none focus:border-primary-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                                />
                            </div>

                            {/* Status Buttons */}
                            <div className="space-y-0">
                                <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase">الحالة</label>
                                <div className="h-11 grid grid-cols-3 gap-1 rounded-none overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                                    {['paid', 'pending', 'overdue'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: status as 'paid' | 'pending' | 'overdue' })}
                                            className={`flex items-center justify-center text-[10px] font-bold transition-all h-full ${formData.status === status
                                                ? 'bg-primary-600 text-white dark:bg-primary-500'
                                                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {status === 'paid' ? 'مدفوعة' : status === 'pending' ? 'معلقة' : 'متأخرة'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="space-y-0 flex flex-col justify-end">
                                <button
                                    type="submit"
                                    className={`w-full h-11 text-white font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${editingId
                                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                        : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'
                                        }`}
                                >
                                    {editingId ? <Check size={18} /> : <Plus size={18} />}
                                    <span>{editingId ? 'حفظ التعديلات' : 'إصدار الفاتورة'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div >
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="text-center">اسم الطالب</th>
                                <th className="text-center">البيان</th>
                                <th className="text-center">المبلغ</th>
                                <th className="text-center">تاريخ الإصدار</th>
                                <th className="text-center">تاريخ الاستحقاق</th>
                                <th className="text-center">وسيلة الدفع</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-gray-400">
                                        <FileText size={48} className="mx-auto mb-4 text-gray-200" />
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد فواتير مسجلة'}
                                        </h3>
                                        <p className="text-sm font-bold">استخدم النموذج أعلاه لإصدار فاتورة جديدة</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <tr
                                        key={inv.id}
                                        className={editingId === inv.id ? 'bg-amber-50 dark:bg-amber-900/10 shadow-inner' : ''}
                                    >
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm dark:bg-primary-900/40 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800">
                                                    {(inv.studentName || '?').charAt(0)}
                                                </div>
                                                <p className="font-bold text-gray-900 dark:text-white">{inv.studentName || 'اسم غير معروف'}</p>
                                            </div>
                                        </td>
                                        <td className="text-center text-xs font-bold font-mono italic text-gray-500">
                                            {inv.description}
                                        </td>
                                        <td className="text-center">
                                            <div className="inline-flex items-center gap-1 font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 border border-slate-100 dark:border-slate-700 font-mono">
                                                <span className="text-sm">{inv.amount.toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="text-center font-mono text-xs font-black tracking-tighter" dir="ltr">
                                            {new Date(inv.date).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="text-center font-mono text-xs font-black tracking-tighter" dir="ltr">
                                            {new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="text-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 border border-gray-100 dark:border-gray-700">{inv.paymentMethod || '-'}</span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => toggleStatus(inv)}
                                                className={cn(
                                                    "inline-flex items-center px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95",
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : inv.status === 'pending'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-none",
                                                        inv.status === 'paid' ? "bg-emerald-500" : inv.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                                                    )}></div>
                                                    {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                                </div>
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setPreviewInvoice(inv)}
                                                    className="table-action-btn text-emerald-600 hover:bg-emerald-50"
                                                    title="معاينة وطباعة"
                                                >
                                                    <Printer size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(inv)}
                                                    className="table-action-btn text-primary-600 hover:bg-primary-50"
                                                    title="تعديل"
                                                    aria-label={`تعديل فاتورة ${inv.studentName}`}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(inv.id)}
                                                    className="table-action-btn text-red-600 hover:bg-red-50"
                                                    title="حذف"
                                                    aria-label={`حذف فاتورة ${inv.studentName}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden">
                    {filteredInvoices.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
                            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد فواتير مسجلة'}
                            </h3>
                            <p className="text-xs font-bold">استخدم النموذج أعلاه لإصدار فاتورة جديدة</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredInvoices.map(inv => (
                                <div
                                    key={inv.id}
                                    className={cn(
                                        "p-4 transition-colors",
                                        editingId === inv.id ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm dark:bg-primary-900/40 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800 shrink-0">
                                                {(inv.studentName || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{inv.studentName || 'اسم غير معروف'}</h3>
                                                <p className="text-[10px] text-gray-500 italic">{inv.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-base text-slate-900 dark:text-white">{inv.amount.toLocaleString()} <span className="text-xs text-slate-400">ج.م</span></div>
                                            <button
                                                onClick={() => toggleStatus(inv)}
                                                className={cn(
                                                    "inline-flex items-center px-2 py-0.5 font-black text-[9px] uppercase border transition-all mt-1",
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : inv.status === 'pending'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400'
                                                )}
                                            >
                                                {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                            <div className="text-[10px] text-gray-500 mb-0.5">تاريخ الإصدار</div>
                                            <div className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">
                                                {new Date(inv.date).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-none">
                                            <div className="text-[10px] text-gray-500 mb-0.5">تاريخ الاستحقاق</div>
                                            <div className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">
                                                {new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-[10px] font-bold text-gray-500">
                                            {inv.paymentMethod || '-'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setPreviewInvoice(inv)}
                                                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                                                title="معاينة"
                                            >
                                                <Printer size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(inv)}
                                                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                                                title="تعديل"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(inv.id)}
                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"
                                                title="حذف"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Preview Modal */}
            {
                previewInvoice && (
                    <InvoicePreviewModal
                        isOpen={!!previewInvoice}
                        onClose={() => setPreviewInvoice(null)}
                        invoice={{
                            id: previewInvoice.id,
                            studentName: previewInvoice.studentName,
                            amount: previewInvoice.amount,
                            date: previewInvoice.date,
                            dueDate: previewInvoice.dueDate,
                            description: previewInvoice.description,
                            status: previewInvoice.status,
                            notes: previewInvoice.notes,
                            items: previewInvoice.items
                        }}
                    />
                )
            }

            <ConfirmModal
                isOpen={deleteAllModalOpen}
                title="حذف جميع الفواتير"
                message={`هل أنت متأكد من حذف جميع فواتير الطلاب (${invoices.length})؟ لا يمكن التراجع عن هذا الإجراء.`}
                onConfirm={handleDeleteAll}
                onClose={() => setDeleteAllModalOpen(false)}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deletingId}
                title="حذف الفاتورة"
                message="هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={confirmDelete}
                onClose={() => setDeletingId(null)}
            />
        </div >

    );
};
