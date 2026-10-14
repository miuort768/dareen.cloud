import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  KeyRound,
  ShieldCheck,
  BadgeCheck,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  SOLID_FILL,
  ACCENT_BAR,
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

/** سجل النقاط — بالحقول الفعلية من قاعدة البيانات: amount / action / timestamp */
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
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
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
    <PageShell>
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          <AccountHero
            name={displayName}
            roleLabel="ولي أمر"
            chipsBold
            subtitle={children.length > 0 ? `${children.length} أبناء مرتبطون بالحساب` : undefined}
            metaChips={[`المواد: ${totalSubjects}`, `الحصص المنفذة: ${totalUsed}`]}
            quickStats={[
              { label: 'الأبناء', value: children.length, tone: 'primary', icon: Users },
              { label: 'المواد', value: totalSubjects, tone: 'info', icon: BookOpen },
              {
                label: 'إجمالي النقاط',
                value: <span className="font-dash tabular-nums">{totalPoints}</span>,
                tone: 'warning',
                icon: GraduationCap,
              },
              {
                label: 'إجمالي الحصص',
                value: <span className="font-dash tabular-nums">{totalSessions}</span>,
                tone: 'success',
                icon: Activity,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="الاسم" value={displayName} icon={User} />
                <InfoRow label="اسم المستخدم" value={currentUser?.username} icon={KeyRound} mono />
                <InfoRow label="نوع الحساب" value="ولي أمر" icon={ShieldCheck} />
                <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                <InfoRow label="عدد الأبناء" value={String(children.length)} icon={Users} />
              </div>
            </SectionCard>

            <div className="space-y-4 lg:col-span-2">
              {/* أبنائي */}
              <SectionCard
                title="أبنائي"
                icon={Users}
                headerTone="primary"
                description="الطلاب المرتبطون بحسابك"
                descClassName="text-[8px] sm:text-micro"
                delay={0.15}
                action={
                  <button
                    onClick={() => navigate('/parent-students')}
                    className="flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-micro font-bold text-jade-on ring-1 ring-white/25 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    متابعة التفاصيل <ArrowLeft size={11} />
                  </button>
                }
              >
                {children.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {children.map((child, idx) => {
                        const tone = TONE_ORDER[idx % TONE_ORDER.length] ?? 'primary'
                        const pct = childProgress(child)
                        return (
                          <motion.button
                            key={child.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/parent-students')}
                            className={`rounded-2xl border border-s-4 border-border bg-card p-3.5 text-start shadow-soft transition-all duration-slow hover:-translate-y-0.5 hover:bg-hover hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-white/[0.06] dark:bg-surface ${ACCENT_BAR[tone]}`}
                            aria-label={`عرض تفاصيل ${child.name}`}
                          >
                            <div className="mb-2.5 flex items-center gap-2.5">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-elevation-1 ${SOLID_FILL[tone]}`}
                              >
                                {(child.name || '?').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-main">{child.name}</p>
                                <p className="text-micro text-muted">{child.grade || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar value={pct} variant="jade" />
                              </div>
                              <span className="shrink-0 font-dash text-micro font-black tabular-nums text-jade">
                                {pct}%
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-micro font-bold text-muted">
                              <span className="flex items-center gap-1">
                                <BookOpen size={9} /> {(child.enrollments || []).length} مواد
                              </span>
                              <StatusBadge />
                            </div>
                            {(child.totalPoints || 0) > 0 && (
                              <p className="mt-1.5 flex items-center gap-1 text-micro font-bold text-jade">
                                <GraduationCap size={9} /> {child.totalPoints} نقطة
                              </p>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* التقدم العام — شريط زمردي ملوّن يجمع أبناء الحساب */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-jade via-jade-deep to-jade-hover p-4 shadow-elevation-2">
                      <div className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                      <div className="relative mb-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-micro font-bold text-jade-on opacity-90">
                          <Activity size={13} /> التقدم العام للأبناء
                        </span>
                        <span className="font-dash text-sm font-black tabular-nums text-jade-on">
                          {overallProgress}%
                        </span>
                      </div>
                      <ProgressBar value={overallProgress} variant="jade" size="lg" />
                      <p className="relative mt-2 text-micro text-jade-on opacity-80">
                        <span className="font-dash font-black tabular-nums">{totalUsed}</span> من{' '}
                        <span className="font-dash font-black tabular-nums">{totalSessions}</span>{' '}
                        حصة عبر كل الأبناء
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-jade-soft">
                      <Users size={20} className="text-jade" />
                    </div>
                    <p className="text-xs font-bold text-muted">لا يوجد أبناء مرتبطون بالحساب</p>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
                      سيظهر الأبناء هنا بعد ربط حسابهم برقم جوالك في المنصة.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* آخر النشاطات — بيانات حقيقية من سجل النقاط */}
              {activity.length > 0 && (
                <SectionCard title="آخر نشاطات الأبناء" icon={Activity} tone="info" delay={0.2}>
                  <div className="space-y-1">
                    {activity.slice(0, 8).map((log, i) => (
                      <div
                        key={`${log.studentId}-${log.timestamp}-${i}`}
                        className="flex items-center justify-between gap-3 border-b border-divider px-1.5 py-2.5 transition-colors duration-normal last:border-b-0 hover:bg-jade-soft sm:px-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-main">
                            {log.action || 'نشاط'}
                          </p>
                          <p className="text-micro text-muted">
                            {[log.studentName, formatJoinDate(log.timestamp)]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        {(log.amount || 0) !== 0 && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-bold tabular-nums ${
                              (log.amount || 0) > 0
                                ? 'bg-success-soft text-success-strong'
                                : 'bg-error-soft text-error-strong'
                            }`}
                          >
                            {(log.amount || 0) > 0 ? '+' : ''}
                            {log.amount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>

          <AccountActions onLogoutStore={logout} supportPhone={supportPhone} />
        </div>
      )}
    </PageShell>
  )
}
