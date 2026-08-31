import { motion } from 'framer-motion'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { fadeUp } from '../../shared/animations/fadeUp'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  TodayTimelineItem,
  NextSessionInfo,
  SubjectProgress,
} from './types'
import { GreetingStrip } from './GreetingStrip'
import { NextSessionRadar } from './NextSessionRadar'
import { TodayTimeline } from './TodayTimeline'
import { SubjectsBoard } from './SubjectsBoard'
import { RankJourney } from './RankJourney'
import { PointsFeed } from './PointsFeed'
import { InvoicesStrip } from './InvoicesStrip'
import { LiveSessionBanner, type StudentActiveSession } from './LiveSessionBanner'

interface ShellProps {
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  todayItems: TodayTimelineItem[]
  nextSession: NextSessionInfo | null
  subjects: SubjectProgress[]
  activeSession: StudentActiveSession | null
}

export const StudentDashboardDesktop = ({
  studentData,
  sessions,
  pointLogs,
  todayItems,
  nextSession,
  subjects,
  activeSession,
}: ShellProps) => {
  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)
  const recentSessions = sessions.slice(0, 3)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300" dir="rtl">
      <main className="mx-auto max-w-page space-y-5 px-2.5 pb-12 pt-5 sm:px-4 md:px-6">
        <motion.div {...fadeUp(0)}>
          <GreetingStrip
            name={studentData?.name || 'الطالب'}
            grade={studentData?.grade || ''}
            points={points}
            rank={rank}
          />
        </motion.div>

        <LiveSessionBanner session={activeSession} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <motion.div {...fadeUp(0.05)}>
              <NextSessionRadar session={nextSession} />
            </motion.div>

            <motion.div {...fadeUp(0.1)}>
              <TodayTimeline items={todayItems} />
            </motion.div>

            {subjects.length > 0 && (
              <motion.div {...fadeUp(0.15)}>
                <SubjectsBoard subjects={subjects} />
              </motion.div>
            )}
          </div>

          <div className="space-y-5 lg:col-span-4">
            <motion.div {...fadeUp(0.08)}>
              <RankJourney
                points={points}
                rank={rank}
                nextRankName={nextRank.next?.name || null}
                pointsNeeded={nextRank.pointsNeeded}
              />
            </motion.div>

            <motion.div {...fadeUp(0.14)}>
              <PointsFeed pointLogs={pointLogs} recentSessions={recentSessions} />
            </motion.div>

            <motion.div {...fadeUp(0.2)}>
              <InvoicesStrip />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
