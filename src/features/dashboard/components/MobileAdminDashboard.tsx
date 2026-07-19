import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Home, FilePlus, Wallet, Bell, Sparkles, Loader2 } from 'lucide-react';
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

const miniIconProps = { size: 12, strokeWidth: 1.5 };
const smallIconProps = { size: 14, strokeWidth: 1.5 };
const iconProps = { size: 18, strokeWidth: 1.5 };

export const MobileAdminDashboard = ({
    stats,
    lowBalanceStudents,
    onRefresh
}: MobileAdminDashboardProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'home' | 'quick' | 'finance' | 'alerts'>('home');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
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
            className="pb-4 text-start overflow-x-hidden relative bg-background dark:bg-background"
            dir="rtl"
        >
            <div
                className="overflow-hidden flex items-center justify-center w-full transition-all duration-300 ease-out"
                style={{ height: isRefreshing ? 50 : pullDistance }}
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
            </div>

            <div className={cn(
                "sticky top-0 z-[100] transition-all duration-500",
                headerScrolled
                    ? "bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-soft border-b border-border/50"
                    : "bg-white dark:bg-background border-b border-transparent"
            )}>
                <div className="px-4 pt-3 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-card bg-primary flex items-center justify-center text-on-primary shadow-soft shadow-info/40">
                                <ShieldCheck {...iconProps} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">مركز القيادة</h1>
                                <p className="text-micro font-medium text-muted">
                                    {format(new Date(), 'eeee, d MMMM', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1.5 rounded-card bg-surface/70 backdrop-blur-sm text-primary font-medium text-micro tabular-nums">
                                <Clock {...miniIconProps} className="inline me-1" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-3">
                    <div className="flex bg-surface dark:bg-card rounded-card p-1 gap-1 shadow-soft">
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
                                    "flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl active:scale-96",
                                    activeTab === tab.id
                                        ? "bg-card shadow-soft text-primary font-bold"
                                        : "text-dim font-medium hover:text-main dark:hover:text-dim"
                                )}
                                aria-label={tab.label}
                            >
                                <tab.icon {...smallIconProps} />
                                <span className="text-micro">{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="absolute -top-1 -end-1 min-w-[16px] h-[16px] bg-success text-on-primary font-bold text-micro flex items-center justify-center px-1 border-2 border-white dark:border-border border-border rounded-full shadow-soft">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 pt-3 pb-4 space-y-4">
                {activeTab === 'home' && (
                    <AdminHomeTab stats={stats} completionRate={completionRate} completedSessions={completedSessions} todaySessions={todaySessions} onTabChange={handleTabChange} />
                )}
                {activeTab === 'quick' && <AdminQuickTab />}
                {activeTab === 'finance' && <AdminFinanceTab stats={stats} />}
                {activeTab === 'alerts' && <AdminAlertsTab lowBalanceCount={lowBalanceCount} onRefresh={onRefresh} />}
            </div>
        </div>
    );
};
