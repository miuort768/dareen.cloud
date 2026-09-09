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
        <Skeleton className="h-12 rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Skeleton className="h-[220px] rounded-2xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[220px] rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-[76px] rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-[300px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || !data.pulse || !data.stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-card" dir="rtl">
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
              <span className="inline-flex items-center rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-bold text-on-primary">
                {academicYear}
              </span>
            ) : undefined
          }
          chips={[
            { icon: Activity, label: 'بيانات مباشرة' },
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-on-primary outline-none transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            </button>
          }
        />
      </Section>

      {/* Degraded services strip — server reported partial failures */}
      {degraded.length > 0 && (
        <div
          className="flex items-center gap-2 rounded-xl border border-warning-soft bg-warning-soft px-3.5 py-2.5"
          role="status"
        >
          <AlertTriangle size={14} className="shrink-0 text-warning" />
          <p className="text-[11px] font-bold text-main">
            بعض الأقسام تعرض بيانات جزئية بسبب خطأ مؤقت في الخادم: {degradedNames}
          </p>
        </div>
      )}

      {/* Pulse + money today */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Section>
            <BusinessPulse pulse={pulse} />
          </Section>
        </div>
        <div className="lg:col-span-9">
          <Section>
            <TodayMoney stats={stats} />
            <div className="mt-4">
              <p className="mb-2.5 font-dash text-[11px] font-black text-muted">تحتاج انتباهك</p>
              <AttentionTiles stats={stats} />
            </div>
          </Section>
        </div>
      </div>

      {/* Operations */}
      <Section>
        <OpsMetrics stats={stats} />
      </Section>

      {/* Quick actions */}
      <Section>
        <QuickActionsGrid />
      </Section>

      {/* System status strip */}
      <Section>
        <SystemStatusBar health={health} />
      </Section>

      {/* Live context — alerts & upcoming side by side, presence full-width below */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section>
          <ExecutiveAlerts alerts={alerts} />
        </Section>
        <Section>
          <UpcomingTimeline sessions={upcoming} />
        </Section>
      </div>
      <Section>
        <PresenceGrid
          users={presence}
          total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)}
        />
      </Section>

      {/* Context */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Section>
            <ActivityFeed items={activity} />
          </Section>
        </div>
        <div className="lg:col-span-5">
          <Section>
            <InsightsPanel stats={stats} />
          </Section>
        </div>
      </div>
    </motion.div>
  )
})
