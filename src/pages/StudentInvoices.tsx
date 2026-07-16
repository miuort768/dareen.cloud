import { useState, useEffect, useMemo } from 'react';
import { Search, X, FileText, Printer, UserPlus, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useShowNotification } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { InvoicePreviewModal } from '../features/finance/components/InvoicePreviewModal';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';
import { SectionCard, InputField, PrimaryBtn, SecondaryBtn, DangerBtn } from './student-invoices/components/InvoiceUI';
import { InvoiceStats } from './student-invoices/components/InvoiceStats';
import { InvoiceForm } from './student-invoices/components/InvoiceForm';
import { InvoiceTable } from './student-invoices/components/InvoiceTable';
import { useImportStudents } from './student-invoices/components/ImportStudents';

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

export const StudentInvoices = () => {
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [allSessions, setAllSessions] = useState<Record<string, unknown>[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const showNotification = useShowNotification();
    const [previewInvoice, setPreviewInvoice] = useState<StudentInvoice | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        description: 'رسوم دراسية',
        date: new Date().toLocaleDateString('en-CA'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
        status: 'pending' as 'paid' | 'pending' | 'overdue',
        paymentMethod: 'نقدي',
        notes: '',
        currency: 'KWD',
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
                api.get<Record<string, unknown>[]>('/sessions')
            ]);
            setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData as Record<string, unknown>).data as StudentInvoice[] || []);
            setStudents(Array.isArray(studentsData) ? studentsData : (studentsData as Record<string, unknown>).data as Student[] || []);
            setAllSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData as Record<string, unknown>).data as Record<string, unknown>[] || []);
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
            currency: (invoice as { currency?: string }).currency || 'KWD',
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
            description: '���� �����',
            date: new Date().toLocaleDateString('en-CA'),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
            status: 'pending',
            paymentMethod: '����',
            notes: '',
            currency: 'KWD',
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

            const studentSessions = allSessions.filter((sess: { studentId: string; studentName?: string; status?: string }) =>
                sess.studentId === studentId &&
                (sess.status === 'completed' || sess.status === 'cancelled')
            );

            const items = studentSessions.map((sess: { id: string; date: string; studentName?: string; teacherName?: string; price?: number; subject?: string; status?: string }) => ({
                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? '����' : '����'})`,
                amount: sess.price || student.sessionPrice || 0,
                date: sess.date
            }));

            setFormData({
                ...formData,
                studentId,
                description: subjects ? `����: ${subjects}` : '���� �����',
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
            showNotification('���: ���� ������ ���� ����', 'error');
            setIsSaving(false);
            return;
        }

        const         invoiceData = {
            studentId: student.id,
            studentName: student.name,
            amount: Number(formData.amount),
            description: formData.description,
            date: formData.date,
            dueDate: formData.dueDate,
            status: formData.status,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            currency: formData.currency,
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
            showNotification(editingId ? '�� ����� �������� �����' : '�� ����� �������� �����', 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            const errorMessage = error.response?.data?.error || error.message || '��� ��� ����� ��� ��������';
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
            showNotification('�� ����� ���� ��������', 'success');
        } catch (error) {
            console.error(error);
            showNotification('��� ����� ������', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/studentInvoices/${deletingId}`);
            fetchData();
            showNotification('�� ��� �������� �����', 'success');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showNotification(error.message || '��� �� ��� ��������', 'error');
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
            showNotification('�� ��� ���� ������ ������ �����', 'success');
        } catch (error) {
            console.error('Error deleting all invoices:', error);
            showNotification('��� ��� ����� ������ ��� ����', 'error');
        } finally {
            setLoading(false);
            setDeleteAllModalOpen(false);
        }
    };

    const { handleImportStudents } = useImportStudents({
        setLoading,
        showNotification,
        fetchData,
        setConfirmModal
    });

    const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const pendingRevenue = useMemo(() => invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const overdueRevenue = useMemo(() => invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0), [invoices]);
    const paidCount = useMemo(() => invoices.filter(i => i.status === 'paid').length, [invoices]);
    const pendingCount = useMemo(() => invoices.filter(i => i.status === 'pending').length, [invoices]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="mx-auto px-2 space-y-4">

                <div className="bg-primary rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
                            <FileText size={22} className="text-on-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-on-primary leading-tight">������ ������ ������</h1>
                            <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">����� �������� ������� ���������� ��������</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 whitespace-nowrap rounded-xl bg-success text-on-success">
                        <Sparkles size={13} />
                        {totalRevenue.toLocaleString()} �.� ������ ������
                    </div>
                </div>

                <InvoiceStats
                    totalRevenue={totalRevenue}
                    pendingRevenue={pendingRevenue}
                    overdueRevenue={overdueRevenue}
                    invoicesLength={invoices.length}
                    paidCount={paidCount}
                    pendingCount={pendingCount}
                />

                <div className="bg-primary rounded-2xl p-3">
                    <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                        <div className="flex-1 flex gap-3 items-center w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary opacity-50" size={14} />
                                <input
                                    placeholder="��� ���� ������ �� ������..."
                                    className="w-full rounded-xl px-9 py-2 text-xs font-bold outline-none text-on-primary placeholder:text-on-primary placeholder:opacity-50 bg-white/15"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-on-primary bg-white/15"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
                            >
                                <option value="all">���� �������</option>
                                <option value="paid">������</option>
                                <option value="pending">�����</option>
                                <option value="overdue">������</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            <PrimaryBtn onClick={() => setShowForm(!showForm)} className="whitespace-nowrap">
                                {showForm ? <X size={14} /> : <Plus size={14} />}
                                {showForm ? '�����' : '����� ������'}
                            </PrimaryBtn>
                            <SecondaryBtn onClick={handleImportStudents} title="������� �� ��� �����">
                                <UserPlus size={14} /> �������
                            </SecondaryBtn>
                            <SecondaryBtn onClick={() => window.print()} title="����� �����">
                                <Printer size={14} />
                            </SecondaryBtn>
                            <DangerBtn onClick={() => setDeleteAllModalOpen(true)} title="��� ����">
                                <Trash2 size={14} />
                            </DangerBtn>
                        </div>
                    </div>
                </div>

                <InvoiceForm
                    showForm={showForm}
                    editingId={editingId}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    handleStudentChange={handleStudentChange}
                    students={students}
                    isSaving={isSaving}
                />

                <InvoiceTable
                    filteredInvoices={filteredInvoices}
                    toggleStatus={toggleStatus}
                    handleEdit={handleEdit}
                    setPreviewInvoice={setPreviewInvoice}
                    setDeletingId={setDeletingId}
                />

                <ConfirmModal
                    isOpen={!!deletingId}
                    onClose={() => setDeletingId(null)}
                    onConfirm={confirmDelete}
                    title="��� ��������"
                    message="�� ��� ����� �� ��� ��� �������� �������"
                    isDestructive={true}
                />

                <ConfirmModal
                    isOpen={deleteAllModalOpen}
                    onClose={() => setDeleteAllModalOpen(false)}
                    onConfirm={handleDeleteAll}
                    title="��� ����"
                    message="���� ��� ���� ������ ������ ������. �� ���� �������."
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
        </div>
    );
};
