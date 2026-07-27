import { cn } from '../../../lib/utils';
import { Phone, PhoneCall, MessageSquare, Trash, CheckCircle2, Tag, Users } from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';

interface LeadCardsProps {
    filteredLeads: Lead[];
    statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const priorityConfig: Record<LeadPriority, { label: string; color: string; bg: string }> = {
    high: { label: 'عالية', color: 'text-error', bg: 'bg-error-soft' },
    medium: { label: 'متوسطة', color: 'text-warning', bg: 'bg-warning-soft' },
    low: { label: 'منخفضة', color: 'text-muted', bg: 'bg-surface' },
};

const getLeadAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return { text: 'الآن', color: 'text-success' };
    if (diffMins < 60) return { text: `منذ ${diffMins} د`, color: 'text-success' };
    if (diffHours < 24) return { text: `منذ ${diffHours} س`, color: 'text-info' };
    if (diffDays < 7) return { text: `منذ ${diffDays} أيام`, color: 'text-warning' };
    return { text: `منذ ${diffDays} يوم`, color: 'text-error' };
};

export const LeadCards = ({ filteredLeads, statusConfig, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden space-y-3">
            {filteredLeads.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد نتائج بحث</p>
                    <p className="text-xs text-muted mt-1.5">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            ) : filteredLeads.map((lead) => (
                <div
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="bg-card border border-border rounded-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary-soft text-primary">
                                {lead.studentName?.charAt(0) || 'ع'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-main leading-tight truncate">
                                    {lead.studentName || 'عميل بدون اسم'}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {lead.createdAt && (
                                        <span className={cn("text-[10px] font-medium", getLeadAge(lead.createdAt).color)}>
                                            {getLeadAge(lead.createdAt).text}
                                        </span>
                                    )}
                                    {lead.source && (
                                        <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded">
                                            {lead.source}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={cn(
                            "shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full",
                            priorityConfig[lead.priority].bg,
                            priorityConfig[lead.priority].color
                        )}>
                            {priorityConfig[lead.priority].label}
                        </span>
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
                    <div className="border-t border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <select
                                className={cn(
                                    "px-2 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-xl",
                                    statusConfig[lead.status].bg,
                                    statusConfig[lead.status].color
                                )}
                                value={lead.status}
                                aria-label="حالة العميل"
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
                                        "min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'converted'
                                            ? "bg-success text-on-success"
                                            : "bg-success-soft text-success hover:bg-success/10"
                                    )}
                                    title="تم التحويل" aria-label="تم التحويل"
                                >
                                    <CheckCircle2 size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="min-w-[36px] min-h-[36px] w-9 h-9 bg-success-soft text-success flex items-center justify-center hover:bg-success/10 transition-all rounded-xl" title="اتصال" aria-label="اتصال">
                                    <PhoneCall size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="min-w-[36px] min-h-[36px] w-9 h-9 bg-success-soft text-success flex items-center justify-center hover:bg-success/10 transition-all rounded-xl" title="واتساب" aria-label="مراسلة عبر واتساب">
                                    <MessageSquare size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                    className={cn(
                                        "min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center transition-all rounded-xl",
                                        lead.status === 'lost'
                                            ? "bg-error text-on-error"
                                            : "bg-error-soft text-error hover:bg-error/10"
                                    )}
                                    title="رفض" aria-label="رفض العميل"
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
