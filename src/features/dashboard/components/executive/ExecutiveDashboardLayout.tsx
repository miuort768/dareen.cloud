import { memo } from 'react';
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
import { motion } from 'framer-motion';

const stagger = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const AnimatedSection = ({ children, index = 0 }: { children: React.ReactNode; index?: number }) => (
    <motion.div
        custom={index}
        initial="hidden"
        animate="visible"
        variants={stagger}
    >
        {children}
    </motion.div>
);

export const ExecutiveDashboard = memo(function ExecutiveDashboard() {
    const { data, isLoading, error } = useExecutiveDashboard();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-info border-t-transparent" />
            </div>
        );
    }

    if (error || !data || !data.pulse || !data.stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted">تعذر تحميل بيانات لوحة القيادة</p>
            </div>
        );
    }

    const { stats, alerts = { critical: [], warning: [], reminder: [], info: [] }, pulse, health = {}, presence = [], upcoming = [], activity = [] } = data;

    return (
        <div className="space-y-5">
            {/* Row 1: BusinessPulse + ExecutiveKPI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <div className="lg:col-span-1">
                    <AnimatedSection index={0}><BusinessPulse pulse={pulse} /></AnimatedSection>
                </div>
                <div className="lg:col-span-3">
                    <AnimatedSection index={1}><ExecutiveKPI stats={stats} /></AnimatedSection>
                </div>
            </div>

            {/* Row 2: Alerts + Upcoming Sessions + Presence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <AnimatedSection index={2}><ExecutiveAlerts alerts={alerts} /></AnimatedSection>
                <AnimatedSection index={3}><UpcomingTimeline sessions={upcoming} /></AnimatedSection>
                <AnimatedSection index={4}><PresenceGrid users={presence} total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)} /></AnimatedSection>
            </div>

            {/* Row 3: System Status + Activity Feed + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <AnimatedSection index={5}><SystemStatus health={health} /></AnimatedSection>
                <AnimatedSection index={6}><ActivityFeed items={activity} /></AnimatedSection>
                <AnimatedSection index={7}><InsightsPanel stats={stats} /></AnimatedSection>
            </div>

            {/* Row 4: Quick Actions */}
            <AnimatedSection index={8}><QuickActionsGrid /></AnimatedSection>
        </div>
    );
});
