import { useState, useEffect, useRef } from 'react';
import { X, Phone, CheckCircle2, Edit3, UserPlus, Tag, Calendar, AlertTriangle, Save, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';
import { GradientAvatar, getLeadAge, statusColors, getPriority } from './LeadsUI';

interface LeadDrawerProps {
    lead: Lead | null;
    onClose: () => void;
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
    events.push({ id: '1', type: 'created', label: 'تم تسجيل العميل', date: lead.createdAt, icon: UserPlus, color: 'text-info', bg: 'bg-info/10' });
    if (lead.status === 'contacted') events.push({ id: '2', type: 'called', label: 'تم الاتصال بالعميل', date: lead.updatedAt || lead.createdAt, icon: Phone, color: 'text-warning', bg: 'bg-warning/10' });
    if (lead.status === 'interested') events.push({ id: '3', type: 'note_added', label: 'أبدى اهتمام', date: lead.updatedAt || lead.createdAt, icon: Tag, color: 'text-success', bg: 'bg-success/10' });
    if (lead.status === 'trial') events.push({ id: '4', type: 'note_added', label: 'حصة تجريبية', date: lead.updatedAt || lead.createdAt, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' });
    if (lead.status === 'converted') events.push({ id: '5', type: 'converted', label: 'تم التحويل إلى مشترك', date: lead.updatedAt || lead.createdAt, icon: CheckCircle2, color: 'text-info', bg: 'bg-info/10' });
    return events;
};

const avatarGradients = ['from-primary to-primary-hover', 'from-success to-success-hover', 'from-info to-info-hover', 'from-warning to-warning-hover', 'from-error to-error-hover', 'from-accent to-accent-hover'];
const getGradient = (name: string) => { let h = 0; for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarGradients[Math.abs(h) % avatarGradients.length]; };

const statusRingColor: Record<LeadStatus, string> = {
    new: 'ring-info/50', contacted: 'ring-warning/50', interested: 'ring-success/50',
    trial: 'ring-primary/50', converted: 'ring-info/50', lost: 'ring-error/30',
};

export const LeadDrawer = ({ lead, onClose, updateMutation }: LeadDrawerProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ phone: '', subject: '', curriculum: '', notes: '' });
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (lead) { setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' }); }
        setIsEditing(false);
    }, [lead]);

    useEffect(() => { closeRef.current?.focus(); }, []);

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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-2.5 sm:p-4"
            dir="rtl"
        >
            <div className="bg-card dark:bg-[#131836]/80 border border-border dark:border-white/[0.04] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border/50 dark:border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={cn('rounded-full ring-2 ring-offset-2 ring-offset-card dark:ring-offset-[#131836]', statusRingColor[lead.status as LeadStatus])}>
                                <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[13px] font-bold text-main dark:text-white">{lead.studentName || 'عميل بدون اسم'}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold", cfg.bg, cfg.color, cfg.darkBg, cfg.darkText)}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                    {cfg.label}
                                </span>
                                <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold", age.color, "bg-surface dark:bg-white/[0.04]")}>{age.text}</span>
                            </div>
                        </div>
                    </div>
                    <button ref={closeRef} onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all"
                        aria-label="إغلاق">
                        <X size={14} className="text-muted dark:text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                                <div className="text-[10px] text-muted dark:text-white/30 mb-1">الهاتف</div>
                                {isEditing ? (
                                    <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main dark:text-white bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.08] rounded-lg outline-none focus:border-primary" dir="ltr" style={{ textAlign: 'right' }} />
                                ) : (
                                    <p className="text-[13px] font-bold text-main dark:text-white font-mono" dir="ltr">{lead.phone}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                                <div className="text-[10px] text-muted dark:text-white/30 mb-1">المادة</div>
                                {isEditing ? (
                                    <input value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main dark:text-white bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.08] rounded-lg outline-none focus:border-primary" />
                                ) : (
                                    <p className="text-[13px] font-bold text-main dark:text-white">{lead.subject || '—'}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                                <div className="text-[10px] text-muted dark:text-white/30 mb-1">المنهج</div>
                                {isEditing ? (
                                    <input value={editData.curriculum} onChange={(e) => setEditData({ ...editData, curriculum: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main dark:text-white bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.08] rounded-lg outline-none focus:border-primary" />
                                ) : (
                                    <p className="text-[13px] font-bold text-main dark:text-white">{lead.curriculum || '—'}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                                <div className="text-[10px] text-muted dark:text-white/30 mb-1">الأولوية</div>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold", priority.bg, priority.color, priority.darkBg, priority.darkText)}>{priority.label}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                            <div className="text-[10px] text-muted dark:text-white/30 mb-1">ملاحظات</div>
                            {isEditing ? (
                                <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} className="w-full px-2 py-1 text-[13px] font-bold text-main dark:text-white bg-card dark:bg-white/[0.06] border border-border dark:border-white/[0.08] rounded-lg outline-none focus:border-primary resize-none" />
                            ) : (
                                <p className="text-[13px] text-main dark:text-white leading-relaxed">{lead.notes || 'لا توجد ملاحظات'}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[11px] font-bold text-on-primary bg-gradient-to-l from-primary to-primary-deep dark:from-[#6366f1] dark:to-[#8b5cf6] rounded-xl transition-all active:scale-[0.98]">
                                    <Save size={12} /> حفظ
                                </button>
                                <button onClick={() => setIsEditing(false)} className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[11px] font-bold text-muted dark:text-white/40 bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all">إلغاء</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="h-9 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-success bg-success/10 dark:bg-success/15 hover:bg-success/20 rounded-xl transition-all">
                                    <Phone size={12} /> اتصال
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')} className="h-9 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-success bg-success/10 dark:bg-success/15 hover:bg-success/20 rounded-xl transition-all">
                                    <MessageSquare size={12} /> واتساب
                                </button>
                                <button onClick={() => setIsEditing(true)} className="h-9 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-muted dark:text-white/40 bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all">
                                    <Edit size={12} /> تعديل
                                </button>
                                {lead.status !== 'converted' && (
                                    <button onClick={() => updateMutation.mutate({ id: lead.id, updates: { status: 'converted' as LeadStatus } })} className="h-9 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-info bg-info/10 dark:bg-info/15 hover:bg-info/20 rounded-xl transition-all">
                                        <CheckCircle2 size={12} /> تحويل
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="px-4 pb-4">
                    <h4 className="text-[11px] font-bold text-muted dark:text-white/40 mb-2">النشاطات</h4>
                    <div className="space-y-2">
                        {timeline.map((event) => {
                            const Icon = event.icon;
                            return (
                                <div key={event.id} className="flex items-start gap-2.5">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", event.bg)}>
                                        <Icon size={12} className={event.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-main dark:text-white">{event.label}</p>
                                        <p className="text-[10px] text-muted dark:text-white/30 mt-0.5">{formatRelativeTime(event.date)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
