import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Phone,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Clock,
  Users,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useLogout } from '../../context/AppContext'
import {
  AccountHero,
  SectionCard,
  InfoRow,
  ProfileSkeleton,
  ErrorBlock,
  AccountActions,
} from './shared'
import { PageShell, MiniTile } from './TeacherAccountPage'
import { ProgressBar } from '../../shared/components/ui'
import { STUDENT_RANKS, getRankByPoints, RANK_ICON_MAP } from '../../shared/utils/ranks'

interface Enrollment {
  subject?: string
  teacher?: string | { name?: string }
  sessionsUsed?: number
  sessionsTotal?: number
}

interface StudentData {
  id?: string
  name: string
  grade?: string
  curriculum?: string
  studentPhone?: string
  parentPhone?: string
  totalPoints?: number
  badges?: string
  enrollments?: Enrollment[]
}

interface StudentSession {
  id: string
  subject?: string
  teacherName?: string
  date?: string
  time?: string
  status?: string
}

const teacherNameOf = (en?: Enrollment): string => {
  if (!en?.teacher) return ''
  if (typeof en.teacher === 'string') return en.teacher
  return en.teacher.name || ''
}

export const StudentAccountPage = () => {
  const currentUser = useCurrentUser()
  const logout = useLogout()

  useEffect(() => {
    document.title = 'ط­ط³ط§ط¨ظٹ | ط¯ط§ط±ظٹظ† ط§ظ„ط³ط§ط¨ط¹ط© ظ„ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨'
  }, [])

  // ظ†ظپط³ ظ†ط¯ط§ط، ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط­ط§ظ„ظٹ: ط¨ظˆط§ط¨ط© ط§ظ„ط·ط§ظ„ط¨
  const { data, isLoading, isError, refetch } = useQuery<{
    student: StudentData
    sessions: StudentSession[]
  }>({
    queryKey: ['student-account', currentUser?.id],
    queryFn: async () => {
      const [student, sessions] = await Promise.all([
        api.get<StudentData>('/student-portal/me'),
        api
          .get<StudentSession[]>('/student-portal/me/sessions')
          .catch(() => [] as StudentSession[]),
      ])
      return { student, sessions }
    },
    enabled: !!currentUser,
  })

  const student = data?.student
  const displayName = student?.name || currentUser?.name || ''
  const enrollments = useMemo(() => student?.enrollments || [], [student])
  const points = student?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const RankIcon = RANK_ICON_MAP[rank.icon] ?? Award

  // ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ظ‚ط§ط¯ظ…ط© â€” ظ…ظ† ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ظپط¹ظ„ظٹط© (ظ…ط¬ط¯ظˆظ„ط© ظپظ‚ط·)
  const upcoming = useMemo(
    () =>
      (data?.sessions || [])
        .filter((s) => s.status === 'scheduled')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .slice(0, 3),
    [data],
  )

  /* ط§ظ„ط·ط§ظ„ط¨: ظ„ط§ ظٹظˆط¬ط¯ endpoint ط°ط§طھظٹ ظ„طھط¹ط¯ظٹظ„ ط§ظ„ط§ط³ظ… ظپظٹ ط§ظ„ظ†ط¸ط§ظ… â€” ظ„ط§ ظ†ط¶ظٹظپ ظˆط¸ظٹظپط© ط؛ظٹط± ظ…ط¯ط¹ظˆظ…ط© */

  if (isLoading)
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    )

  return (
    <PageShell>
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          <AccountHero
            name={displayName}
            roleLabel="ط·ط§ظ„ط¨"
            subtitle={
              [student?.grade, student?.curriculum].filter(Boolean).join(' آ· ') || undefined
            }
            metaChips={points > 0 ? [`${points} ظ†ظ‚ط·ط©`, rank.name] : rank ? [rank.name] : []}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط© */}
            <SectionCard title="ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©" icon={User} delay={0.1}>
              <InfoRow label="ط§ظ„ط§ط³ظ…" value={displayName} icon={User} />
              <InfoRow
                label="ط±ظ‚ظ… ط§ظ„ط·ط§ظ„ط¨"
                value={student?.studentPhone}
                icon={Phone}
                mono
              />
              <InfoRow label="ظ†ظˆط¹ ط§ظ„ط­ط³ط§ط¨" value="ط·ط§ظ„ط¨" />
              <InfoRow
                label="ط­ط§ظ„ط© ط§ظ„ط­ط³ط§ط¨"
                value={
                  <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-success-strong">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                    ظ†ط´ط·
                  </span>
                }
                icon={ShieldCheck}
              />
            </SectionCard>

            {/* ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط±ط§ط³ظٹط© */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط±ط§ط³ظٹط©"
                icon={GraduationCap}
                delay={0.15}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniTile label="ط§ظ„طµظپ" value={student?.grade || 'â€”'} icon={GraduationCap} />
                  <MiniTile
                    label="ط¹ط¯ط¯ ط§ظ„ظ…ظˆط§ط¯"
                    value={String(enrollments.length)}
                    icon={BookOpen}
                  />
                  <MiniTile label="ط§ظ„ظ†ظ‚ط§ط·" value={String(points)} icon={Award} />
                  <MiniTile label="ط§ظ„ط±طھط¨ط©" value={rank.name} icon={RankIcon} />
                </div>
              </SectionCard>

              {/* ط§ظ„ظ…ظˆط§ط¯ ط§ظ„ظ…ط³ط¬ظ„ ط¨ظ‡ط§ */}
              <SectionCard
                title="ط§ظ„ظ…ظˆط§ط¯ ط§ظ„ظ…ط³ط¬ظ‘ظ„ ط¨ظ‡ط§"
                icon={BookOpen}
                description={`${enrollments.length} ظ…ط§ط¯ط©`}
                delay={0.18}
              >
                {enrollments.length > 0 ? (
                  <div className="space-y-2.5">
                    {enrollments.map((en, i) => {
                      const used = en.sessionsUsed || 0
                      const total = en.sessionsTotal || 1
                      const pct = Math.min(100, Math.round((used / total) * 100))
                      return (
                        <div
                          key={`${en.subject}-${i}`}
                          className="rounded-xl border border-border bg-surface p-3"
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-bold text-main">{en.subject}</p>
                            <span className="shrink-0 text-micro font-bold tabular-nums text-muted">
                              {used}/{total} ط­طµط©
                            </span>
                          </div>
                          <ProgressBar value={pct} variant="attendance" />
                          {teacherNameOf(en) && (
                            <p className="mt-1 flex items-center gap-1 text-micro text-muted">
                              <Users size={9} /> {teacherNameOf(en)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs font-bold text-muted">
                    ظ„ط§ طھظˆط¬ط¯ ظ…ظˆط§ط¯ ظ…ط³ط¬ظ„ط©
                  </p>
                )}
              </SectionCard>

              {/* ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ظ‚ط§ط¯ظ…ط© */}
              <SectionCard title="ط§ظ„ط¬ظ„ط³ط§طھ ط§ظ„ظ‚ط§ط¯ظ…ط©" icon={CalendarDays} delay={0.22}>
                {upcoming.length > 0 ? (
                  <div className="space-y-2">
                    {upcoming.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-micro font-bold tabular-nums text-primary">
                            <Clock size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-main">{s.subject}</p>
                            {s.teacherName && (
                              <p className="truncate text-micro text-muted">{s.teacherName}</p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-end">
                          <p className="text-micro font-bold tabular-nums text-main">{s.time}</p>
                          <p className="text-micro text-muted">{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs font-bold text-muted">
                    ظ„ط§ طھظˆط¬ط¯ ط¬ظ„ط³ط§طھ ظ‚ط§ط¯ظ…ط© ظ…ط¬ط¯ظˆظ„ط© ط­ط§ظ„ظٹظ‹ط§
                  </p>
                )}
              </SectionCard>
            </div>
          </div>

          <AccountActions onLogoutStore={logout} />
        </div>
      )}
    </PageShell>
  )
}
