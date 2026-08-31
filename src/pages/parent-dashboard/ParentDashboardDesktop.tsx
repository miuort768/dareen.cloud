import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Wallet, ArrowLeft } from 'lucide-react'
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks'
import { fadeUp } from '../../shared/animations/fadeUp'
import { HeroSection } from './HeroSection'
import { ChildrenCards } from './ChildrenCards'
import { TodaySummary } from './TodaySummary'
import { AcademicPerformance } from './AcademicPerformance'
import { NextSessionBanner } from './NextSessionBanner'
import { HomeworkNotes } from './HomeworkNotes'
import { AchievementsSection } from './AchievementsSection'
import { RecentActivity } from './RecentActivity'
import { ActiveTimersBanner } from './ActiveTimersBanner'
import { SupportBanner } from './SupportBanner'
import type { Student } from '../../types'
import type { PointLogEntry } from './types'

interface ParentDashboardDesktopProps {
  currentUser: { name?: string; username?: string } | null
  adminPhone: string
  children: Student[]
  sessions: Student[]
  allPointLogs: PointLogEntry[]
  activeTimers: Student[]
  todayTasks: {
    studentName: string
    subject: string
    teacher: string
    time: string
    period: string
  }[]
  formatTime: (startedAt: string | null | undefined) => string
  onRefresh: () => void
}

export const ParentDashboardDesktop = ({
  currentUser,
  adminPhone,
  children,
  sessions,
  allPointLogs,
  activeTimers,
  todayTasks,
  formatTime,
}: ParentDashboardDesktopProps) => {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'completed').length
    const totalRecorded = sessions.filter(
      (s) => s.status === 'completed' || s.status === 'cancelled',
    ).length
    const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0
    let sessionsUsed = 0,
      sessionsTotal = 0
    children.forEach((c) => {
      ;(c.enrollments || []).forEach((en: { sessionsUsed: number; sessionsTotal: number }) => {
        sessionsUsed += Number(en.sessionsUsed || 0)
        sessionsTotal += Number(en.sessionsTotal || 0)
      })
    })
    const academicProgress =
      sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0
    return { attendanceRate, academicProgress }
  }, [sessions, children])

  const points = allPointLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)

  return (
    <div
      className="min-h-screen bg-background transition-colors duration-300 dark:bg-background"
      dir="rtl"
    >
      <main className="mx-auto max-w-page space-y-6 px-2.5 pb-12 pt-6 sm:px-4 md:px-6">
        <motion.div {...fadeUp(0)}>
          <HeroSection
            name={currentUser?.name || currentUser?.username || 'ولي الأمر'}
            children={children}
            attendanceRate={stats.attendanceRate}
            academicProgress={stats.academicProgress}
          />
        </motion.div>

        <motion.div {...fadeUp(0.06)}>
          <TodaySummary sessions={sessions} children={children} todayTasks={todayTasks} />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {activeTimers.length > 0 && (
              <motion.div {...fadeUp(0.1)}>
                <ActiveTimersBanner
                  activeTimers={activeTimers}
                  children={children}
                  formatTime={formatTime}
                />
              </motion.div>
            )}
            <motion.div {...fadeUp(0.12)}>
              <NextSessionBanner todayTasks={todayTasks} />
            </motion.div>
            <motion.div {...fadeUp(0.16)}>
              <ChildrenCards children={children} />
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <HomeworkNotes children={children} />
            </motion.div>
            {allPointLogs.length > 0 && (
              <motion.div {...fadeUp(0.24)}>
                <RecentActivity allPointLogs={allPointLogs} />
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
            <motion.div {...fadeUp(0.14)}>
              <AcademicPerformance
                sessions={sessions}
                children={children}
                points={points}
                rank={rank}
              />
            </motion.div>
            <motion.div {...fadeUp(0.18)}>
              <AchievementsSection points={points} rank={rank} />
            </motion.div>
            <motion.div {...fadeUp(0.28)}>
              <SupportBanner adminPhone={adminPhone} />
            </motion.div>
            <motion.div {...fadeUp(0.3)}>
              <button
                onClick={() => navigate('/parent-payment-history')}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-start transition-all duration-200 hover:bg-hover hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99] dark:border-border dark:bg-card dark:hover:bg-hover"
                aria-label="سجل الدفعات"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft dark:bg-success-soft">
                  <Wallet size={18} className="text-success dark:text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-main dark:text-main">سجل الدفعات</p>
                </div>
                <ArrowLeft size={16} className="shrink-0 text-muted dark:text-muted" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
