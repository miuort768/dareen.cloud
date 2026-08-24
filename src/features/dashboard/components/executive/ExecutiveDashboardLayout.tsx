import { memo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useExecutiveDashboard } from '../../hooks/useExecutiveDashboard'
import { BusinessPulse } from './BusinessPulse'
import { ExecutiveKPI } from './ExecutiveKPI'
import { ExecutiveAlerts } from './ExecutiveAlerts'
import { UpcomingTimeline } from './UpcomingTimeline'
import { PresenceGrid } from './PresenceGrid'
import { SystemStatus } from './SystemStatus'
import { ActivityFeed } from './ActivityFeed'
import { InsightsPanel } from './InsightsPanel'
import { QuickActionsGrid } from './QuickActionsGrid'
import { SectionErrorBoundary } from '../../../../shared/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export const ExecutiveDashboard = memo(function ExecutiveDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useExecutiveDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-[120px] rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Skeleton className="h-[200px] rounded-2xl" />
          </div>
          <div className="lg:col-span-9">
            <Skeleton className="h-[200px] rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-[280px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || !data.pulse || !data.stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-soft">
            <AlertCircle size={28} className="text-error" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-main">تعذر تحميل البيانات</h2>
          <p className="mb-4 text-sm text-muted">حدث خطأ أثناء تحميل بيانات لوحة القيادة</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw size={14} />
            إعادة المحاولة
          </Button>
        </div>
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
  } = data

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-primary-deep p-4 font-dash shadow-md shadow-primary/20 md:p-6">
          <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/30">
                <TrendingUp size={22} className="text-on-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold leading-tight text-on-primary md:text-2xl">
                  لوحة القيادة التنفيذية
                </h1>
                <p className="text-on-primary/70 text-sm">نظرة شاملة على أداء المنشأة</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold tabular-nums text-on-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                مباشر
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="تحديث البيانات"
                title="تحديث البيانات"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-on-primary transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Pulse + KPIs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Section>
            <BusinessPulse pulse={pulse} />
          </Section>
        </div>
        <div className="lg:col-span-9">
          <Section>
            <ExecutiveKPI stats={stats} />
          </Section>
        </div>
      </div>

      {/* Alerts + Upcoming + Presence */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Section>
          <ExecutiveAlerts alerts={alerts} />
        </Section>
        <Section>
          <UpcomingTimeline sessions={upcoming} />
        </Section>
        <Section>
          <PresenceGrid
            users={presence}
            total={(stats?.teachersCount || 0) + (stats?.studentsCount || 0)}
          />
        </Section>
      </div>

      {/* System + Activity + Insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Section>
          <SystemStatus health={health} />
        </Section>
        <Section>
          <ActivityFeed items={activity} />
        </Section>
        <Section>
          <InsightsPanel stats={stats} />
        </Section>
      </div>

      {/* Quick Actions */}
      <Section>
        <QuickActionsGrid />
      </Section>
    </motion.div>
  )
})
