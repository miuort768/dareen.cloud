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
  StatusBadge,
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
import { getCurrencySymbol } from '../../config/constants'

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

  /* حفظ الاسم ورقم الجوال — PUT /teachers/me (مسار الخدمة الذاتية) */
  const handleSaveProfile = async (values: { name: string; phone?: string }) => {
    setSavingName(true)
    try {
      await api.put('/teachers/me', {
        name: values.name,
        ...(values.phone !== undefined ? { phone1: values.phone } : {}),
      })
      showNotification('تم تحديث بياناتك بنجاح', 'success')
      setEditOpen(false)
      await refetch()
    } catch (err) {
      console.error('Failed updating profile', err)
      showNotification('تعذر تحديث البيانات، حاول مجددًا', 'error')
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
            metaChips={[
              teacher?.price != null
                ? `سعر الحصة ${teacher.price} ${getCurrencySymbol(teacher.currency || 'EGP')}`
                : '',
            ].filter(Boolean)}
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
              <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={ShieldCheck} />
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
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <MiniTile label="المادة" value={teacher?.subject || '—'} icon={BookOpen} />
                  <MiniTile
                    label="سعر الحصة"
                    value={
                      teacher?.price != null ? (
                        <span className="font-dash tabular-nums">
                          {teacher.price} {getCurrencySymbol(teacher.currency || 'EGP')}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    icon={Wallet}
                  />
                  <MiniTile
                    label="إجمالي النقاط"
                    value={
                      points > 0 ? (
                        <span className="font-dash tabular-nums">{points}</span>
                      ) : (
                        String(points)
                      )
                    }
                    icon={Award}
                  />
                </div>

                {/* الرتبة والتقدم — من نظام الرتب الموحد */}
                <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-elevation-1 dark:border-primary/20 dark:bg-surface">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft ring-1 ring-primary/10">
                        <RankIcon size={16} className="text-primary" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-micro text-muted">الرتبة الحالية</span>
                        <span className="block truncate text-sm font-black leading-tight text-main">
                          {rank.name}
                        </span>
                      </span>
                    </span>
                    {nextRank && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1.5 text-micro font-bold text-primary">
                        <TrendingUp size={11} />
                        التالية: {nextRank.name}
                      </span>
                    )}
                  </div>
                  <ProgressBar value={rankProgress} variant="primary" size="lg" />
                  <p className="mt-2 text-micro text-muted">
                    {nextRank ? (
                      <>
                        تحتاج{' '}
                        <span className="font-dash font-black tabular-nums text-primary">
                          {pointsNeeded}
                        </span>{' '}
                        نقطة للوصول إلى «{nextRank.name}»
                      </>
                    ) : (
                      'وصلتِ لأعلى رتبة — أحسنت!'
                    )}
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
        initialPhone={teacher?.phone1 || ''}
        saving={savingName}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSaveProfile}
      />
    </PageShell>
  )
}

/* ---------- غلاف الصفحة الموحد ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-full overflow-x-hidden bg-background pb-6 md:pb-10">
      <div className="mx-auto max-w-page space-y-4 p-3 pt-2 md:space-y-5 md:p-6 md:pt-4">
        {children}
      </div>
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
    <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-elevation-1 dark:border-primary/20 dark:bg-surface">
      <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft ring-1 ring-primary/10">
        <Icon size={16} className="text-primary" />
      </div>
      <p className="truncate text-sm font-black leading-tight text-main">{value}</p>
      <p className="mt-1 text-micro text-muted">{label}</p>
    </div>
  )
}
