import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MessageCircle, Edit, Trash2, Users, GraduationCap, BookOpen, Calendar, TrendingUp, Clock, AlertCircle, Star, AlertTriangle, KeyRound } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ProgressBar } from '../../../shared/components/ui';
import type { Parent, Student } from '../../../types';
import type { FamilyScheduleItem } from '../types';

interface ParentDrawerProps {
    parent: Parent | null;
    details: {
        children: Student[];
        familySchedule: FamilyScheduleItem[];
        totalEnrollments: number;
        totalSessions: number;
        completedSessions: number;
        completionRate: number;
    } | null;
    onClose: () => void;
    onEdit?: (parent: Parent) => void;
    onDelete?: (id: string) => void;
    onWhatsApp?: (phone: string) => void;
    onCall?: (phone: string) => void;
    inline?: boolean;
}

type TabKey = 'overview' | 'schedule';

const avatarGradients = [
    { g: 'from-primary to-primary-hover', on: 'text-on-primary' },
    { g: 'from-success to-success-hover', on: 'text-on-success' },
    { g: 'from-info to-info-hover', on: 'text-on-info' },
    { g: 'from-warning to-warning-hover', on: 'text-on-warning' },
    { g: 'from-error to-error-hover', on: 'text-on-error' },
    { g: 'from-accent to-accent-hover', on: 'text-on-accent' },
];

const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const StatCell = ({ icon: Icon, value, label, color }: { icon: typeof Users; value: React.ReactNode; label: string; color: string }) => (
    <div className="p-3 bg-card border border-border rounded-xl">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2", color)}>
            <Icon size={12} />
        </div>
        <p className="text-sm font-bold text-main tabular-nums">{value}</p>
        <p className="text-[9px] text-muted mt-0.5">{label}</p>
    </div>
);

