import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, CheckCheck, Calendar, Clock, BookOpen, GraduationCap, MessageCircle, UserPlus, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TrialSession } from './TrialSessions';

interface TrialSessionDrawerProps {
    session: TrialSession | null;
    onClose: () => void;
    onCall?: (phone: string) => void;
    onWhatsApp?: (phone: string) => void;
    onConvert?: (id: string) => void;
    onEdit?: (session: TrialSession) => void;
    isConverting?: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; text: string; darkBg: string; darkText: string }> = {
    pending: { label: 'بانتظار', dot: 'bg-warning', text: 'text-warning', darkBg: 'dark:bg-warning/20', darkText: 'dark:text-warning' },
    completed: { label: 'تمت', dot: 'bg-success', text: 'text-success', darkBg: 'dark:bg-success/20', darkText: 'dark:text-success' },
    cancelled: { label: 'ملغية', dot: 'bg-error', text: 'text-error', darkBg: 'dark:bg-error/20', darkText: 'dark:text-error' },
    converted: { label: 'محولة', dot: 'bg-info', text: 'text-info', darkBg: 'dark:bg-info/20', darkText: 'dark:text-info' },
};

const avatarGradients = [
    'from-primary to-primary-hover',
    'from-success to-success-hover',
    'from-info to-info-hover',
    'from-warning to-warning-hover',
    'from-error to-error-hover',
    'from-accent to-accent-hover',
];

const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const generateTimeline = (session: TrialSession) => {
    const items: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; time: string; variant: 'success' | 'info' | 'warning' | 'muted' }[] = [];

    items.push({ icon: UserPlus, label: 'تم تسجيل الحصة', time: session.created_at || session.date, variant: 'info' });

    if (session.status === 'completed' || session.status === 'converted') {
        items.push({ icon: CheckCheck, label: 'تمت الحصة', time: session.date, variant: 'success' });
    }

    if (session.status === 'converted') {
        items.push({ icon: UserPlus, label: 'تم تحويله إلى طالب', time: session.date, variant: 'success' });
    }

    if (session.status === 'cancelled') {
        items.push({ icon: X, label: 'تم الإلغاء', time: session.date, variant: 'warning' });
    }

    return items;
};

const variantStyles: Record<string, { dot: string; iconBg: string; iconText: string; line: string }> = {
    success: { dot: 'bg-success', iconBg: 'bg-success/10', iconText: 'text-success', line: 'bg-success/20' },
    info: { dot: 'bg-info', iconBg: 'bg-info/10', iconText: 'text-info', line: 'bg-info/20' },
    warning: { dot: 'bg-warning', iconBg: 'bg-warning/10', iconText: 'text-warning', line: 'bg-warning/20' },
    muted: { dot: 'bg-muted', iconBg: 'bg-surface', iconText: 'text-muted', line: 'bg-border' },
};

