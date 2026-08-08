import { motion } from 'framer-motion';
import { X, Phone, MessageSquare, CheckCheck, Calendar, Clock, BookOpen, GraduationCap, MessageCircle, UserPlus, Pencil, CircleDollarSign, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TrialSession } from './TrialSessions';

interface TrialSessionDrawerProps {
    session: TrialSession | null;
    onClose: () => void;
    onCall: (phone: string) => void;
    onWhatsApp: (phone: string) => void;
    onConvert: (id: string) => void;
    onEdit: (session: TrialSession) => void;
    onPaid: (id: string) => void;
    isConverting: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string; darkBg: string; darkText: string }> = {
    pending: { label: 'بانتظار', dot: 'bg-[#f59e0b]', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/15', darkBg: 'dark:bg-[#f59e0b]/20', darkText: 'dark:text-[#f59e0b]' },
    completed: { label: 'تمت بنجاح', dot: 'bg-[#10b981]', text: 'text-[#10b981]', bg: 'bg-[#10b981]/15', darkBg: 'dark:bg-[#10b981]/20', darkText: 'dark:text-[#10b981]' },
    cancelled: { label: 'ملغية', dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#ef4444]/15', darkBg: 'dark:bg-[#ef4444]/20', darkText: 'dark:text-[#ef4444]' },
    converted: { label: 'محولة', dot: 'bg-[#6366f1]', text: 'text-[#6366f1]', bg: 'bg-[#6366f1]/15', darkBg: 'dark:bg-[#6366f1]/20', darkText: 'dark:text-[#6366f1]' },
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
    success: { dot: 'bg-[#10b981]', iconBg: 'bg-[#10b981]/10', iconText: 'text-[#10b981]', line: 'bg-[#10b981]/20' },
    info: { dot: 'bg-[#6366f1]', iconBg: 'bg-[#6366f1]/10', iconText: 'text-[#6366f1]', line: 'bg-[#6366f1]/20' },
    warning: { dot: 'bg-[#f59e0b]', iconBg: 'bg-[#f59e0b]/10', iconText: 'text-[#f59e0b]', line: 'bg-[#f59e0b]/20' },
    muted: { dot: 'bg-muted', iconBg: 'bg-surface', iconText: 'text-muted', line: 'bg-border' },
};

export const TrialSessionDrawer = ({ session, onClose, onCall, onWhatsApp, onConvert, onEdit, onPaid, isConverting }: TrialSessionDrawerProps) => {
    if (!session) return null;

    const cfg = statusConfig[session.status] || statusConfig.pending;
    const gradient = getAvatarGradient(session.studentName);
    const timeline = generateTimeline(session);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="p-2.5 sm:p-4"
        >
            <div className="bg-card dark:bg-[#131836]/80 border border-border dark:border-white/[0.04] rounded-2xl overflow-hidden" dir="rtl">
                {/* Header */}
                <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-border/50 dark:border-white/[0.04]">
                    <span className="text-[13px] font-bold text-main dark:text-white">تفاصيل الحصة</span>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 rounded-xl transition-all" aria-label="إغلاق">
                        <X size={14} className="text-muted dark:text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto">
                    {/* Profile */}
                    <div className="p-5 border-b border-border dark:border-white/[0.04]">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient)}>
                                <User size={22} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-main dark:text-white">{session.studentName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold", cfg.bg, cfg.text, cfg.darkBg, cfg.darkText)}>
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
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center ring-2 ring-card dark:ring-[#131836] z-10", v.iconBg)}>
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
                            <div className="p-4 rounded-xl bg-[#f59e0b]/[0.05] dark:bg-[#f59e0b]/[0.08] border border-[#f59e0b]/[0.15] dark:border-[#f59e0b]/[0.2]">
                                <div className="flex items-start gap-2">
                                    <MessageCircle size={14} className="text-[#f59e0b] shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted dark:text-white/40 leading-relaxed">{session.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-5 space-y-2">
                        <h3 className="text-[11px] font-bold text-muted dark:text-white/40 mb-3">الإجراءات</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onCall(session.parentPhone)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10b981]/10 dark:bg-[#10b981]/15 border border-[#10b981]/20 dark:border-[#10b981]/20 text-[#10b981] text-xs font-bold hover:bg-[#10b981]/20 dark:hover:bg-[#10b981]/20 transition-all active:scale-[0.98]">
                                <Phone size={14} /> اتصال
                            </button>
                            <button onClick={() => onWhatsApp(session.parentPhone)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10b981]/10 dark:bg-[#10b981]/15 border border-[#10b981]/20 dark:border-[#10b981]/20 text-[#10b981] text-xs font-bold hover:bg-[#10b981]/20 dark:hover:bg-[#10b981]/20 transition-all active:scale-[0.98]">
                                <MessageSquare size={14} /> واتساب
                            </button>
                            {session.status === 'pending' && (
                                <button onClick={() => onConvert(session.id)} disabled={isConverting} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6366f1]/10 dark:bg-[#6366f1]/15 border border-[#6366f1]/20 dark:border-[#6366f1]/20 text-[#6366f1] text-xs font-bold hover:bg-[#6366f1]/20 dark:hover:bg-[#6366f1]/20 transition-all active:scale-[0.98] disabled:opacity-50 col-span-2">
                                    <UserPlus size={14} /> {isConverting ? 'جاري التحويل...' : 'تحويل إلى طالب'}
                                </button>
                            )}
                            <button onClick={() => { onEdit(session); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface dark:bg-white/[0.04] border border-border dark:border-white/[0.06] text-muted dark:text-white/40 text-xs font-bold hover:bg-hover dark:hover:bg-white/[0.08] transition-all active:scale-[0.98]">
                                <Pencil size={14} /> تعديل
                            </button>
                            <button onClick={() => onPaid(session.id)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10b981]/10 dark:bg-[#10b981]/15 border border-[#10b981]/20 dark:border-[#10b981]/20 text-[#10b981] text-xs font-bold hover:bg-[#10b981]/20 dark:hover:bg-[#10b981]/20 transition-all active:scale-[0.98]">
                                <CircleDollarSign size={14} /> مدفوعة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
