import { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Calendar, Megaphone, ShieldCheck, 
    Headphones, Bell, FilePlus, UserPlus, TrendingUp, 
    TrendingDown, Award, Star, Loader2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../../lib/haptics';

interface MobileAdminDashboardProps {
    stats: any;
    lowBalanceStudents: any[];
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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1005);
        return () => clearInterval(timer);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    
    // Academic calculations
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;

    // Pull-to-refresh handlers
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
            // Apply logarithmic resistance to pulling
            const resistance = Math.min(diff * 0.4, 90);
            setPullDistance(resistance);
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            setPullDistance(50); // Keep it slightly visible during loading
            triggerHaptic('medium');
            
            if (onRefresh) {
                try {
                    await onRefresh();
                } catch (e) {
                    console.error("Refresh failed", e);
                }
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

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pb-24 text-right overflow-x-hidden relative"
            dir="rtl"
        >
            
            {/* ═══════════════ PULL TO REFRESH SPINNER INDICATOR ═══════════════ */}
            <motion.div 
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950 w-full"
            >
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                    {isRefreshing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>جاري تحديث البيانات...</span>
                        </>
                    ) : pullDistance > 55 ? (
                        <>
                            <Sparkles size={16} className="animate-pulse" />
                            <span>أفلت للتحديث الآن</span>
                        </>
                    ) : (
                        <span>اسحب للأسفل للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* ═══════════════ 1. STICKY APP-STYLE GRADIENT HEADER ═══════════════ */}
            <div className="sticky top-0 z-[100] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] dark:from-slate-950 dark:to-slate-900 p-4 rounded-none shadow-lg border-b-2 border-gray-950 dark:border-slate-800 transition-all">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center text-white border border-white/20 shadow-sm">
                            <ShieldCheck size={20} className="stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="text-xs md:text-sm font-black text-white leading-tight">
                                مرحباً... المدير العام 👋
                            </h1>
                            <p className="text-[9px] md:text-[10px] font-bold text-white/80 mt-0.5">
                                لوحة الإدارة العليا • {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                            </p>
                        </div>
                    </div>

                    {/* Clock Badge */}
                    <div className="px-2 py-1 bg-white/10 border border-white/10 rounded-none text-white font-black text-[9px] md:text-[10px] tabular-nums">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                </div>

                {/* ═══════════════ STICKY TABS ROW ═══════════════ */}
                <div className="flex justify-between items-center gap-1.5 mt-4 pt-1.5 border-t border-white/10">
                    <TabButton 
                        label="الرئيسية" 
                        active={activeTab === 'home'} 
                        icon={ShieldCheck} 
                        onClick={() => handleTabChange('home')} 
                    />
                    <TabButton 
                        label="سريع" 
                        active={activeTab === 'quick'} 
                        icon={FilePlus} 
                        onClick={() => handleTabChange('quick')} 
                    />
                    <TabButton 
                        label="مالية" 
                        active={activeTab === 'finance'} 
                        icon={TrendingUp} 
                        onClick={() => handleTabChange('finance')} 
                    />
                    <TabButton 
                        label="إشعارات" 
                        active={activeTab === 'alerts'} 
                        icon={Bell} 
                        badgeCount={lowBalanceCount}
                        onClick={() => handleTabChange('alerts')} 
                    />
                </div>
            </div>

            {/* ═══════════════ TAB CONTENTS AREA ═══════════════ */}
            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div
                            key="home-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Quick Stats Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <QuickStatCard 
                                    icon={Users} 
                                    label="الطلاب" 
                                    value={stats.studentsCount} 
                                    gradientClasses="from-[#6366F1] to-[#4F46E5]" 
                                    onClick={() => { triggerHaptic('light'); navigate('/students'); }}
                                />
                                <QuickStatCard 
                                    icon={BookOpen} 
                                    label="الاشتراكات" 
                                    value={stats.totalEnrollments} 
                                    gradientClasses="from-[#10B981] to-[#059669]" 
                                    onClick={() => { triggerHaptic('light'); navigate('/schedule'); }}
                                />
                                <QuickStatCard 
                                    icon={Star} 
                                    label="صافي الربح" 
                                    value={`${(stats.totalNetProfit || 0).toLocaleString()} ج.م`} 
                                    gradientClasses="from-[#EC4899] to-[#BE185D]" 
                                    onClick={() => { triggerHaptic('light'); handleTabChange('finance'); }}
                                />
                            </div>

                            {/* Today's Class Progress */}
                            <div className="bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-slate-800 rounded-none p-5 text-slate-900 dark:text-white shadow-sm relative overflow-hidden group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(251,113,133,0.12)] transition-all">
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-none blur-2xl -translate-x-1/2 translate-y-1/2" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-widest">
                                                النشاط الأكاديمي اليومي
                                            </span>
                                            <h3 className="text-xs font-black mt-2 text-slate-800 dark:text-slate-200">معدل تنفيذ الحصص</h3>
                                        </div>
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-none flex items-center justify-center shrink-0 border border-gray-950 dark:border-slate-850 shadow-sm">
                                            <Award size={20} className="stroke-[2.5]" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold opacity-90">
                                            <span>تم تنفيذ {completedSessions} من {todaySessions} حصة</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
                                        </div>
                                        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <div 
                                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-none transition-all duration-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'quick' && (
                        <motion.div
                            key="quick-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <NavButton 
                                label="إضافة طالب جديد" 
                                subtext="تسجيل جديد" 
                                icon={UserPlus} 
                                gradientClasses="from-[#6366F1] to-[#4F46E5]" 
                                onClick={() => { triggerHaptic('medium'); navigate('/students?action=new'); }} 
                            />
                            <NavButton 
                                label="إصدار فاتورة" 
                                subtext="فاتورة مالية" 
                                icon={FilePlus} 
                                gradientClasses="from-[#10B981] to-[#059669]" 
                                onClick={() => { triggerHaptic('medium'); navigate('/student-invoices?action=new'); }} 
                            />
                            <NavButton 
                                label="الجدول الاسبوعي" 
                                subtext="إدارة المواعيد" 
                                icon={Calendar} 
                                gradientClasses="from-[#8B5CF6] to-[#7C3AED]" 
                                onClick={() => { triggerHaptic('medium'); navigate('/schedule'); }} 
                            />
                            <NavButton 
                                label="إعلان عام" 
                                subtext="بث عام" 
                                icon={Megaphone} 
                                gradientClasses="from-[#EC4899] to-[#BE185D]" 
                                onClick={() => { triggerHaptic('medium'); navigate('/announcements?action=new'); }} 
                            />
                        </motion.div>
                    )}

                    {activeTab === 'finance' && (
                        <motion.div
                            key="finance-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* System Financial Metrics */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-none border-2 border-gray-950 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(251,113,133,0.12)] transition-all">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <TrendingUp className="text-[#10B981] stroke-[2.5]" size={18} />
                                    <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white">السيولة النقدية والمصاريف</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-4 rounded-none border border-emerald-100 dark:border-emerald-900/30">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">إجمالي الإيرادات</span>
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        </div>
                                        <p className="text-base font-black text-emerald-600 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                                    </div>

                                    <div className="bg-rose-50/20 dark:bg-rose-950/10 p-4 rounded-none border border-rose-100 dark:border-rose-900/30">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">إجمالي المصروفات</span>
                                            <TrendingDown size={14} className="text-rose-500" />
                                        </div>
                                        <p className="text-base font-black text-rose-600 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                        <motion.div
                            key="alerts-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Urgent Notifications */}
                            {lowBalanceCount > 0 ? (
                                <div className="bg-rose-500/10 border-2 border-dashed border-rose-200 dark:border-rose-900/30 p-4 rounded-none flex items-center justify-between gap-4 animate-pulse">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-rose-500 text-white rounded-none flex items-center justify-center shrink-0">
                                            <Bell size={18} className="animate-bounce" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-xs text-rose-600 dark:text-rose-400">إشعار مالي عاجل!</h3>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                                يوجد {lowBalanceCount} طلاب انتهى أو قارب رصيدهم على الانتهاء.
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                        className="px-4 py-2 bg-rose-600 text-white font-black text-[9px] uppercase tracking-widest rounded-none hover:bg-rose-700 active:scale-95 transition-all shadow-md shrink-0"
                                    >
                                        تحصيل
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-none text-slate-400">
                                    <Bell className="mx-auto mb-2 opacity-50" size={24} />
                                    <p className="text-[11px] font-bold">لا يوجد تنبيهات أو إشعارات مالية معلقة حالياً</p>
                                </div>
                            )}

                            {/* Support Support Support */}
                            <div className="bg-[#5c4fb1] dark:bg-[#4a3f9e] p-5 rounded-none border-2 border-gray-950 dark:border-slate-800 text-white flex flex-col items-center justify-between gap-6 relative overflow-hidden shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-none blur-2xl -translate-x-1/2 translate-y-1/2" />
                                <div className="text-center relative z-10 w-full">
                                    <h4 className="text-xs font-black mb-1">هل تواجه أي مشاكل؟</h4>
                                    <p className="text-[9px] font-bold opacity-80 leading-tight">فريق الدعم الفني لمدير النظام متاح لخدمتك فوراً</p>
                                </div>
                                <button 
                                    onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                                    className="bg-white text-[#5c4fb1] border-2 border-gray-950 px-5 py-2.5 rounded-none font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-transform active:scale-95 shadow-md w-full"
                                >
                                    <Headphones size={12} />
                                    تواصل مع الدعم الفني
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

/* Internal Tab Button Sub-component */
interface TabButtonProps {
    label: string;
    active: boolean;
    icon: any;
    onClick: () => void;
    badgeCount?: number;
}
const TabButton = ({ label, active, icon: Icon, onClick, badgeCount }: TabButtonProps) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex-1 py-1.5 px-1 rounded-none border-b-2 flex flex-col items-center justify-center gap-1 transition-all relative",
            active 
                ? "border-white text-white font-black bg-white/10 scale-105" 
                : "border-transparent text-white/60 hover:text-white"
        )}
    >
        <Icon size={16} className={cn(active ? "opacity-100 scale-110" : "opacity-75")} />
        <span className="text-[9px] tracking-tight truncate max-w-full font-bold">{label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white font-black text-[8px] flex items-center justify-center px-0.5 border border-white">
                {badgeCount}
            </span>
        )}
    </button>
);

