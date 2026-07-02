import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Calendar, Megaphone, ShieldCheck, 
    Headphones, Bell, FilePlus, UserPlus, TrendingUp, 
    TrendingDown, Award, Loader2, Sparkles,
    ChevronLeft, Wallet, Clock, Home, Banknote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../../lib/haptics';

interface MobileAdminDashboardProps {
    stats: Record<string, unknown>;
    lowBalanceStudents: { id: string; studentName: string; subject: string; remainingSessions: number }[];
    onRefresh?: () => Promise<void> | void;
}

const iconProps = { size: 18, strokeWidth: 1.5 };
const smallIconProps = { size: 14, strokeWidth: 1.5 };
const miniIconProps = { size: 12, strokeWidth: 1.5 };

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.06 } }
};

const fadeUpItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export const MobileAdminDashboard = ({
    stats,
    lowBalanceStudents,
    onRefresh
}: MobileAdminDashboardProps) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'home' | 'quick' | 'finance' | 'alerts'>('home');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1005);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
            setPullDistance(Math.min(diff * 0.4, 90));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            setPullDistance(50);
            triggerHaptic('medium');
            if (onRefresh) {
                try { await onRefresh(); } catch (e) { console.error("Refresh failed", e); }
            }
            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
                setStartY(0);
                triggerHaptic('light');
            }, 800);
        } else {
            setPullDistance(0);
            setStartY(0);
        }
    };

    const handleTabChange = (tabId: 'home' | 'quick' | 'finance' | 'alerts') => {
        triggerHaptic('light');
        setActiveTab(tabId);
    };

    const headerScrolled = scrollY > 10;

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pb-4 text-right overflow-x-hidden relative bg-background dark:bg-background"
            dir="rtl"
        >

            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-primary font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-dim">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Sticky Header — Glassmorphism */}
            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-500",
                headerScrolled
                    ? "bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50 dark:border-border/50"
                    : "bg-white dark:bg-background border-b border-transparent"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] flex items-center justify-center text-on-primary shadow-sm shadow-info/40">
                                <ShieldCheck {...iconProps} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main dark:text-on-primary leading-tight">مركز القيادة</h1>
                                <p className="text-[9px] font-medium text-muted dark:text-muted">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1.5 rounded-xl bg-surface/70 dark:bg-primary-active/70 backdrop-blur-sm text-primary dark:text-info font-medium text-[9px] tabular-nums">
                                <Clock {...miniIconProps} className="inline ml-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 pb-3">
                    <div className="flex bg-gradient-to-b from-surface to-surface dark:from-[var(--bg-primary-active)]/60 dark:to-[var(--bg-primary-active)]/60 rounded-2xl p-1 gap-1 shadow-sm">
                        {[
                            { id: 'home' as const, label: 'الرئيسية', icon: Home },
                            { id: 'quick' as const, label: 'إجراءات', icon: FilePlus },
                            { id: 'finance' as const, label: 'المالية', icon: Wallet },
                            { id: 'alerts' as const, label: 'التنبيهات', icon: Bell, badge: lowBalanceCount },
                        ].map(tab => (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                whileTap={{ scale: 0.96 }}
                                className={cn(
                                    "flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-primary-active shadow-sm text-primary dark:text-info font-bold"
                                        : "text-dim dark:text-muted font-medium hover:text-main dark:hover:text-dim"
                                )}
                            >
                                <tab.icon {...smallIconProps} />
                                <span className="text-[9px]">{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] bg-gradient-to-br from-[var(--bg-success)] to-[var(--bg-success)] text-on-primary font-bold text-[7px] flex items-center justify-center px-1 border-2 border-white dark:border-border rounded-full shadow-sm">
                                        {tab.badge}
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-3 pb-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-4"
                        >
                            {/* Quick Stats */}
                            <motion.div className="grid grid-cols-3 gap-3" variants={stagger} initial="initial" animate="animate">
                                <motion.div variants={fadeUpItem} onClick={() => { triggerHaptic('light'); navigate('/students'); }} className="cursor-pointer">
                                    <StatCard title="الطلاب" value={stats.studentsCount} icon={Users} variant="info" />
                                </motion.div>
                                <motion.div variants={fadeUpItem} onClick={() => { triggerHaptic('light'); navigate('/schedule'); }} className="cursor-pointer">
                                    <StatCard title="الاشتراكات" value={stats.totalEnrollments} icon={BookOpen} variant="success" />
                                </motion.div>
                                <motion.div variants={fadeUpItem} onClick={() => { triggerHaptic('light'); handleTabChange('finance'); }} className="cursor-pointer">
                                    <StatCard title="صافي الربح" value={`${(stats.totalNetProfit || 0).toLocaleString()}`} icon={TrendingUp} variant="primary" />
                                </motion.div>
                            </motion.div>

                            {/* Today's Progress */}
                            <motion.div {...fadeUp} className="bg-white dark:bg-primary-active rounded-2xl p-5 shadow-sm border border-border dark:border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--bg-success-soft)] to-[var(--bg-success-light)] dark:from--[var(--bg-success)]/30 dark:to--[var(--bg-success)]/20 flex items-center justify-center">
                                            <Award {...smallIconProps} className="text-success" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-success dark:text-success">اليوم</span>
                                            <h3 className="text-xs font-bold text-main dark:text-on-primary">معدل تنفيذ الحصص</h3>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-success tabular-nums">{completionRate}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-surface dark:bg-primary-active rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                        className="h-full rounded-full bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-info)]"
                                    />
                                </div>
                                <p className="text-[9px] font-medium text-muted mt-2">تم تنفيذ {completedSessions} من {todaySessions} حصة</p>
                            </motion.div>

                            {/* Quick Links */}
                            <motion.div className="grid grid-cols-2 gap-3" variants={stagger} initial="initial" animate="animate">
                                <QuickLink icon={UserPlus} label="طالب جديد" color="#2563EB" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <QuickLink icon={FilePlus} label="فاتورة" color="#22C55E" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <QuickLink icon={Calendar} label="الجدول" color="#8B5CF6" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <QuickLink icon={Megaphone} label="لوحة الإعلانات" color="#F97316" onClick={() => { triggerHaptic('medium'); navigate('/announcements'); }} />
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'quick' && (
                        <motion.div
                            key="quick"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-3"
                        >
                            <motion.p {...fadeUp} className="text-[10px] font-bold text-muted px-1">الإجراءات السريعة</motion.p>
                            <motion.div className="grid grid-cols-2 gap-3" variants={stagger} initial="initial" animate="animate">
                                <NavButton label="إضافة طالب جديد" subtext="تسجيل جديد" icon={UserPlus} color="#2563EB" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <NavButton label="إصدار فاتورة" subtext="فاتورة مالية" icon={FilePlus} color="#22C55E" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <NavButton label="الجدول الاسبوعي" subtext="إدارة المواعيد" icon={Calendar} color="#8B5CF6" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <NavButton label="لوحة الإعلانات" subtext="إدارة ونشر" icon={Megaphone} color="#F97316" onClick={() => { triggerHaptic('medium'); navigate('/announcements'); }} />
                                <NavButton label="المعلمات" subtext="إدارة البيانات" icon={Users} color="#38BDF8" onClick={() => { triggerHaptic('medium'); navigate('/teachers'); }} />
                                <NavButton label="التقارير" subtext="إحصائيات" icon={Banknote} color="#F59E0B" onClick={() => { triggerHaptic('medium'); navigate('/reports'); }} />
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-4"
                        >
                            <motion.p {...fadeUp} className="text-[10px] font-bold text-muted px-1">المؤشرات المالية</motion.p>

                            <motion.div {...fadeUp} className="bg-white dark:bg-primary-active rounded-2xl p-5 shadow-sm border border-border dark:border-border space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[var(--bg-success-soft)] to-[var(--bg-success-light)] dark:from--[var(--bg-success)]/20 dark:to--[var(--bg-success)]/20 border border-success dark:border-success/30">
                                    <div>
                                        <span className="text-[9px] font-bold text-success dark:text-success">الإيرادات</span>
                                        <p className="text-lg font-bold text-main dark:text-on-primary mt-1 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--bg-success)] to-[var(--bg-success)] flex items-center justify-center text-on-primary shadow-sm shadow-success/40">
                                        <TrendingUp size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[var(--bg-error-soft)] to-[var(--bg-error-light)] dark:from--[var(--bg-error)]/20 dark:to--[var(--bg-error)]/20 border border-error dark:border-error/30">
                                    <div>
                                        <span className="text-[9px] font-bold text-error dark:text-error">المصروفات</span>
                                        <p className="text-lg font-bold text-main dark:text-on-primary mt-1 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] flex items-center justify-center text-on-primary shadow-sm shadow-error/40">
                                        <TrendingDown size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => { triggerHaptic('light'); navigate('/finance'); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm shadow-info/40 hover:shadow-md hover:shadow-info/60 transition-shadow active:scale-[0.98]"
                                >
                                    <Wallet {...smallIconProps} />
                                    لوحة المالية كاملة
                                    <ChevronLeft {...miniIconProps} />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                        <motion.div
                            key="alerts"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-4"
                        >
                            <motion.p {...fadeUp} className="text-[10px] font-bold text-muted px-1">التنبيهات</motion.p>

                            {lowBalanceCount > 0 ? (
                                <motion.div {...fadeUp} className="bg-white dark:bg-primary-active rounded-2xl p-5 shadow-sm border border-error dark:border-error/30">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] flex items-center justify-center text-on-primary shadow-sm shadow-error/40 shrink-0">
                                            <Bell size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xs text-main dark:text-on-primary">إشعار مالي</h3>
                                            <p className="text-[10px] font-medium text-muted dark:text-muted mt-1">
                                                يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                                            </p>
                                            <motion.button
                                                onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-3 h-8 px-4 rounded-xl bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-[9px] font-bold transition-all inline-flex items-center gap-1.5 shadow-sm shadow-info/30"
                                            >
                                                <UserPlus {...miniIconProps} />
                                                عرض الطلاب
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div {...fadeUp} className="bg-white dark:bg-primary-active rounded-2xl p-8 text-center shadow-sm border border-border dark:border-border">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--bg-success-soft)] to-[var(--bg-success-light)] dark:from--[var(--bg-success)]/30 dark:to--[var(--bg-success)]/20 flex items-center justify-center mx-auto mb-3">
                                        <Bell size={24} strokeWidth={1.5} className="text-success" />
                                    </div>
                                    <p className="text-xs font-bold text-main dark:text-on-primary">لا توجد تنبيهات</p>
                                    <p className="text-[9px] font-medium text-muted mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                                </motion.div>
                            )}

                            {/* Support Card — glassmorphism style */}
                            <motion.div {...fadeUp} className="relative rounded-2xl p-5 shadow-sm overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)]">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-info-light/10 rounded-full blur-xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <Headphones size={18} strokeWidth={1.5} className="text-on-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-on-primary">الدعم الفني</h4>
                                            <p className="text-[9px] font-medium text-white/60">متاح 24/7</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full h-11 rounded-2xl bg-white/15 backdrop-blur-md text-on-primary text-[10px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm border border-white/10 hover:bg-white/25"
                                    >
                                        <Headphones {...smallIconProps} />
                                        تواصل مع الدعم الفني
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};




