import { useState, useEffect, useMemo, useCallback } from 'react';


import { ConfirmModal } from '../shared/components/ConfirmModal';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { type TeacherInvoice, type Teacher, type TeacherInvoiceFormData, INVOICE_STATUS } from '../types/invoice';
import { PageLoader } from '../components/ui/PageLoader';
import { InvoiceStats } from './teacher-invoices/components/InvoiceStats';
import { InvoiceForm } from './teacher-invoices/components/InvoiceForm';
import { InvoiceTable } from './teacher-invoices/components/InvoiceTable';
import { TeacherInvoicesHeader } from './teacher-invoices/teacher-invoices-page';

export const TeacherInvoices = () => {
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
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const isTeacher = currentUser?.role === 'teacher';
    const teacherName = currentUser?.teacherName || currentUser?.name;
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean }>({
        isOpen: false, title: '', message: '', onConfirm: () => { }, isDestructive: true
    });

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const [invData, teaData] = await Promise.all([
                api.get<TeacherInvoice[]>('/invoices/teacher'),
                api.get<Teacher[]>('/teachers')
            ]);
            const formattedData = (Array.isArray(invData) ? invData : ((invData as { data?: TeacherInvoice[] }).data || [])).map((item) => ({
                ...item, id: String(item.id)
            }));
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
        const result = filteredInvoices.reduce((acc, invoice) => {
            acc.totalAmount += invoice.amount;
            acc.personalExpenses += invoice.personalExpenses || 0;
            if (invoice.status === INVOICE_STATUS.PAID) acc.paidAmount += invoice.amount;
            else acc.unpaidAmount += invoice.amount;
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
                setConfirmModal({ isOpen: true, title: 'لا يوجد معلمون جدد', message: 'جميع المعلمين المسجلين موجودون بالفعل في الفواتير.', isDestructive: false, onConfirm: () => { } });
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

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-4">
                <TeacherInvoicesHeader stats={stats} searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterStatus={filterStatus} onFilterChange={setFilterStatus}
                    startDate={startDate} onStartDateChange={setStartDate} endDate={endDate} onEndDateChange={setEndDate}
                    showForm={showForm} onToggleForm={() => setShowForm(!showForm)}
                    onImport={handleImportTeachers} onDeleteAll={handleDeleteAll} onPrint={() => window.print()} isTeacher={isTeacher} />
                <InvoiceStats stats={stats} />
                <InvoiceForm showForm={showForm} editingId={editingId} formData={formData} setFormData={setFormData}
                    handleSubmit={handleSubmit} handleCancel={handleCancel} teachers={teachers} isSaving={isSaving} INVOICE_STATUS={INVOICE_STATUS} />
                <InvoiceTable filteredInvoices={filteredInvoices} handleEdit={handleEdit} handleDelete={handleDelete} isTeacher={isTeacher} />
                <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDestructive={confirmModal.isDestructive} />
            </div>
        </div>
    );
};
