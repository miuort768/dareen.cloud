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
  FileSpreadsheet,
  Calendar,
  Sparkles,
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
  useSupportWhatsappNumber,
  QuickNavCard,
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
  const supportPhone = useSupportWhatsappNumber()

  useEffect(() => {
    document.title = 'الملف الشخصي للمعلمة | دارين للتعليم والتدريب'
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
    <PageShell className="font-teacher">
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* ترويسة الحساب الفاخرة للكمبيوتر */}
          <AccountHero
            name={displayName}
            roleLabel="معلمة معتمدة"
            subtitle="لوحة تحكم المعلمة · الحساب والبيانات المهنية والمالية"
            chipsBold
            chipsInline
            chipTones={['info', 'success', 'primary']}
            metaChips={[
              teacher?.subject ? `التخصص: ${teacher.subject}` : 'تخصص غير محدد',
              teacher?.price != null
                ? `سعر الحصة ${teacher.price} ${symbol}`
                : 'سعر الحصة غير محدد',
              `العملة: ${currency}`,
            ]}
            quickStats={[
              {
                label: 'نقاط التميز',
                value: <span className="font-dash tabular-nums">{points}</span>,
                tone: 'warning',
                icon: Award,
              },
              { label: 'الرتبة التعليمية', value: rank.name, tone: 'info', icon: RankIcon },
              {
                label: 'الحصص المنفذة',
                value: statsLoading ? '—' : completedCount,
                tone: 'success',
                icon: CalendarCheck,
              },
              {
                label: 'الأرباح الحالية',
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

          {/* تخطيط الصفحة الرئيسي للكمبيوتر: 8 أعمدة للمحتوى التدريسي والمالي + 4 أعمدة للمعلومات والروابط */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* العمود الرئيسي الأيمن (8 أعمدة) */}
            <div className="space-y-6 lg:col-span-8">
              {/* بطاقة التخصص ومسار الرتبة */}
              <SectionCard
                title="بيانات التدريس ومسار الرتبة"
                icon={BookOpen}
                description="بياناتك التعليمية ومستوى تقدمك ونقاط التميز الأكاديمي"
                tone="primary"
                delay={0.1}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoTile
                    label="المادة الدراسية"
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

                {/* لوحة مسار الرتبة التفاعلية */}
                <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-active to-primary-deep p-5 shadow-elevation-2 sm:p-6">
                  <div className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative mb-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                        <RankIcon size={20} className="text-on-primary" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-micro font-medium text-white/80">
                          الرتبة الأكاديمية الحالية
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
                          متبقي{' '}
                          <span className="font-dash font-black tabular-nums text-on-primary">
                            {pointsNeeded}
                          </span>{' '}
                          نقطة للانتقال إلى «{nextRank.name}»
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-on-primary">
                          <Sparkles size={14} /> لقد وصلتِ إلى أعلى رتبة أكاديمية — مبروك!
                        </span>
                      )}
                    </p>
                    <span className="font-dash font-black tabular-nums text-on-primary">
                      {rankProgress}%
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* قسم طرق استلام المستحقات المالية */}
              <PaymentMethodsSection />
            </div>

            {/* العمود الجانبي الأيسر (4 أعمدة) */}
            <div className="space-y-6 lg:col-span-4">
              {/* المعلومات الأساسية وبيانات الحساب */}
              <SectionCard
                title="المعلومات الشخصية والحساب"
                icon={User}
                description="بيانات الهوية والاتصال المعتمدة"
                delay={0.12}
              >
                <div className="flex flex-col gap-2.5">
                  <InfoRow label="الاسم الكامل" value={displayName} icon={User} />
                  <InfoRow
                    label="رقم الجوال الأساسي"
                    value={teacher?.phone1}
                    icon={Phone}
                    mono
                    copyable
                  />
                  {teacher?.phone2 && (
                    <InfoRow
                      label="رقم إضافي / واتساب"
                      value={teacher.phone2}
                      icon={Phone}
                      mono
                      copyable
                    />
                  )}
                  <InfoRow
                    label="اسم المستخدم"
                    value={teacher?.username}
                    icon={KeyRound}
                    mono
                    copyable
                  />
                  <InfoRow label="نوع الحساب" value="معلمة" icon={ShieldCheck} />
                  <InfoRow label="حالة التفعيل" value={<StatusBadge />} icon={BadgeCheck} />
                  <InfoRow
                    label="تاريخ الانضمام"
                    value={formatJoinDate(teacher?.createdAt) || undefined}
                    icon={CalendarDays}
                  />
                </div>
              </SectionCard>

              {/* الروابط السريعة للكمبيوتر */}
              <SectionCard
                title="روابط سريعة للمعلمة"
                icon={CalendarCheck}
                description="انتقال فوري للخدمات الأكثر استخدامًا"
                delay={0.15}
                tone="info"
              >
                <div className="space-y-2.5">
                  <QuickNavCard
                    title="سجل الفواتير والمستحقات"
                    subtitle="عرض وتتبع الفواتير والمدفوعات السابقة"
                    icon={Wallet}
                    to="/teacher-invoices"
                    tone="primary"
                  />
                  <QuickNavCard
                    title="التقارير الشهرية للطلاب"
                    subtitle="مراجعة واعتماد التقييمات الشهرية"
                    icon={FileSpreadsheet}
                    to="/teacher-reports"
                    tone="success"
                  />
                  <QuickNavCard
                    title="جدول الحصص الأسبوعي"
                    subtitle="استعراض المواعيد والجلسات المجدولة"
                    icon={Calendar}
                    to="/schedule"
                    tone="info"
                  />
                </div>
              </SectionCard>

              {/* مركز الدعم وتسجيل الخروج */}
              <SectionCard
                title="مركز المساعدة والأمان"
                icon={ShieldCheck}
                description="إجراءات الحساب والتواصل المباشر"
                delay={0.18}
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
