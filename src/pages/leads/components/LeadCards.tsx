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
                    <Users size={40} className="mx-auto mb-3 text-dim dark:text-main" />
                    <p className="text-xs font-bold text-muted">لا توجد نتائج بحث</p>
                </div>
            ) : filteredLeads.map((lead) => (
                <div
                    key={lead.id}
                    onDoubleClick={() => handleMarkLost(lead.id)}
                    className="bg-white dark:bg-primary-active border border-border dark:border-border shadow-sm rounded-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                    title="اضغط مرتين للإخفاء"
                >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 text-primary">
                                {lead.studentName?.charAt(0) || 'ع'}
                            </div>
                            <div className="bg-gradient-to-l from-[var(--bg-success)] to-[var(--bg-success)] dark:from-[var(--bg-success)]/20 dark:to-[var(--bg-success)]/20 px-3 py-1 rounded-xl">
                                <h4 className="font-bold text-sm text-success dark:text-success leading-tight truncate">
                                    {lead.studentName || 'عميل بدون اسم'}
                                </h4>
                            </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} size={11} className={cn(
                                    (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                        ? "text-warning fill-warning"
                                        : "text-dim dark:text-main"
                                )} />
                            ))}
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="px-4 pb-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone size={11} className="text-success shrink-0" />
                            <span className="text-xs font-bold text-muted dark:text-dim font-mono">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag size={11} className="text-info shrink-0" />
                            <span className="text-xs font-bold text-muted dark:text-dim">{lead.subject}</span>
                            {lead.curriculum && (
                                <span className="text-[9px] font-bold text-muted dark:text-muted">· {lead.curriculum}</span>
                            )}
                        </div>
                    </div>

                    {lead.notes && (
                        <div className="mx-4 mb-3 bg-warning-light dark:bg-warning/10 border border-warning dark:border-warning/20 px-3 py-2 rounded-xl">
                            <span className="text-[8px] font-bold text-warning dark:text-warning tracking-widest ml-2">ملاحظات</span>
                            <span className="text-[11px] text-muted dark:text-muted font-medium leading-relaxed">{lead.notes}</span>
                        </div>
                    )}

                    {/* Card footer */}
                    <div className="border-t border-border dark:border-border px-4 py-3">
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
                                    onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'converted'
                                            ? "bg-success text-on-primary"
                                            : "bg-success-light text-success hover:bg-success hover:text-on-primary"
                                    )}
                                    title="تم التحويل"
                                >
                                    <CheckCircle2 size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="w-7 h-7 bg-success-light text-success flex items-center justify-center hover:bg-success hover:text-on-primary transition-all rounded-xl">
                                    <PhoneCall size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="w-7 h-7 bg-success-light text-success flex items-center justify-center hover:bg-success hover:text-on-primary transition-all rounded-xl">
                                    <MessageSquare size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'lost'
                                            ? "bg-error text-on-primary"
                                            : "bg-error-light text-error hover:bg-error hover:text-on-primary"
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
