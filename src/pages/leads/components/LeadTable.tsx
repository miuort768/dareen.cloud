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
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                        <React.Fragment key={lead.id}>
                            <tr onDoubleClick={() => handleMarkLost(lead.id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" title="اضغط مرتين للإخفاء">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                            {lead.studentName?.charAt(0) || 'ع'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{lead.studentName || 'عميل بدون اسم'}</h4>
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
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
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
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
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
                            {lead.notes && (
                                <tr className="bg-amber-50/5 dark:bg-amber-950/5 no-print">
                                    <td colSpan={6} className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                                        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/20 p-3 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-bold flex items-start gap-2 max-w-full">
                                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest shrink-0 mt-0.5">ملاحظات العميل:</span>
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
                <div className="py-20 text-center">
                    <Users size={48} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد نتائج بحث</p>
                </div>
            )}
        </div>
    );
};
