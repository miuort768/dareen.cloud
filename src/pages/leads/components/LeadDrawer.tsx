import { useState, useEffect, useRef } from 'react';
import { X, Phone, CheckCircle2, UserPlus, Tag, Calendar, Save, Edit, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/components/ui/Button';
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
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevation-1 dark:shadow-none">
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={cn('rounded-full ring-2 ring-offset-2 ring-offset-card', statusRingColor[lead.status as LeadStatus])}>
                                <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[13px] font-bold text-main">{lead.studentName || 'عميل بدون اسم'}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold", cfg.bg, cfg.color, cfg.darkBg, cfg.darkText)}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                    {cfg.label}
                                </span>
                                <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold", age.color, "bg-surface")}>{age.text}</span>
                            </div>
                        </div>
                    </div>
                    <button ref={closeRef} onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-surface hover:bg-hover rounded-xl transition-all"
                        aria-label="إغلاق">
                        <X size={14} className="text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="text-[10px] text-muted mb-1">الهاتف</div>
                                {isEditing ? (
                                    <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main bg-card border border-border rounded-lg outline-none focus:border-primary" dir="ltr" style={{ textAlign: 'right' }} />
                                ) : (
                                    <p className="text-[13px] font-bold text-main font-mono" dir="ltr">{lead.phone}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="text-[10px] text-muted mb-1">المادة</div>
                                {isEditing ? (
                                    <input value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main bg-card border border-border rounded-lg outline-none focus:border-primary" />
                                ) : (
                                    <p className="text-[13px] font-bold text-main">{lead.subject || '—'}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="text-[10px] text-muted mb-1">المنهج</div>
                                {isEditing ? (
                                    <input value={editData.curriculum} onChange={(e) => setEditData({ ...editData, curriculum: e.target.value })} className="w-full px-2 py-1 text-[13px] font-bold text-main bg-card border border-border rounded-lg outline-none focus:border-primary" />
                                ) : (
                                    <p className="text-[13px] font-bold text-main">{lead.curriculum || '—'}</p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="text-[10px] text-muted mb-1">الأولوية</div>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold", priority.bg, priority.color, priority.darkBg, priority.darkText)}>{priority.label}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface">
                            <div className="text-[10px] text-muted mb-1">ملاحظات</div>
                            {isEditing ? (
                                <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} className="w-full px-2 py-1 text-[13px] font-bold text-main bg-card border border-border rounded-lg outline-none focus:border-primary resize-none" />
                            ) : (
                                <p className="text-[13px] text-main leading-relaxed">{lead.notes || 'لا توجد ملاحظات'}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSave} variant="primary" size="sm" className="flex-1">
                                    <Save size={12} /> حفظ
                                </Button>
                                <Button onClick={() => setIsEditing(false)} variant="secondary" size="sm" className="flex-1">
                                    إلغاء
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => window.open(`tel:${lead.phone}`)} variant="success" size="sm">
                                    <Phone size={12} /> اتصال
                                </Button>
                                <Button onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')} variant="success" size="sm">
                                    <MessageSquare size={12} /> واتساب
                                </Button>
                                <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                                    <Edit size={12} /> تعديل
                                </Button>
                                {lead.status !== 'converted' && (
                                    <Button onClick={() => updateMutation.mutate({ id: lead.id, updates: { status: 'converted' as LeadStatus } })} variant="outline" size="sm">
                                        <CheckCircle2 size={12} /> تحويل
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="px-4 pb-4">
                    <h4 className="text-[11px] font-bold text-muted mb-2">النشاطات</h4>
                    <div className="space-y-2">
                        {timeline.map((event) => {
                            const Icon = event.icon;
                            return (
                                <div key={event.id} className="flex items-start gap-2.5">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", event.bg)}>
                                        <Icon size={12} className={event.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-main">{event.label}</p>
                                        <p className="text-[10px] text-muted mt-0.5">{formatRelativeTime(event.date)}</p>
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
