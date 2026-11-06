import { memo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Activity, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react'
import { useExecutiveDashboard } from '../../hooks/useExecutiveDashboard'
import { BusinessPulse } from './BusinessPulse'
import { TodayMoney } from './TodayMoney'
import { AttentionTiles } from './AttentionTiles'
import { OpsMetrics } from './ExecutiveKPI'
import { ExecutiveAlerts } from './ExecutiveAlerts'
import { UpcomingTimeline } from './UpcomingTimeline'
import { PresenceGrid } from './PresenceGrid'
import { SystemStatusBar } from './SystemStatusBar'
import { ActivityFeed } from './ActivityFeed'
import { InsightsPanel } from './InsightsPanel'
import { QuickActionsGrid } from './QuickActionsGrid'
import { SectionErrorBoundary, Skeleton, ErrorState } from '../../../../shared/components/ui'
import { DashboardGreeting } from '../../../../shared/components/DashboardGreeting'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div variants={itemVariants} className={cn('w-full', className)}>
    <SectionErrorBoundary name="exec-section" compact>
      {children}
    </SectionErrorBoundary>
  </motion.div>
)

interface ExecutiveDashboardProps {
  academicYear?: string
  userName?: string
}

export const ExecutiveDashboard = memo(function ExecutiveDashboard({
  academicYear,
  userName,
}: ExecutiveDashboardProps) {
  const firstName = (userName || '').split(' ')[0] || 'المدير'
  const { data, isLoading, error, refetch, isFetching } = useExecutiveDashboard()

  if (isLoading) {
    return (
      <div className="space-y-5" dir="rtl">
        <Skeleton className="h-16 rounded-[28px]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Skeleton className="h-[240px] rounded-[24px]" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[240px] rounded-[24px]" />
          </div>
        </div>
        <Skeleton className="h-[90px] rounded-[24px]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-[300px] rounded-[24px]" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || !data.pulse || !data.stats) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-card" dir="rtl">
        <ErrorState
          icon={AlertCircle}
          title="تعذر تحميل البيانات"
          message="حدث خطأ أثناء تحميل بيانات لوحة القيادة"
          onRetry={() => refetch()}
          retryLabel="إعادة المحاولة"
        />
      </div>
    )
  }

  const {
    stats,
    alerts = { critical: [], warning: [], reminder: [], info: [] },
    pulse,
    health = {
      database: { status: 'unknown', latency: 0 },
      redis: { status: 'unknown', fallbacks: 0 },
      memory: { used: 0, total: 0, usagePercent: 0 },
      cpu: { load: 0, cores: 0 },
      uptime: 0,
      platform: '',
      node: '',
      timestamp: '',
    },
    presence = [],
    upcoming = [],
    activity = [],
    degraded = [],
  } = data

  const criticalCount = alerts.critical?.length ?? 0

  const DEGRADED_LABELS: Record<string, string> = {
    stats: 'المؤشرات المالية',
    alerts: 'التنبيهات',
    pulse: 'مؤشر الأداء',
    health: 'حالة النظام',
    presence: 'الحضور المباشر',
    upcoming: 'الجلسات القادمة',
    activity: 'النشاطات',
  }
  const degradedNames = degraded.map((key) => DEGRADED_LABELS[key] || key).join('، ')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
      dir="rtl"
    >
      {/* Header strip */}
      <Section>
        <DashboardGreeting
          name={firstName}
          fallbackName="المدير"
          nightMessage="ليلة موفقة"
          subtitle={
            academicYear ? (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-on-primary shadow-soft">
                {academicYear}
              </span>
            ) : undefined
          }
          chips={[
            { icon: Activity, label: 'بيانات حية مباشرة' },
            ...(criticalCount > 0
              ? [{ icon: AlertTriangle, label: `${criticalCount} تنبيه حرج` }]
              : []),
          ]}
          end={
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="تحديث البيانات"
              title="تحديث البيانات"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-on-primary shadow-soft outline-none backdrop-blur-md transition-all duration-normal hover:scale-105 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
          }
        />
      </Section>

      {/* Degraded services strip — server reported partial failures */}
      {degraded.length > 0 && (
        <div
          className="flex items-center gap-2 rounded-2xl border border-warning-soft bg-warning-soft px-4 py-3"
          role="status"
        >
          <AlertTriangle size={15} className="shrink-0 text-warning" />
          <p className="text-xs font-normal text-main">
            بعض الأقسام تعرض بيانات جزئية بسبب خطأ مؤقت في الخادم: {degradedNames}
          </p>
        </div>
      )}

      {/* Pulse + money today */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <Section className="h-full">
            <BusinessPulse pulse={pulse} />
          </Section>
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <Section className="flex h-full flex-col justify-between">
            <TodayMoney stats={stats} />
            <div className="mt-4">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-main">حالات تتطلب انتباهك</span>
                <span className="text-[10px] text-muted">إجراءات سريعة فورية</span>
              </div>
              <AttentionTiles stats={stats} />
            </div>
          </Section>
        </div>
      </div>

      {/* Operations metrics */}
      <Section>
        <OpsMetrics stats={stats} />
      </Section>

      {/* Quick actions command grid */}
      <Section>
        <QuickActionsGrid />
      </Section>

      {/* System status telemetry strip */}
      <Section>
        <SystemStatusBar health={health} />
      </Section>

      {/* Live context — alerts & upcoming side by side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section className="h-full">
          <ExecutiveAlerts alerts={alerts} />
        </Section>
        <Section className="h-full">
          <UpcomingTimeline sessions={upcoming} />
        </Section>
      </div>

      {/* Presence grid */}
      <Section>
        <PresenceGrid
          users={presence}
          total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)}
        />
      </Section>

      {/* Context — Activity & Insights */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Section className="h-full">
            <ActivityFeed items={activity} />
          </Section>
        </div>
        <div className="lg:col-span-5">
          <Section className="h-full">
            <InsightsPanel stats={stats} />
          </Section>
        </div>
      </div>
    </motion.div>
  )
})
