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
                        <Search size={28} className="text-primary opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-main">·«  ÊÃœ ‰ «∆Ã</p>
                    <p className="text-xs text-muted mt-1">·« ÌÊÃœ ⁄„·«¡ „ ÿ«»ﬁÊ‰ „⁄ „⁄«ÌÌ— «·»ÕÀ</p>
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
                    <div className="flex items-center px-5 py-3 bg-gradient-to-l from-primary to-primary-deep">
                        <div className="w-[22%] px-2 font-bold text-[11px] tracking-wide text-on-primary text-end">«·⁄„Ì·</div>
                        <div className="w-[13%] px-2 font-bold text-[11px] tracking-wide text-on-primary text-end">«· Ê«’·</div>
                        <div className="w-[13%] px-2 font-bold text-[11px] tracking-wide text-on-primary text-end">«·„«œ…</div>
                        <div className="w-[14%] px-2 font-bold text-[11px] tracking-wide text-on-primary text-end">«·Õ«·…</div>
                        <div className="w-[10%] px-1 font-bold text-[11px] tracking-wide text-on-primary text-center">«·√Ê·ÊÌ…</div>
                        <div className="w-[28%] px-2 font-bold text-[11px] tracking-wide text-on-primary text-center">«·≈Ã—«¡« </div>
                    </div>
                )}
                itemContent={(index, lead) => {
                    const priority = getPriority(lead.priority);
                    return (
                        <div onClick={() => onLeadClick(lead)}
                            className="flex items-center px-5 py-3.5 cursor-pointer border-b border-border group transition-all duration-200 hover:bg-hover">
                            <div className="w-[22%] flex items-center gap-3 min-w-0 px-2">
                                <GradientAvatar name={lead.studentName || '⁄'} size="sm" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-[13px] text-main truncate">{lead.studentName || '⁄„Ì· »œÊ‰ «”„'}</h4>
                                    {lead.source && (
                                        <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-px rounded mt-0.5 inline-block">{lead.source}</span>
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
                                    aria-label="Õ«·… «·⁄„Ì·"
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
                                <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} icon={Phone} label="« ’«·" color="success" title="« ’«·" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} icon={MessageSquare} label="Ê« ”«»" color="success" title="Ê« ”«»" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} icon={CheckCircle2} label=" „" color="info" title=" „ «· ÕÊÌ·" />
                                <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} icon={Trash2} label="Õ–›" color="error" title="Õ–› «·⁄„Ì·" />
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
});
