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

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.section>
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

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted">تعذر تحميل بيانات لوحة القيادة</p>
            </div>
        );
    }

    const { stats, alerts, pulse, health, presence, upcoming, activity } = data;

    return (
        <div className="space-y-6">
            {/* السطر العلوي: BusinessPulse + ExecutiveKPI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <Section><BusinessPulse pulse={pulse} /></Section>
                </div>
                <div className="lg:col-span-3">
                    <Section><ExecutiveKPI stats={stats} /></Section>
                </div>
            </div>

            {/* السطر الثاني: التنبيهات + الجلسات القادمة + الحضور */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Section><ExecutiveAlerts alerts={alerts} /></Section>
                <Section><UpcomingTimeline sessions={upcoming} /></Section>
                <Section><PresenceGrid users={presence} total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)} /></Section>
            </div>

            {/* السطر الثالث: حالة النظام + النشاطات + التحليلات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Section><SystemStatus health={health} /></Section>
                <Section><ActivityFeed items={activity} /></Section>
                <Section><InsightsPanel stats={stats} /></Section>
            </div>

            {/* السطر الرابع: الإجراءات السريعة */}
            <Section><QuickActionsGrid /></Section>
        </div>
    );
});
