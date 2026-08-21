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

const statusBorderColor: Record<LeadStatus, string> = {
    new: 'border-t-info', contacted: 'border-t-warning', interested: 'border-t-success',
    trial: 'border-t-primary', converted: 'border-t-info', lost: 'border-t-error',
};

export const LeadCards = ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadCardsProps) => {
    return (
        <div className="lg:hidden">
            {filteredLeads.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-soft flex items-center justify-center">
                        <Search size={28} className="text-primary opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-main mb-1">لا توجد نتائج</p>
                    <p className="text-xs text-muted">لا يوجد عملاء متطابقون مع معايير البحث</p>
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
                                className={cn(
                                    'bg-card border border-border rounded-none active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm',
                                    'border-t-[3px]',
                                    statusBorderColor[lead.status as LeadStatus]
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between px-4 pt-4 pb-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative">
                                            <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[13px] text-main truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
                                                <StatusChip status={lead.status as LeadStatus} size="sm" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-muted font-mono">{lead.phone}</span>
                                                <span className="text-[11px] text-border">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-muted">
                                                    <Clock size={8} />
                                                    {age.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-lg',
                                            priority.bg, priority.color, priority.darkBg, priority.darkText,
                                        )}>
                                            {priority.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
                                    {lead.subject && (
                                        <span className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded-full">{lead.subject}</span>
                                    )}
                                    {lead.curriculum && (
                                        <span className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded-full">{lead.curriculum}</span>
                                    )}
                                    {lead.source && (
                                        <span className="text-[10px] text-info bg-info-soft px-2 py-0.5 rounded-full">{lead.source}</span>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && (
                                    <div className="mx-4 mb-3 bg-warning-soft border border-warning-soft px-3 py-2 rounded-xl">
                                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Actions footer */}
                                <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-surface">
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }} aria-label="اتصال هاتفي"
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-success-soft hover:bg-success-light text-success transition-all active:scale-95">
                                            <Phone size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} aria-label="رسالة واتساب"
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-success-soft hover:bg-success-light text-success transition-all active:scale-95">
                                            <MessageSquare size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }} aria-label="تحويل العميل"
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-info-soft hover:bg-info-light text-info transition-all active:scale-95">
                                            <Calendar size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }} aria-label="حذف العميل"
                                            className="flex items-center justify-center w-8 h-8 rounded-xl bg-error-soft hover:bg-error-light text-error transition-all active:scale-95">
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
