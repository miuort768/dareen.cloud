import React from 'react';
import { cn } from '../../../lib/utils';
import { Phone, PhoneCall, MessageSquare, Trash, CheckCircle2, Tag, Star, Users } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';

interface LeadTableProps {
    filteredLeads: Lead[];
    statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
}

export const LeadTable = ({ filteredLeads, statusConfig, updateMutation, handleMarkLost }: LeadTableProps) => {
    return (
        <div className="hidden lg:block overflow-x-auto bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-gray-100 dark:border-slate-800">
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6]">
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80">العميل</th>
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80">التواصل</th>
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80">المادة</th>
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80">الحالة</th>
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80 text-center">الأولوية</th>
                        <th className="px-5 py-3 font-bold text-[9px] tracking-wider text-white/80 text-center">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {filteredLeads.map((lead) => (
                        <React.Fragment key={lead.id}>
                            <tr onDoubleClick={() => handleMarkLost(lead.id)} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-[#6C4BFF]/10 text-[#6C4BFF]">
                                            {lead.studentName?.charAt(0) || 'ع'}
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl">
                                            <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300">{lead.studentName || 'عميل بدون اسم'}</h4>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                        <Phone size={11} className="text-emerald-500" /> {lead.phone}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <Tag size={11} className="text-blue-400" /> {lead.subject}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <select 
                                        className={cn(
                                            "px-2 py-1 text-[9px] font-bold border-0 outline-none cursor-pointer rounded-xl",
                                            statusConfig[lead.status].bg,
                                            statusConfig[lead.status].color
                                        )}
                                        value={lead.status}
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                    >
                                        {Object.entries(statusConfig).map(([key, value]) => (
                                            <option key={key} value={key}>{value.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                    <div className="flex justify-center gap-0.5">
                                        {[...Array(3)].map((_, i) => (
                                            <Star key={i} size={11} className={cn(
                                                (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-slate-200 dark:text-slate-700"
                                            )} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                            className={cn(
                                                    "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                                    lead.status === 'converted'
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                                )}
                                                title="تم التحويل / مشترك"
                                            >
                                                <CheckCircle2 size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="w-7 h-7 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all rounded-xl">
                                                <PhoneCall size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="w-7 h-7 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-400 hover:text-white transition-all rounded-xl">
                                                <MessageSquare size={12} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} 
                                                className={cn(
                                                    "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                                    lead.status === 'lost'
                                                        ? "bg-rose-500 text-white"
                                                        : "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white"
                                                )}
                                                title="رفض / ملغي"
                                            >
                                                <Trash size={12} />
                                            </button>
                                    </div>
                                </td>
                            </tr>
                            {lead.notes && (
                                <tr className="bg-amber-50/30 dark:bg-amber-950/10">
                                    <td colSpan={6} className="px-5 py-2.5 border-b border-gray-100 dark:border-slate-800/80">
                                        <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium max-w-full">
                                            <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 tracking-widest shrink-0 mt-0.5">ملاحظات</span>
                                            <span>{lead.notes}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {filteredLeads.length === 0 && (
                <div className="py-16 text-center">
                    <Users size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                    <p className="text-xs font-bold text-slate-400">لا توجد نتائج بحث</p>
                </div>
            )}
        </div>
    );
};
