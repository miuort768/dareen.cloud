import { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Search, Filter, CheckCircle2, Clock, TrendingUp, Plus, EyeOff, Eye, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import { socketService } from '../lib/socket';
import type { Lead, LeadStatus } from '../features/crm/types';
import { PageLoader } from '../components/ui/PageLoader';
import { PrimaryBtn, StatItem } from './leads/components/LeadsUI';
import { LeadTable } from './leads/components/LeadTable';
import { LeadCards } from './leads/components/LeadCards';
import { AddLeadModal } from './leads/components/AddLeadModal';

const ConfirmDeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        dir="rtl"
    >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-sm shadow-soft rounded-card overflow-hidden border border-border/50">
            <div className="bg-error px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-card bg-error-soft">
                        <AlertTriangle size={18} className="text-error" />
                    </div>
                    <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                </div>
                <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-on-error/70 rounded-card transition-all" aria-label="إغلاق"><X size={16} /></button>
            </div>
            <div className="p-5">
                <p className="text-sm font-bold text-main mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                <p className="text-xs text-muted leading-relaxed">
                    سيتم نقل العميل <span className="text-error font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.
                </p>
            </div>
            <div className="flex gap-2 p-5 pt-0">
                <button type="button" onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-card transition-all active:scale-[0.98]">إلغاء</button>
                <button onClick={onConfirm} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-card transition-all active:scale-[0.98] shadow-soft">تأكيد الحذف</button>
            </div>
        </motion.div>
    </motion.div>
);

export const Leads = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [confirmLeadId, setConfirmLeadId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { data: leads = [], isLoading, isError: isLeadsError } = useQuery({ queryKey: ['leads'], queryFn: crmService.getAll });
    const { data: stats } = useQuery({ queryKey: ['lead-stats'], queryFn: crmService.getStats });

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;
        const handleLeadUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        };
        socket.on('lead_updated', handleLeadUpdate);
        return () => { socket.off('lead_updated', handleLeadUpdate); };
    }, [queryClient]);

    const addMutation = useMutation({
        mutationFn: crmService.add,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            setIsAddModalOpen(false);
            formRef.current?.reset();
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => { alert('حدث خطأ أثناء الإضافة: ' + (err?.response?.data?.error || err.message)); }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Lead> }) => crmService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        },
        onError: (err: Error) => { alert('حدث خطأ أثناء التحديث: ' + err.message); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => crmService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        },
        onError: (err: Error) => { alert('حدث خطأ أثناء الحذف: ' + err.message); }
    });

    const filteredLeads = useMemo(() =>
        leads.filter(l => {
            if (showLost) return l.status === 'lost';
            const matchesSearch = l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
            const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
            return matchesSearch && matchesStatus && l.status !== 'lost';
        }),
    [leads, showLost, searchTerm, filterStatus]);

    const handleMarkLost = (id: string) => setConfirmLeadId(id);
    const handleConfirmDelete = () => {
        if (confirmLeadId) deleteMutation.mutate(confirmLeadId);
        setConfirmLeadId(null);
    };

    const statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }> = {
        new: { label: 'جديد', color: 'text-info', bg: 'bg-info-light dark:bg-info/20' },
        contacted: { label: 'تم الاتصال', color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/20' },
        interested: { label: 'مهتم', color: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
        trial: { label: 'حصة تجريبية', color: 'text-primary', bg: 'bg-primary-soft dark:bg-primary-active/20' },
        converted: { label: 'محول', color: 'text-info', bg: 'bg-info-light dark:bg-info/20' },
        lost: { label: 'مفقود', color: 'text-error', bg: 'bg-error-light dark:bg-error/20' }
    };

    if (isLoading) return <PageLoader />;

    if (isLeadsError) {
        return (
            <div className="bg-surface dark:bg-background min-h-screen pb-24" dir="rtl">
                <div className="relative z-10 mx-auto px-2 md:px-4 max-w-7xl">
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-card text-sm font-medium mt-6 md:mt-10">
                        عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface dark:bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-2 md:px-4 max-w-7xl">
                {/* Header */}
                <div className="bg-primary shadow-soft rounded-card px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-6 md:mt-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-card flex items-center justify-center bg-primary-soft">
                            <Users size={22} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-card-title font-bold font-heading text-on-primary leading-tight">إدارة العملاء المتوقعين</h1>
                            <p className="text-xs text-on-primary/70 mt-0.5">تتبع وإدارة العملاء المتوقعين</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setShowLost(!showLost)} className={cn(
                            "h-9 px-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all rounded-xl",
                            showLost
                                ? "bg-card text-error border border-border/50 shadow-soft"
                                : "bg-white/15 text-on-primary border border-white/20 hover:bg-white/25 shadow-soft"
                        )}>
                            {showLost ? <Eye size={13} /> : <EyeOff size={13} />}
                            <span>{showLost ? 'عرض' : 'المفقودين'}</span>
                            {!showLost && <span className="bg-error text-on-error text-micro font-bold w-4 h-4 flex items-center justify-center rounded-full">{leads.filter(l => l.status === 'lost').length}</span>}
                        </button>
                        <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 border-0">
                            <Plus size={14} /> عميل جديد
                        </PrimaryBtn>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <StatItem title="إجمالي المهتمين" value={stats?.total || 0} icon={Users} />
                    <StatItem title="عملاء جدد" value={stats?.new || 0} icon={Clock} />
                    <StatItem title="تم التحويل" value={stats?.converted || 0} icon={CheckCircle2} />
                    <StatItem title="معدل التحويل" value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`} icon={TrendingUp} />
                </div>

                {/* Search & Filter */}
                <div className="bg-card border border-border/50 shadow-soft rounded-card mb-6 p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input type="text" placeholder="بحث عن عميل أو رقم هاتف..." aria-label="بحث عن عميل" className="w-full bg-card border border-border/60 rounded-xl px-9 py-2.5 outline-none text-xs text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={14} className="text-muted hidden md:block shrink-0" />
                            <div className="relative w-full md:w-auto">
                                <select aria-label="تصفية حسب الحالة" className="w-full md:w-auto appearance-none bg-card border border-border/60 rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-main" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}>
                                    <option value="all" className="text-main">كل الحالات</option>
                                    {Object.entries(statusConfig).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                                </select>
                                <ChevronDown className="absolute start-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table (desktop) / Cards (mobile) OR Add form */}
                <div>
                    {isAddModalOpen ? (
                        <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />
                    ) : (
                        <>
                            <LeadTable filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                            <LeadCards filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                        </>
                    )}
                </div>

                {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
            </div>
        </motion.div>
    );
};
