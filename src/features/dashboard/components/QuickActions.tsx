import { useState } from 'react';
import { UserPlus, FileText, CalendarDays, Megaphone, Play, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

interface QuickActionsProps {
    onStartSession?: () => void;
    sessionAvailable?: boolean;
}

const actions = [
    {
        title: 'إضافة طالب',
        subtitle: 'تسجيل طالب جديد',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'text-primary',
        iconBg: 'bg-primary-soft',
    },
    {
        title: 'إصدار فاتورة',
        subtitle: 'إنشاء فاتورة مالية',
        icon: FileText,
        href: '/student-invoices?action=new',
        color: 'text-success',
        iconBg: 'bg-success-soft',
    },
    {
        title: 'الجدول الأسبوعي',
        subtitle: 'عرض الحصص القادمة',
        icon: CalendarDays,
        href: '/schedule',
        color: 'text-info',
        iconBg: 'bg-info-soft',
    },
    {
        title: 'إعلان عام',
        subtitle: 'إرسال إعلان للجميع',
        icon: Megaphone,
        href: '/announcements',
        color: 'text-warning',
        iconBg: 'bg-warning-soft',
    },
];

export const QuickActions = ({ onStartSession, sessionAvailable }: QuickActionsProps) => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(false);

    const closeMobile = () => {
        triggerHaptic('light');
        setMobileOpen(false);
    };

    return (
        <>
            {/* ===== Mobile (md:hidden) — Bottom Sheet design ===== */}
            <div className="md:hidden">
                {/* زر تشغيل الحصة الفوري */}
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        setMobileOpen(true);
                    }}
                    className={cn(
                        "w-full p-4 rounded-[20px] bg-primary text-on-primary font-bold text-sm",
                        "active:scale-[0.97] active:bg-primary-hover",
                        "transition-all duration-200",
                        "flex items-center justify-center gap-3 shadow-md shadow-primary/10"
                    )}
                >
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-on-primary/15">
                        <Play size={14} fill="currentColor" />
                    </span>
                    <span className="text-sm font-bold">بدء الحصة الآن</span>
                    {sessionAvailable && (
                        <span className="px-2 py-0.5 rounded-lg bg-success text-on-success text-[9px] font-bold animate-pulse">
                            متاح
                        </span>
                    )}
                </button>

                {/* الورقة المنبثقة السفلية المتناسقة */}
                <AnimatePresence>
                    {mobileOpen && (
                        <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
                            {/* الخلفية المظلمة المعتمة خلف النافذة */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={closeMobile}
                            />

                            {/* جسم الورقة السفلية */}
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className="relative w-full max-h-[85vh] bg-card border-t border-border rounded-t-[28px] overflow-hidden flex flex-col z-10 pb-8"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                            >
                                {/* مقبض السحب العلوي المنسق */}
                                <div className="flex flex-col items-center py-2" onClick={closeMobile}>
                                    <div className="w-12 h-1.5 rounded-full bg-border opacity-70 cursor-pointer" />
                                </div>

                                {/* ترويسة الورقة */}
                                <div className="flex items-center justify-between px-6 pb-4 border-b border-border/30">
                                    <div>
                                        <h2 className="text-base font-bold text-main">الوصول السريع والإجراءات</h2>
                                        <p className="text-[10px] text-muted mt-0.5">اختر الإجراء الذي تريد القيام به</p>
                                    </div>
                                    <button
                                        onClick={closeMobile}
                                        aria-label="إغلاق"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-hover active:scale-90 transition-all"
                                    >
                                        <X size={14} className="text-muted" />
                                    </button>
                                </div>

                                {/* المحتوى الداخلي والأزرار ثنائية التقسيم */}
                                <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
                                    {/* زر البث المباشر بالقمة */}
                                    <button
                                        onClick={() => {
                                            closeMobile();
                                            if (onStartSession) onStartSession();
                                            else navigate('/schedule');
                                        }}
                                        className="w-full p-4 rounded-2xl bg-primary text-on-primary flex items-center gap-4 active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
                                    >
                                        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-on-primary/15">
                                            <Play size={18} fill="currentColor" />
                                        </span>
                                        <div className="flex-1 text-right">
                                            <span className="text-xs font-bold block">بدء البث المباشر الفوري</span>
                                            <span className="text-[9px] text-on-primary/70 block mt-0.5">الدخول إلى الصف الأكاديمي مباشرة</span>
                                        </div>
                                    </button>

                                    {/* شبكة أزرار العمليات (كل زرين بجوار بعضهما البعض بالتساوي) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {actions.map((action, i) => {
                                            const Icon = action.icon;
                                            return (
                                                <Link
                                                    key={`action-${i}`}
                                                    to={action.href}
                                                    onClick={closeMobile}
                                                    className="block"
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-2xl text-center h-full border border-border/40 bg-surface",
                                                            "active:scale-[0.95] active:border-primary/20",
                                                            "transition-all duration-150"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                                            action.iconBg
                                                        )}>
                                                            <Icon size={18} className={action.color} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[12px] text-main leading-tight">{action.title}</h3>
                                                            <p className="text-[9px] text-muted mt-1 leading-normal">{action.subtitle}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ===== Desktop (hidden md:block) — full overlay design ===== */}
            <div className="hidden md:block">
                {/* Trigger button */}
                <button
                    onClick={() => setDesktopOpen(true)}
                    className={cn(
                        "w-full p-4 rounded-2xl border-2 border-primary/30",
                        "bg-primary dark:bg-primary text-on-primary dark:text-on-primary font-bold text-sm",
                        "hover:bg-primary-hover hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                        "active:bg-primary-active",
                        "transition-all duration-200",
                        "flex items-center justify-center gap-3",
                        "group"
                    )}
                >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-on-primary/15 dark:bg-on-primary/15 group-hover:bg-on-primary/20 dark:group-hover:bg-on-primary/20 transition-colors">
                        <Play size={18} fill="currentColor" />
                    </span>
                    <span className="text-base">بدء الحصة الآن</span>
                    {sessionAvailable && (
                        <span className="px-2 py-0.5 rounded-lg bg-success dark:bg-primary text-on-success dark:text-on-primary text-[10px] font-bold animate-pulse">
                            متاح
                        </span>
                    )}
                </button>

                {/* Full-screen overlay */}
                <AnimatePresence>
                    {desktopOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                            onClick={() => setDesktopOpen(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-100%' }}
                                transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-x-0 bottom-0 top-12 bg-background dark:bg-[#0e0e12] rounded-t-[2rem] overflow-hidden flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 dark:border-white/[0.06]">
                                    <div>
                                        <h2 className="text-lg font-bold text-main dark:text-main">الإجراءات السريعة</h2>
                                        <p className="text-xs text-muted dark:text-muted mt-0.5">اختر الإجراء المطلوب</p>
                                    </div>
                                    <button
                                        onClick={() => setDesktopOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface dark:bg-surface hover:bg-hover dark:hover:bg-hover transition-all active:scale-95"
                                        aria-label="إغلاق"
                                    >
                                        <X size={18} className="text-muted dark:text-muted" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* Start session button */}
                                    <button
                                        onClick={() => {
                                            setDesktopOpen(false);
                                            if (onStartSession) onStartSession();
                                            else navigate('/schedule');
                                        }}
                                        className={cn(
                                            "w-full p-5 rounded-2xl",
                                            "bg-primary dark:bg-primary",
                                            "text-on-primary dark:text-on-primary font-bold",
                                            "hover:shadow-lg hover:shadow-primary/25",
                                            "active:scale-[0.98]",
                                            "transition-all duration-200",
                                            "flex items-center gap-4",
                                            "group shadow-md shadow-primary/15"
                                        )}
                                    >
                                        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-on-primary/15 dark:bg-on-primary/15 group-hover:bg-on-primary/20 dark:group-hover:bg-on-primary/20 transition-colors shrink-0">
                                            <Play size={22} fill="currentColor" />
                                        </span>
                                        <div className="flex-1 text-right">
                                            <span className="text-base block">بدء الحصة الآن</span>
                                            {sessionAvailable && (
                                                <span className="text-[11px] text-on-primary/70 dark:text-on-primary/70 mt-0.5 block">الحصة متاحة حالياً</span>
                                            )}
                                        </div>
                                        {sessionAvailable && (
                                            <span className="px-2.5 py-1 rounded-lg bg-success dark:bg-success text-on-success dark:text-on-success text-[10px] font-bold animate-pulse shrink-0">
                                                متاح
                                            </span>
                                        )}
                                    </button>

                                    {/* Action cards — 2-column grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {actions.map((action, i) => {
                                            const Icon = action.icon;
                                            return (
                                                <Link
                                                    key={`action-${i}`}
                                                    to={action.href}
                                                    onClick={() => setDesktopOpen(false)}
                                                    className="block"
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.06, duration: 0.3 }}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-2xl text-center h-full",
                                                            "bg-card dark:bg-card border border-border/50 dark:border-border",
                                                            "hover:border-primary/30 dark:hover:border-border hover:shadow-sm",
                                                            "active:scale-[0.97]",
                                                            "transition-all duration-200 group"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                            action.iconBg,
                                                            "group-hover:scale-105 transition-transform duration-200"
                                                        )}>
                                                            <Icon size={22} className={action.color} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[13px] text-main dark:text-main leading-tight">{action.title}</h3>
                                                            <p className="text-[10px] text-muted dark:text-muted mt-1">{action.subtitle}</p>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
