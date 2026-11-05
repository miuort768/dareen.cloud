import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  BookOpen,
  Calendar,
  Award,
  ListTodo,
  Sparkle,
  GraduationCap,
  Trophy,
  Star,
  Rocket,
  CheckCircle,
  Clock,
  Zap,
  MessageSquare,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileSectionHeader } from '../../shared/components/mobile/MobileSectionHeader'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import {
  usePullToRefresh,
  OverviewHeader,
  OverviewHero,
  OverviewSearchFilter,
  OverviewCategoryPills,
  OverviewFeaturedCard,
  OverviewPromoBanner,
  UniversalStatChipsRow,
  type OverviewCategoryItem,
  type OverviewStatChip,
} from '../../shared/components/mobile'
import { fadeUp } from '../../shared/animations/fadeUp'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  StudentStats,
  TodayTimelineItem,
  NextSessionInfo,
  SubjectProgress,
} from './types'
import { NextSessionRadar } from './NextSessionRadar'
import { TodayTimeline } from './TodayTimeline'
import { SubjectsBoard } from './SubjectsBoard'
import { RankJourney } from './RankJourney'
import { PointsFeed } from './PointsFeed'
import { InvoicesStrip } from './InvoicesStrip'
import { LiveSessionBanner, type StudentActiveSession } from './LiveSessionBanner'
import { KpiStrip } from './KpiStrip'
import { StudentSupportStrip } from './StudentSupportStrip'
import { AnnouncementsBanner } from '../../shared/components/AnnouncementsBanner'
import { SessionCallAlert } from '../../components/ui/SessionCallAlert'
import { useNavigate } from 'react-router-dom'

interface StudentDashboardMobileProps {
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  stats: StudentStats
  todayItems: TodayTimelineItem[]
  nextSession: NextSessionInfo | null
  subjects: SubjectProgress[]
  activeSession: StudentActiveSession | null
  onRefresh: () => void
}

