import { useState, useEffect, useRef } from 'react';
import { X, Phone, MessageSquare, CheckCircle2, Edit3, UserPlus, Tag, Calendar, AlertTriangle, Save, Clock, ChevronLeft, Sparkles } from 'lucide-react';
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
    bg: string;
}

const getTimelineEvents = (lead: Lead): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'created', type: 'created', label: 'تم إنشاء العميل', date: lead.createdAt, icon: UserPlus, color: 'text-info', bg: 'bg-info-soft' });
    if (lead.lastContact) events.push({ id: 'last-contact', type: 'called', label: 'آخر اتصال', date: lead.lastContact, icon: Phone, color: 'text-success', bg: 'bg-success-soft' });
    if (lead.status === 'contacted') events.push({ id: 'contacted', type: 'status_changed', label: 'تم الاتصال بالعميل', date: lead.createdAt, icon: Phone, color: 'text-warning', bg: 'bg-warning-soft' });
    if (lead.status === 'interested') events.push({ id: 'interested', type: 'status_changed', label: 'أبدى اهتمامًا', date: lead.createdAt, icon: Tag, color: 'text-success', bg: 'bg-success-soft' });
    if (lead.status === 'trial') events.push({ id: 'trial', type: 'status_changed', label: 'تم تحديد حصة تجريبية', date: lead.createdAt, icon: Calendar, color: 'text-primary', bg: 'bg-primary-soft' });
    if (lead.status === 'converted') events.push({ id: 'converted', type: 'converted', label: 'تم التحويل إلى مشترك', date: lead.createdAt, icon: CheckCircle2, color: 'text-success', bg: 'bg-success-soft' });
    if (lead.status === 'lost') events.push({ id: 'lost', type: 'status_changed', label: 'تم رفض العميل', date: lead.createdAt, icon: AlertTriangle, color: 'text-error', bg: 'bg-error-soft' });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const inputClass = "w-full bg-surface/80 border border-border rounded-xl px-3.5 py-3 text-[13px] font-bold text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder:text-muted/40";
