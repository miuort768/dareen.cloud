import { motion } from 'framer-motion'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { ARABIC_DAYS } from '../../shared/constants/days'
import { fadeUp } from '../../shared/animations/fadeUp'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  Enrollment,
  DashboardStats,
  NextSession,
  TodayTask,
} from './types'
import { HeroSection } from './HeroSection'
import { NextSessionCard } from './NextSessionCard'
import { TodayTasks } from './TodayTasks'
import { ProgressOverview } from './ProgressOverview'
import { SubjectCards } from './SubjectCards'
import { ContinueLearning } from './ContinueLearning'
import { InvoicesCard } from './InvoicesCard'
import { AchievementsSection } from './AchievementsSection'
import { RecentActivity } from './RecentActivity'
import { normalizeDayName } from '../../features/attendance/utils/slotUtils'

interface StudentDashboardDesktopProps {
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  onRefresh: () => void
}

export const StudentDashboardDesktop = ({
  studentData,
  sessions,
  pointLogs,
}: StudentDashboardDesktopProps) => {
  const enrollments = studentData?.enrollments || []
  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)

  const stats: DashboardStats = (() => {
    const totalAttendance = sessions.filter((s) => s.status === 'completed').length
    const totalAbsence = sessions.filter((s) => s.status === 'cancelled').length
    const totalRecorded = totalAttendance + totalAbsence
    let sessionsUsed = 0,
      sessionsTotal = 0
    enrollments.forEach((en: Enrollment) => {
      sessionsUsed += Number(en.sessionsUsed || 0)
      sessionsTotal += Number(en.sessionsTotal || 0)
    })
    return {
      sessionsUsed,
      sessionsTotal,
      totalAttendance,
      totalAbsence,
      attendanceRate: totalRecorded > 0 ? Math.round((totalAttendance / totalRecorded) * 100) : 0,
      curriculumProgress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
    }
  })()

  const todayDay = ARABIC_DAYS[new Date().getDay()]

  const nextSession: NextSession | null = (() => {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    let closest: NextSession | null = null
    let minDiff = Infinity
    enrollments.forEach((en: Enrollment) => {
      ;(en.schedule || []).forEach((slot) => {
        if (normalizeDayName(slot.day) === todayDay) {
          const [h, m] = (slot.hour || '0:0').split(':').map(Number)
          const diff = (h || 0) * 60 + (m || 0) - nowMinutes
          if (diff > 0 && diff < minDiff) {
            minDiff = diff
            closest = {
              subject: en.subject || 'دورة',
              teacher: en.teacherName || en.teacher || '',
              time: slot.hour || '',
              hour: slot.hour || '',
              day: slot.day,
              enrollment: en,
            }
          }
        }
      })
    })
    return closest
  })()

  const todayTasks: TodayTask[] = (() => {
    const tasks: TodayTask[] = []
    enrollments.forEach((en: Enrollment) => {
      if (en.nextSessionNotes) {
        tasks.push({
          id: `hw-${en.subject}`,
          subject: en.subject || '',
          teacher: en.teacherName || en.teacher || '',
          time: '',
          type: 'homework',
          completed: false,
        })
      }
      ;(en.schedule || []).forEach((slot) => {
        if (normalizeDayName(slot.day) === todayDay) {
          tasks.push({
            id: `sess-${en.subject}-${slot.hour}`,
            subject: en.subject || '',
            teacher: en.teacherName || en.teacher || '',
            time: slot.hour || '',
            type: 'session',
            completed: false,
          })
        }
      })
    })
    return tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  })()

  return (
    <div
      className="min-h-screen bg-background transition-colors duration-300 dark:bg-background"
      dir="rtl"
    >
      <main className="mx-auto max-w-page space-y-6 px-2.5 pb-12 pt-6 sm:px-4 md:px-6">
        <motion.div {...fadeUp(0)}>
          <HeroSection
            name={studentData?.name || 'الطالب'}
            grade={studentData?.grade || ''}
            curriculum={studentData?.curriculum || ''}
            points={points}
            rank={rank}
            attendanceRate={stats.attendanceRate}
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.div {...fadeUp(0.04)}>
              <NextSessionCard nextSession={nextSession} />
            </motion.div>
            {todayTasks.length > 0 && (
              <motion.div {...fadeUp(0.08)}>
                <TodayTasks tasks={todayTasks} />
              </motion.div>
            )}
            {enrollments.length > 0 && (
              <motion.div {...fadeUp(0.14)}>
                <SubjectCards enrollments={enrollments} />
              </motion.div>
            )}
            <motion.div {...fadeUp(0.18)}>
              <ContinueLearning enrollments={enrollments} />
            </motion.div>
            {pointLogs.length > 0 && (
              <motion.div {...fadeUp(0.22)}>
                <RecentActivity pointLogs={pointLogs} />
              </motion.div>
            )}
          </div>
          <div className="space-y-6">
            <motion.div {...fadeUp(0.06)}>
              <ProgressOverview stats={stats} points={points} rank={rank} nextRank={nextRank} />
            </motion.div>
            <motion.div {...fadeUp(0.12)}>
              <AchievementsSection points={points} rank={rank} nextRank={nextRank} />
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <InvoicesCard />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
