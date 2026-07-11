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
                <div className="bg-card border border-border/50 shadow-soft rounded-card py-16 text-center">
                    <div className="w-16 h-16 rounded-card bg-primary-soft flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد نتائج بحث</p>
                    <p className="text-xs text-dim mt-1.5">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            ) : filteredLeads.map((lead) => (
                <div
                    key={lead.id}
                    onDoubleClick={() => handleMarkLost(lead.id)}
                    className="bg-card border border-border/50 shadow-soft rounded-card active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                    title="اضغط مرتين للإخفاء"
                >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-card flex items-center justify-center font-bold text-sm shrink-0 bg-primary-soft text-primary">
                                {lead.studentName?.charAt(0) || 'ع'}
                            </div>
                            <div className="bg-success/10 px-3 py-1 rounded-card">
                                <h4 className="font-bold text-sm text-success leading-tight truncate">
                                    {lead.studentName || 'عميل بدون اسم'}
                                </h4>
                            </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                            {[...Array(3)].map((_, i) => (
                                <Star key={i} size={11} className={cn(
                                    (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                        ? "text-warning fill-warning"
                                        : "text-dim"
                                )} />
                            ))}
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="px-4 pb-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone size={11} className="text-success shrink-0" />
                            <span className="text-xs text-muted font-mono">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag size={11} className="text-info shrink-0" />
                            <span className="text-xs text-muted">{lead.subject}</span>
                            {lead.curriculum && (
                                <span className="text-xs text-muted">· {lead.curriculum}</span>
                            )}
                        </div>
                    </div>

                    {lead.notes && (
                        <div className="mx-4 mb-3 bg-warning-soft border border-warning/20 px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-warning me-2">ملاحظات</span>
                            <span className="text-xs text-muted font-medium leading-relaxed">{lead.notes}</span>
                        </div>
                    )}

                    {/* Card footer */}
                    <div className="border-t border-border/50 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <select
                                className={cn(
                                    "px-2 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-xl",
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
                                            : "bg-success/10 text-success hover:bg-success/20"
                                    )}
                                    title="تم التحويل" aria-label="تم التحويل"
                                >
                                    <CheckCircle2 size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="w-7 h-7 bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all rounded-xl" title="اتصال" aria-label="اتصال">
                                    <PhoneCall size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="w-7 h-7 bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all rounded-xl" title="واتساب" aria-label="مراسلة عبر واتساب">
                                    <MessageSquare size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'lost'
                                            ? "bg-error text-on-primary"
                                            : "bg-error/10 text-error hover:bg-error/20"
                                    )}
                                    title="رفض" aria-label="رفض العميل"
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
