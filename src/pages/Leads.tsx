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
    Plus
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



const StatItem = ({ title, value, icon: Icon, color, subValue, bg }: { title: string, value: string | number, icon: any, color: string, subValue?: string, bg: string }) => (
    <div className={cn("p-4 rounded-none shadow-sm flex flex-col items-center text-center text-white relative overflow-hidden", bg)}>
        <div className="absolute -right-4 -top-4 opacity-10">
            <Icon size={64} />
        </div>
        <div className="relative z-10 w-8 h-8 rounded-none flex items-center justify-center mb-2 bg-white/10 backdrop-blur-sm">
            <Icon size={16} className="text-white" />
        </div>
        <p className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/80">{title}</p>
        <p className="relative z-10 text-xl font-black mt-1 font-mono">{value}</p>
        {subValue && <p className="relative z-10 text-[9px] mt-1 font-bold text-white/60">{subValue}</p>}
    </div>
);

export const Leads: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: crmService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
        }
    });

    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             l.phone.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
            <div className="bg-teal-800 px-4 md:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-teal-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/10 text-teal-100 rounded-none shadow-inner border border-white/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter">إدارة العملاء والمهتمين</h1>
                        <p className="text-[10px] text-teal-200/70 font-bold uppercase tracking-widest mt-1">تتبع مسار تحويل الطلاب والمشتركين الجدد</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 no-print">
                    <PrimaryBtn onClick={() => setIsAddModalOpen(true)} className="h-10 px-6 rounded-none bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400/50">
                        <Plus size={16} />
                        إضافة عميل محتمل
                    </PrimaryBtn>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 py-6">
                <StatItem 
                    title="إجمالي المهتمين" 
                    value={stats?.total || 0} 
                    icon={Users} 
                    color="text-white" 
                    bg="bg-slate-800"
                />
                <StatItem 
                    title="عملاء جدد" 
                    value={stats?.new || 0} 
                    icon={Clock} 
                    color="text-white" 
                    bg="bg-blue-600"
                />
                <StatItem 
                    title="تم التحويل" 
                    value={stats?.converted || 0} 
                    icon={CheckCircle2} 
                    color="text-white" 
                    bg="bg-emerald-600"
                />
                <StatItem 
                    title="معدل التحويل" 
                    value={`${stats?.conversionRate.toFixed(1)}%`} 
                    icon={TrendingUp} 
                    color="text-white" 
                    bg="bg-indigo-600"
                    subValue="نسبة النجاح"
                />
            </div>

            {/* Filters & Search */}
            <div className="px-4 md:px-6 mb-6">
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
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={14} className="text-emerald-600" />
                        <select 
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-xl text-[11px] font-bold outline-none cursor-pointer focus:border-emerald-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                            <option value="all">كل الحالات</option>
                            {Object.entries(statusConfig).map(([key, value]) => (
                                <option key={key} value={key}>{value.label}</option>
                            ))}
                        </select>
                    </div>
                </SectionCard>
            </div>

            {/* Leads Table */}
            <div className="px-4 md:px-6">
                <div className="overflow-x-auto rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
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
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-emerald-500" /> {lead.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-none w-fit border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <Tag size={12} className="text-indigo-500" /> {lead.subject}
                                            </span>
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
                                                    <Star 
                                                        key={i} 
                                                        size={12} 
                                                        className={cn(
                                                            (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1)) 
                                                                ? "text-amber-400 fill-amber-400" 
                                                                : "text-slate-200 dark:text-slate-700"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                                                    <PhoneCall size={14} />
                                                </button>
                                                <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg hover:bg-emerald-400 hover:text-white transition-all">
                                                    <MessageSquare size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                                                            deleteMutation.mutate(lead.id);
                                                        }
                                                    }} 
                                                    className="w-8 h-8 bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center rounded-none hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    title="حذف العميل"
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
                                <h2 className="text-sm font-bold">إضافة عميل محتمل جديد</h2>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-lg"><X size={18} /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            addMutation.mutate({
                                studentName: formData.get('name') as string,
                                phone: formData.get('phone') as string,
                                subject: formData.get('subject') as string,
                                status: 'new',
                                priority: formData.get('priority') as any,
                                notes: formData.get('notes') as string
                            });
                        }}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">اسم الطالب / العميل</label>
                                <input name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">رقم الهاتف</label>
                                    <input name="phone" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">المادة المهتم بها</label>
                                    <input name="subject" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الأولوية</label>
                                <select name="priority" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-emerald-500">
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية جداً 🔥</option>
                                </select>
                            </div>
                            <PrimaryBtn type="submit" className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10">
                                حفظ العميل وبدء المتابعة
                            </PrimaryBtn>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
