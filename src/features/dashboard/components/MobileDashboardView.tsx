import { motion } from 'framer-motion'
import {
  Loader2,
  Sparkles,
  Zap,
  CalendarCheck,
  Wallet,
  BellRing,
  Activity,
  UserPlus,
  Receipt,
  UserCheck,
  ListTodo,
  Megaphone,
  FileText,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '../../../types'
import type { User } from '../../../types/auth'
import type { DashboardStats, DashboardMonthData, DashboardTask, LowBalanceStudent } from '../types'
import { MobileSectionHeader, usePullToRefresh } from '../../../shared/components/mobile'
import { cn } from '@/lib/utils'
import { HeroSection } from './HeroSection'
import { StatChipsRow } from './StatChipsRow'
import { TodaysFocus } from './TodaysFocus'
import { MoneyStrip } from './MoneyStrip'
import { FinanceOverview } from './FinanceOverview'
import { NotificationsCenter } from './NotificationsCenter'
import { ActivityTimeline } from './ActivityTimeline'

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

const ACTIONS = [
  { label: 'طالب جديد', icon: UserPlus, path: '/students', tone: 'bg-primary text-on-primary' },
  {
    label: 'تسجيل حضور',
    icon: UserCheck,
    path: '/attendance',
    tone: 'bg-success text-on-success',
  },
  {
    label: 'الفواتير',
    icon: Receipt,
    path: '/student-invoices',
    tone: 'bg-warning text-on-warning',
  },
  { label: 'المهام', icon: ListTodo, path: '/tasks', tone: 'bg-info text-on-info' },
  {
    label: 'إعلان جديد',
    icon: Megaphone,
    path: '/announcements',
    tone: 'bg-accent text-on-accent',
  },
  { label: 'التقارير', icon: FileText, path: '/reports', tone: 'bg-main text-inverse' },
]

/**
 * Native-feel single-scroll home for the admin dashboard on mobile:
 * pull-to-refresh, compact greeting header, snap stat carousel,
 * app-launcher actions, unified focus timeline, wallet strip + chart.
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
  const navigate = useNavigate()
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })

  return (
    <div {...handlers} className="min-h-full pb-6" dir="rtl">
      <motion.div
        animate={{ height: isRefreshing ? 48 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-primary">
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
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div className="space-y-4 px-4 pt-1">
        <HeroSection currentUser={currentUser} stats={stats} />

        <StatChipsRow stats={stats} />

        <section>
          <MobileSectionHeader title="إجراءات سريعة" icon={Zap} className="mb-2.5 px-0.5" />
          <div className="grid grid-cols-3 gap-2">
            {ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  aria-label={action.label}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-3.5 outline-none transition-all duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.94]',
                    action.tone,
                  )}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span className="text-[10px] font-bold leading-none">{action.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <MobileSectionHeader
            title="تركيز اليوم"
            subtitle={`${todaySessions.length} حصة · ${tasks.length} مهمة`}
            icon={CalendarCheck}
            className="mb-2"
          />
          <TodaysFocus
            todaySessions={todaySessions.map((s) => ({
              id: s.id,
              studentName: s.studentName || '',
              time: s.time || '',
              subject: s.subject,
              status: s.status,
            }))}
            tasks={asTasks(tasks)}
            lowBalanceCount={stats.lowBalanceCount}
          />
        </section>

        <section>
          <MobileSectionHeader title="المالية" icon={Wallet} className="mb-2" />
          <MoneyStrip stats={stats} />
          {monthlyData.length > 0 && (
            <div className="mt-2.5">
              <FinanceOverview monthlyData={monthlyData} showHeader={false} compact />
            </div>
          )}
        </section>

        <section>
          <MobileSectionHeader title="التنبيهات" icon={BellRing} className="mb-2" />
          <NotificationsCenter
            tasks={asTasks(tasks)}
            lowBalanceStudents={lowBalanceStudents}
            students={asRecordList(rawStudents)}
            sessions={asRecordList(rawSessions)}
            studentInvoices={asRecordList(rawStudentInvoices)}
          />
        </section>

        <section>
          <MobileSectionHeader title="سجل النشاطات" icon={Activity} className="mb-2" />
          <ActivityTimeline
            sessions={asTimelineSessions(rawSessions)}
            tasks={asTasks(tasks)}
            showHeader={false}
          />
        </section>
      </div>
    </div>
  )
}
