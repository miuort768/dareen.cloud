import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Phone,
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  Clock,
  Users,
  Activity,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useLogout } from '../../context/AppContext'
import {
  AccountHero,
  SectionCard,
  InfoRow,
  InfoTile,
  PageShell,
  ProfileSkeleton,
  ErrorBlock,
  AccountActions,
  StatusBadge,
  useSupportWhatsappNumber,
  TONE_ORDER,
} from './shared'
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
  const supportPhone = useSupportWhatsappNumber()

  useEffect(() => {
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
  }, [])

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
  const totalSessions = enrollments.reduce((s, e) => s + (e.sessionsTotal || 0), 0)

  // الجلسات القادمة — من بيانات الجلسات الفعلية (مجدولة فقط)
  const upcoming = useMemo(
    () =>
      (data?.sessions || [])
        .filter((s) => s.status === 'scheduled')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .slice(0, 3),
    [data],
  )

  /* الطالب: لا يوجد endpoint ذاتي لتعديل الاسم في النظام — لا نضيف وظيفة غير مدعومة */

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
            roleLabel="طالب"
            subtitle={
              [student?.grade, student?.curriculum].filter(Boolean).join(' · ') || undefined
            }
            quickStats={[
              {
                label: 'نقاطي',
                value: <span className="font-dash tabular-nums">{points}</span>,
                tone: 'warning',
                icon: Award,
              },
              { label: 'الرتبة', value: rank.name, tone: 'info', icon: RankIcon },
              { label: 'المواد', value: enrollments.length, tone: 'success', icon: BookOpen },
              {
                label: 'عدد الحصص',
                value: <span className="font-dash tabular-nums">{totalSessions}</span>,
                tone: 'primary',
                icon: Activity,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <div className="flex flex-col">
                <div>
                  <InfoRow label="الاسم" value={displayName} icon={User} />
                  <InfoRow label="رقم الطالب" value={student?.studentPhone} icon={Phone} mono />
                  {student?.parentPhone && (
                    <InfoRow label="رقم ولي الأمر" value={student.parentPhone} icon={Users} mono />
                  )}
                </div>
                <div>
                  <InfoRow label="نوع الحساب" value="طالب" icon={ShieldCheck} />
                  <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                </div>
              </div>
            </SectionCard>

            {/* البيانات الدراسية */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="البيانات الدراسية"
                icon={GraduationCap}
                delay={0.15}
                tone="success"
              >
                <div className="grid grid-cols-3 gap-2.5">
                  <InfoTile
                    label="الصف"
                    value={student?.grade || '—'}
                    icon={GraduationCap}
                    tone="info"
                  />
                  <InfoTile
                    label="عدد المواد"
                    value={String(enrollments.length)}
                    icon={BookOpen}
                    tone="primary"
                  />
                  <InfoTile
                    label="النقاط"
                    value={
                      points > 0 ? (
                        <span className="font-dash tabular-nums">{points}</span>
                      ) : (
                        String(points)
                      )
                    }
                    icon={Award}
                    tone="warning"
                  />
                </div>
              </SectionCard>

              {/* المواد المسجل بها */}
              <SectionCard
                title="المواد المسجّل بها"
                icon={BookOpen}
                description={`${enrollments.length} مادة`}
                delay={0.18}
              >
                {enrollments.length > 0 ? (
                  <div className="space-y-2.5">
                    {enrollments.map((en, i) => {
                      const used = en.sessionsUsed || 0
                      const total = en.sessionsTotal || 1
                      const pct = Math.min(100, Math.round((used / total) * 100))
                      const tone = TONE_ORDER[i % TONE_ORDER.length]
                      return (
                        <div
                          key={`${en.subject}-${i}`}
                          className="rounded-xl border border-border bg-surface p-3 dark:border-white/[0.06]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div
                                className={
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ' +
                                  {
                                    primary: 'bg-jade-soft text-jade ring-jade-soft',
                                    success:
                                      'bg-success-soft text-success-strong ring-success-soft',
                                    warning:
                                      'bg-warning-soft text-warning-strong ring-warning-soft',
                                    info: 'bg-info-soft text-info-strong ring-info-soft',
                                  }[tone]
                                }
                              >
                                <BookOpen size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-main">{en.subject}</p>
                                {teacherNameOf(en) && (
                                  <p className="flex items-center gap-1 text-micro text-muted">
                                    <Users size={9} /> {teacherNameOf(en)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-jade-soft px-2 py-0.5 text-micro font-bold tabular-nums text-jade ring-1 ring-jade-soft">
                              {used}/{total} حصة
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar value={pct} variant="attendance" />
                            </div>
                            <span className="shrink-0 font-dash text-micro font-black tabular-nums text-jade">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs font-bold text-muted">
                    لا توجد مواد مسجلة
                  </p>
                )}
              </SectionCard>

              {/* الجلسات القادمة */}
              <SectionCard title="الجلسات القادمة" icon={CalendarDays} delay={0.22} tone="warning">
                {upcoming.length > 0 ? (
                  <div className="space-y-2">
                    {upcoming.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 dark:border-white/[0.06]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info-strong ring-1 ring-info-soft">
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
                    لا توجد جلسات قادمة مجدولة حاليًا
                  </p>
                )}
              </SectionCard>
            </div>
          </div>

          <AccountActions onLogoutStore={logout} supportPhone={supportPhone} />
        </div>
      )}
    </PageShell>
  )
}
