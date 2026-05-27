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
        <div className="lg:hidden space-y-3">
            {filteredLeads.length === 0 ? (
                <div className="py-16 text-center">
                    <Users size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                    <p className="text-xs font-bold text-slate-400">لا توجد نتائج بحث</p>
                </div>
            ) : filteredLeads.map((lead) => (
                <div
                    key={lead.id}
                    onDoubleClick={() => handleMarkLost(lead.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm active:scale-[0.98] transition-all cursor-pointer rounded-2xl"
                    title="اضغط مرتين للإخفاء"
                >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>
                                {lead.studentName?.charAt(0) || 'ع'}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                                    {lead.studentName || 'عميل بدون اسم'}
                                </h4>
                                <span className="text-[9px] text-slate-400 font-medium">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} size={11} className={cn(
                                    (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200 dark:text-slate-700"
                                )} />
                            ))}
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="px-4 pb-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone size={11} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag size={11} className="text-blue-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{lead.subject}</span>
                            {lead.curriculum && (
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">· {lead.curriculum}</span>
                            )}
                        </div>
                    </div>

                    {lead.notes && (
                        <div className="mx-4 mb-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 px-3 py-2 rounded-xl">
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{lead.notes}</p>
                        </div>
                    )}

                    {/* Card footer */}
                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
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
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } })}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'converted'
                                            ? "bg-emerald-500 text-white"
                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                    )}
                                    title="تم التحويل"
                                >
                                    <CheckCircle2 size={12} />
                                </button>
                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="w-7 h-7 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all rounded-xl">
                                    <PhoneCall size={12} />
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="w-7 h-7 bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-400 hover:text-white transition-all rounded-xl">
                                    <MessageSquare size={12} />
                                </button>
                                <button 
                                    onClick={() => handleMarkLost(lead.id)}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'lost'
                                            ? "bg-rose-500 text-white"
                                            : "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white"
                                    )}
                                >
                                    <Trash size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
