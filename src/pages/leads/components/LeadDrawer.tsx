import { useState, useEffect, useRef } from 'react';
import { X, Phone, CheckCircle2, Edit3, UserPlus, Tag, Calendar, AlertTriangle, Save, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, getLeadAge, statusColors, getPriority } from './LeadsUI';

interface LeadDrawerProps {
    lead: Lead | null; isOpen: boolean; onClose: () => void;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
}

const formatRelativeTime = (dateStr: string) => {
    const now = new Date(); const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMins / 60); const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA');
};

interface TimelineEvent {
    id: string; type: 'created' | 'status_changed' | 'note_added' | 'called' | 'whatsapp' | 'converted';
    label: string; date: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string;
}

const getTimelineEvents = (lead: Lead): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'created', type: 'created', label: 'تم إنشاء العميل', date: lead.createdAt, icon: UserPlus, color: 'text-info', bg: 'bg-info-soft dark:bg-[#818cf8]/15' });
    if (lead.lastContact) events.push({ id: 'last-contact', type: 'called', label: 'آخر اتصال', date: lead.lastContact, icon: Phone, color: 'text-success', bg: 'bg-success-soft dark:bg-[#34d399]/15' });
    if (lead.status === 'contacted') events.push({ id: 'contacted', type: 'status_changed', label: 'تم الاتصال بالعميل', date: lead.createdAt, icon: Phone, color: 'text-warning', bg: 'bg-warning-soft dark:bg-[#fbbf24]/15' });
    if (lead.status === 'interested') events.push({ id: 'interested', type: 'status_changed', label: 'أبدى اهتمامًا', date: lead.createdAt, icon: Tag, color: 'text-success', bg: 'bg-success-soft dark:bg-[#34d399]/15' });
    if (lead.status === 'trial') events.push({ id: 'trial', type: 'status_changed', label: 'تم تحديد حصة تجريبية', date: lead.createdAt, icon: Calendar, color: 'text-primary', bg: 'bg-primary-soft dark:bg-[#a5b4fc]/15' });
    if (lead.status === 'converted') events.push({ id: 'converted', type: 'converted', label: 'تم التحويل إلى مشترك', date: lead.createdAt, icon: CheckCircle2, color: 'text-success', bg: 'bg-success-soft dark:bg-[#34d399]/15' });
    if (lead.status === 'lost') events.push({ id: 'lost', type: 'status_changed', label: 'تم رفض العميل', date: lead.createdAt, icon: AlertTriangle, color: 'text-error', bg: 'bg-error-soft dark:bg-[#fb7185]/15' });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const inputClass = "w-full bg-surface dark:bg-white/[0.04] border border-border dark:border-white/[0.08] rounded-xl px-3.5 py-3 text-[13px] font-bold text-main dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder:text-muted/40 dark:placeholder:text-white/20";
const labelClass = "text-[11px] font-bold text-muted dark:text-white/40 mb-1.5 block";

const statusRingColor: Record<LeadStatus, string> = {
    new: 'ring-info/50', contacted: 'ring-warning/50', interested: 'ring-success/50',
    trial: 'ring-primary/50', converted: 'ring-info/50', lost: 'ring-error/50',
};

