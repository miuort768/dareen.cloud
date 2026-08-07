import { motion } from 'framer-motion';
import { Phone, MessageSquare, Trash2, Search, Clock, Calendar } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';
import { GradientAvatar, StatusChip, getPriority, getLeadAge } from './LeadsUI';
import { cn } from '../../../lib/utils';

interface LeadCardsProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const statusRingColor: Record<LeadStatus, string> = {
    new: 'ring-info/50', contacted: 'ring-warning/50', interested: 'ring-success/50',
    trial: 'ring-primary/50', converted: 'ring-info/50', lost: 'ring-error/50',
};

export const LeadCards = ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden">
            {filteredLeads.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface dark:bg-white/5 flex items-center justify-center">
                        <Search size={28} className="text-muted/30 dark:text-white/20" />
                    </div>
                    <p className="text-sm font-bold text-muted dark:text-white/60 mb-1">لا توجد نتائج</p>
                    <p className="text-xs text-muted/60 dark:text-white/30">لا يوجد عملاء متطابقون مع معايير البحث</p>
                </motion.div>
            ) : (
                <div className="p-3 space-y-2.5">
                    {filteredLeads.map((lead, idx) => {
                        const priority = getPriority(lead.priority);
                        const age = getLeadAge(lead.createdAt);
                        return (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.3 }}
                                onClick={() => onLeadClick(lead)}
                                className="bg-card dark:bg-[#131836]/80 border border-border dark:border-white/[0.06] rounded-2xl active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm dark:shadow-none"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between px-4 pt-4 pb-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative">
                                            <div className={cn('rounded-full ring-2 ring-offset-2 ring-offset-card dark:ring-offset-[#131836]', statusRingColor[lead.status as LeadStatus])}>
                                                <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[13px] text-main dark:text-white truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
                                                <StatusChip status={lead.status as LeadStatus} size="sm" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-muted dark:text-white/40 font-mono">{lead.phone}</span>
                                                <span className="text-[11px] text-border dark:text-white/20">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-muted/60 dark:text-white/30">
                                                    <Clock size={8} />
                                                    {age.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full',
                                            priority.bg, priority.color, priority.darkBg, priority.darkText,
                                        )}>
                                            {priority.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
                                    {lead.subject && (
                                        <span className="text-[10px] text-muted dark:text-white/50 bg-surface dark:bg-white/5 border border-border dark:border-white/[0.06] px-2 py-0.5 rounded-full">{lead.subject}</span>
                                    )}
                                    {lead.curriculum && (
                                        <span className="text-[10px] text-muted dark:text-white/50 bg-surface dark:bg-white/5 border border-border dark:border-white/[0.06] px-2 py-0.5 rounded-full">{lead.curriculum}</span>
                                    )}
                                    {lead.source && (
                                        <span className="text-[10px] text-muted dark:text-white/50 bg-surface dark:bg-white/5 border border-border dark:border-white/[0.06] px-2 py-0.5 rounded-full">{lead.source}</span>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                    <div className="mx-4 mb-3 bg-warning/5 dark:bg-white/[0.03] border border-warning/10 dark:border-white/[0.04] px-3 py-2 rounded-xl">
                                        <p className="text-[11px] text-muted dark:text-white/40 leading-relaxed line-clamp-2">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Actions footer */}
                                <div className="border-t border-border dark:border-white/[0.04] px-4 py-2.5 flex items-center justify-between bg-surface/30 dark:bg-transparent">
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-success/10 dark:bg-white/5 hover:bg-success/20 dark:hover:bg-white/10 text-success dark:text-white/50 hover:text-success dark:hover:text-[#34d399] transition-all active:scale-95">
                                            <Phone size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }}
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-success/10 dark:bg-white/5 hover:bg-success/20 dark:hover:bg-white/10 text-success dark:text-white/50 hover:text-[#25d366] transition-all active:scale-95">
                                            <MessageSquare size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-info/10 dark:bg-white/5 hover:bg-info/20 dark:hover:bg-white/10 text-info dark:text-white/50 hover:text-info transition-all active:scale-95">
                                            <Calendar size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-error/10 dark:bg-white/5 hover:bg-error/20 dark:hover:bg-white/10 text-error dark:text-white/50 hover:text-error transition-all active:scale-95">
                                            <Trash2 size={14} />
                                        </button>
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
