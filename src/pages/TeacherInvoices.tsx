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
            showNotification('›‘· ›Ì  Õ„Ì· «·»Ì«‰« . Ì—ÃÏ «·„Õ«Ê·… „—… √Œ—Ï.', 'error');
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
            showNotification(editingId ? ' „  ÕœÌÀ «·›« Ê—… »‰Ã«Õ' : ' „ ≈÷«›… «·›« Ê—… »‰Ã«Õ', 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            showNotification('ÕœÀ Œÿ√ √À‰«¡ Õ›Ÿ «·»Ì«‰« ', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, editingId, handleCancel, fetchInvoices, showNotification]);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Õ–› «·›« Ê—…',
            message: 'Â· √‰  „ √ﬂœ „‰ Õ–› Â–Â «·›« Ê—…ø ·« Ì„ﬂ‰ «· —«Ã⁄ ⁄‰ Â–« «·≈Ã—«¡.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/invoices/teacher/${id}`);
                    fetchInvoices();
                    showNotification(' „ Õ–› «·›« Ê—… »‰Ã«Õ', 'success');
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                    showNotification('ÕœÀ Œÿ√ √À‰«¡ Õ–› «·›« Ê—…', 'error');
                }
            }
        });
    }, [fetchInvoices, showNotification]);

    const handleDeleteAll = useCallback(() => {
        if (invoices.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Õ–› Ã„Ì⁄ «·›Ê« Ì—',
            message: `Â· √‰  „ √ﬂœ „‰ Õ–› Ã„Ì⁄ «·›Ê« Ì— (${invoices.length})ø ·« Ì„ﬂ‰ «· —«Ã⁄ ⁄‰ Â–« «·≈Ã—«¡.`,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const deletePromises = invoices.map(inv =>
                        api.delete(`/invoices/teacher/${inv.id}`)
                    );
                    await Promise.all(deletePromises);
                    await fetchInvoices();
                    showNotification(' „ Õ–› Ã„Ì⁄ «·›Ê« Ì— »‰Ã«Õ', 'success');
                } catch (error) {
                    console.error('Error deleting all invoices:', error);
                    showNotification('ÕœÀ Œÿ√ √À‰«¡ Õ–› «·›Ê« Ì—', 'error');
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
                    title: '·«  ÊÃœ »Ì«‰«  ÃœÌœ…',
                    message: 'Ã„Ì⁄ «·„⁄·„«  «·„”Ã·Ì‰ „÷«›Ê‰ »«·›⁄· ›Ì ﬁ«∆„… «·›Ê« Ì—.',
                    isDestructive: false,
                    onConfirm: () => { }
                });
                setLoading(false);
                return;
            }

            setLoading(false);
            setConfirmModal({
                isOpen: true,
                title: '«” Ì—«œ «·„⁄·„« ',
                message: `”Ì „ «” Ì—«œ ${teachersToImport.length} „⁄·„… ÃœÌœ… Ê«Õ ”«» „” Õﬁ« Â„ „‰ ”Ã· «·Õ’’. Â·  —Ìœ «·«” „—«—ø`,
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
                                paymentMethod: '‰ﬁœÌ',
                                status: INVOICE_STATUS.PROCESSING,
                                personalExpenses: 0,
                                date: new Date().toISOString().split('T')[0]
                            });
                        });

                        await Promise.all(importPromises);
                        await fetchInvoices();
                        showNotification(` „ «” Ì—«œ ${teachersToImport.length} „⁄·„… »‰Ã«Õ`, 'success');
                    } catch (error) {
                        console.error('Error importing teachers:', error);
                        showNotification('ÕœÀ Œÿ√ √À‰«¡ «” Ì—«œ «·„⁄·„« ', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
            showNotification('ÕœÀ Œÿ√ √À‰«¡ Ã·» »Ì«‰«  «·„⁄·„« ', 'error');
            setLoading(false);
        }
    }, [invoices, fetchInvoices, showNotification]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-emerald-950/20 font-dash" dir="rtl">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2 space-y-4">

            <div className="bg-[#172554] border border-[#1e3a5f]/60 shadow-lg shadow-black/20 px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-600 to-emerald-600 text-white">
                        <GraduationCap size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">›Ê« Ì— «·„⁄·„« </h1>
                        <p className="text-[10px] text-indigo-200/70 font-medium leading-none mt-1">≈œ«—… —Ê« » Ê„” Õﬁ«  «·ﬂ«œ— «· ⁄·Ì„Ì</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-3 py-2 border border-emerald-500/20 whitespace-nowrap">
                    <Sparkles size={13} className="text-emerald-300" />
                    {stats.totalAmount.toLocaleString()} Ã.„ ≈Ã„«·Ì «·—Ê« »
                </div>
            </div>

            <InvoiceStats stats={stats} />

            <div className="border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/90 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between p-3">
                        <div className="flex-1 flex gap-3 items-center w-full">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <InputField
                                    placeholder="»ÕÀ »«”„ «·„⁄·„…..."
                                    className="pr-9 py-2 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700">
                                <Calendar size={14} className="text-slate-400" />
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-[11px] font-normal text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <span className="text-[10px] text-slate-400">?</span>
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none p-0 text-[11px] font-normal text-slate-700 dark:text-slate-200 outline-none cursor-pointer" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <InputField
                                type="select"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-auto min-w-[140px] py-2 text-xs font-normal"
                            >
                                <option value="all">Ã„Ì⁄ «·Õ«·« </option>
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
                            {showForm ? '≈·€«¡' : '≈÷«›… ›« Ê—…'}
                        </PrimaryBtn>
                        <SecondaryBtn onClick={handleImportTeachers} title="«” Ì—«œ „‰ «·„⁄·„« ">
                            <UserPlus size={14} /> «” Ì—«œ
                        </SecondaryBtn>
                        <DangerBtn onClick={handleDeleteAll} title="Õ–› «·ﬂ·">
                            <Trash2 size={14} />
                        </DangerBtn>
                                </>
                            )}
                            <SecondaryBtn onClick={() => window.print()} title="ÿ»«⁄… «·”Ã·">
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
