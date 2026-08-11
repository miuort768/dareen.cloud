import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Phone, MessageSquare, CheckCircle2, Trash2, Search } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';
import { GradientAvatar, getPriority, ActionBtn, statusColors } from './LeadsUI';
import { cn } from '../../../lib/utils';

interface LeadTableProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

export const LeadTable = memo(({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadTableProps) => {
    if (filteredLeads.length === 0) {
        return (
            <div className="hidden lg:block">
                <div className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-soft flex items-center justify-center">
                        <Search size={28} className="text-primary/40" />
                    </div>
                    <p className="text-sm font-bold text-main">لا توجد نتائج</p>
                    <p className="text-xs text-muted mt-1">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:block">
            <Virtuoso
                style={{ height: Math.min(filteredLeads.length * 56 + 60, 600) }}
                data={filteredLeads}
                fixedHeaderContent={() => (
                    <div className="flex items-center px-5 py-3 bg-surface/50 border-b border-border">
                        <div className="w-[22%] px-2 font-bold text-[11px] tracking-wide text-muted text-end">العميل</div>
                        <div className="w-[13%] px-2 font-bold text-[11px] tracking-wide text-muted text-end">التواصل</div>
                        <div className="w-[13%] px-2 font-bold text-[11px] tracking-wide text-muted text-end">المادة</div>
                        <div className="w-[14%] px-2 font-bold text-[11px] tracking-wide text-muted text-end">الحالة</div>
                        <div className="w-[10%] px-1 font-bold text-[11px] tracking-wide text-muted text-center">الأولوية</div>
                        <div className="w-[28%] px-2 font-bold text-[11px] tracking-wide text-muted text-center">الإجراءات</div>
                    </div>
                )}
                itemContent={(index, lead) => {
                    const priority = getPriority(lead.priority);
                    return (
                        <div onClick={() => onLeadClick(lead)}
                            className="flex items-center px-5 py-3.5 cursor-pointer border-b border-border/40 group transition-all duration-200 hover:bg-hover/50">
                            <div className="w-[22%] flex items-center gap-3 min-w-0 px-2">
                                <GradientAvatar name={lead.studentName || 'ع'} size="sm" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-[13px] text-main truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
                                    {lead.source && (
                                        <span className="text-[10px] font-medium text-info bg-info/10 px-1.5 py-px rounded mt-0.5 inline-block">{lead.source}</span>
                                    )}
                                </div>
                            </div>
                            <div className="w-[13%] px-2">
                                <span onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }}
                                    className="font-mono text-[12px] text-muted hover:text-success cursor-pointer transition-colors">{lead.phone}</span>
                            </div>
                            <div className="w-[13%] px-2">
                                <span className="text-[11px] text-muted bg-surface px-2 py-1 rounded-lg">{lead.subject}</span>
                            </div>
                            <div className="w-[14%] px-2">
                                <select
                                    className="px-2.5 py-1.5 text-[10px] font-bold border border-border outline-none cursor-pointer rounded-lg bg-surface transition-all text-main"
                                    value={lead.status}
                                    aria-label="حالة العميل"
                                    onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                    onClick={(e) => e.stopPropagation()}>
                                    {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                        <option key={key} value={key} className="bg-card text-main">{statusColors[key].label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-[10%] text-center px-1">
                                <span className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg',
                                    priority.bg, priority.color, priority.darkBg, priority.darkText
                                )}>
                                    {priority.label}
                                </span>
                            </div>
                            <div className="w-[28%] flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} icon={Phone} label="اتصال" color="success" title="اتصال" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} icon={MessageSquare} label="واتساب" color="success" title="واتساب" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} icon={CheckCircle2} label="تم" color="info" title="تم التحويل" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} icon={Trash2} label="حذف" color="error" title="حذف العميل" />
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
});
