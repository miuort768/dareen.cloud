import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, CheckCheck, Pencil, Trash2, BookOpen, Calendar, Clock, MessageCircle, ChevronDown, ChevronUp, CircleDollarSign, User, GraduationCap } from 'lucide-react';
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
    pending: { label: 'بانتظار', dot: 'bg-[#f59e0b]', bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', darkBg: 'dark:bg-[#f59e0b]/20', darkText: 'dark:text-[#f59e0b]' },
    completed: { label: 'تمت بنجاح', dot: 'bg-[#10b981]', bg: 'bg-[#10b981]/15', text: 'text-[#10b981]', darkBg: 'dark:bg-[#10b981]/20', darkText: 'dark:text-[#10b981]' },
    cancelled: { label: 'ملغية', dot: 'bg-[#ef4444]', bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', darkBg: 'dark:bg-[#ef4444]/20', darkText: 'dark:text-[#ef4444]' },
    converted: { label: 'محولة', dot: 'bg-[#6366f1]', bg: 'bg-[#6366f1]/15', text: 'text-[#6366f1]', darkBg: 'dark:bg-[#6366f1]/20', darkText: 'dark:text-[#6366f1]' },
};

const avatarGradients = [
    'from-[#6366f1] to-[#8b5cf6]',
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

export const TrialSessionCard = ({ session: t, onConvert, onEdit, onDelete, onCall, onWhatsApp, onCardClick, onPaid, isPaid, isConverting }: TrialSessionCardProps) => {
    const [showNotes, setShowNotes] = useState(false);
    const cfg = statusConfig[t.status] || statusConfig.pending;
    const gradient = getAvatarGradient(t.studentName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                "bg-card dark:bg-[#131836]/80 border border-border dark:border-white/[0.06] rounded-2xl overflow-hidden font-dash hover:shadow-elevation-2 dark:hover:shadow-none transition-all duration-300 group",
                onCardClick && "cursor-pointer"
            )}
        >
            {/* Main content */}
            <div className="p-4 pb-3 cursor-pointer" onClick={onCardClick}>
                {/* Row 1: Date + Time (top right in RTL) */}
                <div className="flex items-center gap-2 text-[11px] text-muted dark:text-white/40 mb-3">
                    <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />{t.date}
                    </span>
                    {t.time && (
                        <>
                            <span className="text-muted/30 dark:text-white/15">|</span>
                            <span className="inline-flex items-center gap-1">
                                <Clock size={11} />{t.time}
                            </span>
                        </>
                    )}
                </div>

                {/* Row 2: Info grid (Subject · Teacher · Phone) */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-white/30 mb-1">المادة التعليمية</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[12px] font-bold text-main dark:text-white">{t.subject || '—'}</span>
                            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 dark:bg-[#6366f1]/15 flex items-center justify-center shrink-0">
                                <BookOpen size={13} className="text-[#6366f1]" />
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-white/30 mb-1">التعلم المسؤول</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[12px] font-bold text-main dark:text-white truncate">{t.teacherName || '—'}</span>
                            <div className="w-7 h-7 rounded-lg bg-[#10b981]/10 dark:bg-[#10b981]/15 flex items-center justify-center shrink-0">
                                <GraduationCap size={13} className="text-[#10b981]" />
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted dark:text-white/30 mb-1">رقم التواصل</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[12px] font-bold text-main dark:text-white font-mono" dir="ltr">{formatPhone(t.parentPhone)}</span>
                            <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 dark:bg-[#f59e0b]/15 flex items-center justify-center shrink-0">
                                <Phone size={13} className="text-[#f59e0b]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Notes (if present) */}
                {t.notes && (
                    <div
                        className={cn(
                            "rounded-xl text-[11px] transition-all cursor-pointer mb-3",
                            showNotes ? "bg-[#f59e0b]/5 dark:bg-[#f59e0b]/8 p-3 border border-[#f59e0b]/15" : ""
                        )}
                        onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                    >
                        {showNotes ? (
                            <div className="flex items-start gap-2">
                                <MessageCircle size={13} className="text-[#f59e0b] shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-muted dark:text-white/40 leading-relaxed">{t.notes}</p>
                                    <button onClick={(e) => { e.stopPropagation(); setShowNotes(false); }} className="text-[10px] font-bold text-[#f59e0b] mt-1 inline-flex items-center gap-1">
                                        <ChevronUp size={10} />أقل
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[#f59e0b] bg-[#f59e0b]/5 dark:bg-[#f59e0b]/8 rounded-lg px-3 py-2 border border-[#f59e0b]/10">
                                <MessageCircle size={12} />
                                <span className="text-muted dark:text-white/40 line-clamp-1 flex-1">{t.notes}</span>
                                <ChevronDown size={10} className="shrink-0" />
                            </div>
                        )}
                    </div>
                )}

                {/* Row 4: Name + Status + Avatar (bottom of card) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[14px] font-bold text-main dark:text-white leading-tight">{t.studentName}</h3>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold mt-1", cfg.bg, cfg.text, cfg.darkBg, cfg.darkText)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                    {/* Avatar */}
                    <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient)}>
                        <User size={18} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-px bg-surface dark:bg-white/[0.02] border-t border-border/50 dark:border-white/[0.04]" role="toolbar" aria-label="إجراءات الحصة">
                {onCall && (
                    <button onClick={(e) => { e.stopPropagation(); onCall(t.parentPhone); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-[#10b981] hover:bg-[#10b981]/10 transition-colors active:bg-[#10b981]/20" aria-label="اتصال">
                        <Phone size={13} /> اتصال
                    </button>
                )}
                {onWhatsApp && (
                    <button onClick={(e) => { e.stopPropagation(); onWhatsApp(t.parentPhone); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-[#10b981] hover:bg-[#10b981]/10 transition-colors active:bg-[#10b981]/20" aria-label="واتساب">
                        <MessageSquare size={13} /> واتساب
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-muted dark:text-white/40 hover:bg-hover dark:hover:bg-white/[0.04] transition-colors active:bg-hover" aria-label="تعديل">
                    <Pencil size={13} /> تعديل
                </button>
                {onPaid && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPaid(t.id); }}
                        disabled={isPaid}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90",
                            isPaid
                                ? "border-[#10b981]/30 text-[#10b981]/40 cursor-default"
                                : "border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10 active:bg-[#10b981]/20"
                        )}
                        aria-label="مدفوعة"
                    >
                        <CircleDollarSign size={13} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                    className="w-8 h-8 rounded-full border-2 border-[#ef4444] text-[#ef4444] flex items-center justify-center shrink-0 hover:bg-[#ef4444]/10 active:bg-[#ef4444]/20 transition-all active:scale-90"
                    aria-label="حذف"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </motion.div>
    );
};
