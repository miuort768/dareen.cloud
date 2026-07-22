import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FilePlus, Wallet, Bell, Loader2, ShieldCheck } from 'lucide-react';
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

export const MobileAdminDashboard = ({ stats, lowBalanceStudents, onRefresh }: MobileAdminDashboardProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'home' | 'quick' | 'finance' | 'alerts'>('home');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startYRef = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const lowBalanceCount = lowBalanceStudents.length;
    const todaySessions = stats.todaySessions || 0;
    const completedSessions = stats.completedSessions || 0;
    const completionRate = todaySessions > 0 ? Math.round((completedSessions / todaySessions) * 100) : 0;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const el = scrollRef.current;
        if (el && el.scrollTop <= 0 && !isRefreshing) {
            startYRef.current = e.touches[0].clientY;
        }
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (startYRef.current === 0 || isRefreshing) return;
        const el = scrollRef.current;
        if (el && el.scrollTop > 0) return;
        const diff = e.touches[0].clientY - startYRef.current;
        if (diff > 0) setPullDistance(Math.min(diff * 0.4, 80));
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance > 55) {
            setIsRefreshing(true);
            setPullDistance(44);
            triggerHaptic('medium');
            if (onRefresh) try { await onRefresh(); } catch (e) { console.error("Refresh failed", e); }
            setTimeout(() => { setIsRefreshing(false); setPullDistance(0); startYRef.current = 0; triggerHaptic('light'); }, 600);
        } else {
            setPullDistance(0);
            startYRef.current = 0;
        }
    }, [pullDistance, onRefresh]);

    const handleTabChange = useCallback((tabId: 'home' | 'quick' | 'finance' | 'alerts') => {
        triggerHaptic('light');
        setActiveTab(tabId);
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
            {/* Compact Header */}
            <div className="shrink-0 bg-surface border-b border-border/50">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <ShieldCheck size={17} className="text-on-primary" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">مركز القيادة</h1>
                                <p className="text-[10px] text-dim">
                                    {format(currentTime, 'EEEE, d MMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary tabular-nums bg-primary-soft px-2 py-1 rounded-lg">
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pull to refresh */}
            <motion.div animate={{ height: isRefreshing ? 40 : pullDistance }} className="shrink-0 overflow-hidden flex items-center justify-center">
                <div className="flex items-center gap-2 text-primary text-[11px] font-bold">
                    {isRefreshing ? (
                        <><Loader2 size={14} className="animate-spin" /><span>جاري التحديث...</span></>
                    ) : pullDistance > 50 ? (
                        <span>أفلت للتحديث</span>
                    ) : (
                        <span className="text-dim">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Scrollable Content */}
            <div ref={scrollRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                        {activeTab === 'home' && <AdminHomeTab stats={stats} completionRate={completionRate} completedSessions={completedSessions} todaySessions={todaySessions} onTabChange={handleTabChange} />}
                        {activeTab === 'quick' && <AdminQuickTab />}
                        {activeTab === 'finance' && <AdminFinanceTab stats={stats} />}
                        {activeTab === 'alerts' && <AdminAlertsTab lowBalanceCount={lowBalanceCount} onRefresh={onRefresh} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Tab Bar — iOS-style with safe area */}
            <div className="shrink-0 bg-surface border-t border-border/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <div className="flex items-center justify-around px-1 py-1">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        const hasBadge = tab.id === 'alerts' && lowBalanceCount > 0;
                        return (
                            <button key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "relative flex flex-col items-center gap-0.5 py-2 px-5 min-w-[60px] rounded-xl transition-colors",
                                    isActive ? "text-primary" : "text-dim active:bg-hover"
                                )}
                                aria-label={tab.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div className="relative">
                                    <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                                    {hasBadge && (
                                        <span className="absolute -top-1 -end-1.5 min-w-[14px] h-[14px] bg-error text-on-error text-[8px] font-bold flex items-center justify-center px-1 rounded-full">
                                            {lowBalanceCount > 9 ? '9+' : lowBalanceCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold">{tab.label}</span>
                                {isActive && (
                                    <motion.div layoutId="mobile-tab-indicator"
                                        className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-primary"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
