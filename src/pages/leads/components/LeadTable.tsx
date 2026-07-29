import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../../../lib/utils';
import { Phone, PhoneCall, MessageSquare, Trash, CheckCircle2, Tag, Users } from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';

interface LeadTableProps {
    filteredLeads: Lead[];
    statusConfig: Record<LeadStatus, { label: string, color: string, bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: 'عالية', color: 'text-error', bg: 'bg-error-soft' },
    medium: { label: 'متوسطة', color: 'text-warning', bg: 'bg-warning-soft' },
    low: { label: 'منخفضة', color: 'text-muted', bg: 'bg-surface' },
};
const getPriority = (p: string) => priorityConfig[p] || priorityConfig.low;

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

export const LeadTable = memo(({ filteredLeads, statusConfig, updateMutation, handleMarkLost, onLeadClick }: LeadTableProps) => {
    const getStatus = (s: string) => statusConfig[s as LeadStatus] || statusConfig.new;
    if (filteredLeads.length === 0) {
        return (
            <div className="hidden lg:block bg-card border border-border rounded-2xl">
                <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد نتائج بحث</p>
                    <p className="text-xs text-muted mt-1.5">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:block overflow-x-auto bg-card border border-border rounded-2xl">
            <table className="w-full text-start border-collapse">
                <thead>
                    <tr className="bg-surface border-b border-border">
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted">العميل</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted">التواصل</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted">المادة</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted">الحالة</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted text-center">الأولوية</th>
                        <th className="px-5 py-3 font-bold text-xs tracking-wider text-muted text-center">إجراءات</th>
                    </tr>
                </thead>
            </table>
            <Virtuoso
                style={{ height: Math.min(filteredLeads.length * 56 + 100, 600) }}
                data={filteredLeads}
                itemContent={(index, lead) => (
                    <div>
                        <div
                            onClick={() => onLeadClick(lead)}
                            className="flex items-center px-5 py-3 hover:bg-hover transition-colors cursor-pointer border-b border-border/50"
                        >
                            <div className="w-1/5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-primary-soft text-primary">
                                    {lead.studentName?.charAt(0) || 'ع'}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-main truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
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
                            <div className="w-1/6">
                                <span className="font-mono text-xs text-main flex items-center gap-1.5">
                                    <Phone size={11} className="text-success" /> {lead.phone}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface text-xs text-muted border border-border rounded-lg">
                                    <Tag size={11} className="text-info" /> {lead.subject}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <select
                                    className={cn(
                                        "px-2 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-lg",
                                        getStatus(lead.status).bg,
                                        getStatus(lead.status).color
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
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full",
                                    getPriority(lead.priority).bg,
                                    getPriority(lead.priority).color
                                )}>
                                    {getPriority(lead.priority).label}
                                </span>
                            </div>
                            <div className="w-[10%]">
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                        className={cn(
                                            "min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center transition-all rounded-xl",
                                            lead.status === 'converted'
                                                ? "bg-success text-on-success"
                                                : "bg-success-soft text-success hover:bg-success/10"
                                        )}
                                        title="تم التحويل / مشترك" aria-label="تم التحويل"
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} className="min-w-[32px] min-h-[32px] w-8 h-8 bg-success-soft text-success flex items-center justify-center hover:bg-success/10 transition-all rounded-xl" title="اتصال" aria-label="اتصال">
                                        <PhoneCall size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="min-w-[32px] min-h-[32px] w-8 h-8 bg-success-soft text-success flex items-center justify-center hover:bg-success/10 transition-all rounded-xl" title="واتساب" aria-label="مراسلة عبر واتساب">
                                        <MessageSquare size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                        className={cn(
                                            "min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center transition-all rounded-xl",
                                            lead.status === 'lost'
                                                ? "bg-error text-on-error"
                                                : "bg-error-soft text-error hover:bg-error/10"
                                        )}
                                        title="رفض / ملغي" aria-label="رفض العميل"
                                    >
                                        <Trash size={14} />
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
