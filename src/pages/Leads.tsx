import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, Clock, TrendingUp, Plus, EyeOff, Eye, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="bg-rose-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 flex items-center justify-center rounded-lg">
                    <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">حذف العميل نهائياً</h3>
            </div>
            <div className="p-6">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    سيتم حذف هذا العميل <span className="text-rose-500 font-bold">بشكل نهائي وكامل من قاعدة البيانات</span>، ولا يمكن التراجع عن هذا الإجراء.
                </p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button onClick={onCancel} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">إلغاء</button>
                <button onClick={onConfirm} className="flex-1 py-3 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition-all uppercase tracking-widest">نعم، احذف نهائياً</button>
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
        converted: { label: 'مشترك', color: 'text-[#5c59f2]', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        lost: { label: 'ملغي', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-2xl shadow-2xl shadow-indigo-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 md:w-12 md:h-12 flex items-center justify-center bg-white/10 text-teal-100 rounded-xl shadow-inner border border-white/10">
                            <Users size={32} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tighter">إدارة العملاء والمهتمين - تحديث v5</h1>
                            <p className="text-[10px] text-teal-200/70 font-bold uppercase tracking-widest mt-1">تتبع مسار تحويل الطلاب والمشتركين الجدد</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 no-print w-full md:w-auto mt-2 md:mt-0">
                        <button onClick={() => setShowLost(!showLost)} className={cn("h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border", showLost ? "bg-white text-rose-600 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20")}>
                            {showLost ? <Eye size={14} /> : <EyeOff size={14} />}
                            <span className="hidden sm:inline">{showLost ? 'الكل' : 'المرفوضون'}</span>
                            {!showLost && <span className="bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{leads.filter(l => l.status === 'lost').length}</span>}
                        </button>
                        <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400/50 w-full md:w-auto">
                            <Plus size={16} /> إضافة عميل محتمل
                        </PrimaryBtn>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 py-6">
                    <StatItem title="إجمالي المهتمين" value={stats?.total || 0} icon={Users} bg="bg-slate-800" />
                    <StatItem title="عملاء جدد" value={stats?.new || 0} icon={Clock} bg="bg-blue-600" />
                    <StatItem title="تم التحويل" value={stats?.converted || 0} icon={CheckCircle2} bg="bg-emerald-600" />
                    <StatItem title="معدل التحويل" value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`} icon={TrendingUp} bg="bg-indigo-600" />
                </div>

                <div className="px-0 mb-6">
                    <SectionCard className="p-3 flex flex-col md:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-9 py-2 outline-none text-xs font-bold focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter size={14} className="text-emerald-600 hidden md:block" />
                                <select className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[11px] font-bold outline-none cursor-pointer focus:border-emerald-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}>
                                    <option value="all">كل الحالات</option>
                                    {Object.entries(statusConfig).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                                </select>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="px-0">
                    <LeadTable filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                    <LeadCards filteredLeads={filteredLeads} statusConfig={statusConfig} updateMutation={updateMutation} handleMarkLost={handleMarkLost} />
                </div>

                <AddLeadModal isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addMutation={addMutation} formRef={formRef} />

                {confirmLeadId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmLeadId(null)} />}
            </div>
        </div>
    );
};
