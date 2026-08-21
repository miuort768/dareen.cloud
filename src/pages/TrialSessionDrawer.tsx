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

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    pending: { label: 'بانتظار', dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-soft' },
    completed: { label: 'تمت بنجاح', dot: 'bg-success', text: 'text-success', bg: 'bg-success-soft' },
    cancelled: { label: 'ملغية', dot: 'bg-error', text: 'text-error', bg: 'bg-error-soft' },
    converted: { label: 'محولة', dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary-soft' },
};

const avatarGradients = [
    { g: 'from-primary to-primary-deep', on: 'text-on-primary' },
    { g: 'from-success to-success-dark', on: 'text-on-success' },
    { g: 'from-warning to-warning-dark', on: 'text-on-warning' },
    { g: 'from-error to-error-dark', on: 'text-on-error' },
    { g: 'from-info to-info-dark', on: 'text-on-info' },
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
    success: { dot: 'bg-success', iconBg: 'bg-success-soft', iconText: 'text-success', line: 'bg-success' },
    info: { dot: 'bg-primary', iconBg: 'bg-primary-soft', iconText: 'text-primary', line: 'bg-primary' },
    warning: { dot: 'bg-warning', iconBg: 'bg-warning-soft', iconText: 'text-warning', line: 'bg-warning' },
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
            <div className="bg-card border border-border rounded-2xl overflow-hidden" dir="rtl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-l from-primary to-primary-deep px-5 py-4">
                    <span className="text-[13px] font-bold text-on-primary">تفاصيل الحصة</span>
                    <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 transition-all hover:bg-white/25" aria-label="إغلاق">
                        <X size={14} className="text-on-primary" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <div className="p-5 border-b border-border">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient.g)}>
                                <User size={22} className={gradient.on} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-main">{session.studentName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold", cfg.bg, cfg.text)}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                                        {cfg.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-b border-border">
                        <h3 className="text-[11px] font-bold text-muted mb-3">معلومات الحصة</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                                    <BookOpen size={11} />
                                    <span>المادة</span>
                                </div>
                                <p className="text-xs font-bold text-main">{session.subject || '—'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                                    <GraduationCap size={11} />
                                    <span>المعلمة</span>
                                </div>
                                <p className="text-xs font-bold text-main">{session.teacherName || '—'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                                    <Calendar size={11} />
                                    <span>التاريخ</span>
                                </div>
                                <p className="text-xs font-bold text-main">{session.date}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                                    <Clock size={11} />
                                    <span>الوقت</span>
                                </div>
                                <p className="text-xs font-bold text-main">{session.time || '—'}</p>
                            </div>
                            <div className="col-span-2 p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                                    <Phone size={11} />
                                    <span>رقم ولي الأمر</span>
                                </div>
                                <p className="text-xs font-bold text-main font-mono" dir="ltr">{session.parentPhone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-b border-border">
                        <h3 className="text-[11px] font-bold text-muted mb-3">النشاطات</h3>
                        <div className="relative">
                            {timeline.map((item, idx) => {
                                const v = variantStyles[item.variant] || variantStyles.muted;
                                const Icon = item.icon;
                                const isLast = idx === timeline.length - 1;
                                return (
                                    <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center ring-2 ring-card z-10", v.iconBg)}>
                                                <Icon size={13} className={v.iconText} />
                                            </div>
                                            {!isLast && <div className={cn("w-px flex-1 min-h-[8px]", v.line)} />}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-xs font-bold text-main">{item.label}</p>
                                            <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {session.notes && (
                        <div className="p-5 border-b border-border">
                            <h3 className="text-[11px] font-bold text-muted mb-3">الملاحظات</h3>
                            <div className="rounded-xl border border-warning-soft bg-warning-soft p-4">
                                <div className="flex items-start gap-2">
                                    <MessageCircle size={14} className="text-warning shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted leading-relaxed">{session.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-5 space-y-2">
                        <h3 className="text-[11px] font-bold text-muted mb-3">الإجراءات</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onCall(session.parentPhone)} className="flex items-center justify-center gap-2 rounded-xl bg-info-soft py-3 text-xs font-bold text-info transition-all hover:bg-info-light active:scale-[0.98]">
                                <Phone size={14} /> اتصال
                            </button>
                            <button onClick={() => onWhatsApp(session.parentPhone)} className="flex items-center justify-center gap-2 rounded-xl bg-success-soft py-3 text-xs font-bold text-success transition-all hover:bg-success-light active:scale-[0.98]">
                                <MessageSquare size={14} /> واتساب
                            </button>
                            {session.status === 'pending' && (
                                <button onClick={() => onConvert(session.id)} disabled={isConverting} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary-soft py-3 text-xs font-bold text-primary transition-all hover:bg-primary-light active:scale-[0.98] disabled:opacity-50">
                                    <UserPlus size={14} /> {isConverting ? 'جاري التحويل...' : 'تحويل إلى طالب'}
                                </button>
                            )}
                            <button onClick={() => { onEdit(session); onClose(); }} className="flex items-center justify-center gap-2 rounded-xl bg-primary-soft py-3 text-xs font-bold text-primary transition-all hover:bg-primary-light active:scale-[0.98]">
                                <Pencil size={14} /> تعديل
                            </button>
                            <button onClick={() => onPaid(session.id)} className="flex items-center justify-center gap-2 rounded-xl bg-warning-soft py-3 text-xs font-bold text-warning transition-all hover:bg-warning-light active:scale-[0.98]">
                                <CircleDollarSign size={14} /> مدفوعة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
