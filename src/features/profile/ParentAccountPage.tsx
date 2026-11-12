import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  KeyRound,
  ShieldCheck,
  BadgeCheck,
  Users,
  BookOpen,
  Activity,
  ArrowLeft,
  CalendarCheck,
  CreditCard,
  BellRing,
  Sparkles,
  Award,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  formatJoinDate,
  useSupportWhatsappNumber,
  TONE_ORDER,
  TILE_TONE,
  QuickNavCard,
} from './shared'
import { ProgressBar } from '../../shared/components/ui'

interface ChildEnrollment {
  subject?: string
  sessionsUsed?: number
  sessionsTotal?: number
}

interface Child {
  id: string
  name: string
  grade?: string
  curriculum?: string
  totalPoints?: number
  createdAt?: string
  enrollments?: ChildEnrollment[]
}

/** سجل النقاط والنشاطات */
interface PointLogEntry {
  amount?: number
  action?: string
  timestamp?: string
  studentId?: string
  studentName?: string
}

const childProgress = (child: Child): number => {
  const ens = child.enrollments || []
  const total = ens.reduce((s, e) => s + (e.sessionsTotal || 0), 0)
  if (total === 0) return 0
  const used = ens.reduce((s, e) => s + (e.sessionsUsed || 0), 0)
  return Math.round((used / total) * 100)
}

