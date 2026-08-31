import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
import { fadeUp } from '../../shared/animations/fadeUp'
import { GreetingStrip } from './GreetingStrip'
import { LiveNowBanner } from './LiveNowBanner'
import { ChildSwitcher } from './ChildSwitcher'
import { ChildPanel } from './ChildPanel'
import { TodayTimeline } from './TodayTimeline'
import { WeeklyPulse } from './WeeklyPulse'
import { PointsActivityCard } from './PointsActivityCard'
import { SupportStrip } from './SupportStrip'
import type { ParentDashboardProps } from './types'
import type { Student } from '../../types'

interface ShellProps extends ParentDashboardProps {
  childNames: Record<string, string>
}

export const ParentDashboardMobile = ({
  currentUser,
  adminPhone,
  children: kids,
  allPointLogs,
  activeTimers,
  childStats,
  timeline,
  weekly,
  points,
  selectedChildId,
  onSelectChild,
  formatTime,
  onRefresh,
  childNames,
}: ShellProps) => {
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const subjectCount = kids.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)
  const selectedChild: Student | undefined = kids.find((c) => c.id === selectedChildId) ?? kids[0]

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-surface transition-colors duration-300"
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

      <main className="mx-auto max-w-page space-y-4 px-2.5 pb-6 pt-4 sm:px-4">
        <motion.div {...fadeUp(0)}>
          <GreetingStrip
            name={currentUser?.name || currentUser?.username || 'ولي الأمر'}
            childCount={kids.length}
            subjectCount={subjectCount}
            todayCount={weekly.todayCount}
            attendanceRate={weekly.attendanceRate}
          />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <LiveNowBanner
            activeTimers={activeTimers}
            childNames={childNames}
            formatTime={formatTime}
          />
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <WeeklyPulse stats={weekly} />
        </motion.div>

        {kids.length > 0 && (
          <>
            <motion.div {...fadeUp(0.15)}>
              <ChildSwitcher
                children={kids}
                selectedId={selectedChildId}
                onSelect={onSelectChild}
              />
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              {selectedChild && (
                <ChildPanel
                  key={selectedChild.id}
                  child={selectedChild}
                  stats={
                    childStats[selectedChild.id] || {
                      attendanceRate: 0,
                      completed: 0,
                      cancelled: 0,
                      sessionsUsed: 0,
                      sessionsTotal: 0,
                      progress: 0,
                      nextSession: null,
                      notes: [],
                    }
                  }
                />
              )}
            </motion.div>
          </>
        )}

        <motion.div {...fadeUp(0.25)}>
          <TodayTimeline items={timeline} />
        </motion.div>

        <motion.div {...fadeUp(0.3)}>
          <PointsActivityCard
            points={points}
            rankName={rank.name}
            rankIcon={rank.icon}
            logs={allPointLogs}
          />
        </motion.div>

        <motion.div {...fadeUp(0.35)}>
          <SupportStrip adminPhone={adminPhone} />
        </motion.div>
      </main>
    </div>
  )
}
