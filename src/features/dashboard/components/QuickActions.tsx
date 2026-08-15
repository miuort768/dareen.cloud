import { useState } from 'react';
import { UserPlus, FileText, CalendarDays, Megaphone, Play, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { useCurrentUser } from '@/context/AppContext';

interface QuickActionsProps {
    onStartSession?: () => void;
    sessionAvailable?: boolean;
    showQuickLinks?: boolean;
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

const scrollToAnnouncements = () => {
    const tryScroll = (attempt = 0) => {
        if (attempt > 10) return;
        const el = document.getElementById('announcements-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setTimeout(() => tryScroll(attempt + 1), 200);
    };
    setTimeout(() => tryScroll(), 200);
};

export const QuickActions = ({ onStartSession, sessionAvailable, showQuickLinks = true }: QuickActionsProps) => {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => {
        triggerHaptic('light');
        setMobileOpen(false);
    };

    const handleStart = () => {
        triggerHaptic('medium');
        if (onStartSession) onStartSession();
        else navigate('/schedule');
    };

    const canViewAnnouncements = currentUser?.permissions?.includes('*') || currentUser?.permissions?.includes('announcements');

    const handleAction = (action: typeof actions[number]) => {
        if (action.title === 'إعلان عام' && !canViewAnnouncements) {
            closeMobile();
            navigate('/teacher-dashboard');
            scrollToAnnouncements();
            return;
        }
        closeMobile();
        navigate(action.href);
    };

    const quickLinksGrid = (
        <div className="grid grid-cols-2 gap-3">
            {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                    <button
                        key={`action-${i}`}
                        onClick={() => handleAction(action)}
                        className="block text-start"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-2xl text-center h-full w-full",
                                "bg-card dark:bg-card border border-border/50 dark:border-border",
                                "hover:border-primary/30 dark:hover:border-border hover:shadow-sm",
                                "active:scale-[0.97]",
                                "transition-all duration-200 group"
                            )}
                        >
                            <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                                action.iconBg,
                                "group-hover:scale-105 transition-transform duration-200"
                            )}>
                                <Icon size={20} className={action.color} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[12px] text-main dark:text-main leading-tight">{action.title}</h3>
                                <p className="text-[9px] text-muted dark:text-muted mt-1">{action.subtitle}</p>
                            </div>
                        </motion.div>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* زر بدء الحصة الآن — يفتح حوار اختيار الطالب والرابط والبدء مباشرة */}
            <button
                onClick={handleStart}
                className={cn(
                    "w-full p-4 rounded-2xl border-2 border-primary/30",
                    "bg-primary dark:bg-primary text-on-primary dark:text-on-primary font-bold text-sm",
                    "hover:bg-primary-hover hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                    "active:bg-primary-active active:scale-[0.99]",
                    "transition-all duration-200",
                    "flex items-center justify-center gap-3",
                    "group flex-1 min-h-[76px]"
                )}
            >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-on-primary/15 dark:bg-on-primary/15 group-hover:bg-on-primary/20 dark:group-hover:bg-on-primary/20 transition-colors">
                    <Play size={18} fill="currentColor" />
                </span>
                <span className="text-base">بدء الحصة الآن</span>
                {sessionAvailable && (
                    <span className="px-2 py-0.5 rounded-lg bg-success dark:bg-success text-on-success dark:text-on-success text-[10px] font-bold animate-pulse">
                        متاح
                    </span>
                )}
            </button>

            {/* روابط سريعة (للمدير فقط) — شبكة داخل البطاقة على الشاشات الكبيرة */}
            {showQuickLinks && (
                <>
                    <div className="hidden md:block">{quickLinksGrid}</div>

                    {/* زر فتح الورقة السفلية على الموبايل */}
                    <button
                        onClick={() => { triggerHaptic('light'); setMobileOpen(true); }}
                        className={cn(
                            "md:hidden w-full py-2.5 rounded-xl bg-surface dark:bg-card border border-border dark:border-border",
                            "text-muted dark:text-muted text-xs font-bold",
                            "active:scale-[0.98] transition-all duration-200",
                            "flex items-center justify-center gap-1.5"
                        )}
                    >
                        <MoreHorizontal size={14} />
                        المزيد من الإجراءات
                    </button>

                    {/* الورقة المنبثقة السفلية (موبايل) */}
                    <AnimatePresence>
                        {mobileOpen && (
                            <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    onClick={closeMobile}
                                />
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                    className="relative w-full max-h-[85vh] bg-card border-t border-border rounded-t-[28px] overflow-hidden flex flex-col z-10 pb-8"
                                    onClick={(e) => e.stopPropagation()}
                                    dir="rtl"
                                >
                                    <div className="flex flex-col items-center py-2" onClick={closeMobile}>
                                        <div className="w-12 h-1.5 rounded-full bg-border opacity-70 cursor-pointer" />
                                    </div>
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
                                    <div className="p-6 overflow-y-auto no-scrollbar">
                                        {quickLinksGrid}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};
