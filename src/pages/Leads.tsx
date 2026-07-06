import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Filter, CheckCircle2, Clock, TrendingUp, Plus, EyeOff, Eye, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import { socketService } from '../lib/socket';
import type { Lead, LeadStatus } from '../features/crm/types';
import { PageLoader } from '../components/ui/PageLoader';
import { SectionCard, PrimaryBtn, StatItem } from './leads/components/LeadsUI';
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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-primary-active w-full max-w-sm shadow-xl rounded-2xl overflow-hidden border border-border dark:border-border">
            <div className="bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
                        <AlertTriangle size={18} className="text-on-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-on-primary">تأكيد الحذف</h3>
                </div>
                <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-on-primary/70 rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
            </div>
            <div className="p-5">
                <p className="text-sm font-bold text-main dark:text-dim mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                <p className="text-xs font-bold text-muted leading-relaxed">
                    سيتم نقل العميل <span className="text-error font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.
                </p>
            </div>
            <div className="flex gap-2 p-5 pt-0">
                <button onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-muted bg-surface dark:bg-primary-active hover:bg-surface dark:hover:bg-primary-active rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                <button onClick={onConfirm} className="flex-1 py-3 text-xs font-bold text-on-primary bg-gradient-to-l from-[var(--bg-error)] to-[var(--bg-error)] hover:from-[var(--bg-error)] hover:to-[var(--bg-error)] rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-error/20">تأكيد الحذف</button>
            </div>
        </motion.div>
    </motion.div>
);

export const Leads: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [confirmLeadId, setConfirmLeadId] = useState<string | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const { data: leads = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: crmService.getAll });
    const { data: stats } = useQuery({ queryKey: ['lead-stats'], queryFn: crmService.getStats });

    useEffect(() => {
        const socket = socketService.getSocket();
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
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => crmService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        }
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-primary-light dark:bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-2 md:px-4 max-w-7xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] rounded-2xl px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-lg shadow-primary/20 mt-6 md:mt-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                            <Users size={22} className="text-on-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-on-primary leading-tight">إدارة العملاء المتوقعين</h1>
                            <p className="text-micro font-bold text-on-primary/70 mt-0.5">تتبع وإدارة العملاء المتوقعين</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setShowLost(!showLost)} className={cn(
                            "h-9 px-3 flex items-center justify-center gap-1.5 text-micro font-bold transition-all border rounded-xl",
                            showLost
                                ? "bg-white text-error border-border dark:bg-primary-active dark:text-on-primary dark:border-border"
                                : "bg-white/15 backdrop-blur-sm text-on-primary border-white/20 hover:bg-white/25"
                        )}>
                            {showLost ? <Eye size={13} /> : <EyeOff size={13} />}
                            <span>{showLost ? 'عرض' : 'المفقودين'}</span>
                            {!showLost && <span className="bg-error text-on-primary text-micro font-bold w-4 h-4 flex items-center justify-center rounded-full">{leads.filter(l => l.status === 'lost').length}</span>}
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
                <div className="bg-white/80 dark:bg-primary-active/80 backdrop-blur-xl rounded-2xl shadow-sm border border-border dark:border-border mb-6 p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input type="text" placeholder="بحث عن عميل أو رقم هاتف..." className="w-full bg-background dark:bg-primary-active border border-border dark:border-border rounded-xl px-9 py-2 outline-none text-xs font-bold text-main dark:text-on-primary placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={14} className="text-muted hidden md:block shrink-0" />
                            <div className="relative w-full md:w-auto">
                                <select className="w-full md:w-auto appearance-none bg-background dark:bg-primary-active border border-border dark:border-border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-main dark:text-on-primary" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}>
                                    <option value="all" className="text-main">كل الحالات</option>
                                    {Object.entries(statusConfig).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" size={12} />
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
