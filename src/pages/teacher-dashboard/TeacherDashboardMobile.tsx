import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Bell, Loader2, RefreshCw } from 'lucide-react'
import { EmptyState } from '../../shared/components/ui/EmptyState'
import { DashboardSectionCard as SectionCard } from '../../shared/components/DashboardSectionCard'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
import { TeacherAchievements } from '../../features/dashboard/components/TeacherAchievements'
import { ModernAnnouncements } from '../../features/dashboard/components/ModernAnnouncements'
import { NextSessionHero } from '../../features/dashboard/components/NextSessionHero'
import { QuickActions } from '../../features/dashboard/components/QuickActions'
import { SmartNotifications } from '../../features/dashboard/components/SmartNotifications'
import { GreetingStrip } from './GreetingStrip'
import { WeekStrip } from './WeekStrip'
import type {
  DashboardStats as DashboardStatsType,
  LowBalanceStudent,
  DashboardTask,
} from '../../features/dashboard/types'
import type { Session } from '../../types'
import type { User } from '../../types/auth'

interface TeacherDashboardMobileProps {
  currentUser: User | null
  stats: DashboardStatsType
  rawSessions: Session[]
  tasks: DashboardTask[]
  lowBalanceStudents: LowBalanceStudent[]
  focusStudents: { id: string; name: string; reason: string; type: string }[]
  timeline: {
    id: string
    studentId?: string
    studentName: string
    time: string
    subject: string
    status: string
  }[]
  weekCounts: number[]
  onRefresh: () => void
}

export const TeacherDashboardMobile = ({
  currentUser,
  stats,
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

      <div className="mx-auto max-w-page space-y-5 pt-4 sm:px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/teacher-profile')}
            className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="الملف الشخصي"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-on-primary">
              {firstName.charAt(0)}
            </div>
            <div className="text-start">
              <p className="text-sm font-black text-main">أ. {firstName}</p>
              <p className="text-[11px] font-bold text-muted">لوحة المعلمة</p>
            </div>
          </button>
          <button
            onClick={() => {
              setTimeout(() => {
                document
                  .getElementById('announcements-section-mobile')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 250)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="الإعلانات"
          >
            <Bell size={16} className="text-main" />
            <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-background bg-error" />
          </button>
        </div>

        <GreetingStrip
          name={currentUser?.name || currentUser?.username || 'المعلمة'}
          studentsCount={stats.studentsCount}
          todayCount={stats.todaySessions}
          monthCompleted={stats.monthCompletedSessions}
          points={stats.teacherPoints}
        />

        {/* الإعلانات — بين الهيرو والمحتوى */}
        <div id="announcements-section-mobile" className="scroll-mt-24">
          <ModernAnnouncements />
        </div>

        {nextSession ? (
          <NextSessionHero timeline={timeline} />
        ) : (
          <SectionCard>
            <EmptyState icon={Calendar} title="لا حصص قادمة اليوم" subtitle="يوم هادئ" compact />
          </SectionCard>
        )}
        <SectionCard>
          <TeacherAchievements
            stats={stats}
            lowBalanceStudents={lowBalanceStudents}
            isTeacher={true}
          />
        </SectionCard>
        <QuickActions showQuickLinks={true} />
        <SmartNotifications
          lowBalanceStudents={lowBalanceStudents}
          focusStudents={focusStudents || []}
        />
        <WeekStrip counts={weekCounts} />
      </div>
    </div>
  )
}