export const StudentDashboardMobile = ({
  studentData,
  sessions,
  pointLogs,
  stats,
  todayItems,
  nextSession,
  subjects,
  activeSession,
  onRefresh,
}: StudentDashboardMobileProps) => {
  const navigate = useNavigate()
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const rankRef = useRef<HTMLDivElement>(null)
  const quickActionsRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)
  const recentSessions = sessions.slice(0, 3)
  const firstName = (studentData?.name || 'الطالب').split(' ')[0] || 'البطل'

  const nextSessionLabel = nextSession
    ? nextSession.isToday
      ? `اليوم ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
      : `${nextSession.day} ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
    : null

  const statChips: OverviewStatChip[] = useMemo(
    () => [
      {
        label: 'نسبة الحضور',
        value: `${stats.attendanceRate}%`,
        icon: CheckCircle,
        onClick: () => setActiveCategory('classes'),
        tone:
          stats.attendanceRate >= 90
            ? 'text-success bg-success-soft'
            : 'text-warning bg-warning-soft',
      },
      {
        label: 'حصص اليوم',
        value: todayItems.length,
        icon: Calendar,
        onClick: () => setActiveCategory('classes'),
        tone: 'text-info bg-info-soft',
      },
      {
        label: 'المواد المسجلة',
        value: subjects.length,
        icon: BookOpen,
        onClick: () => setActiveCategory('subjects'),
        tone: 'text-primary bg-primary-soft',
      },
      {
        label: 'نقاط التميز',
        value: points,
        icon: Award,
        onClick: () => setActiveCategory('points'),
        tone: 'text-accent bg-accent/20',
      },
      {
        label: 'الحصص المنجزة',
        value: stats.sessionsUsed,
        icon: Clock,
        onClick: () => setActiveCategory('classes'),
        tone: 'text-success bg-success-soft',
      },
    ],
    [stats.attendanceRate, stats.sessionsUsed, todayItems.length, subjects.length, points],
  )

  const categories: OverviewCategoryItem[] = useMemo(
    () => [
      { id: 'all', label: 'الكل', icon: Sparkle },
      { id: 'classes', label: 'حصصي', icon: Calendar, count: todayItems.length },
      { id: 'subjects', label: 'المواد', icon: BookOpen, count: subjects.length },
      { id: 'points', label: 'نقاطي', icon: Award, count: points },
      { id: 'tasks', label: 'الواجبات', icon: ListTodo },
    ],
    [todayItems.length, subjects.length, points],
  )

  // Filter subjects for the featured cards
  const filteredSubjects = useMemo(() => {
    let list = subjects
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) => s.subject?.toLowerCase().includes(q) || s.teacher?.toLowerCase().includes(q),
      )
    }
    return list
  }, [subjects, searchQuery])

  const scrollToRank = () => {
    rankRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToQuickActions = () => {
    quickActionsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const STUDENT_ACTIONS = useMemo(
    () => [
      { label: 'جدول الحصص', icon: Calendar, path: '/schedule', tone: 'bg-info text-on-info' },
      {
        label: 'سجل الحضور',
        icon: CheckCircle,
        path: '/attendance',
        tone: 'bg-success text-on-success',
      },
      {
        label: 'الإعلانات',
        icon: BookOpen,
        path: '/announcements',
        tone: 'bg-primary text-on-primary',
      },
      { label: 'رحلة الرتب', icon: Trophy, action: scrollToRank, tone: 'bg-accent text-on-accent' },
      { label: 'الدردشة', icon: MessageSquare, path: '/chat', tone: 'bg-main text-inverse' },
      {
        label: 'الفواتير والاشتراك',
        icon: Receipt,
        path: '/student-invoices',
        tone: 'bg-warning text-on-warning',
      },
    ],
    [],
  )

  return (
    <div
      className="overview-mobile-scope min-h-screen overflow-x-hidden bg-background font-student text-main transition-colors duration-slow"
      dir="rtl"
      {...handlers}
    >
      {/* Pull To Refresh Indicator */}
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-normal text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>أفلت للتحديث</span>
            </>
          ) : (
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div className="mx-auto max-w-page space-y-4 px-2.5 pb-8 pt-2 sm:px-4">
        {/* 1. Petly Style Top Header */}
        <OverviewHeader
          appName="أكاديمية دارين"
          slogan={`مرحباً يا بطل · ${studentData?.grade || 'طالب متميز'}`}
          logoIcon={<GraduationCap size={22} className="text-on-accent" strokeWidth={2.2} />}
          notificationCount={activeSession ? 1 : 0}
          onNotificationClick={() => navigate('/announcements')}
          contextLabel={`مسار التعلم · ${studentData?.grade || 'المرحلة الدراسية'}`}
        />

        {/* 2. Petly Style Hero Banner */}
        <OverviewHero
          badge={`الرتبة: ${rank.name}`}
          badgeIcon={<Trophy size={12} className="text-primary" />}
          title={`أهلاً بك، يا ${firstName}`}
          subtitle={
            nextSessionLabel
              ? `حصتك القادمة: ${nextSessionLabel} · استعد جيداً وكن حاضراً!`
              : 'واصل تفوقك الأكاديمي، أنجز مهامك واجمع المزيد من النقاط اليوم!'
          }
          metric={{
            value: `${points} نقطة`,
            label: 'رصيد التميز',
          }}
          chips={[
            { label: 'الرتبة', value: rank.name },
            { label: 'المستوى', value: studentData?.grade || 'طالب' },
          ]}
          ctaText="إجراءات سريعة"
          onCtaClick={scrollToQuickActions}
          illustration={
            <div className="backdrop-blur-xs relative flex h-24 w-24 items-center justify-center rounded-[24px] border border-primary/25 bg-gradient-to-br from-primary/20 via-primary/10 to-surface p-3 text-primary shadow-elevation-2">
              <div className="absolute inset-1 rounded-[20px] border border-dashed border-primary/30" />
              <Trophy size={42} strokeWidth={2} className="drop-shadow-xs" />
            </div>
          }
        />

        {/* 3. Search & Filter Bar */}
        <OverviewSearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث في موادي، معلمي، أو حصصي..."
        />

        {/* 4. Category Pills Row */}
        <OverviewCategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Stat Chips Row - Admin Dashboard Style */}
        <UniversalStatChipsRow chips={statChips} />

        {/* Active Session & Session Call Alerts */}
        <LiveSessionBanner session={activeSession} />
        <SessionCallAlert />

        {/* 5. Featured Cards ("العناصر المميزة" / موادي التعليمية) */}
        {(activeCategory === 'all' || activeCategory === 'subjects') && (
          <section>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-lg text-accent">
                  <Star size={13} strokeWidth={2.5} className="fill-accent text-accent" />
                </span>
                <h3 className="text-sm font-medium text-main">موادي الدراسية المميزة</h3>
              </div>
              <span className="text-xs font-normal text-accent">{subjects.length} مواد مسجلة</span>
            </div>

            {filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSubjects.slice(0, 4).map((sub, idx) => (
                  <OverviewFeaturedCard
                    key={`${sub.subject}-${idx}`}
                    badge={{
                      label: `${sub.progress}% إنجاز`,
                      tone: sub.progress >= 80 ? 'success' : 'accent',
                    }}
                    title={sub.subject}
                    subtitle={sub.teacher ? `المعلم: ${sub.teacher}` : 'مادة مقررة'}
                    meta={`${sub.sessionsUsed} من ${sub.sessionsTotal} حصة`}
                    highlight={`${sub.progress}%`}
                    highlightLabel="نسبة الحضور والإنجاز"
                    actionLabel="عرض"
                    visual={
                      <div className="flex flex-col items-center justify-center gap-1 text-primary">
                        <BookOpen size={26} strokeWidth={1.8} />
                        <span className="line-clamp-1 text-[9px] font-medium text-main">
                          {sub.subject}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-elevation-1">
                <p className="text-xs font-normal text-muted">لا توجد مواد تطابق البحث</p>
              </div>
            )}
          </section>
        )}

        {/* 6. Quick Action App Launchers Grid - Admin Dashboard Style */}
        <section ref={quickActionsRef}>
          <MobileSectionHeader title="إجراءات سريعة" icon={Zap} className="mb-2.5 px-0.5" />
          <div className="grid grid-cols-3 gap-2">
            {STUDENT_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if (action.action) {
                      action.action()
                    } else if (action.path) {
                      navigate(action.path)
                    }
                  }}
                  aria-label={action.label}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-3.5 outline-none transition-all duration-normal hover:opacity-90 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.94]',
                    action.tone,
                  )}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span className="text-[10px] font-normal leading-none">{action.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 7. Petly Style Promo Banner */}
        <OverviewPromoBanner
          title="تحديات التفوق ورتب المجد"
          subtitle={`تحتاج ${nextRank.pointsNeeded || 0} نقطة إضافية للوصول إلى رتبة ${nextRank.next?.name || 'القمة'}`}
          icon={<Rocket size={24} className="text-accent" strokeWidth={2} />}
          onClick={scrollToRank}
          ariaLabel="الانتقال إلى لوحة الرتب"
        />

        {/* 7. Preserved Existing Panels */}
        {(activeCategory === 'all' || activeCategory === 'classes') && (
          <>
            <motion.div {...fadeUp(0.03)}>
              <KpiStrip stats={stats} />
            </motion.div>

            <motion.div {...fadeUp(0.05)}>
              <NextSessionRadar session={nextSession} />
            </motion.div>

            <motion.div {...fadeUp(0.15)}>
              <TodayTimeline items={todayItems} />
            </motion.div>
          </>
        )}

        {(activeCategory === 'all' || activeCategory === 'points') && (
          <div ref={rankRef}>
            <motion.div {...fadeUp(0.1)}>
              <RankJourney
                points={points}
                rank={rank}
                nextRankName={nextRank.next?.name || null}
                pointsNeeded={nextRank.pointsNeeded}
              />
            </motion.div>

            <motion.div {...fadeUp(0.45)} className="mt-4">
              <PointsFeed pointLogs={pointLogs} recentSessions={recentSessions} />
            </motion.div>
          </div>
        )}

        {activeCategory === 'all' && (
          <>
            {subjects.length > 0 && (
              <motion.div {...fadeUp(0.2)}>
                <SubjectsBoard subjects={subjects} />
              </motion.div>
            )}

            <motion.div {...fadeUp(0.25)}>
              <InvoicesStrip />
            </motion.div>

            <motion.div {...fadeUp(0.3)}>
              <AnnouncementsBanner
                href="/announcements"
                label="الإعلانات"
                description="اطلع على آخر التنبيهات والإعلانات العامة"
                variant="classic"
              />
            </motion.div>

            <motion.div {...fadeUp(0.35)}>
              <StudentSupportStrip />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
