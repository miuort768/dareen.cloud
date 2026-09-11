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

const TONE_BG = {
  primary: 'bg-primary-soft text-primary ring-primary/10',
  success: 'bg-success-soft text-success-strong ring-success-soft',
  warning: 'bg-warning-soft text-warning-strong ring-warning-soft',
  info: 'bg-info-soft text-info-strong ring-info-soft',
  error: 'bg-error-soft text-error-strong ring-error-soft',
} as const

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
            accent="success"
            subtitle={children.length > 0 ? `${children.length} أبناء مرتبطون بالحساب` : undefined}
            quickStats={[
              { label: 'الأبناء', value: children.length, tone: 'primary', icon: Users },
              { label: 'المواد', value: totalSubjects, tone: 'info', icon: BookOpen },
              {
                label: 'إجمالي النقاط',
                value: <span className="font-dash tabular-nums">{totalPoints}</span>,
                tone: 'warning',
                icon: GraduationCap,
              },
            ]}
          />

          {/* المعلومات الأساسية */}
          <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
            <div className="grid gap-x-10 md:grid-cols-2">
              <div>
                <InfoRow label="الاسم" value={displayName} icon={User} />
                <InfoRow label="اسم المستخدم" value={currentUser?.username} icon={KeyRound} mono />
              </div>
              <div>
                <InfoRow label="نوع الحساب" value="ولي أمر" icon={ShieldCheck} />
                <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                <InfoRow label="عدد الأبناء" value={String(children.length)} icon={Users} />
              </div>
            </div>
          </SectionCard>

          {/* أبنائي — بدون غلاف خارجي */}
          <section aria-label="أبنائي">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft ring-1 ring-primary/10">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black leading-tight text-main">أبنائي</h2>
                  <p className="mt-0.5 text-micro text-muted">الطلاب المرتبطون بحسابك</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/parent-students')}
                className="flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-micro font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                متابعة التفاصيل <ArrowLeft size={11} />
              </button>
            </div>

            {children.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child, idx) => {
                  const tone = TONE_ORDER[idx % TONE_ORDER.length]
                  const pct = childProgress(child)
                  return (
                    <motion.button
                      key={child.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/parent-students')}
                      className="rounded-xl border border-border bg-card p-3.5 text-start shadow-elevation-1 transition-colors hover:border-primary/40 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-primary/20 dark:bg-surface"
                      aria-label={`عرض تفاصيل ${child.name}`}
                    >
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ${TONE_BG[tone]}`}
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
                          <ProgressBar value={pct} variant="attendance" />
                        </div>
                        <span className="shrink-0 font-dash text-micro font-black tabular-nums text-primary">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-micro font-bold text-muted">
                        <span className="flex items-center gap-1">
                          <BookOpen size={9} /> {(child.enrollments || []).length} مواد
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-success-strong">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-current" /> نشط
                        </span>
                      </div>
                      {(child.totalPoints || 0) > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-micro font-bold text-primary">
                          <GraduationCap size={9} /> {child.totalPoints} نقطة
                        </p>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
                  <Users size={20} className="text-primary" />
                </div>
                <p className="text-xs font-bold text-muted">لا يوجد أبناء مرتبطون بالحساب</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
                  سيظهر الأبناء هنا بعد ربط حسابهم برقم جوالك في المنصة.
                </p>
              </div>
            )}
          </section>

          {/* آخر النشاطات — بيانات حقيقية من سجل النقاط */}
          {activity.length > 0 && (
            <SectionCard title="آخر نشاطات الأبناء" icon={Activity} tone="info" delay={0.2}>
              <div className="space-y-1">
                {activity.slice(0, 8).map((log, i) => (
                  <div
                    key={`${log.studentId}-${log.timestamp}-${i}`}
                    className="flex items-center justify-between gap-3 border-b border-divider py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-main">{log.action || 'نشاط'}</p>
                      <p className="text-micro text-muted">
                        {[log.studentName, formatJoinDate(log.timestamp)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    {(log.amount || 0) !== 0 && (
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-micro font-bold tabular-nums ${
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

          <AccountActions onLogoutStore={logout} supportPhone={supportPhone} />
        </div>
      )}
    </PageShell>
  )
}
