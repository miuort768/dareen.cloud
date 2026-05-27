import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Calendar, Megaphone, ShieldCheck, 
    Headphones, Bell, FilePlus, UserPlus, TrendingUp, 
    TrendingDown, Award, Loader2, Sparkles,
    ChevronLeft, Wallet, Clock, Home, Banknote, AlertTriangle, Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
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

export const MobileAdminDashboard = ({
    stats,
    lowBalanceStudents,
    onRefresh
}: MobileAdminDashboardProps) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'home' | 'operations' | 'finance' | 'alerts'>('home');
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

    const handleTabChange = (tabId: 'home' | 'operations' | 'finance' | 'alerts') => {
        triggerHaptic('light');
        setActiveTab(tabId);
    };

    const tabs = [
        { id: 'home' as const, label: 'الرئيسية', icon: Home },
        { id: 'operations' as const, label: 'العمليات', icon: FilePlus },
        { id: 'finance' as const, label: 'المالية', icon: Wallet },
        { id: 'alerts' as const, label: 'التنبيهات', icon: Bell, badge: lowBalanceCount },
    ];

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pb-24 text-right overflow-x-hidden relative bg-[radial-gradient(circle_at_top,#EFF6FF,white_40%)] dark:bg-slate-950"
            dir="rtl"
        >

            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-[#1D4ED8] font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-[#94A3B8]">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Sticky Header — minimal */}
            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-500",
                scrollY > 10
                    ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm border-b border-slate-100/50 dark:border-slate-800/50"
                    : "bg-transparent border-b border-transparent"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#1E40AF] flex items-center justify-center text-white shadow-sm">
                                <ShieldCheck {...iconProps} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">مركز القيادة</h1>
                                <p className="text-[9px] font-medium text-[#64748B] dark:text-slate-500 leading-none mt-0.5">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-[#1D4ED8] dark:text-[#38BDF8] font-medium text-[9px] tabular-nums border border-slate-100 dark:border-slate-700">
                                <Clock {...miniIconProps} className="inline ml-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            {/* Snapshot: 3 big numbers */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-bold text-slate-400">نظرة سريعة</span>
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        مباشر
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2">
                                            <Users size={16} className="text-[#1D4ED8]" strokeWidth={1.5} />
                                        </div>
                                        <div className="text-lg font-bold text-[#0F172A] dark:text-white tabular-nums">{stats.totalEnrollments || 0}</div>
                                        <div className="text-[8px] font-medium text-slate-400 mt-0.5">نشط</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-2">
                                            <TrendingUp size={16} className="text-emerald-600" strokeWidth={1.5} />
                                        </div>
                                        <div className="text-lg font-bold text-[#0F172A] dark:text-white tabular-nums">{(stats.monthRevenue || 0).toLocaleString()}</div>
                                        <div className="text-[8px] font-medium text-slate-400 mt-0.5">شهري</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-2">
                                            <Calendar size={16} className="text-amber-600" strokeWidth={1.5} />
                                        </div>
                                        <div className="text-lg font-bold text-[#0F172A] dark:text-white tabular-nums">{todaySessions}</div>
                                        <div className="text-[8px] font-medium text-slate-400 mt-0.5">حصص</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick actions mini */}
                            <div className="grid grid-cols-2 gap-3">
                                <QuickAction icon={UserPlus} label="طالب جديد" color="#1D4ED8" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <QuickAction icon={FilePlus} label="فاتورة" color="#059669" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <QuickAction icon={Calendar} label="الجدول" color="#0284C7" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <QuickAction icon={Megaphone} label="إعلان" color="#D97706" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
                            </div>

                            {/* Progress bar */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <Award {...miniIconProps} className="text-emerald-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">معدل الإنجاز اليوم</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 tabular-nums">{completionRate}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                        className="h-full rounded-full bg-gradient-to-l from-[#1D4ED8] to-[#2563EB]"
                                    />
                                </div>
                                <p className="text-[8px] font-medium text-slate-400 mt-2">{completedSessions} من {todaySessions} حصة</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'operations' && (
                        <motion.div
                            key="operations"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-3"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <NavButton label="إضافة طالب" subtext="تسجيل جديد" icon={UserPlus} color="#1D4ED8" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <NavButton label="إصدار فاتورة" subtext="فاتورة مالية" icon={FilePlus} color="#059669" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <NavButton label="الجدول" subtext="المواعيد" icon={Calendar} color="#0284C7" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <NavButton label="إعلان" subtext="بث عام" icon={Megaphone} color="#D97706" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
                                <NavButton label="المعلمات" subtext="البيانات" icon={Users} color="#7C3AED" onClick={() => { triggerHaptic('medium'); navigate('/teachers'); }} />
                                <NavButton label="التقارير" subtext="إحصائيات" icon={Banknote} color="#F59E0B" onClick={() => { triggerHaptic('medium'); navigate('/reports'); }} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                                    <div>
                                        <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">الإيرادات</span>
                                        <p className="text-base font-bold text-[#0F172A] dark:text-white mt-1 tabular-nums">{(stats.monthRevenue || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                                        <TrendingUp size={18} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 border border-rose-100 dark:border-rose-900/30">
                                    <div>
                                        <span className="text-[8px] font-bold text-rose-500 dark:text-rose-400">المصروفات</span>
                                        <p className="text-base font-bold text-[#0F172A] dark:text-white mt-1 tabular-nums">{(stats.monthExpenses || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm">
                                        <TrendingDown size={18} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => { triggerHaptic('light'); navigate('/finance'); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full h-11 rounded-2xl bg-gradient-to-l from-[#1D4ED8] to-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Wallet {...smallIconProps} />
                                    لوحة المالية كاملة
                                    <ChevronLeft {...miniIconProps} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                        <motion.div
                            key="alerts"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            {lowBalanceCount > 0 ? (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm shrink-0">
                                            <Bell size={16} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xs text-[#0F172A] dark:text-white">إشعار مالي</h3>
                                            <p className="text-[10px] font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
                                                يوجد {lowBalanceCount} طلاب بحاجة تجديد اشتراك
                                            </p>
                                            <motion.button
                                                onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-3 h-8 px-4 rounded-xl bg-[#1D4ED8] text-white text-[9px] font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                                            >
                                                <UserPlus {...miniIconProps} />
                                                عرض الطلاب
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center mx-auto mb-3">
                                        <Bell size={22} className="text-emerald-600" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">لا توجد تنبيهات</p>
                                    <p className="text-[9px] font-medium text-[#64748B] mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                                </div>
                            )}

                            <div className="relative rounded-3xl p-5 shadow-sm overflow-hidden bg-gradient-to-br from-[#1D4ED8] to-[#1E40AF]">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <Headphones size={16} className="text-white" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">الدعم الفني</h4>
                                            <p className="text-[8px] font-medium text-white/60">متاح 24/7</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full h-11 rounded-2xl bg-white/15 backdrop-blur-md text-white text-[10px] font-bold flex items-center justify-center gap-2 border border-white/10 hover:bg-white/25 transition-all"
                                    >
                                        <Headphones {...smallIconProps} />
                                        تواصل مع الدعم
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Glass Tab Bar */}
            <div className="fixed bottom-0 right-0 left-0 z-[200] px-4 pb-3 pointer-events-none">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full px-2 py-1.5 pointer-events-auto">
                    <div className="flex items-center justify-around">
                        {tabs.map(tab => (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                whileTap={{ scale: 0.92 }}
                                className={cn(
                                    "relative flex-1 py-2 px-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300",
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="mobile-tab-indicator"
                                        className="absolute -top-1.5 right-[20%] left-[20%] h-0.5 bg-[#1D4ED8] dark:bg-white rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                    activeTab === tab.id
                                        ? "bg-[#1D4ED8] dark:bg-white text-white dark:text-[#1D4ED8] shadow-sm"
                                        : "text-slate-400 dark:text-slate-500"
                                )}>
                                    <tab.icon size={16} strokeWidth={1.5} />
                                </div>
                                <span className={cn(
                                    "text-[8px] font-medium transition-colors",
                                    activeTab === tab.id ? "text-[#1D4ED8] dark:text-white" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {tab.label}
                                </span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="absolute -top-0.5 left-1/3 min-w-[14px] h-[14px] bg-gradient-to-br from-rose-500 to-rose-600 text-white font-bold text-[6px] flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 rounded-full shadow-sm">
                                        {tab.badge}
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label, color, onClick }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; color: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-all hover:shadow-md"
    >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12`, color }}>
            <Icon size={16} strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">{label}</span>
    </motion.button>
);

const NavButton = ({ label, subtext, icon: Icon, color, onClick }: { label: string; subtext: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; color: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-all w-full hover:shadow-md"
    >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}12`, color }}>
            <Icon {...iconProps} />
        </div>
        <span className="text-[10px] font-bold text-[#0F172A] dark:text-white leading-none mt-1">{label}</span>
        <span className="text-[8px] font-medium text-[#64748B] dark:text-slate-500">{subtext}</span>
    </motion.button>
);
