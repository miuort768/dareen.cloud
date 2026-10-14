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
            quickStats={[
              {
                label: 'النقاط',
                value: <span className="font-dash tabular-nums">{points}</span>,
                tone: 'warning',
                icon: Award,
              },
              { label: 'الرتبة', value: rank.name, tone: 'info', icon: RankIcon },
              {
                label: 'الحصص المنفذة',
                value: statsLoading ? '—' : completedCount,
                tone: 'success',
                icon: CalendarCheck,
              },
              {
                label: 'الربح الحالي',
                value: (
                  <span className="font-dash tabular-nums">
                    {statsLoading ? '—' : `${profit} ${symbol}`}
                  </span>
                ),
                tone: 'primary',
                icon: Wallet,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* المعلومات الأساسية */}
            <SectionCard title="المعلومات الأساسية" icon={User} delay={0.1}>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="الاسم" value={displayName} icon={User} />
                <InfoRow label="رقم الجوال" value={teacher?.phone1} icon={Phone} mono />
                {teacher?.phone2 && (
                  <InfoRow label="رقم إضافي" value={teacher.phone2} icon={Phone} mono />
                )}
                <InfoRow label="اسم المستخدم" value={teacher?.username} icon={KeyRound} mono />
                <InfoRow label="نوع الحساب" value="معلمة" icon={ShieldCheck} />
                <InfoRow label="حالة الحساب" value={<StatusBadge />} icon={BadgeCheck} />
                <InfoRow
                  label="تاريخ الانضمام"
                  value={formatJoinDate(teacher?.createdAt) || undefined}
                  icon={CalendarDays}
                />
              </div>
            </SectionCard>

            {/* بيانات التدريس */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="بيانات التدريس"
                icon={BookOpen}
                description="معلوماتك التعليمية في المنصة"
                delay={0.15}
                tone="info"
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
                <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-jade via-jade-deep to-jade-hover p-4 shadow-elevation-2">
                  <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                        <RankIcon size={16} className="text-jade-on" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-micro text-jade-on opacity-80">
                          الرتبة الحالية
                        </span>
                        <span className="block truncate text-sm font-black leading-tight text-jade-on">
                          {rank.name}
                        </span>
                      </span>
                    </span>
                    {nextRank && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1.5 text-micro font-bold text-jade-on ring-1 ring-white/25">
                        <TrendingUp size={11} />
                        التالية: {nextRank.name}
                      </span>
                    )}
                  </div>
                  <ProgressBar value={rankProgress} variant="jade" size="lg" />
                  <p className="relative mt-2 text-micro text-jade-on opacity-80">
                    {nextRank ? (
                      <>
                        تحتاج{' '}
                        <span className="font-dash font-black tabular-nums">{pointsNeeded}</span>{' '}
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
