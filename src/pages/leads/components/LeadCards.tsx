import { cn } from '../../../lib/utils';
import { Phone, MessageSquare, CheckCircle2, Trash2, Search, FileText, ChevronLeft } from 'lucide-react';
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
                                className="bg-card border border-border rounded-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden hover:shadow-sm group"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-sm text-main leading-tight truncate">
                                                {lead.studentName || 'عميل بدون اسم'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted font-mono">{lead.phone}</span>
                                                {lead.source && (
                                                    <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded-md">{lead.source}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronLeft size={16} className="text-muted/30 group-hover:text-muted transition-colors shrink-0" />
                                </div>

                                {/* Info chips */}
                                <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                                    <StatusChip status={lead.status as LeadStatus} size="sm" />
                                    <span className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border',
                                        priority.bg, priority.color, 'border-current/10'
                                    )}>
                                        <span className={cn('w-1.5 h-1.5 rounded-full', lead.priority === 'high' ? 'bg-error' : lead.priority === 'medium' ? 'bg-warning' : 'bg-muted')} />
                                        {priority.label}
                                    </span>
                                    <span className="text-[11px] text-muted bg-surface border border-border px-2 py-0.5 rounded-md">{lead.subject}</span>
                                    {lead.curriculum && (
                                        <span className="text-[11px] text-muted bg-surface border border-border px-2 py-0.5 rounded-md">{lead.curriculum}</span>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                    <div className="mx-4 mb-3 bg-warning/5 border-s-2 border-s-warning px-3 py-2 rounded-lg">
                                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Actions footer */}
                                <div className="border-t border-border px-3 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} icon={Phone} label="اتصال" color="success" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} icon={MessageSquare} label="واتساب" color="success" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} icon={CheckCircle2} label="تم" color="info" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} icon={Trash2} label="حذف" color="error" />
                                    </div>
                                    <select
                                        className="px-2 py-1 text-[10px] font-bold border border-border outline-none cursor-pointer rounded-lg bg-surface transition-all text-main"
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
