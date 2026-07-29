import { useState, useEffect, useRef } from 'react';
import { X, Phone, MessageSquare, CheckCircle2, Edit3, Clock, UserPlus, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types';

interface LeadDrawerProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    statusConfig: Record<string, { label: string; color: string; bg: string }>;
    updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void };
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: 'عالية', color: 'text-error', bg: 'bg-error-soft' },
    medium: { label: 'متوسطة', color: 'text-warning', bg: 'bg-warning-soft' },
    low: { label: 'منخفضة', color: 'text-muted', bg: 'bg-surface' },
};
const getStatus = (s: string, cfg: Record<string, { label: string; color: string; bg: string }>) => cfg[s] || cfg.new || { label: s, color: 'text-muted', bg: 'bg-surface' };
const getPriority = (p: string) => priorityConfig[p] || priorityConfig.low;

const getLeadAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return { text: 'الآن', color: 'text-success' };
    if (diffMins < 60) return { text: `منذ ${diffMins} دقيقة`, color: 'text-success' };
    if (diffHours < 24) return { text: `منذ ${diffHours} ساعة`, color: 'text-info' };
    if (diffDays < 7) return { text: `منذ ${diffDays} أيام`, color: 'text-warning' };
    return { text: `منذ ${diffDays} يوم`, color: 'text-error' };
};

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

    events.push({
        id: 'created',
        type: 'created',
        label: 'تم إنشاء العميل',
        date: lead.createdAt,
        icon: UserPlus,
        color: 'text-info bg-info-soft',
    });

    if (lead.lastContact) {
        events.push({
            id: 'last-contact',
            type: 'called',
            label: 'آخر اتصال',
            date: lead.lastContact,
            icon: Phone,
            color: 'text-success bg-success-soft',
        });
    }

    if (lead.status === 'contacted') {
        events.push({
            id: 'contacted',
            type: 'status_changed',
            label: 'تم الاتصال بالعميل',
            date: lead.createdAt,
            icon: Phone,
            color: 'text-warning bg-warning-soft',
        });
    }

    if (lead.status === 'interested') {
        events.push({
            id: 'interested',
            type: 'status_changed',
            label: 'أبدى اهتمامًا',
            date: lead.createdAt,
            icon: Tag,
            color: 'text-success bg-success-soft',
        });
    }

    if (lead.status === 'trial') {
        events.push({
            id: 'trial',
            type: 'status_changed',
            label: 'تم تحديد حصة تجريبية',
            date: lead.createdAt,
            icon: Calendar,
            color: 'text-primary bg-primary-soft',
        });
    }

    if (lead.status === 'converted') {
        events.push({
            id: 'converted',
            type: 'converted',
            label: 'تم التحويل إلى مشترك',
            date: lead.createdAt,
            icon: CheckCircle2,
            color: 'text-success bg-success-soft',
        });
    }

    if (lead.status === 'lost') {
        events.push({
            id: 'lost',
            type: 'status_changed',
            label: 'تم رفض العميل',
            date: lead.createdAt,
            icon: AlertTriangle,
            color: 'text-error bg-error-soft',
        });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const LeadDrawer = ({ lead, isOpen, onClose, statusConfig, updateMutation }: LeadDrawerProps) => {
    const [isEditing] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            closeRef.current?.focus();
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, onClose]);

    if (!lead) return null;

    const age = getLeadAge(lead.createdAt);
    const timeline = getTimelineEvents(lead);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer */}
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
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-primary-soft text-primary ring-1 ring-primary/20">
                                        {lead.studentName?.charAt(0) || 'ع'}
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-main">{lead.studentName || 'عميل بدون اسم'}</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn("text-[10px] font-medium", age.color)}>{age.text}</span>
                                            {lead.source && (
                                                <span className="text-[10px] font-medium text-info bg-info-soft px-1.5 py-0.5 rounded">
                                                    {lead.source}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button ref={closeRef} onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-hover rounded-xl transition-all" aria-label="إغلاق">
                                    <X size={18} className="text-muted" />
                                </button>
                            </div>

                            {/* Status + Priority */}
                            <div className="flex items-center gap-2">
                                <select
                                    className={cn(
                                        "px-2.5 py-1 text-xs font-bold border-0 outline-none cursor-pointer rounded-lg",
                                        getStatus(lead.status, statusConfig).bg,
                                        getStatus(lead.status, statusConfig).color
                                    )}
                                    value={lead.status}
                                    aria-label="حالة العميل"
                                    onChange={(e) => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
                                >
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg",
                                    getPriority(lead.priority).bg,
                                    getPriority(lead.priority).color
                                )}>
                                    {getPriority(lead.priority).label}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Info Section */}
                            <div className="px-5 py-4 border-b border-border">
                                <h3 className="text-xs font-bold text-muted mb-3">البيانات</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center shrink-0 ring-1 ring-success/20">
                                            <Phone size={14} className="text-success" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted">الهاتف</p>
                                            <p className="text-sm font-bold text-main font-mono">{lead.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-info-soft flex items-center justify-center shrink-0 ring-1 ring-info/20">
                                            <Tag size={14} className="text-info" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted">المادة</p>
                                            <p className="text-sm font-bold text-main">{lead.subject}</p>
                                        </div>
                                    </div>
                                    {lead.curriculum && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-warning-soft flex items-center justify-center shrink-0 ring-1 ring-warning/20">
                                                <Tag size={14} className="text-warning" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted">المنهج</p>
                                                <p className="text-sm font-bold text-main">{lead.curriculum}</p>
                                            </div>
                                        </div>
                                    )}
                                    {lead.parentName && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                                                <UserPlus size={14} className="text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted">ولي الأمر</p>
                                                <p className="text-sm font-bold text-main">{lead.parentName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {lead.notes && (
                                <div className="px-5 py-4 border-b border-border">
                                    <h3 className="text-xs font-bold text-muted mb-2">ملاحظات</h3>
                                    <p className="text-sm text-main leading-relaxed bg-warning-soft border border-warning/20 p-3 rounded-xl">
                                        {lead.notes}
                                    </p>
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
                                                {/* Line */}
                                                {idx < timeline.length - 1 && (
                                                    <div className="absolute top-8 start-[15px] w-px h-full bg-border" />
                                                )}
                                                {/* Icon */}
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10 ring-1 ring-black/5", event.color)}>
                                                    <Icon size={14} />
                                                </div>
                                                {/* Content */}
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
                                <button
                                    onClick={() => window.open(`tel:${lead.phone}`)}
                                    className="flex flex-col items-center gap-1 py-2 rounded-xl bg-success-soft text-success hover:bg-success/10 transition-all"
                                >
                                    <Phone size={16} />
                                    <span className="text-[10px] font-bold">اتصال</span>
                                </button>
                                <button
                                    onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')}
                                    className="flex flex-col items-center gap-1 py-2 rounded-xl bg-success-soft text-success hover:bg-success/10 transition-all"
                                >
                                    <MessageSquare size={16} />
                                    <span className="text-[10px] font-bold">واتساب</span>
                                </button>
                                <button
                                    onClick={() => { updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } }); onClose(); }}
                                    className="flex flex-col items-center gap-1 py-2 rounded-xl bg-info-soft text-info hover:bg-info/10 transition-all"
                                >
                                    <CheckCircle2 size={16} />
                                    <span className="text-[10px] font-bold">تحويل</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex flex-col items-center gap-1 py-2 rounded-xl bg-surface hover:bg-hover transition-all"
                                >
                                    <Edit3 size={16} className="text-muted" />
                                    <span className="text-[10px] font-bold text-muted">تعديل</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
