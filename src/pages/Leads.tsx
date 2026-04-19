
import React, { useState } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    MoreHorizontal, 
    CheckCircle2, 
    Clock, 
    Star, 
    X, 
    Phone, 
    MessageSquare,
    TrendingUp,
    PhoneCall,
    UserPlus,
    Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../features/crm/services/crmService';
import type { Lead, LeadStatus } from '../features/crm/types';
import { PageLoader } from '../components/ui/PageLoader';

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

    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             l.phone.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }> = {
        new: { label: 'جديد', color: 'text-blue-600', bg: 'bg-blue-100' },
        contacted: { label: 'تم التواصل', color: 'text-amber-600', bg: 'bg-amber-100' },
        interested: { label: 'مهتم', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        trial: { label: 'حصة تجريبية', color: 'text-purple-600', bg: 'bg-purple-100' },
        converted: { label: 'مشترك', color: 'text-emerald-800', bg: 'bg-emerald-200' },
        lost: { label: 'ملغي', color: 'text-rose-600', bg: 'bg-rose-100' }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="pb-28 min-h-full md:animate-in md:fade-in md:duration-700" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3 mb-1">
                        <div className="w-1 md:w-1.5 h-8 md:h-12 bg-emerald-600 border-2 border-gray-950 dark:border-gray-800"></div>
                        إدارة العملاء والمهتمين
                    </h1>
                    <p className="text-gray-500 font-bold flex items-center gap-2 text-xs md:text-sm">
                        <Users size={14} /> تتبع مسار تحويل الطلاب من الاستفسار إلى الاشتراك الفعلي
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-600 text-white px-8 py-3 font-black border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2"
                    >
                        <UserPlus size={20} /> إضافة عميل محتمل
                    </button>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
                <div className="bg-white border-2 border-gray-950 p-6 shadow-[3px_3px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 group overflow-hidden relative">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">إجمالي المهتمين</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white font-mono">{stats?.total || 0}</h3>
                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center dark:bg-gray-800 dark:border-gray-700">
                            <Users className="text-gray-500" size={20} />
                        </div>
                    </div>
                    <div className="absolute right-[-10%] bottom-[-20%] w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full blur-2xl z-0 pointer-events-none"></div>
                </div>

                <div className="bg-white border-2 border-gray-950 p-6 shadow-[3px_3px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">عملاء جدد</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-blue-600 font-mono">{stats?.new || 0}</h3>
                        <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                            <Clock className="text-blue-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-950 p-6 shadow-[3px_3px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">تم تحويلهم لطلاب</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-emerald-600 font-mono">{stats?.converted || 0}</h3>
                        <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="border-2 border-gray-950 p-6 shadow-[3px_3px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 bg-emerald-900 text-white">
                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">معدل التحويل (Success)</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black font-mono">{stats?.conversionRate.toFixed(1)}%</h3>
                        <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white border-2 border-gray-950 p-6 mb-8 shadow-[3px_3px_0px_0px_#10b981] md:shadow-[6px_6px_0px_0px_#10b981] dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو رقم الهاتف..." 
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-none px-12 py-3 focus:border-emerald-500 focus:ring-0 font-bold transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-emerald-600" />
                    <select 
                        className="bg-white border-2 border-gray-950 px-6 py-3 font-black text-sm focus:ring-0 dark:bg-gray-800 dark:text-white dark:border-gray-700"
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

            {/* Leads Table/Grid */}
            <div className="bg-white border-2 border-gray-950 shadow-[3px_3px_0px_0px_black] md:shadow-[6px_6px_0px_0px_black] dark:bg-gray-900 dark:border-gray-800 overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[600px]">
                    <thead className="bg-gray-900 text-white dark:bg-black">
                        <tr>
                            <th className="px-6 py-4 font-black text-xs uppercase border-l border-white/10">العميل</th>
                            <th className="px-6 py-4 font-black text-xs uppercase border-l border-white/10">التواصل والمادة</th>
                            <th className="px-6 py-4 font-black text-xs uppercase border-l border-white/10">الحالة</th>
                            <th className="px-6 py-4 font-black text-xs uppercase border-l border-white/10">الأولوية</th>
                            <th className="px-6 py-4 font-black text-xs uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-6 border-l border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border-2 border-gray-950 flex items-center justify-center font-black text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white group-hover:scale-110 transition-transform">
                                            {lead.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white mb-1">{lead.studentName}</h4>
                                            <p className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                                                <X size={10} className="text-gray-300" /> مضاف في: {new Date(lead.createdAt).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-l border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-mono font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-600" /> {lead.phone}
                                        </span>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-black dark:text-gray-300 w-fit">
                                            <Tag size={10} /> {lead.subject}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-l border-gray-100 dark:border-gray-800">
                                    <select 
                                        className={cn(
                                            "w-full px-4 py-2 font-black text-[10px] border-2 border-gray-950 rounded-none shadow-[2px_2px_0px_0px_black]",
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
                                <td className="px-6 py-6 border-l border-gray-100 dark:border-gray-800">
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={16} 
                                                className={cn(
                                                    "transition-all",
                                                    (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1)) 
                                                        ? "text-amber-400 fill-amber-400" 
                                                        : "text-gray-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-bold text-center">
                                    <div className="flex items-center gap-2">
                                        <a href={`tel:${lead.phone}`} className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:translate-y-[-2px] transition-all">
                                            <PhoneCall size={18} />
                                        </a>
                                        <a href={`https://wa.me/${lead.phone}`} target="_blank" className="w-10 h-10 bg-emerald-400 text-white flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:translate-y-[-2px] transition-all">
                                            <MessageSquare size={18} />
                                        </a>
                                        <button className="w-10 h-10 bg-white text-gray-950 flex items-center justify-center border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:translate-y-[-2px] transition-all dark:bg-gray-800 dark:text-white dark:border-white/20">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLeads.length === 0 && (
                    <div className="p-20 text-center">
                        <UserPlus size={64} className="mx-auto mb-6 text-gray-200 dark:text-gray-800" />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">لم يتم العثور على أي مهتمين</h3>
                    </div>
                )}
            </div>

            {/* Add Lead Modal (Simplified) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-white dark:bg-gray-900 border-x-4 border-t-4 md:border-4 border-gray-950 shadow-none md:shadow-[15px_15px_0px_0px_black] w-full max-w-lg overflow-hidden md:animate-in md:zoom-in-95 md:duration-200">
                        <div className="bg-gray-950 text-white p-6 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-tighter">إضافة عميل محتمل جديد</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form className="p-8 space-y-4" onSubmit={(e) => {
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
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">اسم الطالب / العميل</label>
                                <input name="name" required className="w-full bg-gray-50 border-2 border-gray-950 p-3 font-bold focus:ring-0 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">رقم الهاتف</label>
                                    <input name="phone" required className="w-full bg-gray-50 border-2 border-gray-950 p-3 font-bold focus:ring-0 dark:bg-gray-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">المادة المهتم بها</label>
                                    <input name="subject" required className="w-full bg-gray-50 border-2 border-gray-950 p-3 font-bold focus:ring-0 dark:bg-gray-800 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">الأولوية</label>
                                <select name="priority" className="w-full border-2 border-gray-950 p-3 font-black dark:bg-gray-800 dark:text-white">
                                    <option value="low">منخفضة</option>
                                    <option value="medium">متوسطة</option>
                                    <option value="high">عالية جداً 🔥</option>
                                </select>
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-4 font-black border-2 border-gray-950 shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] transition-all"
                            >
                                حفظ العميل وبدء المتابعة
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
