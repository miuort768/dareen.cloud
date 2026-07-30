import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, EyeOff, Eye, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import type { Lead, LeadStatus } from '../features/crm/types';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { StatCard, PrimaryBtn, statusColors, statusEmojis } from './leads/components/LeadsUI';
import { LeadTable } from './leads/components/LeadTable';
import { LeadCards } from './leads/components/LeadCards';
import { AddLeadModal } from './leads/components/AddLeadModal';
import { LeadsSkeleton } from './leads/components/LeadsSkeleton';
import { LeadDrawer } from './leads/components/LeadDrawer';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';

const ConfirmDeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        cancelRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card w-full max-w-sm shadow-elevation-2 rounded-2xl overflow-hidden border border-border">
                <div className="bg-error px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15"><AlertTriangle size={18} className="text-on-error" /></div>
                        <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                    </div>
                    <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-on-error/70 rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
                </div>
                <div className="p-5">
                    <p className="text-sm font-bold text-main mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                    <p className="text-xs text-muted leading-relaxed">سيتم نقل العميل <span className="text-error font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.</p>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                    <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                    <button onClick={onConfirm} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-xl transition-all active:scale-[0.98]">تأكيد الحذف</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatusKeys: LeadStatus[] = ['new', 'contacted', 'interested', 'trial', 'converted'];

export const Leads = () => {
    useEffect(() => { document.title = 'العملاء المحتملون | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const showNotification = useUIStore((s) => s.showNotification);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [confirmLeadId, setConfirmLeadId] = useState<string | null>(null);
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
            const q = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                l.studentName.toLowerCase().includes(q) ||
                l.phone.includes(q) ||
                l.subject?.toLowerCase().includes(q) ||
                l.curriculum?.toLowerCase().includes(q) ||
                statusColors[l.status as LeadStatus]?.label.includes(q);
            const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
            return matchesSearch && matchesStatus && l.status !== 'lost';
        }),
    [leads, showLost, searchTerm, filterStatus]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: leads.filter(l => l.status !== 'lost').length };
        StatusKeys.forEach(key => { counts[key] = leads.filter(l => l.status === key).length; });
        return counts;
    }, [leads]);

    const handleMarkLost = (id: string) => setConfirmLeadId(id);
    const handleConfirmDelete = () => {
        if (confirmLeadId) deleteMutation.mutate(confirmLeadId);
        setConfirmLeadId(null);
    };
    const handleOpenDrawer = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDrawerOpen(true);
    };

    if (isLoading) return <LeadsSkeleton />;

    if (isLeadsError) {
        return (
            <div className="bg-background min-h-screen pb-24" dir="rtl">
                <div className="relative z-10 mx-auto px-2 md:px-4 max-w-page">
                    <ErrorBanner className="mt-6 md:mt-10" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-2 max-w-page">
                {/* ===== HEADER ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary/10 via-primary-soft/50 to-primary/5 border border-primary/10 mt-4 mb-4">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(91,77,255,0.06),transparent_60%)]" />
                    <div className="relative px-4 md:px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👥</span>
                                <div>
                                    <h1 className="text-sm font-bold text-main">العملاء المتوقعون</h1>
                                    <p className="text-[11px] text-muted mt-0.5">
                                        <span className="font-bold text-main">{leads.filter(l => l.status !== 'lost').length}</span> عميل نشط
                                        {' · '}
                                        <span className="font-bold text-success">{stats?.new || 0}</span> جديد هذا الشهر
                                        {' · '}
                                        <span className="font-bold text-primary">{stats?.conversionRate?.toFixed(1) || 0}%</span> معدل التحويل
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setShowLost(!showLost)} className={cn(
                                    'h-8 px-2.5 flex items-center justify-center gap-1 text-[10px] font-bold transition-all rounded-lg border',
                                    showLost ? 'bg-error-soft text-error border-error/20' : 'bg-card border-border text-muted hover:bg-hover'
                                )}>
                                    {showLost ? <Eye size={11} /> : <EyeOff size={11} />}
                                    <span>{showLost ? 'عرض النشطاء' : 'المفقودين'}</span>
                                </button>
                                <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-8 px-3 text-[10px]">
                                    <Plus size={12} /> عميل جديد
                                </PrimaryBtn>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== STATS ===== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                    <StatCard title="إجمالي العملاء" value={stats?.total || 0} sparklineColor="bg-primary" />
                    <StatCard title="عملاء جدد" value={stats?.new || 0} sparklineColor="bg-info" />
                    <StatCard title="تم التحويل" value={stats?.converted || 0} sparklineColor="bg-success" />
                    <StatCard title="معدل التحويل" value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`} sparklineColor="bg-warning" />
                </div>

                {/* ===== SEARCH + FILTERS ===== */}
                <div className="mb-5 space-y-3">
                    {/* Search */}
                    <div className="bg-card border border-border rounded-xl px-3 py-0 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <Search size={15} className="text-muted shrink-0" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم، الهاتف، المادة، الحالة..."
                            aria-label="بحث عن عميل"
                            className="w-full bg-transparent outline-none text-xs text-main placeholder:text-muted py-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="text-muted hover:text-main transition-colors p-1">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filter pills (Gmail-style with counts) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={cn(
                                'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-all',
                                filterStatus === 'all'
                                    ? 'bg-primary text-on-primary border-primary'
                                    : 'bg-card text-muted border-border hover:border-border hover:text-main'
                            )}
                        >
                            📊 الكل
                            <span className={cn(
                                'text-[10px] px-1.5 py-px rounded-full',
                                filterStatus === 'all' ? 'bg-white/15 text-on-primary' : 'bg-surface text-muted'
                            )}>{statusCounts.all}</span>
                        </button>
                        {StatusKeys.map((key) => {
                            const cfg = statusColors[key];
                            const emoji = statusEmojis[key];
                            const isActive = filterStatus === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={cn(
                                        'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-all',
                                        isActive
                                            ? `${cfg.bg} ${cfg.color} border-current/30`
                                            : 'bg-card text-muted border-border hover:border-border hover:text-main'
                                    )}
                                >
                                    {emoji && <span>{emoji}</span>}
                                    {cfg.label}
                                    <span className={cn(
                                        'text-[10px] px-1.5 py-px rounded-full',
                                        isActive ? `${cfg.bg} border border-current/20` : 'bg-surface text-muted'
                                    )}>{statusCounts[key]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div>
                    {(searchTerm || filterStatus !== 'all') && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted mb-3 px-1">
                            تم العثور على <span className="font-bold text-main">{filteredLeads.length}</span> عميل
                        </motion.p>
                    )}

                    {isAddModalOpen ? (
                        <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />
                    ) : (
                        <>
                            <LeadTable filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                            <LeadCards filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
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
                    updateMutation={updateMutation}
                />
            </div>
        </motion.div>
    );
};
