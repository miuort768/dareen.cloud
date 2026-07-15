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
import { SectionErrorBoundary } from '../../../../shared/components/ui';

const AnimatedSection = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-fadeIn">{children}</div>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <div className="lg:col-span-1">
                    <SectionErrorBoundary name="BusinessPulse" compact>
                        <AnimatedSection><BusinessPulse pulse={pulse} /></AnimatedSection>
                    </SectionErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                    <SectionErrorBoundary name="ExecutiveKPI" compact>
                        <AnimatedSection><ExecutiveKPI stats={stats} /></AnimatedSection>
                    </SectionErrorBoundary>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <SectionErrorBoundary name="ExecutiveAlerts" compact>
                    <AnimatedSection><ExecutiveAlerts alerts={alerts} /></AnimatedSection>
                </SectionErrorBoundary>
                <SectionErrorBoundary name="UpcomingTimeline" compact>
                    <AnimatedSection><UpcomingTimeline sessions={upcoming} /></AnimatedSection>
                </SectionErrorBoundary>
                <SectionErrorBoundary name="PresenceGrid" compact>
                    <AnimatedSection><PresenceGrid users={presence} total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)} /></AnimatedSection>
                </SectionErrorBoundary>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <SectionErrorBoundary name="SystemStatus" compact>
                    <AnimatedSection><SystemStatus health={health} /></AnimatedSection>
                </SectionErrorBoundary>
                <SectionErrorBoundary name="ActivityFeed" compact>
                    <AnimatedSection><ActivityFeed items={activity} /></AnimatedSection>
                </SectionErrorBoundary>
                <SectionErrorBoundary name="InsightsPanel" compact>
                    <AnimatedSection><InsightsPanel stats={stats} /></AnimatedSection>
                </SectionErrorBoundary>
            </div>

            <SectionErrorBoundary name="QuickActionsGrid" compact>
                <AnimatedSection><QuickActionsGrid /></AnimatedSection>
            </SectionErrorBoundary>
        </div>
    );
});
