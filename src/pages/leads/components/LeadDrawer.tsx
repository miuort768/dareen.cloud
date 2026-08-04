import { useState, useEffect, useRef } from 'react';
import { X, Phone, MessageSquare, CheckCircle2, Edit3, Clock, UserPlus, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, getLeadAge, statusColors, getPriority } from './LeadsUI';

interface LeadDrawerProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
}

const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA');
};

interface TimelineEvent {
    id: string;
    type: 'created' | 'status_changed' | 'note_added' | 'called' | 'whatsapp' | 'converted';
    label: string;
    date: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

const getTimelineEvents = (lead: Lead): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'created', type: 'created', label: 'تم إنشاء العميل', date: lead.createdAt, icon: UserPlus, color: 'text-info bg-info-soft' });
    if (lead.lastContact) events.push({ id: 'last-contact', type: 'called', label: 'آخر اتصال', date: lead.lastContact, icon: Phone, color: 'text-success bg-success-soft' });
    if (lead.status === 'contacted') events.push({ id: 'contacted', type: 'status_changed', label: 'تم الاتصال بالعميل', date: lead.createdAt, icon: Phone, color: 'text-warning bg-warning-soft' });
    if (lead.status === 'interested') events.push({ id: 'interested', type: 'status_changed', label: 'أبدى اهتمامًا', date: lead.createdAt, icon: Tag, color: 'text-success bg-success-soft' });
    if (lead.status === 'trial') events.push({ id: 'trial', type: 'status_changed', label: 'تم تحديد حصة تجريبية', date: lead.createdAt, icon: Calendar, color: 'text-primary bg-primary-soft' });
    if (lead.status === 'converted') events.push({ id: 'converted', type: 'converted', label: 'تم التحويل إلى مشترك', date: lead.createdAt, icon: CheckCircle2, color: 'text-success bg-success-soft' });
    if (lead.status === 'lost') events.push({ id: 'lost', type: 'status_changed', label: 'تم رفض العميل', date: lead.createdAt, icon: AlertTriangle, color: 'text-error bg-error-soft' });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const LeadDrawer = ({ lead, isOpen, onClose, updateMutation }: LeadDrawerProps) => {
    const [isEditing] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            closeRef.current?.focus();
            const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
        }
    }, [isOpen, onClose]);

    if (!lead) return null;

    const age = getLeadAge(lead.createdAt);
    const timeline = getTimelineEvents(lead);
    const statusCfg = statusColors[lead.status as LeadStatus] || statusColors.new;
    const priority = getPriority(lead.priority as LeadPriority);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 start-0 z-[200] w-full max-w-md bg-card border-e border-border shadow-elevation-3 flex flex-col"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="shrink-0 px-5 py-4 border-b border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                                    <div>
                                        <h2 className="text-sm font-bold text-main">{lead.studentName || 'عميل بدون اسم'}</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn('text-[10px] font-medium', age.color)}>{age.text}</span>
                                            {lead.source && (
                                                <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded">{lead.source}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button ref={closeRef} onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-hover rounded-xl transition-all" aria-label="إغلاق">
                                    <X size={18} className="text-muted" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    className={cn('px-2.5 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-lg', statusCfg.bg, statusCfg.color)}
                                    value={lead.status}
                                    aria-label="حالة العميل"
                                    onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                >
                                    {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                         <option key={key} value={key}>{statusColors[key].label}</option>
                                     ))}
                                </select>
                                <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg', priority.bg, priority.color)}>
                                    {priority.label}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="px-5 py-4 border-b border-border">
                                <h3 className="text-xs font-bold text-muted mb-3">البيانات</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center shrink-0 ring-1 ring-success/20"><Phone size={14} className="text-success" /></div>
                                        <div className="min-w-0"><p className="text-[10px] text-muted">الهاتف</p><p className="text-sm font-bold text-main font-mono">{lead.phone}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-info-soft flex items-center justify-center shrink-0 ring-1 ring-info/20"><Tag size={14} className="text-info" /></div>
                                        <div className="min-w-0"><p className="text-[10px] text-muted">المادة</p><p className="text-sm font-bold text-main">{lead.subject}</p></div>
                                    </div>
                                    {lead.curriculum && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center shrink-0 ring-1 ring-warning/20"><Tag size={14} className="text-warning" /></div>
                                            <div className="min-w-0"><p className="text-[10px] text-muted">المنهج</p><p className="text-sm font-bold text-main">{lead.curriculum}</p></div>
                                        </div>
                                    )}
                                    {lead.parentName && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center shrink-0 ring-1 ring-primary/20"><UserPlus size={14} className="text-primary" /></div>
                                            <div className="min-w-0"><p className="text-[10px] text-muted">ولي الأمر</p><p className="text-sm font-bold text-main">{lead.parentName}</p></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {lead.notes && (
                                <div className="px-5 py-4 border-b border-border">
                                    <h3 className="text-xs font-bold text-muted mb-2">ملاحظات</h3>
                                    <p className="text-sm text-main leading-relaxed bg-warning/5 border-s-2 border-s-warning p-3 rounded-xl">{lead.notes}</p>
                                </div>
                            )}

                            <div className="px-5 py-4">
                                <h3 className="text-xs font-bold text-muted mb-3">السجل</h3>
                                <div className="space-y-0">
                                    {timeline.map((event, idx) => {
                                        const Icon = event.icon;
                                        return (
                                            <div key={event.id} className="flex gap-3 relative">
                                                {idx < timeline.length - 1 && <div className="absolute top-8 start-[15px] w-px h-full bg-border" />}
                                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10 ring-1 ring-black/5', event.color)}><Icon size={14} /></div>
                                                <div className="pb-4 min-w-0">
                                                    <p className="text-xs font-bold text-main">{event.label}</p>
                                                    <p className="text-[10px] text-muted mt-0.5">{formatRelativeTime(event.date)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="shrink-0 border-t border-border px-5 py-3">
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-all">
                                    <Phone size={16} /><span className="text-[10px] font-bold">اتصال</span>
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-all">
                                    <MessageSquare size={16} /><span className="text-[10px] font-bold">واتساب</span>
                                </button>
                                <button onClick={() => { updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); onClose(); }} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-info/10 text-info hover:bg-info/20 transition-all">
                                    <CheckCircle2 size={16} /><span className="text-[10px] font-bold">تحويل</span>
                                </button>
                                <button onClick={() => setIsEditing(true)} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-surface hover:bg-hover transition-all">
                                    <Edit3 size={16} className="text-muted" /><span className="text-[10px] font-bold text-muted">تعديل</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
