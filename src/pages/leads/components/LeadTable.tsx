import React, { memo } from 'react';
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
            <div className="hidden lg:block overflow-x-auto bg-white dark:bg-primary-active shadow-sm rounded-2xl border border-border dark:border-border">
                <div className="py-16 text-center">
                    <Users size={40} className="mx-auto mb-3 text-dim dark:text-main" />
                    <p className="text-xs font-bold text-muted">لا توجد نتائج بحث</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:block overflow-hidden bg-white dark:bg-primary-active shadow-sm rounded-2xl border border-border dark:border-border">
            <table className="w-full text-start border-collapse">
                <thead>
                    <tr className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)]">
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary">العميل</th>
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary">التواصل</th>
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary">المادة</th>
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary">الحالة</th>
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary text-center">الأولوية</th>
                        <th className="px-5 py-3 font-bold text-micro tracking-wider text-on-primary text-center">إجراءات</th>
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
                            className="flex items-center px-5 py-3.5 hover:bg-surface dark:hover:bg-primary-active/30 transition-colors cursor-pointer border-b border-border dark:border-border"
                        >
                            <div className="w-1/5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                                    {lead.studentName?.charAt(0) || 'ع'}
                                </div>
                                <div className="bg-success-light dark:bg-success/20 px-3 py-1 rounded-xl">
                                    <h4 className="font-bold text-xs text-success dark:text-success">{lead.studentName || 'عميل بدون اسم'}</h4>
                                </div>
                            </div>
                            <div className="w-1/6">
                                <span className="font-mono font-bold text-xs text-muted dark:text-dim flex items-center gap-1.5">
                                    <Phone size={11} className="text-success" /> {lead.phone}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface dark:bg-primary-active text-micro font-bold text-muted dark:text-dim border border-border dark:border-border rounded-xl">
                                    <Tag size={11} className="text-info" /> {lead.subject}
                                </span>
                            </div>
                            <div className="w-1/6">
                                <select
                                    className={cn(
                                        "px-2 py-1 text-micro font-bold border-0 outline-none cursor-pointer rounded-xl",
                                        statusConfig[lead.status].bg,
                                        statusConfig[lead.status].color
                                    )}
                                    value={lead.status}
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
                                        <Star key={i} size={11} className={cn(
                                            (lead.priority === 'high' || (lead.priority === 'medium' && i < 2) || (lead.priority === 'low' && i < 1))
                                                ? "text-warning fill-warning"
                                                : "text-dim dark:text-main"
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
                                                ? "bg-success text-on-primary"
                                                : "bg-success-light text-success hover:bg-success hover:text-on-primary"
                                        )}
                                        title="تم التحويل / مشترك"
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
                                        title="رفض / ملغي"
                                    >
                                        <Trash size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {lead.notes && (
                            <div className="bg-warning-light/30 dark:bg-warning/10 px-5 py-2.5 border-b border-border dark:border-border/80">
                                <div className="flex items-start gap-2 text-xs leading-relaxed text-muted dark:text-muted font-medium max-w-full">
                                    <span className="text-micro font-bold text-warning dark:text-warning tracking-widest shrink-0 mt-0.5">ملاحظات</span>
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