export const ParentAccountPage = () => {
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()
  const supportPhone = useSupportWhatsappNumber()

  useEffect(() => {
    document.title = 'الملف الشخصي لولي الأمر | دارين للتعليم والتدريب'
  }, [])

  const { data, isLoading, isError, refetch } = useQuery<{
    children: Child[]
    activity: PointLogEntry[]
  }>({
    queryKey: ['parent-account', currentUser?.id],
    queryFn: async () => {
      const myChildren = await api.get<Child[]>('/parents/my-children')
      const children = Array.isArray(myChildren) ? myChildren : []
      const logs = await Promise.all(
        children.slice(0, 4).map((c) =>
          api
            .get<PointLogEntry[]>(`/student-portal/me/points-log?studentId=${c.id}`)
            .then((rows) =>
              (Array.isArray(rows) ? rows : []).slice(0, 12).map((r) => ({
                ...r,
                studentName: r.studentName || c.name,
              })),
            )
            .catch(() => [] as PointLogEntry[]),
        ),
      )
      return {
        children,
        activity: logs.flat().sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')),
      }
    },
    enabled: !!currentUser,
  })

  const displayName = currentUser?.name || ''
  const children = useMemo(() => data?.children ?? [], [data])
  const activity = useMemo(() => data?.activity ?? [], [data])

  const totalSubjects = children.reduce((s, c) => s + (c.enrollments || []).length, 0)
  const totalPoints = children.reduce((s, c) => s + (c.totalPoints || 0), 0)
  const totalSessions = children.reduce(
    (s, c) => s + (c.enrollments || []).reduce((x, e) => x + (e.sessionsTotal || 0), 0),
    0,
  )
  const totalUsed = children.reduce(
    (s, c) => s + (c.enrollments || []).reduce((x, e) => x + (e.sessionsUsed || 0), 0),
    0,
  )
  const overallProgress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0

  if (isLoading)
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    )

  return (
    <PageShell className="font-parent">
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* ترويسة الحساب الفاخرة للكمبيوتر */}
          <AccountHero
            name={displayName}
            roleLabel="ولي أمر معتمد"
            subtitle="لوحة تحكم ولي الأمر · متابعة المسار التعليمي والمدفوعات لجميع الأبناء"
            chipsBold
            chipsInline
            chipTones={['info', 'success', 'warning']}
            metaChips={[
              `${children.length} أبناء مسجلون`,
              `إجمالي المواد: ${totalSubjects}`,
              `الحصص المنفذة: ${totalUsed} حصة`,
            ]}
            quickStats={[
              { label: 'عدد الأبناء', value: children.length, tone: 'primary', icon: Users },
              { label: 'المواد المشتركة', value: totalSubjects, tone: 'info', icon: BookOpen },
              {
                label: 'نقاط تميز الأبناء',
                value: <span className="font-dash tabular-nums">{totalPoints}</span>,
                tone: 'warning',
                icon: Award,
              },
              {
                label: 'الحصص المنفذة',
                value: (
                  <span className="font-dash tabular-nums">
                    {totalUsed}/{totalSessions}
                  </span>
                ),
                tone: 'success',
                icon: CalendarCheck,
              },
            ]}
          />

          {/* تخطيط الصفحة الرئيسي للكمبيوتر: 8 أعمدة لملفات الأبناء ونشاطاتهم + 4 أعمدة للمعلومات والروابط */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* العمود الرئيسي الأيمن (8 أعمدة) */}
            <div className="space-y-6 lg:col-span-8">
              {/* قسم الأبناء */}
              <SectionCard
                title="أبنائي والطلاب المرتبطون"
                icon={Users}
                description="متابعة الحصص ونسب الإنجاز الدراسي لكل ابن"
                tone="primary"
                delay={0.1}
                action={
                  <button
                    type="button"
                    onClick={() => navigate('/parent-students')}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary ring-1 ring-primary-soft transition-all duration-normal hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  >
                    <span>متابعة التفاصيل والدروس</span>
                    <ArrowLeft size={13} />
                  </button>
                }
              >
                {children.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {children.map((child, idx) => {
                        const tone = TONE_ORDER[idx % TONE_ORDER.length] ?? 'primary'
                        const pct = childProgress(child)
                        const ens = child.enrollments || []
                        return (
                          <div
                            key={child.id}
                            className="border-border/80 bg-surface/60 dark:bg-card/60 group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-elevation-1 transition-all duration-normal hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-elevation-2 dark:border-white/[0.06]"
                          >
                            <div>
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-elevation-1 ring-1 ring-white/10 ${TILE_TONE[tone]}`}
                                  >
                                    {(child.name || '?').charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="truncate text-sm font-black text-main">
                                      {child.name}
                                    </h3>
                                    <p className="mt-0.5 text-micro font-medium text-muted">
                                      {[child.grade, child.curriculum]
                                        .filter(Boolean)
                                        .join(' · ') || 'بيانات الصف غير محددة'}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge />
                              </div>

                              <div className="mt-3.5 space-y-1.5">
                                <div className="flex items-center justify-between text-micro font-medium text-muted">
                                  <span>نسبة إنجاز الحصص</span>
                                  <span className="font-dash font-black tabular-nums text-main">
                                    {pct}%
                                  </span>
                                </div>
                                <ProgressBar value={pct} variant="primary" size="md" />
                              </div>
                            </div>

                            <div className="border-border/70 mt-4 flex items-center justify-between border-t pt-3">
                              <span className="inline-flex items-center gap-1.5 text-micro font-medium text-muted">
                                <BookOpen size={12} />
                                <span>{ens.length} مواد دراسية</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => navigate('/parent-students')}
                                className="inline-flex items-center gap-1 rounded-md text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                              >
                                <span>عرض الدروس</span>
                                <ArrowLeft size={11} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* شريط التقدم العام للأبناء */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-active to-primary-deep p-5 shadow-elevation-2 sm:p-6">
                      <div className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                      <div className="relative mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-on-primary">
                          <Activity size={18} />
                          <h4 className="text-sm font-black">التقدم العام وإنجاز الحصص العائلي</h4>
                        </div>
                        <span className="font-dash text-lg font-black tabular-nums text-on-primary">
                          {overallProgress}%
                        </span>
                      </div>
                      <ProgressBar value={overallProgress} variant="primary" size="lg" />
                      <p className="relative mt-3 text-xs font-medium text-white/90">
                        تم تنفيذ{' '}
                        <span className="font-dash font-black tabular-nums text-on-primary">
                          {totalUsed}
                        </span>{' '}
                        من إجمالي{' '}
                        <span className="font-dash font-black tabular-nums text-on-primary">
                          {totalSessions}
                        </span>{' '}
                        حصة دراسية معتمدة لكافة الأبناء
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface/50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary ring-1 ring-primary-soft">
                      <Users size={24} />
                    </div>
                    <p className="text-sm font-bold text-main">لا يوجد أبناء مرتبطون بالحساب</p>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
                      سيظهر الأبناء هنا تلقائيًا فور ربط حساباتهم الأكاديمية برقم جوالك المسجل
                      بالمنصة.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* آخر النشاطات والإنجازات */}
              {activity.length > 0 && (
                <SectionCard
                  title="آخر نشاطات وإنجازات الأبناء"
                  icon={Sparkles}
                  description="سجل فوري للنقاط المكتسبة والمكافآت التقديرية"
                  delay={0.16}
                  tone="warning"
                >
                  <div className="divide-border/70 border-border/80 bg-surface/50 divide-y rounded-2xl border">
                    {activity.slice(0, 8).map((log, i) => (
                      <div
                        key={`${log.studentId}-${log.timestamp}-${i}`}
                        className="flex items-center justify-between gap-3 p-3.5 transition-colors duration-normal hover:bg-card sm:px-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-main sm:text-sm">
                            {log.action || 'نشاط تعليمي جديد'}
                          </p>
                          <p className="mt-0.5 text-micro font-medium text-muted">
                            {[log.studentName, formatJoinDate(log.timestamp)]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        {(log.amount || 0) !== 0 && (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 font-dash text-xs font-black tabular-nums ring-1 ${
                              (log.amount || 0) > 0
                                ? 'bg-success-soft text-success ring-success-soft'
                                : 'bg-error-soft text-error ring-error-soft'
                            }`}
                          >
                            {(log.amount || 0) > 0 ? '+' : ''}
                            {log.amount} نقطة
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* العمود الجانبي الأيسر (4 أعمدة) */}
            <div className="space-y-6 lg:col-span-4">
              {/* بيانات حساب ولي الأمر */}
              <SectionCard
                title="بيانات حساب ولي الأمر"
                icon={User}
                description="بيانات الهوية والتحقق الخاصة بولي الأمر"
                delay={0.12}
              >
                <div className="flex flex-col gap-2.5">
                  <InfoRow label="الاسم الكامل" value={displayName} icon={User} />
                  <InfoRow
                    label="اسم المستخدم"
                    value={currentUser?.username}
                    icon={KeyRound}
                    mono
                    copyable
                  />
                  <InfoRow label="نوع الحساب" value="ولي أمر" icon={ShieldCheck} />
                  <InfoRow label="حالة التحقق" value={<StatusBadge />} icon={BadgeCheck} />
                  <InfoRow
                    label="عدد الأبناء المسجلين"
                    value={`${children.length} أبناء`}
                    icon={Users}
                  />
                </div>
              </SectionCard>

              {/* روابط سريعة لولي الأمر على الكمبيوتر */}
              <SectionCard
                title="روابط سريعة لولي الأمر"
                icon={Activity}
                description="خدمات المتابعة والاشتراكات"
                delay={0.16}
                tone="info"
              >
                <div className="space-y-2.5">
                  <QuickNavCard
                    title="متابعة الأبناء والدروس"
                    subtitle="استعراض أداء الأبناء والحصص والتقييمات"
                    icon={Users}
                    to="/parent-students"
                    tone="primary"
                  />
                  <QuickNavCard
                    title="سجل المدفوعات والاشتراكات"
                    subtitle="مراجعة الفواتير وعمليات السداد السابقة"
                    icon={CreditCard}
                    to="/parent-payment-history"
                    tone="success"
                  />
                  <QuickNavCard
                    title="إعلانات الإدارة والمنصة"
                    subtitle="الاطلاع على المستجدات والتعاميم"
                    icon={BellRing}
                    to="/parent-announcements"
                    tone="info"
                  />
                </div>
              </SectionCard>

              {/* مركز رعاية أولياء الأمور والدعم الفني */}
              <SectionCard
                title="رعاية أولياء الأمور والأمان"
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
