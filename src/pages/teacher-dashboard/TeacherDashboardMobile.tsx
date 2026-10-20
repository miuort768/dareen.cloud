import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Bell, GraduationCap, Loader2, RefreshCw } from 'lucide-react'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { MobilePageHeader } from '../../shared/components/mobile/MobilePageHeader'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
import { DashboardStats } from '../../features/dashboard/components/DashboardStats'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { TasksAndRequests } from '../../features/dashboard/components/TasksAndRequests'
import { TeacherHero } from './TeacherHero'
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
      className="min-h-full overflow-x-hidden pb-6 transition-colors duration-500" style={{ background: 'var(--neumo-bg)' }}
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
            className="relative flex h-11 w-11 items-center justify-center neu-btn text-main outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.985]"
            aria-label="الإعلانات"
          >
            <Bell size={16} />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-background bg-error" />
          </button>
        }
      />

      <div className="mx-auto max-w-page space-y-5 pt-4 sm:px-4">
        <TeacherHero
          name={currentUser?.name || currentUser?.username || 'المعلمة'}
          stats={stats}
          lowBalanceStudents={lowBalanceStudents}
        />

        <ModernAnnouncements />

        {nextSession ? (
          <NextSessionHero timeline={timeline} />
        ) : (
          <div className="flex min-h-[140px] items-center justify-center neu-card p-5">
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

        <div className="neu-card p-3">
          <SmartNotifications
            lowBalanceStudents={lowBalanceStudents}
            focusStudents={focusStudents || []}
          />
        </div>

        <div className="neu-card p-3">
          <TasksAndRequests tasks={tasks} limit={3} />
        </div>

        <WeekStrip counts={weekCounts} />
      </div>
    </div>
  )
}
