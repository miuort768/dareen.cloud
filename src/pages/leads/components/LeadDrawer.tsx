import { useState, useEffect, useRef } from 'react';
import { X, Phone, MessageSquare, CheckCircle2, Edit3, UserPlus, Tag, Calendar, AlertTriangle, Save, Clock, ChevronLeft } from 'lucide-react';
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

const inputClass = "w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm font-bold text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
const labelClass = "text-xs font-bold text-muted mb-1.5 block";

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
        if (lead) {
            setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' });
        }
        setIsEditing(false);
    }, [lead]);

    if (!lead) return null;

    const age = getLeadAge(lead.createdAt);
    const timeline = getTimelineEvents(lead);
    const statusCfg = statusColors[lead.status as LeadStatus] || statusColors.new;
    const priority = getPriority(lead.priority as LeadPriority);

    const handleSave = () => {
        updateMutation.mutate({ id: lead.id, updates: { phone: editData.phone, subject: editData.subject, curriculum: editData.curriculum, notes: editData.notes } });
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[600] flex items-center justify-center p-4 pointer-events-none"
                        dir="rtl"
                    >
                        <div className="w-full max-w-lg max-h-[85vh] bg-card border border-border shadow-elevation-3 rounded-2xl flex flex-col pointer-events-auto overflow-hidden">

                            {/* Header with gradient */}
                            <div className="shrink-0 bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-5 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="ring-2 ring-white/20 rounded-2xl">
                                                <GradientAvatar name={lead.studentName || 'ع'} size="lg" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-white">{lead.studentName || 'عميل بدون اسم'}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] font-medium text-white/60">
                                                        <Clock size={10} />
                                                        {age.text}
                                                    </span>
                                                    {lead.source && (
                                                        <span className="text-[10px] font-medium text-white/80 bg-white/15 px-2 py-0.5 rounded-md">{lead.source}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button ref={closeRef} onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all" aria-label="إغلاق">
                                            <X size={16} className="text-white" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            className={cn('px-2.5 py-1.5 text-xs font-bold border border-white/20 outline-none cursor-pointer rounded-lg bg-white/10 text-white backdrop-blur-sm')}
                                            value={lead.status}
                                            aria-label="حالة العميل"
                                            onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                        >
                                            {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                                <option key={key} value={key} className="text-main bg-card">{statusColors[key].label}</option>
                                            ))}
                                        </select>
                                        <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white/10 text-white border border-white/20">
                                            {priority.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Data Section */}
                                <div className="px-5 py-4 border-b border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-muted">البيانات</h3>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors">
                                                <Edit3 size={12} /> تعديل
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>الهاتف</label>
                                                <input type="tel" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>المادة</label>
                                                <input type="text" value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>المنهج</label>
                                                <input type="text" value={editData.curriculum} onChange={(e) => setEditData({ ...editData, curriculum: e.target.value })} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>ملاحظات</label>
                                                <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3} className={cn(inputClass, "resize-none")} />
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95">
                                                    <Save size={14} /> حفظ
                                                </button>
                                                <button onClick={() => { setIsEditing(false); setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' }); }} className="px-4 py-2.5 bg-surface text-muted text-xs font-bold rounded-xl hover:bg-hover transition-all">
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                                                <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                                                    <Phone size={15} className="text-success" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted mb-0.5">الهاتف</p>
                                                    <p onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="text-sm font-bold text-main font-mono hover:text-success cursor-pointer transition-colors">{lead.phone}</p>
                                                </div>
                                                <ChevronLeft size={14} className="text-muted/30" />
                                            </div>
                                            <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                                                <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center shrink-0">
                                                    <Tag size={15} className="text-info" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted mb-0.5">المادة</p>
                                                    <p className="text-sm font-bold text-main">{lead.subject}</p>
                                                </div>
                                            </div>
                                            {lead.curriculum && (
                                                <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-xl bg-warning-soft flex items-center justify-center shrink-0">
                                                        <Tag size={15} className="text-warning" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-muted mb-0.5">المنهج</p>
                                                        <p className="text-sm font-bold text-main">{lead.curriculum}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {lead.parentName && (
                                                <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                                        <UserPlus size={15} className="text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-muted mb-0.5">ولي الأمر</p>
                                                        <p className="text-sm font-bold text-main">{lead.parentName}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                {lead.notes && !isEditing && (
                                    <div className="px-5 py-4 border-b border-border">
                                        <h3 className="text-xs font-bold text-muted mb-2">ملاحظات</h3>
                                        <p className="text-sm text-main leading-relaxed bg-warning/5 border-s-2 border-s-warning p-3 rounded-xl">{lead.notes}</p>
                                    </div>
                                )}

                                {/* Timeline */}
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
                            <div className="shrink-0 border-t border-border px-4 py-3">
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => window.open(`tel:${lead.phone}`)} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-success/10 text-success hover:bg-success/20 border border-success/15 transition-all active:scale-95">
                                        <Phone size={16} /><span className="text-[10px] font-bold">اتصال</span>
                                    </button>
                                    <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-success/10 text-success hover:bg-success/20 border border-success/15 transition-all active:scale-95">
                                        <MessageSquare size={16} /><span className="text-[10px] font-bold">واتساب</span>
                                    </button>
                                    <button onClick={() => { updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); onClose(); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-info/10 text-info hover:bg-info/20 border border-info/15 transition-all active:scale-95">
                                        <CheckCircle2 size={16} /><span className="text-[10px] font-bold">تحويل</span>
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className={cn("flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all active:scale-95", isEditing ? "bg-primary/10 text-primary border-primary/15" : "bg-surface hover:bg-hover border-border")}>
                                        <Edit3 size={16} className={isEditing ? "text-primary" : "text-muted"} /><span className={cn("text-[10px] font-bold", isEditing ? "text-primary" : "text-muted")}>تعديل</span>
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