export const LeadDrawer = ({ lead, isOpen, onClose, updateMutation }: LeadDrawerProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ phone: '', subject: '', curriculum: '', notes: '' });
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

    useEffect(() => {
        if (lead) { setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' }); }
        setIsEditing(false);
    }, [lead]);

    if (!lead) return null;

    const age = getLeadAge(lead.createdAt);
    const timeline = getTimelineEvents(lead);
    const priority = getPriority(lead.priority as LeadPriority);
    const cfg = statusColors[lead.status as LeadStatus];

    const handleSave = () => {
        updateMutation.mutate({ id: lead.id, updates: { phone: editData.phone, subject: editData.subject, curriculum: editData.curriculum, notes: editData.notes } });
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[600] bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={cn(
                            "fixed z-[600] flex flex-col overflow-hidden",
                            // Mobile: bottom sheet
                            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl",
                            // Desktop: right side panel
                            "lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-[420px] lg:max-h-full lg:rounded-t-none lg:rounded-l-2xl"
                        )}
                        dir="rtl"
                    >
                        {/* Background with proper light/dark support */}
                        <div className="absolute inset-0 bg-card dark:bg-[#0d1225] lg:bg-[#fafbfd] dark:lg:bg-[#0d1225]" />

                        {/* Subtle gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent dark:from-[#6366f1]/[0.03] pointer-events-none" />

                        {/* Mobile drag handle */}
                        <div className="lg:hidden flex justify-center pt-3 pb-1 shrink-0 relative z-10">
                            <div className="w-10 h-1 bg-border/60 dark:bg-white/10 rounded-full" />
                        </div>

                        {/* Desktop close button (top left) */}
                        <button ref={closeRef} onClick={onClose}
                            className="hidden lg:flex absolute top-4 left-4 z-20 w-8 h-8 items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all"
                            aria-label="إغلاق">
                            <X size={16} className="text-muted dark:text-white/50" />
                        </button>

                        {/* Content wrapper */}
                        <div className="relative z-10 flex flex-col h-full overflow-hidden">

                            {/* ===== HEADER ===== */}
                            <div className="shrink-0 px-6 pt-6 pb-5 relative overflow-hidden">
                                {/* Header gradient bg */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent dark:from-[#1a1f4e]/60 dark:via-[#1e2456]/40 dark:to-transparent" />
                                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 dark:bg-[#6366f1]/8 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    {/* Avatar + Name + Status */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={cn('rounded-full ring-[2.5px] ring-offset-[3px] ring-offset-card dark:ring-offset-[#0d1225] shrink-0', statusRingColor[lead.status as LeadStatus])}>
                                            <GradientAvatar name={lead.studentName || 'ع'} size="lg" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-[17px] font-bold text-main dark:text-white leading-tight">{lead.studentName || 'عميل بدون اسم'}</h2>
                                                <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full', cfg.bg, cfg.color, cfg.darkBg, cfg.darkText)}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[12px] text-muted dark:text-white/50 font-mono">{lead.phone}</span>
                                                <span className="text-border dark:text-white/15">•</span>
                                                <span className="flex items-center gap-1 text-[11px] text-muted/60 dark:text-white/35">
                                                    <Clock size={9} />{age.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info pills */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/80 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.06] rounded-full text-[11px] text-muted dark:text-white/40">
                                            <Calendar size={11} />
                                            <span>{new Date(lead.createdAt).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-full bg-surface/80 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.06]', priority.color, priority.darkText)}>
                                            {priority.label}
                                        </span>
                                        {lead.source && (
                                            <span className="inline-flex items-center px-3 py-1.5 text-[11px] text-muted dark:text-white/40 bg-surface/80 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.06] rounded-full">
                                                {lead.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ===== SCROLLABLE CONTENT ===== */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">

                                {/* Data Section */}
                                <div className="px-6 py-5 border-b border-border/60 dark:border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[12px] font-bold text-muted/60 dark:text-white/30 uppercase tracking-wider">البيانات</h3>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-1 text-[12px] font-bold text-primary dark:text-[#a5b4fc] hover:text-primary-hover dark:hover:text-[#c7d2fe] transition-colors">
                                                <Edit3 size={12} /> تعديل
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                            <div><label className={labelClass}>الهاتف</label><input type="tel" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className={inputClass} /></div>
                                            <div><label className={labelClass}>المادة</label><input type="text" value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} className={inputClass} /></div>
                                            <div><label className={labelClass}>المنهج</label><input type="text" value={editData.curriculum} onChange={(e) => setEditData({ ...editData, curriculum: e.target.value })} className={inputClass} /></div>
                                            <div><label className={labelClass}>ملاحظات</label><textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3} className={cn(inputClass, "resize-none")} /></div>
                                            <div className="flex gap-2 pt-1">
                                                <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-l from-primary to-primary-deep dark:from-[#6366f1] dark:to-[#8b5cf6] text-on-primary text-[12px] font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-primary/20 dark:shadow-[#6366f1]/20"><Save size={13} /> حفظ</button>
                                                <button onClick={() => { setIsEditing(false); setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' }); }} className="px-5 py-3 bg-surface dark:bg-white/5 text-muted dark:text-white/40 text-[12px] font-bold rounded-xl hover:bg-hover dark:hover:bg-white/10 transition-all">إلغاء</button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {/* Phone */}
                                            <div className="flex items-center gap-3.5 bg-surface/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04] rounded-xl p-3.5 hover:bg-surface dark:hover:bg-white/[0.05] transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-success/10 dark:bg-[#34d399]/10 flex items-center justify-center shrink-0">
                                                    <Phone size={16} className="text-success dark:text-[#34d399]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted/50 dark:text-white/30 mb-0.5">الهاتف</p>
                                                    <p onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')}
                                                        className="text-[14px] font-bold text-main dark:text-white font-mono tracking-tight hover:text-success dark:hover:text-[#34d399] cursor-pointer transition-colors">
                                                        {lead.phone}
                                                    </p>
                                                </div>
                                                <MessageSquare size={14} className="text-success/40 dark:text-[#34d399]/30" />
                                            </div>

                                            {/* Subject */}
                                            <div className="flex items-center gap-3.5 bg-surface/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04] rounded-xl p-3.5 hover:bg-surface dark:hover:bg-white/[0.05] transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-info/10 dark:bg-[#818cf8]/10 flex items-center justify-center shrink-0">
                                                    <Tag size={16} className="text-info dark:text-[#818cf8]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted/50 dark:text-white/30 mb-0.5">المادة</p>
                                                    <p className="text-[14px] font-bold text-main dark:text-white">{lead.subject}</p>
                                                </div>
                                            </div>

                                            {/* Curriculum */}
                                            {lead.curriculum && (
                                                <div className="flex items-center gap-3.5 bg-surface/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04] rounded-xl p-3.5 hover:bg-surface dark:hover:bg-white/[0.05] transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-warning/10 dark:bg-[#fbbf24]/10 flex items-center justify-center shrink-0">
                                                        <Tag size={16} className="text-warning dark:text-[#fbbf24]" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-muted/50 dark:text-white/30 mb-0.5">المنهج</p>
                                                        <p className="text-[14px] font-bold text-main dark:text-white">{lead.curriculum}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Parent */}
                                            {lead.parentName && (
                                                <div className="flex items-center gap-3.5 bg-surface/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04] rounded-xl p-3.5 hover:bg-surface dark:hover:bg-white/[0.05] transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-[#a5b4fc]/10 flex items-center justify-center shrink-0">
                                                        <UserPlus size={16} className="text-primary dark:text-[#a5b4fc]" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-muted/50 dark:text-white/30 mb-0.5">ولي الأمر</p>
                                                        <p className="text-[14px] font-bold text-main dark:text-white">{lead.parentName}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && !isEditing && (
                                    <div className="px-6 py-5 border-b border-border/60 dark:border-white/[0.04]">
                                        <h3 className="text-[12px] font-bold text-muted/60 dark:text-white/30 uppercase tracking-wider mb-2.5">ملاحظات</h3>
                                        <p className="text-[13px] text-main/70 dark:text-white/60 leading-relaxed bg-surface/60 dark:bg-white/[0.03] border border-border/40 dark:border-white/[0.04] p-4 rounded-xl">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className="px-6 py-5">
                                    <h3 className="text-[12px] font-bold text-muted/60 dark:text-white/30 uppercase tracking-wider mb-4">سجل التواصل</h3>
                                    <div className="space-y-0">
                                        {timeline.map((event, idx) => {
                                            const Icon = event.icon;
                                            return (
                                                <div key={event.id} className="flex gap-3.5 relative">
                                                    {idx < timeline.length - 1 && <div className="absolute top-9 start-[16px] w-px h-full bg-border/40 dark:bg-white/[0.04]" />}
                                                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10', event.bg, event.color)}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div className="pb-4 min-w-0">
                                                        <p className="text-[13px] font-bold text-main dark:text-white/80 leading-tight">{event.label}</p>
                                                        <p className="text-[11px] text-muted/50 dark:text-white/25 mt-0.5">{formatRelativeTime(event.date)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ===== FOOTER ACTIONS ===== */}
                            <div className="shrink-0 border-t border-border/60 dark:border-white/[0.04] p-5 space-y-2.5 bg-card/80 dark:bg-[#0d1225]/90 backdrop-blur-sm">
                                <button onClick={() => { window.open(`tel:${lead.phone}`); }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-primary to-primary-deep dark:from-[#6366f1] dark:to-[#8b5cf6] text-on-primary text-[14px] font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/15 dark:shadow-[#6366f1]/20">
                                    <Phone size={16} /> تواصل الآن
                                </button>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => { updateMutation.mutate({ id: lead.id, updates: { status: 'lost' } }); onClose(); }}
                                        className="flex items-center justify-center gap-2 py-3 bg-error/8 dark:bg-error/10 text-error text-[13px] font-bold rounded-xl border border-error/12 dark:border-error/15 transition-all active:scale-[0.98]">
                                        <Trash2 size={14} /> حذف العميل
                                    </button>
                                    <button onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 py-3 bg-surface dark:bg-white/[0.04] text-muted dark:text-white/50 text-[13px] font-bold rounded-xl border border-border/60 dark:border-white/[0.06] hover:bg-hover dark:hover:bg-white/[0.07] transition-all active:scale-[0.98]">
                                        <Edit size={14} /> تعديل البيانات
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
