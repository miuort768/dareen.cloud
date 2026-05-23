import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, Clock, TrendingUp, Plus, EyeOff, Eye, AlertTriangle, X, ChevronDown } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="bg-[#172554] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-rose-300" />
                    </div>
                    <h3 className="text-sm font-bold text-white">حذف العميل</h3>
                </div>
                <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-white/70">
                    <X size={16} />
                </button>
            </div>
            <div className="p-5">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                    سيتم حذف العميل <span className="text-rose-500 font-bold">نهائياً</span> من قاعدة البيانات ولا يمكن التراجع.
                </p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">إلغاء</button>
                <button onClick={onConfirm} className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all">تأكيد الحذف</button>
            </div>
        </div>
    </div>
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

    const filteredLeads = leads.filter(l => {
        if (showLost) return l.status === 'lost';
        const matchesSearch = l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus && l.status !== 'lost';
    });

    const handleMarkLost = (id: string) => setConfirmLeadId(id);
    const handleConfirmDelete = () => {
        if (confirmLeadId) deleteMutation.mutate(confirmLeadId);
        setConfirmLeadId(null);
    };

    const statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }> = {
        new: { label: 'جديد', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        contacted: { label: 'تم التواصل', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        interested: { label: 'مهتم', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        trial: { label: 'حصة تجريبية', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        converted: { label: 'مشترك', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        lost: { label: 'ملغي', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20" dir="rtl">
            <div className="relative z-10 mx-auto px-2 md:px-4">
                {/* Header */}
                <div className="bg-[#172554] border border-[#1e3a5f]/60 shadow-lg shadow-black/20 px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white">
                            <Users size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">العملاء المحتملين</h1>
                            <p className="text-[10px] text-blue-200/70 font-medium leading-none mt-1">إدارة طلبات التسجيل والمهتمين</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setShowLost(!showLost)} className={cn(
                            "h-9 px-3 flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all border",
                            showLost
                                ? "bg-white text-rose-600 border-white"
                                : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                        )}>
                            {showLost ? <Eye size={13} /> : <EyeOff size={13} />}
                            <span>{showLost ? 'الكل' : 'المرفوضون'}</span>
                            {!showLost && <span className="bg-rose-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center">{leads.filter(l => l.status === 'lost').length}</span>}
                        </button>
                        <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 border-0">
                            <Plus size={14} /> إضافة عميل
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
                <div className="border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/90 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-3 p-3">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-9 py-2 outline-none text-xs font-medium focus:border-emerald-500 text-slate-900 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={14} className="text-emerald-600 hidden md:block shrink-0" />
                            <div className="relative w-full md:w-auto">
                                <select className="w-full md:w-auto appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-medium outline-none cursor-pointer focus:border-emerald-500 text-slate-900 dark:text-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}>
                                    <option value="all">كل الحالات</option>
                                    {Object.entries(statusConfig).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                                </select>
                                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table (desktop) / Cards (mobile) */}
                <div>
                    <LeadTable filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                    <LeadCards filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                </div>

                <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />

                {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
            </div>
        </div>
    );
};
