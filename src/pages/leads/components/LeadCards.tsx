import { cn } from '../../../lib/utils';
import { Phone, MessageSquare, CheckCircle2, Trash2, Search, FileText } from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, StatusChip, getPriority, getLeadAge, ActionBtn, statusColors } from './LeadsUI';

interface LeadCardsProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

export const LeadCards = ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden space-y-2.5">
            {filteredLeads.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl py-12 text-center">
                    <Search size={36} className="mx-auto mb-3 text-muted/30" />
                    <p className="text-sm font-bold text-muted">لا توجد نتائج بحث</p>
                    <p className="text-xs text-muted mt-1">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </div>
            ) : filteredLeads.map((lead, idx) => {
                const age = getLeadAge(lead.createdAt);
                const priority = getPriority(lead.priority);
                return (
                    <div
                        key={lead.id}
                        onClick={() => onLeadClick(lead)}
                        className="bg-card border border-border rounded-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden hover:shadow-sm"
                        style={{ animationDelay: `${idx * 30}ms` }}
                    >
                        {/* Card header */}
                        <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-sm text-main leading-tight truncate">
                                            {lead.studentName || 'عميل بدون اسم'}
                                        </h4>
                                         {lead.notes && <span className="shrink-0" title={lead.notes}><FileText size={12} className="text-warning" /></span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {lead.createdAt && (
                                            <span className={cn('text-[10px] font-medium', age.color)}>{age.text}</span>
                                        )}
                                        {lead.source && (
                                            <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded">{lead.source}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <StatusChip status={lead.status as LeadStatus} size="sm" />
                        </div>

                        {/* Card body */}
                        <div className="px-3.5 pb-2 flex items-center gap-3 text-xs text-muted">
                            <span className="font-mono">{lead.phone}</span>
                            <span className="text-muted/40">·</span>
                            <span>{lead.subject}</span>
                            {lead.curriculum && (
                                <>
                                    <span className="text-muted/40">·</span>
                                    <span>{lead.curriculum}</span>
                                </>
                            )}
                        </div>

                        {/* Expanded notes on mobile */}
                        {lead.notes && (
                            <div className="mx-3.5 mb-2 bg-warning/5 border-s-2 border-s-warning px-3 py-2 rounded">
                                <p className="text-[11px] text-muted leading-relaxed">{lead.notes}</p>
                            </div>
                        )}

                        {/* Card footer */}
                        <div className="border-t border-border px-3.5 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full', priority.bg, priority.color)}>
                                         {lead.priority === 'high' ? <span className="w-2 h-2 rounded-full bg-error inline-block" /> : lead.priority === 'medium' ? <span className="w-2 h-2 rounded-full bg-warning inline-block" /> : <span className="w-2 h-2 rounded-full bg-muted inline-block" />} {priority.label}
                                    </span>
                                    <select
                                        className={cn(
                                            'px-2 py-0.5 text-[10px] font-bold border-0 outline-none cursor-pointer rounded-full bg-card',
                                        )}
                                        value={lead.status}
                                        aria-label="حالة العميل"
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                    >
                                         {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                             <option key={key} value={key}>{statusColors[key].label}</option>
                                         ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-0.5">
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
    );
};
