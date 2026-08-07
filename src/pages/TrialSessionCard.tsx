import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, CheckCheck, Pencil, Trash2, BookOpen, Calendar, Clock, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TrialSession } from './TrialSessions';

interface TrialSessionCardProps {
    session: TrialSession;
    onConvert: (id: string) => void;
    onEdit: (session: TrialSession) => void;
    onDelete: (id: string) => void;
    onCall?: (phone: string) => void;
    onWhatsApp?: (phone: string) => void;
    onCardClick?: () => void;
    isConverting: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; darkBg: string; darkText: string }> = {
    pending: { label: 'بانتظار', dot: 'bg-warning', bg: 'bg-warning/15', text: 'text-warning', darkBg: 'dark:bg-warning/20', darkText: 'dark:text-warning' },
    completed: { label: 'تمت', dot: 'bg-success', bg: 'bg-success/15', text: 'text-success', darkBg: 'dark:bg-success/20', darkText: 'dark:text-success' },
    cancelled: { label: 'ملغية', dot: 'bg-error', bg: 'bg-error/15', text: 'text-error', darkBg: 'dark:bg-error/20', darkText: 'dark:text-error' },
    converted: { label: 'محولة', dot: 'bg-info', bg: 'bg-info/15', text: 'text-info', darkBg: 'dark:bg-info/20', darkText: 'dark:text-info' },
};

const avatarGradients = [
    'from-primary to-primary-hover',
    'from-success to-success-hover',
    'from-info to-info-hover',
    'from-warning to-warning-hover',
    'from-error to-error-hover',
    'from-accent to-accent-hover',
];

const subjectColors: Record<string, string> = {
    رياضيات: 'text-primary',
    عربي: 'text-success',
    علوم: 'text-info',
    إنجليزي: 'text-warning',
    فيزياء: 'text-info',
    كيمياء: 'text-error',
};

const getSubjectColor = (subject?: string) => {
    if (!subject) return 'text-muted';
    const key = Object.keys(subjectColors).find(k => subject.includes(k) || k.includes(subject));
    return key ? subjectColors[key] : 'text-muted';
};

const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const formatPhone = (phone: string) => {
    if (!phone) return '';
    if (phone.length > 8) return `${phone.slice(0, 4)}...${phone.slice(-3)}`;
    return phone;
};

export const TrialSessionCard = ({ session: t, onConvert, onEdit, onDelete, onCall, onWhatsApp, onCardClick, isConverting }: TrialSessionCardProps) => {
    const [showNotes, setShowNotes] = useState(false);
    const cfg = statusConfig[t.status] || statusConfig.pending;
    const gradient = getAvatarGradient(t.studentName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onClick={onCardClick}
            className={cn("bg-card dark:bg-[#131836]/80 border border-border dark:border-white/[0.06] rounded-2xl overflow-hidden font-dash hover:shadow-elevation-2 dark:hover:shadow-none transition-all duration-300 group", onCardClick && "cursor-pointer")}
        >
            {/* Clickable body — opens drawer */}
            <div className="p-4 pb-3 cursor-pointer">
                {/* Row 1: Avatar + Name + Status */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm", gradient)}>
                            <span className="text-sm font-bold text-white">{t.studentName?.charAt(0) || 'ط'}</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-bold text-main dark:text-white leading-tight truncate">{t.studentName}</h3>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold mt-0.5", cfg.bg, cfg.text, cfg.darkBg, cfg.darkText)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Row 2: Subject · Date · Time */}
                <div className="flex items-center gap-2.5 text-[11px] text-muted dark:text-white/40 mb-1.5">
                    {t.subject && (
                        <span className={cn("inline-flex items-center gap-1", getSubjectColor(t.subject))}>
                            <BookOpen size={11} />{t.subject}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />{t.date}
                    </span>
                    {t.time && (
                        <span className="inline-flex items-center gap-1">
                            <Clock size={11} />{t.time}
                        </span>
                    )}
                </div>

                {/* Row 3: Phone */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted dark:text-white/40 mb-1.5">
                    <Phone size={11} className="text-success shrink-0" />
                    <span dir="ltr" className="font-mono">{formatPhone(t.parentPhone)}</span>
                    {t.teacherName && (
                        <>
                            <span className="text-muted/40 dark:text-white/20 mx-1">·</span>
                            <span>{t.teacherName}</span>
                        </>
                    )}
                </div>

                {/* Row 4: Notes (collapsible) */}
                {t.notes && (
                    <div
                        className={cn(
                            "rounded-xl text-[11px] transition-all cursor-pointer",
                            showNotes ? "bg-surface dark:bg-white/[0.04] p-3" : ""
                        )}
                        onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                    >
                        {showNotes ? (
                            <div className="flex items-start gap-2">
                                <MessageCircle size={13} className="text-warning shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-muted dark:text-white/40 leading-relaxed">{t.notes}</p>
                                    <button onClick={(e) => { e.stopPropagation(); setShowNotes(false); }} className="text-[10px] font-bold text-warning mt-1 inline-flex items-center gap-1">
                                        <ChevronUp size={10} />أقل
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-warning">
                                <MessageCircle size={12} />
                                <span className="text-muted dark:text-white/40 line-clamp-1">{t.notes}</span>
                                <ChevronDown size={10} className="shrink-0" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-px bg-border/30 dark:bg-white/[0.02] border-t border-border/50 dark:border-white/[0.04]" role="toolbar" aria-label="إجراءات الحصة">
                {onCall && (
                    <button onClick={(e) => { e.stopPropagation(); onCall(t.parentPhone); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-success hover:bg-success/10 transition-colors active:bg-success/20" aria-label="اتصال">
                        <Phone size={12} /> اتصال
                    </button>
                )}
                {onWhatsApp && (
                    <button onClick={(e) => { e.stopPropagation(); onWhatsApp(t.parentPhone); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-success hover:bg-success/10 transition-colors active:bg-success/20" aria-label="واتساب">
                        <MessageSquare size={12} /> واتساب
                    </button>
                )}
                {t.status === 'pending' && (
                    <button onClick={(e) => { e.stopPropagation(); onConvert(t.id); }} disabled={isConverting} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-info hover:bg-info/10 transition-colors active:bg-info/20 disabled:opacity-40" aria-label="تحويل إلى طالب">
                        <CheckCheck size={12} /> تم
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-muted dark:text-white/40 hover:bg-surface dark:hover:bg-white/[0.04] transition-colors active:bg-hover" aria-label="تعديل">
                    <Pencil size={12} /> تعديل
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-error hover:bg-error/10 transition-colors active:bg-error/20" aria-label="حذف">
                    <Trash2 size={12} /> حذف
                </button>
            </div>
        </motion.div>
    );
};