const colorVarMap: Record<string, string> = {
    '#2563EB': 'var(--bg-primary)',
    '#22C55E': 'var(--bg-success)',
    '#8B5CF6': 'var(--chart-4)',
    '#F97316': 'var(--bg-warning)',
    '#38BDF8': 'var(--bg-info)',
    '#F59E0B': 'var(--bg-warning)',
};

const NavButton = ({ label, subtext, icon: Icon, color, onClick }: { label: string; subtext: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; color: string; onClick?: () => void }) => (
    <motion.button
        variants={fadeUpItem}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all w-full dark:brightness-[0.65]"
        style={{ backgroundColor: colorVarMap[color] || color }}
    >
        <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-sm text-on-primary">
            <Icon {...iconProps} />
        </div>
        <span className="text-[10px] font-bold text-on-primary leading-none mt-1">{label}</span>
        <span className="text-[8px] font-medium text-on-primary/70">{subtext}</span>
    </motion.button>
);

const QuickLink = ({ icon: Icon, label, color, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; color: string; onClick?: () => void }) => {
    const cssVar = colorVarMap[color] || color;
    return (
    <motion.button
        variants={fadeUpItem}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-primary-active rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-border dark:border-border active:scale-95 transition-all hover:shadow-md hover:shadow-sm/50 dark:hover:shadow-card/50"
    >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${cssVar} 7%, transparent)`, color: cssVar }}>
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-bold text-main dark:text-on-primary">{label}</span>
    </motion.button>
    );
};
