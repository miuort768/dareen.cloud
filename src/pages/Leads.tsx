import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, EyeOff, Eye, AlertTriangle, X, Activity, BarChart3, Phone, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import type { Lead, LeadStatus } from '../features/crm/types';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { PrimaryBtn, statusColors, statusIconComponents } from './leads/components/LeadsUI';
import { LeadTable } from './leads/components/LeadTable';
import { LeadCards } from './leads/components/LeadCards';
import { AddLeadModal } from './leads/components/AddLeadModal';
import { LeadsSkeleton } from './leads/components/LeadsSkeleton';
import { LeadDrawer } from './leads/components/LeadDrawer';
import { useUIStore } from '../store/uiStore';
import { useAcademyName } from '../context/AppContext';
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
                    <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center bg-white/15 hover:bg-white/25 text-on-error rounded-lg transition-all" aria-label="إغلاق"><X size={14} /></button>
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
    const academyName = useAcademyName();
    useEffect(() => { document.title = `العملاء المحتملون | ${academyName} للتعليم والتدريب`; }, [academyName]);
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
        leads.filter((l: Lead) => {
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
        const counts: Record<string, number> = { all: leads.filter((l: Lead) => l.status !== 'lost').length };
        StatusKeys.forEach(key => { counts[key] = leads.filter((l: Lead) => l.status === key).length; });
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
                <div className="relative z-10 mx-auto px-4 md:px-6 max-w-page">
                    <ErrorBanner className="mt-6 md:mt-10" />
                </div>
            </div>
        );
    }

    const activeCount = leads.filter((l: Lead) => l.status !== 'lost').length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-4 md:px-6 max-w-page">
                {/* ===== HERO SECTION ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-deep mt-4 mb-6">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

                    <div className="relative z-10 px-5 md:px-8 py-6 md:py-8">
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold font-outfit text-white mb-1">العملاء المتوقعون</h1>
                                <p className="text-white/60 text-xs md:text-sm">تابع وأدر جميع العملاء المتوقعين وحوّلهم إلى عقود ناجحة</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowLost(!showLost)}
                                    className={cn(
                                        'h-9 px-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all rounded-xl border',
                                        showLost
                                            ? 'bg-white/20 text-white border-white/25'
                                            : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                                    )}
                                >
                                    {showLost ? <Eye size={14} /> : <EyeOff size={14} />}
                                    <span className="hidden sm:inline">{showLost ? 'النشطاء' : 'المفقودين'}</span>
                                </button>
                                <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 text-xs">
                                    <Plus size={14} /> جديد
                                </PrimaryBtn>
                            </div>
                        </div>

                        {/* KPI Stats */}
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3.5 md:p-4 border border-white/10">
                                <div className="flex items-center gap-1 sm:gap-2 text-white/60 text-[9px] sm:text-[11px] md:text-xs mb-1 sm:mb-2">
                                    <Users size={11} className="shrink-0" />
                                    <span className="truncate">إجمالي العملاء</span>
                                </div>
                                <div className="text-sm sm:text-xl md:text-2xl font-bold font-outfit text-white">{stats?.total || 0}</div>
                                <div className="text-white/50 text-[8px] sm:text-[10px] md:text-[11px] mt-0.5 sm:mt-1">{activeCount} نشط</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3.5 md:p-4 border border-white/10">
                                <div className="flex items-center gap-1 sm:gap-2 text-white/60 text-[9px] sm:text-[11px] md:text-xs mb-1 sm:mb-2">
                                    <Activity size={11} className="shrink-0" />
                                    <span className="truncate">عملاء جدد</span>
                                </div>
                                <div className="text-sm sm:text-xl md:text-2xl font-bold font-outfit text-white">{stats?.new || 0}</div>
                                <div className="text-success text-[8px] sm:text-[10px] md:text-[11px] mt-0.5 sm:mt-1">هذا الشهر</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3.5 md:p-4 border border-white/10">
                                <div className="flex items-center gap-1 sm:gap-2 text-white/60 text-[9px] sm:text-[11px] md:text-xs mb-1 sm:mb-2">
                                    <Phone size={11} className="shrink-0" />
                                    <span className="truncate">تم التحويل</span>
                                </div>
                                <div className="text-sm sm:text-xl md:text-2xl font-bold font-outfit text-white">{stats?.converted || 0}</div>
                                <div className="text-white/50 text-[8px] sm:text-[10px] md:text-[11px] mt-0.5 sm:mt-1">إلى مشتركين</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3.5 md:p-4 border border-white/10">
                                <div className="flex items-center gap-1 sm:gap-2 text-white/60 text-[9px] sm:text-[11px] md:text-xs mb-1 sm:mb-2">
                                    <BarChart3 size={11} className="shrink-0" />
                                    <span className="truncate">معدل التحويل</span>
                                </div>
                                <div className="text-sm sm:text-xl md:text-2xl font-bold font-outfit text-white">{(stats?.conversionRate ?? 0).toFixed(1)}%</div>
                                <div className="text-success text-[8px] sm:text-[10px] md:text-[11px] mt-0.5 sm:mt-1">معدل النجاح</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="bg-card rounded-2xl shadow-elevation-1 border border-border overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 lg:p-5 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم، الهاتف، المادة..."
                                    aria-label="بحث عن عميل"
                                    className="w-full h-11 bg-surface border border-border rounded-xl pr-10 pl-10 text-sm text-main placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button aria-label="مسح البحث" onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted hover:text-main hover:bg-hover rounded-lg transition-all">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="shrink-0 bg-surface border border-border rounded-xl px-3 py-2.5">
                                <span className="text-sm font-bold text-main">{filteredLeads.length}</span>
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none mt-3">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={cn(
                                    'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all',
                                    filterStatus === 'all'
                                        ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/20'
                                        : 'bg-surface text-muted border-border hover:border-primary/30 hover:text-main'
                                )}
                            >
                                الكل
                                <span className={cn(
                                    'text-[10px] px-1.5 py-0.5 rounded-lg min-w-[20px] text-center',
                                    filterStatus === 'all' ? 'bg-white/20 text-on-primary' : 'bg-card text-muted border border-border'
                                )}>{statusCounts.all}</span>
                            </button>
                            {StatusKeys.map((key) => {
                                const cfg = statusColors[key];
                                const Icon = statusIconComponents[key];
                                const isActive = filterStatus === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilterStatus(key)}
                                        className={cn(
                                            'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all',
                                            isActive
                                                ? `${cfg.bg} ${cfg.color} border-current/20 shadow-sm`
                                                : 'bg-surface text-muted border-border hover:border-primary/30 hover:text-main'
                                        )}
                                    >
                                        {Icon && <Icon size={12} />}
                                        {cfg.label}
                                        <span className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded-lg min-w-[20px] text-center',
                                            isActive ? 'bg-white/50 border border-current/10' : 'bg-card text-muted border border-border'
                                        )}>{statusCounts[key]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <LeadTable filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                        <LeadCards filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                    </div>
                </div>

                {/* FAB */}
                <motion.button
                    onClick={() => setIsAddModalOpen(true)}
                    className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 w-12 h-12 md:w-14 md:h-14 bg-primary text-on-primary rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="إضافة عميل"
                >
                    <Plus size={22} />
                </motion.button>

                {/* Modals */}
                <AnimatePresence>
                    {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
                </AnimatePresence>

                <AddLeadModal
                    isAddModalOpen={isAddModalOpen}
                    setIsAddModalOpen={setIsAddModalOpen}
                    addMutation={addMutation}
                    formRef={formRef}
                />

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
