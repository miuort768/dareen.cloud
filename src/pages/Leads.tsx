import { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Search, CheckCircle2, Clock, TrendingUp, Plus, EyeOff, Eye, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import type { Lead, LeadStatus } from '../features/crm/types';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { PrimaryBtn, StatItem } from './leads/components/LeadsUI';
import { LeadTable } from './leads/components/LeadTable';
import { LeadCards } from './leads/components/LeadCards';
import { AddLeadModal } from './leads/components/AddLeadModal';
import { LeadsSkeleton } from './leads/components/LeadsSkeleton';
import { LeadDrawer } from './leads/components/LeadDrawer';
import { useUIStore } from '../store/uiStore';

const ConfirmDeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        cancelRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            dir="rtl"
        >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card w-full max-w-sm shadow-elevation-2 rounded-xl overflow-hidden border border-border/50">
                <div className="bg-error px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-error-soft">
                            <AlertTriangle size={18} className="text-error" />
                        </div>
                        <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                    </div>
                    <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-on-error/70 rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
                </div>
                <div className="p-5">
                    <p className="text-sm font-bold text-main mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                    <p className="text-xs text-muted leading-relaxed">
                        سيتم نقل العميل <span className="text-error font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.
                    </p>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                    <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                    <button onClick={onConfirm} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-xl transition-all active:scale-[0.98] shadow-soft">تأكيد الحذف</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const Leads = () => {
    useEffect(() => { document.title = 'العملاء المحتملون | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const showNotification = useUIStore((s) => s.showNotification);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [confirmLeadId, setConfirmLeadId] = useState<string | null>(null);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
        socket.on(SOCKET_EVENTS.LEAD_UPDATED, handleLeadUpdate);
        return () => { socket.off(SOCKET_EVENTS.LEAD_UPDATED, handleLeadUpdate); };
    }, [queryClient]);

    const addMutation = useMutation({
        mutationFn: crmService.add,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            setIsAddModalOpen(false);
            formRef.current?.reset();
            showNotification('تمت إضافة العميل بنجاح', 'success');
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => { showNotification(err?.response?.data?.error || err.message, 'error'); }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Lead> }) => crmService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            showNotification('تم تحديث العميل بنجاح', 'success');
        },
        onError: (err: Error) => { showNotification(err.message, 'error'); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => crmService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            showNotification('تم حذف العميل', 'success');
        },
        onError: (err: Error) => { showNotification(err.message, 'error'); }
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
    const handleOpenDrawer = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDrawerOpen(true);
    };

    const statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }> = {
        new: { label: 'جديد', color: 'text-info', bg: 'bg-info-light dark:bg-info/20' },
        contacted: { label: 'تم الاتصال', color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/20' },
        interested: { label: 'مهتم', color: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
        trial: { label: 'حصة تجريبية', color: 'text-primary', bg: 'bg-primary-soft dark:bg-card' },
        converted: { label: 'محول', color: 'text-info', bg: 'bg-info-light dark:bg-info/20' },
        lost: { label: 'مفقود', color: 'text-error', bg: 'bg-error-light dark:bg-error/20' }
    };

    if (isLoading) return <LeadsSkeleton />;

    if (isLeadsError) {
        return (
            <div className="bg-surface dark:bg-background min-h-screen pb-24" dir="rtl">
            <div className="relative z-10 mx-auto px-2 md:px-4 max-w-page">
                    <ErrorBanner className="mt-6 md:mt-10" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-2 max-w-page">
                {/* Header */}
                <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center">
                                <Users size={17} className="text-success" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">العملاء المتوقعون</h1>
                                <p className="text-[10px] text-dim">{filteredLeads.length} عميل نشط</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setShowLost(!showLost)} className={cn(
                                "h-8 px-2.5 flex items-center justify-center gap-1 text-[10px] font-bold transition-all rounded-lg border",
                                showLost
                                    ? "bg-error-soft text-error border-error/20"
                                    : "bg-background border-border text-dim"
                            )}>
                                {showLost ? <Eye size={11} /> : <EyeOff size={11} />}
                                <span>{showLost ? 'عرض' : 'المفقودين'}</span>
                            </button>
                            <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-8 px-2.5 text-[10px]">
                                <Plus size={11} /> جديد
                            </PrimaryBtn>
                        </div>
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
                <div className="mb-6 space-y-3">
                    <div className="bg-card border border-border/50 shadow-soft rounded-card p-4">
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input type="text" placeholder="بحث عن عميل أو رقم هاتف..." aria-label="بحث عن عميل" className="w-full bg-surface border border-border/60 rounded-xl px-9 py-2.5 outline-none text-sm text-main placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    {/* Status Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={cn(
                                "shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border transition-all",
                                filterStatus === 'all'
                                    ? "bg-main text-on-primary border-main"
                                    : "bg-card text-muted border-border/60 hover:border-border hover:text-main"
                            )}
                        >
                            الكل
                        </button>
                        {Object.entries(statusConfig).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key as LeadStatus | 'all')}
                                className={cn(
                                    "shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border transition-all",
                                    filterStatus === key
                                        ? `${value.bg} ${value.color} border-current`
                                        : "bg-card text-muted border-border/60 hover:border-border hover:text-main"
                                )}
                            >
                                {value.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table (desktop) / Cards (mobile) OR Add form */}
                <div>
                    {/* Search result count */}
                    {!isAddModalOpen && (searchTerm || filterStatus !== 'all') && (
                        <p className="text-xs text-muted mb-3 px-1">
                            تم العثور على <span className="font-bold text-main">{filteredLeads.length}</span> عميل
                        </p>
                    )}

                    {isAddModalOpen ? (
                        <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />
                    ) : (
                        <>
                            <LeadTable filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                            <LeadCards filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
                </AnimatePresence>

                <LeadDrawer
                    lead={selectedLead}
                    isOpen={isDrawerOpen}
                    onClose={() => { setIsDrawerOpen(false); setSelectedLead(null); }}
                    statusConfig={statusConfig}
                    updateMutation={updateMutation}
                />
            </div>
        </motion.div>
    );
};
