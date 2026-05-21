import { cn } from '../../../lib/utils';
import { Phone, PhoneCall, MessageSquare, Trash, CheckCircle2, Tag, Star, Users } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';

interface LeadCardsProps {
    filteredLeads: Lead[];
    statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
}

export const LeadCards = ({ filteredLeads, statusConfig, updateMutation, handleMarkLost }: LeadCardsProps) => {
    return (
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
                    className="bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm active:scale-[0.98] transition-all relative overflow-hidden border-r-4 border-r-teal-600 cursor-pointer"
                    title="اضغط مرتين للإخفاء"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-black text-base rounded-xl shrink-0 mt-1">
                                {lead.studentName?.charAt(0) || 'ع'}
                            </div>
                            <div className="pt-1 flex-1 min-w-0">
                                <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 px-3.5 py-2 rounded-xl inline-block max-w-full shadow-sm">
                                    <h4 
                                        style={{ fontSize: '34px', fontWeight: '950' }} 
                                        className="text-slate-900 dark:text-white leading-none block truncate"
                                    >
                                        {lead.studentName || 'عميل بدون اسم'}
                                    </h4>
                                </div>
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

                    {lead.notes && (
                        <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                                {lead.notes}
                            </p>
                        </div>
                    )}

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
    );
};
