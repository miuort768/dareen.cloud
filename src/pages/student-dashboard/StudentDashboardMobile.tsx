import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  BookMarked,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getRankByPoints,
  getNextRank,
  STUDENT_RANKS,
  RANK_ICON_MAP,
  type Rank,
} from '../../shared/utils/ranks'
import { usePullToRefresh } from '../../shared/components/mobile/usePullToRefresh'
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
import { NextSessionCard } from './NextSessionCard'
import { TodayTasks } from './TodayTasks'
import { ProgressOverview } from './ProgressOverview'
import { normalizeDayName } from '../../features/attendance/utils/slotUtils'
import { InvoicesCard } from './InvoicesCard'
import { AchievementsSection } from './AchievementsSection'
import { RecentActivity } from './RecentActivity'
import type { User } from '../../types/auth'

interface StudentDashboardMobileProps {
  currentUser: User | null
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  onRefresh: () => void
}

const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'تصبح على خير'
  if (h < 12) return 'صباح الخير'
  return 'مساء الخير'
}

const getDateLabel = (): string =>
  new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

const HeroStatCell = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconText,
  valueTitle,
}: {
  icon: typeof Sparkles
  label: string
  value: string
  iconBg: string
  iconText: string
  valueTitle?: string
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5">
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconText}`}
    >
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <p className="truncate text-[10px] font-bold text-muted">{label}</p>
      <p
        title={valueTitle}
        className="truncate text-sm font-black tabular-nums leading-tight text-main"
      >
        {value}
      </p>
    </div>
  </div>
)

const MobileStudentHero = ({
  name,
  grade,
  points,
  rank,
  attendanceRate,
  curriculumProgress,
}: {
  name: string
  grade: string
  points: number
  rank: Rank
  attendanceRate: number
  curriculumProgress: number
}) => {
  const firstName = name.split(' ')[0] || name
  const RankIcon = RANK_ICON_MAP[rank.icon] || Star

  const radius = 24
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (attendanceRate / 100) * circumference
  const tone =
    attendanceRate >= 90 ? 'text-success' : attendanceRate >= 75 ? 'text-warning' : 'text-error'

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-light via-primary-soft to-card p-4 dark:border-primary/30 dark:from-card dark:via-surface dark:to-card">
      <div className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-16 -start-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl dark:bg-primary/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold text-muted">{getDateLabel()}</p>
            <h1 className="truncate text-xl font-black leading-tight text-main">
              {getGreeting()}، {firstName}
            </h1>
            {grade && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                <GraduationCap size={10} /> {grade}
              </span>
            )}
          </div>

          <div className="relative h-[54px] w-[54px] shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth="5"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${tone} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xs font-black tabular-nums leading-none ${tone}`}>
                {attendanceRate}%
              </span>
              <span className="mt-0.5 text-[8px] font-bold text-muted">الحضور</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <HeroStatCell
            icon={Sparkles}
            label="النقاط"
            value={String(points)}
            iconBg="bg-primary-soft"
            iconText="text-primary"
          />
          <HeroStatCell
            icon={RankIcon}
            label="رتبتي"
            value={rank.name}
            valueTitle={rank.name}
            iconBg="bg-warning-soft"
            iconText="text-warning"
          />
          <HeroStatCell
            icon={BookMarked}
            label="المنهج"
            value={`${curriculumProgress}%`}
            iconBg="bg-info-soft"
            iconText="text-info"
          />
        </div>
      </div>
    </div>
  )
}

const SUBJECT_TONES = [
  { bg: 'bg-primary-soft', text: 'text-primary', bar: 'bg-primary' },
  { bg: 'bg-success-soft', text: 'text-success', bar: 'bg-success' },
  { bg: 'bg-info-soft', text: 'text-info', bar: 'bg-info' },
  { bg: 'bg-warning-soft', text: 'text-warning', bar: 'bg-warning' },
  { bg: 'bg-error-soft', text: 'text-error', bar: 'bg-error' },
]

const MobileSubjects = ({ enrollments }: { enrollments: Enrollment[] }) => (
  <div>
    <div className="mb-2.5 flex items-center justify-between px-0.5">
      <h3 className="text-sm font-bold text-main">موادي</h3>
      <Link
        to="/schedule"
        className="rounded-lg text-[11px] font-semibold text-primary transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        عرض الكل
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-2.5">
      {enrollments.map((en, idx) => {
        const used = Number(en.sessionsUsed || 0)
        const total = Number(en.sessionsTotal || 1)
        const progress = Math.min(Math.round((used / total) * 100), 100)
        const tone = SUBJECT_TONES[idx % SUBJECT_TONES.length]!
        return (
          <div key={en.id || idx} className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}
              >
                <BookOpen size={14} />
              </span>
              <div className="min-w-0">
                <h4 className="truncate text-xs font-bold text-main">{en.subject || 'دورة'}</h4>
                {en.teacherName && (
                  <p className="truncate text-[10px] text-muted">{en.teacherName}</p>
                )}
              </div>
            </div>
            <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${tone.bar} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tabular-nums text-muted">
                {used} من {total}
              </span>
              <span className={`text-[10px] font-bold tabular-nums ${tone.text}`}>{progress}%</span>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export const StudentDashboardMobile = ({
  studentData,
  sessions,
  pointLogs,
  onRefresh,
}: StudentDashboardMobileProps) => {
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })

  const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments])
  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)

  const stats: DashboardStats = useMemo(() => {
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
  }, [sessions, enrollments])

  const todayDay = ARABIC_DAYS[new Date().getDay()]

  const nextSession = useMemo<NextSession | null>(() => {
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
  }, [enrollments, todayDay])

  const todayTasks = useMemo<TodayTask[]>(() => {
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
  }, [enrollments, todayDay])

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-surface transition-colors duration-300 dark:bg-background"
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

      <main className="mx-auto max-w-page space-y-4 px-2.5 pb-28 pt-4 sm:px-4">
        <motion.div {...fadeUp(0)}>
          <MobileStudentHero
            name={studentData?.name || 'الطالب'}
            grade={studentData?.grade || ''}
            points={points}
            rank={rank}
            attendanceRate={stats.attendanceRate}
            curriculumProgress={stats.curriculumProgress}
          />
        </motion.div>

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
            <MobileSubjects enrollments={enrollments} />
          </motion.div>
        )}

        <motion.div {...fadeUp(0.18)}>
          <ProgressOverview stats={stats} points={points} rank={rank} nextRank={nextRank} />
        </motion.div>

        <motion.div {...fadeUp(0.22)}>
          <AchievementsSection points={points} rank={rank} nextRank={nextRank} />
        </motion.div>

        {pointLogs.length > 0 && (
          <motion.div {...fadeUp(0.26)}>
            <RecentActivity pointLogs={pointLogs} />
          </motion.div>
        )}

        <motion.div {...fadeUp(0.3)}>
          <InvoicesCard />
        </motion.div>
      </main>
    </div>
  )
}
