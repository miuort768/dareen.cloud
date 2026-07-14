import { memo, Component, type ReactNode, type ErrorInfo } from 'react';
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
const AnimatedSection = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-fadeIn">{children}</div>
);

interface ErrorFallbackProps { children: ReactNode }
interface ErrorFallbackState { hasError: boolean }

class ErrorFallback extends Component<ErrorFallbackProps, ErrorFallbackState> {
    state: ErrorFallbackState = { hasError: false };

    static getDerivedStateFromError(): ErrorFallbackState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ExecutiveDashboard section error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[200px] rounded-3xl bg-white/50 dark:bg-card/50 border border-error/20">
                    <p className="text-sm text-muted">عذراً، حدث خطأ في هذا القسم</p>
                </div>
            );
        }
        return this.props.children;
    }
}

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
        <ErrorFallback>
            <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    <div className="lg:col-span-1">
                        <AnimatedSection index={0}><BusinessPulse pulse={pulse} /></AnimatedSection>
                    </div>
                    <div className="lg:col-span-3">
                        <AnimatedSection index={1}><ExecutiveKPI stats={stats} /></AnimatedSection>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <AnimatedSection index={2}><ExecutiveAlerts alerts={alerts} /></AnimatedSection>
                    <AnimatedSection index={3}><UpcomingTimeline sessions={upcoming} /></AnimatedSection>
                    <AnimatedSection index={4}><PresenceGrid users={presence} total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)} /></AnimatedSection>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <AnimatedSection index={5}><SystemStatus health={health} /></AnimatedSection>
                    <AnimatedSection index={6}><ActivityFeed items={activity} /></AnimatedSection>
                    <AnimatedSection index={7}><InsightsPanel stats={stats} /></AnimatedSection>
                </div>

                <AnimatedSection index={8}><QuickActionsGrid /></AnimatedSection>
            </div>
        </ErrorFallback>
    );
});
