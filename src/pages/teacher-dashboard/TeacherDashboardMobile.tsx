import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Bell, GraduationCap, Loader2, RefreshCw } from 'lucide-react'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { DashboardSectionCard as SectionCard } from '../../shared/components/DashboardSectionCard'
import { MobilePageHeader } from '../../shared/components/mobile/MobilePageHeader'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
import { DashboardStats } from '../../features/dashboard/components/DashboardStats'
import { TeacherAchievements } from '../../features/dashboard/components/TeacherAchievements'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { TasksAndRequests } from '../../features/dashboard/components/TasksAndRequests'
import { GreetingStrip } from './GreetingStrip'
import { WeekStrip } from './WeekStrip'
import type { TeacherDashboardMobileProps } from './types'

export const TeacherDashboardMobile = ({
  currentUser,
  stats,
  tasks,
  lowBalanceStudents,
  focusStudents,
  timeline,
  weekCounts,
  onRefresh,
}: TeacherDashboardMobileProps) => {
  const navigate = useNavigate()
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const nextSession = timeline.find((s) => s.status === 'scheduled' || s.status === 'in-progress')
  const firstName = (currentUser?.name || 'المعلمة').split(' ')[0] || 'المعلمة'

  return (
    <div
      className="min-h-full overflow-x-hidden bg-background pb-6 transition-colors duration-500"
      dir="rtl"
      {...handlers}
    >
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>أفلت للتحديث</span>
            </>
          ) : (
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <MobilePageHeader
        title={`أ. ${firstName}`}
        subtitle="لوحة المعلمة"
        className="mx-auto max-w-page sm:px-4"
        icon={<GraduationCap size={16} />}
        action={
          <button
            onClick={() => navigate('/announcements')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-main shadow-button outline-none transition-all duration-normal hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985]"
            aria-label="الإعلانات"
          >
            <Bell size={16} />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-background bg-error" />
          </button>
        }
      />

      <div className="mx-auto max-w-page space-y-5 pt-4 sm:px-4">
        <GreetingStrip
          name={currentUser?.name || currentUser?.username || 'المعلمة'}
          studentsCount={stats.studentsCount}
          todayCount={stats.todaySessions}
          monthCompleted={stats.monthCompletedSessions}
          monthTotal={stats.monthTotalSessions}
        />

        <ModernAnnouncements />

        {nextSession ? (
          <NextSessionHero timeline={timeline} />
        ) : (
          <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <EmptyState
              icon={Calendar}
              title="لا توجد حصة قادمة اليوم"
              subtitle="يمكنك بدء حصة مباشرة متى شئت"
              compact
            />
          </div>
        )}

        <DashboardStats stats={stats} isTeacher={true} carousel />

        <QuickActions showQuickLinks={true} />

        <SectionCard>
          <SmartNotifications
            lowBalanceStudents={lowBalanceStudents}
            focusStudents={focusStudents || []}
          />
        </SectionCard>

        <SectionCard>
          <TasksAndRequests tasks={tasks} limit={3} />
        </SectionCard>

        <SectionCard>
          <TeacherAchievements
            stats={stats}
            lowBalanceStudents={lowBalanceStudents}
            isTeacher={true}
          />
        </SectionCard>

        <WeekStrip counts={weekCounts} />
      </div>
    </div>
  )
}
