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
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
  }, [])

  // نفس نداء النظام الحالي: بوابة الطالب
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
            metaChips={points > 0 ? [`${points} نقطة`, rank.name] : rank.name ? [rank.name] : []}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <InfoRow label="الاسم" value={displayName} icon={User} />
              <InfoRow label="رقم الطالب" value={student?.studentPhone} icon={Phone} mono />
              <InfoRow label="نوع الحساب" value="طالب" />
              <InfoRow
                label="حالة الحساب"
                value={
                  <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-success-strong">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                    نشط
                  </span>
                }
                icon={ShieldCheck}
              />
            </SectionCard>

            {/* البيانات الدراسية */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard title="البيانات الدراسية" icon={GraduationCap} delay={0.15}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniTile label="الصف" value={student?.grade || '—'} icon={GraduationCap} />
                  <MiniTile label="عدد المواد" value={String(enrollments.length)} icon={BookOpen} />
                  <MiniTile label="النقاط" value={String(points)} icon={Award} />
                  <MiniTile label="الرتبة" value={rank.name} icon={RankIcon} />
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
                      return (
                        <div
                          key={`${en.subject}-${i}`}
                          className="rounded-xl border border-border bg-surface p-3"
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-bold text-main">{en.subject}</p>
                            <span className="shrink-0 text-micro font-bold tabular-nums text-muted">
                              {used}/{total} حصة
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
                    لا توجد مواد مسجلة
                  </p>
                )}
              </SectionCard>

              {/* الجلسات القادمة */}
              <SectionCard title="الجلسات القادمة" icon={CalendarDays} delay={0.22}>
                {upcoming.length > 0 ? (
                  <div className="space-y-2">
                    {upcoming.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
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

          <AccountActions onLogoutStore={logout} />
        </div>
      )}
    </PageShell>
  )
}
