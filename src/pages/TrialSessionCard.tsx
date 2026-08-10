import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Pencil, Trash2, BookOpen, Calendar, Clock, MessageCircle, ChevronDown, ChevronUp, CircleDollarSign, User, GraduationCap } from 'lucide-react';
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
    onPaid?: (id: string) => void;
    isPaid?: boolean;
    isConverting: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; darkBg: string; darkText: string }> = {
    pending: { label: 'بانتظار', dot: 'bg-warning', bg: 'bg-warning/15', text: 'text-warning', darkBg: 'dark:bg-warning/20', darkText: 'dark:text-warning' },
    completed: { label: 'تمت بنجاح', dot: 'bg-success', bg: 'bg-success/15', text: 'text-success', darkBg: 'dark:bg-success/20', darkText: 'dark:text-success' },
    cancelled: { label: 'ملغية', dot: 'bg-error', bg: 'bg-error/15', text: 'text-error', darkBg: 'dark:bg-error/20', darkText: 'dark:text-error' },
    converted: { label: 'محولة', dot: 'bg-primary', bg: 'bg-primary/15', text: 'text-primary', darkBg: 'dark:bg-primary/20', darkText: 'dark:text-primary' },
};

const avatarGradients = [
    'from-primary to-primary-deep',
    'from-[#10b981] to-[#059669]',
    'from-[#f59e0b] to-[#d97706]',
    'from-[#ef4444] to-[#dc2626]',
    'from-[#3b82f6] to-[#2563eb]',
    'from-[#8b5cf6] to-[#7c3aed]',
];

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

export const TrialSessionCard = ({ session: t, onEdit, onDelete, onCall, onWhatsApp, onCardClick, onPaid, isPaid }: TrialSessionCardProps) => {
    const [showNotes, setShowNotes] = useState(false);
    const cfg = statusConfig[t.status] || statusConfig.pending;
    const gradient = getAvatarGradient(t.studentName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                "bg-card dark:bg-card/80 border border-border dark:border-white/[0.06] rounded-2xl overflow-hidden font-dash hover:shadow-elevation-2 dark:hover:shadow-none transition-all duration-300 group text-right",
                onCardClick && "cursor-pointer"
            )}
            dir="rtl"
        >
            {/* Main content */}
            <div className="p-4 pb-3 cursor-pointer" onClick={onCardClick}>
                {/* Top Row: Avatar + Name + Status (Right) & Date + Time (Left) */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient)}>
                            <User size={18} className="text-white" />
                        </div>
                        <div className="text-right">
                            <h3 className="text-[14px] font-bold text-main dark:text-main leading-tight">{t.studentName}</h3>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold mt-1", cfg.bg, cfg.text, cfg.darkBg, cfg.darkText)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                {cfg.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted dark:text-main/40">
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={11} />{t.date}
                        </span>
                        {t.time && (
                            <>
                                <span className="text-muted/30 dark:text-main/15">|</span>
                                <span className="inline-flex items-center gap-1">
                                    <Clock size={11} />{t.time}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info grid (Subject · Teacher · Phone) */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-main/30 mb-1">المادة التعليمية</p>
                        <div className="flex items-center gap-1.5 justify-start">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
                                <BookOpen size={13} className="text-primary" />
                            </div>
                            <span className="text-[12px] font-bold text-main dark:text-main">{t.subject || '—'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-main/30 mb-1">التعلم المسؤول</p>
                        <div className="flex items-center gap-1.5 justify-start">
                            <div className="w-7 h-7 rounded-lg bg-success/10 dark:bg-success/15 flex items-center justify-center shrink-0">
                                <GraduationCap size={13} className="text-success" />
                            </div>
                            <span className="text-[12px] font-bold text-main dark:text-main truncate">{t.teacherName || '—'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-main/30 mb-1">رقم التواصل</p>
                        <div className="flex items-center gap-1.5 justify-start">
                            <div className="w-7 h-7 rounded-lg bg-warning/10 dark:bg-warning/15 flex items-center justify-center shrink-0">
                                <Phone size={13} className="text-warning" />
                            </div>
                            <span className="text-[12px] font-bold text-main dark:text-main font-mono" dir="ltr">{formatPhone(t.parentPhone)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes (if present) */}
                {t.notes && (
                    <div
                        className={cn(
                            "rounded-xl text-[11px] transition-all cursor-pointer mb-2",
                            showNotes ? "bg-warning/5 dark:bg-warning/8 p-3 border border-warning/15" : ""
                        )}
                        onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                    >
                        {showNotes ? (
                            <div className="flex items-start gap-2">
                                <MessageCircle size={13} className="text-warning shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1 text-right">
                                    <p className="text-muted dark:text-main/40 leading-relaxed">{t.notes}</p>
                                    <button onClick={(e) => { e.stopPropagation(); setShowNotes(false); }} className="text-[10px] font-bold text-warning mt-1 inline-flex items-center gap-1">
                                        <ChevronUp size={10} />أقل
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-warning bg-warning/5 dark:bg-warning/8 rounded-lg px-3 py-2 border border-warning/10">
                                <MessageCircle size={12} />
                                <span className="text-muted dark:text-main/40 line-clamp-1 flex-1 text-right">{t.notes}</span>
                                <ChevronDown size={10} className="shrink-0" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action buttons row — styled as polished pills & circular buttons matching reference */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface/50 dark:bg-white/[0.02] border-t border-border/50 dark:border-white/[0.04]" role="toolbar" aria-label="إجراءات الحصة">
                <div className="flex items-center gap-2 flex-1">
                    {onCall && (
                        <button onClick={(e) => { e.stopPropagation(); onCall(t.parentPhone); }} className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 transition-all active:scale-95" aria-label="اتصال">
                            <Phone size={13} /> اتصال
                        </button>
                    )}
                    {onWhatsApp && (
                        <button onClick={(e) => { e.stopPropagation(); onWhatsApp(t.parentPhone); }} className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-success/10 text-success hover:bg-success/20 transition-all active:scale-95" aria-label="واتساب">
                            <MessageSquare size={13} /> واتساب
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-surface dark:bg-white/[0.06] text-muted dark:text-main/60 hover:bg-hover dark:hover:bg-white/[0.1] transition-all active:scale-95" aria-label="تعديل">
                        <Pencil size={13} /> تعديل
                    </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {onPaid && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onPaid(t.id); }}
                            disabled={isPaid}
                            className={cn(
                                "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                isPaid
                                    ? "border-success/30 text-success/40 bg-success/5 cursor-default"
                                    : "border-success text-success bg-success/10 hover:bg-success/20"
                            )}
                            aria-label="مدفوعة"
                        >
                            <CircleDollarSign size={15} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                        className="w-9 h-9 rounded-full border-2 border-error text-error bg-error/10 flex items-center justify-center hover:bg-error/20 transition-all active:scale-90 shadow-sm"
                        aria-label="حذف"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
