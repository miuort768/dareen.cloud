import { motion } from 'framer-motion'
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks'
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

export const ParentDashboardDesktop = ({
  currentUser,
  adminPhone,
  children: kids,
  eldestChild,
  allPointLogs,
  activeTimers,
  childStats,
  timeline,
  weekly,
  points,
  selectedChildId,
  onSelectChild,
  formatTime,
  childNames,
}: ShellProps) => {
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const subjectCount = kids.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0)
  const selectedChild: Student | undefined = kids.find((c) => c.id === selectedChildId) ?? kids[0]

  return (
    <div className="min-h-screen bg-background transition-colors duration-slow" dir="rtl">
      <main className="mx-auto max-w-page space-y-5 px-2.5 pb-12 pt-5 sm:px-4 md:px-6">
        <motion.div {...fadeUp(0)}>
          <GreetingStrip
            name={currentUser?.name || currentUser?.username || 'ولي الأمر'}
            childCount={kids.length}
            subjectCount={subjectCount}
            todayCount={weekly.todayCount}
            attendanceRate={weekly.attendanceRate}
            eldestChildName={eldestChild?.name}
            eldestChildGrade={eldestChild?.grade}
          />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <LiveNowBanner
            activeTimers={activeTimers}
            childNames={childNames}
            formatTime={formatTime}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            {kids.length > 0 && (
              <>
                <motion.div {...fadeUp(0.1)}>
                  <ChildSwitcher
                    children={kids}
                    selectedId={selectedChildId}
                    onSelect={onSelectChild}
                  />
                </motion.div>
                <motion.div {...fadeUp(0.15)}>
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
            <motion.div {...fadeUp(0.2)}>
              <TodayTimeline items={timeline} />
            </motion.div>
          </div>

          <div className="space-y-5 lg:col-span-4">
            <motion.div {...fadeUp(0.12)}>
              <WeeklyPulse stats={weekly} />
            </motion.div>
            <motion.div {...fadeUp(0.18)}>
              <PointsActivityCard
                points={points}
                rankName={rank.name}
                rankIcon={rank.icon}
                logs={allPointLogs}
              />
            </motion.div>
            <motion.div {...fadeUp(0.24)}>
              <SupportStrip adminPhone={adminPhone} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
