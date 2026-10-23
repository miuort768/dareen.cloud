import { useState, useMemo, useRef } from 'react'
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
  Calendar,
  Users,
  Sparkle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '../../../types'
import type { User } from '../../../types/auth'
import type { DashboardStats, DashboardMonthData, DashboardTask, LowBalanceStudent } from '../types'
import {
  MobileSectionHeader,
  usePullToRefresh,
  OverviewHeader,
  OverviewHero,
  OverviewSearchFilter,
  OverviewCategoryPills,
  OverviewFeaturedCard,
  OverviewPromoBanner,
  type OverviewCategoryItem,
} from '../../../shared/components/mobile'
import { cn } from '@/lib/utils'
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
  const quickActionsRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const firstName = (currentUser?.name || 'المدير').split(' ')[0] || 'المدير'
  const pendingNotificationCount =
    (stats.lowBalanceCount || 0) + tasks.filter((t) => t.status !== 'completed').length

  const categories: OverviewCategoryItem[] = useMemo(
    () => [
      { id: 'all', label: 'الكل', icon: Sparkle },
      { id: 'sessions', label: 'الحصص', icon: Calendar, count: todaySessions.length },
      { id: 'students', label: 'الطلاب', icon: Users, count: stats.studentsCount },
      { id: 'finance', label: 'المالية', icon: Wallet, count: stats.pendingInvoices },
      { id: 'tasks', label: 'المهام', icon: ListTodo, count: tasks.length },
    ],
    [todaySessions.length, stats.studentsCount, stats.pendingInvoices, tasks.length],
  )

  // Filter today's sessions for the featured cards grid
  const filteredSessions = useMemo(() => {
    let list = todaySessions
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q) ||
          s.time?.toLowerCase().includes(q),
      )
    }
    return list
  }, [todaySessions, searchQuery])

  const scrollToQuickActions = () => {
    quickActionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div {...handlers} className="min-h-full pb-8" dir="rtl">
      {/* Pull To Refresh Indicator */}
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

      <div className="mx-auto max-w-page space-y-4 px-2.5 pb-8 pt-1 sm:px-4">
        {/* 1. Petly Style Top Header */}
        <OverviewHeader
          appName="أكاديمية دارين"
          slogan="لوحة الإدارة والتحكم"
          logoIcon={<span className="text-2xl">🏛️</span>}
          notificationCount={pendingNotificationCount}
          onNotificationClick={() => navigate('/announcements')}
          contextLabel="العام الدراسي الحالي 2024 - 2025"
        />

        {/* 2. Petly Style Hero Banner */}
        <OverviewHero
          badge="نظرة إدارية شاملة ⚡"
          title={`أهلاً بك، ${firstName}`}
          subtitle="متابعة دقيقة لكل الحصص والطلاب والتحصيلات المالية اليوم في مكان واحد."
          metric={{
            value: `${stats.attendanceRate}%`,
            label: 'نسبة الحضور',
          }}
          ctaText="إجراءات سريعة"
          onCtaClick={scrollToQuickActions}
          illustration={
            <div className="bg-accent/20 border-accent/30 relative flex h-24 w-24 items-center justify-center rounded-3xl border shadow-elevation-2">
              <span className="text-5xl drop-shadow-md">👑</span>
            </div>
          }
        />

        {/* 3. Search & Filter Bar */}
        <OverviewSearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث عن حصة، طالب، أو مادة..."
        />

        {/* 4. Category Pills Row */}
        <OverviewCategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* 5. Featured Cards ("العناصر المميزة" / حصص اليوم) */}
        {(activeCategory === 'all' || activeCategory === 'sessions') && (
          <section>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-lg text-xs text-main">
                  ⭐
                </span>
                <h3 className="text-sm font-black text-main">حصص اليوم المميزة</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/schedule')}
                className="text-xs font-bold text-accent hover:underline"
              >
                عرض الجدول الكل
              </button>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSessions.slice(0, 4).map((s) => {
                  const isScheduled = s.status === 'scheduled' || !s.status
                  const isCompleted = s.status === 'completed'
                  return (
                    <OverviewFeaturedCard
                      key={s.id}
                      badge={{
                        label: isCompleted ? 'مكتملة' : isScheduled ? 'قادمة' : 'ملغاة',
                        tone: isCompleted ? 'success' : isScheduled ? 'info' : 'warning',
                      }}
                      title={s.studentName || 'طالب'}
                      subtitle={s.subject || 'جلسة تعليمية'}
                      meta={s.time ? `الساعة ${s.time}` : 'اليوم'}
                      highlight={s.time || 'اليوم'}
                      highlightLabel="موعد الحصة"
                      actionLabel="تفاصيل"
                      onClick={() => navigate('/attendance')}
                      visual={
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-2xl">📚</span>
                          <span className="mt-1 line-clamp-1 text-[9px] font-black text-main">
                            {s.studentName}
                          </span>
                        </div>
                      }
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-elevation-1">
                <p className="text-xs font-bold text-muted">لا توجد حصص تطابق البحث حالياً</p>
              </div>
            )}
          </section>
        )}

        {/* 6. Quick Action App Launchers Grid */}
        <section ref={quickActionsRef}>
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
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-3.5 outline-none transition-all duration-normal hover:opacity-90 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.94]',
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

        {/* 7. Petly Style Promo Banner */}
        <OverviewPromoBanner
          title="الإغلاق والتقارير الشهرية"
          subtitle="مراجعة الإيرادات والمصروفات والرواتب بدقة فائقة"
          iconEmoji="📊"
          onClick={() => navigate('/monthly-closing')}
          ariaLabel="الانتقال للإغلاق المالي"
        />

        {/* 8. Preserved Existing Panels */}
        {(activeCategory === 'all' || activeCategory === 'students') && (
          <StatChipsRow stats={stats} />
        )}

        {(activeCategory === 'all' ||
          activeCategory === 'sessions' ||
          activeCategory === 'tasks') && (
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
        )}

        {(activeCategory === 'all' || activeCategory === 'finance') && (
          <section>
            <MobileSectionHeader title="المالية" icon={Wallet} className="mb-2" />
            <MoneyStrip stats={stats} />
            {monthlyData.length > 0 && (
              <div className="mt-2.5">
                <FinanceOverview monthlyData={monthlyData} showHeader={false} compact />
              </div>
            )}
          </section>
        )}

        {activeCategory === 'all' && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
