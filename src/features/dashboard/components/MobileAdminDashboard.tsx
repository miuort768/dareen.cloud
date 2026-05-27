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

    const headerBlur = scrollY > 10 ? 'bg-white dark:bg-slate-950 shadow-sm' : 'bg-white dark:bg-slate-950';

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pb-4 text-right overflow-x-hidden relative bg-[#F8FAFC] dark:bg-slate-950"
            dir="rtl"
        >

            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-[#2563EB] font-normal text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-[#64748B]">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Sticky Header */}
            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-300",
                headerBlur,
                "border-b border-slate-100 dark:border-slate-800/50"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">مركز القيادة</h1>
                                <p className="text-[9px] font-medium text-[#64748B] dark:text-slate-500">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-slate-800 text-[#2563EB] dark:text-[#38BDF8] font-medium text-[9px] tabular-nums">
                                <Clock size={12} className="inline ml-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 pb-3">
                    <div className="flex bg-[#F1F5F9] dark:bg-slate-800/60 rounded-2xl p-1 gap-1">
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
                                    "flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-200 relative rounded-xl",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-slate-900 shadow-sm text-[#2563EB] dark:text-[#38BDF8] font-bold"
                                        : "text-[#64748B] dark:text-slate-500 font-medium hover:text-[#0F172A] dark:hover:text-slate-300"
                                )}
                            >
                                <tab.icon size={14} />
                                <span className="text-[9px]">{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] bg-[#22C55E] text-white font-bold text-[7px] flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 rounded-full">
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
                                    color="#2563EB"
                                    onClick={() => { triggerHaptic('light'); navigate('/students'); }}
                                />
                                <QuickStatCard
                                    icon={BookOpen}
                                    label="الاشتراكات"
                                    value={stats.totalEnrollments}
                                    color="#22C55E"
                                    onClick={() => { triggerHaptic('light'); navigate('/schedule'); }}
                                />
                                <QuickStatCard
                                    icon={TrendingUp}
                                    label="صافي الربح"
                                    value={`${(stats.totalNetProfit || 0).toLocaleString()}`}
                                    color="#8B5CF6"
                                    onClick={() => { triggerHaptic('light'); handleTabChange('finance'); }}
                                />
                            </div>

                            {/* Today's Progress */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] dark:bg-emerald-900/30 flex items-center justify-center">
                                            <Award size={16} className="text-[#22C55E]" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-[#22C55E] dark:text-emerald-400">اليوم</span>
                                            <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">معدل تنفيذ الحصص</h3>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-[#22C55E]">{completionRate}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#F1F5F9] dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(completionRate, 100)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-[#2563EB]"
                                    />
                                </div>
                                <p className="text-[9px] font-medium text-[#64748B] mt-2">تم تنفيذ {completedSessions} من {todaySessions} حصة</p>
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 gap-3">
                                <QuickLink icon={UserPlus} label="طالب جديد" color="#2563EB" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <QuickLink icon={FilePlus} label="فاتورة" color="#22C55E" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <QuickLink icon={Calendar} label="الجدول" color="#8B5CF6" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <QuickLink icon={Megaphone} label="إعلان" color="#F97316" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
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
                            <p className="text-[10px] font-bold text-[#64748B] px-1">الإجراءات السريعة</p>
                            <div className="grid grid-cols-2 gap-3">
                                <NavButton label="إضافة طالب جديد" subtext="تسجيل جديد" icon={UserPlus} color="#2563EB" onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} />
                                <NavButton label="إصدار فاتورة" subtext="فاتورة مالية" icon={FilePlus} color="#22C55E" onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} />
                                <NavButton label="الجدول الاسبوعي" subtext="إدارة المواعيد" icon={Calendar} color="#8B5CF6" onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} />
                                <NavButton label="إعلان عام" subtext="بث عام" icon={Megaphone} color="#F97316" onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} />
                                <NavButton label="المعلمات" subtext="إدارة البيانات" icon={Users} color="#38BDF8" onClick={() => { triggerHaptic('medium'); navigate('/teachers'); }} />
                                <NavButton label="التقارير" subtext="إحصائيات" icon={Banknote} color="#F59E0B" onClick={() => { triggerHaptic('medium'); navigate('/reports'); }} />
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
                            <p className="text-[10px] font-bold text-[#64748B] px-1">المؤشرات المالية</p>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                    <div>
                                        <span className="text-[9px] font-bold text-[#22C55E] dark:text-emerald-400">الإيرادات</span>
                                        <p className="text-lg font-bold text-[#0F172A] dark:text-white mt-1 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white shadow-sm">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                                    <div>
                                        <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400">المصروفات</span>
                                        <p className="text-lg font-bold text-[#0F172A] dark:text-white mt-1 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-sm">
                                        <TrendingDown size={20} />
                                    </div>
                                </div>

                                <button
                                    onClick={() => { triggerHaptic('light'); navigate('/finance'); }}
                                    className="w-full h-11 rounded-2xl bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:bg-[#1D4ED8]"
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
                            <p className="text-[10px] font-bold text-[#64748B] px-1">التنبيهات</p>

                            {lowBalanceCount > 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-rose-100 dark:border-rose-900/30">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-sm shrink-0">
                                            <Bell size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xs text-[#0F172A] dark:text-white">إشعار مالي</h3>
                                            <p className="text-[10px] font-medium text-[#64748B] dark:text-slate-400 mt-1">
                                                يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                                            </p>
                                            <button
                                                onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                                className="mt-3 h-8 px-4 rounded-xl bg-[#2563EB] text-white text-[9px] font-bold active:scale-95 transition-all inline-flex items-center gap-1.5 hover:bg-[#1D4ED8]"
                                            >
                                                <UserPlus size={12} />
                                                عرض الطلاب
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                                        <Bell size={24} className="text-[#22C55E]" />
                                    </div>
                                    <p className="text-xs font-bold text-[#0F172A] dark:text-white">لا توجد تنبيهات</p>
                                    <p className="text-[9px] font-medium text-[#64748B] mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                                </div>
                            )}

                            {/* Support Card */}
                            <div className="bg-[#2563EB] rounded-2xl p-5 shadow-sm overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Headphones size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">الدعم الفني</h4>
                                            <p className="text-[9px] font-medium text-white/60">متاح 24/7</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                                        className="w-full h-11 rounded-2xl bg-white text-[#2563EB] text-[10px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm hover:bg-[#F1F5F9]"
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


const QuickStatCard = ({ icon: Icon, label, value, color, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; color: string; onClick?: () => void }) => (
    <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-95 transition-all"
    >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-sm" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={18} />
        </div>
        <span className="text-lg font-bold text-[#0F172A] dark:text-white leading-none tabular-nums">{value ?? 0}</span>
        <span className="text-[9px] font-medium text-[#64748B] dark:text-slate-500 mt-1">{label}</span>
    </motion.div>
);

const NavButton = ({ label, subtext, icon: Icon, color, onClick }: { label: string; subtext: string; icon: React.ComponentType<{ size?: number }>; color: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-all w-full"
    >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-[#0F172A] dark:text-white leading-none mt-1">{label}</span>
        <span className="text-[8px] font-medium text-[#64748B] dark:text-slate-500">{subtext}</span>
    </motion.button>
);

const QuickLink = ({ icon: Icon, label, color, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; color: string; onClick?: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
    >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={16} />
        </div>
        <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">{label}</span>
    </motion.button>
);
