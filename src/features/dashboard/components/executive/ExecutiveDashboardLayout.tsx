import { memo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CalendarDays, RefreshCw, AlertCircle } from 'lucide-react'
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
import { SectionErrorBoundary } from '../../../../shared/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
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

const formatToday = () => {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  } catch {
    return new Date().toLocaleDateString()
  }
}

interface ExecutiveDashboardProps {
  academicYear?: string
}

export const ExecutiveDashboard = memo(function ExecutiveDashboard({
  academicYear,
}: ExecutiveDashboardProps) {
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

  const criticalCount = alerts.critical?.length ?? 0

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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-dash">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} strokeWidth={1.9} className="text-primary" />
            <h1 className="text-sm font-black tracking-tight text-main md:text-base">
              {formatToday()}
            </h1>
            {academicYear && (
              <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                {academicYear}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] font-bold tabular-nums text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              مباشر
            </span>
            {criticalCount > 0 && (
              <span className="rounded-lg border border-error-soft bg-error-soft px-2.5 py-1.5 text-[10px] font-black tabular-nums text-error">
                {criticalCount} تنبيه حرج
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="تحديث البيانات"
              title="تحديث البيانات"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted outline-none transition-all hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </Section>

      {/* Pulse + money today */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Section>
            <BusinessPulse pulse={pulse} />
          </Section>
        </div>
        <div className="lg:col-span-8">
          <Section>
            <TodayMoney stats={stats} />
            <div className="mt-4">
              <p className="mb-2.5 font-dash text-micro font-black uppercase tracking-label text-muted">
                تحتاج انتباهك
              </p>
              <AttentionTiles stats={stats} />
            </div>
          </Section>
        </div>
      </div>

      {/* Operations */}
      <Section>
        <OpsMetrics stats={stats} />
      </Section>

      {/* Live context */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Quick actions */}
      <Section>
        <QuickActionsGrid />
      </Section>

      {/* System footer strip */}
      <Section>
        <SystemStatusBar health={health} />
      </Section>
    </motion.div>
  )
})