export const TrialSessionDrawer = ({ session, onClose, onCall, onWhatsApp, onConvert, onEdit, isConverting }: TrialSessionDrawerProps) => {
    if (!session) return null;

    const cfg = statusConfig[session.status] || statusConfig.pending;
    const gradient = getAvatarGradient(session.studentName);
    const timeline = generateTimeline(session);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Mobile: bottom-sheet */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="md:hidden absolute inset-x-0 bottom-0 bg-card dark:bg-[#0a0e27] rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden"
                    dir="rtl"
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 bg-border dark:bg-white/10 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="shrink-0 px-5 py-3 flex items-center justify-between border-b border-border/50 dark:border-white/[0.04]">
                        <span className="text-[13px] font-bold text-main dark:text-white">تفاصيل الحصة</span>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all" aria-label="إغلاق">
                            <X size={14} className="text-muted dark:text-white/50" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {renderContent(session, cfg, gradient, timeline, onCall, onWhatsApp, onConvert, onEdit, isConverting)}
                    </div>
                </motion.div>

                {/* Desktop: right-side panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden md:block absolute end-0 top-0 bottom-0 w-full max-w-md bg-card dark:bg-[#0a0e27] border-s border-border dark:border-white/[0.06] shadow-elevation-3 overflow-y-auto"
                    dir="rtl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-card dark:bg-[#0a0e27] border-b border-border dark:border-white/[0.04]">
                        <div className="flex items-center justify-between p-4">
                            <span className="text-[13px] font-bold text-main dark:text-white">تفاصيل الحصة</span>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all" aria-label="إغلاق">
                                <X size={14} className="text-muted dark:text-white/50" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {renderContent(session, cfg, gradient, timeline, onCall, onWhatsApp, onConvert, onEdit, isConverting)}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

function renderContent(
    session: TrialSession,
    cfg: { label: string; dot: string; text: string; darkBg: string; darkText: string },
    gradient: string,
    timeline: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; time: string; variant: 'success' | 'info' | 'warning' | 'muted' }[],
    onCall?: (phone: string) => void,
    onWhatsApp?: (phone: string) => void,
    onConvert?: (id: string) => void,
    onEdit?: (session: TrialSession) => void,
    isConverting?: boolean
) {
    return (
        <>
            {/* Profile */}
            <div className="p-5 border-b border-border dark:border-white/[0.04]">
                <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient)}>
                        <span className="text-xl font-bold text-white">{session.studentName?.charAt(0) || 'ط'}</span>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-main dark:text-white">{session.studentName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold", cfg.text, cfg.darkText, `bg-${cfg.dot.replace('bg-', '')}/10`, cfg.darkBg)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div className="p-5 border-b border-border dark:border-white/[0.04]">
                <h3 className="text-[11px] font-bold text-muted dark:text-white/40 mb-3">معلومات الحصة</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-white/30 mb-1">
                            <BookOpen size={11} />
                            <span>المادة</span>
                        </div>
                        <p className="text-xs font-bold text-main dark:text-white">{session.subject || '—'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-white/30 mb-1">
                            <GraduationCap size={11} />
                            <span>المعلمة</span>
                        </div>
                        <p className="text-xs font-bold text-main dark:text-white">{session.teacherName || '—'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-white/30 mb-1">
                            <Calendar size={11} />
                            <span>التاريخ</span>
                        </div>
                        <p className="text-xs font-bold text-main dark:text-white">{session.date}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-white/30 mb-1">
                            <Clock size={11} />
                            <span>الوقت</span>
                        </div>
                        <p className="text-xs font-bold text-main dark:text-white">{session.time || '—'}</p>
                    </div>
                    <div className="col-span-2 p-3 rounded-xl bg-surface dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-white/30 mb-1">
                            <Phone size={11} />
                            <span>رقم ولي الأمر</span>
                        </div>
                        <p className="text-xs font-bold text-main dark:text-white font-mono" dir="ltr">{session.parentPhone}</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-5 border-b border-border dark:border-white/[0.04]">
                <h3 className="text-[11px] font-bold text-muted dark:text-white/40 mb-3">النشاطات</h3>
                <div className="relative">
                    {timeline.map((item, idx) => {
                        const v = variantStyles[item.variant] || variantStyles.muted;
                        const Icon = item.icon;
                        const isLast = idx === timeline.length - 1;
                        return (
                            <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                                <div className="flex flex-col items-center">
                                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center ring-2 ring-card dark:ring-[#0a0e27] z-10", v.iconBg)}>
                                        <Icon size={13} className={v.iconText} />
                                    </div>
                                    {!isLast && <div className={cn("w-px flex-1 min-h-[8px]", v.line)} />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-xs font-bold text-main dark:text-white">{item.label}</p>
                                    <p className="text-[10px] text-muted dark:text-white/30 mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            {session.notes && (
                <div className="p-5 border-b border-border dark:border-white/[0.04]">
                    <h3 className="text-[11px] font-bold text-muted dark:text-white/40 mb-3">الملاحظات</h3>
                    <div className="p-4 rounded-xl bg-warning/[0.05] dark:bg-warning/[0.08] border border-warning/[0.15] dark:border-warning/[0.2]">
                        <div className="flex items-start gap-2">
                            <MessageCircle size={14} className="text-warning shrink-0 mt-0.5" />
                            <p className="text-xs text-muted dark:text-white/40 leading-relaxed">{session.notes}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="p-5 space-y-2">
                <h3 className="text-[11px] font-bold text-muted dark:text-white/40 mb-3">الإجراءات</h3>
                <div className="grid grid-cols-2 gap-2">
                    {onCall && (
                        <button onClick={() => onCall(session.parentPhone)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 dark:bg-success/15 border border-success/20 dark:border-success/20 text-success text-xs font-bold hover:bg-success/20 dark:hover:bg-success/20 transition-all active:scale-[0.98]">
                            <Phone size={14} /> اتصال
                        </button>
                    )}
                    {onWhatsApp && (
                        <button onClick={() => onWhatsApp(session.parentPhone)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 dark:bg-success/15 border border-success/20 dark:border-success/20 text-success text-xs font-bold hover:bg-success/20 dark:hover:bg-success/20 transition-all active:scale-[0.98]">
                            <MessageSquare size={14} /> واتساب
                        </button>
                    )}
                    {session.status === 'pending' && onConvert && (
                        <button onClick={() => onConvert(session.id)} disabled={isConverting} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-info/10 dark:bg-info/15 border border-info/20 dark:border-info/20 text-info text-xs font-bold hover:bg-info/20 dark:hover:bg-info/20 transition-all active:scale-[0.98] disabled:opacity-50 col-span-2">
                            <UserPlus size={14} /> {isConverting ? 'جاري التحويل...' : 'تحويل إلى طالب'}
                        </button>
                    )}
                    {onEdit && (
                        <button onClick={() => { onEdit(session); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface dark:bg-white/[0.04] border border-border dark:border-white/[0.06] text-muted dark:text-white/40 text-xs font-bold hover:bg-hover dark:hover:bg-white/[0.08] transition-all active:scale-[0.98]">
                            <Pencil size={14} /> تعديل
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
