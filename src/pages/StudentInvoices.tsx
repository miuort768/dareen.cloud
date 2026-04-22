import { useState, useEffect } from 'react';
import {
    Plus, Wallet, TrendingUp, Trash2, CheckCircle, XCircle,
    Search, Edit, X,
    AlertCircle, FileText, Printer, UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsCard } from '../shared/components/StatsCard';
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
        return <PageLoader />;
    }

    return (
        <div className="space-y-6 pb-32 px-4 md:px-6 min-h-full md:animate-in md:fade-in md:duration-700">
            {/* Header Area */}
            <div className="relative bg-white border-2 md:border-4 border-gray-950 p-4 md:p-10 shadow-[4px_4px_0px_0px_black] md:shadow-[10px_10px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 mb-6 md:mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-950/5 -mr-16 -mt-16 rotate-45 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-600/10 -ml-12 -mb-12 rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6" dir="rtl">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-950 text-white flex items-center justify-center border-2 md:border-4 border-gray-950 transform -rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] shrink-0">
                            <FileText size={20} className="md:size-36" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-4xl font-black text-gray-950 dark:text-white mb-0.5 md:mb-1 tracking-tighter uppercase">فواتير وتحصيل الطلاب</h1>
                            <p className="text-gray-500 text-[10px] md:text-sm font-bold flex items-center gap-1.5 md:gap-2 leading-tight">
                                <TrendingUp size={12} className="md:size-[16px] text-emerald-600" />
                                إدارة التدفقات النقدية والمستحقات الدراسية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-wrap no-print w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={handleImportStudents}
                            className="flex-1 md:flex-none justify-center bg-emerald-600 text-white border-2 md:border-4 border-gray-950 px-3 md:px-6 py-2 md:py-3 font-black text-xs md:text-sm shadow-[2px_2px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] transition-all flex items-center gap-1.5 md:gap-2"
                        >
                            <UserPlus size={14} className="md:size-18" />
                            استيراد
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 md:flex-none justify-center bg-white text-gray-950 border-2 md:border-4 border-gray-950 px-3 md:px-6 py-2 md:py-3 font-black text-xs md:text-sm shadow-[2px_2px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-1.5 md:gap-2"
                        >
                            <Printer size={14} className="md:size-18" />
                            طباعة
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
            <div className="bg-white p-4 md:p-6 border-2 md:border-4 border-gray-950 shadow-[2px_2px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 mb-6 md:mb-8">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch md:items-center" dir="rtl">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث باسم الطالب أو البيان..."
                            className="w-full pr-10 pl-3 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-xs md:text-sm font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all h-[42px] md:h-[58px]"
                        />
                    </div>

                    <div className="flex items-stretch gap-2 md:gap-3 w-full lg:w-auto h-[42px] md:h-[58px]">
                        <div className="flex items-center bg-gray-50 border-2 border-gray-200 px-2 md:px-4 dark:bg-gray-800 dark:border-gray-700 flex-1 md:flex-none">
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 ml-1 md:ml-2 uppercase">الحالة:</span>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
                                className="bg-transparent py-0 text-xs md:text-sm font-black outline-none dark:text-white cursor-pointer w-full h-full"
                            >
                                <option value="all">الكل</option>
                                <option value="paid">مدفوعة</option>
                                <option value="pending">معلقة</option>
                                <option value="overdue">متأخرة</option>
                            </select>
                        </div>

                        <button
                            onClick={toggleForm}
                            className={cn(
                                "flex items-center justify-center gap-1.5 md:gap-3 px-3 md:px-8 font-black text-[10px] md:text-sm uppercase tracking-widest border-2 md:border-4 border-gray-950 shadow-[2px_2px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap",
                                showForm
                                    ? "bg-rose-600 text-white"
                                    : "bg-gray-950 text-white hover:bg-black"
                            )}
                        >
                            {showForm ? <X size={16} className="md:size-20" /> : <Plus size={16} className="md:size-20" />}
                            <span>{showForm ? 'إلغاء' : 'إصدار فاتورة'}</span>
                        </button>

                        <button
                            onClick={() => setDeleteAllModalOpen(true)}
                            className="w-10 md:w-14 bg-white border-2 md:border-4 border-gray-950 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white shadow-[2px_2px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0"
                            title="حذف الكل"
                        >
                            <Trash2 size={16} className="md:size-24" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="md:animate-in md:slide-in-from-top-4 md:duration-300">
                    <form onSubmit={handleSubmit} className="bg-white border-2 md:border-4 border-gray-950 p-4 md:p-8 shadow-[4px_4px_0px_0px_black] md:shadow-[12px_12px_0px_0px_black] dark:bg-gray-900 mb-6 md:mb-10">
                        <div className="flex items-center gap-2 mb-6 md:mb-8 border-b-2 border-gray-100 pb-3 md:pb-4">
                            <Plus size={18} className="md:size-20 text-emerald-600" />
                            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">تفاصيل الفاتورة الجديدة</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {/* Student Selection */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">اختيار الطالب</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={e => handleStudentChange(e.target.value)}
                                    className="w-full py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-xs md:text-sm font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                    dir="rtl"
                                >
                                    <option value="">اختر الطالب...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.grade})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">المبلغ الإجمالي</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full py-3 md:py-4 pr-3 md:pr-4 pl-10 md:pl-12 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-base md:text-xl font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all font-mono"
                                        placeholder="0.00"
                                        dir="rtl"
                                    />
                                    <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-[10px] md:text-xs uppercase">ج.م</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">بيان الفاتورة / الملاحظات</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-xs md:text-sm font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                    placeholder="مثال: رسوم شهر أكتوبر"
                                    dir="rtl"
                                />
                            </div>

                            {/* Status Selector */}
                            <div className="space-y-1 md:space-y-2 lg:col-span-1">
                                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">حالة الدفع</label>
                                <div className="grid grid-cols-3 border-2 border-gray-200 dark:border-gray-700 overflow-hidden h-11 md:h-14">
                                    {(['paid', 'pending', 'overdue'] as const).map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status })}
                                            className={cn(
                                                "text-[9px] md:text-[10px] font-black uppercase transition-all flex items-center justify-center",
                                                formData.status === status
                                                    ? status === 'paid' ? "bg-emerald-600 text-white" : status === 'pending' ? "bg-amber-500 text-white" : "bg-rose-600 text-white"
                                                    : "bg-white text-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            )}
                                        >
                                            {status === 'paid' ? 'مدفوعة' : status === 'pending' ? 'معلقة' : 'متأخرة'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:col-span-2">
                                <div className="space-y-1 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">تاريخ الإصدار</label>
                                    <input 
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                        className="w-full py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-xs md:text-sm font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block" dir="rtl">تاريخ الاستحقاق</label>
                                    <input 
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                        className="w-full py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-2 border-gray-200 focus:border-gray-950 outline-none text-xs md:text-sm font-black dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t-2 border-gray-100 flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-gray-200 text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:border-gray-950 hover:text-gray-950 transition-all shadow-none md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                                dir="rtl"
                            >
                                تراجع
                            </button>
                            <button
                                type="submit"
                                className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-emerald-600 text-white border-2 md:border-4 border-gray-950 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_black] md:shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                                dir="rtl"
                            >
                                {editingId ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border-4 border-gray-950 shadow-[4px_4px_0px_0px_black] md:shadow-[10px_10px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-900 text-white dark:bg-black">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10">اسم الطالب</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">البيان</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">المبلغ</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">الإصدار</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">الاستحقاق</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">الوسيلة</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] border-l border-white/10 text-center">الحالة</th>
                                <th className="px-6 py-4 font-black uppercase tracking-tighter text-[11px] text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-gray-50 dark:divide-gray-800">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <FileText size={64} className="mb-4 opacity-10" />
                                            <h3 className="font-black text-xl text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                                                {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'سجل الفواتير فارغ حالياً'}
                                            </h3>
                                            <p className="text-sm font-bold opacity-60">يمكنك البدء بإصدار فاتورة جديدة أو استيراد البيانات</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <tr
                                        key={inv.id}
                                        className={cn(
                                            "hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group",
                                            editingId === inv.id ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                                        )}
                                    >
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-950 text-white flex items-center justify-center font-black text-sm border-2 border-gray-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                                    {(inv.studentName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-950 dark:text-white uppercase tracking-tighter leading-none mb-1">{inv.studentName || 'غير معرف'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400">#{inv.id.slice(0, 6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 italic max-w-xs truncate">
                                            {inv.description}
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center">
                                            <div className="inline-flex items-center gap-1 font-black text-gray-950 dark:text-white font-mono text-lg">
                                                {inv.amount.toLocaleString()} <span className="text-[10px] opacity-40 uppercase">ج.م</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center font-mono text-xs font-black text-gray-400">
                                            {inv.date}
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center font-mono text-xs font-black text-gray-400 italic">
                                            {inv.dueDate}
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 border-2 border-gray-950">{inv.paymentMethod || 'نقدي'}</span>
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-100 dark:border-gray-800 text-center">
                                            <button
                                                onClick={() => toggleStatus(inv)}
                                                className={cn(
                                                    "inline-flex items-center px-4 py-2 font-black text-[10px] uppercase tracking-widest border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-600 text-white'
                                                        : inv.status === 'pending'
                                                            ? 'bg-amber-400 text-gray-950 shadow-[4px_4px_0px_0px_black]'
                                                            : 'bg-rose-600 text-white'
                                                )}
                                            >
                                                {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setPreviewInvoice(inv)}
                                                    className="p-3 bg-white border-2 border-gray-950 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                                                    title="معاينة"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(inv)}
                                                    className="p-3 bg-white border-2 border-gray-950 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                                                    title="تعديل"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(inv.id)}
                                                    className="p-3 bg-white border-2 border-gray-950 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_black]"
                                                    title="حذف"
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
