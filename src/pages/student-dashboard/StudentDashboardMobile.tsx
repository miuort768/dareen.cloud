import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
import { fadeUp } from '../../shared/animations/fadeUp'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  StudentStats,
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

interface StudentDashboardMobileProps {
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  stats: StudentStats
  todayItems: TodayTimelineItem[]
  nextSession: NextSessionInfo | null
  subjects: SubjectProgress[]
  activeSession: StudentActiveSession | null
  onRefresh: () => void
}

export const StudentDashboardMobile = ({
  studentData,
  sessions,
  pointLogs,
  todayItems,
  nextSession,
  subjects,
  activeSession,
  onRefresh,
}: StudentDashboardMobileProps) => {
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)
  const nextRankProgress = nextRank.next
    ? Math.min(
        Math.round(((points - rank.minPoints) / (nextRank.next.minPoints - rank.minPoints)) * 100),
        100,
      )
    : 100
  const recentSessions = sessions.slice(0, 3)

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-background transition-colors duration-slow"
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
            name={studentData?.name || 'الطالب'}
            grade={studentData?.grade || ''}
            points={points}
            rank={rank}
            rankProgress={nextRankProgress}
          />
        </motion.div>

        <LiveSessionBanner session={activeSession} />

        <motion.div {...fadeUp(0.05)}>
          <NextSessionRadar session={nextSession} />
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <RankJourney
            points={points}
            rank={rank}
            nextRankName={nextRank.next?.name || null}
            pointsNeeded={nextRank.pointsNeeded}
          />
        </motion.div>

        <motion.div {...fadeUp(0.15)}>
          <TodayTimeline items={todayItems} />
        </motion.div>

        {subjects.length > 0 && (
          <motion.div {...fadeUp(0.2)}>
            <SubjectsBoard subjects={subjects} />
          </motion.div>
        )}

        <motion.div {...fadeUp(0.25)}>
          <PointsFeed pointLogs={pointLogs} recentSessions={recentSessions} />
        </motion.div>

        <motion.div {...fadeUp(0.3)}>
          <InvoicesStrip />
        </motion.div>
      </main>
    </div>
  )
}
