import React, { useState } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    Trash, 
    CheckCircle2, 
    Clock, 
    Star, 
    X, 
    Phone, 
    MessageSquare,
    TrendingUp,
    PhoneCall,
    UserPlus,
    Tag,
    Plus,
    EyeOff,
    Eye,
    AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import type { Lead, LeadStatus } from '../features/crm/types';
import { PageLoader } from '../components/ui/PageLoader';

// ── Reusable Styled Components ──────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden',
        className
    )}>
        {children}
    </div>
);



const PrimaryBtn = ({ onClick, children, className = '', disabled, type = 'button' }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);



const StatItem = ({ title, value, icon: Icon, subValue, bg }: { title: string, value: string | number, icon: any, subValue?: string, bg: string }) => (
    <div className={cn("p-4 rounded-none shadow-sm flex flex-col items-center text-center text-white relative overflow-hidden", bg)}>
        <div className="absolute -right-4 -top-4 opacity-10">
            <Icon size={64} />
        </div>
        <div className="relative z-10 w-8 h-8 rounded-none flex items-center justify-center mb-2 bg-white/10 backdrop-blur-sm">
            <Icon size={16} className="text-white" />
        </div>
        <p className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/80">{title}</p>
        <p className="relative z-10 text-lg md:text-xl font-black mt-1 font-mono">{value}</p>
        {subValue && <p className="relative z-10 text-[9px] mt-1 font-bold text-white/60">{subValue}</p>}
    </div>
);

