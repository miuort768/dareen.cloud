import { useState } from 'react';
import { UserPlus, FileText, CalendarDays, Megaphone, Play, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        color: 'bg-primary/10 text-primary',
        iconBg: 'bg-primary/15',
    },
    {
        title: 'إصدار فاتورة',
        subtitle: 'إنشاء فاتورة مالية',
        icon: FileText,
        href: '/student-invoices?action=new',
        color: 'bg-success/10 text-success',
        iconBg: 'bg-success/15',
    },
    {
        title: 'الجدول الأسبوعي',
        subtitle: 'عرض الحصص القادمة',
        icon: CalendarDays,
        href: '/schedule',
        color: 'bg-info/10 text-info',
        iconBg: 'bg-info/15',
    },
    {
        title: 'إعلان عام',
        subtitle: 'إرسال إعلان للجميع',
        icon: Megaphone,
        href: '/announcements',
        color: 'bg-warning/10 text-warning',
        iconBg: 'bg-warning/15',
    },
];

export const QuickActions = ({ onStartSession, sessionAvailable }: QuickActionsProps) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(true)}
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
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 dark:bg-black/20 group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-colors">
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
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
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
                                    <h2 className="text-lg font-bold text-main dark:text-white">الإجراءات السريعة</h2>
                                    <p className="text-xs text-muted dark:text-white/40 mt-0.5">اختر الإجراء المطلوب</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface dark:bg-white/5 hover:bg-hover dark:hover:bg-white/10 transition-all active:scale-95"
                                    aria-label="إغلاق"
                                >
                                    <X size={18} className="text-muted dark:text-white/50" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {/* Start session button */}
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (onStartSession) onStartSession();
                                        else navigate('/schedule');
                                    }}
                                    className={cn(
                                        "w-full p-5 rounded-2xl",
                                        "bg-gradient-to-l from-primary via-primary to-primary-deep dark:from-primary dark:via-[#b8962e] dark:to-[#8a6d1a]",
                                        "text-on-primary dark:text-on-primary font-bold",
                                        "hover:shadow-lg hover:shadow-primary/25",
                                        "active:scale-[0.98]",
                                        "transition-all duration-200",
                                        "flex items-center gap-4",
                                        "group shadow-md shadow-primary/15"
                                    )}
                                >
                                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 dark:bg-black/20 group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-colors shrink-0">
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

                                {/* Action cards */}
                                <div className="space-y-3">
                                    {actions.map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={`action-${i}`}
                                                to={action.href}
                                                onClick={() => setIsOpen(false)}
                                                className="block"
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06, duration: 0.3 }}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl",
                                                        "bg-card dark:bg-white/[0.04] border border-border/50 dark:border-white/[0.06]",
                                                        "hover:border-primary/30 dark:hover:border-primary/20 hover:shadow-sm",
                                                        "active:scale-[0.98]",
                                                        "transition-all duration-200 group"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                        action.iconBg,
                                                        "group-hover:scale-105 transition-transform duration-200"
                                                    )}>
                                                        <Icon size={22} className={action.color.split(' ')[1]} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm text-main dark:text-white">{action.title}</h3>
                                                        <p className="text-[11px] text-muted dark:text-white/40 mt-0.5">{action.subtitle}</p>
                                                    </div>
                                                    <div className="text-muted/30 dark:text-white/20">
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                                                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
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
        </>
    );
};
