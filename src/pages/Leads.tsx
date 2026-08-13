import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, EyeOff, Eye, AlertTriangle, X, Activity, BarChart3, Phone, Users, UserPlus } from 'lucide-react';
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-0 sm:p-4" dir="rtl">
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-card w-full sm:max-w-sm shadow-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden border border-border"
            >
                <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 sm:hidden" />
                <div className="bg-error px-5 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/15">
                            <AlertTriangle size={18} className="text-on-error" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                            <p className="text-[10px] text-on-error/70 mt-0.5">لا يمكن التراجع عن هذا الإجراء</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 text-on-error rounded-xl transition-all" aria-label="إغلاق"><X size={14} /></button>
                </div>
                <div className="p-5">
                    <p className="text-sm font-bold text-main mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                    <p className="text-xs text-muted leading-relaxed">سيتم نقل العميل <span className="text-error font-bold">المفقود</span> إلى قائمة العملاء المفقودين ولن يظهر مرة أخرى.</p>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                    <button ref={cancelRef} type="button" onClick={onCancel} className="flex-1 py-3.5 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                    <button onClick={onConfirm} className="flex-1 py-3.5 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-error/20">تأكيد الحذف</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatusKeys: LeadStatus[] = ['new', 'contacted', 'interested', 'trial', 'converted'];

const inputClass = "w-full bg-surface border border-border px-3.5 py-3 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 text-main rounded-xl transition-all duration-200 placeholder:text-muted/60 font-bold";
const labelClass = "text-[11px] font-bold text-muted mb-1.5 block";

