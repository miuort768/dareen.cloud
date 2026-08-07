import { motion } from 'framer-motion';
import { Phone, MessageSquare, CheckCircle2, Trash2, Search, ChevronLeft, Clock } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';
import { GradientAvatar, StatusChip, getPriority, ActionBtn, getLeadAge, statusColors } from './LeadsUI';
import { cn } from '../../../lib/utils';

interface LeadCardsProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const statusAccent: Record<LeadStatus, string> = {
    new: 'border-l-info',
    contacted: 'border-l-warning',
    interested: 'border-l-success',
    trial: 'border-l-primary',
    converted: 'border-l-info',
    lost: 'border-l-error',
};

const statusGlow: Record<LeadStatus, string> = {
    new: 'shadow-info/5',
    contacted: 'shadow-warning/5',
    interested: 'shadow-success/5',
    trial: 'shadow-primary/5',
    converted: 'shadow-info/5',
    lost: 'shadow-error/5',
};

export const LeadCards = ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden">
            {filteredLeads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-20 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface flex items-center justify-center">
                        <Search size={28} className="text-muted/30" />
                    </div>
                    <p className="text-sm font-bold text-muted mb-1">لا توجد نتائج</p>
                    <p className="text-xs text-muted/60">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </motion.div>
            ) : (
                <div className="p-3 space-y-2.5">
                    {filteredLeads.map((lead, idx) => {
                        const priority = getPriority(lead.priority);
                        const age = getLeadAge(lead.createdAt);
                        const cfg = statusColors[lead.status as LeadStatus];
                        return (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.3 }}
                                onClick={() => onLeadClick(lead)}
                                className={cn(
                                    'bg-card border border-border border-l-[3px] rounded-2xl active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm',
                                    statusAccent[lead.status as LeadStatus],
                                    statusGlow[lead.status as LeadStatus],
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative">
                                            <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                            <div className={cn('absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-card', cfg.dot)} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-[13px] text-main leading-tight truncate">
                                                {lead.studentName || 'عميل بدون اسم'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-muted font-mono tracking-tight">{lead.phone}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="flex items-center gap-0.5 text-[10px] text-muted">
                                                    <Clock size={8} />
                                                    {age.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronLeft size={16} className="text-muted/25 group-hover:text-muted transition-colors shrink-0" />
                                </div>

                                {/* Info chips */}
                                <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                                    <StatusChip status={lead.status as LeadStatus} size="sm" />
                                    <span className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border border-current/10',
                                        priority.bg, priority.color
                                    )}>
                                        <span className={cn('w-1.5 h-1.5 rounded-full', lead.priority === 'high' ? 'bg-error' : lead.priority === 'medium' ? 'bg-warning' : 'bg-muted')} />
                                        {priority.label}
                                    </span>
                                    {lead.subject && (
                                        <span className="text-[10px] text-muted bg-surface border border-border px-2 py-0.5 rounded-full">{lead.subject}</span>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                    <div className="mx-4 mb-3 bg-warning/5 border-s-[3px] border-s-warning/40 px-3 py-2 rounded-xl">
                                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Actions footer */}
                                <div className="border-t border-border/60 px-3 py-2.5 flex items-center justify-between bg-surface/30">
                                    <div className="flex items-center gap-1">
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} icon={Phone} label="اتصال" color="success" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} icon={MessageSquare} label="واتساب" color="success" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} icon={CheckCircle2} label="تم" color="info" />
                                        <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} icon={Trash2} label="حذف" color="error" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
