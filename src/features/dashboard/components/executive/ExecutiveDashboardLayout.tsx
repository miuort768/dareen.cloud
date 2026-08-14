import { memo } from 'react';
import { motion } from 'framer-motion';
import { useExecutiveDashboard } from '../../hooks/useExecutiveDashboard';
import { BusinessPulse } from './BusinessPulse';
import { ExecutiveKPI } from './ExecutiveKPI';
import { ExecutiveAlerts } from './ExecutiveAlerts';
import { UpcomingTimeline } from './UpcomingTimeline';
import { PresenceGrid } from './PresenceGrid';
import { SystemStatus } from './SystemStatus';
import { ActivityFeed } from './ActivityFeed';
import { InsightsPanel } from './InsightsPanel';
import { QuickActionsGrid } from './QuickActionsGrid';
import { SectionErrorBoundary } from '../../../../shared/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.div variants={itemVariants} className={cn("w-full", className)}>
        <SectionErrorBoundary name="exec-section" compact>
            {children}
        </SectionErrorBoundary>
    </motion.div>
);

export const ExecutiveDashboard = memo(function ExecutiveDashboard() {
    const { data, isLoading, error, refetch } = useExecutiveDashboard();

    if (isLoading) {
        return (
            <div className="space-y-6" dir="rtl">
                <Skeleton className="h-[120px] rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-3"><Skeleton className="h-[200px] rounded-2xl" /></div>
                    <div className="lg:col-span-9"><Skeleton className="h-[200px] rounded-2xl" /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={`skel-${i}`} className="h-[280px] rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data || !data.pulse || !data.stats) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error-soft flex items-center justify-center">
                        <AlertCircle size={28} className="text-error" />
                    </div>
                    <h2 className="text-lg font-bold text-main mb-2">تعذر تحميل البيانات</h2>
                    <p className="text-sm text-muted mb-4">حدث خطأ أثناء تحميل بيانات لوحة القيادة</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                        <RefreshCw size={14} />
                        إعادة المحاولة
                    </Button>
                </div>
            </div>
        );
    }

    const { stats, alerts = { critical: [], warning: [], reminder: [], info: [] }, pulse, health = {}, presence = [], upcoming = [], activity = [] } = data;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
            dir="rtl"
        >
            {/* Header */}
            <Section>
                <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-primary font-dash">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <TrendingUp size={22} className="text-on-primary" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-bold text-on-primary leading-tight">لوحة القيادة التنفيذية</h1>
                                <p className="text-sm text-on-primary/70">نظرة شاملة على أداء المنشأة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-on-primary text-xs font-semibold tabular-nums">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                مباشر
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Pulse + KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-3">
                    <Section><BusinessPulse pulse={pulse} /></Section>
                </div>
                <div className="lg:col-span-9">
                    <Section><ExecutiveKPI stats={stats} /></Section>
                </div>
            </div>

            {/* Alerts + Upcoming + Presence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Section><ExecutiveAlerts alerts={alerts} /></Section>
                <Section><UpcomingTimeline sessions={upcoming} /></Section>
                <Section><PresenceGrid users={presence} total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)} /></Section>
            </div>

            {/* System + Activity + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Section><SystemStatus health={health} /></Section>
                <Section><ActivityFeed items={activity} /></Section>
                <Section><InsightsPanel stats={stats} /></Section>
            </div>

            {/* Quick Actions */}
            <Section><QuickActionsGrid /></Section>
        </motion.div>
    );
});
