import { cn } from '../../../lib/utils';
import { Phone, MessageSquare, CheckCircle2, Trash2, Search, FileText } from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, StatusChip, getPriority, ActionBtn, statusColors } from './LeadsUI';

interface LeadCardsProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

export const LeadCards = ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden">
            {filteredLeads.length === 0 ? (
                <div className="py-16 text-center">
                    <Search size={40} className="mx-auto mb-3 text-muted/20" />
                    <p className="text-sm font-bold text-muted">لا توجد نتائج</p>
                    <p className="text-xs text-muted/70 mt-1">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            ) : (
                <div className="p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredLeads.map((lead, idx) => {
                        const priority = getPriority(lead.priority);
                        return (
                            <div
                                key={lead.id}
                                onClick={() => onLeadClick(lead)}
                                className="bg-card border border-border rounded-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden hover:shadow-sm"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-sm text-main leading-tight truncate">
                                                {lead.studentName || 'عميل بدون اسم'}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {lead.source && (
                                                    <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded">{lead.source}</span>
                                                )}
                                                {lead.notes && (
                                                    <span className="shrink-0" title={lead.notes}>
                                                        <FileText size={11} className="text-warning" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusChip status={lead.status as LeadStatus} size="sm" />
                                </div>

                                {/* Info row */}
                                <div className="px-4 pb-3 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                                    <span
                                        onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }}
                                        className="font-mono hover:text-success cursor-pointer transition-colors"
                                    >
                                        {lead.phone}
                                    </span>
                                    <span className="text-muted/30">·</span>
                                    <span>{lead.subject}</span>
                                    {lead.curriculum && (
                                        <>
                                            <span className="text-muted/30">·</span>
                                            <span>{lead.curriculum}</span>
                                        </>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                    <div className="mx-4 mb-3 bg-warning/5 border-s-2 border-s-warning px-3 py-2 rounded-lg">
                                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="border-t border-border px-4 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg', priority.bg, priority.color)}>
                                                {lead.priority === 'high' ? <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" /> : lead.priority === 'medium' ? <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" />}
                                                {priority.label}
                                            </span>
                                            <select
                                                className="px-2 py-0.5 text-[10px] font-bold border-0 outline-none cursor-pointer rounded-lg bg-surface transition-all"
                                                value={lead.status}
                                                aria-label="حالة العميل"
                                                onChange={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } }); }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                                    <option key={key} value={key}>{statusColors[key].label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} icon={Phone} label="اتصال" color="success" />
                                            <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} icon={MessageSquare} label="واتساب" color="success" />
                                            <ActionBtn onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} icon={CheckCircle2} label="تم" color="info" />
                                            <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} icon={Trash2} label="حذف" color="error" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
