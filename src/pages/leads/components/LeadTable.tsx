import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Phone, MessageSquare, CheckCircle2, Trash2 } from 'lucide-react';
import type { Lead, LeadStatus } from '../../../features/crm/types';
import { GradientAvatar, getPriority, ActionBtn, statusColors } from './LeadsUI';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

interface LeadTableProps {
    filteredLeads: Lead[];
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
    handleMarkLost: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

export const LeadTable = memo(({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadTableProps) => {
    if (filteredLeads.length === 0) return null;

    return (
        <div className="hidden lg:block bg-card border border-border">
            <Virtuoso
                style={{ height: Math.min(filteredLeads.length * 49 + 100, 560) }}
                data={filteredLeads}
                fixedHeaderContent={() => (
                    <div className="flex items-center px-4 py-2.5 bg-surface/95 backdrop-blur-sm border-b border-border">
                        <div className="w-[22%] px-2 font-bold text-[10px] tracking-wider text-muted uppercase text-end">العميل</div>
                        <div className="w-[14%] px-2 font-bold text-[10px] tracking-wider text-muted uppercase text-end">التواصل</div>
                        <div className="w-[14%] px-2 font-bold text-[10px] tracking-wider text-muted uppercase text-end">المادة</div>
                        <div className="w-[14%] px-2 font-bold text-[10px] tracking-wider text-muted uppercase text-end">الحالة</div>
                        <div className="w-[10%] px-1 font-bold text-[10px] tracking-wider text-muted uppercase text-center">الأولوية</div>
                        <div className="w-[26%] px-2 font-bold text-[10px] tracking-wider text-muted uppercase text-center">الإجراءات</div>
                    </div>
                )}
                itemContent={(index, lead) => {
                    const priority = getPriority(lead.priority);
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.015 }}
                        >
                            <div
                                onClick={() => onLeadClick(lead)}
                                className="flex items-center px-4 py-2.5 cursor-pointer border-b border-border/40 group transition-all hover:bg-hover/80"
                            >
                                {/* العميل */}
                                <div className="w-[22%] flex items-center gap-2.5 min-w-0 px-2">
                                    <GradientAvatar name={lead.studentName || 'ع'} size="sm" />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-main truncate">{lead.studentName || 'عميل بدون اسم'}</h4>
                                        {lead.source && (
                                            <span className="text-[9px] font-medium text-info bg-info-soft px-1 py-px rounded mt-0.5 inline-block">{lead.source}</span>
                                        )}
                                    </div>
                                </div>

                                {/* التواصل */}
                                <div className="w-[14%] px-2">
                                    <span onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone}`, '_blank'); }} className="font-mono text-xs text-main hover:text-success cursor-pointer transition-colors">{lead.phone}</span>
                                </div>

                                {/* المادة */}
                                <div className="w-[14%] px-2">
                                    <span className="text-[11px] text-muted bg-surface border border-border px-2 py-1 rounded-lg">{lead.subject}</span>
                                </div>

                                {/* الحالة */}
                                <div className="w-[14%] px-2">
                                    <select
                                        className="px-2 py-1 text-[10px] font-bold border-0 outline-none cursor-pointer rounded-lg bg-surface transition-all"
                                        value={lead.status}
                                        aria-label="حالة العميل"
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                            <option key={key} value={key}>{statusColors[key].label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* الأولوية */}
                                <div className="w-[10%] text-center px-1">
                                    <span className={cn(
                                        'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded-lg',
                                        priority.bg, priority.color
                                    )}>
                                        {lead.priority === 'high' ? <span className="w-2 h-2 rounded-full bg-error inline-block" /> : lead.priority === 'medium' ? <span className="w-2 h-2 rounded-full bg-warning inline-block" /> : <span className="w-2 h-2 rounded-full bg-muted inline-block" />}
                                        {priority.label}
                                    </span>
                                </div>

                                {/* الإجراءات */}
                                <div className="w-[26%] flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
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
                        </motion.div>
                    );
                }}
            />
        </div>
    );
});
