import { memo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Phone, MessageSquare, CheckCircle2, Trash2, ChevronDown } from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, getPriority, getLeadAge, ActionBtn } from './LeadsUI';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadTableProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

export const LeadTable = memo(({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadTableProps) => {
    const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

    if (filteredLeads.length === 0) return null;

    return (
        <div className="hidden lg:block overflow-hidden bg-card border border-border rounded-2xl">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-surface/80 border-b border-border">
                        <th className="text-end px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase">العميل</th>
                        <th className="text-end px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase">التواصل</th>
                        <th className="text-end px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase">المادة</th>
                        <th className="text-end px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase">الحالة</th>
                        <th className="text-center px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase">الأولوية</th>
                        <th className="text-center px-4 py-2.5 font-bold text-[10px] tracking-wider text-muted uppercase w-56">الإجراءات</th>
                    </tr>
                </thead>
            </table>
            <Virtuoso
                style={{ height: Math.min(filteredLeads.length * 49 + 100, 560) }}
                data={filteredLeads}
                itemContent={(index, lead) => {
                    const age = getLeadAge(lead.createdAt);
                    const priority = getPriority(lead.priority);
                    const hasNotes = !!lead.notes;
                    const isNoteExpanded = expandedNotes === lead.id;
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.015 }}
                        >
                            <div
                                onClick={() => onLeadClick(lead)}
                                className="flex items-center px-4 py-2 cursor-pointer border-b border-border/40 group transition-all hover:bg-hover/80"
                            >
                                {/* Customer */}
                                <div className="w-[22%] flex items-center gap-2.5 min-w-0">
                                    <GradientAvatar name={lead.studentName || 'ع'} size="sm" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-xs text-main truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
                                            {hasNotes && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setExpandedNotes(isNoteExpanded ? null : lead.id); }}
                                                    className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-all"
                                                    title={lead.notes}
                                                >
                                                    📝 <span className="max-w-[40px] truncate">{lead.notes}</span>
                                                    <ChevronDown size={8} className={cn('transition-transform', isNoteExpanded && 'rotate-180')} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {lead.createdAt && (
                                                <span className={cn('text-[9px] font-medium', age.color)}>{age.text}</span>
                                            )}
                                            {lead.source && (
                                                <span className="text-[9px] font-medium text-info bg-info-soft px-1 py-px rounded">{lead.source}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="w-[15%] px-2">
                                    <span className="font-mono text-xs text-main">{lead.phone}</span>
                                </div>

                                {/* Subject */}
                                <div className="w-[13%] px-2">
                                    <span className="text-xs text-muted bg-surface border border-border px-2 py-1 rounded-lg">{lead.subject}</span>
                                </div>

                                {/* Status */}
                                <div className="w-[15%] px-2">
                                    <select
                                        className={cn(
                                            'px-2 py-1 text-[10px] font-bold border-0 outline-none cursor-pointer rounded-full transition-all',
                                            'bg-card',
                                        )}
                                        value={lead.status}
                                        aria-label="حالة العميل"
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                            <option key={key} value={key}>{key === 'new' ? '🆕 جديد' : key === 'contacted' ? '📞 تم الاتصال' : key === 'interested' ? '⭐ مهتم' : key === 'trial' ? '🎯 حصة تجريبية' : key === 'converted' ? '✅ محول' : '❌ مفقود'}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority */}
                                <div className="w-[10%] text-center px-1">
                                    <span className={cn(
                                        'inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-full',
                                        priority.bg, priority.color
                                    )}>
                                        {lead.priority === 'high' ? '🔴' : lead.priority === 'medium' ? '🟡' : '🟢'} {priority.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="w-[25%] flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <ActionBtn
                                        onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}
                                        icon={Phone} label="اتصال" color="success" title="اتصال"
                                    />
                                    <ActionBtn
                                        onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }}
                                        icon={MessageSquare} label="واتساب" color="success" title="واتساب"
                                    />
                                    <ActionBtn
                                        onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); }}
                                        icon={CheckCircle2} label="تم" color="info" title="تم التحويل"
                                    />
                                    <ActionBtn
                                        onClick={(e) => { e.stopPropagation(); handleMarkLost(lead.id); }}
                                        icon={Trash2} label="حذف" color="error" title="حذف العميل"
                                    />
                                </div>
                            </div>

                            {/* Expanded notes */}
                            <AnimatePresence>
                                {isNoteExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden border-b border-border/40"
                                    >
                                        <div className="px-4 py-2 bg-warning/5 border-s-2 border-s-warning">
                                            <p className="text-[11px] text-muted leading-relaxed">{lead.notes}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                }}
            />
        </div>
    );
});
