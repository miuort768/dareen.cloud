import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Calendar, Plus, X, UserPlus, Trash2, Printer, Sparkles, GraduationCap } from 'lucide-react';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import {
    type TeacherInvoice,
    type Teacher,
    type TeacherInvoiceFormData,
    INVOICE_STATUS,
} from '../types/invoice';
import { PageLoader } from '../components/ui/PageLoader';
import { SectionCard, InputField, PrimaryBtn, SecondaryBtn, DangerBtn } from './teacher-invoices/components/InvoiceUI';
import { InvoiceStats } from './teacher-invoices/components/InvoiceStats';
import { InvoiceForm } from './teacher-invoices/components/InvoiceForm';
import { InvoiceTable } from './teacher-invoices/components/InvoiceTable';

export const TeacherInvoices = () => {
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
        personalExpenses: '',
        currency: 'EGP'
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

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const [invData, teaData] = await Promise.all([
                api.get<Record<string, unknown>[]>('/invoices/teacher'),
                api.get<Record<string, unknown>[]>('/teachers')
            ]);

            const formattedData = (Array.isArray(invData) ? invData : ((invData as Record<string, unknown>).data as Record<string, unknown>[] || [])).map((item: { id: string; teacherName: string; totalAmount: number; paidAmount: number; status: string; date: string; teacherId?: string }) => ({
                ...item,
                id: String(item.id)
            })) as TeacherInvoice[];

            setInvoices(formattedData);
            setTeachers(Array.isArray(teaData) ? teaData : (teaData as Record<string, unknown>).data as Record<string, unknown>[] || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('��� �� ����� ��������. ���� �������� ��� ����.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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
            personalExpenses: invoice.personalExpenses ? invoice.personalExpenses.toString() : '',
            currency: invoice.currency || 'EGP'
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
            personalExpenses: '',
            currency: 'EGP'
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
            currency: formData.currency || 'EGP',
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
            showNotification(editingId ? '�� ����� �������� �����' : '�� ����� �������� �����', 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            showNotification('��� ��� ����� ��� ��������', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, editingId, handleCancel, fetchInvoices, showNotification]);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: '��� ��������',
            message: '�� ��� ����� �� ��� ��� �������ɿ �� ���� ������� �� ��� �������.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/invoices/teacher/${id}`);
                    fetchInvoices();
                    showNotification('�� ��� �������� �����', 'success');
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                    showNotification('��� ��� ����� ��� ��������', 'error');
                }
            }
        });
    }, [fetchInvoices, showNotification]);

    const handleDeleteAll = useCallback(() => {
        if (invoices.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: '��� ���� ��������',
            message: `�� ��� ����� �� ��� ���� �������� (${invoices.length})� �� ���� ������� �� ��� �������.`,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const deletePromises = invoices.map(inv =>
                        api.delete(`/invoices/teacher/${inv.id}`)
                    );
                    await Promise.all(deletePromises);
                    await fetchInvoices();
                    showNotification('�� ��� ���� �������� �����', 'success');
                } catch (error) {
                    console.error('Error deleting all invoices:', error);
                    showNotification('��� ��� ����� ��� ��������', 'error');
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
                api.get<Record<string, unknown>[]>('/teachers'),
                api.get<Record<string, unknown>[]>('/sessions')
            ]);

            const currentTeacherNames = new Set(invoices.map(inv => inv.teacher));
            const teachersToImport = teachersList.filter((t: { name: string }) => !currentTeacherNames.has(t.name));

            if (teachersToImport.length === 0) {
                setConfirmModal({
                    isOpen: true,
                    title: '�� ���� ������ �����',
                    message: '���� �������� �������� ������ ������ �� ����� ��������.',
                    isDestructive: false,
                    onConfirm: () => { }
                });
                setLoading(false);
                return;
            }

            setLoading(false);
            setConfirmModal({
                isOpen: true,
                title: '������� ��������',
                message: `���� ������� ${teachersToImport.length} ����� ����� ������� ��������� �� ��� �����. �� ���� ��������ѿ`,
                isDestructive: false,
                onConfirm: async () => {
                    try {
                        setLoading(true);
                        const importPromises = teachersToImport.map((t: { id?: string; name: string; subject?: string; price?: number }) => {
                            const teacherSessions = allSessions.filter((sess: { teacherId?: string; teacherName?: string; status?: string }) =>
                                (sess.teacherId === t.id || sess.teacherName === t.name) &&
                                sess.status === 'completed'
                            );
                            const totalAmount = teacherSessions.reduce((sum: number, sess: { teacherPrice?: number }) => sum + (sess.teacherPrice || t.price || 0), 0);

                            return api.post('/invoices/teacher', {
                                teacherId: t.id || null,
                                teacher: t.name,
                                specialization: t.subject || '',
                                amount: totalAmount,
                                paymentMethod: 'نقدي',
                                status: INVOICE_STATUS.PROCESSING,
                                personalExpenses: 0,
                                currency: 'EGP',
                                date: new Date().toISOString().split('T')[0]
                            });
                        });

                        await Promise.all(importPromises);
                        await fetchInvoices();
                        showNotification(`�� ������� ${teachersToImport.length} ����� �����`, 'success');
                    } catch (error) {
                        console.error('Error importing teachers:', error);
                        showNotification('��� ��� ����� ������� ��������', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
            showNotification('��� ��� ����� ��� ������ ��������', 'error');
            setLoading(false);
        }
    }, [invoices, fetchInvoices, showNotification]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-4">

            <div className="bg-primary rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                        <GraduationCap size={22} className="text-on-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-on-primary leading-tight">فواتير المعلمات</h1>
                        <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">إدارة مستحقات المعلمات المالية</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 whitespace-nowrap rounded-xl bg-success text-on-success">
                    <Sparkles size={13} />
                    {stats.totalAmount.toLocaleString()} ج.م إجمالي المستحقات
                </div>
            </div>

            <InvoiceStats stats={stats} />

            <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-3">
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                        <div className="flex-1 flex gap-3 items-center w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary opacity-50" size={14} />
                                <input
                                    placeholder="بحث باسم المعلمة..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl ps-9 py-2 text-xs font-bold outline-none text-on-primary placeholder:text-on-primary bg-white/15"
                                />
                            </div>
                            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/15">
                                <Calendar size={14} className="text-on-primary opacity-50" />
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-xs font-bold text-on-primary outline-none cursor-pointer" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-micro font-bold text-on-primary opacity-50">إلى</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-xs font-bold text-on-primary outline-none cursor-pointer" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-auto min-w-[140px] rounded-xl px-3 py-2 text-xs font-bold outline-none text-on-primary bg-white/15"
                            >
                                <option value="all" className="text-main">جميع الحالات</option>
                                {Object.values(INVOICE_STATUS).map(status => (
                                    <option key={status} value={status} className="text-main">{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            {!isTeacher && (
                                <>
                        <PrimaryBtn onClick={() => setShowForm(!showForm)} className="whitespace-nowrap">
                            {showForm ? <X size={14} /> : <Plus size={14} />}
                            {showForm ? 'إلغاء' : 'إضافة فاتورة'}
                        </PrimaryBtn>
                        <SecondaryBtn onClick={handleImportTeachers} title="استيراد من الحصص">
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
            </div>

                <InvoiceForm
                    showForm={showForm}
                    editingId={editingId}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    teachers={teachers}
                    isSaving={isSaving}
                    INVOICE_STATUS={INVOICE_STATUS}
                />

                <InvoiceTable
                    filteredInvoices={filteredInvoices}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    isTeacher={isTeacher}
                />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
            </div>
        </div>
    );
};
