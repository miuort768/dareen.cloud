import { useState, useEffect, useMemo } from 'react';


import { useShowNotification } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { InvoicePreviewModal } from '../features/finance/components/InvoicePreviewModal';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';
import { InvoiceStats } from './student-invoices/components/InvoiceStats';
import { InvoiceForm } from './student-invoices/components/InvoiceForm';
import { InvoiceTable } from './student-invoices/components/InvoiceTable';
import { useImportStudents } from './student-invoices/components/ImportStudents';
import { StudentInvoicesHeader } from './student-invoices/student-invoices-page';

interface StudentInvoice {
    id: string; studentId: string; studentName: string; amount: number;
    description: string; date: string; dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod?: string; notes?: string;
    items?: { description: string; date?: string; amount: number }[];
}

interface Student {
    id: string; name: string; grade: string; parentPhone: string; sessionPrice?: number;
    enrollments: { teacher: string; subject: string; sessionsTotal: number; sessionsUsed: number; price?: number }[];
}

interface SessionRecord {
    id: string;
    studentId: string;
    date: string;
    subject?: string;
    teacherName?: string;
    price?: number;
    status?: string;
    [key: string]: unknown;
}

export const StudentInvoices = () => {
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const showNotification = useShowNotification();
    const [previewInvoice, setPreviewInvoice] = useState<StudentInvoice | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '', amount: '', description: 'رسوم دراسية',
        date: new Date().toLocaleDateString('en-CA'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
        status: 'pending' as 'paid' | 'pending' | 'overdue',
        paymentMethod: 'نقدي', notes: '', currency: 'KWD',
        items: [] as { description: string; date?: string; amount: number }[]
    });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesData, studentsData, sessionsData] = await Promise.all([
                api.get<StudentInvoice[]>('/studentInvoices'),
                api.get<Student[]>('/students'),
                api.get<SessionRecord[]>('/sessions')
            ]);
            setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData as { data?: StudentInvoice[] }).data || []);
            setStudents(Array.isArray(studentsData) ? studentsData : (studentsData as { data?: Student[] }).data || []);
            setAllSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData as { data?: SessionRecord[] }).data || []);
        } catch (error) { console.error("Error fetching data", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredInvoices = useMemo(() => invoices.filter(inv => {
        const sName = inv.studentName || '';
        const desc = inv.description || '';
        const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, filterStatus]);

    const handleEdit = (invoice: StudentInvoice) => {
        setEditingId(invoice.id);
        setFormData({
            studentId: invoice.studentId, amount: invoice.amount.toString(), description: invoice.description,
            date: invoice.date, dueDate: invoice.dueDate || invoice.date, status: invoice.status,
            paymentMethod: invoice.paymentMethod || '', notes: invoice.notes || '',
            currency: (invoice as { currency?: string }).currency || 'KWD', items: invoice.items || []
        });
        setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ studentId: '', amount: '', description: 'رسوم دراسية', date: new Date().toLocaleDateString('en-CA'), dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'), status: 'pending', paymentMethod: 'نقدي', notes: '', currency: 'KWD', items: [] });
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
            const studentSessions = allSessions.filter(sess =>
                sess.studentId === studentId && (sess.status === 'completed' || sess.status === 'cancelled'));
            const items = studentSessions.map(sess => ({
                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? 'حضور' : 'غياب'})`,
                amount: sess.price || student.sessionPrice || 0, date: sess.date
            }));
            setFormData({ ...formData, studentId, description: subjects ? `دروس: ${subjects}` : 'رسوم دراسية', amount: (items.length > 0 ? items.reduce((s, i) => s + i.amount, 0) : totalAmount).toString(), items });
        } else setFormData({ ...formData, studentId, items: [] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const student = students.find(s => s.id === formData.studentId);
        if (!student) { showNotification('خطأ: لم يتم العثور على الطالب', 'error'); setIsSaving(false); return; }
        const invoiceData = { studentId: student.id, studentName: student.name, amount: Number(formData.amount), description: formData.description, date: formData.date, dueDate: formData.dueDate, status: formData.status, paymentMethod: formData.paymentMethod, notes: formData.notes, currency: formData.currency, items: formData.items };
        try {
            if (editingId) await api.put(`/studentInvoices/${editingId}`, { ...invoiceData, id: editingId });
            else await api.post('/studentInvoices', invoiceData);
            fetchData(); handleCancel();
            showNotification(editingId ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح', 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            showNotification('فشل في حفظ الفاتورة', 'error');
        } finally { setIsSaving(false); }
    };

    const toggleStatus = async (invoice: StudentInvoice) => {
        const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';
        try { await api.patch(`/studentInvoices/${invoice.id}`, { status: newStatus }); fetchData(); showNotification('تم تحديث الحالة', 'success'); }
        catch (error) { console.error(error); showNotification('فشل التحديث', 'error'); }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try { await api.delete(`/studentInvoices/${deletingId}`); fetchData(); showNotification('تم حذف الفاتورة بنجاح', 'success'); }
        catch (error) { console.error('Error deleting invoice:', error); showNotification('فشل حذف الفاتورة', 'error'); }
        finally { setDeletingId(null); }
    };

    const handleDeleteAll = async () => {
        if (invoices.length === 0) return;
        try {
            setLoading(true);
            await Promise.all(invoices.map(inv => api.delete(`/studentInvoices/${inv.id}`)));
            fetchData(); showNotification('تم حذف جميع الفواتير بنجاح', 'success');
        } catch (error) { console.error('Error deleting all invoices:', error); showNotification('فشل حذف جميع الفواتير', 'error'); }
        finally { setLoading(false); setDeleteAllModalOpen(false); }
    };

    const { handleImportStudents } = useImportStudents({ setLoading, showNotification, fetchData, setConfirmModal });

    const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const pendingRevenue = useMemo(() => invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const overdueRevenue = useMemo(() => invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const paidCount = useMemo(() => invoices.filter(i => i.status === 'paid').length, [invoices]);
    const pendingCount = useMemo(() => invoices.filter(i => i.status === 'pending').length, [invoices]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="mx-auto px-2 space-y-4">
                <StudentInvoicesHeader totalRevenue={totalRevenue} searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterStatus={filterStatus} onFilterChange={(v) => setFilterStatus(v as 'all' | 'paid' | 'pending' | 'overdue')}
                    showForm={showForm} onToggleForm={() => setShowForm(!showForm)}
                    onImport={handleImportStudents} onPrint={() => window.print()} onDeleteAll={() => setDeleteAllModalOpen(true)} />
                <InvoiceStats totalRevenue={totalRevenue} pendingRevenue={pendingRevenue} overdueRevenue={overdueRevenue}
                    invoicesLength={invoices.length} paidCount={paidCount} pendingCount={pendingCount} />
                <InvoiceForm showForm={showForm} editingId={editingId} formData={formData}
                    setFormData={setFormData} handleSubmit={handleSubmit} handleCancel={handleCancel}
                    handleStudentChange={handleStudentChange} students={students} isSaving={isSaving} />
                <InvoiceTable filteredInvoices={filteredInvoices} toggleStatus={toggleStatus}
                    handleEdit={handleEdit} setPreviewInvoice={setPreviewInvoice} setDeletingId={setDeletingId} />
                <ConfirmModal isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={confirmDelete}
                    title="حذف الفاتورة" message="هل أنت متأكد من أنك تريد حذف هذه الفاتورة؟" isDestructive={true} />
                <ConfirmModal isOpen={deleteAllModalOpen} onClose={() => setDeleteAllModalOpen(false)}
                    onConfirm={handleDeleteAll} title="حذف الكل" message="سيتم حذف جميع الفواتير. لا يمكن التراجع." isDestructive={true} />
                <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
                {previewInvoice && <InvoicePreviewModal isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)} invoice={previewInvoice} />}
            </div>
        </div>
    );
};
