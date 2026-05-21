import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Calendar, Megaphone, ShieldCheck, 
    Headphones, Bell, FilePlus, UserPlus, TrendingUp, 
    TrendingDown, Award, Loader2, Sparkles,
    ChevronLeft, Wallet, Clock, Home, Banknote
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

    const headerBlur = scrollY > 10 ? 'bg-white/95 dark:bg-slate-950/95 shadow-md' : 'bg-white/80 dark:bg-slate-950/80 shadow-sm';

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pb-4 text-right overflow-x-hidden relative bg-gradient-to-b from-slate-50 to-white dark:from-[#020617] dark:to-slate-950"
            dir="rtl"
        >

            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-indigo-500 font-bold text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-slate-400">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Sticky App-Style Header */}
            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-300",
                headerBlur,
                "backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">مركز القيادة</h1>
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400 font-black text-[9px] tabular-nums">
                                <Clock size={12} className="inline ml-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* iOS-style Capsule Tabs */}
                <div className="px-4 pb-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1 gap-1">
                        {[
                            { id: 'home' as const, label: 'الرئيسية', icon: Home },
                            { id: 'quick' as const, label: 'إجراءات', icon: FilePlus },
                            { id: 'finance' as const, label: 'المالية', icon: Wallet },
                            { id: 'alerts' as const, label: 'التنبيهات', icon: Bell, badge: lowBalanceCount },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 relative",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400 font-black"
                                        : "text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                <tab.icon size={14} />
                                <span className="text-[9px] tracking-tight">{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] rounded-full bg-rose-500 text-white font-black text-[7px] flex items-center justify-center px-1 border-2 border-white dark:border-slate-900">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
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
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <QuickStatCard
                                    icon={Users}
                                    label="الطلاب"
                                    value={stats.studentsCount}
                                    gradient="from-[#6366F1] to-[#4F46E5]"
                                    onClick={() => { triggerHaptic('light'); navigate('/students'); }}
                                />
                                <QuickStatCard
                                    icon={BookOpen}
                                    label="الاشتراكات"
                                    value={stats.totalEnrollments}
                                    gradient="from-[#10B981] to-[#059669]"
                                    onClick={() => { triggerHaptic('light'); navigate('/schedule'); }}
                                />
                                <QuickStatCard
                                    icon={TrendingUp}
                                    label="صافي الربح"
                                    value={`${(stats.totalNetProfit || 0).toLocaleString()}`}
                                    gradient="from-[#EC4899] to-[#BE185D]"
                                    onClick={() => { triggerHaptic('light'); handleTabChange('finance'); }}
                                />
                            </div>

                            {/* Today's Progress */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <Award size={16} />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">اليوم</span>
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white">معدل تنفيذ الحصص</h3>
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-emerald-500">{completionRate}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 mt-2">تم تنفيذ {completedSessions} من {todaySessions} حصة</p>
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 gap-3">
                                <QuickLink icon={UserPlus} label="طالب جديد" gradient="from-indigo-500 to-indigo-600" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <QuickLink icon={FilePlus} label="فاتورة" gradient="from-emerald-500 to-emerald-600" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <QuickLink icon={Calendar} label="الجدول" gradient="from-violet-500 to-violet-600" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <QuickLink icon={Megaphone} label="إعلان" gradient="from-rose-500 to-rose-600" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'quick' && (
                        <motion.div
                            key="quick"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الإجراءات السريعة</p>
                            <div className="grid grid-cols-2 gap-3">
                                <NavButton label="إضافة طالب جديد" subtext="تسجيل جديد" icon={UserPlus} gradient="from-[#6366F1] to-[#4F46E5]" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <NavButton label="إصدار فاتورة" subtext="فاتورة مالية" icon={FilePlus} gradient="from-[#10B981] to-[#059669]" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <NavButton label="الجدول الاسبوعي" subtext="إدارة المواعيد" icon={Calendar} gradient="from-[#8B5CF6] to-[#7C3AED]" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <NavButton label="إعلان عام" subtext="بث عام" icon={Megaphone} gradient="from-[#EC4899] to-[#BE185D]" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
                                <NavButton label="المعلمات" subtext="إدارة البيانات" icon={Users} gradient="from-[#F59E0B] to-[#D97706]" onClick={() => { triggerHaptic('medium'); navigate('/teachers'); }} />
                                <NavButton label="التقارير" subtext="إحصائيات" icon={Banknote} gradient="from-[#14B8A6] to-[#0D9488]" onClick={() => { triggerHaptic('medium'); navigate('/reports'); }} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المؤشرات المالية</p>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                                    <div>
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">الإيرادات</span>
                                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-rose-50/50 dark:from-rose-950/20 dark:to-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
                                    <div>
                                        <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">المصروفات</span>
                                        <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-1 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                        <TrendingDown size={20} />
                                    </div>
                                </div>

                                <button
                                    onClick={() => { triggerHaptic('light'); navigate('/finance'); }}
                                    className="w-full h-11 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                >
                                    <Wallet size={14} />
                                    لوحة المالية كاملة
                                    <ChevronLeft size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                        <motion.div
                            key="alerts"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التنبيهات</p>

                            {lowBalanceCount > 0 ? (
                                <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
                                            <Bell size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-xs text-rose-600 dark:text-rose-400">إشعار مالي عاجل</h3>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                                                يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                                            </p>
                                            <button
                                                onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                                className="mt-3 h-8 px-4 bg-rose-600 text-white text-[9px] font-black rounded-xl active:scale-95 transition-all inline-flex items-center gap-1.5"
                                            >
                                                <UserPlus size={12} />
                                                عرض الطلاب
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Bell size={24} className="text-emerald-500" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">لا توجد تنبيهات</p>
                                    <p className="text-[9px] font-bold text-slate-300 mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                                </div>
                            )}

                            {/* Support Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-indigo-500/20 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <Headphones size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white">الدعم الفني</h4>
                                            <p className="text-[9px] font-bold text-white/60">متاح 24/7</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                                        className="w-full h-11 bg-white text-indigo-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg"
                                    >
                                        <Headphones size={14} />
                                        تواصل مع الدعم الفني
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};


const QuickStatCard = ({ icon: Icon, label, value, gradient, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; gradient: string; onClick?: () => void }) => (
    <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer active:scale-95 transition-all"
    >
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br text-white shadow-lg",
            gradient
        )}>
            <Icon size={18} />
        </div>
        <span className="text-lg font-black text-slate-900 dark:text-white leading-none tabular-nums">{value ?? 0}</span>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1">{label}</span>
    </motion.div>
);

const NavButton = ({ label, subtext, icon: Icon, gradient, onClick }: { label: string; subtext: string; icon: React.ComponentType<{ size?: number }>; gradient: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all w-full"
    >
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
            gradient
        )}>
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none mt-1">{label}</span>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">{subtext}</span>
    </motion.button>
);

const QuickLink = ({ icon: Icon, label, gradient, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; gradient: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all"
    >
        <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg shrink-0",
            gradient
        )}>
            <Icon size={16} />
        </div>
        <span className="text-[11px] font-black text-slate-900 dark:text-white">{label}</span>
    </motion.button>
);
