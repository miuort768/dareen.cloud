import { motion } from 'framer-motion'
import {
  Loader2,
  Sparkles,
  LayoutDashboard,
  Zap,
  CalendarCheck,
  Wallet,
  BellRing,
  Activity,
  ShieldCheck,
} from 'lucide-react'
import type { Session } from '../../../types'
import type { User } from '../../../types/auth'
import type { DashboardStats, DashboardMonthData, DashboardTask, LowBalanceStudent } from '../types'
import { MobileSectionHeader, usePullToRefresh } from '../../../shared/components/mobile'
import { HeroSection } from './HeroSection'
import { KPICards } from './KPICards'
import { QuickActions } from './QuickActions'
import { TodaysFocus } from './TodaysFocus'
import { FinanceOverview } from './FinanceOverview'
import { NotificationsCenter } from './NotificationsCenter'
import { ActivityTimeline } from './ActivityTimeline'
import { SystemHealth } from './SystemHealth'

type LooseTask = { status?: string }

interface MobileDashboardViewProps {
  currentUser: User | null
  stats: DashboardStats
  todaySessions: Session[]
  monthlyData: DashboardMonthData[]
  lowBalanceStudents: LowBalanceStudent[]
  tasks: LooseTask[]
  rawStudents: unknown[]
  rawSessions: unknown[]
  rawStudentInvoices: unknown[]
  onRefresh: () => Promise<void> | void
}

const asTasks = (tasks: LooseTask[]) => tasks as DashboardTask[]
const asRecordList = (list: unknown[]) => list as Record<string, unknown>[]
const asTimelineSessions = (list: unknown[]) =>
  list as { id: string; studentName: string; date?: string; status?: string }[]

/**
 * Native-feel single-scroll home for the admin dashboard on mobile:
 * pull-to-refresh, greeting hero, then labeled sections.
 */
export const MobileDashboardView = ({
  currentUser,
  stats,
  todaySessions,
  monthlyData,
  lowBalanceStudents,
  tasks,
  rawStudents,
  rawSessions,
  rawStudentInvoices,
  onRefresh,
}: MobileDashboardViewProps) => {
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })

  return (
    <div {...handlers} className="min-h-full pb-6" dir="rtl">
      {/* Pull to refresh */}
      <motion.div
        animate={{ height: isRefreshing ? 48 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-primary dark:text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 45 ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              <span>أفلت للتحديث</span>
            </>
          ) : (
            <span className="text-muted dark:text-dim">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div className="space-y-4 px-3 pt-2">
        <HeroSection currentUser={currentUser} stats={stats} />

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader
            title="المؤشرات الرئيسية"
            subtitle="أبرز أرقام الأكاديمية"
            icon={LayoutDashboard}
            className="mb-3"
          />
          <KPICards stats={stats} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="إجراءات سريعة" icon={Zap} className="mb-3" />
          <QuickActions />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="تركيز اليوم" icon={CalendarCheck} className="mb-3" />
          <TodaysFocus
            todaySessions={todaySessions}
            tasks={asTasks(tasks)}
            lowBalanceCount={stats.lowBalanceCount}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="الملخص المالي" icon={Wallet} className="mb-3" />
          <FinanceOverview monthlyData={monthlyData} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="الإشعارات" icon={BellRing} className="mb-3" />
          <NotificationsCenter
            tasks={asTasks(tasks)}
            lowBalanceStudents={lowBalanceStudents}
            students={asRecordList(rawStudents)}
            sessions={asRecordList(rawSessions)}
            studentInvoices={asRecordList(rawStudentInvoices)}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="النشاطات" icon={Activity} className="mb-3" />
          <ActivityTimeline sessions={asTimelineSessions(rawSessions)} tasks={asTasks(tasks)} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:bg-card">
          <MobileSectionHeader title="سلامة النظام" icon={ShieldCheck} className="mb-3" />
          <SystemHealth stats={stats} />
        </section>
      </div>
    </div>
  )
}
