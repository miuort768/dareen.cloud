import { useEffect, useMemo } from 'react'
import {
  User,
  Phone,
  CalendarDays,
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  Wallet,
  KeyRound,
  Award,
  TrendingUp,
  CalendarCheck,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
  formatJoinDate,
} from './shared'
import { PaymentMethodsSection } from './PaymentMethodsSection'
import { useTeacherStats } from './useTeacherStats'
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
  const logout = useLogout()

  useEffect(() => {
    document.title = 'حسابي | دارين السابعة للتعليم والتدريب'
  }, [])

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
  const currency = teacher?.currency || 'EGP'
  const symbol = getCurrencySymbol(currency)

  const {
    completedCount,
    profit,
    loading: statsLoading,
  } = useTeacherStats(currentUser?.id, teacher?.name || currentUser?.teacherName, currency)

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
    <PageShell>
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          <AccountHero
            name={displayName}
            roleLabel="معلمة"
            chipsBold
            metaChips={[
              teacher?.subject || 'مادة غير محددة',
              teacher?.price != null
                ? `سعر الحصة ${teacher.price} ${symbol}`
                : 'سعر الحصة غير محدد',
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <div className="grid gap-x-10 md:grid-cols-2">
                <div>
                  <InfoRow label="الاسم" value={displayName} icon={User} />
                  <InfoRow label="رقم الجوال" value={teacher?.phone1} icon={Phone} mono />
                  {teacher?.phone2 && (
                    <InfoRow label="رقم إضافي" value={teacher.phone2} icon={Phone} mono />
                  )}
                  <InfoRow label="اسم المستخدم" value={teacher?.username} icon={KeyRound} mono />
                </div>
                <div>
                  <InfoRow label="نوع الحساب" value="معلمة" icon={ShieldCheck} />
                  <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                  <InfoRow
                    label="تاريخ الانضمام"
                    value={formatJoinDate(teacher?.createdAt) || undefined}
                    icon={CalendarDays}
                  />
                </div>
              </div>

              {/* مؤشرات الحساب — الحصص والربح الحالي */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-divider pt-4">
                <div className="rounded-xl border border-border bg-card p-4 dark:border-primary/20 dark:bg-surface">
                  <p className="flex items-center gap-1.5 text-lg font-black leading-none text-success-strong">
                    <CalendarCheck size={15} className="shrink-0" />
                    {statsLoading ? (
                      '—'
                    ) : (
                      <span className="font-dash tabular-nums">{completedCount}</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-micro font-bold text-muted">عدد الحصص المنفذة</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 dark:border-primary/20 dark:bg-surface">
                  <p className="flex items-center gap-1.5 text-lg font-black leading-none text-primary">
                    <Wallet size={15} className="shrink-0" />
                    {statsLoading ? (
                      '—'
                    ) : (
                      <span className="font-dash tabular-nums">
                        {profit} {symbol}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-micro font-bold text-muted">الربح الحالي</p>
                </div>
              </div>
            </SectionCard>

            {/* بيانات التدريس */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="بيانات التدريس"
                icon={BookOpen}
                description="معلوماتك التعليمية في المنصة"
                delay={0.15}
              >
                <div className="grid grid-cols-3 gap-2.5">
                  <InfoTile
                    label="المادة"
                    value={teacher?.subject || '—'}
                    icon={BookOpen}
                    tone="primary"
                  />
                  <InfoTile
                    label="سعر الحصة"
                    value={
                      teacher?.price != null ? (
                        <span className="font-dash tabular-nums">
                          {teacher.price} {symbol}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    icon={Wallet}
                    tone="success"
                  />
                  <InfoTile
                    label="إجمالي النقاط"
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
    </PageShell>
  )
}
