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
  MessagesSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useLogout } from '../../context/AppContext'
import {
  AccountHero,
  SectionCard,
  InfoRow,
  PageShell,
  ProfileSkeleton,
  ErrorBlock,
  AccountActions,
  StatusBadge,
  useSupportWhatsappNumber,
  TONE_ORDER,
  TILE_TONE,
  QuickNavCard,
} from './shared'
import { ProgressBar } from '../../shared/components/ui'
import {
  STUDENT_RANKS,
  getRankByPoints,
  getNextRank,
  RANK_ICON_MAP,
} from '../../shared/utils/ranks'

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
    document.title = 'الملف الشخصي للطالب | دارين للتعليم والتدريب'
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
  const { next: nextRank, pointsNeeded } = getNextRank(points, STUDENT_RANKS)
  const RankIcon = RANK_ICON_MAP[rank.icon] ?? Award
  const totalSessions = enrollments.reduce((s, e) => s + (e.sessionsTotal || 0), 0)
  const totalUsedSessions = enrollments.reduce((s, e) => s + (e.sessionsUsed || 0), 0)

  // الجلسات القادمة — من بيانات الجلسات الفعلية (مجدولة فقط)
  const upcoming = useMemo(
    () =>
      (data?.sessions || [])
        .filter((s) => s.status === 'scheduled')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .slice(0, 4),
    [data],
  )

  const rankProgress = useMemo(() => {
    if (!nextRank) return 100
    return Math.min(
      100,
      Math.round(((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100),
    )
  }, [points, rank, nextRank])

  if (isLoading)
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    )

  return (
    <PageShell className="font-student">
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* ترويسة الحساب الفاخرة للكمبيوتر */}
          <AccountHero
            name={displayName}
            roleLabel="طالب مسجل"
            subtitle="لوحة تحكم الطالب · المتابعة الدراسية ومسار التفوق والنقاط"
            chipsBold
            chipsInline
            chipTones={['info', 'success', 'warning']}
            metaChips={[
              student?.grade ? `الصف: ${student.grade}` : 'الصف غير محدد',
              student?.curriculum ? `المنهج: ${student.curriculum}` : 'المنهج العام',
              `${enrollments.length} مواد مسجلة`,
            ]}
            quickStats={[
              {
                label: 'رصيد نقاطي',
                value: <span className="font-dash tabular-nums">{points}</span>,
                tone: 'warning',
                icon: Award,
              },
              { label: 'الرتبة الحالية', value: rank.name, tone: 'info', icon: RankIcon },
              {
                label: 'المواد الدراسية',
                value: enrollments.length,
                tone: 'success',
                icon: BookOpen,
              },
              {
                label: 'إجمالي الحصص',
                value: (
                  <span className="font-dash tabular-nums">
                    {totalUsedSessions}/{totalSessions}
                  </span>
                ),
                tone: 'primary',
                icon: Activity,
              },
            ]}
          />

          {/* تخطيط الصفحة الرئيسي للكمبيوتر: 8 أعمدة للمواد والجدول + 4 أعمدة للمعلومات والروابط */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* العمود الرئيسي الأيمن (8 أعمدة) */}
            <div className="space-y-6 lg:col-span-8">
              {/* المواد المسجّل بها */}
              <SectionCard
                title="المواد الدراسية المسجل بها"
                icon={BookOpen}
                description={`متابعة التقدم الأكاديمي في ${enrollments.length} مادة`}
                tone="primary"
                delay={0.1}
              >
                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {enrollments.map((en, i) => {
                      const used = en.sessionsUsed || 0
                      const total = en.sessionsTotal || 1
                      const pct = Math.min(100, Math.round((used / total) * 100))
                      const tone = TONE_ORDER[i % TONE_ORDER.length] ?? 'primary'
                      return (
                        <div
                          key={`${en.subject}-${i}`}
                          className="border-border/80 bg-surface/60 dark:bg-card/60 group relative overflow-hidden rounded-2xl border p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-2 dark:border-white/[0.06]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={
                                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105 ' +
                                  TILE_TONE[tone]
                                }
                              >
                                <BookOpen size={18} />
                              </span>
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-black text-main">
                                  {en.subject}
                                </h3>
                                {teacherNameOf(en) && (
                                  <p className="mt-0.5 flex items-center gap-1.5 text-micro font-medium text-muted">
                                    <Users size={12} />
                                    <span>المعلمة: {teacherNameOf(en)}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-micro font-bold tabular-nums text-primary ring-1 ring-primary-soft">
                              {used}/{total} حصة
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1">
                              <ProgressBar value={pct} variant="primary" size="md" />
                            </div>
                            <span className="shrink-0 font-dash text-xs font-black tabular-nums text-primary">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-surface/50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary ring-1 ring-primary-soft">
                      <BookOpen size={24} />
                    </div>
                    <p className="text-sm font-bold text-main">لا توجد مواد مسجلة حاليًا</p>
                    <p className="mt-1 text-xs text-muted">
                      ستظهر موادك الدراسية هنا فور تسجيلك في الدورات والحصص.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* الجلسات القادمة */}
              <SectionCard
                title="الجلسات والحصص القادمة"
                icon={CalendarDays}
                description="مواعيد الحصص المجدولة القادمة مع المعلمات"
                delay={0.15}
                tone="info"
              >
                {upcoming.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {upcoming.map((s) => (
                      <div
                        key={s.id}
                        className="border-border/80 bg-surface/60 dark:bg-card/60 group flex items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-2 dark:border-white/[0.06]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info ring-1 ring-info-soft transition-transform group-hover:scale-105">
                            <Clock size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-main">{s.subject}</p>
                            {s.teacherName && (
                              <p className="mt-0.5 truncate text-micro font-medium text-muted">
                                {s.teacherName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-end">
                          <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-main ring-1 ring-border">
                            {s.time}
                          </span>
                          <p className="mt-1 text-micro font-medium text-muted">{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface/50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-info-soft text-info ring-1 ring-info-soft">
                      <CalendarDays size={24} />
                    </div>
                    <p className="text-sm font-bold text-main">لا توجد حصص قادمة مجدولة حاليًا</p>
                    <p className="mt-1 text-xs text-muted">
                      سيتم إشعارك فور اعتماد وجدولة الحصص الدراسية الجديدة.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* مسار الرتبة ونقاط التميز */}
              <SectionCard
                title="مسار التميز والرتبة الأكاديمية"
                icon={Award}
                description="ارتقِ برتبتك الأكاديمية عبر حضور الحصص والتفاعل المتميز"
                delay={0.18}
                tone="warning"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-active to-primary-deep p-5 shadow-elevation-2 sm:p-6">
                  <div className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative mb-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                        <RankIcon size={20} className="text-on-primary" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-micro font-medium text-white/80">
                          الرتبة الحالية
                        </span>
                        <span className="block truncate text-base font-black text-on-primary sm:text-lg">
                          {rank.name}
                        </span>
                      </div>
                    </div>
                    {nextRank && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-on-primary ring-1 ring-white/25 backdrop-blur-md">
                        <TrendingUp size={13} />
                        الرتبة القادمة: {nextRank.name}
                      </span>
                    )}
                  </div>

                  <ProgressBar value={rankProgress} variant="primary" size="lg" />

                  <div className="relative mt-3 flex items-center justify-between text-xs text-white/90">
                    <p className="font-medium">
                      {nextRank ? (
                        <>
                          تحتاج إلى{' '}
                          <span className="font-dash font-black tabular-nums text-on-primary">
                            {pointsNeeded}
                          </span>{' '}
                          نقطة إضافية للوصول إلى «{nextRank.name}»
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-on-primary">
                          <Sparkles size={14} /> بطل المنصة! لقد بلغت أعلى رتبة طلابية
                        </span>
                      )}
                    </p>
                    <span className="font-dash font-black tabular-nums text-on-primary">
                      {rankProgress}%
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* العمود الجانبي الأيسر (4 أعمدة) */}
            <div className="space-y-6 lg:col-span-4">
              {/* البيانات الأكاديمية والشخصية */}
              <SectionCard
                title="الملف الأكاديمي والاتصال"
                icon={User}
                description="بيانات الهوية والاتصال المعتمدة للطالب"
                delay={0.12}
              >
                <div className="flex flex-col gap-2.5">
                  <InfoRow label="اسم الطالب" value={displayName} icon={User} />
                  <InfoRow
                    label="الصف الدراسي"
                    value={student?.grade || '—'}
                    icon={GraduationCap}
                  />
                  <InfoRow
                    label="المنهج الدراسي"
                    value={student?.curriculum || '—'}
                    icon={BookOpen}
                  />
                  <InfoRow
                    label="رقم هاتف الطالب"
                    value={student?.studentPhone}
                    icon={Phone}
                    mono
                    copyable
                  />
                  {student?.parentPhone && (
                    <InfoRow
                      label="رقم هاتف ولي الأمر"
                      value={student.parentPhone}
                      icon={Users}
                      mono
                      copyable
                    />
                  )}
                  <InfoRow label="نوع الحساب" value="طالب" icon={ShieldCheck} />
                  <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                </div>
              </SectionCard>

              {/* روابط سريعة للطالب على الكمبيوتر */}
              <SectionCard
                title="روابط سريعة للطالب"
                icon={Activity}
                description="خدمات ومتابعات فورية"
                delay={0.16}
                tone="info"
              >
                <div className="space-y-2.5">
                  <QuickNavCard
                    title="لوحة تحكم الطالب"
                    subtitle="استعراض الجدول اليومي وحالة الحصص"
                    icon={Activity}
                    to="/student-dashboard"
                    tone="primary"
                  />
                  <QuickNavCard
                    title="ساحة النقاش والمنتدى"
                    subtitle="شارك الأسئلة وتفاعل مع الزملاء"
                    icon={MessagesSquare}
                    to="/forum"
                    tone="info"
                  />
                </div>
              </SectionCard>

              {/* مركز الدعم وتسجيل الخروج */}
              <SectionCard
                title="رعاية الطلاب والمساعدة"
                icon={ShieldCheck}
                description="تواصل مباشر مع الإدارة الأكاديمية"
                delay={0.2}
                tone="warning"
              >
                <AccountActions onLogoutStore={logout} supportPhone={supportPhone} />
              </SectionCard>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