const AddLeadModalInline = ({ formRef, addMutation, onClose }: { formRef: React.RefObject<HTMLFormElement | null>; addMutation: { mutate: (data: Record<string, unknown>) => void; isPending: boolean }; onClose: () => void }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevation-1 dark:shadow-none">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-soft">
                        <UserPlus size={16} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-bold text-main">إضافة عميل جديد</h2>
                        <p className="text-[10px] text-muted">أدخل بيانات العميل</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface hover:bg-hover rounded-xl transition-all" aria-label="إغلاق">
                    <X size={14} className="text-muted" />
                </button>
            </div>
            <form ref={formRef} className="p-5 space-y-3" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const g = (n: string) => (fd.get(n) as string) || ''; addMutation.mutate({ studentName: g('name'), phone: g('phone'), subject: g('subject'), curriculum: g('curriculum'), status: 'new', priority: g('priority'), notes: g('notes') }); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelClass}>اسم الطالب</label><input name="name" className={inputClass} placeholder="مثال: أم أحمد" /></div>
                    <div><label className={labelClass}>المنهج</label><input name="curriculum" required className={inputClass} placeholder="مثال: مصري" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className={labelClass}>رقم الهاتف</label><input name="phone" required className={inputClass} placeholder="05XXXXXXXX" dir="ltr" style={{ textAlign: 'right' }} /></div>
                    <div><label className={labelClass}>المادة المهتم بها</label><input name="subject" required className={inputClass} placeholder="مثال: رياضيات" /></div>
                </div>
                <div><label className={labelClass}>الأولوية</label><select name="priority" aria-label="الأولوية" className={inputClass}><option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option></select></div>
                <div><label className={labelClass}>ملاحظات</label><textarea name="notes" rows={2} className={inputClass + " resize-none"} placeholder="اكتب أي تفاصيل..." /></div>
                <div className="flex gap-3 pt-1">
                    <PrimaryBtn type="submit" disabled={addMutation.isPending} className="flex-1 py-3">{addMutation.isPending ? 'جاري الحفظ...' : 'إضافة العميل'}</PrimaryBtn>
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-[11px] font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all">إلغاء</button>
                </div>
            </form>
        </div>
    </motion.div>
);

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
            <div className="relative z-10 mx-auto px-2.5 sm:px-4 md:px-6 max-w-page">
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
                {/* ===== HEADER ===== */}
                <div className="pt-4 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <Users size={16} className="text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-lg md:text-xl font-black text-main font-outfit">العملاء المحتملون</h1>
                                    <p className="text-[11px] text-muted">إدارة طلبات التسجيل والعملاء المتوقعين</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLost(!showLost)}
                                className={cn(
                                    'h-9 px-3.5 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all duration-200 rounded-xl border',
                                    showLost
                                        ? 'bg-error/10 text-error border-error/20'
                                        : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
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
                </div>

                {/* ===== KPI STATS ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                        { label: 'إجمالي العملاء', value: stats?.total || 0, sub: `${activeCount} نشط`, icon: Users, delay: 0.15 },
                        { label: 'عملاء جدد', value: stats?.new || 0, sub: 'هذا الشهر', icon: Activity, delay: 0.2, accent: true },
                        { label: 'تم التحويل', value: stats?.converted || 0, sub: 'إلى مشتركين', icon: Phone, delay: 0.25 },
                        { label: 'معدل التحويل', value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`, sub: 'معدل النجاح', icon: BarChart3, delay: 0.3 },
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: stat.delay }}
                            className="bg-card border border-border rounded-2xl p-3.5 hover:shadow-elevation-1 transition-all duration-300">
                            <div className="flex items-center gap-1.5 text-muted text-[10px] mb-2">
                                <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center">
                                    <stat.icon size={12} className="text-primary" />
                                </div>
                                <span className="truncate font-medium">{stat.label}</span>
                            </div>
                            <div className="text-xl font-black text-main tabular-nums font-outfit">{stat.value}</div>
                            <div className={cn('text-[10px] mt-1 font-medium', stat.accent ? 'text-success' : 'text-muted')}>{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="bg-card rounded-2xl shadow-elevation-1 dark:shadow-none border border-border overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 lg:p-5 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                                    aria-label="بحث عن عميل"
                                    className="w-full h-11 bg-surface border border-border rounded-xl pr-10 pl-10 text-[13px] text-main placeholder:text-muted outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button aria-label="مسح البحث" onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted hover:text-main rounded-lg transition-all">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                            <div className="shrink-0 bg-surface border border-border rounded-xl px-3 py-2.5">
                                <span className="text-[13px] font-bold text-main tabular-nums">{filteredLeads.length}</span>
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-none">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus('all')}
                                className={cn(
                                    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                                    filterStatus === 'all'
                                        ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/10'
                                        : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
                                )}>
                                الكل
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded-md min-w-[16px] text-center font-bold',
                                    filterStatus === 'all' ? 'bg-white/20' : 'bg-card text-muted border border-border'
                                )}>{statusCounts.all}</span>
                            </motion.button>
                            {StatusKeys.map((key) => {
                                const cfg = statusColors[key];
                                const Icon = statusIconComponents[key];
                                const isActive = filterStatus === key;
                                return (
                                    <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus(key)}
                                        className={cn(
                                            'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                                            isActive
                                                ? `${cfg.activeBg} ${cfg.activeText} border-current/20 shadow-sm`
                                                : `${cfg.bg} ${cfg.color} border border-border/60 hover:border-current/40`
                                        )}>
                                        {Icon && <Icon size={10} />}
                                        {cfg.label}
                                        <span className={cn(
                                            'text-[9px] px-1.5 py-0.5 rounded-md min-w-[16px] text-center font-bold',
                                            isActive ? 'bg-white/20' : 'bg-surface text-muted border border-border/60'
                                        )}>{statusCounts[key]}</span>
                                    </motion.button>
                                );
                            })}
                            {filterStatus !== 'all' && (
                                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileTap={{ scale: 0.9 }} onClick={() => setFilterStatus('all')}
                                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-error-soft text-error hover:bg-error/20 transition-all">
                                    <X size={13} />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        {isDrawerOpen && selectedLead ? (
                            <LeadDrawer lead={selectedLead} onClose={() => { setIsDrawerOpen(false); setSelectedLead(null); }} updateMutation={updateMutation} />
                        ) : isAddModalOpen ? (
                            <AddLeadModalInline formRef={formRef} addMutation={addMutation} onClose={() => setIsAddModalOpen(false)} />
                        ) : (
                            <>
                                <LeadTable filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                                <LeadCards filteredLeads={filteredLeads} updateMutation={updateMutation} handleMarkLost={handleMarkLost} onLeadClick={handleOpenDrawer} />
                            </>
                        )}
                    </div>
                </div>

                {/* FAB */}
                <motion.button
                    onClick={() => setIsAddModalOpen(true)}
                    className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 w-12 h-12 md:w-14 md:h-14 bg-primary text-on-primary rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-primary-hover"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} aria-label="إضافة عميل">
                    <Plus size={22} />
                </motion.button>

                {/* Modals */}
                <AnimatePresence>
                    {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
