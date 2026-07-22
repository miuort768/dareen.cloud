import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FilePlus, Wallet, Bell, Sparkles, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { triggerHaptic } from '../../../lib/haptics';
import { AdminHomeTab } from './AdminHomeTab';
import { AdminQuickTab } from './AdminQuickTab';
import { AdminFinanceTab } from './AdminFinanceTab';
import { AdminAlertsTab } from './AdminAlertsTab';

interface MobileAdminDashboardProps {
    stats: Record<string, unknown>;
    lowBalanceStudents: { id: string; studentName: string; subject: string; remainingSessions: number }[];
    onRefresh?: () => Promise<void> | void;
}

const tabs = [
    { id: 'home' as const, label: 'الرئيسية', icon: Home },
    { id: 'quick' as const, label: 'إجراءات', icon: FilePlus },
    { id: 'finance' as const, label: 'المالية', icon: Wallet },
    { id: 'alerts' as const, label: 'التنبيهات', icon: Bell },
];

const glass = "bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-white/20 dark:border-white/10";

export const MobileAdminDashboard = ({ stats, lowBalanceStudents, onRefresh }: MobileAdminDashboardProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'home' | 'quick' | 'finance' | 'alerts'>('home');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 90));
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            setPullDistance(50);
            triggerHaptic('medium');
            if (onRefresh) try { await onRefresh(); } catch (e) { console.error("Refresh failed", e); }
            setTimeout(() => { setIsRefreshing(false); setPullDistance(0); setStartY(0); triggerHaptic('light'); }, 800);
        } else { setPullDistance(0); setStartY(0); }
    };

    const handleTabChange = (tabId: 'home' | 'quick' | 'finance' | 'alerts') => {
        triggerHaptic('light');
        setActiveTab(tabId);
    };

    return (
        <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            className="min-h-screen pb-20 overflow-x-hidden relative bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background" dir="rtl"
        >
            {/* Pull to refresh */}
            <motion.div animate={{ height: isRefreshing ? 48 : pullDistance }}
                className="overflow-hidden flex items-center justify-center"
            >
                <div className="flex items-center gap-2.5 text-primary font-bold text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-muted">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Frosted Glass Header */}
            <div className={cn("sticky top-0 z-50 transition-all duration-500", glass)}>
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                <ShieldCheck size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-main leading-tight">مركز القيادة</h1>
                                <p className="text-[11px] font-medium text-muted">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm text-primary font-bold text-[11px] tabular-nums shadow-sm border border-white/20">
                            <Clock size={11} className="inline ms-1" />
                            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pt-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'home' && <AdminHomeTab stats={stats} completionRate={completionRate} completedSessions={completedSessions} todaySessions={todaySessions} onTabChange={handleTabChange} />}
                        {activeTab === 'quick' && <AdminQuickTab />}
                        {activeTab === 'finance' && <AdminFinanceTab stats={stats} />}
                        {activeTab === 'alerts' && <AdminAlertsTab lowBalanceCount={lowBalanceCount} onRefresh={onRefresh} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* iOS-style Bottom Tab Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50">
                {/* Safe area spacer */}
                <div className="h-2 bg-white dark:bg-black" />
                <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl shadow-black/5">
                    <div className="flex items-center justify-around px-2 py-1.5">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            const hasBadge = tab.id === 'alerts' && lowBalanceCount > 0;
                            return (
                                <motion.button key={tab.id} whileTap={{ scale: 0.9 }}
                                    onClick={() => handleTabChange(tab.id)}
                                    className="relative flex flex-col items-center gap-0.5 py-1 px-4 min-w-[64px]"
                                >
                                    <div className={cn(
                                        "rounded-xl p-1.5 transition-all duration-300 relative",
                                        isActive && "bg-gradient-to-br from-primary/10 to-purple-500/10"
                                    )}>
                                        <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5}
                                            className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                        />
                                        {hasBadge && (
                                            <span className="absolute -top-0.5 -end-0.5 min-w-[14px] h-[14px] bg-gradient-to-br from-error to-rose-500 text-white text-[8px] font-bold flex items-center justify-center px-1 rounded-full shadow-lg shadow-error/30">
                                                {lowBalanceCount > 9 ? '9+' : lowBalanceCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold transition-all duration-300",
                                        isActive ? "text-primary" : "text-muted"
                                    )}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="tab-indicator"
                                            className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