// Custom Confirm Delete Dialog
const ConfirmDeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 rounded-none shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800">
            {/* Header */}
            <div className="bg-rose-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 flex items-center justify-center rounded-none">
                    <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">حذف العميل نهائياً</h3>
            </div>
            {/* Body */}
            <div className="p-6">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">هل أنت متأكد من حذف هذا العميل؟</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    سيتم حذف هذا العميل <span className="text-rose-500 font-bold">بشكل نهائي وكامل من قاعدة البيانات</span>، ولا يمكن التراجع عن هذا الإجراء.
                </p>
            </div>
            {/* Actions */}
            <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                    إلغاء
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-3 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition-all uppercase tracking-widest"
                >
                    نعم، احذف نهائياً
                </button>
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

    // Fetch leads
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: crmService.getAll
    });

    const { data: stats } = useQuery({
        queryKey: ['lead-stats'],
        queryFn: crmService.getStats
    });

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: crmService.add,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
            setIsAddModalOpen(false);
            formRef.current?.reset();
        },
        onError: (err: any) => {
            alert('حدث خطأ أثناء الإضافة: ' + (err?.response?.data?.error || err.message));
        }
    });

    // Update Status Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Lead> }) => crmService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        }
    });

    // Delete Mutation (permanent delete)
    const deleteMutation = useMutation({
        mutationFn: (id: string) => crmService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        }
    });

    const filteredLeads = leads.filter(l => {
        if (showLost) return l.status === 'lost';
        const matchesSearch = l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             l.phone.includes(searchTerm);
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

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full bg-[#f1f5f9] dark:bg-[#020617] pb-20 font-sans" dir="rtl">
            {/* Header */}
            <div className="bg-teal-800 px-4 md:px-8 py-5 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-teal-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/10 text-teal-100 rounded-none shadow-inner border border-white/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter">إدارة العملاء والمهتمين</h1>
                        <p className="text-[10px] text-teal-200/70 font-bold uppercase tracking-widest mt-1">تتبع مسار تحويل الطلاب والمشتركين الجدد</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 no-print w-full md:w-auto mt-2 md:mt-0">
                    <button
                        onClick={() => setShowLost(!showLost)}
                        className={cn(
                            "h-10 px-4 rounded-none flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border",
                            showLost
                                ? "bg-white text-rose-600 border-white"
                                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        )}
                    >
                        {showLost ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span className="hidden sm:inline">{showLost ? 'الكل' : 'المرفوضون'}</span>
                        {!showLost && <span className="bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{leads.filter(l => l.status === 'lost').length}</span>}
                    </button>
                    <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-10 px-6 rounded-none bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400/50 w-full md:w-auto">
                        <Plus size={16} />
                        إضافة عميل محتمل
                    </PrimaryBtn>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 py-6">
                <StatItem 
                    title="إجمالي المهتمين" 
                    value={stats?.total || 0} 
                    icon={Users} 
                    bg="bg-slate-800"
                />
                <StatItem 
                    title="عملاء جدد" 
                    value={stats?.new || 0} 
                    icon={Clock} 
                    bg="bg-blue-600"
                />
                <StatItem 
                    title="تم التحويل" 
                    value={stats?.converted || 0} 
                    icon={CheckCircle2} 
                    bg="bg-emerald-600"
                />
                <StatItem 
                    title="معدل التحويل" 
                    value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`} 
                    icon={TrendingUp} 
                    bg="bg-indigo-600"
                    subValue="نسبة النجاح"
                />
            </div>

            {/* Filters & Search */}
            <div className="px-4 md:px-8 mb-6">
                <SectionCard className="p-3 flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                            type="text" 
                            placeholder="ابحث بالاسم أو رقم الهاتف..." 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-9 py-2 outline-none text-xs font-bold focus:border-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={14} className="text-emerald-600 hidden md:block" />
                            <select 
                                className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-xl text-[11px] font-bold outline-none cursor-pointer focus:border-emerald-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                            >
                                <option value="all">كل الحالات</option>
                                {Object.entries(statusConfig).map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Leads Table/Cards */}
            <div className="px-4 md:px-8">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-rose-600">
                            <tr>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700">العميل</th>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700">التواصل</th>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700">المادة</th>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700">الحالة</th>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700 text-center">الأولوية</th>
                                <th className="px-6 py-3 font-black text-[10px] tracking-widest text-white uppercase border-b border-rose-700 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} onDoubleClick={() => handleMarkLost(lead.id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" title="اضغط مرتين للإخفاء">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                                {lead.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{lead.studentName}</h4>
                                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                                    مضاف: {new Date(lead.createdAt).toLocaleDateString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Phone size={12} className="text-emerald-500" /> {lead.phone}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-none w-fit border border-slate-200 dark:border-slate-700">
                                                <Tag size={12} className="text-indigo-500" /> {lead.subject}
                                            </span>
                                            {lead.curriculum && (
                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 mr-1">
                                                    المنهج: {lead.curriculum}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            className={cn(
                                                "px-3 py-1 text-[10px] font-bold rounded-lg border-none outline-none cursor-pointer",
                                                statusConfig[lead.status].bg,
                                                statusConfig[lead.status].color
                                            )}
                                            value={lead.status}
                                            onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as any } })}
                                        >
                                            {Object.entries(statusConfig).map(([key, value]) => (
                                                <option key={key} value={key}>{value.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-0.5">
                                            {[...Array(3)].map((_, i) => (
                                                <Star key={i} size={12} className={cn(
                                                    (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-slate-200 dark:text-slate-700"
                                                )} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } })}
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                    lead.status === 'converted'
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                                )}
                                                title="تم التحويل / مشترك"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button onClick={() => window.open(`tel:${lead.phone}`)} className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                                                <PhoneCall size={14} />
                                            </button>
                                            <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg hover:bg-emerald-400 hover:text-white transition-all">
                                                <MessageSquare size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleMarkLost(lead.id)} 
                                                className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                                    lead.status === 'lost'
                                                        ? "bg-rose-500 text-white"
                                                        : "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white"
                                                )}
                                                title="رفض / ملغي"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <div className="py-20 text-center">
                            <Users size={48} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد نتائج بحث</p>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                    {filteredLeads.length === 0 ? (
                        <div className="py-20 text-center">
                            <Users size={48} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد نتائج بحث</p>
                        </div>
                    ) : filteredLeads.map((lead) => (
                        <div
                            key={lead.id}
                            onDoubleClick={() => handleMarkLost(lead.id)}
                            className="bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 p-5 rounded-none shadow-sm active:scale-[0.98] transition-all relative overflow-hidden border-r-4 border-r-teal-600 cursor-pointer"
                            title="اضغط مرتين للإخفاء"
                        >
                            {/* Top Row */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-bold text-sm rounded-none">
                                        {lead.studentName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mb-1">{lead.studentName}</h4>
                                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase", statusConfig[lead.status].bg, statusConfig[lead.status].color)}>
                                            {statusConfig[lead.status].label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left flex flex-col items-end gap-1">
                                    <div className="flex gap-0.5">
                                        {[...Array(3)].map((_, i) => (
                                            <Star key={i} size={12} className={cn(
                                                (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-slate-200"
                                            )} />
                                        ))}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-bold">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl flex items-center gap-2">
                                    <Phone size={12} className="text-emerald-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate font-mono">{lead.phone}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl flex flex-col justify-center gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Tag size={12} className="text-indigo-400 shrink-0" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{lead.subject}</span>
                                    </div>
                                    {lead.curriculum && (
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 mr-5 truncate">
                                            المنهج: {lead.curriculum}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status selector */}
                            <div className="mb-3">
                                <select
                                    className={cn(
                                        "w-full px-3 py-2 text-xs font-bold rounded-lg border-none outline-none cursor-pointer",
                                        statusConfig[lead.status].bg,
                                        statusConfig[lead.status].color
                                    )}
                                    value={lead.status}
                                    onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as any } })}
                                >
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                                <button 
                                    onClick={() => updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } })}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0",
                                        lead.status === 'converted'
                                            ? "bg-emerald-500 text-white"
                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                    )}
                                    title="تم التحويل / مشترك"
                                >
                                    <CheckCircle2 size={16} />
                                </button>
                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="flex-1 h-9 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <PhoneCall size={14} /> اتصال
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="w-9 h-9 flex items-center justify-center bg-slate-900 dark:bg-slate-800 text-white rounded-xl">
                                    <MessageSquare size={14} />
                                </button>
                                <button 
                                    onClick={() => handleMarkLost(lead.id)}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-600 hover:text-white transition-all",
                                        lead.status === 'lost'
                                            ? "bg-rose-500 text-white"
                                            : "bg-rose-50 text-rose-500"
                                    )}
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Lead Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                                    <UserPlus size={18} className="text-white" />
                                </div>
                                <h2 className="text-sm font-bold text-white dark:text-white">إضافة عميل محتمل جديد</h2>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-lg text-white"><X size={18} /></button>
                        </div>
                        <form ref={formRef} className="p-6 space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            addMutation.mutate({
                                studentName: formData.get('name') as string,
                                phone: formData.get('phone') as string,
                                subject: formData.get('subject') as string,
                                curriculum: formData.get('curriculum') as string,
                                status: 'new',
                                priority: formData.get('priority') as any,
                                notes: formData.get('notes') as string
                            });
                        }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">اسم الطالب / العميل</label>
                                    <input name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">المنهج</label>
                                    <input name="curriculum" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">رقم الهاتف</label>
                                    <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">المادة المهتم بها</label>
                                    <input name="subject" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الأولوية</label>
                                <select name="priority" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white">
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية جداً 🔥</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">ملاحظات</label>
                                <textarea name="notes" rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none" placeholder="اكتب أي تفاصيل أو ملاحظات عن العميل هنا..." />
                            </div>
                            <PrimaryBtn type="submit" disabled={addMutation.isPending} className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed">
                                {addMutation.isPending ? '⏳ جاري الحفظ...' : 'حفظ العميل وبدء المتابعة'}
                            </PrimaryBtn>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmLeadId && (
                <ConfirmDeleteModal
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmLeadId(null)}
                />
            )}
        </div>
    );
};
