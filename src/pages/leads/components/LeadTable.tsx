import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../../../lib/utils';
import { Phone, PhoneCall, MessageSquare, Trash, CheckCircle2, Tag, Star, Users } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';

interface LeadTableProps {
    filteredLeads: Lead[];
    statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
}

export const LeadTable = memo(({ filteredLeads, statusConfig, updateMutation, handleMarkLost }: LeadTableProps) => {
    if (filteredLeads.length === 0) {
        return (
            <div className="hidden lg:block bg-card border border-border/50 shadow-soft rounded-card">
                <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-card bg-primary-soft flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد نتائج بحث</p>
                    <p className="text-xs text-dim mt-1.5">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:block overflow-hidden bg-card border border-border/50 shadow-soft rounded-card">
            <table className="w-full text-start border-collapse">
                <thead>
                    <tr className="bg-primary">
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary">العميل</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary">التواصل</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary">المادة</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary">الحالة</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary text-center">الأولوية</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-on-primary text-center">إجراءات</th>
                    </tr>
                </thead>
            </table>
            <Virtuoso
                style={{ height: Math.min(filteredLeads.length * 60 + 100, 600) }}
                data={filteredLeads}
                itemContent={(index, lead) => (
                    <div>
                        <div
                            onDoubleClick={() => handleMarkLost(lead.id)}
                            className="flex items-center px-5 py-3.5 hover:bg-hover transition-colors cursor-pointer border-b border-border/50"
                        >
                            <div className="w-1/5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-card flex items-center justify-center font-bold text-xs bg-primary-soft text-primary">
                                    {lead.studentName?.charAt(0) || 'ع'}
                                </div>
                                <div className="bg-success/10 px-3 py-1 rounded-card">
                                    <h4 className="font-bold text-xs text-success">{lead.studentName || 'عميل بدون اسم'}</h4>
                                </div>
                            </div>
                            <div className="w-1/6">
                                <span className="font-mono text-xs text-muted flex items-center gap-1.5">
                                    <Phone size={11} className="text-success" /> {lead.phone}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface text-xs text-muted border border-border/50 rounded-card">
                                    <Tag size={11} className="text-info" /> {lead.subject}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <select
                                    className={cn(
                                        "px-2 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-xl",
                                        statusConfig[lead.status].bg,
                                        statusConfig[lead.status].color
                                    )}
                                    value={lead.status}
                                    aria-label="حالة العميل"
                                    onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-[10%] text-center">
                                <div className="flex justify-center gap-0.5">
                                    {[...Array(3)].map((_, i) => (
                                        <Star key={`star-${i}`} size={11} className={cn(
                                            (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                                ? "text-warning fill-warning"
                                                : "text-dim"
                                        )} />
                                    ))}
                                </div>
                            </div>
                            <div className="w-[10%]">
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                        className={cn(
                                            "w-7 h-7 flex items-center justify-center transition-all rounded-xl",
                                            lead.status === 'converted'
                                                ? "bg-success text-on-success"
                                                : "bg-success/10 text-success hover:bg-success/20"
                                        )}
                                        title="تم التحويل / مشترك" aria-label="تم التحويل"
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
                                                ? "bg-error text-on-error"
                                                : "bg-error/10 text-error hover:bg-error/20"
                                        )}
                                        title="رفض / ملغي" aria-label="رفض العميل"
                                    >
                                        <Trash size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {lead.notes && (
                            <div className="bg-warning-soft px-5 py-2.5 border-b border-border/50">
                                <div className="flex items-start gap-2 text-xs leading-relaxed text-muted font-medium max-w-full">
                                    <span className="text-xs font-bold text-warning shrink-0 mt-0.5">ملاحظات</span>
                                    <span>{lead.notes}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
});