/* Quick Stat Card Sub-component with customized gradient backgrounds */
const QuickStatCard = ({ icon: Icon, label, value, gradientClasses, onClick }: any) => {
    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-900 py-4 px-2 rounded-none border-2 border-gray-950 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:scale-95 transition-all"
        >
            <div className={cn("w-9 h-9 rounded-none flex items-center justify-center mb-1.5 bg-gradient-to-br text-white border border-gray-950 dark:border-slate-850 shadow-sm shrink-0", gradientClasses)}>
                <Icon size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-none truncate w-full group-hover:text-rose-500 transition-colors">{value}</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1">{label}</span>
        </div>
    );
};

/* Navigation Button Sub-component */
const NavButton = ({ label, subtext, icon: Icon, gradientClasses, onClick }: any) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-slate-900 p-4 rounded-none border-2 border-gray-950 dark:border-slate-800 flex flex-col items-center justify-center gap-1.5 transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:scale-95 group w-full"
    >
        <div className={cn("w-9 h-9 rounded-none flex items-center justify-center text-white shadow-sm bg-gradient-to-br border border-gray-950 dark:border-slate-850 group-hover:scale-110 transition-transform", gradientClasses)}>
            <Icon size={16} className="stroke-[2.5]" />
        </div>
        <span className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-rose-500 transition-colors">{label}</span>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-0.5">{subtext}</span>
    </button>
);
