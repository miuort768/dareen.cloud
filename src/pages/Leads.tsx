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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" dir="rtl">
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-[#131836] w-full sm:max-w-sm shadow-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden border border-white/[0.06]"
            >
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mt-3 sm:hidden" />
                <div className="bg-gradient-to-l from-[#e11d48] to-[#be123c] px-5 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/15">
                            <AlertTriangle size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">تأكيد الحذف</h3>
                            <p className="text-[10px] text-white/60 mt-0.5">لا يمكن التراجع عن هذا الإجراء</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all" aria-label="إغلاق"><X size={14} /></button>
                </div>
                <div className="p-5">
                    <p className="text-sm font-bold text-white mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                    <p className="text-xs text-white/50 leading-relaxed">سيتم نقل العميل <span className="text-[#fb7185] font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.</p>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                    <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 py-3.5 text-xs font-bold text-white/60 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                    <button onClick={onConfirm} className="flex-1 py-3.5 text-xs font-bold text-white bg-gradient-to-l from-[#e11d48] to-[#be123c] hover:from-[#be123c] hover:to-[#e11d48] rounded-xl transition-all active:scale-[0.98]">تأكيد الحذف</button>
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
            <div className="bg-[#0a0e27] min-h-screen pb-24" dir="rtl">
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
            className="bg-[#0a0e27] min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 mx-auto px-4 md:px-6 max-w-page">
                {/* ===== HERO SECTION ===== */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f4e] via-[#1e2456] to-[#131836] mt-4 mb-6 border border-white/[0.04]">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#6366f1]/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#8b5cf6]/8 rounded-full blur-3xl" />
                    <div className="absolute top-4 right-8 w-2 h-2 bg-[#6366f1]/40 rounded-full" />
                    <div className="absolute top-12 right-24 w-1.5 h-1.5 bg-[#8b5cf6]/30 rounded-full" />
                    <div className="absolute bottom-8 left-12 w-1 h-1 bg-[#6366f1]/25 rounded-full" />

                    <div className="relative z-10 px-5 md:px-8 py-5 md:py-8">
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                                <p className="text-white/40 text-[11px] mb-1">مرحباً بك! 👋</p>
                                <h1 className="text-lg md:text-2xl font-bold font-outfit text-white mb-1 tracking-tight">إدارة عملائك بسهولة</h1>
                                <p className="text-white/40 text-[11px] md:text-sm">تابع وأدر جميع العملاء المتوقعين وحوّلهم إلى عقود ناجحة</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowLost(!showLost)}
                                    className={cn(
                                        'h-9 px-3.5 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all duration-200 rounded-xl border',
                                        showLost
                                            ? 'bg-[#6366f1]/20 text-[#a5b4fc] border-[#6366f1]/30'
                                            : 'bg-white/5 text-white/50 border-white/[0.06] hover:bg-white/10 hover:text-white/70'
                                    )}
                                >
                                    {showLost ? <Eye size={13} /> : <EyeOff size={13} />}
                                    <span className="hidden sm:inline">{showLost ? 'النشطاء' : 'المفقودين'}</span>
                                </button>
                                <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 text-[11px]">
                                    <Plus size={13} /> جديد
                                </PrimaryBtn>
                            </motion.div>
                        </div>

                        {/* KPI Stats */}
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3">
                            {[
                                { label: 'إجمالي العملاء', value: stats?.total || 0, sub: `${activeCount} نشط`, icon: Users, delay: 0.15 },
                                { label: 'عملاء جدد', value: stats?.new || 0, sub: 'هذا الشهر', icon: Activity, delay: 0.2, accent: true },
                                { label: 'تم التحويل', value: stats?.converted || 0, sub: 'إلى مشتركين', icon: Phone, delay: 0.25 },
                                { label: 'معدل التحويل', value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`, sub: 'معدل النجاح', icon: BarChart3, delay: 0.3 },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: stat.delay }}
                                    className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-2 sm:p-3 md:p-3.5 border border-white/[0.04] hover:bg-white/[0.07] transition-all duration-200">
                                    <div className="flex items-center gap-1 sm:gap-1.5 text-white/30 text-[8px] sm:text-[10px] md:text-[11px] mb-1 sm:mb-1.5">
                                        <stat.icon size={10} className="shrink-0" />
                                        <span className="truncate">{stat.label}</span>
                                    </div>
                                    <div className="text-sm sm:text-lg md:text-xl font-bold font-outfit text-white tabular-nums">{stat.value}</div>
                                    <div className={cn('text-[7px] sm:text-[9px] md:text-[10px] mt-0.5', stat.accent ? 'text-[#34d399]' : 'text-white/25')}>{stat.sub}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="bg-[#131836]/80 rounded-2xl border border-white/[0.04] overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 lg:p-5 border-b border-white/[0.04]">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                                    aria-label="بحث عن عميل"
                                    className="w-full h-11 bg-white/[0.04] border border-white/[0.06] rounded-xl pr-10 pl-10 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button aria-label="مسح البحث" onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/60 rounded-lg transition-all">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                            <div className="shrink-0 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5">
                                <span className="text-[13px] font-bold text-white/60 tabular-nums">{filteredLeads.length}</span>
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="grid grid-cols-3 sm:flex sm:items-center sm:gap-2 sm:overflow-x-auto sm:pb-0.5 sm:scrollbar-none mt-3 gap-2">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus('all')}
                                className={cn(
                                    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200',
                                    filterStatus === 'all'
                                        ? 'bg-gradient-to-l from-[#6366f1] to-[#8b5cf6] text-white border-[#6366f1]/30 shadow-md shadow-[#6366f1]/20'
                                        : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:border-white/10 hover:text-white/60'
                                )}>
                                الكل
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center font-bold',
                                    filterStatus === 'all' ? 'bg-white/20' : 'bg-white/5 text-white/30 border border-white/[0.06]'
                                )}>{statusCounts.all}</span>
                            </motion.button>
                            {StatusKeys.map((key) => {
                                const cfg = statusColors[key];
                                const Icon = statusIconComponents[key];
                                const isActive = filterStatus === key;
                                return (
                                    <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus(key)}
                                        className={cn(
                                            'inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-[11px] font-bold rounded-xl border transition-all duration-200',
                                            isActive
                                                ? `${cfg.darkBg} ${cfg.darkText} border-current/15 shadow-md`
                                                : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:border-white/10 hover:text-white/60'
                                        )}>
                                        {Icon && <Icon size={11} />}
                                        {cfg.label}
                                        <span className={cn(
                                            'text-[9px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center font-bold',
                                            isActive ? 'bg-white/10 border border-white/10' : 'bg-white/5 text-white/30 border border-white/[0.06]'
                                        )}>{statusCounts[key]}</span>
                                    </motion.button>
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
                    className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-2xl shadow-xl shadow-[#6366f1]/30 flex items-center justify-center active:scale-95 transition-all duration-200"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} aria-label="إضافة عميل">
                    <Plus size={22} />
                </motion.button>

                {/* Modals */}
                <AnimatePresence>
                    {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
                </AnimatePresence>

                <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />
                <LeadDrawer lead={selectedLead} isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setSelectedLead(null); }} updateMutation={updateMutation} />
            </div>
        </motion.div>
    );
};
