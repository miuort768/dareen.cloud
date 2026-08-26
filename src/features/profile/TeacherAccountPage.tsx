import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Phone,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  Wallet,
  KeyRound,
  Award,
  TrendingUp,
} from 'lucide-react'
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
import { PaymentMethodsSection } from './PaymentMethodsSection'
import {
  TEACHER_RANKS,
  getRankByPoints,
  getNextRank,
  RANK_ICON_MAP,
} from '../../shared/utils/ranks'
import { ProgressBar } from '../../shared/components/ui'

interface TeacherData {
  id?: string
  name: string
  phone1?: string
  phone2?: string
  subject?: string
  price?: number
  currency?: string
  points?: number
  username?: string
  createdAt?: string
}

export const TeacherAccountPage = () => {
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const logout = useLogout()
  const [editOpen, setEditOpen] = useState(false)
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
  }, [])

  // نفس نداء النظام الحالي: GET /teachers/me
  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useQuery<TeacherData>({
    queryKey: ['teachers-me'],
    queryFn: async () => {
      const res = await api.get<TeacherData>('/teachers/me')
      return res ?? ({ name: '' } as TeacherData)
    },
    enabled: !!currentUser,
  })

  const displayName = teacher?.name || currentUser?.teacherName || currentUser?.name || ''
  const points = teacher?.points || 0
  const rank = getRankByPoints(points, TEACHER_RANKS)
  const { next: nextRank, pointsNeeded } = getNextRank(points, TEACHER_RANKS)
  const RankIcon = RANK_ICON_MAP[rank.icon] ?? Award

  // نسبة التقدم نحو الرتبة التالية من نظام الرتب المشترك
  const rankProgress = useMemo(() => {
    if (!nextRank) return 100
    return Math.min(
      100,
      Math.round(((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100),
    )
  }, [points, rank, nextRank])

  /* حفظ الاسم — نفس endpoint النظام الحالي */
  const handleSaveName = async (newName: string) => {
    setSavingName(true)
    try {
      await api.put('/teachers/me', { name: newName })
      showNotification('تم تحديث الاسم بنجاح', 'success')
      setEditOpen(false)
      await refetch()
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
            roleLabel="معلمة"
            subtitle={teacher?.subject || undefined}
            metaChips={[teacher?.price != null ? `سعر الحصة ${teacher.price} ج.م` : ''].filter(
              Boolean,
            )}
            onEdit={() => setEditOpen(true)}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <InfoRow label="الاسم" value={displayName} icon={User} />
              <InfoRow label="رقم الجوال" value={teacher?.phone1} icon={Phone} mono />
              {teacher?.phone2 && (
                <InfoRow label="رقم إضافي" value={teacher.phone2} icon={Phone} mono />
              )}
              <InfoRow label="اسم المستخدم" value={teacher?.username} icon={KeyRound} mono />
              <InfoRow label="نوع الحساب" value="معلمة" />
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
              <InfoRow
                label="تاريخ الانضمام"
                value={formatJoinDate(teacher?.createdAt) || undefined}
                icon={CalendarDays}
              />
            </SectionCard>

            {/* بيانات التدريس */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="بيانات التدريس"
                icon={BookOpen}
                description="معلوماتك التعليمية في المنصة"
                delay={0.15}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MiniTile label="المادة" value={teacher?.subject || '—'} icon={BookOpen} />
                  <MiniTile
                    label="سعر الحصة"
                    value={teacher?.price != null ? `${teacher.price} ج.م` : '—'}
                    icon={Wallet}
                  />
                  <MiniTile label="إجمالي النقاط" value={String(points)} icon={Award} />
                </div>

                {/* الرتبة والتقدم — من نظام الرتب الموحد */}
                <div className="mt-4 rounded-xl border border-border bg-surface p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-main">
                      <RankIcon size={14} className="text-primary" />
                      الرتبة الحالية: <span className="text-primary">{rank.name}</span>
                    </span>
                    {nextRank && (
                      <span className="flex items-center gap-1 text-micro font-bold text-muted">
                        <TrendingUp size={11} />
                        التالية: {nextRank.name}
                      </span>
                    )}
                  </div>
                  <ProgressBar value={rankProgress} variant="primary" />
                  <p className="mt-1.5 text-micro text-muted">
                    {nextRank
                      ? `تحتاج ${pointsNeeded} نقطة للوصول إلى «${nextRank.name}»`
                      : 'وصلتِ لأعلى رتبة — أحسنت!'}
                  </p>
                </div>
              </SectionCard>

              {/* طرق الدفع — قسم رئيسي */}
              <PaymentMethodsSection />
            </div>
          </div>

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

/* ---------- غلاف الصفحة الموحد ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-full overflow-x-hidden bg-background pb-28 md:pb-10">
      <div className="mx-auto max-w-page space-y-4 p-3 pt-4 md:p-5 md:pt-6">{children}</div>
    </div>
  )
}

/* ---------- بطاقة معلومة صغيرة ---------- */

export function MiniTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: ReactNode
  icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <Icon size={14} className="mx-auto mb-1 text-primary" />
      <p className="truncate text-xs font-bold text-main">{value}</p>
      <p className="mt-0.5 text-micro text-muted">{label}</p>
    </div>
  )
}