const OverviewTab = ({ parent, details, children, handleCall, handleWhatsApp, onEdit, onDelete }: {
    parent: Parent;
    details: ParentDrawerProps['details'];
    children: Student[];
    handleCall: () => void;
    handleWhatsApp: () => void;
    onEdit?: (parent: Parent) => void;
    onDelete?: (id: string) => void;
}) => (
    <>
        {/* Contact */}
        <div className="space-y-2">
            <h5 className="text-[9px] font-bold text-muted flex items-center gap-1.5"><Star size={10} /> بيانات التواصل</h5>
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-success-soft/30 border border-success/10 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-success-soft flex items-center justify-center shrink-0">
                        <Phone size={11} className="text-success" />
                    </div>
                    <div>
                        <p className="text-[9px] text-muted">الهاتف</p>
                        <p className="text-[11px] font-bold text-main font-mono" dir="ltr">{parent.phone}</p>
                    </div>
                </div>
                {parent.email && (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-info-soft/30 border border-info/10 rounded-xl">
                        <div className="w-7 h-7 rounded-lg bg-info-soft flex items-center justify-center shrink-0">
                            <Mail size={11} className="text-info" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted">البريد الإلكتروني</p>
                            <p className="text-[11px] font-bold text-main truncate">{parent.email}</p>
                        </div>
                    </div>
                )}
                {parent.username && (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-primary-soft/30 border border-primary/10 rounded-xl">
                        <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                            <KeyRound size={11} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] text-muted">اسم المستخدم</p>
                            <p className="text-[11px] font-bold text-main font-mono" dir="ltr">{parent.username}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
            <StatCell icon={Users} value={children.length} label="الأبناء" color="text-primary bg-primary-soft" />
            <StatCell icon={BookOpen} value={details?.totalEnrollments || 0} label="الاشتراكات" color="text-info bg-info-soft" />
            <StatCell icon={Calendar} value={`${details?.completedSessions || 0}/${details?.totalSessions || 0}`} label="الحصص" color="text-success bg-success-soft" />
            <StatCell icon={TrendingUp} value={`${details?.completionRate || 0}%`} label="الإنجاز" color="text-warning bg-warning-soft" />
        </div>

        {/* Children */}
        <div className="space-y-2">
            <h5 className="text-[9px] font-bold text-muted flex items-center gap-1.5">
                <GraduationCap size={10} />
                الأبناء المسجلين
                <span className="px-1.5 py-0.5 bg-primary-soft text-primary text-[8px] font-bold rounded">{children.length}</span>
            </h5>
            <div className="space-y-2">
                {children.length > 0 ? children.map(child => {
                    const total = (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0);
                    const used = (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0);
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                    return (
                        <div key={child.id} className="p-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {(child.name || '?').charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-main truncate">{child.name}</p>
                                        <p className="text-[8px] text-muted">{child.grade || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(child.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2) && (
                                        <AlertCircle size={10} className="text-error" />
                                    )}
                                    <span className="text-[9px] font-bold text-muted">{used}/{total}</span>
                                </div>
                            </div>
                            {total > 0 && (
                                <ProgressBar value={progress} variant={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'} className="h-1.5" />
                            )}
                            {(child.enrollments || []).length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {(child.enrollments || []).slice(0, 2).map((en, i) => (
                                        <div key={i} className="flex items-center justify-between text-[8px] px-1">
                                            <span className="flex items-center gap-1 text-muted">
                                                <BookOpen size={8} />
                                                {en.subject}
                                            </span>
                                            <span className="font-bold text-main">{en.sessionsUsed}/{en.sessionsTotal} حصة</span>
                                        </div>
                                    ))}
                                    {(child.enrollments || []).length > 2 && (
                                        <p className="text-[7px] text-muted px-1">+{(child.enrollments || []).length - 2} مواد</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="py-8 text-center border border-dashed border-border rounded-xl">
                        <Users size={28} className="mx-auto text-muted mb-2" />
                        <p className="text-[10px] text-muted">لا يوجد أبناء مرتبطين</p>
                    </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={handleCall} className="flex items-center justify-center gap-2 py-2.5 bg-success text-on-success text-[10px] font-bold rounded-xl hover:bg-success-hover transition-all active:scale-95">
                <Phone size={12} /> اتصال
            </button>
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 py-2.5 bg-warning text-on-warning text-[10px] font-bold rounded-xl hover:bg-warning-hover transition-all active:scale-95">
                <MessageCircle size={12} /> واتساب
            </button>
            <button onClick={() => onEdit?.(parent)} className="flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-95">
                <Edit size={12} /> تعديل
            </button>
            <button onClick={() => onDelete?.(parent.id)} className="flex items-center justify-center gap-2 py-2.5 bg-error text-on-error text-[10px] font-bold rounded-xl hover:bg-error-hover transition-all active:scale-95">
                <Trash2 size={12} /> حذف
            </button>
        </div>
    </>
);

const ScheduleTab = ({ familySchedule }: { familySchedule: FamilyScheduleItem[] }) => (
    <div className="space-y-3">
        <h5 className="text-[9px] font-bold text-muted flex items-center gap-1.5">
            <Clock size={10} />
            الجدول العائلي الموحد
        </h5>
        {familySchedule.length > 0 ? (() => {
            const grouped = familySchedule.reduce((acc, curr) => {
                const key = `${curr.studentName}-${curr.subject}`;
                if (!acc[key]) acc[key] = { student: curr.studentName, subject: curr.subject, times: [] as FamilyScheduleItem[] };
                acc[key].times.push(curr);
                return acc;
            }, {} as Record<string, { student: string; subject: string; times: FamilyScheduleItem[] }>);

            return Object.values(grouped).map((group, idx) => (
                <div key={idx} className="p-3 bg-card border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[11px] font-bold text-main">{group.subject}</p>
                            <p className="text-[8px] text-warning font-bold mt-0.5">{group.student}</p>
                        </div>
                        <Clock size={12} className="text-muted" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                        {group.times.map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-surface border border-border text-[8px] font-bold rounded-lg">
                                <span className="text-muted">{t.day}</span>
                                <span className="w-0.5 h-0.5 bg-primary rounded-full" />
                                <span className="text-primary font-mono">{t.hour} {t.period === 'am' ? 'ص' : 'م'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ));
        })() : (
            <div className="py-12 text-center border border-dashed border-border rounded-xl">
                <Calendar size={32} className="mx-auto text-muted mb-2 opacity-40" />
                <p className="text-[10px] text-muted">لا توجد مواعيد حالياً</p>
            </div>
        )}
    </div>
);

const ParentHeader = ({ parent, hasOverdue, childrenCount, onClose }: {
    parent: Parent;
    hasOverdue: boolean;
    childrenCount: number;
    onClose: () => void;
}) => {
    const gradient = getAvatarGradient(parent.name);
    return (
        <div className={cn("relative overflow-hidden p-5 bg-gradient-to-br", gradient.g)}>
            <div className="absolute inset-0 bg-white/10" />
            <div className="absolute -top-6 -end-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -start-6 w-16 h-16 bg-black/10 rounded-full blur-xl" />
            <button onClick={onClose} className={cn("absolute top-4 end-4 w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-xl transition-all z-10", gradient.on)} aria-label="إغلاق">
                <X size={20} />
            </button>
            <div className="relative z-10 flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold ring-2 ring-white/30 shadow-lg shrink-0", gradient.on)}>
                    {(parent.name || '?').charAt(0)}
                </div>
                <div className="min-w-0">
                    <h2 className={cn("text-base font-bold truncate", gradient.on)}>{parent.name}</h2>
                    <p className="text-[10px] text-white/70 mt-0.5">ID: {(parent.id || '').substring(0, 8)}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                    {hasOverdue && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-error-soft/80 text-error text-[8px] font-bold rounded"><AlertTriangle size={8} /> متأخرات</span>
                    )}
                    <span className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold rounded",
                        childrenCount > 0 ? 'bg-success-soft/80 text-on-success' : 'bg-surface/80 text-muted'
                    )}>
                        <span className={cn("w-1 h-1 rounded-full", childrenCount > 0 ? 'bg-success' : 'bg-muted')} />
                        {childrenCount > 0 ? 'نشط' : 'غير نشط'}
                    </span>
                </div>
            </div>
        </div>
    </div>
    );
};

const TabsBar = ({ tab, onTabChange }: { tab: TabKey; onTabChange: (t: TabKey) => void }) => (
    <div className="flex border-b border-border bg-card px-3">
        {[
            { key: 'overview' as TabKey, label: 'نظرة عامة', icon: Users },
            { key: 'schedule' as TabKey, label: 'الجدول العائلي', icon: Calendar },
        ].map(t => (
            <button key={t.key} onClick={() => onTabChange(t.key)} className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold border-b-2 transition-all",
                tab === t.key ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-main'
            )}>
                <t.icon size={12} />
                {t.label}
            </button>
        ))}
    </div>
);

export const ParentDrawer = ({ parent, details, onClose, onEdit, onDelete, onWhatsApp, onCall, inline = false }: ParentDrawerProps) => {
    const [tab, setTab] = useState<TabKey>('overview');

    if (!parent) return null;

    const children = details?.children || [];
    const familySchedule = details?.familySchedule || [];
    const hasOverdue = children.some(c => (c.enrollments || []).some(en => (en.sessionsTotal - en.sessionsUsed) <= 2));

    const handleCall = () => onCall?.(parent.phone);
    const handleWhatsApp = () => onWhatsApp?.(parent.phone);

    if (inline) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevation-1"
                dir="rtl">
                <ParentHeader parent={parent} hasOverdue={hasOverdue} childrenCount={children.length} onClose={onClose} />
                <TabsBar tab={tab} onTabChange={setTab} />
                <div className="p-4 sm:p-5 space-y-5">
                    {tab === 'overview'
                        ? <OverviewTab parent={parent} details={details} children={children} handleCall={handleCall} handleWhatsApp={handleWhatsApp} onEdit={onEdit} onDelete={onDelete} />
                        : <ScheduleTab familySchedule={familySchedule} />}
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] flex justify-end"
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-background border-s border-border shadow-elevation-2 overflow-hidden flex flex-col"
                    dir="rtl"
                >
                    <ParentHeader parent={parent} hasOverdue={hasOverdue} childrenCount={children.length} onClose={onClose} />
                    <TabsBar tab={tab} onTabChange={setTab} />
                    <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-5">
                        {tab === 'overview'
                            ? <OverviewTab parent={parent} details={details} children={children} handleCall={handleCall} handleWhatsApp={handleWhatsApp} onEdit={onEdit} onDelete={onDelete} />
                            : <ScheduleTab familySchedule={familySchedule} />}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
