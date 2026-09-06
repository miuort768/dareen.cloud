import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  KeyRound,
  ShieldCheck,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../lib/api'
import { useCurrentUser, useShowNotification, useLogout } from '../../context/AppContext'
import {
  AccountHero,
  SectionCard,
  InfoRow,
  ProfileSkeleton,
  ErrorBlock,
  AccountActions,
  formatJoinDate,
} from './shared'
import { EditNameModal } from './EditNameModal'
import { PageShell } from './TeacherAccountPage'
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
  const showNotification = useShowNotification()
  const logout = useLogout()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [savingName, setSavingName] = useState(false)
  // الوضع الحالي في النظام: الاسم يُحدَّث محليًا عبر override لأن لا endpoint ذاتي يعمل
  const [nameOverride, setNameOverride] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
  }, [])

  // نفس نداءات النظام الحالي
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

  const displayName = nameOverride || currentUser?.name || ''
  const children = useMemo(() => data?.children ?? [], [data])
  const activity = useMemo(() => data?.activity ?? [], [data])

  /* حفظ الاسم — نفس endpoint النظام الحالي مع تحديث محلي للعرض */
  const handleSaveName = async (values: { name: string; phone?: string }) => {
    setSavingName(true)
    try {
      await api.put('/parents/me', { name: values.name })
      setNameOverride(values.name)
      showNotification('تم تحديث الاسم بنجاح', 'success')
      setEditOpen(false)
    } catch (err) {
      console.error('Failed updating name', err)
      showNotification('تعذر تحديث الاسم، حاول مجددًا', 'error')
    } finally {
      setSavingName(false)
    }
  }

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
            subtitle={children.length > 0 ? `${children.length} أبناء مرتبطين بالحساب` : undefined}
            onEdit={() => setEditOpen(true)}
          />

          {/* المعلومات الأساسية */}
          <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
            <div className="grid gap-x-6 md:grid-cols-2">
              <div>
                <InfoRow label="الاسم" value={displayName} icon={User} />
                <InfoRow label="اسم المستخدم" value={currentUser?.username} icon={KeyRound} mono />
              </div>
              <div>
                <InfoRow label="نوع الحساب" value="ولي أمر" />
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
              </div>
            </div>
          </SectionCard>

          {/* أبنائي */}
          <SectionCard
            title="أبنائي"
            icon={Users}
            description="الطلاب المرتبطون بحسابك"
            delay={0.15}
            action={
              <button
                onClick={() => navigate('/parent-students')}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary-soft px-3 py-1.5 text-micro font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                متابعة التفاصيل <ArrowLeft size={11} />
              </button>
            }
          >
            {children.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child, idx) => (
                  <motion.button
                    key={child.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/parent-students')}
                    className="rounded-xl border border-border bg-surface p-3.5 text-start transition-colors hover:border-primary/40 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    aria-label={`عرض تفاصيل ${child.name}`}
                  >
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                        {(child.name || '?').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-main">{child.name}</p>
                        <p className="text-micro text-muted">{child.grade || '—'}</p>
                      </div>
                    </div>
                    <ProgressBar value={childProgress(child)} variant="attendance" />
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
                  <Users size={20} className="text-primary" />
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
            <SectionCard title="آخر نشاطات الأبناء" icon={Activity} delay={0.2}>
              <div className="space-y-1">
                {activity.slice(0, 8).map((log, i) => (
                  <div
                    key={`${log.studentId}-${log.timestamp}-${i}`}
                    className="border-border/60 flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
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

          <AccountActions onLogoutStore={logout} />
        </div>
      )}

      <EditNameModal
        isOpen={editOpen}
        initialName={displayName}
        saving={savingName}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSaveName}
      />
    </PageShell>
  )
}