const labelClass = "text-[11px] font-bold text-muted mb-1.5 block";

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
    const priority = getPriority(lead.priority as LeadPriority);

    const handleSave = () => {
        updateMutation.mutate({ id: lead.id, updates: { phone: editData.phone, subject: editData.subject, curriculum: editData.curriculum, notes: editData.notes } });
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[600] sm:w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-card sm:border sm:border-border sm:shadow-elevation-3 sm:rounded-2xl flex flex-col overflow-hidden"
                        dir="rtl"
                    >
                        {/* Drag handle (mobile only) */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 bg-border/50 rounded-full" />
                        </div>

                        {/* Header with gradient */}
                        <div className="shrink-0 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-30" />
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#a855f7]/10 rounded-full blur-2xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative">
                                            <div className="ring-2 ring-white/20 rounded-[18px] p-0.5">
                                                <GradientAvatar name={lead.studentName || 'ع'} size="lg" />
                                            </div>
                                            <div className={cn('absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#6366f1] bg-success')} />
                                        </div>
                                        <div>
                                            <h2 className="text-[15px] font-bold text-white leading-tight">{lead.studentName || 'عميل بدون اسم'}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] font-medium text-white/50">
                                                    <Clock size={9} />
                                                    {age.text}
                                                </span>
                                                {lead.source && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-white/25" />
                                                        <span className="text-[10px] font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{lead.source}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button ref={closeRef} onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm" aria-label="إغلاق">
                                        <X size={15} className="text-white" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        className="px-3 py-1.5 text-[11px] font-bold border border-white/15 outline-none cursor-pointer rounded-full bg-white/10 text-white backdrop-blur-sm transition-all"
                                        value={lead.status}
                                        aria-label="حالة العميل"
                                        onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                    >
                                        {(['new', 'contacted', 'interested', 'trial', 'converted', 'lost'] as LeadStatus[]).map((key) => (
                                            <option key={key} value={key} className="text-main bg-card">{statusColors[key].label}</option>
                                        ))}
                                    </select>
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-full bg-white/10 text-white border border-white/15">
                                        <Sparkles size={10} />
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
                                    <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider">البيانات</h3>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors">
                                            <Edit3 size={11} /> تعديل
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
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
                                            <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-l from-[#6366f1] to-[#8b5cf6] text-white text-[11px] font-bold rounded-xl hover:from-[#818cf8] hover:to-[#a78bfa] transition-all active:scale-95 shadow-md shadow-[#6366f1]/20">
                                                <Save size={13} /> حفظ
                                            </button>
                                            <button onClick={() => { setIsEditing(false); setEditData({ phone: lead.phone, subject: lead.subject, curriculum: lead.curriculum || '', notes: lead.notes || '' }); }} className="px-5 py-3 bg-surface text-muted text-[11px] font-bold rounded-xl hover:bg-hover transition-all">
                                                إلغاء
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 bg-surface/80 border border-border rounded-xl p-3.5 hover:bg-surface transition-all duration-200">
                                            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                                                <Phone size={15} className="text-success" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-muted/60 mb-0.5">الهاتف</p>
                                                <p onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="text-[13px] font-bold text-main font-mono tracking-tight hover:text-success cursor-pointer transition-colors">{lead.phone}</p>
                                            </div>
                                            <ChevronLeft size={13} className="text-muted/20" />
                                        </div>
                                        <div className="flex items-center gap-3 bg-surface/80 border border-border rounded-xl p-3.5 hover:bg-surface transition-all duration-200">
                                            <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                                                <Tag size={15} className="text-info" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-muted/60 mb-0.5">المادة</p>
                                                <p className="text-[13px] font-bold text-main">{lead.subject}</p>
                                            </div>
                                        </div>
                                        {lead.curriculum && (
                                            <div className="flex items-center gap-3 bg-surface/80 border border-border rounded-xl p-3.5 hover:bg-surface transition-all duration-200">
                                                <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                                                    <Tag size={15} className="text-warning" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted/60 mb-0.5">المنهج</p>
                                                    <p className="text-[13px] font-bold text-main">{lead.curriculum}</p>
                                                </div>
                                            </div>
                                        )}
                                        {lead.parentName && (
                                            <div className="flex items-center gap-3 bg-surface/80 border border-border rounded-xl p-3.5 hover:bg-surface transition-all duration-200">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <UserPlus size={15} className="text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-muted/60 mb-0.5">ولي الأمر</p>
                                                    <p className="text-[13px] font-bold text-main">{lead.parentName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {lead.notes && !isEditing && (
                                <div className="px-5 py-4 border-b border-border">
                                    <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">ملاحظات</h3>
                                    <p className="text-[13px] text-main leading-relaxed bg-warning/5 border-s-[3px] border-s-warning/40 p-3.5 rounded-xl">{lead.notes}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="px-5 py-4">
                                <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">السجل</h3>
                                <div className="space-y-0">
                                    {timeline.map((event, idx) => {
                                        const Icon = event.icon;
                                        return (
                                            <div key={event.id} className="flex gap-3 relative">
                                                {idx < timeline.length - 1 && <div className="absolute top-9 start-[15px] w-px h-full bg-border/50" />}
                                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10 ring-1 ring-black/5', event.bg, event.color)}>
                                                    <Icon size={13} />
                                                </div>
                                                <div className="pb-4 min-w-0">
                                                    <p className="text-[12px] font-bold text-main leading-tight">{event.label}</p>
                                                    <p className="text-[10px] text-muted/60 mt-0.5">{formatRelativeTime(event.date)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="shrink-0 border-t border-border px-4 py-3 bg-card/80 backdrop-blur-sm">
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => window.open(`tel:${lead.phone}`)} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-success/8 text-success hover:bg-success/15 border border-success/10 transition-all active:scale-95 duration-200">
                                    <Phone size={15} /><span className="text-[9px] font-bold">اتصال</span>
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-success/8 text-success hover:bg-success/15 border border-success/10 transition-all active:scale-95 duration-200">
                                    <MessageSquare size={15} /><span className="text-[9px] font-bold">واتساب</span>
                                </button>
                                <button onClick={() => { updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); onClose(); }} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-info/8 text-info hover:bg-info/15 border border-info/10 transition-all active:scale-95 duration-200">
                                    <CheckCircle2 size={15} /><span className="text-[9px] font-bold">تحويل</span>
                                </button>
                                <button onClick={() => setIsEditing(true)} className={cn("flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all active:scale-95 duration-200", isEditing ? "bg-primary/8 text-primary border-primary/15" : "bg-surface/80 hover:bg-surface border-border")}>
                                    <Edit3 size={15} className={isEditing ? "text-primary" : "text-muted"} /><span className={cn("text-[9px] font-bold", isEditing ? "text-primary" : "text-muted")}>تعديل</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
